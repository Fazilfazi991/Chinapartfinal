import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { english } from "../lib/locales/en.mjs";
import {
  categoryPages,
  articles,
  findPartHref,
  mainRoutes,
} from "../lib/sourcing-pages.mjs";
import { entryData, categories, brands } from "../lib/sourcing-config.mjs";
test("main menu destinations are distinct actual pages with no homepage anchors", async () => {
  assert.deepEqual(
    english.navigation.map((row) => row[1]),
    mainRoutes,
  );
  for (const href of mainRoutes) {
    assert.ok(!href.includes("#"));
    await access(
      new URL(
        "../app" + (href === "/" ? "" : href) + "/page.tsx",
        import.meta.url,
      ),
    );
  }
});
test("nine category routes preserve the current reviewed taxonomy without duplicate slugs", () => {
  assert.equal(categoryPages.length, 9);
  assert.equal(new Set(categoryPages.map((c) => c.slug)).size, 9);
  assert.deepEqual(
    categoryPages.map((c) => c.value),
    categories.map((c) => c.value),
  );
});
test("all category illustrations are locally shipped and have source evidence", async () => {
  const provenance = JSON.parse(
    await readFile(
      new URL("../public/sourcing/provenance.json", import.meta.url),
      "utf8",
    ),
  );
  for (const c of categoryPages) {
    await access(new URL("../public" + c.image, import.meta.url));
    assert.ok(
      provenance.some(
        (p) =>
          c.image.endsWith(p.file) &&
          p.source.startsWith("https://unsplash.com/photos/"),
      ),
    );
  }
});
test("category and brand transitions retain exact enquiry context", () => {
  for (const c of categoryPages) {
    const href = findPartHref({ category: c.value });
    assert.ok(href.startsWith("/find-your-part?"));
    assert.equal(
      entryData(new URL(href, "https://review.example").search).category,
      c.value,
    );
  }
  for (const b of brands)
    assert.equal(
      entryData(
        new URL(findPartHref({ brand: b.name }), "https://review.example")
          .search,
      ).brand,
      b.name,
    );
});
test("Find Your Part retains full identification and technical context without contact injection", () => {
  const data = {
    description: "Synthetic filter",
    oem: "QA/OE-A",
    brand: "XCMG",
    category: "Heavy Equipment",
    model: "QA model",
    purpose: "technical",
    email: "private@example.test",
  };
  const restored = entryData(
    new URL(findPartHref(data), "https://review.example").search,
  );
  assert.equal(restored.oem, data.oem);
  assert.equal(restored.model, data.model);
  assert.match(
    restored.description,
    /^Technical assistance — Synthetic filter$/,
  );
  assert.equal(restored.email, undefined);
});
test("resource destinations provide three focused articles and stable legacy mappings", async () => {
  assert.deepEqual(
    articles.map((a) => a.slug),
    ["genuine-oe-oem", "find-part-number", "prepare-parts-enquiry"],
  );
  assert.equal(new Set(articles.map((a) => a.legacy)).size, 3);
  for (const article of articles) {
    assert.ok(article.sections.length >= 3);
    await access(new URL("../public" + article.image, import.meta.url));
  }
});
test("supplier registration and technical assistance have separate actual destinations", async () => {
  for (const route of [
    "/suppliers/register",
    "/technical-assistance",
    "/contact",
  ])
    await access(new URL("../app" + route + "/page.tsx", import.meta.url));
});
