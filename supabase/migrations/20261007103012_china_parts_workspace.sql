-- Reviewed baseline for the dedicated China Parts Final project. No application seeds.
begin;
create table public.cps_companies (
 id uuid primary key default gen_random_uuid(), office_id uuid not null,
 name text not null check(length(name) between 1 and 200),
 contact text not null default '' check(length(contact)<=200),
 email text not null default '' check(length(email)<=200), created_at timestamptz not null default now()
);
create index cps_companies_office on public.cps_companies(office_id);
create table public.cps_customer_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 company_id uuid not null references public.cps_companies(id), active boolean not null default false
);
create index cps_customer_members_company on public.cps_customer_members(company_id);
alter table public.cps_companies enable row level security;
alter table public.cps_customer_members enable row level security;
revoke all on public.cps_companies,public.cps_customer_members from anon,authenticated;
grant select on public.cps_companies,public.cps_customer_members to authenticated;
grant all on public.cps_companies,public.cps_customer_members to service_role;
create policy cps_customer_members_self on public.cps_customer_members for select to authenticated using(user_id=(select auth.uid()));
create policy cps_companies_scope on public.cps_companies for select to authenticated using(
 exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or m.office_id=cps_companies.office_id))
 or exists(select 1 from public.cps_customer_members m where m.user_id=(select auth.uid()) and m.active and m.company_id=cps_companies.id)
);
create table public.cps_portal_requests (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.cps_companies(id),
 reference text not null unique, status text not null default 'Submitted' check(status in ('Submitted','Under review','Needs information','Closed')),
 items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 50),
 version integer not null default 0 check(version>=0), created_at timestamptz not null default now()
);
create table public.cps_portal_comments (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.cps_portal_requests(id),
 author_id uuid not null references auth.users(id), body text not null check(length(body) between 1 and 2000),
 visibility text not null check(visibility in ('customer','internal')), created_at timestamptz not null default now()
);
create table public.cps_order_drafts (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.cps_companies(id),
 request_id uuid not null references public.cps_portal_requests(id), reference text not null unique,
 status text not null default 'Draft' check(status in ('Draft','Ready for internal review')),
 items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 50),
 customer_visible boolean not null default false, version integer not null default 0 check(version>=0), created_at timestamptz not null default now()
);
create table public.cps_invoice_drafts (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.cps_companies(id),
 order_id uuid not null references public.cps_order_drafts(id), reference text not null unique,
 currency text not null check(currency ~ '^[A-Z]{3}$'), scale smallint not null check(scale between 0 and 3),
 lines jsonb not null check(jsonb_typeof(lines)='array' and jsonb_array_length(lines) between 1 and 50),
 tax_minor bigint check(tax_minor between 0 and 100000000), customer_visible boolean not null default false,
 version integer not null default 0 check(version>=0), created_at timestamptz not null default now()
);
-- Real gateway ingestion is deliberately absent. Verified immutable provider event
-- IDs are unique; account/provider/signature/replay rules must be implemented first.
create table public.cps_payment_events (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.cps_companies(id),
 invoice_id uuid not null references public.cps_invoice_drafts(id), provider_event_id text not null unique,
 currency text not null check(currency ~ '^[A-Z]{3}$'), amount_minor bigint not null check(amount_minor>=0), created_at timestamptz not null default now()
);
create table public.cps_tracking_events (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.cps_order_drafts(id),
 label text not null check(length(label) between 1 and 100), detail text not null check(length(detail) between 1 and 1000),
 customer_visible boolean not null default false, created_at timestamptz not null default now()
);
create table public.cps_support_threads (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.cps_companies(id),
 subject text not null check(length(subject) between 1 and 200), body text not null check(length(body) between 1 and 2000),
 status text not null default 'Open' check(status in ('Open','Under review','Closed')),
 version integer not null default 0 check(version>=0), created_at timestamptz not null default now()
);
create table public.cps_catalogue (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 200),
 part_number text not null default '' check(length(part_number)<=100), brand text not null default '' check(length(brand)<=100),
 category text not null check(length(category) between 1 and 100), description text not null check(length(description) between 1 and 2000),
 published boolean not null default false, approved boolean not null default false, check(not published or approved),
 version integer not null default 0 check(version>=0), created_at timestamptz not null default now()
);
create table public.cps_content_drafts (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null check(length(title) between 1 and 200), body text not null check(length(body) between 1 and 10000),
 version integer not null default 0 check(version>=0), created_at timestamptz not null default now()
);
-- Parent-child company consistency is enforced even for privileged ingestion.
alter table public.cps_portal_requests add constraint cps_request_company_unique unique(id,company_id);
alter table public.cps_order_drafts add constraint cps_order_request_company foreign key(request_id,company_id) references public.cps_portal_requests(id,company_id);
alter table public.cps_order_drafts add constraint cps_order_company_unique unique(id,company_id);
alter table public.cps_invoice_drafts add constraint cps_invoice_order_company foreign key(order_id,company_id) references public.cps_order_drafts(id,company_id);
alter table public.cps_invoice_drafts add constraint cps_invoice_company_unique unique(id,company_id);
alter table public.cps_payment_events add constraint cps_payment_invoice_company foreign key(invoice_id,company_id) references public.cps_invoice_drafts(id,company_id);
create index cps_portal_requests_company_created on public.cps_portal_requests(company_id,created_at desc);
create index cps_portal_comments_request on public.cps_portal_comments(request_id);
create index cps_portal_comments_author on public.cps_portal_comments(author_id);
create index cps_order_drafts_company_created on public.cps_order_drafts(company_id,created_at desc);
create index cps_order_drafts_request on public.cps_order_drafts(request_id,company_id);
create index cps_invoice_drafts_company_created on public.cps_invoice_drafts(company_id,created_at desc);
create index cps_invoice_drafts_order on public.cps_invoice_drafts(order_id,company_id);
create index cps_payment_events_company_created on public.cps_payment_events(company_id,created_at desc);
create index cps_payment_events_invoice on public.cps_payment_events(invoice_id,company_id);
create index cps_tracking_events_order on public.cps_tracking_events(order_id);
create index cps_support_threads_company_created on public.cps_support_threads(company_id,created_at desc);
do $$ declare t text; begin
 foreach t in array array['cps_portal_requests','cps_portal_comments','cps_order_drafts','cps_invoice_drafts','cps_payment_events','cps_tracking_events','cps_support_threads','cps_catalogue','cps_content_drafts'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
create policy cps_portal_requests_scope on public.cps_portal_requests for select to authenticated using(exists(select 1 from public.cps_companies c where c.id=company_id));
create policy cps_portal_comments_scope on public.cps_portal_comments for select to authenticated using(
 exists(select 1 from public.cps_portal_requests r where r.id=request_id) and
 (visibility='customer' or exists(select 1 from public.cps_staff_members m join public.cps_portal_requests r on r.id=request_id join public.cps_companies c on c.id=r.company_id where m.user_id=(select auth.uid()) and m.active and (m.role='admin' or m.office_id=c.office_id)))
);
create policy cps_order_drafts_scope on public.cps_order_drafts for select to authenticated using(
 exists(select 1 from public.cps_companies c where c.id=company_id) and
 (customer_visible or exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active))
);
create policy cps_invoice_drafts_scope on public.cps_invoice_drafts for select to authenticated using(
 exists(select 1 from public.cps_order_drafts o where o.id=order_id) and
 (customer_visible or exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active))
);
create policy cps_payment_events_scope on public.cps_payment_events for select to authenticated using(exists(select 1 from public.cps_invoice_drafts i where i.id=invoice_id));
create policy cps_tracking_events_scope on public.cps_tracking_events for select to authenticated using(
 exists(select 1 from public.cps_order_drafts o where o.id=order_id) and
 (customer_visible or exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active))
);
create policy cps_support_threads_scope on public.cps_support_threads for select to authenticated using(exists(select 1 from public.cps_companies c where c.id=company_id));
create policy cps_catalogue_read on public.cps_catalogue for select to authenticated using((published and approved) or exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active));
create policy cps_content_drafts_admin on public.cps_content_drafts for select to authenticated using(exists(select 1 from public.cps_staff_members m where m.user_id=(select auth.uid()) and m.active and m.role='admin'));
commit;
