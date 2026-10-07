# China Parts Shop — pagination/recovery closeout, 5 October 2026

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

Source folder: `C:\Users\USER\Documents\Codex\2026-10-01\task-2\China Parts Shop Production`.

Original reference: https://github.com/Fazilfazi991/chinapartsshop, clean commit `2d7e7ae4ec84f08a039babd9b8dc0315886d6330`; demo alias https://chinapartsshop-zeta.vercel.app. Separate production remote remains the previously authorized foundation `f42a7513f51f394c0fc500d43502ca701a3ce739`. This continuation is local and unpublished: no push, deployment, hosted migration/account/configuration, credentials, charges, messages or real data changes. LMT/Fusion remain unchanged. Use GPT-6.1 Sol only.

## Review locally

- Staff overview: http://127.0.0.1:4317/preview/admin/overview
- Administration: http://127.0.0.1:4317/preview/admin/administration
- Customer: http://127.0.0.1:4317/preview/customer/overview
- Public enquiry: http://127.0.0.1:4317/request

These are labelled synthetic fixtures on the Dell, not public or phone access. Preview is development/loopback only and blocked in production. Provider paths use official SDK/SSR verified identities and have no actor selector or sample fallback. No supported Codex sidebar-registration tool was exposed; open/add this exact folder with the project picker. Internal app configuration was not edited.

## Implemented

Reliable five-step guest RFQ/back-next/reload/review/retry, private bounded uploads, exact-digest scanner and Turnstile gates, idempotent durable provider transaction, staff inbox/detail/status/private notes/audit and authorized private downloads. Production disk persistence is blocked; provider records/files reside in Postgres/private Storage outside Vercel's ephemeral filesystem.

Customer provider login/invitation/password/logout and company-scoped dashboard/requests/comments/support; staff scoped CRM/private notes, request-derived order drafts, manual private tracking, invoice draft/print/explicit arithmetic and support. Reviewed guest linking requires an administrator and evidence; guest contacts, internal notes and attachments stay private.

New administration manages offices, existing provider account staff/company memberships, new company records and guest/company request assignments. New forms default inactive. Self access changes require another administrator; concurrent role changes preserve an active administrator. Office/assignee and single-company boundaries are checked again in SQL. Reassignment revokes prior scope and removes invalid assignments. No Auth account/password/invitation is created or sent.

New draft lifecycle: private create/edit → private current-version review → explicitly shared draft under approved server policy; withdrawal/archive/restore return to private. Parent edits/reviews withdraw child invoice/tracking review/sharing. Parent-first locks serialize sharing races. Private review evidence is separate and invisible to customers/cross-office dual-role users. Old idempotent edit retries cannot withdraw later sharing. Final issuance/payment/booking/notifications remain disabled.

Catalogue/page publication requires current-version approval; edits withdraw publication. Public catalogue now has indexed keyword search, category/make filters, 12-entry pagination, part details and enquiry links through anonymous RLS. Managed existing illustrations are clearly labelled. Unpublished/withdrawn detail returns 404 without a privileged fallback. A gated single-photo picker/retry/remove flow now decodes bounded PNG/JPEG, strips metadata, scans exact stored bytes, stores private objects and delivers only current approved public images through mediated reads. Replace/remove withdraws publication; no invented inventory, price, stock, fitment, quality or approved photo.

## Database/configuration

Review templates in order: bootstrap.sql, workspace-template.sql, workspace-writes-template.sql, administration-template.sql, catalogue-photos-template.sql, workspace-pagination-template.sql. No hosted application/seed occurred. Generate actual migration filenames through the approved CLI only after target approval; templates create objects once and are not rerunnable migrations. Keep all provider flags false pending acceptance. Administration uses service-only invoker RPCs with fresh role locks, versions and atomic audit/receipt. Public catalogue uses an anonymous invoker facet function. Protected Auth accounts are validated by foreign keys, without broad Auth table grants.

`CPS_DOCUMENT_VISIBILITY_ENABLED=false`, `CPS_DOCUMENT_POLICY_JSON=` remain default. An actual owner approval reference plus explicit allowed draft types are required before enabling sharing. Invalid/missing policy fails closed. Fixture policies are synthetic and never establish business approval. Public catalogue, account access, writes/linking/publication, submissions/uploads and indexing have independent configuration gates. No secrets belong in chat or source.

## Remaining decisions and code

ADMINISTRATION_AND_VISIBILITY.md gives the exact transitions, boundary rules, minimal owner decisions and next implementation prompt. IMPLEMENTATION_COVERAGE.md maps the full proposal to actual screens/provider code and remaining work. The complete commercial site is not production-ready merely because RFQ/drafts work.

Approve the dedicated Supabase target/region/backup-retention owner, offices/administrators/account-invitation/single-company policy, unassigned RFQ access, sharing policy and approved inventory/company/legal/contact copy. Hosted session/JWT/SMTP/MFA/recovery, private Storage/RLS/Turnstile/scanner, persistence after redeployment and backup restore need actual acceptance.

Private workspace and guest-inbox lists now page in groups of 50 with stable ordering and has-more controls. Scoped older-ID/parent hydration keeps details, invoice parents and native request/order/company/office/staff selectors reachable beyond the first page. Conversation/tracking/reply lists page within the selected parent. Record URLs survive reload, and hydrated detail version changes refresh saved form values. Reads use authenticated security-invoker SQL with fresh membership, independent office/company filters and table RLS; roster selectors remain administrator/server-only.

Official provider recovery request/token callback/password update is implemented behind CPS_CUSTOMER_RECOVERY_ENABLED=false. Anonymous approved-public sitemap/canonical projection is implemented; default noindex and empty sitemap remain until approved HTTPS origin/indexing/publication gates. No real email or hosted config occurred.

Conditional later commercial implementation needs accepted final order/invoice/fulfilment rules, selected payment provider/workflow and shipping/manual tracking lifecycle if those features are commissioned. Communications/live-chat and analytics/consent require separate launch-or-later choices. These are not payment/shipping/invoice prerequisites for an enquiry-only launch. Hosted deployment/auth/files/backup acceptance and approved public assets/copy need target/policy approval. Account-side uploads, multi-image galleries, CSV/XLSX parsers, translations/vendor registration, quote-authoring/cart and carrier automation are not new mandatory additions without confirmed scope. REMAINING_DECISIONS.md records the minimum inputs; no price/tax/payment/shipping/legal terms are assumed.

## Verification and delivery

The 43-test provider baseline remains covered; 58 Node domain/configuration/photo/recovery/indexing tests now pass. Real PostgreSQL 17.11 and actual Supabase SDK calls against approved local Auth/Data/Storage fixtures verify unauthorized/expired/inactive/direct-write/cross-office/company/dual-role/private-file denials, concurrency/idempotency/rollback, account revocation/reassignment, last-admin race, parent/child sharing races/archive/restore and anonymous catalogue search/facets/pagination/withdrawal. Fixture Auth does not prove hosted JWT cryptography or SMTP.

Isolated headless browsers verify the real Next server actions/SSR cookies against the fixture, 7 customer mobile and 11 staff desktop screens, office/account UI, catalogue search/detail/illustrations, save/reload/outage retry and no unexpected page/console errors. Synthetic preview also checks desktop/mobile workflows and draft review/sharing with one deliberately injected 503. Release evidence and final cleanup/delivery are recorded in VERIFICATION.md and evidence/pagination-recovery-closeout-summary.json.

New dated source/brief files are in deliverables; older snapshots are preserved. Library prepared upload previously failed with `hosted apps tools/list request failed: connection`, returning no new confirmed IDs. No blind retry or direct fallback was performed. Existing older Library IDs are not the current source. Local deliverables are the reviewable handoff until the supported upload connection is repaired.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.
