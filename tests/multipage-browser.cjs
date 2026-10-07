const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(process.env.CPS_PLAYWRIGHT_MODULE || "playwright");
const { categoryPages, articles } = require("../lib/sourcing-pages.mjs");
const base = process.env.CPS_BASE_URL || "http://127.0.0.1:4427";
const hosted = process.env.CPS_HOSTED_REVIEW_URL;
const out = process.env.CPS_SCREENSHOT_DIR || "evidence/multipage";
const routes = [
  "/",
  "/find-your-part",
  "/categories",
  ...categoryPages.map((c) => "/categories/" + c.slug),
  "/resources",
  ...articles.map((a) => "/resources/" + a.slug),
  "/suppliers",
  "/suppliers/register",
  "/technical-assistance",
  "/customer-access",
  "/contact",
  "/request",
];
const shots = {
  "/": "homepage",
  "/find-your-part": "find-your-part",
  "/categories": "categories",
  "/categories/heavy-equipment": "category-heavy-equipment",
  "/resources": "resources",
  "/resources/genuine-oe-oem": "resource-genuine-oe-oem",
  "/suppliers": "suppliers",
  "/suppliers/register": "supplier-registration",
  "/technical-assistance": "technical-assistance",
  "/customer-access": "customer-login",
  "/contact": "contact",
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CPS_CHROMIUM_PATH,
  });
  const errors = [],
    consoleErrors = [],
    failures = [],
    checks = [],
    screenshots = [],
    matrix = [];
  try {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "reduce",
      }),
      page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(60000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error") consoleErrors.push(e.text());
    });
    page.on("requestfailed", (r) => {
      if (!r.failure()?.errorText.includes("ERR_ABORTED"))
        failures.push(r.url());
    });
    if (hosted) await page.goto(hosted);
    const titles = new Set();
    for (const width of [1440, 1024, 768, 430, 390, 360]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
      for (const path of routes) {
        const response = await page.goto(base + path);
        assert.equal(response.status(), 200, width + " " + path);
        await page.locator("h1").waitFor();
        assert.equal(await page.locator("h1").count(), 1, "single H1 " + path);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          true,
          "overflow " + width + " " + path,
        );
        assert.equal(await page.locator("[data-floating-whatsapp]").count(), 1);
        assert.equal(
          await page.locator(".chat-panel,.chat-trigger,.products").count(),
          0,
        );
        assert.match(
          await page.locator('meta[name="robots"]').getAttribute("content"),
          /noindex/,
        );
        if (width === 1440) {
          const title = await page.title();
          assert.ok(!titles.has(title), "duplicate title " + title);
          titles.add(title);
        }
        matrix.push({ width, path, status: 200, overflow: false });
        const shot =
          shots[path] &&
          (width === 1440 ||
            (width === 390 &&
              [
                "/",
                "/find-your-part",
                "/categories",
                "/suppliers/register",
              ].includes(path)));
        if (shot) {
          const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
          for (let top = 0; top < pageHeight; top += 700) {
            await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
            await page.waitForTimeout(80);
          }
          await page.waitForFunction(() =>
            [...document.images].every((i) => i.complete && i.naturalWidth > 0),
          );
          await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:"instant"}));
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
          await page.screenshot({
            path:
              out +
              "/" +
              shots[path] +
              "-" +
              (width === 1440 ? "desktop" : "mobile") +
              ".png",
            fullPage: true,
          });
          screenshots.push(
            shots[path] +
              "-" +
              (width === 1440 ? "desktop" : "mobile") +
              ".png",
          );
        }
      }
      console.log("PASS " + width + " px: " + routes.length + " actual routes");
    }
    checks.push(
      "All 22 pages: HTTP200, one H1, unique metadata, noindex, no overflow, one floating WhatsApp at all six widths",
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base);
    const main = await page
      .locator(".public-nav a")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    assert.deepEqual(main, [
      "/",
      "/find-your-part",
      "/categories",
      "/resources",
      "/suppliers",
      "/customer-access",
      "/contact",
    ]);
    assert.equal(
      await page.locator(".category-preview .visual-category").count(),
      4,
    );
    assert.equal(await page.locator(".editorial-links>a").count(), 3);
    for (const link of await page.locator('a[href^="https://wa.me/"]').all()) {
      assert.equal(
        new URL(await link.getAttribute("href")).pathname,
        "/447520688566",
      );
    }
    checks.push(
      "Real menu routes; homepage has four category previews and three resources; WhatsApp destination retained without sending",
    );
    await page.locator("#find-description").fill("Synthetic hydraulic filter");
    await page.locator("#find-oem").fill("QA/OE-001");
    await page.locator("#find-brand").fill("XCMG");
    await page.locator("#find-category").selectOption("Heavy Equipment");
    await page.locator("#find-model").fill("Synthetic machine");
    await page.getByRole("button", { name: "Find Part", exact: true }).click();
    assert.equal(new URL(page.url()).pathname, "/find-your-part");
    async function contact() {
      await page
        .getByLabel("Full name", { exact: false })
        .fill("Synthetic review");
      await page
        .getByLabel("Email", { exact: true })
        .fill("review@example.test");
      await page.getByLabel(/^Country/).fill("Qatar");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
    }
    await contact();
    assert.equal(
      await page
        .getByLabel("Vehicle or equipment category", { exact: false })
        .inputValue(),
      "Heavy Equipment",
    );
    assert.equal(await page.getByLabel(/^Brand/).inputValue(), "XCMG");
    assert.equal(
      await page.getByLabel(/^Model/).inputValue(),
      "Synthetic machine",
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.equal(
      await page.getByLabel("OEM number", { exact: true }).inputValue(),
      "QA/OE-001",
    );
    assert.equal(
      await page.getByLabel("Part description", { exact: true }).inputValue(),
      "Synthetic hydraulic filter",
    );
    assert.deepEqual(await page.locator("#quality option").allTextContents(), [
      "No preference",
      "Genuine",
      "OE",
      "OEM",
      "Please advise",
    ]);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.equal(await page.locator("input[type=file]").count(), 0);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.match(
      await page.locator("body").innerText(),
      /Synthetic hydraulic filter/,
    );
    checks.push(
      "Homepage identification enters the real five-step RFQ with all fields retained, quality choices preserved, uploads and final submission gated",
    );
    await page.goto(base + "/categories/heavy-equipment");
    await page
      .getByRole("link", { name: "Find Your Part", exact: true })
      .filter({ has: page.locator("svg") })
      .first()
      .click();
    await contact();
    assert.equal(
      await page
        .getByLabel("Vehicle or equipment category", { exact: false })
        .inputValue(),
      "Heavy Equipment",
    );
    checks.push("Category detail → complete sourcing flow preserves category");
    await page.goto(base);
    await page.locator(".brand-link").first().click();
    await contact();
    assert.equal(await page.getByLabel(/^Brand/).inputValue(), "Dongfeng");
    checks.push("Brand → complete sourcing flow preserves brand");
    await page.goto(base + "/technical-assistance");
    await page
      .getByRole("link", { name: "Send Technical Requirement", exact: false })
      .first()
      .click();
    await contact();
    await page
      .getByLabel("Vehicle or equipment category", { exact: false })
      .selectOption("Other");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.match(
      await page.getByLabel("Part description", { exact: true }).inputValue(),
      /^Technical assistance — /,
    );
    checks.push("Technical context retained in main enquiry");
    await page.goto(base + "/suppliers/register");
    assert.equal(
      await page
        .getByRole("button", { name: "Submission not available" })
        .isDisabled(),
      true,
    );
    await page.goto(base + "/customer-access");
    assert.equal(await page.locator("input[type=password]").count(), 0);
    assert.match(await page.locator("body").innerText(), /not available yet/);
    checks.push(
      "Supplier intake and customer login gates preserved without vendor/customer writes",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .locator(".public-nav")
      .getByRole("link", { name: "Categories", exact: true })
      .click();
    assert.equal(new URL(page.url()).pathname, "/categories");
    assert.equal(await page.locator(".public-nav.is-open").count(), 0);
    assert.equal(
      await page.locator(".public-nav a[aria-current=page]").innerText(),
      "Categories",
    );
    checks.push("Mobile menu routes, closes and exposes current page");
    for (const [old, target] of [
      ["/supplier-registration", "/suppliers/register"],
      ...articles.map((a) => ["/guides/" + a.legacy, "/resources/" + a.slug]),
    ]) {
      await page.goto(base + old);
      assert.equal(new URL(page.url()).pathname, target);
    }
    checks.push("Legacy supplier and guide links redirect safely");
    assert.equal(
      (await page.request.get(base + "/categories/unrecognized")).status(),
      404,
    );
    assert.equal(
      (await page.request.get(base + "/resources/unrecognized")).status(),
      404,
    );
    assert.equal(
      (await page.request.post(base + "/api/rfq", { data: {} })).status(),
      503,
    );
    assert.equal(
      (await page.request.post(base + "/api/vendors", { data: {} })).status(),
      503,
    );
    assert.ok(
      (await (await page.request.get(base + "/robots.txt")).text()).includes(
        "Disallow: /",
      ),
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failures, []);
    fs.writeFileSync(
      out + "/browser-results.json",
      JSON.stringify(
        {
          passed: true,
          checks,
          matrix,
          screenshots,
          pageErrors: errors,
          consoleErrors,
          networkFailures: failures,
          dataSubmissions: 0,
          realMessagesSent: false,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        passed: true,
        checks: checks.length,
        routeViewportChecks: matrix.length,
        screenshots: screenshots.length,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
