-- Fresh dedicated project: retain explicit grants; prevent implicit future exposure.
begin;
create index cps_audit_actor on public.cps_audit(actor);
create index cps_catalogue_photo on public.cps_catalogue(photo_id,id);
create index cps_staff_office on public.cps_staff_members(office_id);
alter default privileges for role postgres revoke all on tables from public,anon,authenticated;
alter default privileges for role postgres in schema public revoke all on tables from public,anon,authenticated;
alter default privileges for role postgres revoke all on sequences from public,anon,authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from public,anon,authenticated;
alter default privileges for role postgres revoke execute on functions from public,anon,authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public,anon,authenticated;
commit;
