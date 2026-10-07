# Remaining work — decision-ready handoff

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

The project is still local, unpublished and unconfigured. This list distinguishes code work from actual setup and business decisions; credentials alone do not finish the full proposal.

## Product-photo question resolved

The previous gap included missing code. A single-photo pipeline is now implemented: administrator picker/retry, bounded streamed upload, PNG/JPEG signature/decoder/pixel checks, PNG re-encoding without metadata, scanner attestation of the exact stored bytes, private Supabase Storage adapter, transactional metadata/version/audit/idempotency, private staff preview and mediated public image only after current-version catalogue approval. Replace/remove withdraws review/publication. Anonymous/authenticated users cannot read bucket objects or private media metadata directly. No signed file URLs are returned.

`CPS_CATALOGUE_PHOTOS_ENABLED=false` remains default. No real product images were uploaded. Synthetic test pixels establish code behavior, not inventory approval. Still needed for activation: approved/licensed actual assets and descriptions; dedicated private bucket/scanner configuration and hosted acceptance; acceptance of one main photo, PNG/JPEG input <=1 MB/4096 pixels, safe PNG output <=1 MB and private retention. Replaced/failed-commit objects remain private; physical deletion/orphan cleanup requires an approved retention rule. A multi-image gallery is additional code only if requested.

## Established local gaps closed

| Item | Implemented code | Activation boundary |
| --- | --- | --- |
| Private list/detail/selector pagination | Deterministic 50-entry pages, has-more, record URLs/reload, scoped older-ID/parent hydration, paged conversations/tracking/replies, native request/order/company/office/staff choices and guest RFQ inbox | Sixth reviewed pagination template, after catalogue photos; invoker reads retain RLS and independently check company/office/role; roster selectors are server/admin-only |
| Password recovery | Official resetPasswordForEmail request, generic eligibility copy, bounded input, exact origin, recovery-token verifyOtp callback, fresh active customer membership and authenticated password update | CPS_CUSTOMER_RECOVERY_ENABLED=false; accepted SMTP/template/origin/rate-limit/CAPTCHA/account policy and actual hosted one-use/expiry/session tests before activation |
| Approved-public indexing | Anonymous paged published-page/catalogue sitemap and canonical metadata; withdrawal removes entries | SEO flag, exact approved HTTPS origin, publication/catalogue flags and approved copy/data. Private routes/files never appear |

No further mandatory provider-independent feature was established in this bounded scope. Hosted acceptance is still required for enabled launch features. The commercial requirements below need later commissioning and accepted inputs; they do not block an enquiry-only launch.

Account-side attachments are not added: the parent's verified proposal explicitly requires RFQ photo/list and portal status/comments, but no explicit account-side upload requirement was evidenced. Existing guest RFQ attachments cover the established file-capture path. A portal upload UI, multi-image gallery, CSV/XLSX parsing, translations/vendor registration, quote-authoring/cart or carrier automation are clarification/optional items, not newly invented mandatory work. Supplier portal/mobile apps remain excluded.

## Inputs for launch activation and conditional later features

| Item | Smallest owner input | What remains |
| --- | --- | --- |
| Hosted RFQ/accounts/files | Exact dedicated Supabase/hosting target and authorization to configure it; approved origin; first administrators/offices/account invitation/single-company/unassigned-RFQ policy | Dashboard/CLI setup, actual RLS/session/SMTP/MFA/storage/Turnstile/scanner/redeploy/backup acceptance. Keys belong in provider settings/untracked environment, not chat |
| Customer draft visibility | Who may review/share; allowed draft kinds/statuses/files; actual approval reference | Configuration/hosted acceptance of implemented review/share controls; final commerce remains separate |
| Final order/invoice lifecycle (conditional later) | A redacted real final document, issuer/required fields/numbering/currency/precision/tax, review/issue actors and fulfilment/cancellation/partial shipment rules | Commercial state machine/final legal document/issuance code; output format follows the approved sample. No terms may be guessed |
| Payments (conditional later) | Gateway name plus the event that may request payment (and required refund/reconciliation scope) | Selected-provider checkout/signed webhooks/replay/idempotent ledger/reconciliation code, then account setup/test acceptance |
| Shipping integration (conditional later) | Reviewed manual updates versus named carrier/provider; partial shipment and who records/confirms events | Accepted lifecycle and optional carrier/booking integration; current manual draft notes do not book shipments |
| Email/WhatsApp/live chat | Selected channels/provider, recipients/routing, consent/templates and which events may send | Integration/delivery/live-chat code and account setup. Persisted support/comments already work without external sending |
| Analytics | Provider, allowed events and consent/privacy requirement | Collection/consent code and setup. No external collection is active |
| Bulk input format (clarification) | A redacted sample format and column/units/error-handling expectations | Guest image/PDF/manual list receipt exists. A structured parser is additional code only if required by the accepted format |
| Languages/vendor registration (scope clarification) | Exact languages and approved translations; vendor fields/consent/approval behavior | Translation/RTL/simple registration code. A supplier portal/mobile app is not inferred scope |
| Public assets/company/legal copy | Approved inventory/photos/rights, contacts/claims and privacy/terms | Content population/review; no invented product facts, legal copy or published credentials |
| File retention/cleanup | Retention period, deletion actor and legal hold/reference policy | Safe physical/orphan cleanup and backup/restore operations. No guessed age deletion |

## Local evidence and limits

See VERIFICATION.md and evidence/pagination-recovery-provider-results.json for actual runs. Tests use generated pixels and isolated accounts/SQL/Storage fixtures; they do not prove actual hosted JWT/SMTP/scanner availability, real inventory ownership or commercial acceptance. No external setup, upload, publication, credential creation, payment/message or original-demo mutation occurred. Library's prior prepared-helper connection failure remains unresolved; no blind retry.

Official implementation references: [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Sharp decoder limits](https://sharp.pixelplumbing.com/api-constructor/), [metadata/output handling](https://sharp.pixelplumbing.com/api-output/).

## Recovery setup to review before activation

Configure the provider reset-password email link using its approved SiteURL plus `/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. Do not use an arbitrary next URL or the invitation type. The callback verifies the official provider token before fresh company membership; password update is authenticated. SMTP, rate limiting/CAPTCHA, expiry/replay and session revocation need hosted acceptance. Local fixture requests never send email or create accounts.

Official references: [Supabase password recovery](https://supabase.com/docs/guides/auth/passwords), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Next sitemap metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).
