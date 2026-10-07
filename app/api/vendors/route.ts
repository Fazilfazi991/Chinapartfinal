import { join } from "node:path";
import {
  vendorBackendMode,
  vendorOriginAllowed,
} from "../../../lib/config.mjs";
import { RequestError } from "../../../lib/local-store.mjs";
import { saveVendor, saveLocalVendor } from "../../../lib/vendors.mjs";
import { verifyChallenge } from "../../../lib/production-store.mjs";
import { ingestionClient } from "../../../lib/supabase/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const mode = vendorBackendMode();
  if (mode === "disabled")
    return Response.json(
      { error: "Supplier registration submission is not available yet." },
      { status: 503 },
    );
  if (!vendorOriginAllowed(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new RequestError("Use the supplier registration form.");
    const reader = request.body?.getReader();
    if (!reader) throw new RequestError("Registration details are missing.");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16000) {
        await reader.cancel();
        throw new RequestError("Registration exceeds the field limit.", 413);
      }
      chunks.push(value);
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new RequestError("Invalid registration details.");
    }
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) =>
          !["data", "submissionId", "challenge", "website"].includes(key),
      ) ||
      body.website
    )
      throw new RequestError("Use the supplier registration form.");
    if (mode === "supabase")
      await verifyChallenge(body.challenge, {
        secret: process.env.TURNSTILE_SECRET_KEY!,
        hostname: new URL(process.env.CPS_SITE_ORIGIN!).hostname,
        action: "vendor_registration",
      });
    const result =
      mode === "local"
        ? await saveLocalVendor(
            join(process.cwd(), ".local-data", "vendors"),
            body.data,
            body.submissionId,
          )
        : await saveVendor(ingestionClient(), body.data, body.submissionId);
    return Response.json(result, {
      status: 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof RequestError)
      return Response.json(
        { error: error.message },
        {
          status: error.status,
          headers: { "Cache-Control": "private, no-store" },
        },
      );
    return Response.json(
      {
        error:
          "Registration could not be saved. Your details are retained; please retry.",
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
