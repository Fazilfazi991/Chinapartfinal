import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { staffContext } from "../../../lib/supabase/server";
import { readVendors } from "../../../lib/vendors.mjs";
import { logout } from "../login/actions";
export const dynamic = "force-dynamic";
export default async function Vendors({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const context = await staffContext();
  if (!context) redirect("/staff/login?error=access");
  const page = Number((await searchParams).page || 0);
  if (!Number.isInteger(page) || page < 0 || page > 10000) notFound();
  let result: { rows: Record<string, any>[]; hasMore: boolean } = {
      rows: [],
      hasMore: false,
    },
    error = false;
  try {
    result = await readVendors(context.client, page);
  } catch {
    error = true;
  }
  return (
    <main className="request-page">
      <section className="request-shell">
        <div className="request-actions">
          <Link href="/staff">Request inbox</Link>
          <form action={logout}>
            <button>Sign out</button>
          </form>
        </div>
        <h1>Supplier registrations</h1>
        <p>
          Private records available to your staff scope. Administrators review
          unassigned registrations; office staff see suppliers assigned to their
          office.
        </p>
        {error ? (
          <p role="alert">
            Supplier records are unavailable. Please retry or contact your
            administrator.
          </p>
        ) : !result.rows.length ? (
          <p>No supplier registrations available to your account.</p>
        ) : (
          <ul className="vendor-list">
            {result.rows.map((row) => (
              <li key={row.id}>
                <Link href={"/staff/vendors/" + row.id}>
                  <strong className="supplier-reference">
                    {row.reference}
                  </strong>
                  <strong>{row.data.company}</strong>
                  <span>
                    {row.data.contact} · {row.data.email || row.data.mobile}
                  </span>
                  <span>{row.data.products}</span>
                  <span className="vendor-status">
                    {row.status === "UnderReview" ? "Under review" : row.status}
                  </span>
                  <span>
                    {new Date(row.created_at).toLocaleDateString("en-GB", {
                      timeZone: "UTC",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <nav className="request-actions" aria-label="Supplier inbox pages">
          {page > 0 && (
            <Link href={"/staff/vendors?page=" + (page - 1)}>
              Previous page
            </Link>
          )}
          {result.hasMore && (
            <Link href={"/staff/vendors?page=" + (page + 1)}>Next page</Link>
          )}
        </nav>
      </section>
    </main>
  );
}
