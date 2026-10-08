import { ArrowUpRight } from "lucide-react";
import {
  SiteShell,
  PageHero,
  pageMetadata,
} from "../../components/SourcingSite";
import { enquiryHref } from "../../lib/sourcing-config.mjs";
export const metadata = pageMetadata(
  "Technical Assistance",
  "Request human help identifying a part or equipment requirement.",
  "/technical-assistance",
);
export default function Technical() {
  return (
    <SiteShell>
      <PageHero
        title="Need help identifying the correct part?"
        text="Request human assistance with component identification. Share what you know before discussing sourcing options."
        image="/parts-inspection.png"
        alt="Illustrative technical component inspection"
      >
        <a className="cps-action" href={enquiryHref({ purpose: "technical" })}>
          Send Technical Requirement <ArrowUpRight size={20} />
        </a>
      </PageHero>
      <section className="home-section details-help">
        <div>
          <h2>We can work from the details at hand.</h2>
          <p>
            You do not need a confirmed part number to begin. Explain the
            equipment and where the component is used.
          </p>
        </div>
        <ul>
          <li>OEM or part number, including suffixes</li>
          <li>Vehicle or equipment make and model</li>
          <li>Component description and function</li>
          <li>Existing reference or documentation</li>
          <li>A photo when secure uploads are available</li>
        </ul>
      </section>
      <section className="technical-requirement">
        <div>
          <h2>
            Identification first.
            <br />
            Sourcing next.
          </h2>
          <p>
            Your enquiry carries technical-assistance context into the main
            form. A human reviews the details; this page does not promise
            certified engineering advice or compatibility.
          </p>
        </div>
        <a
          className="cps-dark-action"
          href={enquiryHref({ purpose: "technical" })}
        >
          Send Technical Requirement <ArrowUpRight size={20} />
        </a>
      </section>
    </SiteShell>
  );
}
