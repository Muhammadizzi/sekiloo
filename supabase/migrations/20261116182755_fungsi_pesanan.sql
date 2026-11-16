-- Fungsi inti pemesanan (PRD Bagian 8 dan 10).

-- Waktu tunggu notifikasi Midtrans yang terlambat sebelum pesanan dianggap kedaluwarsa.
create function public._grace_period()
returns interval
language sql
immutable
set search_path = ''
as $$ select interval '10 minutes' $$;

-- Kotak batas kasar lima kecamatan Cikarang. Perkiraan, wajib dicek dengan peta sebelum tayang.
create function public._in_service_area(p_lat double precision, p_lng double precision)
returns boolean
language sql
immutable
set search_path = ''
as $$ select p_lat between -6.43 and -6.20 and p_lng between 107.03 and 107.28 $$;

-- Berat terpakai dihitung dari pesanan, bukan disimpan sebagai angka terpisah, supaya tidak pernah selisih.
create function public._batch_used_gram(p_batch_id uuid)
returns integer
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(o.total_weight_gram), 0)::integer
  from public.orders o
  where o.batch_id = p_batch_id
    and (
      o.order_status in ('processing_vacuum', 'shipped_to_cikarang', 'arrived_in_cikarang',
                         'out_for_delivery', 'delivery_failed', 'completed')
      or (o.order_status = 'waiting_payment' and o.expires_at > now() - public._grace_period())
    );
$$;

create function public._log_status(
  p_order_id uuid,
  p_batch_id uuid,
  p_actor_type text,
  p_from text,
  p_to text,
  p_note text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.status_log (order_id, batch_id, actor_type, actor_id, from_status, to_status, note)
  values (p_order_id, p_batch_id, p_actor_type,
          case when p_actor_type = 'admin' then (select auth.uid()) end,
          p_from, p_to, p_note);
$$;

create function public.get_open_batch()
returns table (
  id uuid,
  name text,
  close_order_at timestamptz,
  checkout_closes_at timestamptz,
  delivery_date date,
  capacity_gram integer,
  max_order_weight_gram integer,
  used_gram integer,
  remaining_gram integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.id, b.name, b.close_order_at, b.close_order_at - interval '15 minutes', b.delivery_date,
         b.capacity_gram, b.max_order_weight_gram, u.used, greatest(b.capacity_gram - u.used, 0)
  from public.po_batches b
  cross join lateral (select public._batch_used_gram(b.id) as used) u
  where b.status = 'open';
$$;

create function public.create_order(
  p_batch_id uuid,
  p_items jsonb,
  p_area_id uuid,
  p_buyer_name text,
  p_buyer_phone text,
  p_address_text text,
  p_lat double precision,
  p_lng double precision,
  p_consent boolean,
  p_address_note text default null,
  p_recipient_name text default null,
  p_recipient_phone text default null,
  p_ip_hash text default null
)
returns table (order_id uuid, invoice_number text, status_token text, total_amount integer, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_batch public.po_batches%rowtype;
  v_area public.service_areas%rowtype;
  v_product public.products%rowtype;
  v_item jsonb;
  v_pid uuid;
  v_qty integer;
  v_ids uuid[] := '{}';
  v_qtys integer[] := '{}';
  v_prices integer[] := '{}';
  v_weights integer[] := '{}';
  v_subtotal integer := 0;
  v_weight integer := 0;
  v_used integer;
  v_order_id uuid;
  v_invoice text;
  v_token text;
  v_expires timestamptz;
begin
  if p_consent is not true then
    raise exception 'persetujuan_wajib';
  end if;

  -- Baris kloter dikunci sampai transaksi selesai: dua checkout bersamaan untuk sisa kapasitas
  -- terakhir akan antre, dan yang kedua melihat berat yang sudah dipakai yang pertama.
  select * into v_batch from public.po_batches b where b.id = p_batch_id for update;
  if not found or v_batch.status <> 'open' or now() > v_batch.close_order_at - interval '15 minutes' then
    raise exception 'kloter_tutup';
  end if;

  select * into v_area from public.service_areas a where a.id = p_area_id and a.is_active;
  if not found then
    raise exception 'wilayah_tidak_dilayani';
  end if;

  if not public._in_service_area(p_lat, p_lng) then
    raise exception 'lokasi_di_luar_cikarang';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'keranjang_tidak_valid';
  end if;

  for v_item in select e from jsonb_array_elements(p_items) as e loop
    begin
      v_pid := (v_item ->> 'product_id')::uuid;
      v_qty := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'keranjang_tidak_valid';
    end;

    if v_pid is null or v_qty is null or v_qty not between 1 and 10 or v_pid = any (v_ids) then
      raise exception 'keranjang_tidak_valid';
    end if;

    -- Harga dan berat dikunci supaya tidak berubah di tengah checkout.
    select * into v_product from public.products p where p.id = v_pid and p.is_active for share;
    if not found then
      raise exception 'produk_tidak_tersedia';
    end if;

    v_ids := v_ids || v_pid;
    v_qtys := v_qtys || v_qty;
    v_prices := v_prices || v_product.price;
    v_weights := v_weights || v_product.ship_weight_gram;
    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_weight := v_weight + v_product.ship_weight_gram * v_qty;
  end loop;

  if v_weight > v_batch.max_order_weight_gram then
    raise exception 'melebihi_berat_maksimal'
      using detail = json_build_object('maks_gram', v_batch.max_order_weight_gram)::text;
  end if;

  if (select count(*) from public.orders o
      where o.buyer_phone = p_buyer_phone and o.order_status = 'waiting_payment' and o.expires_at > now()) >= 2 then
    raise exception 'terlalu_banyak_pesanan_belum_dibayar';
  end if;

  if p_ip_hash is not null and (select count(*) from public.checkout_attempts c
      where c.ip_hash = p_ip_hash and c.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu_banyak_percobaan';
  end if;

  v_used := public._batch_used_gram(p_batch_id);
  if v_used + v_weight > v_batch.capacity_gram then
    raise exception 'kapasitas_penuh'
      using detail = json_build_object('sisa_gram', greatest(v_batch.capacity_gram - v_used, 0))::text;
  end if;

  v_expires := least(now() + interval '15 minutes', v_batch.close_order_at);
  v_invoice := 'SKL-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD') || '-'
               || lpad(nextval('public.order_invoice_seq')::text, 4, '0');

  begin
    insert into public.orders (
      invoice_number, batch_id, buyer_name, buyer_phone, recipient_name, recipient_phone,
      area_id, address_text, address_note, lat, lng,
      subtotal, delivery_fee, total_amount, total_weight_gram, expires_at, consent_at
    ) values (
      v_invoice, p_batch_id, btrim(p_buyer_name), p_buyer_phone,
      nullif(btrim(coalesce(p_recipient_name, '')), ''), nullif(p_recipient_phone, ''),
      p_area_id, btrim(p_address_text), nullif(btrim(coalesce(p_address_note, '')), ''), p_lat, p_lng,
      v_subtotal, v_area.delivery_fee, v_subtotal + v_area.delivery_fee, v_weight, v_expires, now()
    )
    returning orders.id, orders.status_token into v_order_id, v_token;
  exception when check_violation then
    raise exception 'data_pembeli_tidak_valid' using detail = sqlerrm;
  end;

  insert into public.order_items (order_id, product_id, quantity, price_at_purchase, ship_weight_at_purchase_gram)
  select v_order_id, u.pid, u.qty, u.price, u.weight
  from unnest(v_ids, v_qtys, v_prices, v_weights) as u (pid, qty, price, weight);

  if p_ip_hash is not null then
    insert into public.checkout_attempts (ip_hash) values (p_ip_hash);
  end if;

  perform public._log_status(v_order_id, null, 'system', null, 'waiting_payment', 'pesanan dibuat');

  return query select v_order_id, v_invoice, v_token, v_subtotal + v_area.delivery_fee, v_expires;
end;
$$;

-- Dipanggil route webhook SETELAH signature_key Midtrans diverifikasi di server.
-- Server Key Midtrans tidak pernah masuk database.
create function public.apply_payment_notification(
  p_invoice_number text,
  p_transaction_id text,
  p_transaction_status text,
  p_gross_amount numeric,
  p_transaction_time timestamptz,
  p_raw_payload jsonb,
  p_fraud_status text default null,
  p_payment_type text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_payment_id uuid;
  v_paid boolean := p_transaction_status = 'settlement'
                    or (p_transaction_status = 'capture' and coalesce(p_fraud_status, 'accept') = 'accept');
  v_outcome text;
begin
  select * into v_order from public.orders o where o.invoice_number = p_invoice_number for update;

  insert into public.payments (order_id, invoice_number, transaction_id, transaction_status, fraud_status,
                               payment_type, gross_amount, transaction_time, raw_payload)
  values (v_order.id, p_invoice_number, p_transaction_id, p_transaction_status, p_fraud_status,
          p_payment_type, p_gross_amount, p_transaction_time, p_raw_payload)
  on conflict (transaction_id, transaction_status) do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    return 'duplikat';
  end if;

  if v_order.id is null then
    v_outcome := 'pesanan_tidak_ditemukan';
  elsif p_gross_amount <> v_order.total_amount then
    v_outcome := 'nominal_tidak_cocok';
  elsif v_paid then
    if v_order.order_status = 'waiting_payment' and p_transaction_time <= v_order.expires_at then
      update public.orders
      set order_status = 'processing_vacuum', payment_status = 'paid', paid_at = p_transaction_time
      where id = v_order.id;
      perform public._log_status(v_order.id, null, 'midtrans', 'waiting_payment', 'processing_vacuum',
                                 'lunas lewat ' || coalesce(p_payment_type, '-'));
      v_outcome := 'lunas';
    elsif v_order.payment_status in ('paid', 'refund_pending', 'refunded') then
      v_outcome := 'sudah_lunas';
    else
      -- Uang masuk untuk pesanan yang sudah batal atau sudah lewat batas waktu: wajib dikembalikan.
      update public.orders
      set order_status = 'cancelled', payment_status = 'refund_pending', paid_at = p_transaction_time,
          cancel_reason = coalesce(v_order.cancel_reason, 'paid_after_cancel')
      where id = v_order.id;
      insert into public.refunds (order_id, amount, reason)
      values (v_order.id, v_order.total_amount, 'paid_after_cancel')
      on conflict (order_id) do nothing;
      perform public._log_status(v_order.id, null, 'midtrans', v_order.order_status, 'cancelled',
                                 'dibayar setelah pesanan batal, perlu refund');
      v_outcome := 'perlu_refund';
    end if;
  elsif p_transaction_status in ('expire', 'cancel', 'deny', 'failure') then
    if v_order.order_status = 'waiting_payment' then
      update public.orders
      set order_status = 'cancelled',
          payment_status = case when p_transaction_status = 'expire' then 'expired' else 'failed' end,
          cancel_reason = case when p_transaction_status = 'expire' then 'expired' else 'payment_failed' end
      where id = v_order.id;
      perform public._log_status(v_order.id, null, 'midtrans', 'waiting_payment', 'cancelled', p_transaction_status);
      v_outcome := 'dibatalkan';
    else
      v_outcome := 'diabaikan';
    end if;
  else
    v_outcome := 'diabaikan';
  end if;

  update public.payments set outcome = v_outcome where id = v_payment_id;
  return v_outcome;
end;
$$;

revoke all on function public._grace_period() from public, anon, authenticated;
revoke all on function public._in_service_area(double precision, double precision) from public, anon, authenticated;
revoke all on function public._batch_used_gram(uuid) from public, anon, authenticated;
revoke all on function public._log_status(uuid, uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.get_open_batch() from public, anon, authenticated;
revoke all on function public.create_order(uuid, jsonb, uuid, text, text, text, double precision, double precision, boolean, text, text, text, text) from public, anon, authenticated;
revoke all on function public.apply_payment_notification(text, text, text, numeric, timestamptz, jsonb, text, text) from public, anon, authenticated;

grant execute on function public.get_open_batch() to anon, authenticated;
grant execute on function public.create_order(uuid, jsonb, uuid, text, text, text, double precision, double precision, boolean, text, text, text, text) to service_role;
grant execute on function public.apply_payment_notification(text, text, text, numeric, timestamptz, jsonb, text, text) to service_role;
