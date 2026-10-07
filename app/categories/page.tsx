import {
  SiteShell,
  PageHero,
  CategoryGrid,
  ClosingCTA,
  pageMetadata,
} from "../../components/SourcingSite";
import { subcategories } from "../../lib/sourcing-config.mjs";
import { findPartHref } from "../../lib/sourcing-pages.mjs";
export const metadata = pageMetadata(
  "Parts Categories",
  "Explore vehicle, equipment and industrial sourcing categories.",
  "/categories",
);
export default function Categories() {
  return (
    <SiteShell>
      <PageHero
        title="A starting point for every requirement."
        text="Explore the equipment family, then tell us about the component. These categories illustrate sourcing contexts, not stock availability."
        image="/sourcing/equipment.webp"
        alt="Illustrative earthmoving equipment"
      />
      <section className="home-section">
        <div className="section-inline">
          <h2>Explore by vehicle or equipment.</h2>
          <p>
            Current client-review category selection. The final master list
            awaits approval.
          </p>
        </div>
        <CategoryGrid />
        <div className="part-system-links">
          <h3>Know the part system?</h3>
          {subcategories.map((s) => (
            <a
              className="cps-outline"
              href={findPartHref({ description: s })}
              key={s}
            >
              {s}
            </a>
          ))}
        </div>
      </section>
      <ClosingCTA />
    </SiteShell>
  );
}
