-- LV Estimate — initial schema

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Customers & Contacts ────────────────────────────────────────────────────
create table customers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        text not null default 'commercial' check (type in ('residential','commercial','government','industrial')),
  email       text,
  phone       text,
  address     text,
  city        text,
  state       text,
  zip         text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table contacts (
  id          uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  name        text not null,
  title       text,
  email       text,
  phone       text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── Cost Catalog ────────────────────────────────────────────────────────────
create table catalog_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  parent_id   uuid references catalog_categories(id) on delete set null,
  sort_order  integer not null default 0
);

create table catalog_items (
  id              uuid primary key default uuid_generate_v4(),
  category_id     uuid references catalog_categories(id) on delete set null,
  sku             text,
  name            text not null,
  description     text,
  manufacturer    text,
  model_number    text,
  unit            text not null default 'each' check (unit in ('each','ft','sqft','hr','lot','pr')),
  unit_cost       numeric(10,2) not null default 0,
  list_price      numeric(10,2),
  labor_hours     numeric(6,3) not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Assemblies ──────────────────────────────────────────────────────────────
create table assemblies (
  id          uuid primary key default uuid_generate_v4(),
  category_id uuid references catalog_categories(id) on delete set null,
  name        text not null,
  description text,
  notes       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table assembly_components (
  id                 uuid primary key default uuid_generate_v4(),
  assembly_id        uuid not null references assemblies(id) on delete cascade,
  type               text not null check (type in ('material','labor')),
  catalog_item_id    uuid references catalog_items(id) on delete set null,
  labor_description  text,
  quantity           numeric(10,3) not null default 1,
  override_unit_cost numeric(10,2),   -- null = pull live from catalog_items
  sort_order         integer not null default 0
);

-- ─── Estimates ───────────────────────────────────────────────────────────────
create table estimates (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid references customers(id) on delete set null,
  name         text not null,
  status       text not null default 'draft' check (status in ('draft','review','approved','won','lost')),
  overhead_pct numeric(5,2) not null default 10,
  profit_pct   numeric(5,2) not null default 15,
  notes        text,
  created_by   uuid,   -- auth.users id
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table estimate_sections (
  id          uuid primary key default uuid_generate_v4(),
  estimate_id uuid not null references estimates(id) on delete cascade,
  name        text not null,
  sort_order  integer not null default 0
);

create table estimate_line_items (
  id              uuid primary key default uuid_generate_v4(),
  estimate_id     uuid not null references estimates(id) on delete cascade,
  section_id      uuid references estimate_sections(id) on delete set null,
  type            text not null check (type in ('catalog_item','assembly','labor','custom')),
  catalog_item_id uuid references catalog_items(id) on delete set null,
  assembly_id     uuid references assemblies(id) on delete set null,
  name            text not null,
  description     text,
  quantity        numeric(10,3) not null default 1,
  unit            text not null default 'each',
  unit_cost       numeric(10,2) not null default 0,  -- locked at time of add
  unit_price      numeric(10,2) not null default 0,  -- sell price per unit
  labor_hours     numeric(8,3) not null default 0,   -- total labor hours for this line
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ─── Proposals ───────────────────────────────────────────────────────────────
create table proposals (
  id           uuid primary key default uuid_generate_v4(),
  estimate_id  uuid references estimates(id) on delete set null,
  customer_id  uuid references customers(id) on delete set null,
  title        text not null,
  status       text not null default 'draft' check (status in ('draft','sent','viewed','signed','rejected')),
  valid_until  date,
  terms        text,
  notes        text,
  pdf_url      text,
  sent_at      timestamptz,
  signed_at    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Pipeline / Opportunities ────────────────────────────────────────────────
create table opportunities (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references customers(id) on delete set null,
  estimate_id     uuid references estimates(id) on delete set null,
  name            text not null,
  value           numeric(12,2),
  stage           text not null default 'lead' check (stage in ('lead','proposal_sent','negotiation','won','lost')),
  probability     integer check (probability between 0 and 100),
  expected_close  date,
  assigned_to     text,
  lost_reason     text,
  won_at          timestamptz,
  lost_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Triggers: updated_at ────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger customers_updated_at    before update on customers    for each row execute function set_updated_at();
create trigger catalog_items_updated_at before update on catalog_items for each row execute function set_updated_at();
create trigger assemblies_updated_at   before update on assemblies   for each row execute function set_updated_at();
create trigger estimates_updated_at    before update on estimates     for each row execute function set_updated_at();
create trigger proposals_updated_at    before update on proposals     for each row execute function set_updated_at();
create trigger opportunities_updated_at before update on opportunities for each row execute function set_updated_at();

-- ─── Seed: default catalog categories ────────────────────────────────────────
insert into catalog_categories (name, sort_order) values
  ('Cameras & Video', 10),
  ('Access Control', 20),
  ('Intrusion / Alarm', 30),
  ('Intercom & Audio', 40),
  ('Structured Cabling', 50),
  ('Networking', 60),
  ('Power & UPS', 70),
  ('Labor', 80),
  ('Miscellaneous', 90);
