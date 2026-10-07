# Production implementation brief — China Parts Shop

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

## Objective and evidence

Continue the separate project from the user-confirmed chinapartsshop client preview, preserving the original demo and LMT/Fusion. LMT keeps CPU priority. Use GPT-6.1 Sol only. Current implementation is local; no further deployment, hosted mutations, credentials, real messages/payments or real data changes are authorized.

The demo presents requirement capture → part identification → sourcing/verification → quotation → customer confirmation → processing/delivery. Its original controls were visual-only; the new source makes requirements and generic draft workflows real. SOURCE_REVIEW.md records exact repository/commit/workflow evidence. PROPOSAL_PENDING_CHECKLIST.md records parent-verified proposal extracts and call evidence limits. Do not infer a quote-authoring/revision/acceptance or cart module from process prose.

The full pending proposal includes catalogue/RFQ/customer statuses/comments/payment/invoices; admin CRM/orders/shipping/tracking/communications; standard pages/hosting/SSL/SEO/analytics. Enquiry-first presentation does not cancel that scope. IMPLEMENTATION_COVERAGE.md maps each requirement to actual screens/provider code and remaining decisions/code.

## Current architecture

Next.js App Router/React with preserved brand/assets/local fonts. Public pages render approved content through anonymous RLS clients. Client forms manage retained/validated inputs and recover failed saves without false acknowledgement. The independent local synthetic preview is loopback/development-only; it never authenticates real users or supplies fallback data to provider routes.

Official Supabase SDK/SSR verifies provider getUser and active memberships for every request. Separate customer-company and staff-office/admin roles constrain user-scoped reads; private notes/review evidence/files remain scoped even for dual-role users. Canonical server validation discards caller ownership/policy claims before creating a lazy service client. SQL invoker transactions verify membership/version again, deduplicate actor+operation/digest, and atomically commit record+audit+receipt.

Postgres/private Storage provide durable hosting persistence. Guest uploads accept only signature-validated PNG/JPEG/PDF (three 1 MB files, 4 MB multipart total), scanner attestation of the exact hash and configured Turnstile hostname/action. Denied downloads construct no privileged client and expose no private URLs. Production cannot use the disk adapter. Retention, private orphan cleanup and restore must follow accepted rules.

Templates: database/bootstrap.sql, workspace-template.sql, workspace-writes-template.sql, administration-template.sql, catalogue-photos-template.sql, workspace-pagination-template.sql, in order. They are reviewed one-time creation templates, not applied hosted migrations. Generate real migration files through the approved CLI only after dedicated target approval; no fictional timestamps/seeds or shared LMT resources.

## Safe workflows implemented

Customer company requests hold multiple part lines; customer/staff comments and support persist. Staff can review requirements/private CRM notes, derive order drafts from company requests, add internal manual tracking and prepare explicit currency/precision/minor-unit invoice drafts. Unknown tax means no payable total. Final legal issuance, price commitments, payment, shipping booking and messaging are disabled.

Administrators manage office/company records, assignments and membership for existing provider identities. New forms default inactive; assignments grant no extra access. Moving/deactivating staff clears invalid queues; company reassignment revokes prior company access. Self access changes require another administrator, and concurrent role changes preserve an active administrator. No provider accounts/invitations are created or sent.

New draft visibility is configurable only through an owner-approved server policy: private create/edit → current-version private review → shared draft, or withdraw/archive/restore privately. Parent-first locks serialize child sharing against parent edits; order changes withdraw child invoice/tracking reviews/sharing. Old idempotent edit retries do not undo later sharing. ADMINISTRATION_AND_VISIBILITY.md gives the complete matrix. Actual fulfilment/legal document state machines remain unapproved and unimplemented.

Catalogue/page edits withdraw publication; current-version review is mandatory. Public catalogue supports indexed keyword search, make/category facets, 12-entry pagination, details/enquiry links and managed existing illustrations. Illustrations are labelled; single-photo upload/private Storage/scanner/mediated delivery is implemented and gated off; approved actual photos and hosted acceptance remain pending. Multi-image galleries are additional scope. No price/stock/fitment/quality fact is invented. Public withdrawal removes detail access without privileged fallback.

## Implementation phases

1. Completed: exact read-only source boundary, reliable RFQ/form/upload/persistence/staff flow, offline guards and separate release package.
2. Completed locally: official provider Auth/SSR/company-office RLS, transactional request/comment/support/CRM and internal order/invoice/tracking drafts, reviewed guest linking and publication.
3. Completed locally: office/existing-account/company administration/assignments, safe reviewed draft visibility/archive/restore and richer public catalogue discovery/illustrations and gated single-photo upload/private storage/mediated delivery. 58 domain/photo/recovery/indexing tests, SDK/Postgres permissions/races and isolated browser/release checks cover these phases. Hosted acceptance is not implied.
4. Pending explicit setup authorization: dedicated provider/region/domain; review/generate/apply migrations and RLS/Storage policies; configure Auth/SMTP/MFA/callbacks, scanner/Turnstile; test actual provider sessions/invitations/revocation/downloads, persistence after redeployment and restore; then activate only accepted features.
5. Completed locally: private workspace/guest inbox/detail/parent/selector/conversation pagination, official independently gated recovery and approved-public sitemap/canonical projection. Final verification is recorded in VERIFICATION.md.
6. Conditional later proposed implementation, only if commissioned after accepted inputs: final order/invoice/fulfilment lifecycle, selected gateway signed webhooks/reconciliation/payment workflow, accepted manual/provider tracking, selected communication/live-chat and analytics/consent. Account-side attachments, multiple photos, structured bulk parsing, translations/vendor registration or quote-authoring/cart are not mandatory additions without explicit scope evidence; REMAINING_DECISIONS.md records the distinctions.

## Exact minimum decisions

- Dedicated Supabase/hosting target/region/ownership/backup-retention; active administrators/offices/account invitation/single-company/unassigned RFQ policy. No secrets in chat.
- Review actors, customer-visible draft types/statuses/notes/files and owner policy reference; order/fulfilment/cancellation/partial delivery conditions. References/emails alone never prove ownership.
- Approved inventory/photos/claims/company/contact/privacy/terms; asset rights/moderation/retention, bulk-list format and upload limits.
- Invoice issuer/entity/fields/numbering/currency/precision/tax, price authority and final issuance lifecycle. If quote authoring is confirmed, supply a redacted real quote and approval/revision/expiry/acceptance rules first.
- Payment provider and payment trigger/webhook/refund/reconciliation; manual versus provider shipping/partial shipment rules; messaging/live-chat provider/consent/templates/recipients; analytics/events/consent. No choice or terms are assumed.

## Next Codex prompt

Use GPT-6.1 Sol only. Continue this exact workspace after AGENTS.md, CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md, ADMINISTRATION_AND_VISIBILITY.md and PROVIDER_ACTIVATION.md. Preserve the original demo, separate unpublished current code, LMT and Fusion; respect LMT CPU priority. Do not rebuild another app or equate drafts with complete commerce. Keep provider execution disabled pending authorization/configuration/accepted policy. Finish only features supported by confirmed decisions, using official docs and actual scoped adapters, not homemade auth or simulated production success. Verify unauthorized/direct SDK/cross-office/company/dual-role access, concurrency/idempotency/rollback, private file/challenge/scanner outages, hosted persistence/redeploy/restore and mobile/error recovery. Update the whole proposal parity map and fresh source/brief artifacts. Do not overwrite old snapshots, publish without the target boundary, send messages/payments, invent terms or request secrets in chat.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.

