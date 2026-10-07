Current closeout, 5 October 2026: workspace/guest-inbox/detail/parent/selector/conversation pagination, official gated recovery and approved-public sitemap/canonical code are implemented locally. The sixth review template is workspace-pagination-template.sql, after catalogue-photos. Read REMAINING_DECISIONS.md for current mandatory-versus-clarification scope; historical first-50/recovery/sitemap/account-upload gap statements below are superseded. Recovery and hosted capabilities remain disabled; no hosted application/email/push/deployment occurred.

# Administration, draft sharing and catalogue handoff

This implementation stays in China Parts Shop Production. The original demo, LMT and Fusion are unchanged. No hosted migrations, accounts, credentials, messages, payments, push or deployment were performed. All provider flags remain false by default. This file and IMPLEMENTATION_COVERAGE.md supersede older statements that these screens are absent.

## Implemented boundaries

`/workspace/admin/administration` manages offices, existing Auth account staff/company memberships, guest RFQ assignments and new company records. Company request assignment is on its request screen. Equivalent labelled synthetic screens exist under `/preview/admin`. Administration does not create Auth accounts, passwords or invitations. An existing provider UUID is required; the Auth foreign key rejects nonexistent accounts without granting access to protected Auth tables.

Every provider operation checks getUser and fresh active membership before constructing the service client. SQL checks active administrator membership again inside the transaction. Office agents and customers cannot administer access. Account labels contain only operator-entered labels; roster responses omit contacts, private notes, file keys, Auth metadata and credentials. Rosters page in groups of 50; current record/support selectors now page with older-ID/parent hydration and scoped native choice pages.

New offices and new membership forms default inactive. Existing office UUIDs are preserved by the additive template with an `Office pending label` marker; an operator must review labels and policy. An office with companies or active agents cannot be deactivated. Agents require an active office; active assignees must belong to that office or be administrators. Assignments organise work and never grant cross-office access. Moving/deactivating an agent removes invalid assignments. Reassigning a customer membership replaces its single-company access. Self role/office/deactivation changes require another administrator. Role transactions serialize before membership locks, preserving an active administrator under concurrent demotions. No hard-delete UI exists.

Writes enforce optimistic record versions, actor/operation UUID/digest idempotency, and record/audit/receipt atomicity. Repeated old edits return their receipt without undoing newer sharing. Audit records actions and IDs; it does not preserve every previous field value. Retention/export/deletion rules need owner approval.

## Draft visibility lifecycle

New order/invoice/tracking records are private. Administrators can record private review evidence, share a reviewed current version, withdraw sharing, archive, or restore privately. Office agents can edit scoped drafts but cannot review/share them. Customers only read explicitly shared company drafts; private review evidence is in a separate staff-scoped table. Editing or reviewing a parent order withdraws child invoice/tracking sharing and review. Parent-first transaction locks serialize child sharing against parent edits. Archived drafts require explicit restore before editing.

| Operation | Result | Customer access |
| --- | --- | --- |
| Create / edit | Private draft; previous review cannot authorize the changed version | Denied |
| Record review | Current-version private draft; private evidence recorded | Denied |
| Share reviewed version | Shared **draft**, only under approved server policy | Company's members only |
| Withdraw / archive | Private; review cleared; order children withdrawn | Denied |
| Restore | Private, unreviewed draft | Denied |

Sharing does not issue a legal invoice, confirm an order, reserve stock, accept a quote, book shipping, request payment or send a message. Final issuance and commercial execution remain disabled. Internal status options are draft/review placeholders, not an approved fulfilment state machine.

`CPS_DOCUMENT_VISIBILITY_ENABLED=false` and an empty `CPS_DOCUMENT_POLICY_JSON` keep sharing disabled. After explicit owner acceptance and hosted validation, the policy must contain an actual approval reference plus boolean allow entries for `order`, `invoice`, `tracking`. Unknown types, missing reference, malformed JSON or no allowed types fail closed. No real policy reference is supplied here. Local test policies are synthetic fixtures only. Never accept a policy from a request body.

## Catalogue implementation

Anonymous RLS reads supply `/catalogue` search, category/make filters, 12-entry pagination and `/catalogue/[id]` details. Search uses an indexed generated tsvector and bounded websearch queries. Facets return only reviewed published non-archived entries. Publication requires current-version approval; edits withdraw publication. Details of unpublished/withdrawn entries return 404, with no privileged fallback or sample replacement.

Admins can select existing managed illustrations when editing an entry. Captions expressly identify illustration artwork rather than verified product photos. External/private file URLs are rejected. No approved inventory, compatibility, quality, price, availability or stock claim is invented. Single-photo upload/validation/private Storage/mediated delivery is now implemented and gated off; real assets and hosted acceptance remain pending. Multi-image galleries remain additional code. Read REMAINING_DECISIONS.md.

Official references used: [Supabase full-text search](https://supabase.com/docs/guides/database/full-text-search), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Postgres locks](https://www.postgresql.org/docs/current/explicit-locking.html).

## Minimal owner decisions and remaining implementation

1. Approve the dedicated Supabase target/region, backup/retention owner, offices, first administrators, invitation/account lifecycle, one-company membership policy and unassigned RFQ visibility. Configure Auth/SMTP/MFA/callbacks using provider dashboards; do not send secrets in chat. Templates are review material, not applied migrations.
2. Approve who reviews drafts and which exact draft types/statuses/files customers can see. Provide the approval reference for any sharing policy. Confirm order/fulfilment/cancellation/partial-shipment rules before implementing commercial transitions. No public reference lookup establishes ownership.
3. Supply approved catalogue records/assets and company/legal/contact copy. Choose photo ownership/moderation/retention and upload workflow. Pagination, recovery and sitemap/canonical code are implemented. Analytics needs a selected provider/events/consent; bulk parsing, account uploads, multiple photos, translations and vendor registration require explicit scope/format confirmation.
4. Invoice issuer/legal entity/fields/numbering, currencies/precision/tax, price authority and final document lifecycle remain unresolved. Final issuance/PDF/legal history are not implemented. Quotation authoring/revision/acceptance and a cart are not inferred modules; confirm scope with a redacted example if requested.
5. Select the payment provider and payment trigger, signed webhook/replay/reconciliation/refund scope; shipping provider versus reviewed manual updates and partial delivery rules; email/WhatsApp/live-chat provider, consent/templates and notification recipients; analytics provider/events/consent. These integrations are unimplemented and disabled. No provider choice or commercial terms are assumed.

## Next implementation prompt

Use GPT-6.1 Sol only. Continue this exact separate folder, read AGENTS.md, CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md and PROVIDER_ACTIVATION.md. Preserve the reference demo and every LMT/Fusion project. Retain the existing RFQ, provider auth/RLS, draft, administration and catalogue code; do not rebuild a second app or claim drafts complete commerce. Keep provider execution disabled until the dedicated target and required rules are accepted. Generate real migration filenames with the approved CLI only after target approval; review bootstrap, workspace, workspace-writes, administration, catalogue-photos and workspace-pagination templates in order. Never import local synthetic fixtures into hosted data. Test actual provider sessions, direct SDK authorization, two offices/companies/dual-role/inactive users, private files, concurrent writes, scanner/Turnstile outages and persistence across redeployment. Implement remaining provider/commercial features only against confirmed choices. Package a fresh source archive and update the full scope matrix; do not overwrite old snapshots or mutate the original demo deployment.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.
