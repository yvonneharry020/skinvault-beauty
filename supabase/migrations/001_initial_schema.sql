-- ================================================================
-- SkinVault Beauty — Initial Database Schema
-- ================================================================

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy product search

-- ── 1. BRANDS ───────────────────────────────────────────────────
create table brands (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  country     text,
  logo_url    text,
  description text,
  website     text,
  created_at  timestamptz default now()
);

-- ── 2. CATEGORIES ───────────────────────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  sort_order  int default 0
);

-- Seed default categories
insert into categories (name, slug, sort_order) values
  ('Cleansers',         'cleansers',        1),
  ('Serums',            'serums',           2),
  ('Moisturizers',      'moisturizers',     3),
  ('Eye Care',          'eye-care',         4),
  ('Sunscreen',         'sunscreen',        5),
  ('Masks & Treatments','masks-treatments', 6),
  ('Toners & Essences', 'toners-essences',  7),
  ('Oils & Balms',      'oils-balms',       8),
  ('Body Care',         'body-care',        9),
  ('Tools',             'tools',           10);

-- ── 3. PRODUCTS ──────────────────────────────────────────────────
create table products (
  id              uuid primary key default uuid_generate_v4(),
  brand_id        uuid references brands(id) on delete set null,
  category_id     uuid references categories(id) on delete set null,
  name            text not null,
  slug            text not null unique,
  tagline         text,
  description     text,
  ingredients     text,
  how_to_use      text,
  skin_types      text[] default '{}', -- ['dry','oily','combination','sensitive','all']
  concerns        text[] default '{}', -- ['acne','aging','brightening', etc]
  price           numeric(10,2) not null,
  compare_price   numeric(10,2),       -- original price for sale badge
  currency        text default 'USD',
  stock           int default 0,
  sku             text unique,
  weight_g        int,
  volume_ml       int,
  is_active       boolean default true,
  is_featured     boolean default false,
  tag             text,                -- 'BESTSELLER' | 'NEW' | 'LIMITED' | etc
  cloudinary_folder text,             -- cloudinary subfolder for this product
  images          jsonb default '[]'::jsonb, -- [{public_id, url, alt, is_primary}]
  meta_title      text,
  meta_description text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_products_brand    on products(brand_id);
create index idx_products_category on products(category_id);
create index idx_products_active   on products(is_active);
create index idx_products_search   on products using gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- ── 4. USER PROFILES (extends Supabase auth.users) ────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  email           text unique,
  avatar_url      text,
  phone           text,
  date_of_birth   date,
  skin_type       text,
  skin_concerns   text[] default '{}',
  preferred_currency text default 'USD',
  is_admin        boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── 5. ADDRESSES ────────────────────────────────────────────────
create table addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade,
  label        text default 'Home',    -- 'Home' | 'Work' | 'Other'
  full_name    text not null,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text,
  postal_code  text,
  country      text not null default 'NG',
  phone        text,
  is_default   boolean default false,
  created_at   timestamptz default now()
);

-- ── 6. CART ITEMS ────────────────────────────────────────────────
create table cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity   int not null default 1 check (quantity > 0),
  added_at   timestamptz default now(),
  unique(user_id, product_id)
);

-- ── 7. WISHLIST ──────────────────────────────────────────────────
create table wishlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  added_at   timestamptz default now(),
  unique(user_id, product_id)
);

-- ── 8. ORDERS ────────────────────────────────────────────────────
create table orders (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete set null,
  address_id         uuid references addresses(id),
  status             text default 'pending'
                       check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_provider   text default 'paystack',
  payment_reference  text unique,
  payment_status     text default 'unpaid' check (payment_status in ('unpaid','paid','failed','refunded')),
  subtotal           numeric(10,2) not null,
  shipping           numeric(10,2) default 0,
  discount           numeric(10,2) default 0,
  total              numeric(10,2) not null,
  currency           text default 'USD',
  notes              text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ── 9. ORDER ITEMS ────────────────────────────────────────────────
create table order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null,          -- snapshot at time of order
  price        numeric(10,2) not null, -- snapshot
  quantity     int not null,
  subtotal     numeric(10,2) not null
);

-- ── 10. REVIEWS ──────────────────────────────────────────────────
create table reviews (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid references products(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  rating       int not null check (rating between 1 and 5),
  title        text,
  body         text,
  skin_type    text,
  verified     boolean default false,  -- verified purchase
  is_approved  boolean default false,
  created_at   timestamptz default now()
);

create index idx_reviews_product on reviews(product_id);

-- ── RLS POLICIES ─────────────────────────────────────────────────

alter table profiles    enable row level security;
alter table addresses   enable row level security;
alter table cart_items  enable row level security;
alter table wishlist    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table reviews     enable row level security;
-- products, brands, categories are public read
alter table products    enable row level security;
alter table brands      enable row level security;
alter table categories  enable row level security;

-- Profiles: users can only read/edit their own
create policy "profiles_select_own"  on profiles for select using (auth.uid() = id);
create policy "profiles_update_own"  on profiles for update using (auth.uid() = id);

-- Addresses: own only
create policy "addresses_crud_own"   on addresses for all using (auth.uid() = user_id);

-- Cart: own only
create policy "cart_crud_own"        on cart_items for all using (auth.uid() = user_id);

-- Wishlist: own only
create policy "wishlist_crud_own"    on wishlist for all using (auth.uid() = user_id);

-- Orders: users see their own; admins see all
create policy "orders_select_own"    on orders for select using (auth.uid() = user_id);
create policy "orders_insert_own"    on orders for insert with check (auth.uid() = user_id);

-- Order items: via order ownership
create policy "order_items_select"   on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- Reviews: anyone can read approved; users manage their own
create policy "reviews_select_approved" on reviews for select using (is_approved = true);
create policy "reviews_insert_own"      on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own"      on reviews for update using (auth.uid() = user_id);

-- Products, brands, categories: public read
create policy "products_public_read"    on products   for select using (is_active = true);
create policy "brands_public_read"      on brands     for select using (true);
create policy "categories_public_read"  on categories for select using (true);

-- ── UPDATED_AT trigger ────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_products_updated_at  before update on products  for each row execute procedure update_updated_at();
create trigger trg_orders_updated_at    before update on orders    for each row execute procedure update_updated_at();
create trigger trg_profiles_updated_at  before update on profiles  for each row execute procedure update_updated_at();
