import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  SiteShell,
  SourcingImage,
  ArticleLinks,
  ClosingCTA,
  pageMetadata,
} from "../../../components/SourcingSite";
import { articles } from "../../../lib/sourcing-pages.mjs";
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return a ? pageMetadata(a.title, a.summary, "/resources/" + slug) : {};
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return (
    <SiteShell>
      <article className="resource-article">
        <header className="article-header">
          <a href="/resources">
            Resources <ArrowRight size={16} />
          </a>
          <h1>{a.title}</h1>
          <p>{a.summary}</p>
        </header>
        <SourcingImage
          src={a.image}
          alt={"Illustrative identification context for " + a.title}
          priority
        />
        <div className="article-body">
          {a.sections.map(([title, text]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
          <aside className="article-callout">
            <h3>
              {slug === "genuine-oe-oem"
                ? "Confirm the complete offer."
                : "A useful identification checklist."}
            </h3>
            <ol>
              {(slug === "genuine-oe-oem"
                ? [
                    "Exact item & reference",
                    "Manufacturer & documentation",
                    "Application & agreed terms",
                  ]
                : [
                    "Read the reference",
                    "Add equipment context",
                    "Describe the requirement",
                  ]
              ).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
            <p>
              {slug === "genuine-oe-oem"
                ? "A label alone is not an authenticity or compatibility guarantee."
                : "Do not rely on appearance alone. The sourcing team reviews identification details."}
            </p>
          </aside>
          <a className="cps-action" href="/find-your-part">
            Find Your Part <ArrowRight size={20} />
          </a>
        </div>
      </article>
      <section className="home-section">
        <h2 className="section-heading">Continue reading.</h2>
        <ArticleLinks exclude={slug} />
      </section>
      <ClosingCTA />
    </SiteShell>
  );
}
