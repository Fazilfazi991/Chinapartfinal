> Current dedicated-provider status, 7 October 2026: see [SUPABASE_ACTIVATION_REPORT.md](SUPABASE_ACTIVATION_REPORT.md). Seven migrations are actually applied on the approved China Parts project; hosted Auth, RLS, private Storage and no-attachment persistence/staff review acceptance passed. The older unconfigured/no-hosted-execution statements below are historical. Public Turnstile submissions, real scanning, SMTP/recovery, real administrator and deployment remain gated. Do not replay database templates or regenerate applied migration versions.

Current closeout, 5 October 2026: workspace/guest-inbox/detail/parent/selector/conversation pagination, official gated recovery and approved-public sitemap/canonical code are implemented locally. The sixth review template is workspace-pagination-template.sql, after catalogue-photos. Read REMAINING_DECISIONS.md for current mandatory-versus-clarification scope; historical first-50/recovery/sitemap/account-upload gap statements below are superseded. Recovery and hosted capabilities remain disabled; no hosted application/email/push/deployment occurred.

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

Current continuation: ADMINISTRATION_AND_VISIBILITY.md and IMPLEMENTATION_COVERAGE.md record implemented office/account/assignment administration, policy-gated draft review/share/archive and public catalogue search/detail/pagination with labelled illustrations. Provider/commercial activation and remaining code gaps stay explicit. Earlier gap statements below are historical.

# Supabase preparation - local checkpoint, 3 October 2026

4 October provider milestone: CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md and PROVIDER_ACTIVATION.md supersede older scope notes below. Customer SDK/SSR login/invite/password/logout, scoped read/write transactions, support/private notes/drafts, reviewed guest ownership linking and controlled catalogue/page publication are now implemented/tested locally. All external capabilities remain disabled. No hosted application/migration or complete commercial execution is claimed.

This is the handoff for the existing RFQ/staff foundation. No hosted project, key, account, migration, bucket or setting was created or changed during this preparation. The existing review site is https://chinapartsshop-production.vercel.app at `f42a7513f51f394c0fc500d43502ca701a3ce739`. The configuration/navigation changes described here are local and unpublished. The original client demo remains separate.

## Inputs when setup is authorized

Choose a dedicated Supabase organization/project, standard Postgres region, budget and backup/restore owner. Confirm invited staff roles and office IDs, whether every active staff member may see unassigned RFQs, and who assigns them. This release has no assignment/membership-management UI. Confirm retention/deletion rules and business/legal content. Uploads additionally need an approved scanner and file retention policy. Quotation, customer-account, order and payment scope remains in `COMMERCIAL_SCOPE.md`; this setup adds none of those features.

Set credentials through provider/hosting environment dashboards or an untracked local environment file, never chat/source. Public variables must be set before the Next.js build.

| Capability | Configuration | Gate |
| --- | --- | --- |
| Staff login and office-scoped reads | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Valid public config, Auth, schema and active membership |
| Staff updates and private downloads | Above plus `SUPABASE_SECRET_KEY` | Server-only key; verified session/resource authorization |
| Customer RFQ persistence | Above plus `CPS_BACKEND=supabase`, `CPS_SITE_ORIGIN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | `CPS_SUBMISSIONS_ENABLED=true` only after live acceptance |
| RFQ attachments | Above plus `CPS_SCANNER_URL`, `CPS_SCANNER_TOKEN` | `CPS_UPLOADS_ENABLED=true` only after scanner/storage acceptance |
| Synthetic disk adapter | `CPS_LOCAL_TEST_BACKEND=true` in development | Ignored in production; not durable hosting storage |

Preferred key formats are `sb_publishable_...` and server-only `sb_secret_...`; legacy JWT anon/service_role keys remain format-compatible. The checker rejects swapped roles and privileged keys under any NEXT_PUBLIC variable. Decoding a legacy API-key role checks format, not user identity or credential validity. Identity is independently verified by `auth.getUser()`.

URLs require HTTPS with no credentials, query or fragment. The Supabase URL must have no endpoint path; site origin must have no path or trailing slash. A scanner URL may have a path. Loopback HTTP is allowed only in development. Production loopback URLs and placeholder domains are rejected. Flags use exactly true or false.

## Offline checks

`npm run config:check` prints readiness booleans and variable names/error codes, never values. It makes no network calls. An unconfigured site with submissions disabled passes; public secrets, malformed flags/public Auth configuration or incomplete enabled submissions fail. `npm run config:check:strict` additionally requires RFQ provider settings to pass format checks. It does not enable submissions or prove credentials, RLS, bucket existence or availability. Missing scanner settings keep uploads unavailable.

`npm run build` runs the production guard before compilation, then sanitizes generated release traces/copies of local records. `npm test` includes CLI success/failure/redaction fixtures. Run `npm run typecheck` too. None of these checks validates a hosted service.

## Authorized setup later

1. Review `database/README.md` and the existing `database/bootstrap.sql`. Generate a migration only after a dedicated target is approved. Do not apply this non-idempotent bootstrap to a shared/existing database without migration review.
2. Configure invite-only staff Auth and approved password/session/MFA settings. The code has no public signup and does not enforce mandatory MFA. An Auth account alone receives no staff access: a trusted operator must create active membership with reviewed role/office.
3. Verify four RLS-enabled tables, two service-only mutation RPCs, a private bucket and no direct anonymous/authenticated object policy. Membership/assignment changes remain administrative operations.
4. Configure exact-domain Turnstile and the scanner contract in `DEPLOYMENT.md`, keeping both gates false. Database/Storage persist outside Vercel's ephemeral filesystem.
5. Using synthetic data, verify real SSR cookies/refresh/logout, inactive/revoked staff, two offices/admin, private downloads, challenge/scanner failures, retries and stale edits. Verify persistence after redeployment, backup/restore and approved retention/deletion. Local fixtures do not replace acceptance.
6. Obtain authorization for environment changes/publication/real submissions and agreed scope, then enable accepted capabilities on the existing separate production project. Preserve the demo.

## Official references reviewed

- [API keys](https://supabase.com/docs/guides/getting-started/api-keys).
- [SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
- [Migrations](https://supabase.com/docs/guides/deployment/database-migrations).
- [Buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets).
- [Changelog](https://supabase.com/changelog), checked 3 October 2026. No package/migration upgrade was performed. This schema does not use the recent release's ltree, legacy PGP decryption, float btree_gist or custom-operator cases. Standard Postgres is intended; the new OrioleDB beta is outside this preparation.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.
