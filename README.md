# China Parts Final

Current multi-page client review: see [MULTIPAGE_IMPLEMENTATION_REPORT.md](MULTIPAGE_IMPLEMENTATION_REPORT.md). Public navigation now leads to complete category, resource, supplier, technical and contact destinations. The original industrial homepage hero is restored at the owner's request. The enquiry-first strategy and security gates are retained. Source changes use `codex/multipage-client-review` because the connected `main` branch triggers Vercel Production deployments.

Current client-review implementation: read [CLIENT_FEEDBACK_IMPLEMENTATION_2026-10-07.md](CLIENT_FEEDBACK_IMPLEMENTATION_2026-10-07.md) and PRODUCT.md. The homepage now captures requirements, with correct brand/category/part-number entry, three public quality choices, one sales WhatsApp control and technical-help enquiry context. Supplier registration has separate private persistence/reference/audit and staff review. Public supplier ingestion has its own `CPS_VENDOR_SUBMISSIONS_ENABLED=false` default; Turnstile/scanner and production deployment remain gated. Historical activation reports describe the previous seven-migration baseline; the additive supplier migration is the eighth.

Enquiry-first China auto parts website: customers capture vehicle/part/contact requirements, optionally attach supported references, and authorised staff manage enquiries and follow up. The first launch has no online selling.

This independent baseline was migrated from the latest local China Parts Shop Production working tree on 7 October 2026, including its later unpushed changes. Destination: https://github.com/Fazilfazi991/Chinapartfinal, branch `main`. The dedicated real Supabase backend is now connected and locally verified. Read [SUPABASE_ACTIVATION_REPORT.md](SUPABASE_ACTIVATION_REPORT.md) and PROJECT_STATUS.md for current acceptance and limitations. Earlier handoffs describe historical milestones.

## Stack and modules

Node 24, npm lockfile, Next.js 15 App Router, React 19, TypeScript, official Supabase SDK/SSR, PostgreSQL RLS/private Storage, Sharp and local brand assets/fonts. Exact dependency versions are pinned in package.json/package-lock.json.

- Public enquiry-first homepage, responsive navigation, category/brand enquiries, guides/information/policy pages and gated SEO.
- Five-step RFQ with validation, draft/back/next/review, bounded PNG/JPEG/PDF uploads, retry and acknowledged idempotent persistence.
- Staff enquiry inbox/detail/status/private notes/audit, office scope, customers and administration.
- Customer Auth/recovery, company requests/comments/support; reviewed catalogue/content publication and gated private photos.
- Internal order/invoice/tracking drafts retained for future scope; commercial execution is disabled.

## Local setup

Use Node 24 and the existing npm lockfile. No package upgrades are required.

The owner's local `.env.local` already contains the actual dedicated Supabase configuration. Keep it ignored and do not overwrite it. Real-provider development runs with:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 4419
```

Auth and workspace reads use Supabase; public RFQs/uploads, generic workspace writes and customer/publication features remain gated. No real administrator exists until an owner-approved Auth UUID receives the trusted membership described in the activation report.

For a separate clean clone with **no real credentials**, synthetic review setup is:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
# Keep provider feature flags false and credential fields empty for safe review.
$env:CPS_PREVIEW_ENABLED = 'true'
$env:CPS_LOCAL_TEST_BACKEND = 'true'
$env:CPS_SUBMISSIONS_ENABLED = 'true'
npm run dev -- --hostname 127.0.0.1 --port 4417
```

Open http://127.0.0.1:4417/ and /request. Synthetic staff review: /preview/admin/overview, /preview/admin/requests, /preview/admin/customers, /preview/admin/administration. Customer review: /preview/customer/overview. These flags enable development-only fixtures and local RFQ persistence; they send no company enquiry or customer message. Success is shown only after a local reference is acknowledged. Private fixtures are generated locally under .local-data and never committed. Local flags and preview are blocked in production.

`.env.example` contains variable names/empty placeholders and disabled feature flags. Store real secrets only through approved untracked environments/provider dashboards, never source or chat. Provider routes fail closed without approved configuration. The new repository is public.

## Checks and release

```powershell
npm test
npm run typecheck
npm run build
```

Run production checks in a fresh shell without the development flags above; keep provider flags false in .env.local. No lint script is defined. The build runs the production configuration guard, uses one CPU, sanitizes private fixture traces, and packages public/static assets into `.next/standalone`. A local release smoke run uses `PORT=4418`, `HOSTNAME=127.0.0.1` and `node .next/standalone/server.js`. Rebuild on the approved hosting OS before any separately authorized release. Browser/SQL integration scripts use installed Playwright/Chromium/psql through the documented CPS_* environment variables; do not copy private machine tools into source.

## Production activation and scope

The dedicated project `cjregchcuxjcqazokqid` has seven applied migrations in `supabase/migrations`, 25 RLS-enabled application tables, real Auth and two private Storage buckets. Hosted persistence, scoped retrieval/review, sessions/revocation and private Storage denial passed. The `database/` SQL files remain historical creation references; do not replay them or regenerate applied versions. See the activation report for the authenticated-dashboard execution method and verified history. Full public Turnstile/submission, real scanner/file acceptance, SMTP, real admin, content/visibility and operational/backup acceptance remain required. Enable only accepted features.

Payment/checkout/cart, final invoices, commercial fulfilment, carrier booking and automated shipping remain deferred and disabled. Future implementation requires confirmed business/provider choices. Customer portal/catalogue/publication/draft sharing launch timing remains an owner decision. See LAUNCH_SCOPE.md, IMPLEMENTATION_COVERAGE.md and REMAINING_DECISIONS.md.

Vercel production deployment was not performed. The authoritative recovery folder, original reference demo, previous deployments, LMT and Fusion are untouched.

