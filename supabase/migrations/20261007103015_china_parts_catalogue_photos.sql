-- Reviewed baseline for the dedicated China Parts Final project. No application seeds.
begin;
create table public.cps_catalogue_media(id uuid primary key,product_id uuid not null references public.cps_catalogue(id),object_key text not null unique,sha256 text not null check(sha256~'^[a-f0-9]{64}$'),size integer not null check(size between 1 and 1048576),width integer not null check(width between 1 and 4096),height integer not null check(height between 1 and 4096),scan_status text not null check(scan_status='clean'),active boolean not null default true,created_at timestamptz not null default now(),unique(id,product_id));
create index cps_catalogue_media_product on public.cps_catalogue_media(product_id);
alter table public.cps_catalogue_media enable row level security;revoke all on public.cps_catalogue_media from anon,authenticated;grant all on public.cps_catalogue_media to service_role;
alter table public.cps_catalogue add column photo_id uuid,add column photo_alt text not null default '' check(length(photo_alt)<=200),add constraint cps_catalogue_photo_parent foreign key(photo_id,id) references public.cps_catalogue_media(id,product_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('cps-catalogue-private','cps-catalogue-private',false,1048576,array['image/png']);
-- No direct object policy. Application serves only authorized current images.
create function public.cps_catalogue_photo_receipt(p_actor uuid,p_key uuid,p_digest text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare receipt public.cps_workspace_receipts;
begin
 perform 1 from public.cps_staff_members where user_id=p_actor and role='admin' and active for share;if not found then raise exception 'workspace_access';end if;
 select * into receipt from public.cps_workspace_receipts where actor_id=p_actor and operation_key=p_key;if not found then return null;end if;
 if receipt.digest<>p_digest then raise exception 'operation_conflict';end if;return receipt.result||jsonb_build_object('repeated',true);
end $$;
create function public.cps_catalogue_photo_mutate(p_actor uuid,p_key uuid,p_digest text,p_product uuid,p_version integer,p_photo jsonb default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.cps_catalogue;receipt public.cps_workspace_receipts;new_photo_id uuid;output jsonb;
begin
 if p_actor is null or p_key is null or p_product is null or p_version is null or p_digest is null or p_digest!~'^[a-f0-9]{64}$' then raise exception 'invalid_command';end if;
 perform 1 from public.cps_staff_members where user_id=p_actor and role='admin' and active for share;if not found then raise exception 'workspace_access';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text||':'||p_key::text,0));
 select * into receipt from public.cps_workspace_receipts where actor_id=p_actor and operation_key=p_key;if found then if receipt.digest<>p_digest then raise exception 'operation_conflict';end if;return receipt.result||jsonb_build_object('repeated',true);end if;
 select * into old from public.cps_catalogue where id=p_product for update;if not found then raise exception 'record_unavailable';end if;if old.version<>p_version then raise exception 'version_conflict';end if;if old.archived then raise exception 'draft_archived';end if;
 if p_photo is not null then
  if jsonb_typeof(p_photo) is distinct from 'object' or coalesce(length(trim(p_photo->>'alt')),0) not between 1 and 200 or coalesce(p_photo->>'sha256','')!~'^[a-f0-9]{64}$' or (p_photo->>'object_key') is distinct from p_product::text||'/'||p_actor::text||'/'||p_key::text||'/'||(p_photo->>'sha256')||'.png' then raise exception 'invalid_command';end if;
  new_photo_id:=(p_photo->>'id')::uuid;
  insert into public.cps_catalogue_media(id,product_id,object_key,sha256,size,width,height,scan_status) values(new_photo_id,p_product,p_photo->>'object_key',p_photo->>'sha256',(p_photo->>'size')::integer,(p_photo->>'width')::integer,(p_photo->>'height')::integer,'clean');
 end if;
 update public.cps_catalogue_media set active=false where id=old.photo_id;
 update public.cps_catalogue set photo_id=new_photo_id,photo_alt=coalesce(p_photo->>'alt',''),published=false,approved=false,approved_version=null,version=version+1 where id=p_product returning jsonb_build_object('id',id,'version',version,'repeated',false) into output;
 insert into public.cps_workspace_audit(actor_id,operation,resource_id) values(p_actor,case when p_photo is null then 'catalogue.photo.remove' else 'catalogue.photo.upload' end,p_product);
 insert into public.cps_workspace_receipts(actor_id,operation_key,digest,result) values(p_actor,p_key,p_digest,output);return output;
end $$;
create function public.cps_catalogue_photo_resolve(p_product uuid,p_actor uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare output jsonb;
begin
 if p_actor is not null then perform 1 from public.cps_staff_members where user_id=p_actor and active and role in ('admin','agent') for share;if not found then raise exception 'workspace_access';end if;end if;
 select to_jsonb(m) into output from public.cps_catalogue c join public.cps_catalogue_media m on m.id=c.photo_id and m.product_id=c.id and m.active and m.scan_status='clean' where c.id=p_product and (p_actor is not null or (c.published and c.approved and c.approved_version=c.version and not c.archived)) for share of c,m;return output;
end $$;
revoke all on function public.cps_catalogue_photo_receipt(uuid,uuid,text),public.cps_catalogue_photo_mutate(uuid,uuid,text,uuid,integer,jsonb),public.cps_catalogue_photo_resolve(uuid,uuid) from public,anon,authenticated;
grant execute on function public.cps_catalogue_photo_receipt(uuid,uuid,text),public.cps_catalogue_photo_mutate(uuid,uuid,text,uuid,integer,jsonb),public.cps_catalogue_photo_resolve(uuid,uuid) to service_role;
commit;
