import {
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  Hash,
  FileText,
  ScanLine,
  Check,
} from "lucide-react";
import FindPart from "../components/FindPart";
import {
  SiteShell,
  SourcingImage,
  CategoryGrid,
  ArticleLinks,
  Workflow,
  BrandDiscovery,
} from "../components/SourcingSite";
import { salesHref } from "../lib/sourcing-config.mjs";
import { findPartHref } from "../lib/sourcing-pages.mjs";
export default function Home() {
  return (
    <SiteShell>
      <section className="restored-demo-hero">
        <picture>
          <source
            media="(max-width:650px)"
            srcSet="/sourcing/hero-industrial-mobile.webp"
          />
          <img
            src="/sourcing/hero-industrial.webp"
            alt="Illustrative SUV, commercial truck and crane in an industrial yard"
            fetchPriority="high"
            width="1672"
            height="941"
          />
        </picture>
        <div className="demo-hero-shade" />
        <div className="demo-hero-content hero-copy">
          <p className="restoration-label">
            Automotive & equipment parts sourcing
          </p>
          <h1>
            We source the part
            <br />
            <span>you need.</span>
          </h1>
          <p>
            Tell us your requirement. We’ll help identify the part and explore
            the supply options.
          </p>
          <div className="hero-actions">
            <a className="cps-action" href="#find-your-part">
              Find Your Part <ArrowRight size={18} />
            </a>
            <a className="cps-outline" href="/request">
              Send Your Enquiry <ArrowRight size={18} />
            </a>
          </div>
          <div className="hero-secondary">
            <a
              className="hero-sales"
              href={salesHref()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> WhatsApp Sales{" "}
              <ArrowUpRight size={16} />
            </a>
            <a className="hero-technical" href="/technical-assistance">
              Technical Assistance <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <small className="demo-hero-caption">
          Illustrative client-review imagery
        </small>
      </section>
      <section
        className="home-section find-section restored-finder"
        id="find-your-part"
      >
        <div className="find-feature">
          <div className="finder-story">
            <p className="restoration-label">
              Start with the information you have
            </p>
            <h2>Find Your Part</h2>
            <p>
              A number, description or equipment detail gives the sourcing team
              a place to begin.
            </p>
            <SourcingImage
              src="/parts-catalogue.png"
              alt="Illustrative engine, filter and mechanical components"
            />
            <div className="finder-methods">
              <span>
                <Hash size={16} /> OEM / part number
              </span>
              <span>
                <ScanLine size={16} /> Equipment details
              </span>
              <span>
                <FileText size={16} /> Description / list
              </span>
            </div>
          </div>
          <FindPart destination="/find-your-part" />
        </div>
      </section>
      <div className="sourcing-scope">
        <span>
          <Check size={18} /> Genuine / OE / OEM
        </span>
        <span>
          <ScanLine size={18} /> Human part identification
        </span>
        <span>
          <FileText size={18} /> One sourcing enquiry
        </span>
      </div>
      <section className="home-section brand-section" id="brands">
        <div className="section-inline">
          <div>
            <p className="restoration-label">Vehicle & equipment makes</p>
            <h2>
              Your brand.
              <br />
              Your requirement.
            </h2>
          </div>
          <p>
            Start with your vehicle or equipment make. Your selection carries
            into the enquiry.
          </p>
        </div>
        <BrandDiscovery />
        <p className="section-note">
          Can’t see your brand?{" "}
          <a href="/find-your-part">Send us the requirement.</a> Current review
          selection; logo rights and final list await confirmation.
        </p>
      </section>
      <section className="home-section" id="categories">
        <div className="section-inline">
          <div>
            <p className="restoration-label">
              Vehicles, machinery & components
            </p>
            <h2>
              Parts across the
              <br />
              work you do.
            </h2>
          </div>
          <a className="text-action" href="/categories">
            Explore All Categories <ArrowUpRight size={20} />
          </a>
        </div>
        <CategoryGrid preview />
        <p className="section-note">
          Category illustrations describe sourcing contexts. Availability and
          specification are confirmed for your requirement.
        </p>
      </section>
      <section className="component-section">
        <div className="home-section">
          <div className="section-inline">
            <div>
              <p className="restoration-label">Component-led requirements</p>
              <h2>
                Start with the system.
                <br />
                We’ll work from there.
              </h2>
            </div>
            <p>
              A component family can help explain the requirement when the exact
              reference is unknown.
            </p>
          </div>
          <div className="component-families">
            {[
              [
                "Engine",
                "/sourcing/engine.webp",
                "Engine & service components",
              ],
              [
                "Transmission",
                "/parts-catalogue.png",
                "Transmission & driveline",
              ],
              [
                "Hydraulics",
                "/sourcing/equipment.webp",
                "Hydraulics & machine components",
              ],
            ].map(([system, image, title]) => (
              <a
                key={system}
                href={findPartHref({
                  description: system + " parts requirement",
                })}
              >
                <SourcingImage
                  src={image}
                  alt={"Illustrative context for " + title}
                />
                <div>
                  <h3>{title}</h3>
                  <span>
                    Find Your Part <ArrowRight size={18} />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <p className="section-note">
            Illustrative component families, not product listings or stock
            availability.
          </p>
        </div>
      </section>
      <section className="home-section process-section" id="how-it-works">
        <div className="section-lead">
          <div>
            <p className="restoration-label">How it works</p>
            <h2>
              From requirement
              <br />
              to a sourcing response.
            </h2>
          </div>
          <p>
            A clear conversation at each step. Specifications and supply terms
            are confirmed before an order proceeds.
          </p>
        </div>
        <Workflow />
      </section>
      <section className="home-section audience-stage" id="who-we-serve">
        <div className="section-inline">
          <div>
            <p className="restoration-label">Who we serve</p>
            <h2>
              Built around
              <br />
              your working day.
            </h2>
          </div>
          <p>
            Repair work, fleet maintenance or procurement: start with the
            information you have.
          </p>
        </div>
        <div className="audience-panels">
          {[
            [
              "Workshop & Garage",
              "Repair and maintenance requirements.",
              "/parts-inspection.png",
            ],
            [
              "Fleet Operations",
              "Vehicle and equipment needs.",
              "/sourcing/truck.webp",
            ],
            [
              "Procurement",
              "Single components or a parts list.",
              "/sourcing/warehouse.webp",
            ],
          ].map(([title, text, image]) => (
            <a
              key={title}
              href={findPartHref({
                description: title + " sourcing requirement",
              })}
            >
              <SourcingImage
                src={image}
                alt={"Illustrative " + title.toLowerCase() + " context"}
              />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={24} />
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="home-section resource-stage" id="resources">
        <div className="section-inline">
          <div>
            <p className="restoration-label">Parts knowledge</p>
            <h2>
              A clearer enquiry
              <br />
              starts here.
            </h2>
          </div>
          <a className="text-action" href="/resources">
            Explore Resources <ArrowUpRight size={20} />
          </a>
        </div>
        <ArticleLinks />
      </section>
      <section className="technical-preview" id="technical-assistance">
        <div>
          <p className="restoration-label">Technical identification</p>
          <h2>
            Not sure which
            <br />
            part you need?
          </h2>
          <p>
            Request human help with identification before discussing sourcing.
          </p>
          <a className="cps-dark-action" href="/technical-assistance">
            Talk to Technical Expert <ArrowUpRight size={20} />
          </a>
        </div>
        <SourcingImage
          src="/parts-inspection.png"
          alt="Illustrative mechanical component inspection"
        />
      </section>
      <section className="home-section supplier-preview" id="suppliers">
        <div>
          <p className="restoration-label">Supplier network</p>
          <h2>
            Supply parts?
            <br />
            Introduce your business.
          </h2>
          <p>
            Share your capabilities for individual review. Registration does not
            guarantee approval or orders.
          </p>
          <a className="cps-action" href="/suppliers">
            Become a Supplier <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="supplier-story">
          <SourcingImage
            src="/sourcing/warehouse.webp"
            alt="Illustrative warehouse and supplier context"
          />
          <div
            className="supplier-mini-flow"
            aria-label="Supplier relationship"
          >
            <span>Supplier</span>
            <ArrowRight />
            <span>Registration</span>
            <ArrowRight />
            <span>Vendor ID</span>
            <ArrowRight />
            <span>Sourcing network</span>
          </div>
        </div>
      </section>
      <section className="contact-section" id="contact">
        <div>
          <p className="restoration-label">
            One requirement. One conversation.
          </p>
          <h2>
            Tell us what
            <br />
            you’re looking for.
          </h2>
          <p>A part number. A repair requirement. A parts list.</p>
        </div>
        <div>
          <a className="cps-action" href="/request">
            Send Your Enquiry <ArrowUpRight size={20} />
          </a>
          <a
            className="contact-sales"
            href={salesHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={20} /> WhatsApp Sales
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
