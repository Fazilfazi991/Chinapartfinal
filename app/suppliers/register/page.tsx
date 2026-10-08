import SupplierForm from "../../../components/SupplierForm";
import {
  SiteShell,
  PageHero,
  pageMetadata,
} from "../../../components/SourcingSite";
import { vendorBackendMode } from "../../../lib/config.mjs";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Supplier Registration",
  "Introduce your company and parts supply capabilities.",
  "/suppliers/register",
);
export default function Registration() {
  const mode = vendorBackendMode();
  return (
    <SiteShell>
      <PageHero
        title="Introduce your supply business."
        text="Company details first, supply capabilities next. Review your information before sending a registration."
        image="/sourcing/warehouse.webp"
        alt="Illustrative supplier warehouse"
      />
      <section className="registration-layout">
        <aside>
          <h2>A clear business introduction.</h2>
          <ol>
            <li>Company and contact</li>
            <li>Supply capabilities</li>
            <li>Review and registration</li>
          </ol>
          <p>
            Provide business information only. Supplier records are private and
            a saved Vendor ID supports correspondence; it does not grant account
            access.
          </p>
          <a href="/suppliers">About the supplier relationship</a>
          <a href="/policies">Privacy and policies</a>
        </aside>
        <SupplierForm
          embedded
          mode={mode}
          siteKey={
            mode === "supabase"
              ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
              : undefined
          }
        />
      </section>
    </SiteShell>
  );
}
