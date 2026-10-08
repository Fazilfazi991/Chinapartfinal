import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  ScanLine,
  Check,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import PublicHeader from "./PublicHeader";
import {
  categoryPages,
  articles,
  findPartHref,
} from "../lib/sourcing-pages.mjs";
import { approvedSiteOrigin } from "../lib/site-indexing.mjs";
import { brands } from "../lib/sourcing-config.mjs";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const origin = approvedSiteOrigin();
  return {
    title: title + " | China Parts Shop",
    description,
    ...(origin ? { alternates: { canonical: origin + path } } : {}),
  };
}
export function PublicFooter() {
  return (
    <footer className="public-footer site-footer">
      <div className="footer-intro">
        <a className="public-brand" href="/">
          <img src="/cps-logo.png" width="44" height="44" alt="" />
          <span>
            CHINA PARTS <strong>SHOP</strong>
          </span>
        </a>
        <p>
          Automotive & equipment parts sourcing.
          <br />
          Start with your requirement.
        </p>
      </div>
      <div className="footer-columns">
        {[
          [
            "Company",
            ["Home", "/"],
            ["Contact", "/contact"],
            ["Policies", "/policies"],
          ],
          [
            "Source parts",
            ["Find Your Part", "/find-your-part"],
            ["Categories", "/categories"],
            ["Technical Assistance", "/technical-assistance"],
          ],
          [
            "Resources",
            ["Resource hub", "/resources"],
            ["Genuine / OE / OEM", "/resources/genuine-oe-oem"],
            ["Part identification", "/resources/find-part-number"],
          ],
          [
            "Partners",
            ["Suppliers", "/suppliers"],
            ["Supplier Registration", "/suppliers/register"],
            ["Customer Login", "/customer-access"],
          ],
        ].map(([title, ...links]) => (
          <nav key={title as string} aria-label={title as string}>
            <h3>{title}</h3>
            {links.map((link) => (
              <a key={link[1]} href={link[1]}>
                {link[0]}
              </a>
            ))}
          </nav>
        ))}
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} China Parts Shop · English</small>
        <small>
          Client review · Company wording, imagery, categories and brands await
          final approval.
        </small>
      </div>
    </footer>
  );
}
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sourcing-home multipage-site demo-restoration">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
export function SourcingImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={"sourcing-image " + className}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width:760px) 100vw, (max-width:1100px) 50vw, 700px"
      />
      <figcaption>Illustrative review imagery</figcaption>
    </figure>
  );
}
export function PageHero({
  title,
  text,
  image,
  alt,
  children,
}: {
  title: string;
  text: string;
  image: string;
  alt: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-hero">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
        {children && <div className="page-actions">{children}</div>}
      </div>
      <SourcingImage src={image} alt={alt} priority />
    </section>
  );
}
export function CategoryGrid({ preview = false }: { preview?: boolean }) {
  const chosen = preview
    ? categoryPages.filter((c) =>
        [
          "passenger-vehicles",
          "trucks-trailers",
          "heavy-equipment",
          "suv-4x4",
          "cranes",
          "industrial-components",
        ].includes(c.slug),
      )
    : categoryPages;
  return (
    <div className={"visual-categories" + (preview ? " category-preview" : "")}>
      {chosen.map((c) => (
        <article className="category-panel" key={c.slug}>
          <a
            className="visual-category"
            href={findPartHref({ category: c.value })}
          >
            <div className="category-photo">
              <Image
                src={c.image}
                alt={c.label + " illustrative equipment context"}
                fill
                sizes="(max-width:600px) 100vw, (max-width:1100px) 50vw, 400px"
              />
            </div>
            <div>
              <h3>{c.label}</h3>
              <p>{c.detail}</p>
              <span className="category-enquiry">Find Your Part</span>
              <ArrowUpRight size={22} />
            </div>
          </a>
          <a className="category-detail-link" href={"/categories/" + c.slug}>
            Category guide <ArrowRight size={15} />
          </a>
        </article>
      ))}
    </div>
  );
}
export function ArticleLinks({ exclude }: { exclude?: string }) {
  return (
    <div className="editorial-links">
      {articles
        .filter((a) => a.slug !== exclude)
        .map((a) => (
          <a href={"/resources/" + a.slug} key={a.slug}>
            <div className="article-thumbnail">
              <Image
                src={a.image}
                alt={"Illustrative context for " + a.title}
                fill
                sizes="(max-width:760px) 100vw, 400px"
              />
            </div>
            <h3>{a.title}</h3>
            <small className="article-type">Parts knowledge · Guide</small>
            <p>{a.summary}</p>
            <span>
              Read the guide <ArrowRight size={18} />
            </span>
          </a>
        ))}
    </div>
  );
}
export function BrandDiscovery() {
  return (
    <div
      className="brand-rail brand-discovery"
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
          <span
            className={
              "brand-disc" + (b.darkBacking ? " brand-dark-backing" : "")
            }
          >
            <img
              src={"/brands/" + b.asset}
              alt={b.name}
              width="140"
              height="70"
            />
          </span>
          <span>
            {b.name}
            <ArrowUpRight size={14} />
          </span>
        </a>
      ))}
    </div>
  );
}
const steps = [
  [
    "Send requirement",
    "Share a reference, description or equipment details.",
    FileText,
  ],
  [
    "Identify & source",
    "The team reviews the application and sourcing options.",
    ScanLine,
  ],
  [
    "Review response",
    "Confirm the specification, quality and proposed terms.",
    Check,
  ],
  [
    "Arrange supply",
    "Supply follows the terms of your confirmed order.",
    Truck,
  ],
] as const;
export function Workflow({
  supplier = false,
  expanded = false,
}: {
  supplier?: boolean;
  expanded?: boolean;
}) {
  const items = supplier
    ? [
        ["Supplier", "Your company and capabilities."],
        ["Registration", "A clear business introduction."],
        ["Vendor ID", "A stable correspondence reference."],
        ["Internal review", "The team reviews your information."],
        ["Future opportunities", "Subject to a relevant requirement."],
      ]
    : expanded
      ? [
          ["Requirement", "Provide the details you have."],
          ["Identification", "Clarify the part and application."],
          ["Sourcing", "Review possible supply options."],
          ["Response", "Confirm specification and terms."],
          ["Supply", "Proceed only on agreed terms."],
        ]
      : steps;
  return (
    <ol
      className={
        "sourcing-process visual-process" +
        (items.length === 5 ? " five-steps" : "")
      }
    >
      {items.map(([title, text], i) => {
        const Icon = steps[Math.min(i, 3)][2];
        return (
          <li key={title}>
            <div className="process-marker">
              <span>{i + 1}</span>
              <Icon size={30} />
            </div>
            <h3>{title as string}</h3>
            <p>{text as string}</p>
          </li>
        );
      })}
    </ol>
  );
}
export function ClosingCTA({ category }: { category?: string }) {
  return (
    <section className="contact-section">
      <div>
        <h2>Start with the part you need.</h2>
        <p>Bring the reference, description or equipment details you have.</p>
      </div>
      <div>
        <a
          className="cps-action"
          href={findPartHref(category ? { category } : {})}
        >
          Find Your Part <ArrowUpRight size={20} />
        </a>
        <a href="/contact">
          Contact the sourcing team <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
