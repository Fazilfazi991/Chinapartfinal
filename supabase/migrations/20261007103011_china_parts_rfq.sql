-- Reviewed baseline for the dedicated China Parts Final project. No application seeds.
begin;
create table public.cps_staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('admin','agent')),
  office_id uuid,
  active boolean not null default true
);
create table public.cps_rfqs (
  id uuid primary key,
  reference text not null unique default ('CPS-' || gen_random_uuid()::text),
  digest text not null check(digest ~ '^[a-f0-9]{64}$'),
  data jsonb not null check(jsonb_typeof(data)='object'),
  status text not null default 'Submitted' check(status in ('Submitted','UnderReview','NeedsInformation','Closed')),
  office_id uuid,
  internal_note text not null default '' check(length(internal_note)<=2000),
  status_version integer not null default 0,
  created_at timestamptz not null default now()
);
create index cps_rfqs_office_created on public.cps_rfqs(office_id,created_at desc);
create table public.cps_attachments (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.cps_rfqs(id) on delete cascade,
  object_key text not null unique,
  name text not null check(length(name) between 1 and 160),
  mime text not null check(mime in ('image/png','image/jpeg','application/pdf')),
  size integer not null check(size between 1 and 1048576),
  sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
  scan_status text not null check(scan_status in ('clean','quarantined'))
);
create index cps_attachments_rfq on public.cps_attachments(rfq_id);
create table public.cps_audit (
  id bigint generated always as identity primary key,
  rfq_id uuid not null references public.cps_rfqs(id) on delete cascade,
  actor uuid references auth.users(id),
  event text not null,
  created_at timestamptz not null default now()
);
create index cps_audit_rfq_created on public.cps_audit(rfq_id,created_at desc);
alter table public.cps_staff_members enable row level security;
alter table public.cps_rfqs enable row level security;
alter table public.cps_attachments enable row level security;
alter table public.cps_audit enable row level security;
revoke all on public.cps_staff_members,public.cps_rfqs,public.cps_attachments,public.cps_audit from anon,authenticated;
grant select on public.cps_staff_members,public.cps_rfqs,public.cps_attachments,public.cps_audit to authenticated;
grant all on public.cps_staff_members,public.cps_rfqs,public.cps_attachments,public.cps_audit to service_role;
grant usage,select on sequence public.cps_audit_id_seq to service_role;
create policy cps_members_self on public.cps_staff_members for select to authenticated using(user_id=(select auth.uid()));
create policy cps_requests_staff on public.cps_rfqs for select to authenticated using(exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or cps_rfqs.office_id is null or cps_rfqs.office_id=m.office_id)));
create policy cps_files_staff on public.cps_attachments for select to authenticated using(exists(select 1 from public.cps_rfqs r where r.id=cps_attachments.rfq_id));
create policy cps_audit_staff on public.cps_audit for select to authenticated using(exists(select 1 from public.cps_rfqs r where r.id=cps_audit.rfq_id));

create function public.cps_submit_rfq(p_id uuid,p_digest text,p_data jsonb,p_files jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare existing public.cps_rfqs; ref text; attachment jsonb; field text;
begin
  if p_digest is null or p_digest !~ '^[a-f0-9]{64}$' or jsonb_typeof(p_data) is distinct from 'object' or jsonb_typeof(p_files) is distinct from 'array' or jsonb_array_length(p_files)>3 then raise exception 'invalid_request'; end if;
  foreach field in array array['name','company','email','phone','country','category','brand','model','year','vin','description','oem','quantity','quality'] loop
    if jsonb_typeof(p_data->field) is distinct from 'string' or length(p_data->>field)>(case when field='description' then 2000 else 200 end) then raise exception 'invalid_request'; end if;
  end loop;
  if length(trim(p_data->>'name'))=0 or length(trim(p_data->>'country'))=0 or length(trim(p_data->>'category'))=0 or (length(trim(p_data->>'email'))=0 and length(trim(p_data->>'phone'))=0) or (length(trim(p_data->>'description'))=0 and length(trim(p_data->>'oem'))=0) or (p_data->>'quantity') !~ '^[1-9][0-9]{0,5}$' then raise exception 'invalid_request'; end if;
  -- Cross-instance serialization is in PostgreSQL, never a process-local lock.
  perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  select * into existing from public.cps_rfqs where id=p_id;
  if found then
    if existing.digest<>p_digest then raise exception 'idempotency_conflict'; end if;
    return jsonb_build_object('reference',existing.reference);
  end if;
  insert into public.cps_rfqs(id,digest,data) values(p_id,p_digest,p_data) returning reference into ref;
  for attachment in select value from jsonb_array_elements(p_files) loop
    if (attachment->>'object_key') not like (p_id::text || '/' || p_digest || '/%') or (attachment->>'scan_status') is distinct from 'clean' then raise exception 'invalid_attachment'; end if;
    insert into public.cps_attachments(rfq_id,object_key,name,mime,size,sha256,scan_status) values(p_id,attachment->>'object_key',attachment->>'name',attachment->>'mime',(attachment->>'size')::integer,attachment->>'sha256','clean');
  end loop;
  insert into public.cps_audit(rfq_id,event) values(p_id,'Request submitted');
  return jsonb_build_object('reference',ref);
end;
$$;
revoke all on function public.cps_submit_rfq(uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.cps_submit_rfq(uuid,text,jsonb,jsonb) to service_role;

create function public.cps_update_rfq(p_id uuid,p_actor uuid,p_status text,p_note text,p_expected integer) returns void
language plpgsql security invoker set search_path='' as $$
declare member public.cps_staff_members; request public.cps_rfqs;
begin
  select * into member from public.cps_staff_members where user_id=p_actor and active;
  if not found then raise exception 'staff_access_required'; end if;
  select * into request from public.cps_rfqs where id=p_id for update;
  if not found or not coalesce((member.role='admin' or request.office_id is null or request.office_id=member.office_id),false) then raise exception 'request_unavailable'; end if;
  if request.status_version is distinct from p_expected then raise exception 'concurrent_update'; end if;
  if p_status not in ('Submitted','UnderReview','NeedsInformation','Closed') or p_note is null or length(p_note)>2000 then raise exception 'invalid_update'; end if;
  update public.cps_rfqs set status=p_status,internal_note=p_note,status_version=status_version+1 where id=p_id;
  insert into public.cps_audit(rfq_id,actor,event) values(p_id,p_actor,'Review updated: ' || p_status);
end;
$$;
revoke all on function public.cps_update_rfq(uuid,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.cps_update_rfq(uuid,uuid,text,text,integer) to service_role;

-- Private bucket; deliberately no anon/authenticated object policies. Downloads
-- are mediated by a verified staff session plus request-scoped RLS.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('cps-rfq-private','cps-rfq-private',false,1048576,array['image/png','image/jpeg','application/pdf']);
commit;
