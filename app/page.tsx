import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  Wrench,
  FileText,
  ScanLine,
  Truck,
  Check,
} from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import FindPart from "../components/FindPart";
import {
  categories,
  brands,
  qualityOptions,
  enquiryHref,
  salesHref,
  salesContact,
  brandHref,
} from "../lib/sourcing-config.mjs";
import "./home.css";
const sourcingSteps = [
  {
    title: "Send your requirement",
    text: "A part number, description or equipment details gives us a place to start.",
    icon: FileText,
  },
  {
    title: "Identify & source",
    text: "The team reviews identification details and sourcing options.",
    icon: ScanLine,
  },
  {
    title: "Review our response",
    text: "Confirm the specification, quality option and proposed supply terms.",
    icon: Check,
  },
  {
    title: "Arrange supply",
    text: "Supply and delivery follow the terms of your confirmed order.",
    icon: Truck,
  },
];
const resources = [
  [
    "quality-options",
    "Genuine, OE or OEM?",
    "Understand the terms before choosing a quality option.",
  ],
  [
    "oem-number",
    "Getting the part number right",
    "The small details that make identification easier.",
  ],
  [
    "request-information",
    "A useful parts enquiry",
    "What to include, from equipment details to supporting photos.",
  ],
];
export default function Home() {
  return (
    <div className="sourcing-home" id="top">
      <PublicHeader />
      <main>
        <section className="sourcing-hero">
          <div className="hero-copy">
            <h1>
              We source the part
              <br />
              you need.
            </h1>
            <p>
              Automotive & equipment parts sourcing.
              <br />
              Tell us your requirement. We’ll help identify the part and explore
              the supply options.
            </p>
            <div className="hero-actions">
              <a className="cps-action" href="#find-your-part">
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
              <MessageCircle size={19} />
              WhatsApp Sales <ArrowUpRight size={16} />
            </a>
            <a
              className="hero-technical"
              href={enquiryHref({ purpose: "technical" })}
            >
              Need help identifying it? Talk to a Technical Expert{" "}
              <ArrowRight size={16} />
            </a>
          </div>
          <figure className="hero-visual">
            <Image
              src="/parts-inspection.png"
              alt="Illustrative inspection of a mechanical part at a workbench"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>
              Every enquiry starts with the right identification.
              <span>Illustrative part inspection</span>
            </figcaption>
          </figure>
        </section>
        <div className="sourcing-scope">
          <span>Passenger & commercial vehicles</span>
          <span>Heavy equipment & machinery</span>
          <span>Genuine / OE / OEM</span>
        </div>
        <section className="home-section category-section" id="categories">
          <div className="section-lead">
            <h2>
              Parts for the work
              <br />
              you do.
            </h2>
            <p>
              Choose a category to start your enquiry. We source to your
              requirement, including China-manufactured parts for vehicles and
              equipment of other origins.
            </p>
          </div>
          <div className="category-directory">
            {categories.map((item) => (
              <a
                className="category-link"
                key={item.value}
                href={enquiryHref({ category: item.value })}
              >
                <span>
                  {item.label}
                  <small>{item.detail}</small>
                </span>
                <ArrowUpRight size={20} />
              </a>
            ))}
          </div>
        </section>
        <section className="home-section find-section" id="find-your-part">
          <div className="section-lead">
            <h2>Find Your Part</h2>
            <p>
              No catalogue search needed. Start with what you know; the sourcing
              team can help with the rest.
            </p>
          </div>
          <FindPart />
        </section>
        <section className="home-section brand-section" id="brands">
          <div className="section-inline">
            <h2>Your brand. Your requirement.</h2>
            <p>Choose a brand to carry it into your enquiry.</p>
          </div>
          <div
            className="brand-rail"
            role="list"
            aria-label="Brands in the client-review selection"
          >
            {brands.map((brand) => (
              <a
                role="listitem"
                className="brand-link"
                href={brandHref(brand.name, {
                  catalogueEnabled:
                    process.env.CPS_PUBLIC_CATALOGUE_ENABLED === "true",
                })}
                key={brand.name}
                aria-label={`Enquire about ${brand.name}`}
              >
                <img
                  className={
                    brand.darkBacking ? "brand-dark-backing" : undefined
                  }
                  src={"/brands/" + brand.asset}
                  alt={brand.name}
                  width="120"
                  height="48"
                />
                <span>
                  {brand.name}
                  <ArrowUpRight size={14} />
                </span>
              </a>
            ))}
          </div>
          <p className="section-note">
            Have another brand or an unfamiliar part number?{" "}
            <a href="/request">Send Your Enquiry</a>. Brand references help
            identify requirements and do not imply manufacturer authorization.
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
          <ol className="sourcing-process">
            {sourcingSteps.map(({ title, text, icon: Icon }, i) => (
              <li key={title}>
                <div className="process-marker">
                  <span>{i + 1}</span>
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="home-section audience-section" id="who-we-serve">
          <h2>Built around your working day.</h2>
          <div className="audience-rows">
            {[
              [
                "Workshop & Garage",
                "Identify repair and maintenance parts with the details available at the bench.",
              ],
              [
                "Fleet Operations",
                "Bring vehicle requirements and maintenance parts into one clear enquiry.",
              ],
              [
                "Procurement",
                "Share a single requirement or a parts list for a structured sourcing response.",
              ],
            ].map(([title, text]) => (
              <a href="/request" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={24} />
              </a>
            ))}
          </div>
        </section>
        <section className="home-section resource-section" id="resources">
          <div className="section-inline">
            <h2>A clearer enquiry starts here.</h2>
            <p>Practical guidance for making the next conversation useful.</p>
          </div>
          <div className="resource-links">
            {resources.map(([slug, title, text]) => (
              <a href={"/guides/" + slug} key={slug}>
                <FileText size={24} />
                <h3>{title}</h3>
                <p>{text}</p>
                <span>
                  Read the guide <ArrowRight size={18} />
                </span>
              </a>
            ))}
          </div>
          <p className="quality-line">
            Discuss your preference:{" "}
            {qualityOptions.map((item) => (
              <span key={item}>{item}</span>
            ))}
            <a href="/guides/quality-options">What do these mean?</a>
          </p>
        </section>
        <section className="technical-section" id="technical-assistance">
          <div>
            <Wrench size={32} />
            <h2>
              Not sure which
              <br />
              part you need?
            </h2>
          </div>
          <div>
            <p>
              Bring your part number, equipment details or description. Request
              technical assistance with identification before discussing
              sourcing.
            </p>
            <a
              className="cps-dark-action"
              href={enquiryHref({ purpose: "technical" })}
            >
              Talk to a Technical Expert <ArrowUpRight size={20} />
            </a>
            <small>
              Starts a technical-help enquiry for a human to review.
            </small>
          </div>
        </section>
        <section className="home-section supplier-section" id="suppliers">
          <div>
            <h2>
              Supply parts?
              <br />
              Let’s get to know your business.
            </h2>
            <p>
              Introduce your company, product range and the brands you supply.
              The team reviews supplier registrations individually.
            </p>
          </div>
          <a className="cps-outline" href="/supplier-registration">
            Supplier Registration <ArrowUpRight size={20} />
          </a>
        </section>
        <section className="contact-section" id="contact">
          <div>
            <h2>Tell us what you’re looking for.</h2>
            <p>
              A part number. A repair requirement. A parts list.
              <br />
              Start the conversation with the information you have.
            </p>
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
              <MessageCircle size={20} /> WhatsApp Sales{" "}
              <span>{salesContact.display}</span>
            </a>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <a className="public-brand" href="/">
          <img src="/cps-logo.png" alt="" width="40" height="40" />
          <span>
            CHINA PARTS <strong>SHOP</strong>
          </span>
        </a>
        <p>Automotive & equipment parts sourcing.</p>
        <nav aria-label="Footer navigation">
          <a href="#find-your-part">Find Your Part</a>
          <a href="#categories">Categories</a>
          <a href="#resources">Resources</a>
          <a href="/supplier-registration">Supplier Registration</a>
          <a href="/customer-access">Customer Login</a>
          <a href="#contact">Contact</a>
          <a href="/policies">Policies</a>
        </nav>
        <small>© {new Date().getFullYear()} China Parts Shop · English</small>
      </footer>
    </div>
  );
}
