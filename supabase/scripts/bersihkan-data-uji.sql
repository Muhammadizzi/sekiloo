-- Menghapus kloter uji beserta semua pesanannya, setelah uji ujung ke ujung di Midtrans sandbox (PRD Bagian 24, langkah 7).
-- Database uji dan produksi masih satu project, jadi data sandbox harus dibersihkan sebelum pembeli asli memesan.
--
-- Cara pakai: jalankan di SQL Editor dashboard Supabase (sebagai postgres), SETELAH semua refund uji selesai.
-- Yang dihapus hanya kloter yang namanya diawali "UJI" (huruf besar), mis. "UJI sandbox 1". Kloter lain tidak tersentuh.
-- File foto bukti antar dan bukti transfer uji dihapus manual dari menu Storage, karena Supabase tidak mengizinkan
-- penghapusan file lewat SQL.

do $bersihkan$
declare
  v_kloter uuid[];
  v_pesanan uuid[];
  v_invoice text[];
  v_jumlah integer;
begin
  select array_agg(id) into v_kloter from public.po_batches where name like 'UJI%';
  if v_kloter is null then
    raise notice 'Tidak ada kloter berawalan UJI. Tidak ada yang dihapus.';
    return;
  end if;
  if exists (select 1 from public.po_batches where id = any (v_kloter) and status in ('open', 'closed', 'in_transit', 'arrived_in_cikarang')) then
    raise exception 'Masih ada kloter UJI yang berjalan. Batalkan atau selesaikan dulu sebelum dibersihkan.';
  end if;

  select array_agg(id), array_agg(invoice_number) into v_pesanan, v_invoice
  from public.orders where batch_id = any (v_kloter);

  -- status_log sengaja tidak bisa diubah atau dihapus (Bagian 12). Pengecualian ini hanya selama blok ini berjalan.
  alter table public.status_log disable trigger status_log_append_only;

  delete from public.status_log where order_id = any (coalesce(v_pesanan, '{}')) or batch_id = any (v_kloter);
  delete from public.payments where order_id = any (coalesce(v_pesanan, '{}')) or invoice_number = any (coalesce(v_invoice, '{}'));
  delete from public.refunds where order_id = any (coalesce(v_pesanan, '{}'));
  delete from public.orders where id = any (coalesce(v_pesanan, '{}'));
  get diagnostics v_jumlah = row_count;
  delete from public.po_batches where id = any (v_kloter);

  alter table public.status_log enable trigger status_log_append_only;

  -- Kalau tidak ada pesanan lain, nomor invoice pembeli asli dimulai lagi dari 0001.
  if not exists (select 1 from public.orders) then
    perform setval('public.order_invoice_seq', 1, false);
  end if;

  raise notice 'Terhapus: % kloter UJI dan % pesanan.', array_length(v_kloter, 1), v_jumlah;
end;
$bersihkan$;
