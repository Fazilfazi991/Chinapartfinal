Current source status, 5 October 2026: read CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md and REMAINING_DECISIONS.md for actual implemented screens and mandatory remaining inputs. Historical scope/build notes below are superseded. Six templates include workspace-pagination last; all hosted capabilities/recovery remain disabled. No new deployment or remote change occurred.

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

Current 4 October provider adapter implementation/coverage: CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md and PROVIDER_ACTIVATION.md supersede older remaining-code statements below. Provider auth/draft writes/reviewed linking/publication are implemented locally and disabled pending acceptance; final commerce remains incomplete.

# Production setup and release gates

4 October current release: packaged .next/standalone was tested directly with public/static assets, preview/local flags enabled but production fixture routes blocked. CPS_WORKSPACE_READS_ENABLED=false and CPS_SEO_ENABLED=false are defaults. Customer/commercial live writes/issuance are disabled; this release is not a completed production portal. See CURRENT_HANDOFF.md and IMPLEMENTATION_COVERAGE.md for exact code/setup gates. Current changes remain local/unpublished; original demo/prior review deployment untouched.

The separate foundation review site is deployed at https://chinapartsshop-production.vercel.app from f42a7513f51f394c0fc500d43502ca701a3ce739. The existing production project is chinapartsshop-production in faziils-projects. Do not overwrite chinapartsshop or its existing aliases. The 3 October preparation is local; no new push, deployment, hosted environment, migration or account change occurred. Service activation/further publication require authorization. See SUPABASE_SETUP.md and database/README.md for the handoff.

## Minimal decisions

1. Confirm release sequencing against PROPOSAL_PENDING_CHECKLIST.md. Enquiry-first initial presentation does not cancel proposed catalogue/portal/payments/invoices/CRM/orders/tracking and site services. Approve legal entity, contacts, territories, claims and policies; do not infer quote-authoring/cart scope.
2. Choose a dedicated Supabase project, region, budget, backup owner and retention/deletion rules. Do not implicitly reuse LMT/demo services.
3. Identify admins/agents and offices. Unassigned requests are visible to active staff; assigned requests to their office/admin. Confirm this policy. Assignment/routing UI is not implemented.
4. Approve Turnstile for the exact domain and an HTTPS scanner matching the contract below, or launch with uploads disabled. Approve three files of 1 MB each.
5. Confirm the existing separate hosting target and final domain. Set credentials in provider/hosting dashboards, never chat/source.

## Provider setup after authorization

Generate a migration using supabase migration new china_parts_rfq, then copy database/bootstrap.sql into that generated file. Review/apply only to the dedicated approved project after backup and local validation. Tables, RLS, private bucket and service-only mutation RPCs are included. Do not blindly apply to a shared schema. https://supabase.com/docs/guides/deployment/database-migrations

Disable public signup, invite approved staff through Supabase Auth, and add their provider user IDs to cps_staff_members with reviewed role/office/active values through a trusted administrator. No public signup or homegrown credentials exist. Configure provider password/MFA/session policy; mandatory MFA is not enforced by this code. Every operation verifies provider identity plus active membership/resource access. https://supabase.com/docs/guides/auth/server-side/nextjs

Populate .env.example through hosting configuration. Secret and scanner keys stay server-only. CPS_SITE_ORIGIN must equal the HTTPS origin without trailing slash. Public variables must be set before build. Configure Turnstile for the exact hostname; server validates hostname and action rfq. Leave CPS_SUBMISSIONS_ENABLED=false until acceptance passes. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

Database/private Storage persist outside hosting's ephemeral filesystem. Development disk storage is blocked in production. The bucket is private with no public/authenticated storage policy. Downloads pass through authenticated resource authorization and use attachment/no-store/nosniff headers. https://supabase.com/docs/guides/storage/buckets/fundamentals

## Uploads and recovery

Enable CPS_UPLOADS_ENABLED only with HTTPS CPS_SCANNER_URL and CPS_SCANNER_TOKEN. Scanner receives file bytes by POST with MIME Content-Type, bearer token and X-Content-SHA256. Return JSON with clean=true and sha256 equal to the exact scanned digest within 15 seconds. Any error/redirect/non-clean result rejects the file. Scanner hosting/implementation is not included. Signature validation alone is not malware detection.

PNG/JPEG/PDF only: three files, each at most 1 MB, total multipart body at most 4 MB. This stays below Vercel's 4.5 MB function request limit. https://vercel.com/docs/functions/limitations

Objects are immutable/private and keyed by request ID/payload digest. Request/metadata/audit commit in one database transaction. Storage and database are separate systems: failed database commits may leave private orphan objects. A retention cleanup job must verify absence of metadata references before deletion; this job is not implemented. Same-ID/same-payload retries converge; conflicts cannot overwrite saved requests.

## Release

On the target platform use Node 24, npm ci, npm test, npm run typecheck, npm run build. For self-hosted standalone output copy public and .next/static to documented standalone locations, then run server.js with HOSTNAME/PORT. Rebuild for the hosting OS; do not deploy Windows-native dependencies elsewhere. https://nextjs.org/docs/app/api-reference/config/next-config-js/output

Stage disabled first: confirm API 503, staff barrier, private headers and origin. Then use synthetic data to verify real login/logout/session expiry, inactive staff revocation, two offices/admin access, cross-office downloads, scanner success/failure, Turnstile, retry/conflict, status-version conflict and durable data after redeployment. Test backups/restore/deletion. Seek explicit authorization before publication and real submissions.

Quotes/acceptance, customer portal, prices/taxes/payments, stock/supplier orders/tracking, bulk parsing and messaging require scope decisions. Inbox currently shows latest 50 visible requests; pagination/assignment UI need a later scoped change.

Use npm run build, which includes the tested release privacy guard. Calling next build alone bypasses it on Windows. Before packaging check that .next/standalone contains none of .local-data, .test-pg, reference-demo or evidence. The guard removes generated copies and trace references, preserving original files.
