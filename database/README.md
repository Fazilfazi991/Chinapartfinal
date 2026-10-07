Current closeout, 5 October 2026: workspace/guest-inbox/detail/parent/selector/conversation pagination, official gated recovery and approved-public sitemap/canonical code are implemented locally. The sixth review template is workspace-pagination-template.sql, after catalogue-photos. Read REMAINING_DECISIONS.md for current mandatory-versus-clarification scope; historical first-50/recovery/sitemap/account-upload gap statements below are superseded. Recovery and hosted capabilities remain disabled; no hosted application/email/push/deployment occurred.

Current administration/catalogue addition: apply the reviewed administration-template.sql only after the three existing templates on an approved dedicated target. It adds offices/membership versions/assignment, private review evidence/current-version draft sharing, managed illustrations/indexed public search/facets and service-only administration RPCs. No hosted application occurred. ADMINISTRATION_AND_VISIBILITY.md supersedes historical office/assignment/visibility gaps below.

# Existing RFQ schema and private storage handoff

Current additive templates: workspace-template.sql then workspace-writes-template.sql. Both passed isolated PostgreSQL/real Supabase SDK fixture checks on 4 October. They add company/account scope and a service-only invoker transaction with fresh membership locks, ownership/version checks, audit/idempotency, support/private notes, reviewed guest linking and current-version publication. All tables have RLS; direct writes and authenticated RPC execution are revoked. No hosted migration/seed was applied. Generate real migrations only after target approval. CURRENT_HANDOFF.md and PROVIDER_ACTIVATION.md describe current gates.

`bootstrap.sql` is the existing transactional template, not yet applied to hosted Supabase. Preparation on 3 October 2026 made no schema/database changes. The template creates objects once and is not idempotent; do not rerun it against an initialized project.

After a dedicated target is approved, consult `supabase migration --help` and `supabase migration new --help`, generate `china_parts_rfq` with `supabase migration new china_parts_rfq`, and copy the reviewed template into that generated file. Preserve its timestamp. Review target/backup/rollback before link, db push or SQL execution. None was run here. Do not reset shared Docker databases or reuse LMT resources.

## Access matrix

| Resource | Anonymous | Authenticated provider user | Server-only service role |
| --- | --- | --- | --- |
| cps_staff_members | No access | Own membership row; no writes | Trusted administrative membership changes |
| cps_rfqs | No access | Active staff: unassigned/own-office RFQs; admin all | Ingestion and authorized review RPCs |
| cps_attachments / cps_audit | No access | Metadata/activity on an RLS-visible RFQ | Submission metadata/audit transaction |
| cps_submit_rfq | No execute | No execute | Validated idempotent mutation |
| cps_update_rfq | No execute | No execute | Active actor, office and expected-version checks |
| cps-rfq-private objects | No direct object access | No direct object access | Uploads; download after user/RLS checks |

An Auth account without active membership cannot read RFQs. Inactive members may read their own membership, but lose RFQ/files/audit access. Office IDs are optional UUIDs, not a managed office table. Sharing unassigned RFQs with all active staff remains an approval gate. The latest-50 inbox has no pagination/assignment UI. Service keys bypass RLS and remain server-only; the download client is constructed only after user-scoped authorization succeeds.

Both functions use security invoker with an empty search path, revoke PUBLIC/anon/authenticated execution and grant only service_role. Direct authenticated writes are revoked. Submission serializes the ID in PostgreSQL, deduplicates its digest and rejects conflicting reuse. Request/metadata/initial audit commit atomically. Review uses a row lock plus expected version and records an event; note revision content is not preserved.

## Storage and recovery

The private bucket `cps-rfq-private` allows image/png, image/jpeg and application/pdf up to 1,048,576 bytes per object. No object policy is created. On an existing project review broad Storage policies too: an unrelated permissive policy can expose this bucket. Do not alter unrelated policies without authorization.

Application limits: three files, 1 MB each, 4 MB total multipart body. Signature/MIME checks and scanner attestation of the exact digest precede upload. Customers receive no object keys or file links. Staff downloads require provider identity, active membership, RLS-visible metadata and clean scan status, then stream an attachment with private/no-store/nosniff headers.

Storage and database commits are separate; failed commits may leave private orphan objects. Cleanup, deletion/retention and backup restore need implementation/acceptance and an approved owner/rule. Metadata cascade deletion does not remove objects. Never delete objects solely by age without checking references and approved retention.

## Read-only acceptance queries (not executed here)

Run only on the approved target after migration, using a trusted administrative SQL interface. These inspect configuration without customer content.

```sql
select tablename, rowsecurity from pg_tables
where schemaname='public'
and tablename in ('cps_staff_members','cps_rfqs','cps_attachments','cps_audit');

select tablename, policyname, roles, cmd, qual, with_check from pg_policies
where schemaname='public' and tablename like 'cps_%';

select r.role,
has_function_privilege(r.role,'public.cps_submit_rfq(uuid,text,jsonb,jsonb)','EXECUTE') as can_submit,
has_function_privilege(r.role,'public.cps_update_rfq(uuid,uuid,text,text,integer)','EXECUTE') as can_review
from (values ('anon'),('authenticated'),('service_role')) r(role);

select id, public, file_size_limit, allowed_mime_types from storage.buckets
where id='cps-rfq-private';

select policyname, roles, cmd, qual, with_check from pg_policies
where schemaname='storage' and tablename='objects';
```

Expect four RLS-enabled tables, documented select policies, both RPCs denied to anon/authenticated and allowed for service_role, a private limited bucket, and no object policy allowing direct access to it. Inspection does not replace unauthorized/cross-office tests. See `VERIFICATION.md` for historical local PostgreSQL/provider fixtures and their limitations, and `SUPABASE_SETUP.md` for the remaining setup sequence.

Focused photo follow-up: REMAINING_DECISIONS.md distinguishes implemented single-photo upload/decoder/scanner/private-storage/mediated delivery from approved assets/hosted setup and genuine remaining code. Apply catalogue-photos-template.sql only after administration on the approved dedicated target; no hosted migration occurred. CPS_CATALOGUE_PHOTOS_ENABLED remains false.
