# China Parts Shop Demo Source Review

## Confirmed identity

The user explicitly selected https://github.com/Fazilfazi991/chinapartsshop.git. Default branch: main. Vercel project: chinapartsshop (internal provider IDs omitted). Vercel returned a READY latest deployment and these aliases:

- https://chinapartsshop-zeta.vercel.app
- https://chinapartsshop-faziils-projects.vercel.app

These are metadata-verified aliases; no browser runtime verification was performed. A different repository, Fazilfazi991/chinaparts, is an older static mobile prototype and is not the selected source.

No matching clone was found in a bounded directory scan of Desktop/Projects, Documents/Codex, and .codex/worktrees. This is not a whole-disk search.

## Source inspected read-only

- app/page.tsx, blob 9f3bc01df7ec7d3d38781fcc94d491879c983976
- app/layout.tsx, blob 6b32138923e6f50eb1174b067a4c321827f4d52a
- package.json, blob d29f0e22eb921d9d1a80e9f0b73ed60661f91b8b
- README.md and AGENTS.md returned 404 at repository root.

The package identifies china-parts-shop-demo, Next.js ^15.5.21, React 19.0.0 and TypeScript 5.7.2. These are observed demo versions, not a reviewed dependency recommendation for production.

## Observed workflow

Customers include vehicle owners, workshops, fleet operators, spare-parts dealers, equipment companies and procurement teams. Discovery uses brands, equipment makes and categories. Requests can reference part descriptions, OEM numbers, VIN/chassis details, photographs/nameplates or bulk parts lists. Quality choices are Genuine, OE, OEM, Aftermarket and Replacement.

The presented business sequence is requirement capture, part identification, sourcing and verification, quotation, customer confirmation, processing and delivery. A five-step RFQ presents contact information, vehicle/equipment details, part requirements, uploads and review. WhatsApp is a direct external link. The assistant is a scripted demonstration.

## Production gaps visible in inspected source

RFQ inputs are uncontrolled and unmounted between steps; their values are not retained for a real review/submission. The upload control does not upload. The success screen expressly states that nothing was sent. Brand/category browsing produces a production-placeholder message. Chat responses use local scripted state. Customer portal, enquiry tracking, privacy/terms and guide content are not implemented by this page. The inspected page and package expose no persistence, authentication or backend submission integration; a full repository inventory is still required before claiming none exists elsewhere.

The source contains a WhatsApp telephone and business email. Their production ownership and permission to publish/use must be verified; do not send messages during development. Brands, service regions, availability and delivery claims are explicitly provisional in the page's prototype notice.

## Source retrieval resolved

A complete shallow clone now exists at `reference-demo`, commit `2d7e7ae4ec84f08a039babd9b8dc0315886d6330`. The HTTPS helper was present in the installed Git distribution; setting GIT_EXEC_PATH to its mingw64/bin folder repaired retrieval. No new Git software or credentials were installed. The original reference checkout remains clean.

Full inventory: one page, layout, global stylesheet, public images/logos, package manifest/lockfile and TypeScript configuration. No backend, service configuration, AGENTS.md or .agents instructions were present. The independent working copy now has an RFQ page and local-test API; those additions do not exist in the original reference.

