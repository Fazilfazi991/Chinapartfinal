import { ArrowUpRight } from "lucide-react";
import {
  SiteShell,
  PageHero,
  Workflow,
  pageMetadata,
} from "../../components/SourcingSite";
export const metadata = pageMetadata(
  "Suppliers",
  "Introduce your parts supply business for individual review.",
  "/suppliers",
);
export default function Suppliers() {
  return (
    <SiteShell>
      <PageHero
        title="Supply parts? Join our sourcing network."
        text="Introduce your business, the components you supply and the applications you understand. Supplier information is reviewed individually."
        image="/sourcing/warehouse.webp"
        alt="Illustrative warehouse and supplier context"
      >
        <a className="cps-action" href="/suppliers/register">
          Register as a Supplier <ArrowUpRight size={20} />
        </a>
      </PageHero>
      <section className="home-section">
        <h2 className="section-heading">An introduction, then a review.</h2>
        <Workflow supplier />
        <p className="section-note">
          Registration does not guarantee approval, enquiries or orders. Future
          sourcing opportunities depend on requirements and agreed terms.
        </p>
      </section>
      <section className="supplier-information home-section">
        <div>
          <h2>Tell us where your business fits.</h2>
          <p>
            Clear information helps the team understand your supply
            capabilities.
          </p>
        </div>
        <dl>
          {[
            [
              "Company & contact",
              "Business name, contact person and email or mobile.",
            ],
            [
              "Product areas",
              "Component families, brands and equipment categories.",
            ],
            [
              "Location & remarks",
              "Country, operating context and useful additional details.",
            ],
          ].map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="vendor-reference-section">
        <div>
          <h2>One stable Vendor ID.</h2>
          <p>
            When a registration is saved, its supplier record receives a stable
            business reference for correspondence and review. Registration alone
            does not establish approval or a supply agreement.
          </p>
        </div>
        <div>
          <h3>A reference, not an account.</h3>
          <p>
            A Vendor ID is not a login or access credential. Supplier
            information is kept private and reviewed by authorised staff.
          </p>
          <a className="cps-action" href="/suppliers/register">
            Register as a Supplier <ArrowUpRight size={20} />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
