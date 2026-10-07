Current closeout, 5 October 2026: workspace/guest-inbox/detail/parent/selector/conversation pagination, official gated recovery and approved-public sitemap/canonical code are implemented locally. The sixth review template is workspace-pagination-template.sql, after catalogue-photos. Read REMAINING_DECISIONS.md for current mandatory-versus-clarification scope; historical first-50/recovery/sitemap/account-upload gap statements below are superseded. Recovery and hosted capabilities remain disabled; no hosted application/email/push/deployment occurred.

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

# Provider activation and continuation brief

This is implementation-ready local source, not authorization to configure a hosted provider. Preserve the original demo, separate production remote and LMT/Fusion. Use GPT-6.1 Sol only. No credentials in chat/source; no production deployment, real messages/charges or hosted migrations without owner authorization.

## Architecture

Next.js App Router + React, official Supabase SDK/SSR, Postgres RLS and server-only invoker transactions, private Storage for existing guest RFQ uploads, explicit Turnstile/scanner. Synthetic preview is separate development/loopback-only storage; provider paths use actual verified membership and never seed fallback. User-scoped read clients and lazy service write/download clients have separate trust boundaries. Public copy/catalogue uses anonymous publishable clients and approved snapshots; no service-role public rendering.

Read lib/workspace-reader.mjs, workspace-writer.mjs, workspace-snapshot.mjs, customer-auth.mjs and the six database templates (bootstrap, workspace, workspace-writes, administration, catalogue-photos, workspace-pagination). API body/origin/config guards fail closed. Writes use actor+operation UUID and canonical digest; record versions reject stale edits. Transactional audit stores actor/action/resource/company, not every prior note value. Retention/backup/audit policy is unresolved; do not delete records/files by guessed age.

## Setup sequence after authorization

1. Confirm dedicated target/region/backup owner, roles/offices, invited account and one-company membership baseline, unassigned RFQ visibility, ownership-review evidence, document visibility and approved legal/company copy. Do not reuse LMT resources.
2. Discover installed CLI help; generate actual migration(s) with supabase migration new, copy reviewed templates in order and inspect privilege/RLS advisors. Templates create objects once, not rerunnable migrations. No synthetic seeds. Review existing Storage object policies for unrelated permissive rules.
3. Configure Supabase public URL/publishable key and server-only secret through dashboards/untracked env. Keep all feature flags false. Configure hosted password/session/MFA/SMTP/redirect policy. No homemade JWT/session acceptance. Trusted operator creates/reviews Auth users and active memberships; invitations must not be sent automatically from this handoff.
4. Configure invitation template to the approved origin /auth/confirm?token_hash={{ .TokenHash }}&type=invite. Callback requires active customer membership before setup/access; no caller-controlled next. Test actual cookie refresh/logout/revocation/recovery/email delivery with synthetic hosted accounts; recovery UI/token callback is implemented behind its disabled acceptance flag.
5. Verify private RFQ bucket/scanner/digest attestation, exact Turnstile hostname/action, two companies/offices/admin/dual role/inactive users/direct SDK bypass, private files, concurrent writes/conflicts/rollback, persistence after redeployment and restore. Local fixture tests do not verify hosted JWT cryptography or SMTP.
6. Enable accepted reads/account access first, then draft writes. CPS_WORKSPACE_READS_ENABLED needs public Auth; CPS_CUSTOMER_AUTH_ENABLED needs Auth/site origin; CPS_WORKSPACE_WRITES_ENABLED additionally needs CPS_BACKEND=supabase/server persistence. CPS_RFQ_LINKING_ENABLED and CPS_PUBLICATION_ENABLED are separate reviewed gates. CPS_PUBLIC_CATALOGUE_ENABLED requires publication; CPS_SEO_ENABLED additionally needs approved HTTPS origin/content. Offline checks reject incomplete activation and redact values. CPS_SUBMISSIONS_ENABLED/CPS_UPLOADS_ENABLED have independent existing anti-abuse/storage gates.
7. Publishing catalogue/pages does not publish orders/invoices/tracking or enable money/messaging. Commercial execution remains disabled. Reviewed draft sharing has a separate disabled-by-default CPS_DOCUMENT_VISIBILITY_ENABLED/CPS_DOCUMENT_POLICY_JSON gate; approve specific kinds/reference before activation. Approve and implement legal invoice/order lifecycles, payment provider/webhook/reconciliation and shipping/notification rules separately.

## Next implementation phases

Phase A: actual provider acceptance and approved administration policy, hosted acceptance of implemented pagination/detail/selectors and password recovery. Account/office/member/assignment administration is implemented. Phase B: actual approved photo assets and hosted scanner/private-bucket acceptance; structured SEO and analytics-consent; public discovery/search/detail/pagination, labelled illustrations and single-photo code are implemented. Continue with bulk-list parser/languages/vendor form where confirmed. Phase C: agreed legal order/invoice/customer document visibility and tracking lifecycle. Phase D: selected gateway signed webhooks/idempotent ledger/reconciliation/checkout, selected shipping/communication integrations. Tests must include unauthorized/direct SDK/cross-office/company/concurrency/retry/provider outages, not only UI happy paths.

Do not reinterpret generic drafts as final commercial issuance, import synthetic amounts, assume tax/currency/shipping promises, implement inferred quote/cart modules or alter the existing demo deployment. IMPLEMENTATION_COVERAGE.md is the remaining full-site scope matrix.

## Local verification commands

Node tests: node --test --test-isolation=none tests/*.test.mjs. TypeScript: node node_modules/typescript/bin/tsc --noEmit. Release: npm run build (one CPU; packaged standalone). PostgreSQL tests: CPS_PSQL points to the authorized installed psql, loopback port 6547, only random invocation-owned database. CPS_WORKSPACE_BROWSER=true adds actual Next/SSR/headless flows through the local approved provider fixture on port4320; it refuses collisions and stops only its owned child. No production identity hooks.

The review preview at port4317 stays unconfigured/synthetic and running; provider-test profile/build/data are private and excluded from release. Use isolated headless browsing, preserve foreground coordination and LMT CPU priority. Verify process executable/data directory before normal pg_ctl stop; never kill unrelated Docker/LMT processes.

Official references: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [invitation verification](https://supabase.com/docs/reference/javascript/auth-verifyotp), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Postgres locks](https://www.postgresql.org/docs/current/explicit-locking.html). Changelog markdown access returned unsupported content-type; no package/CLI upgrade was performed.

Read ADMINISTRATION_AND_VISIBILITY.md for actual safe transitions, scopes and the minimal unresolved provider/commercial inputs. Sharing drafts is not final document issuance.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.
