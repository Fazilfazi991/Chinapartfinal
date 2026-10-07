> Current dedicated-provider status, 7 October 2026: see [SUPABASE_ACTIVATION_REPORT.md](SUPABASE_ACTIVATION_REPORT.md). Seven migrations are actually applied on the approved China Parts project; hosted Auth, RLS, private Storage and no-attachment persistence/staff review acceptance passed. The older unconfigured/no-hosted-execution statements below are historical. Public Turnstile submissions, real scanning, SMTP/recovery, real administrator and deployment remain gated. Do not replay database templates or regenerate applied migration versions.

# China Parts Shop project handoff

Verified local handoff prepared 2026-10-05T09:27:52.435156+00:00.

## Purpose and launch decision

This is the complete local project handoff for continuing China Parts Shop in a new Codex project. The authoritative current implementation is the local folder or the fresh handoff source ZIP, not a fresh clone of GitHub alone. The GitHub repository contains the earlier foundation; later provider/workspace/catalogue/recovery work remains uncommitted locally.

Latest owner clarification: the first launch is enquiry-first, with no online selling. The owner supplies Supabase later. Payment gateways, shipping/carrier integrations, final invoice issuance and commercial order execution are conditional later scope. The broader written proposal is preserved separately rather than silently cancelled. No feature code, push, deployment, credential or real-data change was made for this handoff.

## Project and source locations

| Item | Verified location or state |
| --- | --- |
| Working folder | C:\Users\USER\Documents\Codex\2026-10-01\task-2\China Parts Shop Production |
| Production origin | https://github.com/Fazilfazi991/chinapartsshop-production.git |
| Branch and local HEAD | main / f42a7513f51f394c0fc500d43502ca701a3ce739 |
| HEAD subject | Add verified China Parts production RFQ and staff foundation |
| Working tree | Dirty: initial handoff inspection found 37 tracked modifications and 159 untracked entries, including evidence. Documentation/evidence added by this handoff can increase the count. Later work has not been committed/pushed. |
| Read-only reference | reference-demo; https://github.com/Fazilfazi991/chinapartsshop; clean commit 2d7e7ae4ec84f08a039babd9b8dc0315886d6330 |
| Original demo alias | https://chinapartsshop-zeta.vercel.app |
| Earlier production foundation | https://chinapartsshop-production.vercel.app; recorded READY deployment of f42a751 on 1 October, backend unconfigured. Current handoff does not assert fresh public runtime verification. |
| New source archive | deliverables/china-parts-production-handoff-2026-10-05.zip |
| New full report | PROJECT_HANDOFF.md; deliverables/China Parts Full Project Handoff 2026-10-05.md and .html |
| Previous verified archive | deliverables/china-parts-production-verified-2026-10-05.zip; 196 source files, 11,887,307 bytes; SHA256 C6DB4A006217AF09205B3ED10E521D871CEE9A1891D157EBD47F7947332D9148 |
| Previous verified brief | deliverables/China Parts Verified Handoff 2026-10-05.md |
| Evidence and new artifact hashes | evidence/pagination-recovery-closeout-summary.json; evidence/pagination-recovery-closeout-delivery-manifest.json; evidence/project-handoff-delivery-manifest.json |

## How to open a new Codex project

Use the supported Codex project-folder picker to open the working folder above. This keeps its Git metadata, uncommitted source, ignored evidence and current dependencies. No supported sidebar-registration tool was exposed; internal Codex app configuration was not changed.

For a genuinely separate folder, extract the fresh handoff ZIP into a new empty project folder and open that folder. The ZIP contains source and the package lock; it excludes .git, node_modules, generated builds, reference-demo, evidence, tools, private local data and environment files except .env.example. Install dependencies there. Do not overwrite the old demo or use the older GitHub clone as the sole copy of current work. The original reference is identified by URL/commit rather than bundled. Bring evidence from the existing folder only if needed; never copy credentials or private fixture data as production data.

## Technology and architecture

| Layer | Current implementation |
| --- | --- |
| Runtime | Node 24 on the Dell; cached executable observed as Node 24.19 in the prior verified milestone. |
| Application | Next.js 15.5.27 App Router, React 19.0.8, TypeScript 5.7.2, preserved brand assets and local fonts. |
| Provider adapters | @supabase/supabase-js 2.117.2; @supabase/ssr 0.12.7; Postgres and private Supabase Storage. |
| Images | Sharp 0.35.5; bounded PNG/JPEG decode, metadata removal, safe re-encoding and exact stored-byte scan. |
| Authentication | Official SDK/SSR getUser, fresh active company/staff memberships, company/office scope and administrator controls. No homemade authentication. |
| Persistence | Production records use external Postgres/private Storage. Disk fixtures are explicitly development-only and blocked in production. |
| Validation and writes | Canonical server validation, per-operation/digest idempotency, row versions/locks, atomic business record/audit/receipt and reviewed visibility. |
| Packaging | Standalone Next output; one CPU for builds; generated private-fixture references removed; public/static assets packaged. |

## Normal local run commands

```text
Set-Location -LiteralPath 'C:\Users\USER\Documents\Codex\2026-10-01\task-2\China Parts Shop Production'
# Reuse the healthy 4317 server; only run this if that port is not already serving this project.
$env:CPS_PREVIEW_ENABLED = 'true'
$env:CPS_LOCAL_TEST_BACKEND = 'true'
$env:CPS_SUBMISSIONS_ENABLED = 'true'
npm run dev -- --hostname 127.0.0.1 --port 4317
```

## Run command details

These flags enable synthetic development fixtures and local-test RFQ persistence only. They do not activate Supabase, send enquiries to the company, take payments or issue invoices. The current 4317 server was reused and remains running. The homepage returned HTTP 200 during this handoff inspection.

Normal new-folder setup uses Node 24 with npm, then npm ci from the package lock. On this Dell, the prior approved runtime uses node .tools/npm/package/bin/npm-cli.js instead of npm; replace the npm prefix in commands if the standard npm command is unavailable. That private tooling folder is intentionally excluded from the source ZIP. Do not install arbitrary replacement software or run another server on the occupied port.

## Checks and packaged production run

```text
npm test
npm run typecheck
npm run build
# Exact packaged release, after build. This is a local smoke run with provider features disabled.
$env:PORT = '4318'
$env:HOSTNAME = '127.0.0.1'
node .next/standalone/server.js
```

## Review URLs

Website: http://127.0.0.1:4317/ . Enquiry: http://127.0.0.1:4317/request . Preview hub: http://127.0.0.1:4317/preview . Staff: http://127.0.0.1:4317/preview/admin/overview . Administration: http://127.0.0.1:4317/preview/admin/administration . Customer: http://127.0.0.1:4317/preview/customer/overview .

127.0.0.1 addresses work on the Dell itself, not another phone/computer. The preview is visibly labelled synthetic and development/loopback-only. Provider routes are /staff, /customer-access and /workspace/admin or /workspace/customer; without configured provider access, they show an honest setup/access barrier. Do not treat the preview actor selector as authentication. Current local-run screenshots exist in evidence/local-run-staff-desktop.png, local-run-customer-mobile.png and local-run-request-mobile.png; visually inspected. The terminal disconnected while returning that lightweight browser run, so no completed result receipt is claimed for it. The earlier full verified browser milestone remains the test evidence.

## Implemented code and its activation state

| Area | Working code | Current boundary |
| --- | --- | --- |
| Public presentation | Responsive enquiry-first home, brand/category enquiry links, navigation/local fonts and information/guide/policy routes. Sparse search/finder/showroom examples hidden. | Approved company/contact/legal/assets/claims required. No invented live inventory. |
| Guest RFQ | Five steps, retained/back-next/reload/review/retry, optional bounded device draft, validation, local persistence acknowledgement and provider submission adapter. | Production submission disabled until target/access/anti-abuse acceptance. Success only follows acknowledged persistence. |
| RFQ files | Three files of 1 MB each, PNG/JPEG/PDF signature checks, 4 MB multipart limit, digest scanner attestation, private storage and staff-authorised streamed downloads. | Scanner/Turnstile fail closed; no private object URLs leaked. Live buckets/providers/retention acceptance pending. |
| Staff enquiry review | Paged office-scoped guest inbox/detail, statuses/internal notes/audit/private downloads and administrator reviewed guest-to-company linking. | Authoritative staff Auth and access policy must be provisioned. No unapproved ownership linking. |
| Customer portal | Official sign-in/invite/password/logout/recovery, company-scoped requests/multiple part lines/comments/support/status/detail reload. | Code tested against synthetic provider. Owner decides launch timing/accounts; hosted Auth/SMTP/session acceptance pending. No public signup. |
| Workspace and administration | Contacts/private CRM notes, company/office/existing account membership, assignments/revocation/last-admin safety; scoped lists and older record/native selector hydration. | Official provider reads/writes remain gated. No Auth account or invitation is created/sent by membership UI. |
| Catalogue and content | Draft/edit/archive/review/publish/withdraw, anonymous keyword/facet/page/detail reads, labelled illustrations, gated single main photo and safe plain-text pages. | Approved actual records/assets and publication policy pending. Draft edit withdraws public approval. No price/stock/fitment promises. |
| Internal order/invoice/tracking drafts | Request-derived models, explicit currency/precision/minor-unit arithmetic, unknown-tax treatment, draft print/manual events and audit. | Private draft workflows, with optional policy-gated reviewed sharing. No final issue, checkout, stock/price commitment or shipment booking. Later commercial scope. |
| Draft visibility | Current-version review/share/withdraw/archive/restore and parent/child invalidation/locking. | Disabled unless owner-approved draft types/actors/reference are configured. Customers cannot see private notes/review evidence. |
| SEO | Metadata, default noindex, anonymous paged approved-public sitemap/canonical projection and withdrawal. | Approved HTTPS origin/indexing/content gates required. Private records/files excluded. |
| Support and integrations | Persisted support/comments and existing WhatsApp/email click-through links; payment-history view/schema. | Scripted assistant is demo-only. Live chat, outbound messaging, analytics, gateway/carrier execution are not active. |

## Demo versus provider implementation

The original reference was a client preview with visual RFQ controls, non-uploading upload UI, scripted assistant and a success screen explicitly saying nothing was sent. The separate project implements retained/validated capture and real local/provider transaction paths.

/preview uses synthetic records and actor selection for reviewing the broader proposal. Provider routes have real SDK/server/SQL adapters tested locally against actual PostgreSQL, with synthetic Auth/Data/Storage/scanner fixtures. Provider-ready describes implemented and tested code; it does not mean a live Supabase project or accepted production security exists. No fallback to synthetic actors/data is used in provider routes.

## Proposal and call reconciliation

SOURCE_REVIEW.md records the confirmed original repository and workflow. PROPOSAL_PENDING_CHECKLIST.md preserves the four-page scanned proposal and parent-verified extraction. Local direct materialisation of that PDF was blocked by the Windows helper lacking os.setxattr. Call timestamps are approximate parent-supplied machine-translated notes, not a verified transcript in this checkout. Do not present them as independently transcribed contractual evidence.

The broader proposal covers catalogue, RFQ, portal status/comments, payments/invoices, CRM/orders/tracking/communications, standard pages, SEO/analytics and hosting/SSL. Latest owner clarification phases launch as enquiry-first with no online selling. Preserve broader future requirements but do not make conditional payments, carrier integration or invoice rules launch blockers. Supplier portal/mobile apps remain excluded; domain ownership and any hosting service commitment require separate acceptance.

RFQ photo/list receipt and portal status/comments are evidenced. Account-side uploads, multi-image galleries, structured CSV/XLSX parsing, quote-authoring/cart, carrier automation, translations and vendor registration are not newly mandatory without explicit scope. English is current; language/RTL/registration timing and approved contact digits/exact duplicate CTA remain decisions. The detailed requirement-to-screen map is IMPLEMENTATION_COVERAGE.md; older checklist implementation assessments are historical, not the current code inventory.

## What is genuinely needed for enquiry launch

- Dedicated Supabase project/region and approved hosting origin/target from the owner; store keys through provider settings/untracked environment, never chat or source.
- Accepted initial administrators/offices, staff access and unassigned-enquiry policy; invitation/customer-company policy only for portal features chosen at launch.
- Review/generate/apply the needed schema templates on the approved dedicated target; verify real role grants, RLS, inactive/anonymous/cross-office denial and private downloads.
- Configure and verify Turnstile hostname/action; private Storage and exact-digest scanner for enabled uploads. Decide approved upload limits/retention and safe orphan handling. Missing scanner must disable uploads rather than pretend they are accepted.
- Verify actual hosted Auth/session expiry/revocation; SMTP/invite/recovery/MFA where enabled; persistence after redeploy and backup restore/ownership.
- Approve public business/contact/legal copy, logo/brand asset rights and enquiry/help destinations. Keep unapproved catalogue/publication/indexing features gated.
- Run actual-provider desktop/mobile/error recovery acceptance, then obtain explicit publishing authorisation for the separate target. No new launch code gap beyond these configuration/content/acceptance decisions was established in this bounded handoff.

## Conditional later work and its required decisions

- Final orders/invoices: only if commissioned; supply accepted status/fulfilment/cancellation rules and a redacted final document sample, issuer/fields/numbering/currency/precision/tax and output format. Existing drafts are not final issuance.
- Payments: only if commissioned; choose provider and payment trigger/refund/reconciliation scope before implementing selected-provider checkout/signed webhooks/replay/idempotent ledger and acceptance.
- Shipping/carriers: only if commissioned; choose accepted manual updates versus a named provider, partial shipments and event actors before booking/carrier integration.
- Notifications/live chat/analytics: decide launch-versus-later timing, provider/channels/routing/templates/consent and allowed events. Current comments/support need no external sending.
- Clarifications: structured bulk parsing, portal attachments, multiple photos, languages/RTL, vendor registration, quote revisions/acceptance/cart and automatic supplier routing require explicit scope; they are not silently added.

## Provider templates and configuration

- Review order: database/bootstrap.sql -> workspace-template.sql -> workspace-writes-template.sql -> administration-template.sql -> catalogue-photos-template.sql -> workspace-pagination-template.sql. Templates are one-time object creation references, not applied/rerunnable hosted migrations. Generate actual migration files via the approved CLI after target authorisation; review the minimum target/schema needed for accepted features.
- Setup documentation: PROVIDER_ACTIVATION.md, SUPABASE_SETUP.md, database/README.md and DEPLOYMENT.md. Visibility/admin rules: ADMINISTRATION_AND_VISIBILITY.md. Scope and inputs: LAUNCH_SCOPE.md, IMPLEMENTATION_COVERAGE.md and REMAINING_DECISIONS.md.
- .env.example documents names only. All submissions/uploads/workspace/customer recovery/publication/catalogue/linking/draft sharing/photos/SEO flags default off. Public publishable URL/key are distinct from server-only secret/scanner/Turnstile keys.
- Keep CPS_DOCUMENT_VISIBILITY_ENABLED=false and the policy empty unless the owner approves draft sharing. Production disk persistence and synthetic preview remain blocked even if local flags are set. Rebuild standalone on the hosting OS before approved deployment.

## Verification and known limits

The latest full milestone passed 58 Node tests with no skipped tests, TypeScript, actual Supabase SDK/isolated PostgreSQL 17.11 permission/transaction tests, Next SSR/server-action browser checks, desktop/mobile synthetic preview regression, one-CPU production build and exact fresh standalone smoke. Browser coverage included seven customer mobile and eleven staff desktop screens without unexpected page/console errors; one expected injected preview 503 exercised retry.

Checks cover repeated/concurrent submissions and idempotency, rollback, stale versions/digest conflicts, unauthenticated/inactive/cross-office/company/dual-role/direct RPC denials, staff scope/private attachment downloads, scanner/Storage outage and digest/decoder/size checks, revocation/reassignment/last-admin and parent/child sharing races, older page/detail/selector reload, one-use recovery and approved-public catalogue/index withdrawal. Detail refresh uses loaded.find(...) so a saved older off-page record reflects canonical values.

Build sanitisation removed twelve generated private-fixture references. Standalone smoke deliberately enabled the correct local-test/preview flags; production submission/workspace/recovery/photo gates still failed closed, preview stayed 404 and indexing stayed off. Owned PostgreSQL PID6120/port6547 and release PID2568/port4318 were verified and stopped normally; the loopback preview on4317 stayed running. Prior transport interruptions were reconciled rather than represented as successful runs.

Evidence: VERIFICATION.md, evidence/pagination-recovery-closeout-summary.json, pagination-recovery-closeout-unit-tests.txt, pagination-recovery-provider-results.json, provider-workspace-browser-results.json, workspace-browser-results.json, catalogue-photo-provider-results.json, administration-provider-results.json and release-results.json. Tests prove local code behavior against approved fixtures, not actual hosted JWT cryptography/SMTP/scanner/MFA/redeploy/backup or commercial acceptance. This request changes documentation only, so no heavy rebuild/test rerun was needed.

## Delivery and publication state

The separate production repository and earlier foundation deployment were recorded as private/READY at f42a7513f51f394c0fc500d43502ca701a3ce739. This handoff reads local Git metadata and historical receipts; it makes no new remote mutation or fresh hosted runtime claim. Latest code is local/unpublished, and the original demo remains read-only.

Old source/brief snapshots are retained. The new source ZIP includes the launch clarification and full report; validate hashes/CRC/exclusions in evidence/project-handoff-delivery-manifest.json. The earlier Library helper failed before a confirmed write and returned no current IDs. Current Library read access succeeded during this request. Save only through the currently supported prepared path after artifact validation, report each confirmed result, and never substitute a direct write for a started helper operation. The final response records the actual save outcome rather than treating older Library IDs as this snapshot.

## Self contained continuation prompt

```text
Use GPT-6.1 Sol only. Continue China Parts Shop from the supplied fresh source ZIP or the exact existing folder C:\Users\USER\Documents\Codex\2026-10-01\task-2\China Parts Shop Production. Do not start from GitHub alone: origin https://github.com/Fazilfazi991/chinapartsshop-production.git is the earlier main foundation at f42a7513f51f394c0fc500d43502ca701a3ce739; later work is dirty and unpushed locally. Read AGENTS.md, PROJECT_HANDOFF.md, LAUNCH_SCOPE.md, CURRENT_HANDOFF.md, IMPLEMENTATION_COVERAGE.md, REMAINING_DECISIONS.md, PROVIDER_ACTIVATION.md and VERIFICATION.md. Preserve reference-demo (https://github.com/Fazilfazi991/chinapartsshop, clean 2d7e7ae4ec84f08a039babd9b8dc0315886d6330), LMT and Fusion; LMT has CPU priority. The accepted first launch is enquiry-first with no online selling. Supabase is supplied later. Prioritise approved RFQ/contact/private upload/staff follow-up activation and acceptance. Keep payment/carrier/final invoice/commercial order execution disabled and conditional later; preserve the broader proposal without silently making those launch blockers. Use official provider documentation and existing SDK/RLS/private-storage adapters, not homemade authentication or synthetic production success. Reuse healthy loopback preview4317. Do not copy private fixtures/credentials as production data or request secrets in chat. After the owner identifies and authorises a dedicated target, review/generate migrations, configure approved accounts/access/anti-abuse/files and test actual anonymous/inactive/cross-office/company/private-file denial, concurrent/idempotent saves, scanner/challenge outage, hosted sessions/redeploy durability and restore, and mobile error recovery. Enable only accepted features. Do not push/deploy/send messages/payments/change real data without explicit authorisation and verified new target boundary. Update scope and evidence honestly; report blockers and deliver concrete source/brief artifacts.
```

