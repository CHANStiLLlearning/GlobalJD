-- GlobalJD Supabase Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ---------------------------------------------------------------
-- Products table (stores full product object as JSONB)
-- ---------------------------------------------------------------
create table if not exists products (
  id bigint primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------
-- Orders table
-- ---------------------------------------------------------------
create table if not exists orders (
  id text primary key,
  customer text not null,
  product text not null,
  amount text not null,
  status text default 'Processing',
  date text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------
-- Users table
-- ---------------------------------------------------------------
create table if not exists users (
  username text primary key,
  password text not null,
  role text default 'user',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------
-- Coupons table
-- ---------------------------------------------------------------
create table if not exists coupons (
  code text primary key,
  discount_percent int not null default 0,
  active boolean default true
);

-- ---------------------------------------------------------------
-- Wishlists table
-- ---------------------------------------------------------------
create table if not exists wishlists (
  id bigint primary key,
  username text not null,
  product_id bigint not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------
-- Custom Items table
-- ---------------------------------------------------------------
create table if not exists custom_items (
  id bigint primary key,
  title text not null,
  category text default 'General',
  status text default 'Active'
);

-- ---------------------------------------------------------------
-- Store Settings (single row)
-- ---------------------------------------------------------------
create table if not exists store_settings (
  id int primary key default 1,
  store_name text default 'GlobalJD',
  email text default 'admin@globaljd.com',
  currency text default 'USD',
  notifications boolean default true
);

insert into store_settings (id, store_name, email, currency)
values (1, 'GlobalJD', 'admin@globaljd.com', 'USD')
on conflict (id) do nothing;

-- ---------------------------------------------------------------
-- Seed admin user
-- ---------------------------------------------------------------
insert into users (username, password, role)
values ('admin', 'password', 'admin')
on conflict (username) do nothing;

insert into coupons (code, discount_percent, active)
values ('GLOBAL20', 20, true)
on conflict (code) do nothing;

-- Disable Row Level Security for simplicity (backend uses service key)
alter table products disable row level security;
alter table orders disable row level security;
alter table users disable row level security;
alter table coupons disable row level security;
alter table wishlists disable row level security;
alter table custom_items disable row level security;
alter table store_settings disable row level security;
