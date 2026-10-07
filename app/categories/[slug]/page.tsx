import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import FindPart from "../../../components/FindPart";
import {
  SiteShell,
  PageHero,
  ArticleLinks,
  ClosingCTA,
  pageMetadata,
} from "../../../components/SourcingSite";
import { categoryPages, findPartHref } from "../../../lib/sourcing-pages.mjs";
import { salesHref } from "../../../lib/sourcing-config.mjs";
export function generateStaticParams() {
  return categoryPages.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categoryPages.find((c) => c.slug === slug);
  return c
    ? pageMetadata(
        c.label,
        c.detail + " parts sourcing enquiries.",
        "/categories/" + slug,
      )
    : {};
}
export default async function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categoryPages.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <SiteShell>
      <PageHero
        title={c.label + " parts, sourced to your requirement."}
        text={
          c.detail +
          ". Bring the application details and component reference. The sourcing team reviews each requirement individually."
        }
        image={c.image}
        alt={c.label + " illustrative equipment"}
      >
        <a className="cps-action" href={findPartHref({ category: c.value })}>
          Find Your Part <ArrowUpRight size={20} />
        </a>
      </PageHero>
      <section className="home-section category-families">
        <h2>What we can help source.</h2>
        <ul>
          {c.families.map((f) => (
            <li key={f}>
              <h3>{f}</h3>
              <p>
                Share the part reference and equipment application for review.
              </p>
            </li>
          ))}
        </ul>
        <p className="section-note">
          Component families describe enquiry areas. Availability, compatibility
          and supply terms are confirmed for the specific requirement.
        </p>
      </section>
      <section className="home-section find-section">
        <div className="section-lead">
          <h2>Find Your Part</h2>
          <p>
            Your category is already selected. Add the details you know and
            continue into the complete enquiry.
          </p>
        </div>
        <FindPart
          initialData={{ category: c.value }}
          destination="/find-your-part"
        />
      </section>
      <section className="home-section details-help">
        <div>
          <h2>The details that help us identify it.</h2>
          <p>
            More context makes it easier to distinguish the right component from
            a similar-looking part.
          </p>
        </div>
        <ul>
          <li>Make or brand and model</li>
          <li>Part reference, serial or chassis details</li>
          <li>Description and required quantity</li>
          <li>A readable photo when secure uploads are available</li>
        </ul>
      </section>
      <section className="home-section">
        <h2 className="section-heading">Useful before your enquiry.</h2>
        <ArticleLinks />
      </section>
      <section className="home-section category-contact">
        <a className="cps-action" href={findPartHref({ category: c.value })}>
          Send Enquiry <ArrowUpRight size={20} />
        </a>
        <a
          className="cps-outline"
          href={salesHref({ category: c.value })}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp Sales
        </a>
        <a href="/categories">All categories</a>
      </section>
      <ClosingCTA category={c.value} />
    </SiteShell>
  );
}
