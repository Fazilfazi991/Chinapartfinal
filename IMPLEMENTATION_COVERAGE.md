# Full proposal coverage — pagination/recovery closeout, 5 October 2026

## Current launch scope clarified on 5 October 2026

The owner has clarified an enquiry-first launch with no online selling; Supabase will be supplied later. Payment/shipping integrations, final invoice issuance and commercial order execution are conditional later scope, not mandatory enquiry-launch prerequisites. Preserve the broader written proposal separately. Read LAUNCH_SCOPE.md and PROJECT_HANDOFF.md before interpreting older commercial completion wording. Existing draft/preview code is retained; provider activation, approved content and launch acceptance remain required for enabled features.

Authority: this matrix/CURRENT_HANDOFF.md. Evidence uses parent-verified proposal extracts; PROPOSAL_PENDING_CHECKLIST.md preserves source limits. Provider implemented means code verified locally against synthetic provider/real PostgreSQL fixtures, not hosted activation. The demo is unchanged.

| Requirement/evidence | Screens implemented | Provider implementation | Remaining code/decision |
| --- | --- | --- | --- |
| Responsive brand/assets, p2/calls | Home/fonts/nav/equipment-category enquiries | Next packaged release | Approved assets/claims/contacts |
| Sparse examples hidden, calls | Original finder/search/showroom samples hidden | Preserved, no sample fallback | Does not cancel catalogue |
| Catalogue, p2 | Admin create/edit/filter/draft/archive/approve/publish/withdraw; single-photo picker/retry/private preview/remove; customer filters/details; gated public search/facets/12-entry pagination/detail/images and labelled illustrations | Anonymous RLS/current-version review/edit withdrawal; bounded PNG/JPEG decode/metadata stripping/exact-byte scanner/private Storage/transactional media/audit/idempotency; mediated current-image reads | Approved inventory/assets/rights; hosted scanner/bucket acceptance and retention; multi-image gallery only if requested |
| RFQ/contact/parts/photo/list, p2/calls | Public 5 steps/back/draft/review/retry/upload; customer multi-part requests | Private ingestion/Turnstile/scanner; customer transaction; admin reviewed guest linking | Hosted acceptance; Guest image/PDF/manual list attachment flow exists; CSV/XLSX parsing/account-side uploads need explicit format/scope confirmation |
| Customer portal/status/comments, p2 | Provider login/invite/password/logout/recovery, dashboard/paged requests/conversations/detail reload | Official SDK/SSR/fresh membership/company RLS/durable transactions | Recovery UI/token flow implemented and independently disabled; hosted email/session/MFA/expiry/replay acceptance and account policy; no public signup |
| Admin/CRM, p3 | Paged staff RFQ inbox/detail/private files/review/linking; paged workspace lists/conversations, older detail/parent lookup, scoped selectors/contact/private notes/office views | Active staff Auth/office RLS/review/support/contact writes; company creation adapter | Admin office/existing-account/company/guest+portal assignment UI implemented; target/policy acceptance; private record/selector pagination and older-parent hydration implemented |
| Orders, p3 | Request-derived drafts/items/internal status/edit | Company-consistent private drafts; admin review/share/withdraw/archive/restore under disabled policy gate | Confirmed order/acceptance/fulfilment/cancellation/stock/price execution absent |
| Shipping/tracking, p3 | Internal manual events, customer timeline if explicitly visible, shipping page | Scoped reads/writes; policy-gated current-version review/share; parent withdrawal locks | Approved visibility/fulfilment/partial shipment rules; optional carrier/booking integration only for the selected scope |
| Invoices, p2 | Explicit currency/precision/minor units/unknown tax/print draft | Private validated drafts; admin review/share gate and archive/restore; parent ownership; issuance disabled | Entity/tax/numbering/issuer/commercial lifecycle/final document output and issuance remain; draft sharing needs accepted policy |
| Gateway/history, p2 | Event view; payment disabled | Scoped event schema/read/unique event IDs; missing precision honest | Gateway/workflow and signed webhook/replay/reconciliation/checkout still code; no charges |
| Communications/chat, p3 | Persisted support/replies/status/comments; scripted assistant/WA-email links | Scoped support transactions/RLS, sending disabled | Channel/notification/live-chat integration; AI/routing not added |
| Standard pages, p4 | About/contact/FAQ/how it works/shipping/guides/policy notice; drafts/review/plain-text publication | Admin transaction/safe published snapshot/anonymous RLS | Approved legal/company/contact copy and publication acceptance; rich media only if requested |
| SEO, p4 | Metadata/robots/paged approved-public sitemap/canonical metadata/default noindex/private exclusion | Approved HTTPS origin + explicit flag | Approved origin/content/keywords/entity claims and Search Console acceptance; sitemap/canonical projection implemented |
| Analytics, p4 | No external collection | Disabled | Provider/events/consent/privacy and implementation pending |
| 1-year hosting/SSL, p4 | Earlier separate foundation deployment; current local standalone | Durable adapters prepared; fixtures excluded | Domain/SSL/ownership/support/renewal/commitment/publication acceptance |
| Contact/duplicate CTA, calls | Existing floating/expert WhatsApp actions | No messages | Approved digits/exact duplicate section |
| Languages/vendor registration, calls | English; no unapproved registration | Disabled | Translation/RTL/timing/simple form decision then implementation |
| Supplier portal/mobile apps, p4 | Absent | Excluded | No silent expansion |
| Quote author/revisions/acceptance/cart | Absent; quotation prose only | Not inferred module | Explicit scope approval |

All external capabilities stay disabled pending configuration/schema/permission and actual provider acceptance. Generic drafts are working code; final commercial execution is not implemented. Credentials alone do not complete the full proposal.

Administration and safe draft transitions: ADMINISTRATION_AND_VISIBILITY.md. Existing provider accounts only; no invitations/password creation, external execution or hosted changes. The single-photo pipeline is implemented; approved actual assets, hosted acceptance and retention remain. Managed illustrations are labelled.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.
