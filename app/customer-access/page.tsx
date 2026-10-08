import Link from "next/link";
import {
  SiteShell,
  SourcingImage,
  pageMetadata,
} from "../../components/SourcingSite";
import { authConfigured } from "../../lib/supabase/server";
import {
  customerAuthEnabled,
  customerRecoveryEnabled,
} from "../../lib/customer-auth.mjs";
import { customerLogin } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Customer Login",
  "Secure access for approved customer company accounts.",
  "/customer-access",
);
export default async function CustomerAccess({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const enabled = customerAuthEnabled() && authConfigured();
  return (
    <SiteShell>
      <section className="customer-access-layout">
        <div className="customer-access-story">
          <h1>
            Your enquiries.
            <br />
            Your company access.
          </h1>
          <p>
            Approved company accounts provide secure access to the customer
            enquiry workspace when the portal is activated.
          </p>
          <SourcingImage
            src="/sourcing/workshop.webp"
            alt="Illustrative component and workshop context"
          />
          <p className="section-note">
            Enquiry and status visibility follow account permissions. A request
            reference alone never grants access.
          </p>
        </div>
        <div className="customer-access-panel">
          <h2>Customer enquiry access</h2>
          {enabled ? (
            <>
              <p>
                Sign in with your approved company account. Invitations are
                managed by the team; public registration is unavailable.
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
                <button type="submit" className="cps-action">
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
              <p className="request-mode">
                Online enquiry tracking is not available yet.
              </p>
              <p>
                Keep your request reference and use the company’s approved
                support channel for an update.
              </p>
              <p>
                No customer information is exposed through a public reference
                search.
              </p>
            </>
          )}
          <Link href="/request">Send Your Enquiry</Link>
        </div>
      </section>
    </SiteShell>
  );
}
