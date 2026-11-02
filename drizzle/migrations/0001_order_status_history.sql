-- Migration 0001: Add order_status_history and tracking columns to orders
alter table public.orders add column if not exists order_code text;
alter table public.orders add column if not exists tracking_token text;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_code on public.orders(order_code);
create index if not exists idx_order_status_history_order on public.order_status_history(order_id);
