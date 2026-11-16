-- Uji fungsional skema. Jalankan per blok di SQL Editor Supabase.
-- Tiap blok selalu diakhiri error berisi hasilnya, jadi semua perubahan dibatalkan dan tidak ada data uji yang tertinggal.
-- Jangan jalankan saat ada kloter yang sedang buka: blok uji membuat kloter sendiri. Nomor invoice akan melompat, itu wajar.


-- Blok 1: checkout dan notifikasi pembayaran
do $uji$
declare
  r text := '';
  v text;
  v_area uuid; v_area_off uuid; v_a uuid; v_b uuid; v_batch uuid;
  o1 record; o2 record; o3 record; v_cap record;
  v_n integer;
begin
  execute $f$
    create function pg_temp.cek(p_label text, p_actual text, p_expected text) returns text language sql as $$
      select case when p_actual is not distinct from p_expected
        then format(E'\nOK     %s', p_label)
        else format(E'\nGAGAL  %s: dapat %s, harusnya %s', p_label, coalesce(p_actual, 'null'), p_expected) end
    $$
  $f$;

  insert into public.service_areas (name, delivery_fee, center_lat, center_lng, is_active)
  values ('Uji Utara', 10000, -6.26, 107.15, true) returning id into v_area;
  insert into public.service_areas (name, center_lat, center_lng)
  values ('Uji Nonaktif', -6.30, 107.15) returning id into v_area_off;
  insert into public.products (slug, name, unit_type, net_weight_gram, ship_weight_gram, price, is_active)
  values ('uji-a', 'Uji A', 'ekor', 900, 1000, 50000, true) returning id into v_a;
  insert into public.products (slug, name, unit_type, net_weight_gram, ship_weight_gram, price, is_active)
  values ('uji-b', 'Uji B', 'bungkus', 200, 250, 20000, true) returning id into v_b;
  insert into public.po_batches (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram)
  values ('Kloter uji', now() + interval '1 day', (now() + interval '3 days')::date, 20000, 3000) returning id into v_batch;

  select * into o1 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 2)),
    v_area, 'Pembeli Satu', '6281200000001', 'Jl. Uji Nomor 1, Cikarang', -6.27, 107.15, true);
  select o.order_status || '/' || o.total_amount || '/' || o.total_weight_gram into v from public.orders o where o.id = o1.order_id;
  r := r || pg_temp.cek('1a checkout normal', v, 'waiting_payment/110000/2000');
  r := r || pg_temp.cek('1b panjang token status', length(o1.status_token)::text, '32');
  r := r || pg_temp.cek('1c batas bayar paling lama 15 menit', (o1.expires_at <= now() + interval '15 minutes')::text, 'true');

  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, false);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('2 tanpa persetujuan', v, 'persetujuan_wajib');
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Jakarta', -6.20, 106.82, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('3 titik peta di Jakarta', v, 'lokasi_di_luar_cikarang');
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area_off, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('4 wilayah nonaktif', v, 'wilayah_tidak_dilayani');
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 11)), v_area, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('5a jumlah 11', v, 'keranjang_tidak_valid');
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1), jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('5b produk dobel', v, 'keranjang_tidak_valid');
  begin perform public.create_order(v_batch, '[{"product_id": "bukan-uuid", "quantity": 1}]'::jsonb, v_area, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('5c id produk rusak', v, 'keranjang_tidak_valid');
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 4)), v_area, 'Pembeli', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('6 lebih dari 3 kg', v, 'melebihi_berat_maksimal');
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli', '081200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('7 nomor tidak berawalan 62', v, 'data_pembeli_tidak_valid');

  perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli Satu', '6281200000001', 'Jl. Uji Nomor 1, Cikarang', -6.27, 107.15, true);
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli Satu', '6281200000001', 'Jl. Uji Nomor 1, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('8 pesanan belum bayar ke-3 dari nomor sama', v, 'terlalu_banyak_pesanan_belum_dibayar');

  for i in 1..5 loop
    perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli IP', '62812000001' || i, 'Jl. Uji Nomor 9, Cikarang', -6.27, 107.15, true, p_ip_hash => 'hash-uji');
  end loop;
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli IP', '6281200000199', 'Jl. Uji Nomor 9, Cikarang', -6.27, 107.15, true, p_ip_hash => 'hash-uji');
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('9 checkout ke-6 dari IP sama dalam sejam', v, 'terlalu_banyak_percobaan');

  update public.po_batches set capacity_gram = public._batch_used_gram(v_batch) + 1000 where id = v_batch;
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 2)), v_area, 'Pembeli Dua', '6281200000020', 'Jl. Uji Nomor 20, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('10a pesan 2 kg saat sisa 1 kg', v, 'kapasitas_penuh');
  select * into v_cap from public.get_open_batch();
  r := r || pg_temp.cek('10b get_open_batch terpakai/sisa', v_cap.used_gram || '/' || v_cap.remaining_gram, '3500/1000');

  update public.po_batches set capacity_gram = 20000, close_order_at = now() + interval '10 minutes' where id = v_batch;
  begin perform public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli', '6281200000030', 'Jl. Uji Nomor 30, Cikarang', -6.27, 107.15, true);
    v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('11 checkout 10 menit sebelum PO tutup', v, 'kloter_tutup');
  update public.po_batches set close_order_at = now() + interval '1 day' where id = v_batch;

  r := r || pg_temp.cek('12a notifikasi lunas', public.apply_payment_notification(o1.invoice_number, 'trx-1', 'settlement', 110000, now(), '{}', null, 'qris'), 'lunas');
  select order_status || '/' || payment_status into v from public.orders where id = o1.order_id;
  r := r || pg_temp.cek('12b status setelah lunas', v, 'processing_vacuum/paid');
  r := r || pg_temp.cek('13 notifikasi yang sama dua kali', public.apply_payment_notification(o1.invoice_number, 'trx-1', 'settlement', 110000, now(), '{}'), 'duplikat');

  select * into o2 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 2)), v_area, 'Pembeli Tiga', '6281200000040', 'Jl. Uji Nomor 40, Cikarang', -6.27, 107.15, true);
  r := r || pg_temp.cek('14a nominal tidak cocok', public.apply_payment_notification(o2.invoice_number, 'trx-2', 'settlement', 1000, now(), '{}'), 'nominal_tidak_cocok');
  select order_status into v from public.orders where id = o2.order_id;
  r := r || pg_temp.cek('14b status tidak berubah', v, 'waiting_payment');
  r := r || pg_temp.cek('15 kedaluwarsa dari Midtrans', public.apply_payment_notification(o2.invoice_number, 'trx-2', 'expire', 50000, now(), '{}'), 'dibatalkan');
  r := r || pg_temp.cek('16a dibayar setelah batal', public.apply_payment_notification(o2.invoice_number, 'trx-2b', 'settlement', 50000, now(), '{}'), 'perlu_refund');
  select count(*) into v_n from public.refunds where order_id = o2.order_id and status = 'pending';
  r := r || pg_temp.cek('16b refund tercatat', v_n::text, '1');
  r := r || pg_temp.cek('17 invoice tidak dikenal', public.apply_payment_notification('SLK-000000-9999', 'trx-x', 'settlement', 1, now(), '{}'), 'pesanan_tidak_ditemukan');

  select * into o3 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Pembeli Empat', '6281200000050', 'Jl. Uji Nomor 50, Cikarang', -6.27, 107.15, true);
  r := r || pg_temp.cek('18a transaksi dibuat lewat batas bayar', public.apply_payment_notification(o3.invoice_number, 'trx-3', 'settlement', 30000, now() + interval '20 minutes', '{}'), 'perlu_refund');
  select cancel_reason into v from public.orders where id = o3.order_id;
  r := r || pg_temp.cek('18b alasan batal', v, 'paid_after_cancel');
  r := r || pg_temp.cek('19 pesanan batal tidak memakan kapasitas', public._batch_used_gram(v_batch)::text, '3500');

  raise exception 'HASIL BLOK 1 (% gagal):%', (length(r) - length(replace(r, 'GAGAL', ''))) / 5, r;
end;
$uji$;


-- Blok 2: alur admin dari berangkat sampai refund, plus hak akses
do $uji$
declare
  r text := '';
  v text;
  v_area uuid; v_a uuid; v_b uuid; v_batch uuid; v_refund uuid;
  v_prod uuid := gen_random_uuid(); v_ckr uuid := gen_random_uuid();
  o1 record; o2 record; o3 record; o4 record; o5 record;
  v_n integer;
begin
  execute $f$
    create function pg_temp.cek(p_label text, p_actual text, p_expected text) returns text language sql as $$
      select case when p_actual is not distinct from p_expected
        then format(E'\nOK     %s', p_label)
        else format(E'\nGAGAL  %s: dapat %s, harusnya %s', p_label, coalesce(p_actual, 'null'), p_expected) end
    $$
  $f$;

  insert into auth.users (id, aud, role, email) values
    (v_prod, 'authenticated', 'authenticated', 'uji-produksi@contoh.test'),
    (v_ckr, 'authenticated', 'authenticated', 'uji-cikarang@contoh.test');
  insert into public.admin_roles (user_id, role, name) values
    (v_prod, 'admin_produksi', 'Uji Produksi'), (v_ckr, 'admin_cikarang', 'Uji Cikarang');
  insert into public.service_areas (name, delivery_fee, center_lat, center_lng, is_active)
  values ('Uji Utara', 10000, -6.26, 107.15, true) returning id into v_area;
  insert into public.products (slug, name, unit_type, net_weight_gram, ship_weight_gram, price, is_active)
  values ('uji-a', 'Uji A', 'ekor', 900, 1000, 50000, true) returning id into v_a;
  insert into public.products (slug, name, unit_type, net_weight_gram, ship_weight_gram, price, is_active)
  values ('uji-b', 'Uji B', 'bungkus', 200, 250, 20000, true) returning id into v_b;
  insert into public.po_batches (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram, min_weight_gram, min_orders)
  values ('Kloter uji', now() + interval '1 day', (now() + interval '3 days')::date, 20000, 3000, 2000, 3) returning id into v_batch;

  select * into o1 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Satu', '6281200000001', 'Jl. Uji Nomor 1, Cikarang', -6.27, 107.15, true);
  select * into o2 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Dua', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
  select * into o3 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Tiga', '6281200000003', 'Jl. Uji Nomor 3, Cikarang', -6.27, 107.15, true);
  select * into o4 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 2)), v_area, 'Empat', '6281200000004', 'Jl. Uji Nomor 4, Cikarang', -6.27, 107.15, true);
  select * into o5 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_b, 'quantity', 1)), v_area, 'Lima', '6281200000005', 'Jl. Uji Nomor 5, Cikarang', -6.27, 107.15, true);
  perform public.apply_payment_notification(o1.invoice_number, 't1', 'settlement', o1.total_amount, now(), '{}');
  perform public.apply_payment_notification(o2.invoice_number, 't2', 'settlement', o2.total_amount, now(), '{}');
  perform public.apply_payment_notification(o3.invoice_number, 't3', 'settlement', o3.total_amount, now(), '{}');
  perform public.apply_payment_notification(o4.invoice_number, 't4', 'expire', o4.total_amount, now(), '{}');
  perform public.apply_payment_notification(o4.invoice_number, 't4b', 'settlement', o4.total_amount, now(), '{}');

  begin update public.po_batches set capacity_gram = 1000 where id = v_batch; v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('A1 kapasitas di bawah berat terpakai', v, 'kapasitas_di_bawah_berat_terpakai');
  begin update public.po_batches set close_order_at = now() - interval '1 hour' where id = v_batch; v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('A2 ubah jadwal tanpa alasan saat ada yang lunas', v, 'alasan_perubahan_jadwal_wajib');
  update public.po_batches set close_order_at = now() - interval '1 hour', change_reason = 'uji tutup lebih awal' where id = v_batch;

  perform public.run_scheduled_jobs();
  select status into v from public.po_batches where id = v_batch;
  r := r || pg_temp.cek('B1 kloter lolos minimum ditutup', v, 'closed');
  select order_status || '/' || cancel_reason into v from public.orders where id = o5.order_id;
  r := r || pg_temp.cek('B2 pesanan belum bayar ikut batal', v, 'cancelled/expired');
  begin update public.po_batches set capacity_gram = 30000 where id = v_batch; v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('B3 ubah kapasitas setelah tutup', v, 'kloter_sudah_tutup');

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_ckr, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.batch_depart(v_batch); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('C1 admin Cikarang memberangkatkan kloter', v, 'bukan_admin_yang_berwenang');
  perform set_config('request.jwt.claims', json_build_object('sub', v_prod, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  begin perform public.batch_depart(v_batch); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('C2 admin produksi tanpa 2FA', v, 'bukan_admin_yang_berwenang');
  perform set_config('request.jwt.claims', json_build_object('sub', v_prod, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin update public.po_batches set status = 'completed' where id = v_batch; v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('C3 ubah status kloter langsung', v, 'permission denied for table po_batches');
  begin perform 1 from public.orders limit 1; v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('C4 admin baca tabel orders langsung', v, 'permission denied for table orders');
  r := r || pg_temp.cek('C5 kloter berangkat', public.batch_depart(v_batch)::text, '3');

  perform set_config('request.jwt.claims', json_build_object('sub', v_ckr, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  r := r || pg_temp.cek('D1 kloter tiba di Cikarang', public.batch_arrive(v_batch)::text, '3');
  perform public.order_start_delivery(o1.order_id);
  perform public.order_complete(o1.order_id, 'delivery-proofs/uji.jpg');
  perform public.order_start_delivery(o2.order_id);
  perform public.order_delivery_failed(o2.order_id, 'tidak_di_tempat');
  perform public.order_start_delivery(o2.order_id);
  perform public.order_delivery_failed(o2.order_id, 'ditolak');
  begin perform public.order_start_delivery(o2.order_id); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('D2 antar ke-3 kali', v, 'pesanan_tidak_bisa_diantar');
  begin perform public.order_cancel(o3.order_id, 'damaged_in_transit'); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('D3 admin Cikarang batalkan karena rusak', v, 'pembatalan_tidak_diizinkan');
  perform public.order_cancel(o2.order_id, 'delivery_failed', 'dua kali gagal', false);

  perform set_config('request.jwt.claims', json_build_object('sub', v_prod, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.order_cancel(o3.order_id, 'damaged_in_transit', null, false); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('E1 batal karena rusak tanpa refund', v, 'refund_wajib');
  perform public.order_cancel(o3.order_id, 'damaged_in_transit', 'vakum bocor');
  reset role;
  select id into v_refund from public.refunds where order_id = o3.order_id;
  set local role authenticated;
  begin perform public.refund_complete(v_refund, ''); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('E2 refund tanpa bukti transfer', v, 'bukti_transfer_wajib');
  perform public.refund_complete(v_refund, 'refund-proofs/uji.jpg');
  begin perform public.batch_cancel(v_batch, 'uji'); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('E3 batalkan kloter yang sudah tiba', v, 'kloter_tidak_bisa_dibatalkan');
  reset role;
  perform set_config('request.jwt.claims', '', true);

  select string_agg(buyer_name || '=' || order_status || '/' || payment_status, ', ' order by buyer_name) into v
  from public.orders where batch_id = v_batch;
  r := r || pg_temp.cek('F1 status akhir pesanan', v,
    'Dua=cancelled/paid, Empat=cancelled/refund_pending, Lima=cancelled/expired, Satu=completed/paid, Tiga=cancelled/refunded');
  perform public.run_scheduled_jobs();
  select status into v from public.po_batches where id = v_batch;
  r := r || pg_temp.cek('F2 kloter selesai setelah semua pesanan beres', v, 'completed');

  begin update public.status_log set note = 'diubah' where id = (select max(id) from public.status_log); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('G1 ubah status_log', v, 'status_log tidak boleh diubah atau dihapus');
  begin delete from public.status_log where id = (select max(id) from public.status_log); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('G2 hapus status_log', v, 'status_log tidak boleh diubah atau dihapus');

  set local role anon;
  begin perform 1 from public.orders limit 1; v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('G3 publik baca orders', v, 'permission denied for table orders');
  begin perform public.create_order(v_batch, '[]', v_area, 'x', '6281200000009', 'Jl. Uji Nomor 9, Cikarang', -6.27, 107.15, true); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('G4 publik panggil create_order langsung', v, 'permission denied for function create_order');
  reset role;

  raise exception 'HASIL BLOK 2 (% gagal):%', (length(r) - length(replace(r, 'GAGAL', ''))) / 5, r;
end;
$uji$;


-- Blok 3: tugas berkala dan pembatalan kloter
do $uji$
declare
  r text := '';
  v text;
  v_area uuid; v_a uuid; v_batch uuid; v_prod uuid := gen_random_uuid();
  o1 record; o2 record;
  v_n integer;
begin
  execute $f$
    create function pg_temp.cek(p_label text, p_actual text, p_expected text) returns text language sql as $$
      select case when p_actual is not distinct from p_expected
        then format(E'\nOK     %s', p_label)
        else format(E'\nGAGAL  %s: dapat %s, harusnya %s', p_label, coalesce(p_actual, 'null'), p_expected) end
    $$
  $f$;

  insert into auth.users (id, aud, role, email) values (v_prod, 'authenticated', 'authenticated', 'uji-produksi@contoh.test');
  insert into public.admin_roles (user_id, role, name) values (v_prod, 'admin_produksi', 'Uji Produksi');
  insert into public.service_areas (name, delivery_fee, center_lat, center_lng, is_active)
  values ('Uji Utara', 10000, -6.26, 107.15, true) returning id into v_area;
  insert into public.products (slug, name, unit_type, net_weight_gram, ship_weight_gram, price, is_active)
  values ('uji-a', 'Uji A', 'ekor', 900, 1000, 50000, true) returning id into v_a;

  insert into public.po_batches (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram)
  values ('Kloter H', now() + interval '1 day', (now() + interval '3 days')::date, 20000, 3000) returning id into v_batch;
  select * into o1 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Satu', '6281200000001', 'Jl. Uji Nomor 1, Cikarang', -6.27, 107.15, true);
  select * into o2 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Dua', '6281200000002', 'Jl. Uji Nomor 2, Cikarang', -6.27, 107.15, true);
  update public.orders set expires_at = now() - interval '5 minutes' where id = o1.order_id;
  update public.orders set expires_at = now() - interval '11 minutes' where id = o2.order_id;
  perform public.run_scheduled_jobs();
  select string_agg(buyer_name || '=' || order_status, ', ' order by buyer_name) into v from public.orders where batch_id = v_batch;
  r := r || pg_temp.cek('H1 lewat 5 menit masih ditunggu, lewat 11 menit batal', v, 'Dua=cancelled, Satu=waiting_payment');
  r := r || pg_temp.cek('H2 notifikasi lunas masuk saat masa tenggang',
    public.apply_payment_notification(o1.invoice_number, 'th', 'settlement', o1.total_amount, now() - interval '6 minutes', '{}'), 'lunas');

  -- Satu pesanan lunas 1 kg, jauh di bawah minimum bawaan 3 kg dan 5 pesanan.
  update public.po_batches set close_order_at = now() - interval '1 hour', change_reason = 'uji di bawah minimum' where id = v_batch;
  perform public.run_scheduled_jobs();
  select status || '/' || cancel_reason into v from public.po_batches where id = v_batch;
  r := r || pg_temp.cek('I1 kloter di bawah minimum', v, 'cancelled/di bawah minimum');
  select order_status || '/' || payment_status || '/' || cancel_reason into v from public.orders where id = o1.order_id;
  r := r || pg_temp.cek('I2 pesanan lunas masuk refund', v, 'cancelled/refund_pending/batch_min_not_met');
  select count(*) into v_n from public.refunds where order_id = o1.order_id;
  r := r || pg_temp.cek('I3 baris refund dibuat', v_n::text, '1');

  insert into public.po_batches (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram)
  values ('Kloter J', now() + interval '1 day', (now() + interval '3 days')::date, 20000, 3000) returning id into v_batch;
  select * into o1 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Tiga', '6281200000003', 'Jl. Uji Nomor 3, Cikarang', -6.27, 107.15, true);
  select * into o2 from public.create_order(v_batch, jsonb_build_array(jsonb_build_object('product_id', v_a, 'quantity', 1)), v_area, 'Empat', '6281200000004', 'Jl. Uji Nomor 4, Cikarang', -6.27, 107.15, true);
  perform public.apply_payment_notification(o1.invoice_number, 'tj', 'settlement', o1.total_amount, now(), '{}');
  begin
    insert into public.po_batches (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram)
    values ('Kloter dobel', now() + interval '2 days', (now() + interval '4 days')::date, 20000, 3000);
    v := 'diterima';
  exception when others then v := sqlstate; end;
  r := r || pg_temp.cek('J1 dua kloter buka sekaligus', v, '23505');

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_prod, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.batch_cancel(v_batch, '  '); v := 'diterima'; exception when others then v := sqlerrm; end;
  r := r || pg_temp.cek('J2 batalkan kloter tanpa alasan', v, 'alasan_wajib');
  r := r || pg_temp.cek('J3 batalkan kloter buka', public.batch_cancel(v_batch, 'cuaca buruk, kapal tidak melaut')::text, '1');
  reset role;
  perform set_config('request.jwt.claims', '', true);
  select string_agg(buyer_name || '=' || order_status || '/' || payment_status, ', ' order by buyer_name) into v from public.orders where batch_id = v_batch;
  r := r || pg_temp.cek('J4 status pesanan setelah kloter batal', v, 'Empat=cancelled/expired, Tiga=cancelled/refund_pending');

  raise exception 'HASIL BLOK 3 (% gagal):%', (length(r) - length(replace(r, 'GAGAL', ''))) / 5, r;
end;
$uji$;
