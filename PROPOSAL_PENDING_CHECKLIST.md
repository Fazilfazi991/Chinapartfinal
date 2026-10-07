# Proposal and call reconciliation — 4 October 2026

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

Continue this production checkout; preserve the original demo. Remote main was checked read-only and remains `f42a7513f51f394c0fc500d43502ca701a3ce739`, matching the local base. The 3 October local preparation is intact. No new commit/push, publication, credential, paid service or hosted data change is authorized.

## Evidence and limits

Proposal: `China_Parts_Shop_Website_Proposal_compressed.pdf`, Private source references omitted; four scanned pages, 287,167 bytes. Library resolved the document and page-image references. Local materialization failed on Windows because the supported helper calls unavailable `os.setxattr`; uploaded-file fallback could not resolve it. Direct visual page inspection in this checkout is pending. The page references below use the parent's verified visual extraction and are not presented as this checkout's independent transcription.

Call references `S` and `L` are parent-supplied machine-translated notes from two recordings. Timestamps are approximate and speakers unassigned. No raw recordings or verified transcript are available in this checkout. The notes support initial presentation/timing; they do not cancel the broader written proposal. No accepted contract, written phasing, latest work plan or delivery timeline has been evidenced here.

Commercial proposal pricing and payment terms are omitted from this public source. They are not application configuration or authorization to spend.
## Full pending delivery checklist

Current implementation update: IMPLEMENTATION_COVERAGE.md and CURRENT_HANDOFF.md now record functional local catalogue/admin, multi-part customer requests/status/comments, CRM, order/tracking, invoice draft/print, payment-history, support/content/audit screens and provider-read/RLS preparation. The table below records the earlier foundation assessment before that milestone; use the current matrix for implemented versus missing code. None of the local work cancels proposed production deliverables or approves commercial terms.

Completed means the actual local capability exists. Partial does not mean production accepted; all backend activation/live acceptance gates still apply.

| Proposed item / source | Current implementation | Status / exact remaining work |
| --- | --- | --- |
| Responsive branded public site; approved brand/category assets (S 0:16–1:59; L 3:30–4:03) | Homepage, desktop/mobile navigation, themes, local licensed fonts, category cards and brand logos | Partial: owner content/contact approval and final presentation acceptance |
| Product catalogue (proposal p2) | Example preview code/assets; hidden in enquiry-first presentation | Missing production catalogue: approved product/brand/category data, searchable records, catalogue/admin workflows and display rules |
| Sparse catalogue/search/showroom hidden initially (S 3:19–3:31; L 0:54–1:55, 15:55–16:24) | Default-off catalogue preview; no search/finder/product-example sections rendered | Implemented locally; hiding preview is not cancellation/completion of full catalogue scope |
| Brand logos lead to enquiry (L 5:37–6:08) | Brand/category selection prefills RFQ requirement | Implemented locally; final assets/content still reviewed against supplied materials |
| RFQ: part number/name/photo/list/contact (proposal p2; L 16:51–18:45) | Five-step contact/equipment/part/upload/review; state retention, optional 24-hour draft, validation, idempotent save and provider-ready adapters | Partial: live backend/anti-abuse acceptance; PDF/image receipt exists, Excel/CSV parsing and multi-line requirements missing |
| Customer portal and status/comments (proposal p2; L 8:40–9:06) | Honest unavailable-state route; staff statuses/notes exist internally | Missing customer identity/ownership, portal screens, approved customer-visible statuses/comments/files; timing unresolved |
| Payment gateway (proposal p2; L 2:41–2:54) | No payment execution or credentials | Missing; provider, legal entity, currencies, payment trigger and timing require confirmation; no activation authorized |
| Invoices (proposal p2) | No invoice model/UI/PDF/numbering | Missing; required fields, numbering, tax/business entity rules and payment linkage require inputs |
| Admin / CRM (proposal p3) | Provider staff login, latest-50 office-scoped RFQ inbox/detail, internal notes/status, audit and private downloads | Partial: hosted acceptance, customer/company CRM, membership/office/assignment UI, filters/pagination and proposal-specific administration missing |
| Orders (proposal p3) | No order model or execution | Missing; creation trigger, fields, permissions and allowed statuses require confirmation; quote authoring/cart/acceptance are not inferred requirements |
| Shipping / tracking (proposal p3) | Customer tracking unavailable; no shipment/carrier integration | Missing; manual versus carrier tracking, customer-visible events, partial shipments and owner/source of updates unresolved |
| Communications / live chat or chatbot (proposal p3; L 14:02–14:42) | Existing WhatsApp/email click-through links and labelled scripted demo assistant | Partial: approved initial support channel, comments visibility, message ownership and integrations unresolved; AI automation discussed for later |
| Standard pages (proposal p4) | Home, guide routes, About/Contact/FAQ sections, pending-policy notice | Partial: exact required page list, approved company/contact/legal copy and independent pages where required |
| One year hosting and SSL (proposal p4) | Separate foundation review deployment already exists | Partial: no verified one-year service commitment, ownership/support/renewal arrangement or final domain/SSL acceptance |
| SEO (proposal p4) | Basic page metadata | Partial: approved keywords/content, canonical domain, sitemap/robots/structured data and search-console acceptance missing |
| Analytics (proposal p4) | No analytics provider or events | Missing; approved provider, event scope and privacy/consent configuration |
| Consistent WhatsApp contact (S 5:04–5:19, 5:39–5:55) | Shared existing +44 7520 688566 destination retained across links | Partial: parent must confirm the approved digits; no messages sent |
| Duplicate CTA in discussed section (L 12:23–13:10) | Floating WhatsApp and Talk to Expert retained | Pending: exact section/CTA identification; no global CTA removal inferred |
| English / Arabic / Chinese (L 11:51–12:23) | English only | Pending scope: languages, translation owner, RTL and publication timing not agreed |
| Vendor registration (L 9:37–10:29, 10:53–11:31) | No vendor form/admin record | Pending: simple registration/enquiry versus internal admin record; authenticated supplier portal expressly excluded from proposal |
| Automatic supplier routing (L 10:29–10:49) | None | Discussed for later, not promised as current delivery |

## Decisions that must not be silently filled in

Confirm initial release timing for payments, invoices, orders, portal and tracking while retaining all proposed deliverables. Supply the latest work plan referenced at L 4:17–4:23. Clarify whether the first chat option is WhatsApp, live chat or a simple assistant; AI timing is separate. Confirm vendor registration type, language scope and any change to Aftermarket wording (L 18:45–19:06 was uncertain). Identify the exact duplicate CTA section and approved WhatsApp digits.

Backend activation needs an approved dedicated Supabase project, staff/office access and unassigned-sharing rule, retention/backup owner, Turnstile and optional scanner, followed by live acceptance. Do not request secrets in chat. Final legal/content acceptance and authorization to publish remain separate gates.

Quotation authoring, revisions, acceptance and a cart/checkout are not added as contractual requirements: the supplied proposal extraction explicitly identifies status/comments, payments/invoices/orders/tracking. Existing architecture ideas in older briefs are proposals only and cannot expand this written checklist.

## Current safe implementation

Enquiry-first presentation preserves approved brand/category entry points and the existing contact actions. RFQ required fields retain the established name/country/category/quantity rules; equipment details remain optional. Either email or telephone is enough; either description or part number is enough. Validation now trims pasted values and rejects punctuation-only phone numbers. Malformed/expired/future-dated drafts cannot produce fractional steps or invalid reused submission IDs. Form errors focus the first invalid field; review editing is disabled during submission.

The original demo and hosted review deployment are unchanged. Test fixtures are synthetic, and the production disk adapter, payments and service activation remain disabled.

