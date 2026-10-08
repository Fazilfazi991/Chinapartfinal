import { ArrowUpRight, MessageCircle, FileText, Wrench } from "lucide-react";
import {
  SiteShell,
  PageHero,
  pageMetadata,
} from "../../components/SourcingSite";
import { salesHref, salesContact } from "../../lib/sourcing-config.mjs";
export const metadata = pageMetadata(
  "Contact",
  "Contact sales, start a sourcing enquiry or request identification assistance.",
  "/contact",
);
export default function Contact() {
  return (
    <SiteShell>
      <PageHero
        title="Start the right conversation."
        text="Send a sourcing requirement, talk to sales or ask for help identifying a component. Choose the route that matches what you need."
        image="/sourcing/workshop.webp"
        alt="Illustrative workshop and sourcing context"
      />
      <section className="home-section contact-options">
        <div>
          <MessageCircle size={32} />
          <h2>WhatsApp Sales</h2>
          <p>For a parts sourcing conversation with the sales team.</p>
          <a
            className="cps-action"
            href={salesHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Sales <ArrowUpRight size={20} />
          </a>
          <small>
            {salesContact.display} · Current client-review destination
          </small>
        </div>
        <div>
          <FileText size={32} />
          <h2>Send an Enquiry</h2>
          <p>Bring a part number, description or a structured requirement.</p>
          <a className="cps-outline" href="/request">
            Send Your Enquiry <ArrowUpRight size={20} />
          </a>
        </div>
        <div>
          <Wrench size={32} />
          <h2>Technical Assistance</h2>
          <p>Human help with part identification before sourcing.</p>
          <a className="cps-outline" href="/technical-assistance">
            Talk to Technical Expert <ArrowUpRight size={20} />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
