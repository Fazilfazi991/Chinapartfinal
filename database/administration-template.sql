-- ADDITIVE REVIEW TEMPLATE after bootstrap/workspace/workspace-writes.
-- No hosted migration, account provisioning, seeds or notifications.
begin;
create table public.cps_offices(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 200),active boolean not null default false,version integer not null default 0 check(version>=0),created_at timestamptz not null default now());
-- Preserve existing UUID scopes; these labels require operator review.
insert into public.cps_offices(id,name,active) select distinct office_id,'Office pending label',true from (select office_id from public.cps_staff_members union select office_id from public.cps_companies union select office_id from public.cps_rfqs) t where office_id is not null;
alter table public.cps_staff_members add column version integer not null default 0 check(version>=0),add column label text not null default '' check(length(label)<=100),add constraint cps_staff_office foreign key(office_id) references public.cps_offices(id);
alter table public.cps_customer_members add column version integer not null default 0 check(version>=0),add column label text not null default '' check(length(label)<=100);
alter table public.cps_companies add constraint cps_company_office foreign key(office_id) references public.cps_offices(id);
alter table public.cps_rfqs add column assigned_to uuid references public.cps_staff_members(user_id),add constraint cps_rfq_office foreign key(office_id) references public.cps_offices(id);
alter table public.cps_portal_requests add column assigned_to uuid references public.cps_staff_members(user_id);
create index cps_rfqs_assigned on public.cps_rfqs(assigned_to);
create index cps_portal_requests_assigned on public.cps_portal_requests(assigned_to);
alter table public.cps_catalogue add column image_asset text not null default '' check(image_asset in ('','/parts-catalogue.png','/parts-inspection.png','/knowledge-editorial.png'));
alter table public.cps_catalogue add column search_document tsvector generated always as (to_tsvector('simple',title||' '||part_number||' '||brand||' '||category||' '||description)) stored;
create index cps_catalogue_search on public.cps_catalogue using gin(search_document);
alter table public.cps_offices enable row level security;revoke all on public.cps_offices from anon,authenticated;grant all on public.cps_offices to service_role;
-- Draft visibility is a separate policy-reviewed operation, never final issuance.
alter table public.cps_tracking_events add column version integer not null default 0 check(version>=0);
alter table public.cps_order_drafts add column review_version integer,add column archived boolean not null default false;
alter table public.cps_invoice_drafts add column review_version integer,add column archived boolean not null default false;
alter table public.cps_tracking_events add column review_version integer,add column archived boolean not null default false;
-- A dedicated fresh project has no shared drafts. Any legacy sharing needs review.
update public.cps_order_drafts set customer_visible=false;
update public.cps_invoice_drafts set customer_visible=false;
update public.cps_tracking_events set customer_visible=false;
alter table public.cps_order_drafts add constraint cps_order_reviewed_visibility check(not customer_visible or (review_version is not null and review_version=version and not archived));
alter table public.cps_invoice_drafts add constraint cps_invoice_reviewed_visibility check(not customer_visible or (review_version is not null and review_version=version and not archived));
alter table public.cps_tracking_events add constraint cps_tracking_reviewed_visibility check(not customer_visible or (review_version is not null and review_version=version and not archived));
create table public.cps_document_reviews(kind text not null check(kind in ('order','invoice','tracking')),resource_id uuid not null,company_id uuid not null references public.cps_companies(id),review_version integer not null,reviewer_id uuid not null references auth.users(id),evidence text not null check(length(evidence) between 1 and 1000),policy_reference text not null default '' check(length(policy_reference)<=100),created_at timestamptz not null default now(),primary key(kind,resource_id));
create index cps_document_reviews_company on public.cps_document_reviews(company_id);
create index cps_document_reviews_reviewer on public.cps_document_reviews(reviewer_id);
alter table public.cps_document_reviews enable row level security;revoke all on public.cps_document_reviews from anon,authenticated;grant all on public.cps_document_reviews to service_role;grant select on public.cps_document_reviews to authenticated;
create policy cps_document_reviews_staff on public.cps_document_reviews for select to authenticated using(exists(select 1 from public.cps_staff_members m join public.cps_companies c on c.id=company_id where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or m.office_id=c.office_id)));
create function public.cps_admin_snapshot(p_actor uuid,p_page integer default 0) returns jsonb language plpgsql security invoker set search_path='' as $$
declare output jsonb;
begin
 if p_page not between 0 and 10000 or p_page is null then raise exception 'invalid_command';end if;
 perform 1 from public.cps_staff_members where user_id=p_actor and active and role='admin' for share;if not found then raise exception 'workspace_access';end if;
 select jsonb_build_object('offices',(select coalesce(jsonb_agg(t),'[]') from (select id,name,active,version,created_at from public.cps_offices order by created_at desc,id limit 50 offset p_page*50)t),'staff',(select coalesce(jsonb_agg(t),'[]') from (select user_id,role,office_id,active,version,label from public.cps_staff_members order by user_id limit 50 offset p_page*50)t),'members',(select coalesce(jsonb_agg(t),'[]') from (select user_id,company_id,active,version,label from public.cps_customer_members order by user_id limit 50 offset p_page*50)t),'rfqs',(select coalesce(jsonb_agg(t),'[]') from (select id,reference,office_id,assigned_to,status_version,status from public.cps_rfqs order by created_at desc,id limit 50 offset p_page*50)t)) into output;
 return output;
end $$;
revoke all on function public.cps_admin_snapshot(uuid,integer) from public,anon,authenticated;grant execute on function public.cps_admin_snapshot(uuid,integer) to service_role;
alter function public.cps_workspace_mutate(uuid,text,uuid,text,jsonb,boolean,boolean) rename to cps_workspace_mutate_base;
create function public.cps_workspace_mutate(p_actor uuid,p_mode text,p_key uuid,p_digest text,p_command jsonb,p_publication boolean default false,p_linking boolean default false,p_document_kinds text[] default '{}',p_policy_reference text default '') returns jsonb language plpgsql security invoker set search_path='' as $$
declare cmd text:=p_command->>'type'; input jsonb:=p_command->'input'; member public.cps_staff_members; existing public.cps_workspace_receipts; output jsonb; rid uuid; cid uuid; oid uuid; aid uuid; expected integer; current_version integer; next_version integer:=0; target text; document_kind text; reviewed integer; hidden boolean; old_role text; old_active boolean; old_office uuid;
begin
 if cmd not in ('office.save','staff.save','customer.membership.save','rfq.assign','request.assign','document.review','document.publish','document.unpublish','document.archive','document.restore') then
  if cmd='company.create' and not exists(select 1 from public.cps_offices where id=(input->>'officeId')::uuid and active) then raise exception 'office_unavailable';end if;
  output:=public.cps_workspace_mutate_base(p_actor,p_mode,p_key,p_digest,p_command,p_publication,p_linking);
  if cmd in ('order.update','order.tracking','invoice.save') and not (output->>'repeated')::boolean then
   if cmd='invoice.save' then select archived into hidden from public.cps_invoice_drafts where id=(output->>'id')::uuid;else select archived into hidden from public.cps_order_drafts where id=(output->>'id')::uuid;end if;if hidden then raise exception 'draft_archived';end if;
   if cmd<>'invoice.save' then rid:=(output->>'id')::uuid;update public.cps_invoice_drafts set customer_visible=false,review_version=null where order_id=rid;update public.cps_tracking_events set customer_visible=false,review_version=null where order_id=rid;delete from public.cps_document_reviews where resource_id in (select id from public.cps_invoice_drafts where order_id=rid union select id from public.cps_tracking_events where order_id=rid);end if;
  end if;
  if cmd='catalogue.save' and not (output->>'repeated')::boolean then update public.cps_catalogue set image_asset=coalesce(input->>'imageAsset','') where id=(output->>'id')::uuid;end if;
  return output;
 end if;
 if p_actor is null or p_key is null or p_digest is null or p_digest !~ '^[a-f0-9]{64}$' or jsonb_typeof(input) is distinct from 'object' or octet_length(p_command::text)>65536 then raise exception 'invalid_command';end if;
 -- Serialize role changes BEFORE taking actor/target membership locks.
 if cmd='staff.save' then perform pg_advisory_xact_lock(hashtextextended('cps-staff-administration',0));end if;
 select * into member from public.cps_staff_members where user_id=p_actor and active and role='admin' for share;if p_mode<>'staff' or not found then raise exception 'workspace_access';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text||':'||p_key::text,0));
 select * into existing from public.cps_workspace_receipts where actor_id=p_actor and operation_key=p_key;if found then if existing.digest<>p_digest then raise exception 'operation_conflict';end if;return existing.result||jsonb_build_object('repeated',true);end if;
 if input ? 'id' then rid:=(input->>'id')::uuid;expected:=(input->>'version')::integer;end if;
 case cmd
 when 'office.save' then
  if rid is null then insert into public.cps_offices(name,active) values(input->>'name',(input->>'active')::boolean) returning id,version into rid,next_version;
  else
   select version into current_version from public.cps_offices where id=rid for update;if not found then raise exception 'record_unavailable';end if;if expected is distinct from current_version then raise exception 'version_conflict';end if;
   if not (input->>'active')::boolean and (exists(select 1 from public.cps_companies where office_id=rid) or exists(select 1 from public.cps_staff_members where office_id=rid and active)) then raise exception 'office_in_use';end if;
   update public.cps_offices set name=input->>'name',active=(input->>'active')::boolean,version=version+1 where id=rid returning version into next_version;
  end if;
 when 'staff.save','customer.membership.save' then
  rid:=(input->>'userId')::uuid; -- FK validates an existing Auth account, without reading protected Auth tables.
  expected:=(input->>'version')::integer;
  if cmd='staff.save' then
   select version,role,active,office_id into current_version,old_role,old_active,old_office from public.cps_staff_members where user_id=rid for update;
   if (not found and expected is not null) or (found and expected is distinct from current_version) then raise exception 'version_conflict';end if;
   if rid=p_actor and (input->>'role' is distinct from old_role or (input->>'active')::boolean is distinct from old_active or (input->>'officeId')::uuid is distinct from old_office) then raise exception 'self_change_blocked';end if;
   if old_role='admin' and old_active and (input->>'role'<>'admin' or not (input->>'active')::boolean) and (select count(*) from public.cps_staff_members where role='admin' and active)<=1 then raise exception 'last_admin';end if;
   if input->>'role'='agent' and not exists(select 1 from public.cps_offices where id=(input->>'officeId')::uuid and active) then raise exception 'office_unavailable';end if;
   begin
   insert into public.cps_staff_members(user_id,role,office_id,active,label,version) values(rid,input->>'role',(input->>'officeId')::uuid,(input->>'active')::boolean,input->>'label',coalesce(current_version+1,0)) on conflict(user_id) do update set role=excluded.role,office_id=excluded.office_id,active=excluded.active,label=excluded.label,version=excluded.version returning version into next_version;
   exception when foreign_key_violation then raise exception 'account_unavailable';end;
   -- Assignments are work queues, not grants; remove now-invalid assignments.
   update public.cps_rfqs set assigned_to=null,status_version=status_version+1 where assigned_to=rid and (not (input->>'active')::boolean or (input->>'role'='agent' and office_id is distinct from (input->>'officeId')::uuid));
   update public.cps_portal_requests r set assigned_to=null,version=r.version+1 from public.cps_companies c where r.company_id=c.id and r.assigned_to=rid and (not (input->>'active')::boolean or (input->>'role'='agent' and c.office_id is distinct from (input->>'officeId')::uuid));
  else
   cid:=(input->>'companyId')::uuid;select version into current_version from public.cps_customer_members where user_id=rid for update;
   if (not found and expected is not null) or (found and expected is distinct from current_version) then raise exception 'version_conflict';end if;
   if not exists(select 1 from public.cps_companies where id=cid) then raise exception 'record_unavailable';end if;
   begin
   insert into public.cps_customer_members(user_id,company_id,active,label,version) values(rid,cid,(input->>'active')::boolean,input->>'label',coalesce(current_version+1,0)) on conflict(user_id) do update set company_id=excluded.company_id,active=excluded.active,label=excluded.label,version=excluded.version returning version into next_version;
   exception when foreign_key_violation then raise exception 'account_unavailable';end;
  end if;
 when 'rfq.assign','request.assign' then
  aid:=(input->>'assigneeId')::uuid;
  if cmd='rfq.assign' then select status_version into current_version from public.cps_rfqs where id=rid for update;oid:=(input->>'officeId')::uuid;
  else select r.version,r.company_id,c.office_id into current_version,cid,oid from public.cps_portal_requests r join public.cps_companies c on c.id=r.company_id where r.id=rid for update of r;end if;
  if not found then raise exception 'record_unavailable';end if;if current_version is distinct from expected then raise exception 'version_conflict';end if;
  if not exists(select 1 from public.cps_offices where id=oid and active) then raise exception 'office_unavailable';end if;
  if aid is not null then perform 1 from public.cps_staff_members where user_id=aid and active and (role='admin' or office_id=oid) for share;if not found then raise exception 'assignee_unavailable';end if;end if;
  if cmd='rfq.assign' then update public.cps_rfqs set office_id=oid,assigned_to=aid,status_version=status_version+1 where id=rid returning status_version into next_version;insert into public.cps_audit(rfq_id,actor,event) values(rid,p_actor,'Assignment reviewed');
  else update public.cps_portal_requests set assigned_to=aid,version=version+1 where id=rid returning version into next_version;end if;
 when 'document.review','document.publish','document.unpublish','document.archive','document.restore' then
  document_kind:=input->>'kind';target:=case document_kind when 'order' then 'cps_order_drafts' when 'invoice' then 'cps_invoice_drafts' when 'tracking' then 'cps_tracking_events' end;if target is null then raise exception 'invalid_command';end if;
  -- Parent first, then child: serialize sharing against parent edits/withdrawal.
  if document_kind='tracking' then select order_id into oid from public.cps_tracking_events where id=rid;elsif document_kind='invoice' then select order_id into oid from public.cps_invoice_drafts where id=rid;end if;
  if document_kind<>'order' then perform 1 from public.cps_order_drafts where id=oid for update;end if;
  if document_kind='tracking' then select t.version,o.company_id,t.review_version,t.archived,t.order_id into current_version,cid,reviewed,hidden,oid from public.cps_tracking_events t join public.cps_order_drafts o on o.id=t.order_id where t.id=rid for update of t;
  else execute format('select version,company_id,review_version,archived,%s from public.%I where id=$1 for update',case document_kind when 'invoice' then 'order_id' else 'id' end,target) into current_version,cid,reviewed,hidden,oid using rid;end if;
  if current_version is null then raise exception 'record_unavailable';end if;if current_version is distinct from expected then raise exception 'version_conflict';end if;
  if hidden and cmd<>'document.restore' then raise exception 'draft_archived';end if;next_version:=current_version+1;
  if cmd='document.review' then
   if coalesce(length(trim(input->>'note')),0) not between 1 and 1000 then raise exception 'invalid_command';end if;
   insert into public.cps_document_reviews(kind,resource_id,company_id,review_version,reviewer_id,evidence) values(document_kind,rid,cid,next_version,p_actor,input->>'note') on conflict(kind,resource_id) do update set review_version=excluded.review_version,reviewer_id=excluded.reviewer_id,evidence=excluded.evidence,policy_reference='',created_at=now();
   execute format('update public.%I set customer_visible=false,review_version=$2,version=$2 where id=$1',target) using rid,next_version;
  elsif cmd='document.publish' then
   if not coalesce(document_kind=any(p_document_kinds),false) or coalesce(length(trim(p_policy_reference)),0) not between 1 and 100 then raise exception 'document_policy_required';end if;
   if reviewed is distinct from current_version or not exists(select 1 from public.cps_document_reviews where resource_id=rid and kind=input->>'kind' and review_version=current_version) then raise exception 'approval_required';end if;
   if document_kind<>'order' and not exists(select 1 from public.cps_order_drafts where id=oid and customer_visible and review_version=version and not archived) then raise exception 'parent_not_shared';end if;
   execute format('update public.%I set customer_visible=true,review_version=$2,version=$2 where id=$1',target) using rid,next_version;
   update public.cps_document_reviews set review_version=next_version,policy_reference=p_policy_reference where resource_id=rid and kind=input->>'kind';
  else
   execute format('update public.%I set customer_visible=false,review_version=null,archived=$3,version=$2 where id=$1',target) using rid,next_version,cmd='document.archive';
   delete from public.cps_document_reviews where resource_id=rid and kind=input->>'kind';
  end if;
  if document_kind='order' and cmd<>'document.publish' then
   update public.cps_invoice_drafts set customer_visible=false,review_version=null where order_id=rid;update public.cps_tracking_events set customer_visible=false,review_version=null where order_id=rid;
   delete from public.cps_document_reviews where resource_id in (select id from public.cps_invoice_drafts where order_id=rid union select id from public.cps_tracking_events where order_id=rid);
  end if;
 else raise exception 'invalid_command';
 end case;
 insert into public.cps_workspace_audit(actor_id,company_id,operation,resource_id) values(p_actor,cid,cmd,rid);
 output:=jsonb_build_object('id',rid,'version',next_version,'repeated',false);insert into public.cps_workspace_receipts(actor_id,operation_key,digest,company_id,result) values(p_actor,p_key,p_digest,cid,output);return output;
end $$;
revoke all on function public.cps_workspace_mutate(uuid,text,uuid,text,jsonb,boolean,boolean,text[],text) from public,anon,authenticated;grant execute on function public.cps_workspace_mutate(uuid,text,uuid,text,jsonb,boolean,boolean,text[],text) to service_role;
create function public.cps_catalogue_facets() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('brands',(select coalesce(jsonb_agg(brand),'[]') from (select distinct brand from public.cps_catalogue where published and approved and approved_version=version and not archived and brand<>'' order by brand limit 200)t),'categories',(select coalesce(jsonb_agg(category),'[]') from (select distinct category from public.cps_catalogue where published and approved and approved_version=version and not archived order by category limit 200)t));
$$;
revoke all on function public.cps_catalogue_facets() from public;grant execute on function public.cps_catalogue_facets() to anon,authenticated;
commit;
