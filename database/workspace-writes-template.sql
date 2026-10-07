-- ADDITIVE REVIEW TEMPLATE after bootstrap.sql and workspace-template.sql.
-- Generate a real migration only after target approval. No hosted execution here.
begin;
alter table public.cps_companies add column version integer not null default 0 check(version>=0);
alter table public.cps_order_drafts add column shipping_note text not null default '' check(length(shipping_note)<=2000);
alter table public.cps_catalogue add column archived boolean not null default false;
alter table public.cps_catalogue add column approved_version integer;
alter table public.cps_catalogue add constraint cps_catalogue_reviewed_version check(not published or (approved_version is not null and approved_version=version and not archived));
alter table public.cps_content_drafts add column approved_version integer;
alter table public.cps_content_drafts add column published boolean not null default false;
alter table public.cps_portal_requests add column requirement_context jsonb not null default '{}' check(jsonb_typeof(requirement_context)='object');
create table public.cps_portal_notes(request_id uuid primary key references public.cps_portal_requests(id),body text not null check(length(body)<=2000));
create table public.cps_company_notes(company_id uuid primary key references public.cps_companies(id),body text not null check(length(body)<=2000));
create table public.cps_support_replies(id uuid primary key default gen_random_uuid(),thread_id uuid not null references public.cps_support_threads(id),author_id uuid not null references auth.users(id),body text not null check(length(body) between 1 and 2000),created_at timestamptz not null default now());
create index cps_support_replies_thread on public.cps_support_replies(thread_id,created_at);
create index cps_support_replies_author on public.cps_support_replies(author_id);
create table public.cps_rfq_company_links(rfq_id uuid primary key references public.cps_rfqs(id),company_id uuid not null references public.cps_companies(id),portal_request_id uuid not null unique references public.cps_portal_requests(id),reviewer_id uuid not null references auth.users(id),evidence text not null check(length(evidence) between 1 and 1000),created_at timestamptz not null default now());
create index cps_rfq_company_links_company on public.cps_rfq_company_links(company_id);
create index cps_rfq_company_links_reviewer on public.cps_rfq_company_links(reviewer_id);
create table public.cps_workspace_audit(id bigint generated always as identity primary key,actor_id uuid not null references auth.users(id),company_id uuid references public.cps_companies(id),operation text not null,resource_id uuid not null,created_at timestamptz not null default now());
create index cps_workspace_audit_company_created on public.cps_workspace_audit(company_id,created_at desc);
create index cps_workspace_audit_actor on public.cps_workspace_audit(actor_id);
create table public.cps_workspace_receipts(actor_id uuid not null references auth.users(id),operation_key uuid not null,digest text not null check(digest ~ '^[a-f0-9]{64}$'),company_id uuid references public.cps_companies(id),result jsonb not null,created_at timestamptz not null default now(),primary key(actor_id,operation_key));
create index cps_workspace_receipts_company on public.cps_workspace_receipts(company_id);
create table public.cps_published_pages(slug text primary key,title text not null,body text not null,source_id uuid not null references public.cps_content_drafts(id),source_version integer not null,published_at timestamptz not null default now());
create index cps_published_pages_source on public.cps_published_pages(source_id);
do $$ declare t text; begin
 foreach t in array array['cps_portal_notes','cps_company_notes','cps_support_replies','cps_rfq_company_links','cps_workspace_audit','cps_workspace_receipts','cps_published_pages'] loop
 execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from anon,authenticated',t);execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant usage,select on sequence public.cps_workspace_audit_id_seq to service_role;
grant select on public.cps_portal_notes,public.cps_company_notes,public.cps_support_replies,public.cps_rfq_company_links,public.cps_workspace_audit to authenticated;
grant select on public.cps_published_pages to anon,authenticated;
create policy cps_published_pages_public on public.cps_published_pages for select to anon,authenticated using(true);
grant select on public.cps_catalogue to anon;
create policy cps_catalogue_public on public.cps_catalogue for select to anon using(published and approved and not archived and approved_version=version);
create policy cps_company_notes_staff on public.cps_company_notes for select to authenticated using(exists(select 1 from public.cps_companies c join public.cps_staff_members m on m.user_id=(select auth.uid()) where c.id=company_id and m.active and (m.role='admin' or m.office_id=c.office_id)));
create policy cps_portal_notes_staff on public.cps_portal_notes for select to authenticated using(exists(select 1 from public.cps_portal_requests r join public.cps_companies c on c.id=r.company_id join public.cps_staff_members m on m.user_id=(select auth.uid()) where r.id=request_id and m.active and (m.role='admin' or m.office_id=c.office_id)));
create policy cps_support_replies_scope on public.cps_support_replies for select to authenticated using(exists(select 1 from public.cps_support_threads t where t.id=thread_id));
create policy cps_links_staff on public.cps_rfq_company_links for select to authenticated using(exists(select 1 from public.cps_companies c join public.cps_staff_members m on m.user_id=(select auth.uid()) where c.id=company_id and m.active and (m.role='admin' or m.office_id=c.office_id)));
create policy cps_workspace_audit_staff on public.cps_workspace_audit for select to authenticated using(exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or exists(select 1 from public.cps_companies c where c.id=company_id and c.office_id=m.office_id))));
-- Dual-role accounts must not turn another office's customer membership into
-- permission to read unpublished staff documents.
drop policy cps_order_drafts_scope on public.cps_order_drafts;
create policy cps_order_drafts_scope on public.cps_order_drafts for select to authenticated using(exists(select 1 from public.cps_companies c where c.id=company_id) and (customer_visible or exists(select 1 from public.cps_staff_members m join public.cps_companies c on c.id=company_id where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or m.office_id=c.office_id))));
drop policy cps_invoice_drafts_scope on public.cps_invoice_drafts;
create policy cps_invoice_drafts_scope on public.cps_invoice_drafts for select to authenticated using(exists(select 1 from public.cps_order_drafts o where o.id=order_id) and (customer_visible or exists(select 1 from public.cps_staff_members m join public.cps_companies c on c.id=company_id where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or m.office_id=c.office_id))));
drop policy cps_tracking_events_scope on public.cps_tracking_events;
create policy cps_tracking_events_scope on public.cps_tracking_events for select to authenticated using(exists(select 1 from public.cps_order_drafts o where o.id=order_id) and (customer_visible or exists(select 1 from public.cps_staff_members m join public.cps_order_drafts o on o.id=order_id join public.cps_companies c on c.id=o.company_id where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or m.office_id=c.office_id))));
-- No authenticated receipt policy: callers receive only their RPC acknowledgement.
create function public.cps_workspace_lines_valid(p_lines jsonb,p_invoice boolean) returns boolean language plpgsql immutable security invoker set search_path='' as $$
declare line jsonb; subtotal numeric:=0;
begin
 if jsonb_typeof(p_lines) is distinct from 'array' then return false;end if;
 if jsonb_array_length(p_lines) not between 1 and 50 then return false;end if;
 for line in select value from jsonb_array_elements(p_lines) loop
  if jsonb_typeof(line) is distinct from 'object' or jsonb_typeof(line->'description') is distinct from 'string' or length(trim(line->>'description')) not between 1 and 300 or coalesce(line->>'quantity','') !~ '^[1-9][0-9]{0,5}$' then return false;end if;
  if p_invoice then
   if coalesce(line->>'unitMinor','') !~ '^(0|[1-9][0-9]{0,8})$' or (line->>'unitMinor')::numeric>100000000 then return false;end if;
   subtotal:=subtotal+(line->>'quantity')::numeric*(line->>'unitMinor')::numeric;
  elsif jsonb_typeof(line->'partNumber') is distinct from 'string' or length(line->>'partNumber')>100 then return false;
  end if;
 end loop;
 return subtotal<=10000000000;
end $$;
create function public.cps_workspace_company_allowed(p_actor uuid,p_mode text,p_company uuid) returns boolean language sql stable security invoker set search_path='' as $$
 select case when p_mode='customer' then exists(select 1 from public.cps_customer_members m where m.user_id=p_actor and m.active and m.company_id=p_company)
 when p_mode='staff' then exists(select 1 from public.cps_staff_members m join public.cps_companies c on c.id=p_company where m.user_id=p_actor and m.active and (m.role='admin' or m.office_id=c.office_id)) else false end;
$$;
create function public.cps_workspace_mutate(p_actor uuid,p_mode text,p_key uuid,p_digest text,p_command jsonb,p_publication boolean default false,p_linking boolean default false) returns jsonb language plpgsql security invoker set search_path='' as $$
declare member public.cps_staff_members; customer public.cps_customer_members; receipt public.cps_workspace_receipts;
 command text:=p_command->>'type'; input jsonb:=p_command->'input'; rid uuid; cid uuid; expected integer; current_version integer; output_version integer:=0;
 request public.cps_portal_requests; order_draft public.cps_order_drafts; product public.cps_catalogue; page public.cps_content_drafts; legacy public.cps_rfqs; linked public.cps_rfq_company_links; acknowledgement jsonb;
begin
 if p_actor is null or p_key is null or p_digest is null or p_digest !~ '^[a-f0-9]{64}$' or jsonb_typeof(p_command) is distinct from 'object' or jsonb_typeof(input) is distinct from 'object' or octet_length(p_command::text)>65536 then raise exception 'invalid_command';end if;
 -- A row-level shared membership lock keeps revocation from racing this write.
 if p_mode='staff' then select * into member from public.cps_staff_members where user_id=p_actor and active for share;if not found then raise exception 'workspace_access';end if;
 elsif p_mode='customer' then select * into customer from public.cps_customer_members where user_id=p_actor and active for share;if not found then raise exception 'workspace_access';end if;
 else raise exception 'workspace_access';end if;
 if command in ('company.create','catalogue.save','catalogue.approve','catalogue.publish','catalogue.unpublish','content.save','content.approve','content.publish','content.unpublish','rfq.link') and (p_mode<>'staff' or member.role<>'admin') then raise exception 'workspace_access';end if;
 if command in ('request.update','customer.update','order.create','order.update','order.tracking','invoice.save','support.status') and p_mode<>'staff' then raise exception 'workspace_access';end if;
 if command in ('request.create','support.create') and p_mode<>'customer' then raise exception 'workspace_access';end if;
 if command in ('catalogue.publish','content.publish') and not coalesce(p_publication,false) then raise exception 'publication_disabled';end if;
 if command='rfq.link' and not coalesce(p_linking,false) then raise exception 'linking_disabled';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text||':'||p_key::text,0));
 select * into receipt from public.cps_workspace_receipts where actor_id=p_actor and operation_key=p_key;
 if found then
  if receipt.digest<>p_digest then raise exception 'operation_conflict';end if;
  if receipt.company_id is not null and not public.cps_workspace_company_allowed(p_actor,p_mode,receipt.company_id) then raise exception 'record_unavailable';end if;
  return receipt.result||jsonb_build_object('repeated',true);
 end if;
 if input ? 'id' then rid:=(input->>'id')::uuid;if coalesce(input->>'version','') !~ '^(0|[1-9][0-9]{0,9})$' then raise exception 'invalid_command';end if;expected:=(input->>'version')::integer;end if;
 if command like 'request.%' and command<>'request.create' then
  select * into request from public.cps_portal_requests where id=rid for update;
  if not found then raise exception 'record_unavailable';end if;cid:=request.company_id;current_version:=request.version;
 elsif command like 'order.%' and command<>'order.create' then
  select * into order_draft from public.cps_order_drafts where id=rid for update;
  if not found then raise exception 'record_unavailable';end if;cid:=order_draft.company_id;current_version:=order_draft.version;
 elsif command like 'support.%' and command<>'support.create' then
  select company_id,version into cid,current_version from public.cps_support_threads where id=rid for update;if not found then raise exception 'record_unavailable';end if;
 elsif command='customer.update' then select id,version into cid,current_version from public.cps_companies where id=rid for update;if not found then raise exception 'record_unavailable';end if;
 end if;
 if cid is not null then
  if not public.cps_workspace_company_allowed(p_actor,p_mode,cid) then raise exception 'record_unavailable';end if;
  if current_version is distinct from expected then raise exception 'version_conflict';end if;
 end if;
 case command
 when 'request.create' then
  cid:=customer.company_id;if not public.cps_workspace_lines_valid(input->'items',false) then raise exception 'invalid_command';end if;
  insert into public.cps_portal_requests(company_id,reference,items) values(cid,'CPS-RFQ-'||gen_random_uuid(),input->'items') returning id,version into rid,output_version;
 when 'request.update' then
  update public.cps_portal_requests set status=input->>'status',version=version+1 where id=rid returning version into output_version;
  insert into public.cps_portal_notes(request_id,body) values(rid,input->>'internalNote') on conflict(request_id) do update set body=excluded.body;
 when 'request.comment' then
  if p_mode='customer' and input->>'visibility' is distinct from 'customer' then raise exception 'workspace_access';end if;
  insert into public.cps_portal_comments(request_id,author_id,body,visibility) values(rid,p_actor,input->>'body',input->>'visibility');
  update public.cps_portal_requests set version=version+1 where id=rid returning version into output_version;
 when 'customer.update' then
  update public.cps_companies set contact=input->>'contact',version=version+1 where id=rid returning version into output_version;
  insert into public.cps_company_notes(company_id,body) values(rid,input->>'note') on conflict(company_id) do update set body=excluded.body;
 when 'company.create' then
  insert into public.cps_companies(name,contact,email,office_id) values(input->>'name',input->>'contact',input->>'email',(input->>'officeId')::uuid) returning id,version into rid,output_version;cid:=rid;
 when 'order.create' then
  select * into request from public.cps_portal_requests where id=(input->>'requestId')::uuid for share;
  if not found or not public.cps_workspace_company_allowed(p_actor,p_mode,request.company_id) then raise exception 'record_unavailable';end if;cid:=request.company_id;
  insert into public.cps_order_drafts(company_id,request_id,reference,items) values(cid,request.id,'CPS-ORDER-DRAFT-'||gen_random_uuid(),request.items) returning id,version into rid,output_version;
 when 'order.update' then
  update public.cps_order_drafts set status=input->>'status',shipping_note=input->>'shippingNote',customer_visible=false,version=version+1 where id=rid returning version into output_version;
 when 'order.tracking' then
  insert into public.cps_tracking_events(order_id,label,detail) values(rid,input->>'label',input->>'detail');
  update public.cps_order_drafts set customer_visible=false,version=version+1 where id=rid returning version into output_version;
 when 'invoice.save' then
  select * into order_draft from public.cps_order_drafts where id=(input->>'orderId')::uuid for share;
  if not found or not public.cps_workspace_company_allowed(p_actor,p_mode,order_draft.company_id) then raise exception 'record_unavailable';end if;cid:=order_draft.company_id;
  if not public.cps_workspace_lines_valid(input->'lines',true) then raise exception 'invalid_command';end if;
  if rid is null then
   insert into public.cps_invoice_drafts(company_id,order_id,reference,currency,scale,lines,tax_minor) values(cid,order_draft.id,'CPS-INVOICE-DRAFT-'||gen_random_uuid(),input->>'currency',(input->>'scale')::smallint,input->'lines',(input->>'taxMinor')::bigint) returning id,version into rid,output_version;
  else
   select company_id,version into cid,current_version from public.cps_invoice_drafts where id=rid for update;
   if not found or not public.cps_workspace_company_allowed(p_actor,p_mode,cid) then raise exception 'record_unavailable';end if;
   if current_version is distinct from expected then raise exception 'version_conflict';end if;
   -- Existing invoice drafts stay with their original company.
   if cid<>order_draft.company_id then raise exception 'record_unavailable';end if;
   update public.cps_invoice_drafts set order_id=order_draft.id,currency=input->>'currency',scale=(input->>'scale')::smallint,lines=input->'lines',tax_minor=(input->>'taxMinor')::bigint,customer_visible=false,version=version+1 where id=rid returning version into output_version;
  end if;
 when 'support.create' then
  cid:=customer.company_id;insert into public.cps_support_threads(company_id,subject,body) values(cid,input->>'subject',input->>'body') returning id,version into rid,output_version;
 when 'support.reply' then
  insert into public.cps_support_replies(thread_id,author_id,body) values(rid,p_actor,input->>'body');
  update public.cps_support_threads set version=version+1 where id=rid returning version into output_version;
 when 'support.status' then update public.cps_support_threads set status=input->>'status',version=version+1 where id=rid returning version into output_version;
 when 'catalogue.save' then
  if rid is null then insert into public.cps_catalogue(title,part_number,brand,category,description,archived) values(input->>'title',input->>'partNumber',input->>'brand',input->>'category',input->>'description',(input->>'archived')::boolean) returning id,version into rid,output_version;
  else
   select * into product from public.cps_catalogue where id=rid for update;if not found then raise exception 'record_unavailable';end if;if product.version is distinct from expected then raise exception 'version_conflict';end if;
   update public.cps_catalogue set title=input->>'title',part_number=input->>'partNumber',brand=input->>'brand',category=input->>'category',description=input->>'description',archived=(input->>'archived')::boolean,published=false,approved=false,approved_version=null,version=version+1 where id=rid returning version into output_version;
  end if;
 when 'catalogue.approve','catalogue.publish','catalogue.unpublish' then
  select * into product from public.cps_catalogue where id=rid for update;if not found then raise exception 'record_unavailable';end if;if product.version is distinct from expected then raise exception 'version_conflict';end if;
  if command='catalogue.publish' and (not product.approved or product.archived or product.approved_version is distinct from product.version) then raise exception 'approval_required';end if;
  update public.cps_catalogue set approved=case when command='catalogue.approve' then true else approved end,published=case when command='catalogue.publish' then true when command='catalogue.unpublish' then false else published end,approved_version=case when command in ('catalogue.approve','catalogue.publish') then version+1 else null end,version=version+1 where id=rid returning version into output_version;
 when 'content.save' then
  if rid is null then insert into public.cps_content_drafts(slug,title,body) values(input->>'slug',input->>'title',input->>'body') returning id,version into rid,output_version;
  else
   select * into page from public.cps_content_drafts where id=rid for update;if not found then raise exception 'record_unavailable';end if;if page.version is distinct from expected then raise exception 'version_conflict';end if;
   delete from public.cps_published_pages where source_id=rid;
   update public.cps_content_drafts set slug=input->>'slug',title=input->>'title',body=input->>'body',published=false,approved_version=null,version=version+1 where id=rid returning version into output_version;
  end if;
 when 'content.approve','content.publish','content.unpublish' then
  select * into page from public.cps_content_drafts where id=rid for update;if not found then raise exception 'record_unavailable';end if;if page.version is distinct from expected then raise exception 'version_conflict';end if;
  if command='content.publish' and page.approved_version is distinct from page.version then raise exception 'approval_required';end if;
  if command='content.publish' then insert into public.cps_published_pages(slug,title,body,source_id,source_version) values(page.slug,page.title,page.body,rid,page.version+1) on conflict(slug) do update set title=excluded.title,body=excluded.body,source_id=excluded.source_id,source_version=excluded.source_version,published_at=now();end if;
  if command='content.unpublish' then delete from public.cps_published_pages where source_id=rid;end if;
  update public.cps_content_drafts set published=case when command='content.publish' then true when command='content.unpublish' then false else published end,approved_version=case when command in ('content.approve','content.publish') then version+1 else null end,version=version+1 where id=rid returning version into output_version;
 when 'rfq.link' then
  cid:=(input->>'companyId')::uuid;if not public.cps_workspace_company_allowed(p_actor,p_mode,cid) then raise exception 'record_unavailable';end if;
  select * into legacy from public.cps_rfqs where id=(input->>'rfqId')::uuid for update;if not found then raise exception 'record_unavailable';end if;
  select * into linked from public.cps_rfq_company_links where rfq_id=legacy.id;
  if found then if linked.company_id<>cid then raise exception 'link_conflict';end if;rid:=linked.portal_request_id;select version into output_version from public.cps_portal_requests where id=rid;
  else
   if length(trim(input->>'evidence')) not between 1 and 1000 then raise exception 'invalid_command';end if;
   insert into public.cps_portal_requests(company_id,reference,items,created_at,requirement_context) values(cid,legacy.reference,jsonb_build_array(jsonb_build_object('description',left(coalesce(nullif(trim(legacy.data->>'description'),''),legacy.data->>'oem'),300),'partNumber',coalesce(legacy.data->>'oem',''),'quantity',(legacy.data->>'quantity')::integer)),legacy.created_at,jsonb_build_object('description',legacy.data->>'description','brand',legacy.data->>'brand','model',legacy.data->>'model','year',legacy.data->>'year','vin',legacy.data->>'vin','quality',legacy.data->>'quality','country',legacy.data->>'country')) returning id,version into rid,output_version;
   insert into public.cps_rfq_company_links(rfq_id,company_id,portal_request_id,reviewer_id,evidence) values(legacy.id,cid,rid,p_actor,input->>'evidence');
  end if;
 else raise exception 'invalid_command';
 end case;
 insert into public.cps_workspace_audit(actor_id,company_id,operation,resource_id) values(p_actor,cid,command,rid);
 acknowledgement:=jsonb_build_object('id',rid,'version',output_version,'repeated',false);
 insert into public.cps_workspace_receipts(actor_id,operation_key,digest,company_id,result) values(p_actor,p_key,p_digest,cid,acknowledgement);
 return acknowledgement;
end $$;
revoke all on function public.cps_workspace_lines_valid(jsonb,boolean),public.cps_workspace_company_allowed(uuid,text,uuid),public.cps_workspace_mutate(uuid,text,uuid,text,jsonb,boolean,boolean) from public,anon,authenticated;
grant execute on function public.cps_workspace_lines_valid(jsonb,boolean),public.cps_workspace_company_allowed(uuid,text,uuid),public.cps_workspace_mutate(uuid,text,uuid,text,jsonb,boolean,boolean) to service_role;
commit;
