import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { staffContext } from "../../../../lib/supabase/server";
import { workspaceWritesReady } from "../../../../lib/config.mjs";
import {
  vendorFields,
  vendorLabels,
  vendorStatuses,
} from "../../../../lib/vendor-domain.mjs";
import { reviewVendor } from "./actions";
export const dynamic = "force-dynamic";
export default async function Vendor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) notFound();
  const context = await staffContext();
  if (!context) redirect("/staff/login?error=access");
  const { data: row, error } = await context.client
    .from("cps_vendors")
    .select("id,reference,data,status,internal_note,status_version,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return (
      <main className="request-page">
        <section className="request-shell">
          <h1>Supplier record unavailable</h1>
          <p role="alert">Please retry or contact your administrator.</p>
          <Link href="/staff/vendors">Supplier registrations</Link>
        </section>
      </main>
    );
  if (!row) notFound();
  const enabled = workspaceWritesReady();
  return (
    <main className="request-page">
      <section className="request-shell">
        <Link href="/staff/vendors">Supplier registrations</Link>
        <h1>{row.data.company}</h1>
        <p className="supplier-reference">{row.reference}</p>
        <p>
          Registered{" "}
          {new Date(row.created_at).toLocaleDateString("en-GB", {
            timeZone: "UTC",
          })}{" "}
          · {row.status === "UnderReview" ? "Under review" : row.status}
        </p>
        <dl className="vendor-details">
          {vendorFields.map((key) => (
            <div key={key} style={{ display: "contents" }}>
              <dt>{vendorLabels[key]}</dt>
              <dd>{row.data[key] || "Not provided"}</dd>
            </div>
          ))}
        </dl>
        {(await searchParams).error && (
          <p role="alert">
            The review could not be saved. Another reviewer may have changed
            this record, or your access may have changed. Reload and review the
            current details before retrying.
          </p>
        )}
        <form action={reviewVendor} className="supplier-review-fields">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="version" value={row.status_version} />
          <div className="request-fields">
            <div>
              <label htmlFor="vendor-status">Review status</label>
              <select
                id="vendor-status"
                name="status"
                defaultValue={row.status}
                disabled={!enabled}
              >
                {vendorStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "UnderReview" ? "Under review" : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="request-full">
              <label htmlFor="vendor-note">Internal review note</label>
              <textarea
                id="vendor-note"
                name="note"
                maxLength={2000}
                rows={4}
                defaultValue={row.internal_note || ""}
                disabled={!enabled}
              />
            </div>
          </div>
          {!enabled && <p>Supplier review writes are not enabled.</p>}
          <button className="request-primary" disabled={!enabled}>
            Save supplier review
          </button>
        </form>
        <p className="request-help">
          Statuses and notes are internal. No message is sent to the supplier.
          Approval does not automatically distribute customer enquiries.
        </p>
      </section>
    </main>
  );
}
