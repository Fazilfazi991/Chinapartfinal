-- Separate supplier intake. References identify correspondence, never accounts.
begin;
create table public.cps_vendors (
 id uuid primary key,
 digest text not null check (digest ~ '^[a-f0-9]{64}$'),
 vendor_number bigint generated always as identity unique,
 reference text generated always as ('CPS-VEN-' || lpad(vendor_number::text, greatest(6,length(vendor_number::text)), '0')) stored unique,
 data jsonb not null check (jsonb_typeof(data)='object'),
 status text not null default 'New' check (status in ('New','UnderReview','Approved','Inactive')),
 office_id uuid references public.cps_offices(id),
 internal_note text not null default '' check (length(internal_note)<=2000),
 status_version integer not null default 0 check (status_version>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.cps_vendor_audit (
 id bigint generated always as identity primary key,
 vendor_id uuid not null references public.cps_vendors(id) on delete cascade,
 actor uuid references auth.users(id),
 event text not null,
 created_at timestamptz not null default now()
);
create index cps_vendors_office_created_idx on public.cps_vendors(office_id,created_at desc,id desc);
create index cps_vendors_created_idx on public.cps_vendors(created_at desc,id desc);
create index cps_vendor_audit_vendor_idx on public.cps_vendor_audit(vendor_id,created_at,id);
create index cps_vendor_audit_actor_idx on public.cps_vendor_audit(actor);
alter table public.cps_vendors enable row level security;
alter table public.cps_vendor_audit enable row level security;
revoke all on public.cps_vendors,public.cps_vendor_audit from public,anon,authenticated;
grant select on public.cps_vendors,public.cps_vendor_audit to authenticated;
grant all on public.cps_vendors,public.cps_vendor_audit to service_role;
revoke all on sequence public.cps_vendors_vendor_number_seq,public.cps_vendor_audit_id_seq from public,anon,authenticated;
grant usage,select on sequence public.cps_vendors_vendor_number_seq,public.cps_vendor_audit_id_seq to service_role;
create policy cps_vendors_staff_read on public.cps_vendors for select to authenticated using (
 exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active
 and (m.role='admin' or (m.role='agent' and cps_vendors.office_id is not null and m.office_id=cps_vendors.office_id)))
);
create policy cps_vendor_audit_staff_read on public.cps_vendor_audit for select to authenticated using (
 exists(select 1 from public.cps_vendors v where v.id=cps_vendor_audit.vendor_id)
);
create function public.cps_register_vendor(p_id uuid,p_digest text,p_data jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare existing public.cps_vendors%rowtype; k text; v text; ref text;
begin
 if p_id is null or p_digest is null or p_digest !~ '^[a-f0-9]{64}$' or p_data is null or jsonb_typeof(p_data)<>'object' then raise exception 'invalid_vendor'; end if;
 if (select count(*) from jsonb_object_keys(p_data))<>9 or not p_data ?& array['company','contact','mobile','email','country','products','brands','categories','remarks'] then raise exception 'invalid_vendor_fields'; end if;
 foreach k in array array['company','contact','mobile','email','country','products','brands','categories','remarks'] loop
  if jsonb_typeof(p_data->k)<>'string' then raise exception 'invalid_vendor_field'; end if;
  v=p_data->>k;
  if v<>btrim(v) or length(v)>(case when k in ('products','brands','categories','remarks') then 2000 else 200 end) then raise exception 'invalid_vendor_field'; end if;
  if k in ('company','contact','country','products') and v='' then raise exception 'missing_vendor_field'; end if;
 end loop;
 if p_data->>'email'='' and p_data->>'mobile'='' then raise exception 'missing_vendor_contact'; end if;
 if p_data->>'email'<>'' and p_data->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid_vendor_email'; end if;
 if p_data->>'mobile'<>'' and (p_data->>'mobile' !~ '^\+?[0-9 ()-]{7,25}$' or length(regexp_replace(p_data->>'mobile','[^0-9]','','g'))<7) then raise exception 'invalid_vendor_mobile'; end if;
 perform pg_advisory_xact_lock(hashtextextended('vendor:'||p_id::text,0));
 select * into existing from public.cps_vendors where id=p_id;
 if found then
  if existing.digest<>p_digest then raise exception 'idempotency_conflict'; end if;
  return jsonb_build_object('reference',existing.reference);
 end if;
 -- Durable aggregate intake limit, independent of spoofable IP headers.
 -- Idempotent retries above do not consume capacity. Turnstile is also mandatory
 -- on the public production route. Hosting-specific edge rules remain separate.
 perform pg_advisory_xact_lock(hashtextextended('cps:vendor-intake-rate',0));
 if (select count(*) from public.cps_vendors where created_at>now()-interval '1 minute')>=60 then raise exception 'vendor_rate_limited'; end if;
 insert into public.cps_vendors(id,digest,data) values(p_id,p_digest,p_data) returning reference into ref;
 insert into public.cps_vendor_audit(vendor_id,event) values(p_id,'Registered');
 return jsonb_build_object('reference',ref);
end $$;
create function public.cps_review_vendor(p_id uuid,p_actor uuid,p_status text,p_note text,p_expected integer) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare member public.cps_staff_members%rowtype; vendor public.cps_vendors%rowtype;
begin
 select * into member from public.cps_staff_members where user_id=p_actor for share;
 if not found or not member.active or member.role not in ('admin','agent') then raise exception 'staff_access_required'; end if;
 select * into vendor from public.cps_vendors where id=p_id for update;
 if not found or (member.role<>'admin' and (vendor.office_id is null or member.office_id is distinct from vendor.office_id)) then raise exception 'vendor_access_required'; end if;
 if p_status is null or p_status not in ('New','UnderReview','Approved','Inactive') or p_note is null or length(p_note)>2000 or p_expected is null then raise exception 'invalid_vendor_review'; end if;
 if vendor.status_version<>p_expected then raise exception 'stale_vendor_review'; end if;
 update public.cps_vendors set status=p_status,internal_note=p_note,status_version=status_version+1,updated_at=now() where id=p_id;
 insert into public.cps_vendor_audit(vendor_id,actor,event) values(p_id,p_actor,'Review: '||p_status);
 return jsonb_build_object('reference',vendor.reference,'version',vendor.status_version+1);
end $$;
revoke all on function public.cps_register_vendor(uuid,text,jsonb),public.cps_review_vendor(uuid,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.cps_register_vendor(uuid,text,jsonb),public.cps_review_vendor(uuid,uuid,text,text,integer) to service_role;
commit;
