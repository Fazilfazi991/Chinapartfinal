-- Reviewed baseline for the dedicated China Parts Final project. No application seeds.
begin;
create function public.cps_workspace_page(p_mode text,p_resource text,p_page integer default 0,p_ids uuid[] default null,p_parent uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare actor uuid:=auth.uid(); member public.cps_staff_members; company uuid;
 target text; projection text; joins text:=''; scope text:='true'; key text:='t.id'; parent_key text;
 sort text:='t.created_at desc,t.id'; result jsonb; max_rows integer:=50;
begin
 if p_mode not in ('staff','customer') or p_mode is null or p_page is null or p_page not between 0 and 10000 or cardinality(p_ids)>100 then raise exception 'invalid_command';end if;
 if p_mode='staff' then
  select * into member from public.cps_staff_members where user_id=actor and active;
  if not found or member.role not in ('admin','agent') or (member.role='agent' and member.office_id is null) then raise exception 'workspace_access';end if;
 else
  select company_id into company from public.cps_customer_members where user_id=actor and active;
  if company is null then raise exception 'workspace_access';end if;
 end if;
 case p_resource
 when 'companies' then target:='cps_companies';projection:='t.id,t.office_id,t.name,t.contact,t.email,t.version,t.created_at';joins:=' join public.cps_companies c on c.id=t.id';
 when 'requests' then target:='cps_portal_requests';projection:='t.id,t.company_id,t.reference,t.status,t.items,t.assigned_to,t.requirement_context,t.version,t.created_at';joins:=' join public.cps_companies c on c.id=t.company_id';
 when 'orders' then target:='cps_order_drafts';projection:='t.id,t.company_id,t.request_id,t.reference,t.status,t.items,t.shipping_note,t.customer_visible,t.review_version,t.archived,t.version,t.created_at';joins:=' join public.cps_companies c on c.id=t.company_id';
 when 'invoices' then target:='cps_invoice_drafts';projection:='t.id,t.company_id,t.order_id,t.reference,t.currency,t.scale,t.lines,t.tax_minor,t.customer_visible,t.review_version,t.archived,t.version,t.created_at';joins:=' join public.cps_companies c on c.id=t.company_id';
 when 'payments' then target:='cps_payment_events';projection:='t.id,t.company_id,t.invoice_id,t.provider_event_id,t.currency,t.amount_minor,t.created_at';joins:=' join public.cps_companies c on c.id=t.company_id';
 when 'support' then target:='cps_support_threads';projection:='t.id,t.company_id,t.subject,t.body,t.status,t.version,t.created_at';joins:=' join public.cps_companies c on c.id=t.company_id';
 when 'comments' then target:='cps_portal_comments';projection:='t.id,t.request_id,t.author_id,t.body,t.visibility,t.created_at';joins:=' join public.cps_portal_requests r on r.id=t.request_id join public.cps_companies c on c.id=r.company_id';parent_key:='t.request_id';
 when 'tracking' then target:='cps_tracking_events';projection:='t.id,t.order_id,t.label,t.detail,t.customer_visible,t.review_version,t.archived,t.version,t.created_at';joins:=' join public.cps_order_drafts o on o.id=t.order_id join public.cps_companies c on c.id=o.company_id';parent_key:='t.order_id';
 when 'replies' then target:='cps_support_replies';projection:='t.id,t.thread_id,t.author_id,t.body,t.created_at';joins:=' join public.cps_support_threads s on s.id=t.thread_id join public.cps_companies c on c.id=s.company_id';parent_key:='t.thread_id';
 when 'notes' then target:='cps_portal_notes';projection:='t.request_id,t.body';joins:=' join public.cps_portal_requests r on r.id=t.request_id join public.cps_companies c on c.id=r.company_id';key:='t.request_id';parent_key:=key;sort:=key;
 when 'companyNotes' then target:='cps_company_notes';projection:='t.company_id,t.body';joins:=' join public.cps_companies c on c.id=t.company_id';key:='t.company_id';parent_key:=key;sort:=key;
 when 'catalogue' then target:='cps_catalogue';projection:='t.id,t.title,t.part_number,t.brand,t.category,t.description,t.published,t.approved,t.approved_version,t.archived,t.image_asset,t.photo_id,t.photo_alt,t.version,t.created_at';
 when 'content' then target:='cps_content_drafts';projection:='t.id,t.title,t.slug,t.body,t.published,t.approved_version,t.version,t.created_at';
 when 'audit' then target:='cps_workspace_audit';projection:='t.id,t.actor_id,t.company_id,t.operation,t.resource_id,t.created_at';
 else raise exception 'resource_unavailable';end case;
 if p_resource in ('content','audit') and (p_mode<>'staff' or member.role<>'admin') then raise exception 'resource_unavailable';end if;
 if p_resource in ('notes','companyNotes') and p_mode<>'staff' then raise exception 'resource_unavailable';end if;
 if joins<>'' then
  if p_mode='customer' then scope:=format('c.id=%L::uuid',company);
  elsif member.role='agent' then scope:=format('c.office_id=%L::uuid',member.office_id);end if;
 end if;
 if p_mode='customer' then
  if p_resource in ('orders','invoices','tracking') then scope:=scope||' and t.customer_visible and not t.archived and t.review_version=t.version';end if;
  if p_resource='comments' then scope:=scope||' and t.visibility=''customer''';end if;
  if p_resource='catalogue' then scope:=scope||' and t.published and t.approved and not t.archived and t.approved_version=t.version';end if;
 end if;
 if p_parent is not null then
  if parent_key is null then raise exception 'invalid_command';end if;
  scope:=scope||format(' and %s=%L::uuid',parent_key,p_parent);
 end if;
 if p_ids is not null then scope:=scope||format(' and %s=any(%L::uuid[])',key,p_ids);max_rows:=100;p_page:=0;end if;
 -- Table/projection/order expressions above are fixed allowlists. Values are
 -- quoted literals; invoker privileges and table RLS remain effective throughout.
 execute format('select coalesce(jsonb_agg(x),''[]''::jsonb) from (select %s from public.%I t%s where %s order by %s limit %s offset %s)x',projection,target,joins,scope,sort,max_rows+1,p_page*50) into result;
 return jsonb_build_object('rows',(select coalesce(jsonb_agg(v),'[]'::jsonb) from jsonb_array_elements(result) with ordinality e(v,n) where n<=max_rows),'hasMore',jsonb_array_length(result)>max_rows,'page',p_page,'pageSize',max_rows);
end $$;
revoke all on function public.cps_workspace_page(text,text,integer,uuid[],uuid) from public,anon;
grant execute on function public.cps_workspace_page(text,text,integer,uuid[],uuid) to authenticated;

-- Restricted roster selector. Caller never supplies the acting identity from UI;
-- the server resolves it with authoritative Auth before constructing service SDK.
create function public.cps_admin_selector(p_actor uuid,p_kind text,p_page integer default 0,p_id uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare output jsonb; selected jsonb; target text; projection text; key text;
begin
 if p_page is null or p_page not between 0 and 10000 then raise exception 'invalid_command';end if;
 perform 1 from public.cps_staff_members where user_id=p_actor and active and role='admin' for share;
 if not found then raise exception 'workspace_access';end if;
 if p_kind='offices' then target:='cps_offices';projection:='id,name as label,active';key:='id';
 elsif p_kind='staff' then target:='cps_staff_members';projection:='user_id as id,coalesce(nullif(label,''''),user_id::text) as label,active';key:='user_id';
 else raise exception 'resource_unavailable';end if;
 execute format('select coalesce(jsonb_agg(t),''[]''::jsonb) from (select %s from public.%I where active order by %I limit 51 offset %s)t',projection,target,key,p_page*50) into output;
 if p_id is not null then execute format('select to_jsonb(t) from (select %s from public.%I where %I=%L::uuid and active)t',projection,target,key,p_id) into selected;end if;
 return jsonb_build_object('rows',(select coalesce(jsonb_agg(v),'[]'::jsonb) from jsonb_array_elements(output) with ordinality e(v,n) where n<=50),'hasMore',jsonb_array_length(output)>50,'selected',selected,'page',p_page);
end $$;
revoke all on function public.cps_admin_selector(uuid,text,integer,uuid) from public,anon,authenticated;
grant execute on function public.cps_admin_selector(uuid,text,integer,uuid) to service_role;
commit;
