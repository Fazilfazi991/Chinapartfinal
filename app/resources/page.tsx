import {
  SiteShell,
  PageHero,
  ArticleLinks,
  ClosingCTA,
  pageMetadata,
} from "../../components/SourcingSite";
export const metadata = pageMetadata(
  "Resources",
  "Practical guidance for identification and preparing a useful parts enquiry.",
  "/resources",
);
export default function Resources() {
  return (
    <SiteShell>
      <PageHero
        title="Better details. A clearer enquiry."
        text="Practical guidance for reading part references, understanding quality terms and preparing a useful sourcing requirement."
        image="/sourcing/workshop.webp"
        alt="Illustrative workshop component"
      />
      <section className="home-section">
        <h2 className="section-heading">
          From the reference to the requirement.
        </h2>
        <ArticleLinks />
        <p className="section-note">
          Educational review material. These guides do not establish fitment,
          authenticity or stock availability for an individual part.
        </p>
      </section>
      <ClosingCTA />
    </SiteShell>
  );
}
