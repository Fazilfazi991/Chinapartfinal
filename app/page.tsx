import { ArrowUpRight, ArrowRight, MessageCircle } from "lucide-react";
import FindPart from "../components/FindPart";
import {
  SiteShell,
  SourcingImage,
  CategoryGrid,
  ArticleLinks,
  Workflow,
} from "../components/SourcingSite";
import { brands, salesHref } from "../lib/sourcing-config.mjs";
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
          <h1>
            We source the part
            <br />
            <span>you need.</span>
          </h1>
          <p>
            Automotive & equipment parts sourcing.
            <br />
            Tell us your requirement. We’ll help identify the part and explore
            the supply options.
          </p>
          <div className="hero-actions">
            <a className="cps-action" href="/find-your-part">
              Find Your Part <ArrowUpRight size={20} />
            </a>
            <a className="cps-outline" href="/request">
              Send Your Enquiry <ArrowRight size={18} />
            </a>
          </div>
          <a
            className="hero-sales"
            href={salesHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={19} /> WhatsApp Sales{" "}
            <ArrowUpRight size={16} />
          </a>
          <a className="hero-technical" href="/technical-assistance">
            Need help identifying it? Technical Assistance{" "}
            <ArrowRight size={16} />
          </a>
        </div>
        <small className="demo-hero-caption">
          Illustrative client-review imagery
        </small>
      </section>
      <div className="sourcing-scope">
        <span>Passenger & commercial vehicles</span>
        <span>Heavy equipment & machinery</span>
        <span>Genuine / OE / OEM</span>
      </div>
      <section className="home-section" id="categories">
        <div className="section-inline">
          <h2>Parts for the work you do.</h2>
          <a className="text-action" href="/categories">
            Explore All Categories <ArrowUpRight size={20} />
          </a>
        </div>
        <CategoryGrid preview />
      </section>
      <section className="home-section find-section" id="find-your-part">
        <div className="find-feature">
          <div>
            <h2>Find Your Part</h2>
            <p>
              Start with what you know. A number, description or equipment
              detail gives the sourcing team a place to begin.
            </p>
            <SourcingImage
              src="/sourcing/engine.webp"
              alt="Illustrative engine components for part identification"
            />
          </div>
          <FindPart destination="/find-your-part" />
        </div>
      </section>
      <section className="home-section brand-section" id="brands">
        <div className="section-inline">
          <h2>Your brand. Your requirement.</h2>
          <p>Carry your brand into the sourcing form.</p>
        </div>
        <div
          className="brand-rail"
          role="list"
          aria-label="Brands in the client-review selection"
        >
          {brands.map((b) => (
            <a
              role="listitem"
              className="brand-link"
              href={findPartHref({ brand: b.name })}
              key={b.name}
              aria-label={"Find parts for " + b.name}
            >
              <img
                className={b.darkBacking ? "brand-dark-backing" : undefined}
                src={"/brands/" + b.asset}
                alt={b.name}
                width="140"
                height="56"
              />
              <span>
                {b.name}
                <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
        </div>
        <p className="section-note">
          Can’t see your brand?{" "}
          <a href="/find-your-part">Send us the requirement.</a> Review brands
          do not imply manufacturer authorization.
        </p>
      </section>
      <section className="home-section process-section" id="how-it-works">
        <div className="section-lead">
          <h2>
            From requirement
            <br />
            to a sourcing response.
          </h2>
          <p>
            A clear conversation at each step. Specifications and supply terms
            are confirmed before an order proceeds.
          </p>
        </div>
        <Workflow />
      </section>
      <section className="audience-stage" id="who-we-serve">
        <SourcingImage
          src="/sourcing/warehouse.webp"
          alt="Illustrative warehouse and procurement context"
        />
        <div className="audience-content">
          <h2>Built around your working day.</h2>
          <div>
            {[
              ["Workshop & Garage", "Repair and maintenance requirements."],
              ["Fleet Operations", "Vehicle and equipment needs."],
              ["Procurement", "Single components or a parts list."],
            ].map(([title, text]) => (
              <a href="/find-your-part" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={24} />
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="home-section" id="resources">
        <div className="section-inline">
          <h2>A clearer enquiry starts here.</h2>
          <a className="text-action" href="/resources">
            Explore Resources <ArrowUpRight size={20} />
          </a>
        </div>
        <ArticleLinks />
      </section>
      <section className="technical-preview" id="technical-assistance">
        <div>
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
          <h2>
            Supply parts?
            <br />
            Introduce your business.
          </h2>
          <p>Share your capabilities for individual review.</p>
          <a className="cps-outline" href="/suppliers">
            Become a Supplier <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="supplier-mini-flow" aria-label="Supplier relationship">
          <span>Supplier</span>
          <ArrowRight />
          <span>Vendor ID</span>
          <ArrowRight />
          <span>Sourcing network</span>
          <small>
            Registration and review precede any future sourcing opportunity.
          </small>
        </div>
      </section>
      <section className="contact-section" id="contact">
        <div>
          <h2>Tell us what you’re looking for.</h2>
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
