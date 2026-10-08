# Multi-page client-review implementation — 7 October 2026

The owner’s full website brief and subsequent request to restore the original demo hero govern this extension. CPS branding and the enquiry-first strategy are retained. Final production approval has not been given.

## A. Actual routes

The reviewed public destinations are `/`, `/find-your-part`, `/categories`, the nine category pages below, `/resources`, the three resource pages below, `/suppliers`, `/suppliers/register`, `/technical-assistance`, `/customer-access`, `/contact` and the retained `/request` flow (22 reviewed pages). Major navigation uses actual routes. Existing policies, information pages, recovery, staff and private workspace routes remain available under their existing gates. `/supplier-registration` redirects to the new registration route; the three legacy `/guides/*` routes redirect to corresponding resources.

## B. Homepage

Restored the original industrial hero photograph, dark treatment, white/yellow headline and dedicated mobile composition at the owner’s request. Retained “We source the part you need,” Find Your Part, Send Your Enquiry, WhatsApp Sales and Technical Assistance. The page previews four categories and three resources; detailed directories, articles and supplier information live on their own pages. The identification feature, brand rail, four-step process, audience photograph, yellow technical section and short supplier flow give the homepage stronger visual rhythm.

## C. Images

Locally optimized WebP photographs illustrate vehicles, trucks, buses, equipment, cranes, agriculture, components, workshops and warehousing. The existing technical-inspection image supports identification. Full-width, split, editorial and thumbnail treatments vary by purpose. Twelve new shipping rasters carry provenance sidecars; `public/sourcing/provenance.json` records the ten sourced photographs and their free-source/license evidence. Restored hero assets retain their original provenance. Images are visibly illustrative review material, never evidence of CPS premises, stock or inventory.

## D. Categories

Nine current review routes: `/categories/passenger-vehicles`, `/categories/suv-4x4`, `/categories/trucks-trailers`, `/categories/buses-minibuses`, `/categories/heavy-equipment`, `/categories/cranes`, `/categories/construction-machinery`, `/categories/agricultural-machinery`, `/categories/industrial-components`. Each includes a relevant image, broad component families, identification guidance, resources and enquiry actions. Category CTAs and embedded identification forms retain the exact existing category value into the real RFQ. Engine, Transmission and Hydraulics shortcuts retain requirement context. Brand links retain the selected brand. The taxonomy and marks await final client approval.

## E. Resources

The editorial hub leads to `/resources/genuine-oe-oem`, `/resources/find-part-number` and `/resources/prepare-parts-enquiry`. Each has an image, focused readable guidance, a practical callout, related articles and enquiry CTA. Educational wording does not guarantee authenticity, fitment, availability or warranty; no client social posts were fabricated.

## F. Suppliers

`/suppliers` explains introduction, registration, Vendor ID, internal review and possible future requirements without promising orders. `/suppliers/register` embeds the existing functional form in a branded page with structure/privacy context. Persistence, Vendor ID, idempotency, retry, RLS and challenge behavior remain unchanged. Hosted review intake stays disabled.

## G. Technical assistance

`/technical-assistance` explains human component-identification assistance. Its CTA preloads technical-help context into `/find-your-part`, which uses the same real enquiry form. Sales remains the existing review WhatsApp destination. The page makes no certified engineering or compatibility promise.

## H. Customer portal

`/customer-access` now has a branded split layout and supporting component image. Existing approved-account Auth, recovery, session handling and company isolation are preserved. The review build honestly displays unavailable tracking while customer activation is off; public signup and reference-only access remain unavailable.

## I. Contact

`/contact` provides WhatsApp Sales, Send Your Enquiry and Technical Assistance. The current review number is retained. No address, hours or email was invented. One floating sales control remains; on narrow screens its existing header placement avoids form overlap.

## J. Verification

- Domain tests: **75 passed, 0 failed** (all previous 68 plus seven multi-page tests).
- TypeScript: `npm run typecheck` passed.
- Release: `npm run build` passed compilation, 34 static-page generation, privacy sanitization and standalone packaging. No private fixture/environment files were packaged.
- Existing feedback browser suite: **9 checks passed** with synthetic local data, including draft retention, failure/retry and supplier concurrency/idempotency behavior.
- Multi-page release browser suite: **9 flow checks and 132 route/width checks passed**, across 1440, 1024, 768, 430, 390 and 360px. Tested real routes, context retention, gated intake/login/uploads, legacy redirects, unknown-route 404s, noindex, menu state and WhatsApp URLs without sending messages. No unexpected browser errors were observed.
- Independent visual review inspected all 15 captures. Its material correction lifts the warehouse illustrative caption above the dark image wash. The design record is updated for the restored hero and active navigation.
- Source secret scan: no private environment values found. Three pre-existing detections are explicitly synthetic security-test fixtures, not issued credentials. Final staged diff is checked before commit.

Browser evidence is excluded from Git and release bundles. Hosted verification and deployment identifiers are recorded separately after committing the source.

## K. Screenshot paths

All 15 client-review screenshots are in `C:\Users\USER\Documents\Codex\China Parts Final\evidence\multipage-release\`:

1. `homepage-desktop.png`
2. `homepage-mobile.png`
3. `find-your-part-desktop.png`
4. `find-your-part-mobile.png`
5. `categories-desktop.png`
6. `categories-mobile.png`
7. `category-heavy-equipment-desktop.png`
8. `resources-desktop.png`
9. `resource-genuine-oe-oem-desktop.png`
10. `suppliers-desktop.png`
11. `supplier-registration-desktop.png`
12. `supplier-registration-mobile.png`
13. `technical-assistance-desktop.png`
14. `customer-login-desktop.png`
15. `contact-desktop.png`

The browser receipt and independent review are in the same directory. Hosted captures, when available, live in `evidence/multipage-hosted/`.

## L. Git / Vercel safety

The dedicated Vercel project is `chinapartfinal`. Inspection confirmed that a Git push to `main` previously created a Production deployment at the starting commit `863506466a4805b054a457d7eaa285b8fdb6c66e`. The safe implementation branch is therefore `codex/multipage-client-review`; `main` is not pushed as part of this task. Production aliases, final domains, account protection and production environment configuration are not changed.

## M. Deployment and remaining review status

The source is prepared for a client-review Preview from its committed review branch. Exact deployment state, SHA, share URL and hosted log results are supplied in the deployment receipt/final handoff after source publication. No source report is evidence of deployment completion by itself.

Existing Preview environment names only: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `CPS_BACKEND`, `CPS_WORKSPACE_READS_ENABLED`, `CPS_SUBMISSIONS_ENABLED`, `CPS_VENDOR_SUBMISSIONS_ENABLED`, `CPS_UPLOADS_ENABLED`, `CPS_LOCAL_TEST_BACKEND`, `CPS_PREVIEW_ENABLED`, `CPS_WORKSPACE_WRITES_ENABLED`, `CPS_CUSTOMER_AUTH_ENABLED`, `CPS_CUSTOMER_RECOVERY_ENABLED`, `CPS_PUBLICATION_ENABLED`, `CPS_PUBLIC_CATALOGUE_ENABLED`, `CPS_RFQ_LINKING_ENABLED`, `CPS_DOCUMENT_VISIBILITY_ENABLED`, `CPS_CATALOGUE_PHOTOS_ENABLED`, `CPS_SEO_ENABLED`. No new privileged credential is required for the gated public review.

Submissions, uploads/scanner-dependent attachments, catalogue, checkout, payments, AI chatbot, automated supplier routing, public signup and SEO indexing stay off. Existing Supabase schema, Auth/RLS and private Storage are unchanged. No real customer/vendor record or outgoing message is created.

Category master list, brand list/logos, WhatsApp ownership, public company/legal/contact wording, imagery, resource material and Arabic/Chinese translations remain client-review data. They have not been converted into production-approved content.

**This is a client-review Preview deployment only. Production deployment and final domain release were not performed.**
