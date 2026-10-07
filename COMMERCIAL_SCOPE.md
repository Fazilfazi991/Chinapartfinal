Current continuation: ADMINISTRATION_AND_VISIBILITY.md and IMPLEMENTATION_COVERAGE.md record implemented office/account/assignment administration, policy-gated draft review/share/archive and public catalogue search/detail/pagination with labelled illustrations. Provider/commercial activation and remaining code gaps stay explicit. Earlier gap statements below are historical.

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

Current 4 October provider adapter implementation/coverage: CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md and PROVIDER_ACTIVATION.md supersede older remaining-code statements below. Provider auth/draft writes/reviewed linking/publication are implemented locally and disabled pending acceptance; final commerce remains incomplete.

# Commercial screen parity and exact blocked decisions

Current local milestone: CURRENT_HANDOFF.md and IMPLEMENTATION_COVERAGE.md supersede the earlier foundation assessment below. Catalogue/customer status/comments, CRM, order/tracking, invoice drafts/print, payment-history view, support/content/audit are now working synthetic local workflows. Production read/RLS templates exist; hosted mutation/auth/commerce implementation is still incomplete. Sample amounts/currency and draft statuses are not accepted commercial policy. Final issuance and external execution remain disabled.

4 October update: PROPOSAL_PENDING_CHECKLIST.md now records the supplied proposal extracts and approximate call timestamps. The broader catalogue, portal/status/comments, payments/invoices, CRM/orders, shipping/tracking, standard pages, hosting/SSL, SEO and analytics checklist remains pending. Enquiry-first presentation describes initial timing, not a reduction of written scope. The quotation-editor/revision/acceptance ideas below are optional architecture possibilities, not inferred contractual requirements.

Source verified: reference-demo/app/page.tsx at 2d7e7ae4ec84f08a039babd9b8dc0315886d6330. The source has one homepage and an RFQ modal. It contains no quotation form, order checkout, customer authentication, quote acceptance or shipment screen/model. Copy about receiving a quote and order/delivery is proposed workflow text, not implemented commercial behavior.

## Actual screens versus future scope

| Screen/action | Current route/behavior | Classification |
| --- | --- | --- |
| Homepage, brands/categories, product examples, appearance, FAQs | / with sample discovery and RFQ prefill | Implemented; business claims/content approval pending |
| Search/finder | Entered requirement carried into /request | Implemented RFQ entry; no searchable inventory |
| Request contact/equipment/part/upload/review | /request | Implemented; production provider activation gated |
| Request acknowledgement | Actual successful save reference within RFQ | Implemented; no claim request was sent before persistence |
| Staff login, inbox, details/status/notes/activity | /staff/login, /staff, /staff/[id] | Implemented provider integration; live acceptance pending |
| Private request attachment | /api/staff/attachments/[id] | Implemented; active office/admin access, clean scan required |
| Informational guides | /guides/quality-options, /guides/oem-number, /guides/request-information | Implemented; owner content review pending |
| Customer portal/track enquiry | /customer-access live barrier; /preview/customer/* local workflows | Functional synthetic portal/status/comments/order tracking; hosted auth/writes pending |
| Policies | /policies | Implemented pending-policy notice; legal text absent |
| Quotation draft/editor/revisions/issue | None in source or new app | Planned only; issuance disabled by absence of endpoint |
| Customer quote view/acceptance | None | Planned only; no identity/acceptance mechanism |
| Order drafts/payment history | /preview/admin/orders, /preview/customer/orders, */payments | Local internal drafts/history; provider read/schema prepared; no payment/stock/order execution |
| Order detail/delivery tracking | Local staff events and customer timeline | Implemented synthetic manual events; no carrier/booking promises |
| Invoice drafts/printing | /preview/admin/invoices, /preview/customer/invoices | Explicit synthetic minor-unit drafts; unknown tax; no final issuance |
| Staff assignment/pagination | Latest 50 visible requests; no assignment UI | Partial staff triage; rules needed |
| Bulk Excel/CSV | Not accepted/parsed | Disabled; PDF request list may be manually reviewed |
| Assistant/WhatsApp | Scripted demo assistant and existing external contact links | Preview/click-through; no CRM or messaging automation |

## Minimal quote decisions before implementing a draft model

Confirm that a quotation module is in the first release. Supply a redacted real quotation with required fields and whether one RFQ has multiple lines, suppliers or alternatives. Identify permitted draft/review/issue actors and the exact approval/revision sequence. Choose currency, quantity unit and decimal precision. Specify who confirms fitment/quality and what evidence is required. Approve expiry, freight/customs/tax treatment and warranty/returns terms before final issuance. The app must not fill these with invented defaults.

Internal RFQ review notes/status/audit are already implemented and are the generic workflow directly supported by the demo's review/identification steps. Adding a speculative quote-price schema or draft issuance screen without these minimum inputs would lock in unknown commercial rules, so no additional quote table was created.

## Minimal customer/order/tracking decisions

Generic internal draft models are now implemented locally, with validation, office/company checks, version locking/idempotency and audit. The questions below block production lifecycle/issuance, not continued local preview work. Quotation acceptance is not inferred as contractual scope.

Choose invited business accounts versus public signup and who may see a company's RFQs. Decide which statuses, notes and files are customer-visible; internal notes remain staff-only. Define quote acceptance actor/evidence and whether acceptance creates an order or requires staff approval. Confirm order states, fulfilment/partial-shipment rules, cancellation, carrier/source of tracking and payment scope. No public reference lookup is permitted as proof of ownership.

## Morning setup questions

1. Is the accepted first release RFQ plus staff triage, or must it include quotes/customer accounts/orders? Provide a redacted example quote if included.
2. Which dedicated Supabase/hosting project, region/domain and authorized staff offices may be used?
3. Is sharing unassigned RFQs with all active staff acceptable, and who assigns them?
4. Approve Turnstile, scanner/private file retention and current attachment limits, or disable uploads for launch.
5. Who approves company claims/contact details/privacy/terms, and who owns backups/support?

The separate foundation review target already exists with submissions disabled. This document does not enable commercial issuance, provider/account provisioning or real information. Current offline setup preparation is in SUPABASE_SETUP.md.
