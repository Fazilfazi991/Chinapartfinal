"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { staffContext, ingestionClient } from "../../../../lib/supabase/server";
import { workspaceWritesReady } from "../../../../lib/config.mjs";
import { vendorStatuses } from "../../../../lib/vendor-domain.mjs";
export async function reviewVendor(form: FormData) {
  const context = await staffContext();
  if (!context) redirect("/staff/login?error=access");
  const id = form.get("id"),
    status = form.get("status"),
    note = form.get("note"),
    raw = form.get("version"),
    version = Number(raw);
  if (
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(id) ||
    typeof status !== "string" ||
    !vendorStatuses.includes(status) ||
    typeof note !== "string" ||
    note.length > 2000 ||
    typeof raw !== "string" ||
    !/^\d+$/.test(raw) ||
    !Number.isSafeInteger(version)
  )
    redirect("/staff/vendors");
  const h = await headers();
  if (
    !workspaceWritesReady() ||
    h.get("origin") !== process.env.CPS_SITE_ORIGIN ||
    h.get("sec-fetch-site") === "cross-site"
  )
    redirect("/staff/vendors/" + id + "?error=access");
  const { data: visible, error: lookupError } = await context.client
    .from("cps_vendors")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (lookupError || !visible) redirect("/staff/vendors");
  const { error } = await ingestionClient().rpc("cps_review_vendor", {
    p_id: id,
    p_actor: context.user.id,
    p_status: status,
    p_note: note,
    p_expected: version,
  });
  redirect("/staff/vendors/" + id + (error ? "?error=update" : ""));
}
