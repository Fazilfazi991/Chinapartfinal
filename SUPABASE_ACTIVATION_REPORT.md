# China Parts Final — real Supabase activation

Verified 7 October 2026 in `C:\Users\USER\Documents\Codex\China Parts Final`. This report supersedes earlier statements that the dedicated backend is unconfigured. The existing Next.js application, branding, membership model and pinned dependencies were preserved.

## A. Project

| Item | Verified value |
| --- | --- |
| Name | China Parts Final |
| Project reference | `cjregchcuxjcqazokqid` |
| Organization | Chinaparts Website — Free plan |
| Region | `ap-southeast-2` — Sydney |
| Status | Existing dedicated project healthy; hosted Auth, database and Storage acceptance passed |
| Local application | `http://127.0.0.1:4419` — actual Supabase provider, synthetic preview disabled |

The existing China Parts project was empty before activation: zero public tables/functions, Auth users, buckets, Storage policies and migration records. It was renamed to the requested name. Its existing Sydney region was retained; no new or paid resource was created. The connected Supabase connector belonged to an unrelated account, so only the owner's authenticated dashboard session was used for project mutations. No unrelated project was changed.

Existing modern publishable/server secret credentials are in ignored `.env.local`. No credentials are included in source, this report or screenshots. Workspace reads are enabled; generic CRM writes, customer portal/recovery, publication, catalogue/photos, ownership linking, document sharing and SEO remain disabled. Staff RFQ review uses the existing separately authorized server action. Public submissions and uploads remain disabled.

## B. Database and migrations

Supabase CLI 2.120.0 generated the migration filenames. All seven reviewed files were actually executed on the dedicated project:

1. `20261007103011_china_parts_rfq.sql`
2. `20261007103012_china_parts_workspace.sql`
3. `20261007103013_china_parts_workspace_writes.sql`
4. `20261007103014_china_parts_administration.sql`
5. `20261007103015_china_parts_catalogue_photos.sql`
6. `20261007103045_china_parts_workspace_pagination.sql`
7. `20261007104309_china_parts_api_hardening.sql`

The six dependency-ordered baseline migrations ran in one guarded transaction through the authenticated SQL editor. The seventh migration followed in a transaction guarded against an unexpected previous version. The executed source and its version/name were recorded atomically in the official CLI-compatible `supabase_migrations.schema_migrations` structure. All seven hosted source hashes match the repository files after normalizing carriage returns. This was authenticated dashboard execution, not `supabase db push`. No history-only repair, duplicate object replay or seed was used. `scripts/prepare-dashboard-migrations.mjs` preserves the reviewed fallback for an explicitly fresh target or an exact preceding version; it does not execute SQL. Do not replay the baseline on this initialized project.

There are **25 application tables**, all with RLS enabled:

`cps_rfqs`, `cps_attachments`, `cps_audit`, `cps_staff_members`, `cps_customer_members`, `cps_offices`, `cps_companies`, `cps_company_notes`, `cps_portal_requests`, `cps_portal_comments`, `cps_portal_notes`, `cps_support_threads`, `cps_support_replies`, `cps_rfq_company_links`, `cps_order_drafts`, `cps_invoice_drafts`, `cps_tracking_events`, `cps_document_reviews`, `cps_payment_events`, `cps_content_drafts`, `cps_published_pages`, `cps_catalogue`, `cps_catalogue_media`, `cps_workspace_receipts`, `cps_workspace_audit`.

There are **13 application functions**, all security invoker with an empty search path. Important RPCs: `cps_submit_rfq`, `cps_update_rfq`, `cps_workspace_mutate`, `cps_workspace_page`, `cps_admin_snapshot`, `cps_admin_selector`, `cps_catalogue_facets` and the catalogue photo receipt/mutation/resolution functions. Privileged mutation/administration/photo RPCs are server-only. Authenticated users can call the scoped workspace pagination function; anonymous users can call only the approved-public catalogue facet function.

Data API exposes only `public`; `graphql_public` was removed. Automatic grants for new tables are disabled, and default future table/sequence/function privileges were revoked for PUBLIC/anon/authenticated. Existing explicit service privileges remain. All 25 tables deny direct authenticated INSERT/UPDATE/DELETE. Anonymous SELECT is limited to RLS-filtered `cps_catalogue` and `cps_published_pages`, both empty. Other reads require the established trusted active company/staff memberships. Migration history is not an exposed schema. Current adapters use the generic official SDK and existing declaration files; no generated `Database` type is used, so none was fabricated or manually maintained.

## C. Private Storage and file security

| Bucket | Public | Maximum object | Allowed formats |
| --- | --- | --- | --- |
| `cps-rfq-private` | No | 1,048,576 bytes | PNG, JPEG, PDF |
| `cps-catalogue-private` | No | 1,048,576 bytes | PNG |

There are zero direct client policies on `storage.objects`. Upload/download/signing privileges remain server-mediated. Anonymous users, customers, agents and administrators could not directly list/download the private marker. Unprivileged upload and signed URL creation were rejected. The trusted server could retrieve the marker; the application correctly rejected it as quarantined even for authorized staff. Its public URL was inaccessible. Cleanup removed the marker and confirmed it could no longer be downloaded.

The marker was explicitly synthetic and quarantined; no fake clean scan was recorded. A missing scanner rejected application attachment persistence with 503. Production upload acceptance remains off. Existing signature/MIME/count/size/digest checks remain. Successful scanner-approved application upload/download, failed-upload orphan reconciliation, business retention and backup/restore acceptance remain pending.

## D. Auth and first administrator

Email/password Auth is enabled; public signup, anonymous sign-in and manual identity linking are disabled. Email confirmation is enabled. Local Site URL is `http://127.0.0.1:4419`; the exact allowlisted callback is `http://127.0.0.1:4419/auth/confirm`. No production origin was configured.

Real SDK and Next.js SSR cookies passed login, invalid credential handling, direct protected-route rejection, refresh, logout, membership revocation and application restart. Malformed JWTs and a modified expired JWT were rejected. An unmodified signed token was not held until its natural expiry, so full natural-expiry timing acceptance is not claimed.

Custom SMTP is disabled. No invitations, recovery messages or customer messages were sent. Email delivery, approved invite/recovery templates and recovery acceptance remain pending. Leaked-password protection is disabled and the dashboard states that it requires Pro or above; no paid upgrade was performed.

No real administrator was invented. All five disposable test users were removed. The minimal real-admin step is for the owner to create/verify the intended person's Supabase Auth account, confirm its actual UUID, and have a trusted operator assign the existing membership:

```sql
-- Only after verifying this is the owner-approved Auth user on this project.
insert into public.cps_staff_members(user_id,role,active,label)
values ('<verified-auth-user-uuid>'::uuid,'admin',true,'Approved administrator');
```

Do not use the dashboard account email or user-editable metadata as proof of app administration. If using invitations, configure approved SMTP and the application's `/auth/confirm` token-hash template first. Staff/office assignments and visibility of unassigned enquiries still need business approval before real memberships are provisioned.

## E. Actual enquiry persistence

The existing `saveProduction` adapter validated a disposable request and received a real hosted transactional RFQ reference. Eight concurrent calls returned the same reference and exactly one row. Reusing its key for changed content returned 409. A fresh process and an actual application restart retained the reference. A real logged-in Office A staff browser retrieved its detail; a real staff server action saved `UnderReview`, the internal note and audit event. Unauthorized retrieval was rejected.

This proves real hosted persistence and staff retrieval/review. It does **not** claim the complete public browser-to-Turnstile-to-RFQ flow: the public HTTP route correctly returns 503 without an acknowledgement because Turnstile is unconfigured. No production bypass was added. Both test RFQs and their related audit/attachment records were removed after acceptance.

## F. Hosted authorization acceptance

**23 actual-provider checks passed**, independently of the synthetic preview suites:

| Attempt | Actual result |
| --- | --- |
| Anonymous RFQ list/detail, staff and private CRM notes | Denied by Data API grants/RLS |
| Anonymous privileged ingestion RPC | Denied |
| Customer A reads Customer B request | No rows; each customer reads only its own company |
| Customer internal notes/guest RFQ contacts | No rows |
| Customer edits metadata to claim admin/another company | No staff or cross-company access |
| Office B reads Office A RFQ/company | No rows; direct staff detail returns 404 |
| Authenticated direct writes/admin RPCs | Denied |
| Revoked agent, existing session | RLS reads disappear; staff action returns `staff_access_required`; SSR redirects |
| Inactive customer | Company request reads disappear |
| Private object enumeration/download/signing/upload | Denied for unprivileged clients |
| Quarantined object through authorized staff download | 404 |
| Concurrent replay / changed-content replay | One acknowledged reference / 409 conflict |

Cleanup was restricted to recorded test IDs and ownership metadata. It verified zero remaining Auth users, RFQs, attachments, RFQ audit, memberships, offices, companies, portal requests and company notes, plus no remaining test object. No invented inventory or public content was seeded.

## G. Advisors

Final Security Advisor rerun: **0 errors, 0 warnings, 3 informational suggestions**. The three RLS-without-policy suggestions are intentional deny-client tables: `cps_catalogue_media`, `cps_offices`, `cps_workspace_receipts`. No permissive policy was added to suppress them. An earlier scan displayed “Leaked Password Protection Disabled”; the Auth control remains disabled/Pro-only even though the final database advisor warning count is zero. This limitation remains open.

Performance Advisor: **0 errors, 0 warnings, 10 informational unused-index suggestions**. Three initial unindexed foreign-key suggestions were fixed in migration seven. Remaining unused-index suggestions reflect this fresh project's acceptance workload; supporting indexes were retained rather than removed solely for low usage. Final counts/screenshots are recorded in ignored advisor evidence.

## H. Application verification

| Check | Fresh result |
| --- | --- |
| `npm test` | **59 passed**, 0 failed/cancelled/skipped; original 58 retained plus release environment privacy regression |
| `npm run typecheck` | Passed, exit 0 |
| `npm run build` | Passed, exit 0; one CPU; standalone assets packaged |
| Hosted SDK acceptance | 23 passed |
| Hosted browser acceptance | 15 passed across first login/security/mobile, actual restart/logout and persisted staff review phases |
| Existing RFQ browser suite | Passed, exit 0; isolated synthetic development fixture |
| Existing CRM/customer browser suite | Passed, exit 0; 20 desktop/mobile visits; one expected injected 503 |
| Existing navigation suite | Passed, exit 0; desktop/tablet/mobile, local fonts/images, anchors and failure barriers |
| Existing packaged release suite | Passed, exit 0; disabled production preview/local backend/provider/photo/recovery/indexing gates |
| Secrets/privacy | Candidate source Gitleaks clean; server secret absent from source and all 2,453 scanned production build files |

No unexpected page/console errors or document overflow remained. Hosted desktop RFQ/CRM and mobile staff views were visually inspected. Browsers used isolated headless Chrome profiles. Regression fixture/release servers were stopped; the real-provider development server remains on port 4419. No package upgrades or interface redesign occurred. No lint script exists.

Release sanitization now also strips environment-file references and generated environment copies from standalone output, preserving the actual ignored source environment and `.env.example`. Final build excluded private fixtures/evidence/env; its guard removed three private trace references. Logs, screenshots, migration hash receipts and test results remain locally under ignored `evidence/`. Disposable test passwords/cookie-state files were removed after hosted cleanup.

## I. Git

Owner-authorized publication is safe source/config/migrations/docs only, to `https://github.com/Fazilfazi991/Chinapartfinal.git`, branch `main`, using “Activate dedicated Supabase backend for China Parts enquiries”. Pre-staging and staged secrets/privacy review are required. Exact local/remote commit receipts and clean-tree state are recorded after push in ignored `evidence/activation-git-verification.json` and the completion response; a commit cannot include its own SHA. `.env.local`, private data, test state, evidence, tooling and builds remain ignored.

## J. Remaining blockers

- **Turnstile:** configure approved site hostname, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and server-only `TURNSTILE_SECRET_KEY`; perform complete live challenge/submission/retry acceptance before enabling `CPS_SUBMISSIONS_ENABLED`.
- **Scanner:** approved real scanning endpoint/token (`CPS_SCANNER_URL`, `CPS_SCANNER_TOKEN`), exact-digest safe/malicious/outage acceptance, authorized clean downloads and orphan/retention rules before enabling `CPS_UPLOADS_ENABLED` or catalogue photos.
- **SMTP:** approved sender/provider, invite/recovery token-hash templates, rate limits and actual delivery/one-use acceptance before enabling recovery or customer accounts.
- **Administrator:** owner-confirmed real Auth identity/UUID and trusted membership; no real user currently exists.
- **Public content:** approve contact/company/legal/privacy/terms, claims/asset rights/catalogue facts, staff visibility and launch feature flags. No invented public catalogue was added.
- **Operational/hosting:** approved HTTPS production origin, final redirects, backup/restore and retention ownership, region/latency decision if Sydney is unsuitable, separate Vercel/environment/domain authorization. Generic CRM writes and deferred customer/publication features remain off.

Payments, checkout, final invoice issuance, carriers, automated shipping, supplier routing and commercial fulfilment remain disabled.

## K. Deployment

**Vercel production deployment was not performed.** No domains, Vercel production environments, old deployments, recovery source, reference demo, LMT or Fusion were changed.
