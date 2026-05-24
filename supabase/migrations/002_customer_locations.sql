-- Migration 002: Customer locations (main / billing / site)
-- Replaces flat address columns on customers with a proper locations table

-- ─── New table ───────────────────────────────────────────────────────────────
create table customer_locations (
  id          uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  type        text not null default 'site'
                check (type in ('main','billing','site')),
  label       text,           -- e.g. "Main Office", "North Warehouse", "Site A"
  address     text,
  city        text,
  state       text,
  zip         text,
  phone       text,
  email       text,
  notes       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── Migrate existing address data ───────────────────────────────────────────
-- Move any existing customer address/contact data into a 'main' location record
insert into customer_locations (customer_id, type, label, address, city, state, zip, phone, email)
select id, 'main', 'Main Office', address, city, state, zip, phone, email
from customers
where address is not null or city is not null or phone is not null or email is not null;

-- ─── Drop old columns from customers ────────────────────────────────────────
alter table customers drop column if exists email;
alter table customers drop column if exists phone;
alter table customers drop column if exists address;
alter table customers drop column if exists city;
alter table customers drop column if exists state;
alter table customers drop column if exists zip;

-- ─── Add location_id to contacts ─────────────────────────────────────────────
alter table contacts
  add column location_id uuid references customer_locations(id) on delete set null;

-- ─── Add site_location_id to estimates ───────────────────────────────────────
alter table estimates
  add column site_location_id uuid references customer_locations(id) on delete set null;
