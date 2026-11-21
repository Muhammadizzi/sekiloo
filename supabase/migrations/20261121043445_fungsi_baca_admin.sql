-- Fungsi baca untuk APK admin (Fase 1 langkah 5). Pesanan tertutup RLS, jadi admin membacanya lewat fungsi ini.
-- Setiap fungsi hanya mengembalikan kolom yang boleh dilihat perannya (PRD Bagian 16).

create function public.admin_daftar_kloter()
returns table (
  id uuid, name text, status text, close_order_at timestamptz, delivery_date date,
  capacity_gram integer, max_order_weight_gram integer, min_weight_gram integer, min_orders integer,
  cancel_reason text, used_gram integer, lunas_jumlah integer, lunas_berat_gram integer, menunggu_bayar integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_produksi', 'admin_cikarang']);
  return query
  select b.id, b.name, b.status, b.close_order_at, b.delivery_date,
         b.capacity_gram, b.max_order_weight_gram, b.min_weight_gram, b.min_orders,
         b.cancel_reason, public._batch_used_gram(b.id),
         (count(o.id) filter (where o.payment_status = 'paid' and o.order_status <> 'cancelled'))::integer,
         (coalesce(sum(o.total_weight_gram) filter (where o.payment_status = 'paid' and o.order_status <> 'cancelled'), 0))::integer,
         (count(o.id) filter (where o.order_status = 'waiting_payment'))::integer
  from public.po_batches b
  left join public.orders o on o.batch_id = b.id
  group by b.id
  order by b.close_order_at desc;
end;
$$;

-- Total per produk dari pesanan lunas, untuk diasap dan divakum. Tanpa data pembeli.
create function public.admin_rekap_produksi(p_batch_id uuid)
returns table (product_id uuid, nama text, satuan text, jumlah integer, berat_gram integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_produksi']);
  return query
  select p.id, p.name, p.unit_type, sum(i.quantity)::integer, sum(i.quantity * i.ship_weight_at_purchase_gram)::integer
  from public.orders o
  join public.order_items i on i.order_id = o.id
  join public.products p on p.id = i.product_id
  where o.batch_id = p_batch_id and o.payment_status = 'paid' and o.order_status <> 'cancelled'
  group by p.id, p.name, p.unit_type, p.sort_order
  order by p.sort_order, p.name;
end;
$$;

-- Untuk label kemasan, pembatalan, dan refund. Nomor yang dipakai nomor pemesan (PRD 10.3). Tanpa alamat.
create function public.admin_pesanan_kloter(p_batch_id uuid)
returns table (
  id uuid, invoice_number text, order_status text, payment_status text, cancel_reason text,
  nama_pemesan text, nama_penerima text, nomor_wa text, total_amount integer, total_weight_gram integer,
  item jsonb, status_token text, created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_produksi']);
  return query
  select o.id, o.invoice_number, o.order_status, o.payment_status, o.cancel_reason,
         o.buyer_name, coalesce(o.recipient_name, o.buyer_name), o.buyer_phone, o.total_amount, o.total_weight_gram,
         (select jsonb_agg(jsonb_build_object('nama', p.name, 'satuan', p.unit_type, 'jumlah', i.quantity) order by p.sort_order, p.name)
          from public.order_items i join public.products p on p.id = i.product_id where i.order_id = o.id),
         o.status_token, o.created_at
  from public.orders o
  where o.batch_id = p_batch_id
  order by o.created_at;
end;
$$;

-- Alamat dan koordinat hanya untuk admin Cikarang, dan hanya setelah kloternya tiba (PRD Bagian 16).
create function public.admin_daftar_antar(p_batch_id uuid)
returns table (
  id uuid, invoice_number text, order_status text, kecamatan text, nama_penerima text, nomor_wa text,
  alamat text, patokan text, lat double precision, lng double precision, delivery_attempts integer,
  catatan_gagal text, item jsonb, status_token text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_cikarang']);
  if not exists (select 1 from public.po_batches b
                 where b.id = p_batch_id and b.status in ('arrived_in_cikarang', 'completed')) then
    raise exception 'kloter_belum_tiba';
  end if;

  return query
  select o.id, o.invoice_number, o.order_status, a.name,
         coalesce(o.recipient_name, o.buyer_name), coalesce(o.recipient_phone, o.buyer_phone),
         o.address_text, o.address_note, o.lat, o.lng, o.delivery_attempts,
         (select l.note from public.status_log l
          where l.order_id = o.id and l.to_status = 'delivery_failed' order by l.id desc limit 1),
         (select jsonb_agg(jsonb_build_object('nama', p.name, 'satuan', p.unit_type, 'jumlah', i.quantity) order by p.sort_order, p.name)
          from public.order_items i join public.products p on p.id = i.product_id where i.order_id = o.id),
         o.status_token
  from public.orders o
  join public.service_areas a on a.id = o.area_id
  where o.batch_id = p_batch_id
    and o.order_status in ('arrived_in_cikarang', 'out_for_delivery', 'delivery_failed', 'completed')
  order by a.sort_order, a.name, o.invoice_number;
end;
$$;

create function public.admin_daftar_refund()
returns table (
  id uuid, order_id uuid, invoice_number text, nama_pemesan text, nomor_wa text, amount integer,
  reason text, status text, proof_path text, created_at timestamptz, processed_at timestamptz, status_token text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_produksi']);
  return query
  select r.id, r.order_id, o.invoice_number, o.buyer_name, o.buyer_phone, r.amount,
         r.reason, r.status, r.proof_path, r.created_at, r.processed_at, o.status_token
  from public.refunds r
  join public.orders o on o.id = r.order_id
  order by (r.status = 'pending') desc, r.created_at desc;
end;
$$;

revoke all on function public.admin_daftar_kloter() from public, anon;
revoke all on function public.admin_rekap_produksi(uuid) from public, anon;
revoke all on function public.admin_pesanan_kloter(uuid) from public, anon;
revoke all on function public.admin_daftar_antar(uuid) from public, anon;
revoke all on function public.admin_daftar_refund() from public, anon;
-- Pemeriksaan peran dan sesi 2FA ada di dalam setiap fungsi (_require_admin).
grant execute on function public.admin_daftar_kloter() to authenticated;
grant execute on function public.admin_rekap_produksi(uuid) to authenticated;
grant execute on function public.admin_pesanan_kloter(uuid) to authenticated;
grant execute on function public.admin_daftar_antar(uuid) to authenticated;
grant execute on function public.admin_daftar_refund() to authenticated;

