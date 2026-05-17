-- transactions: one row per booking attempt / payment cycle.
-- Inserted at /api/payment/create, updated by /api/payment/webhook.

create extension if not exists pgcrypto;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),

  -- Identifiers
  merchant_order_id text unique not null,
  hostify_reservation_id bigint not null,
  hostify_confirmation_code text,

  -- Booking snapshot
  home_slug text not null,
  check_in date not null,
  check_out date not null,
  nights int not null,
  guests int not null,
  guest_email text not null,
  guest_first_name text not null,
  guest_last_name text not null,
  guest_phone text not null,
  amount_egp int not null,
  locale text not null,

  -- Lifecycle
  status text not null default 'initiated',
    -- initiated → row created, SuperPay POST not yet attempted
    -- pending   → SuperPay returned a paymentUrl, awaiting webhook
    -- succeeded → PAY_COMPLETED, Hostify accepted
    -- failed    → SuperPay rejected create OR webhook reported FAILED/EXPIRED
    -- cancelled → webhook reported CANCELLED
  superpay_status text,
  payment_gw_order_id text,
  payment_url text,

  -- Hostify post-payment action
  hostify_status text,
  hostify_action_at timestamptz,
  hostify_error text,

  -- Raw payloads (debugging)
  webhook_payload jsonb,
  verify_payload jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_hostify_reservation_id_idx
  on transactions(hostify_reservation_id);
create index if not exists transactions_status_idx
  on transactions(status);
create index if not exists transactions_created_at_desc_idx
  on transactions(created_at desc);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
  before update on transactions
  for each row execute function set_updated_at();
