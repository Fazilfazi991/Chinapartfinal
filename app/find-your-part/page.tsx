import {
  ArrowUpRight,
  Hash,
  Truck,
  FileText,
  Camera,
  List,
} from "lucide-react";
import RfqForm from "../../components/RfqForm";
import {
  SiteShell,
  PageHero,
  Workflow,
  pageMetadata,
} from "../../components/SourcingSite";
import { backendMode, uploadsEnabled } from "../../lib/config.mjs";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Find Your Part",
  "Identify your parts requirement with a reference, equipment details or description.",
  "/find-your-part",
);
export default function FindYourPart() {
  const mode = backendMode();
  return (
    <SiteShell>
      <PageHero
        title="Tell us what part you need."
        text="A part number, vehicle or equipment details, or even a description can help the sourcing team identify your requirement."
        image="/parts-inspection.png"
        alt="Illustrative inspection of a mechanical component"
      >
        <a className="cps-action" href="#sourcing-form">
          Start your requirement <ArrowUpRight size={20} />
        </a>
      </PageHero>
      <section className="home-section identity-methods">
        <h2>Start with the information you have.</h2>
        <ul>
          {[
            [
              Hash,
              "Part / OEM number",
              "Copy markings exactly, including suffixes.",
            ],
            [
              Truck,
              "Vehicle or equipment",
              "Make, model and chassis or serial details.",
            ],
            [FileText, "Part description", "Tell us what the component does."],
            [
              Camera,
              "Photo",
              "Supporting photos when secure uploads are available.",
            ],
            [List, "Parts list", "Describe each item and quantity."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Hash;
            return (
              <li key={title as string}>
                <I size={28} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </li>
            );
          })}
        </ul>
        <p className="section-note">
          Upload availability is shown in the form. Photos and lists are never
          accepted through an unsecured alternative.
        </p>
      </section>
      <section className="full-enquiry" id="sourcing-form">
        <RfqForm
          embedded
          mode={mode}
          allowUploads={uploadsEnabled()}
          siteKey={
            mode === "supabase"
              ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
              : undefined
          }
        />
      </section>
      <section className="home-section">
        <div className="section-inline">
          <h2>What happens next?</h2>
          <p>Identification and supply terms require human review.</p>
        </div>
        <Workflow expanded />
      </section>
      <section className="contact-section">
        <div>
          <h2>Need help identifying it?</h2>
          <p>Start with the details you have; request technical assistance.</p>
        </div>
        <div>
          <a className="cps-dark-action" href="/technical-assistance">
            Talk to Technical Expert <ArrowUpRight size={20} />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
