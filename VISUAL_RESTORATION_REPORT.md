# Original demo visual restoration — source report

8 October 2026. Source branch: `codex/restore-original-demo-visuals`. Starting Final application: `48a072043ec4ae22244ba75fae206529e9358f7f`. Exact visual authority: `chinapartsshop` commit `2d7e7ae4ec84f08a039babd9b8dc0315886d6330`. This is a selective public-interface restoration, not a code rollback. Exact final Git/deployment receipts are supplied after push in the completion report and ignored evidence.

## A. Original Demo Audit

Both original and before-state homepages were rendered in isolated headless Chrome at 1440, 768 and 390px before editing. The reference repository stayed clean at its specified commit. [VISUAL_RESTORATION_AUDIT.md](VISUAL_RESTORATION_AUDIT.md) maps the original patterns to their current adaptations: two-level header, industrial scene and headline scale, overlapping finder, circular brand discovery, photo-overlay category mosaic, component imagery, charcoal process/editorial bands, yellow technical passage and substantial footer. No original layout bugs or duplicate conversions were intentionally carried over.

## B. Homepage

The large industrial hero retains “We source the part you need.” Find Your Part and Send Your Enquiry lead; sales and technical help are secondary links. A raised image-supported finder sits directly beneath the hero. Six visual category shortcuts, all nine review brands, three component-system shortcuts, the four-step sourcing process, three audience photo panels, three illustrated resource cards, technical identification and a four-stage supplier introduction restore the original page's visual richness and variety. Real multi-page navigation remains.

## C. What Was Not Restored

No fake inventory, SKU/stock badges, availability search, prices, cart, checkout, payments, AI chatbot, automated supplier routing, public signup, separate Upload Parts List block or duplicate RFQ/Quote actions. No false facility/dealership/brand-authorisation/statistical claims. Original synthetic backend/login/modal success logic was not copied.

## D. Client Feedback

The requirement is still the central transaction. Description, OEM/OE reference, brand, category and model carry into the actual enquiry. Category photo cards now go directly to a prefilled enquiry; separate guide links preserve genuine category pages. Brands also prefill the enquiry. Header entry captures a requirement instead of searching inventory. Quality remains Genuine/OE/OEM, with no Aftermarket/Replacement primary choice. Technical assistance retains human identification context in the main enquiry. Supplier Registration, private Vendor ID and honest acknowledged persistence remain. One floating WhatsApp uses the existing client-review number. Uploads, ingestion, customer activation, public catalogue, future commercial functions and SEO retain their existing gates.

## E. Images

No newly generated or newly sourced images were needed. The exact original industrial desktop/mobile scene, component plate, technical inspection and CPS/brand assets were reused alongside the existing optimized equipment, engine, truck, warehouse, workshop, crane, construction, bus, SUV and agriculture review photography. Hero: industrial yard; finder: mechanical components; categories: equipment contexts; component shortcuts: system imagery; audiences: inspection/fleet/warehouse; resources: engine/inspection/component detail; technical: inspection; suppliers: warehouse; inner pages: the same context-specific imagery.

All 29 shipping rasters passed the provenance scan. Origin metadata was added to 17 pre-existing PNGs; decoded image pixels were verified unchanged. Original source licensing/generation evidence for those inherited assets was not supplied, so final rights/selection remain pending. Images illustrate services and equipment contexts, not current stock, CPS premises or brand affiliation.

## F. Inner Pages

Shared rich industrial heroes and restored card/footer treatments apply to `/find-your-part`, `/categories`, all nine `/categories/[slug]` pages, `/resources`, all three `/resources/[slug]` guides, `/suppliers`, `/suppliers/register`, `/technical-assistance` and `/contact`. Category details gain component imagery and retain specification fields, related guides and category-specific enquiry actions. Guide pages retain narrow reading layouts with dark visual callouts. Registration has a numbered visual process and branded form. `/customer-access` gains a richer image and charcoal account panel while retaining the existing Auth gate. `/request` keeps its current secure standalone enquiry form with the restored header. Login notice contrast was corrected following independent review.

## G. Backend

No Supabase schema, migration, RLS, Auth, private Storage, vendor persistence/review, RFQ/replay, workspace or feature-gate logic changed. No real customer/vendor records or messages were created. Synthetic acceptance used an explicitly enabled, isolated local development backend; that backend remains blocked in production. Temporary reference snapshots are additionally excluded from TypeScript and release traces, and release privacy cleanup is covered by a fixture assertion.

## H. Tests

- `npm test`: 75 passed, 0 failed, including private reference-snapshot release exclusion.
- `npm run typecheck`: passed.
- `npm run build`: passed; 34 static pages generated; release privacy removed 13 references and packaged no fixtures/environment files.
- Current multi-page browser suite against the production build: 22 pages × six widths (1440, 1024, 768, 430, 390, 360) = 132 route/viewport checks, 12 flow/security/layout checks, 15 full-page screenshots; 0 page errors, 0 console errors, 0 unexpected failed requests. No overflow; single H1 and noindex verified.
- Current feedback browser suite: 9 passed, including draft retention, technical context, private supplier failure/retry/replay and mobile navigation; synthetic local records only.
- Independent fresh visual review: original composition recovered; one customer notice contrast fix requested and scored resolved in fresh desktop/mobile captures. Scoped final disposition: ship to owner review.
- Hookless detector: 45 advisory ramp/color/radius differences against the replaced system, no blocking findings; restored actual values are documented in DESIGN.md.

## I. Side-by-Side Evidence

Ignored local evidence directory: `C:\Users\USER\Documents\Codex\China Parts Final\evidence\visual-restoration`.

| Width | Original | Before | Restored | Comparison |
| --- | --- | --- | --- | --- |
| 1440 | `original-1440.png` | `before-1440.png` | `restored-1440.png` | `comparison-1440.png` |
| 390 | `original-390.png` | `before-390.png` | `restored-390.png` | `comparison-390.png` |
| 768 | `original-768.png` | `before-768.png` | `restored-768.png` | Individual tablet captures |

Matching `*-viewport.png` captures and desktop/mobile viewport comparisons support legible first-view inspection. Full inner-page evidence and browser receipts are in `pages/`. Screenshots remain outside the deployed bundle and Git source.

## J. Git

Push only `codex/restore-original-demo-visuals`, with commit message `Restore original China Parts demo visual direction with client feedback`. Exact final SHA is reported after commit. Do not merge to `main`; homepage visual approval is outstanding.

## K. Preview

Dedicated Vercel project: `chinapartfinal`. Deploy this branch's exact commit as a protected Preview and verify the hosted build. Existing Preview environment values and gates are reused; no new secret or environment configuration is required. Exact READY deployment URL, SHA, hosted browser result and log receipt are supplied in the completion report after deployment.

## L. Production

The visual restoration was not merged or promoted to Production. No Production aliases or final domain were changed. This is a client-review Preview deployment only. Production deployment and final domain release were not performed.

Category master list, brand list/logos/rights, WhatsApp ownership, public company/legal/contact wording, imagery, resource material and Arabic/Chinese translations remain review data awaiting final client confirmation. This restoration does not approve them for production.
