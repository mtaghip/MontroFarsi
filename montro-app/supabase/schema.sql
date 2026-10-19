-- ============================================================================
-- Montro Jewellery & Luxury Watch — database schema (Supabase / Postgres)
-- Run this in Supabase ▸ SQL Editor (paste all, click Run).
-- Safe to re-run: it uses "if not exists" / "or replace" where possible.
-- ============================================================================

-- ---- Extensions ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---- Profiles (one row per login, with a role) -----------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'staff' check (role in ('partner','staff')),
  created_at  timestamptz not null default now()
);

-- auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: is the current user a partner?
create or replace function public.is_partner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'partner');
$$;

-- ---- Inventory -------------------------------------------------------------
create table if not exists public.inventory (
  id                  uuid primary key default gen_random_uuid(),
  stock_id            text unique not null,
  photo_url           text,
  barcode             text,
  date_purchased      date,
  category            text,
  subcategory         text,
  brand               text,
  model               text,
  model_ref_number    text,
  serial_number       text,
  description         text,
  metal               text,
  metal_purity        text,
  weight_g            numeric,
  stone_type          text,
  stone_carat         numeric,
  diamond_colour      text,
  diamond_clarity     text,
  ring_size           text,
  watch_case_size     text,
  watch_movement      text,
  watch_year          int,
  box_included        boolean default false,
  papers_included     boolean default false,
  warranty_included   boolean default false,
  condition           text,
  supplier_name       text,
  supplier_type       text,
  supplier_invoice_ref text,
  purchase_currency   text default 'GBP',
  purchase_price      numeric default 0,
  additional_costs    numeric default 0,
  total_landed_cost   numeric generated always as (coalesce(purchase_price,0)+coalesce(additional_costs,0)) stored,
  paid_by             text,
  funding_type        text,
  ownership_notes     text,
  target_price        numeric,
  min_price           numeric,
  advertised_price    numeric,
  location            text,
  stock_status        text default 'Available',
  date_sold           date,
  actual_sell_price   numeric,
  salesperson         text,
  customer_ref        text,
  payment_method      text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---- Sales -----------------------------------------------------------------
create table if not exists public.sales (
  id              uuid primary key default gen_random_uuid(),
  sale_id         text unique not null,
  sale_date       date not null default current_date,
  stock_id        text,
  item_desc       text,
  category        text,
  salesperson     text,
  customer_ref    text,
  invoice_number  text,
  cost_price      numeric default 0,
  advertised_price numeric,
  selling_price   numeric default 0,
  discount_amount numeric generated always as (coalesce(advertised_price,0)-coalesce(selling_price,0)) stored,
  gross_profit    numeric generated always as (coalesce(selling_price,0)-coalesce(cost_price,0)) stored,
  vat_treatment   text,
  payment_method  text,
  deposit         numeric default 0,
  balance         numeric default 0,
  amount_outstanding numeric generated always as (coalesce(selling_price,0)-coalesce(deposit,0)-coalesce(balance,0)) stored,
  payment_status  text,
  trade_in        boolean default false,
  trade_in_value  numeric default 0,
  refund          boolean default false,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ---- Partner contributions (the funding ledger) ----------------------------
create table if not exists public.partner_contributions (
  id                uuid primary key default gen_random_uuid(),
  txn_id            text unique not null,
  txn_date          date not null default current_date,
  partner           text not null,
  txn_type          text,
  description       text,
  related_stock_id  text,
  related_expense_id text,
  amount            numeric default 0,
  payment_method    text,
  business_purpose  text,
  reimbursed_amount numeric default 0,
  reimbursement_date date,
  amount_outstanding numeric generated always as (coalesce(amount,0)-coalesce(reimbursed_amount,0)) stored,
  notes             text,
  created_at        timestamptz not null default now()
);

-- ---- Expenses --------------------------------------------------------------
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  expense_id      text unique not null,
  expense_date    date not null default current_date,
  supplier        text,
  category        text,
  description     text,
  invoice_number  text,
  net_amount      numeric default 0,
  vat             numeric default 0,
  gross_amount    numeric generated always as (coalesce(net_amount,0)+coalesce(vat,0)) stored,
  paid_by         text,
  payment_method  text,
  recurring       boolean default false,
  related_partner_contribution boolean default false,
  partner         text,
  reimbursed      boolean default false,
  reimbursement_date date,
  notes           text,
  receipt_url     text,
  created_at      timestamptz not null default now()
);

-- ---- Building & setup costs ------------------------------------------------
create table if not exists public.building_costs (
  id              uuid primary key default gen_random_uuid(),
  project_id      text unique not null,
  cost_date       date,
  category        text,
  contractor      text,
  description     text,
  budget          numeric default 0,
  actual_cost     numeric default 0,
  variance        numeric generated always as (coalesce(budget,0)-coalesce(actual_cost,0)) stored,
  vat             numeric default 0,
  paid_by         text,
  reimbursed_amount numeric default 0,
  amount_outstanding numeric generated always as (coalesce(actual_cost,0)-coalesce(reimbursed_amount,0)) stored,
  invoice_number  text,
  completion_status text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ---- Stock movement log ----------------------------------------------------
create table if not exists public.stock_movements (
  id              uuid primary key default gen_random_uuid(),
  movement_id     text unique not null,
  moved_at        timestamptz not null default now(),
  stock_id        text,
  item            text,
  previous_location text,
  new_location    text,
  person_taking   text,
  staff_authorising text,
  reason          text,
  expected_return date,
  actual_return   date,
  returned        boolean default false,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ---- Staff -----------------------------------------------------------------
create table if not exists public.staff (
  id            uuid primary key default gen_random_uuid(),
  staff_id      text unique,
  name          text not null,
  position      text,
  start_date    date,
  active        boolean default true,
  sales_target  numeric default 0,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ---- Suppliers -------------------------------------------------------------
create table if not exists public.suppliers (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   text unique,
  name          text not null,
  supplier_type text,
  contact_name  text,
  telephone     text,
  email         text,
  address       text,
  vat_number    text,
  payment_terms text,
  outstanding_amount numeric default 0,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ---- Customers -------------------------------------------------------------
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  customer_id   text unique,
  name          text,
  telephone     text,
  email         text,
  first_purchase date,
  last_purchase  date,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ---- Returns & refunds -----------------------------------------------------
create table if not exists public.returns (
  id              uuid primary key default gen_random_uuid(),
  return_id       text unique not null,
  return_date     date not null default current_date,
  original_sale_id text,
  stock_id        text,
  customer_ref    text,
  original_price  numeric,
  refund_amount   numeric,
  reason          text,
  condition_on_return text,
  returned_to_stock boolean default true,
  new_stock_status text,
  approved_by     text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ---- Stock take ------------------------------------------------------------
create table if not exists public.stock_take (
  id              uuid primary key default gen_random_uuid(),
  take_date       date not null default current_date,
  stock_id        text,
  item            text,
  expected_location text,
  expected_status text,
  found           boolean,
  actual_location text,
  checked_by      text,
  difference      text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ---- Audit log (automatic) -------------------------------------------------
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  at            timestamptz not null default now(),
  user_email    text,
  action        text,
  table_name    text,
  record_ref    text,
  changes       jsonb,
  created_at    timestamptz not null default now()
);

-- Generic audit trigger: logs every insert/update/delete with the user email
create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ref text;
  email text;
begin
  select u.email into email from auth.users u where u.id = auth.uid();
  ref := coalesce(
    (to_jsonb(coalesce(new, old)) ->> 'stock_id'),
    (to_jsonb(coalesce(new, old)) ->> 'sale_id'),
    (to_jsonb(coalesce(new, old)) ->> 'txn_id'),
    (to_jsonb(coalesce(new, old)) ->> 'expense_id'),
    (to_jsonb(coalesce(new, old)) ->> 'id')
  );
  insert into public.audit_log(user_email, action, table_name, record_ref, changes)
  values (email, tg_op, tg_table_name, ref,
          case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end);
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['inventory','sales','partner_contributions','expenses','building_costs','returns']
  loop
    execute format('drop trigger if exists audit_%1$s on public.%1$s;', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s
                    for each row execute function public.log_audit();', t);
  end loop;
end $$;

-- ============================================================================
-- Row Level Security
--   * everyone signed in can READ everything
--   * everyone signed in can INSERT / UPDATE (daily data entry by staff)
--   * only PARTNERS can DELETE
--   * audit_log is read-only to clients (only the trigger writes it)
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array['profiles','inventory','sales','partner_contributions','expenses',
                           'building_costs','stock_movements','staff','suppliers','customers',
                           'returns','stock_take','audit_log']
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- profiles: a user sees all profiles, edits only their own; partners manage all
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for update to authenticated using (id = auth.uid());

-- data tables: read all, write all, delete partner-only
do $$
declare t text;
begin
  foreach t in array array['inventory','sales','partner_contributions','expenses','building_costs',
                           'stock_movements','staff','suppliers','customers','returns','stock_take']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s;', t);
    execute format('create policy %1$s_read on public.%1$s for select to authenticated using (true);', t);
    execute format('drop policy if exists %1$s_insert on public.%1$s;', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated with check (true);', t);
    execute format('drop policy if exists %1$s_update on public.%1$s;', t);
    execute format('create policy %1$s_update on public.%1$s for update to authenticated using (true);', t);
    execute format('drop policy if exists %1$s_delete on public.%1$s;', t);
    execute format('create policy %1$s_delete on public.%1$s for delete to authenticated using (public.is_partner());', t);
  end loop;
end $$;

-- audit_log: readable by all signed-in users, never written by clients
drop policy if exists audit_read on public.audit_log;
create policy audit_read on public.audit_log for select to authenticated using (true);

-- ============================================================================
-- Storage bucket for item photos
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists photos_read on storage.objects;
create policy photos_read on storage.objects for select using (bucket_id = 'photos');
drop policy if exists photos_write on storage.objects;
create policy photos_write on storage.objects for insert to authenticated with check (bucket_id = 'photos');
drop policy if exists photos_update on storage.objects;
create policy photos_update on storage.objects for update to authenticated using (bucket_id = 'photos');

-- ============================================================================
-- Done. Next: create your first user in Authentication ▸ Users, then in
-- SQL Editor run:  update public.profiles set role='partner' where id =
--   (select id from auth.users where email = 'you@example.com');
-- ============================================================================
