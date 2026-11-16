-- Skema PRD v0.4: jastip PO ikan asap untuk Cikarang.
-- Uang dalam rupiah bulat, berat dalam gram.

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin_produksi', 'admin_cikarang')),
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  category text not null default 'ikan' check (category in ('ikan', 'kepala', 'jeroan', 'telur', 'pendamping')),
  unit_type text not null check (unit_type in ('ekor', 'pack_irisan', 'bungkus')),
  description text not null default '',
  net_weight_gram integer check (net_weight_gram > 0),
  ship_weight_gram integer check (ship_weight_gram > 0),
  price integer check (price > 0),
  image_path text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Berat kirim termasuk kemasan vakum, jadi tidak mungkin lebih ringan dari isinya.
  constraint products_ship_weight_check check (ship_weight_gram >= net_weight_gram),
  -- Produk baru bisa dijual setelah harga dan kedua beratnya terisi.
  constraint products_active_requires_data check (
    not is_active or (price is not null and net_weight_gram is not null and ship_weight_gram is not null)
  )
);

create table public.service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  delivery_fee integer check (delivery_fee >= 0),
  center_lat double precision not null check (center_lat between -90 and 90),
  center_lng double precision not null check (center_lng between -180 and 180),
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_areas_active_requires_fee check (not is_active or delivery_fee is not null)
);

create table public.po_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  close_order_at timestamptz not null,
  delivery_date date not null,
  capacity_gram integer not null check (capacity_gram > 0),
  max_order_weight_gram integer not null check (max_order_weight_gram > 0),
  min_weight_gram integer not null default 3000 check (min_weight_gram >= 0),
  min_orders integer not null default 5 check (min_orders >= 0),
  status text not null default 'open'
    check (status in ('open', 'closed', 'cancelled', 'in_transit', 'arrived_in_cikarang', 'completed')),
  cancel_reason text,
  change_reason text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint po_batches_max_order_check check (max_order_weight_gram <= capacity_gram),
  -- Jarak minimum tutup PO ke tanggal antar belum diputuskan (PRD Bagian 23 no. 7). Sementara paling cepat H+1.
  constraint po_batches_delivery_after_close check (delivery_date > (close_order_at at time zone 'Asia/Jakarta')::date)
);

-- MVP: hanya satu kloter yang menerima pesanan pada satu waktu.
create unique index po_batches_one_open on public.po_batches (status) where status = 'open';
create index po_batches_created_by on public.po_batches (created_by);

create sequence public.order_invoice_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  -- 128 bit acak: satu-satunya kunci halaman status, karena pembeli tidak punya akun.
  status_token text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  batch_id uuid not null references public.po_batches (id),
  buyer_name text not null check (char_length(buyer_name) between 2 and 100),
  buyer_phone text not null check (buyer_phone ~ '^628[0-9]{8,11}$'),
  recipient_name text check (recipient_name is null or char_length(recipient_name) between 2 and 100),
  recipient_phone text check (recipient_phone is null or recipient_phone ~ '^628[0-9]{8,11}$'),
  area_id uuid not null references public.service_areas (id),
  address_text text not null check (char_length(address_text) between 10 and 500),
  address_note text check (address_note is null or char_length(address_note) <= 300),
  lat double precision not null,
  lng double precision not null,
  subtotal integer not null check (subtotal > 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total_amount integer not null,
  total_weight_gram integer not null check (total_weight_gram > 0),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'expired', 'failed', 'refund_pending', 'refunded')),
  order_status text not null default 'waiting_payment'
    check (order_status in ('waiting_payment', 'processing_vacuum', 'shipped_to_cikarang', 'arrived_in_cikarang',
                            'out_for_delivery', 'delivery_failed', 'completed', 'cancelled')),
  cancel_reason text check (cancel_reason is null or cancel_reason in (
    'expired', 'payment_failed', 'batch_min_not_met', 'batch_cancelled', 'production_failed',
    'damaged_in_transit', 'delivery_failed', 'paid_after_cancel', 'admin')),
  cancel_note text,
  expires_at timestamptz not null,
  paid_at timestamptz,
  shipped_at timestamptz,
  arrived_at timestamptz,
  delivered_at timestamptz,
  delivery_attempts integer not null default 0 check (delivery_attempts between 0 and 2),
  proof_photo_path text,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_check check (total_amount = subtotal + delivery_fee),
  -- Pasangan status pesanan dan pembayaran yang sah (PRD Bagian 9.2).
  constraint orders_status_valid check (
    (order_status = 'waiting_payment' and payment_status = 'pending')
    or (order_status in ('processing_vacuum', 'shipped_to_cikarang', 'arrived_in_cikarang', 'out_for_delivery',
                         'delivery_failed', 'completed') and payment_status = 'paid')
    or (order_status = 'cancelled' and payment_status in ('expired', 'failed', 'refund_pending', 'refunded', 'paid'))
  ),
  constraint orders_cancel_reason_valid check ((order_status = 'cancelled') = (cancel_reason is not null))
);

create index orders_batch_status on public.orders (batch_id, order_status);
create index orders_area on public.orders (area_id);
create index orders_pending_phone on public.orders (buyer_phone) where order_status = 'waiting_payment';
create index orders_pending_expiry on public.orders (expires_at) where order_status = 'waiting_payment';

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity between 1 and 10),
  price_at_purchase integer not null check (price_at_purchase > 0),
  ship_weight_at_purchase_gram integer not null check (ship_weight_at_purchase_gram > 0),
  constraint order_items_unique_product unique (order_id, product_id)
);

create index order_items_product on public.order_items (product_id);

-- Satu baris per notifikasi Midtrans. Pasangan unik di bawah membuat notifikasi ganda tidak diproses dua kali.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete restrict,
  invoice_number text not null,
  transaction_id text not null,
  transaction_status text not null,
  fraud_status text,
  payment_type text,
  gross_amount numeric(14, 2) not null,
  transaction_time timestamptz,
  outcome text,
  raw_payload jsonb not null,
  received_at timestamptz not null default now(),
  constraint payments_idempotent unique (transaction_id, transaction_status)
);

create index payments_order on public.payments (order_id);

-- Nomor rekening pembeli sengaja tidak disimpan. Cukup bukti transfernya.
create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  amount integer not null check (amount > 0),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  proof_path text,
  processed_by uuid references auth.users (id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint refunds_done_requires_proof check (status <> 'done' or (proof_path is not null and processed_at is not null))
);

create index refunds_processed_by on public.refunds (processed_by);

-- actor_id tanpa foreign key: log tidak boleh ikut berubah saat akun admin dihapus.
create table public.status_log (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders (id) on delete restrict,
  batch_id uuid references public.po_batches (id) on delete restrict,
  actor_type text not null check (actor_type in ('system', 'midtrans', 'admin')),
  actor_id uuid,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now(),
  constraint status_log_target check (order_id is not null or batch_id is not null)
);

create index status_log_order on public.status_log (order_id);
create index status_log_batch on public.status_log (batch_id);

create function public.reject_status_log_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'status_log tidak boleh diubah atau dihapus';
end;
$$;

create trigger status_log_append_only
  before update or delete on public.status_log
  for each row execute function public.reject_status_log_change();

-- Dipakai untuk batas checkout per IP. Isinya hash, bukan alamat IP asli.
create table public.checkout_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index checkout_attempts_ip_time on public.checkout_attempts (ip_hash, created_at);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger service_areas_updated_at before update on public.service_areas
  for each row execute function public.set_updated_at();
create trigger po_batches_updated_at before update on public.po_batches
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger refunds_updated_at before update on public.refunds
  for each row execute function public.set_updated_at();
