# First-demo client feedback implementation — 7 October 2026

Authoritative workspace: `C:\Users\USER\Documents\Codex\China Parts Final`. Remote: `Fazilfazi991/Chinapartfinal`, branch `main`. Baseline: `b1986851642163bc75c6e2f32245c757d45ed33e`. The original source, reference demo, LMT and Fusion were not edited. This report supersedes historical public-copy and first-demo assumptions; the Supabase activation report remains the historical provider receipt.

## A. Corrections

The public experience now starts with a sourcing requirement. Removed the public store composition, sparse product presentation, stock/search implication, theme toggles, five-tier quality marketing, scripted chatbot, duplicate RFQ/upload routes and unsupported commercial/geographical claims. Catalogue, publication, media, pagination, CRM, recovery, internal drafts and integration modules remain.

## B. Homepage hierarchy

Hero with Find Your Part / Send Your Enquiry; secondary WhatsApp Sales and distinct technical help; categories; Find Your Part capture; brands; connected How It Works; Workshop & Garage / Fleet Operations / Procurement; Resources; technical assistance; supplier registration; sales/contact; footer. CPS identity, local Manrope fonts and existing logo are retained. The existing suitable part-inspection image is labelled illustrative; it makes no facility, inventory or product-ownership claim. The old industrial yard collage and catalogue sprite are no longer used by the homepage.

## C. Catalogue hidden, architecture retained

No public product grid, inventory search, price, Buy Now, cart or checkout. Existing `/catalogue` routes still require the reviewed publication/public-catalogue gates. Brand routes default to enquiries; future catalogue routing needs both the central brand-routing setting and the public-catalogue feature gate. No fake catalogue lines were created.

Future strategy: gather actual requirements for approximately 3–6 months, review useful fast-moving demand, aim for meaningful coverage (roughly 1,000 useful lines is strategic guidance, not a seeding target), then separately commission catalogue search, pricing and purchasing.

## D. Find Your Part

Description, OEM/OE/part number, brand, vehicle/equipment category and model/equipment details enter the same `/request` flow. Find Part transfers bounded values to their real fields. The entry query is consumed, preventing a reload from overwriting later edits. Requirement continuity uses temporary session storage; full contact drafts remain opt-in for 24 hours. Attachments stay in memory and must be reselected after reload. Photo/list capability belongs in the same enquiry; the upload step accurately says whether uploads are accepted. No file selection or clean-scan success is invented when uploads are gated.

## E. Enquiry contact, review and acknowledgment

Preserved the existing five-step validation/back/next/review/persistence architecture. Name and country plus email **or** phone are required. Description **or** OEM number suffices; equipment details may be unknown. Brand/category entry overrides its corresponding field while retaining opted-in contact details. Legacy quality choices in restored drafts become Please advise; backend historical compatibility remains. Saving, failure, retained draft and acknowledged reference states stay distinct. Success requires storage acknowledgment; retries retain their submission key.

## F. Review taxonomy and brands

Categories: Passenger vehicles; SUV & 4×4; Trucks & trailers; Buses & minibuses; Heavy equipment; Cranes; Construction machinery; Agricultural machinery; Industrial components. The main form also offers Other. Part-system shortcuts: Engine, Transmission, Hydraulics. These extend the existing review set, not an approved exhaustive taxonomy.

Brands/assets: Dongfeng (`dongfeng.png`), SINOTRUK (`sinotruk.png`), FOTON (`foton.svg`), JAC Motors (`jac.png`), Chery (`chery.png`), Geely (`geely.png`), XCMG (`xcmg.svg`), ZOOMLION (`zoomlion.svg`), SANY (`sany.svg`). All are existing project assets. Clicks prefill Brand. No final authorization or manufacturer affiliation is claimed. Additional brands/logos and final category/subcategory lists await the client.

## G. Sales, technical assistance and chatbot

Owner confirmed **+44 7520 688566 for review**. All sales links share the same helper and approved destination. Only recognized public brand/category context can enter WhatsApp text; contact data, private notes and CRM records are excluded. Exactly one floating WhatsApp action appears on public routes; it becomes a compact accessible control on mobile. Staff/workspace/preview routes have no public floating sales control. No WhatsApp message was sent.

Technical help starts the main form with a persisted technical-assistance description and a distinct heading. It does not use a separate sales WhatsApp destination or claim engineering certification. The old scripted chat demo was removed from the public page. No AI-service backend existed to delete; its historical demo remains in Git. A future actual chatbot is deferred.

## H. Supplier registration and staff review

Separate form: company, contact person, mobile, email, country/location, products, brands, categories, remarks. Company/contact/country/products plus email or mobile are required. No supplier account, public lookup, automatic categorization or enquiry broadcast is created.

CLI-generated migration: `20261007152154_china_parts_vendors.sql`. Only this eighth migration was applied through the verified dedicated dashboard with an atomic history guard requiring the prior seventh version. Prior seven files were unchanged and were not replayed. Hosted project: `cjregchcuxjcqazokqid`, China Parts Final, Sydney, existing Free plan. Tables now total 27 with RLS; private buckets remain two.

`cps_vendors` stores canonical company/contact/capability data, digest, internal status/version/note, optional office scope and timestamps. `cps_vendor_audit` records registration and reviews. The business reference is generated as **CPS-VEN-000001** style, separate from the UUID primary key; padding grows beyond six digits without truncation. It is stable on identical retries, not a login credential or uniqueness promise for company names. Local tests use explicitly local UUID-based references, not hosted vendor IDs.

Production ingestion requires `CPS_VENDOR_SUBMISSIONS_ENABLED=true`, real persistence, an exact approved site origin and Turnstile configured/verified for `vendor_registration`. Missing prerequisites return 503 without a reference. Origin/cross-site, bounded streamed body, strict fields, honeypot, validation, idempotency and safe provider-error handling are enforced. The database serializes new intake and allows at most **60 new registrations per minute globally**; unchanged retries do not consume capacity. This is an aggregate overload safeguard, not per-user/IP fairness. Hosting-specific edge rate rules remain deployment acceptance work. No anonymous/authenticated INSERT/UPDATE/DELETE or privileged RPC execution is granted.

Statuses: New, Under review, Approved, Inactive — internal only. `/staff/vendors` lists scoped ID/company/contact/products/status/date, with private detail and review. Active administrators see all, including unassigned registrations. Agents see only explicitly office-assigned suppliers. Customers see none. Server actions verify session, active membership, origin, write readiness and user-scoped visibility; the service-only review RPC independently rechecks membership/office, locks the row, checks version and writes the audit atomically. There is no public role-metadata shortcut. Office assignment remains administrator-controlled data administration; automated routing is deferred.

## I. Customer portal

Existing Supabase Auth/invited company accounts and company RLS are preserved. Customer references and vendor IDs do not grant access. Public account signup remains disabled; no real administrator or supplier account was created. Default review configuration keeps customer Auth activation gated. A temporary loopback acceptance server verified the real invited customer login and denial of supplier staff records. It does not alter the owner's environment flags or activate production.

## J. Resources, quality and locales

Guides explain Genuine (brand packaging/channel), OE (supplier/manufacturer relationship) and context-dependent OEM terminology without guaranteeing authenticity, compatibility or warranty. Public quality choices are Genuine / OE / OEM plus Please advise. Guidance covers exact part-number suffixes, equipment/nameplate details, usable photos, list formatting, sourcing verification and common mistakes. No LinkedIn post was fabricated.

English shared navigation/action copy has an authoritative dictionary and fallback helper. Arabic/Chinese are planned only; no untranslated language selector or automatic translation is presented. Approved dictionaries, RTL adaptation and language QA are later acceptance work.

## K. Verification

Receipts are ignored under `evidence/`. All checks use synthetic records and isolated headless browsers.

- **68 unit/domain tests passed**, zero failures. Final standalone TypeScript check and optimized production build passed; release packaging excluded private data, environment files, reference sources, evidence and design-tool state.
- PostgreSQL **17.11: 83 checks passed** across RFQ (10), workspace reads (10), workspace writes (14), provider integration (10), administration (11), catalogue photos (8), pagination/recovery (8) and new supplier checks (12). These are local database acceptance results, not hosted Supabase results.
- Isolated browser regression: RFQ **22**, workspace **15**, client feedback **9**, navigation **9**, standalone release **10** checks passed. Draft continuity, correct entry fields, contact alternatives, honest failures, acknowledged retries, supplier concurrency and protected routes were exercised. Desktop 1440, tablet 768 and mobile 390/360 px checks reported no document overflow; final sixteen production-build captures were regenerated after the visual fixes. Reduced-motion users receive immediate anchor navigation, confirmed from the browser's computed style at all three navigation viewports.
- Actual dedicated Supabase SDK: original **23** and supplier **11** checks passed. Hosted browser: original **15** (11 initial, 2 review, 2 after restart) and supplier **4** checks passed. Actual staff status/version/audit, invited customer Auth, immediate revocation, office/company isolation and unassigned supplier admin-only scope were verified.
- Refreshed hosted advisors: security **0 errors / 0 warnings / 3 informational** deny-client RLS notices; performance **0 errors / 0 warnings / 10 informational** unused-index notices. Existing deny-client tables and acceptance-empty indexes were retained. Leaked-password protection remains the previously documented Pro-only limitation; no paid upgrade was made.
- Only owned disposable records were removed: three suppliers and their audits, five Auth users, two RFQs and related test records/private marker. Final independent service inventory verified **all 27 application tables empty, 0 Auth users, 2 private buckets and 0 stored objects**. Ignored test password/cookie-state files were removed. The seven earlier migration blobs and the applied eighth migration SHA-256 are unchanged.
- One detector pass returned `[]`. The fresh visual reviewer found three issues; the single correction batch restored white-logo visibility, moved mobile WhatsApp into the clear header space and removed a redundant customer-login label. Matching production captures received **ship: all three findings resolved**. This is a visual finish verdict, not production activation approval.
- The subsequent fresh documenter recorded actual visual tokens and components in `DESIGN.md` and `.impeccable/design.json`. Its extraction also identified the missing reduced-motion scroll override; that small accessibility fix was rebuilt and browser-verified without reopening visual composition.

Source/build privacy audit passed: **244 candidate files**, **0 private files eligible for staging**, **0 actual server-secret matches** in source or the **2,503 scanned build files**. Gitleaks source-directory scan reported no leaks. The staged diff also receives a redacted Gitleaks scan before commit; its result and final Git receipts stay in ignored evidence.

Public production Turnstile HTTP ingestion and scanner-approved uploads remain untested because their providers are unconfigured; no bypass was used. Supplier public ingestion and all other future capabilities remain independently gated.

## L. Client-review screenshots

Absolute local directory: `C:\Users\USER\Documents\Codex\China Parts Final\evidence\client-feedback`. Production-build captures: desktop-homepage, desktop-hero, desktop-find-your-part, desktop-enquiry, desktop-supplier-registration, desktop-customer-login, desktop-brands, desktop-how-it-works, desktop-resources, desktop-technical-assistance; mobile-homepage, mobile-hero, mobile-find-your-part, mobile-whatsapp-contact, mobile-supplier-registration, mobile-360-hero (all `.png`). Additional synthetic hosted staff proof: hosted-supplier-review-desktop.png. Database receipt: supabase-supplier-migration.png. Refreshed advisors: supabase-security-advisor.png and supabase-performance-advisor.png. Capture harness is `tests/feedback-captures.cjs`. Screenshots are local evidence, not published website assets or customer data.

## M. Git delivery

Safe source, migration and documentation changes are authorized for `origin/main`. Commit: **Implement first-demo client feedback for enquiry-first China Parts site**. Exact post-push local/remote SHA and clean-tree receipt are generated in ignored `evidence/feedback-git-verification.json` and included in the completion response; a commit cannot embed its own final hash.

## N. Awaiting Client Data

Final category/subcategory master list; approved brand list, correct original logos and permissions; final production sales contact/ownership approval; company legal name, address, legal/privacy/retention wording and supply terms; actual business/part imagery; original LinkedIn/resource material; approved Arabic/Chinese translations; real requirement data to inform the later catalogue. No address, price, fitment, warranty, years-in-business, customer, stock, authorization or delivery guarantee was invented.

## O. Deferred

Public inventory, ordering, cart/checkout/payments/final commercial issuance; automated supplier categorization/distribution/broadcast; actual AI chatbot; complete brand catalogue routing; production uploads/scanner; production public-submission acceptance/Turnstile and edge limits; SMTP/invitation/recovery acceptance; translations and RTL; production hosting/origin/SEO/domain/DNS/Vercel environment changes. Existing architecture remains gated. No paid resource, real customer-data mutation or outgoing customer/supplier message occurred.

## P. Deployment

**Production deployment was not performed.**
