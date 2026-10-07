import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { authConfigured } from "../../lib/supabase/server";
import {
  customerAuthEnabled,
  customerRecoveryEnabled,
} from "../../lib/customer-auth.mjs";
import { customerLogin } from "./actions";
export const dynamic = "force-dynamic";
export default async function CustomerAccess({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const enabled = customerAuthEnabled() && authConfigured();
  return (
    <>
      <PublicHeader />
      <main className="request-page">
        <section className="request-shell">
          <h1>Customer enquiry access</h1>
          {enabled ? (
            <>
              <p>
                Sign in with your approved company account. Account invitations
                are managed by the team; public registration is unavailable.
              </p>
              <form action={customerLogin} className="request-fields">
                <div>
                  <label htmlFor="customer-email">Email</label>
                  <input
                    id="customer-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    maxLength={254}
                  />
                </div>
                <div>
                  <label htmlFor="customer-password">Password</label>
                  <input
                    id="customer-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={200}
                  />
                </div>
                {params.error && (
                  <p role="alert">
                    Sign in could not be completed. Check your details or
                    contact the team.
                  </p>
                )}
                <button type="submit" className="request-primary">
                  Sign in
                </button>
              </form>
              {customerRecoveryEnabled() && (
                <Link href="/customer-access/recovery">
                  Forgot your password?
                </Link>
              )}
            </>
          ) : (
            <>
              <p>
                Online enquiry tracking is not available yet. Keep your request
                reference and use the company&apos;s approved support channel
                for an update.
              </p>
              <p>
                No customer information is exposed through a public reference
                search.
              </p>
            </>
          )}
          <Link href="/request">Send Your Enquiry</Link>
        </section>
      </main>
    </>
  );
}
