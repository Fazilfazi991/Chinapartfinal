import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { RequestError } from "./local-store.mjs";
import { vendorFields, validateVendor } from "./vendor-domain.mjs";
export function vendorFingerprint(input) {
  const errors = validateVendor(input);
  if (Object.keys(errors).length)
    throw new RequestError("Please correct the supplier registration fields.");
  const data = Object.fromEntries(
    vendorFields.map((key) => [key, input[key].trim()]),
  );
  return {
    data,
    digest: createHash("sha256").update(JSON.stringify(data)).digest("hex"),
  };
}
const uuid = (value) =>
  typeof value === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export async function saveVendor(client, input, id) {
  if (!uuid(id)) throw new RequestError("Invalid submission reference.");
  const { data, digest } = vendorFingerprint(input);
  const result = await client.rpc("cps_register_vendor", {
    p_id: id,
    p_digest: digest,
    p_data: data,
  });
  if (result.error) {
    if (result.error.message.includes("idempotency_conflict"))
      throw new RequestError(
        "This submission reference belongs to different details. Start a new registration.",
        409,
      );
    if (result.error.message.includes("vendor_rate_limited"))
      throw new RequestError(
        "Registration is busy. Your details are retained; please retry in a minute.",
        429,
      );
    throw new RequestError(
      "Supplier registration could not be saved. Your details are retained; please retry.",
      503,
    );
  }
  if (!/^CPS-VEN-\d{6,}$/.test(result.data?.reference || ""))
    throw new RequestError(
      "Registration could not be confirmed. Please retry.",
      503,
    );
  return { reference: result.data.reference, localTest: false };
}
let queue = Promise.resolve();
export function saveLocalVendor(root, input, id) {
  if (!uuid(id))
    return Promise.reject(new RequestError("Invalid submission reference."));
  const task = queue.then(async () => {
    const { data, digest } = vendorFingerprint(input);
    await mkdir(root, { recursive: true });
    const file = join(root, id + ".json");
    let existing;
    try {
      existing = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (existing) {
      if (existing.digest !== digest)
        throw new RequestError(
          "This submission reference belongs to different details.",
          409,
        );
      return { reference: existing.reference, localTest: true };
    }
    const reference = "CPS-LOCAL-VEN-" + id.replaceAll("-", "").toUpperCase();
    const record = {
      id,
      reference,
      digest,
      data,
      status: "New",
      created_at: new Date().toISOString(),
    };
    const temp = file + ".tmp";
    await writeFile(temp, JSON.stringify(record), { mode: 0o600 });
    await rename(temp, file);
    return { reference, localTest: true };
  });
  queue = task.catch(() => {});
  return task;
}
export async function readVendors(client, page = 0) {
  if (!Number.isInteger(page) || page < 0 || page > 10000)
    throw new RequestError("Invalid supplier inbox page.");
  const result = await client
    .from("cps_vendors")
    .select("id,reference,data,status,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(page * 30, page * 30 + 30);
  if (result.error)
    throw new RequestError("Supplier records are unavailable.", 503);
  return { rows: result.data.slice(0, 30), hasMore: result.data.length > 30 };
}
