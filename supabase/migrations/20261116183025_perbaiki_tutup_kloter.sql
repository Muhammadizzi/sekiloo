-- Kalau jam tutup dimajukan admin, pesanan yang belum dibayar bisa punya expires_at setelah jam tutup baru.
-- Pesanan itu dibatalkan saat kloter ditutup, supaya tidak ada yang tertinggal menunggu bayar.
create or replace function public.run_scheduled_jobs()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_batch public.po_batches%rowtype;
  v_weight integer;
  v_count integer;
begin
  -- Pesanan tidak dibayar. Masa tenggang memberi waktu notifikasi Midtrans yang terlambat untuk masuk dulu.
  with expired as (
    update public.orders
    set order_status = 'cancelled', payment_status = 'expired', cancel_reason = 'expired'
    where order_status = 'waiting_payment' and expires_at < now() - public._grace_period()
    returning id
  )
  insert into public.status_log (order_id, actor_type, from_status, to_status, note)
  select id, 'system', 'waiting_payment', 'cancelled', 'tidak dibayar sampai batas waktu' from expired;

  -- Kloter lewat jam tutup: lanjut produksi kalau lolos minimum, batal dan refund kalau tidak.
  for v_batch in
    select * from public.po_batches b
    where b.status = 'open' and b.close_order_at < now() - public._grace_period()
    for update
  loop
    with leftover as (
      update public.orders
      set order_status = 'cancelled', payment_status = 'expired', cancel_reason = 'expired'
      where batch_id = v_batch.id and order_status = 'waiting_payment'
      returning id
    )
    insert into public.status_log (order_id, actor_type, from_status, to_status, note)
    select id, 'system', 'waiting_payment', 'cancelled', 'kloter ditutup sebelum pesanan dibayar' from leftover;

    select coalesce(sum(o.total_weight_gram), 0), count(*)
    into v_weight, v_count
    from public.orders o
    where o.batch_id = v_batch.id and o.order_status = 'processing_vacuum';

    if v_weight < v_batch.min_weight_gram or v_count < v_batch.min_orders then
      update public.po_batches set status = 'cancelled', cancel_reason = 'di bawah minimum' where id = v_batch.id;
      perform public._log_status(null, v_batch.id, 'system', 'open', 'cancelled',
                                 format('di bawah minimum: %s gram, %s pesanan', v_weight, v_count));
      perform public._cancel_batch_orders(v_batch.id, 'batch_min_not_met', 'system');
    else
      update public.po_batches set status = 'closed' where id = v_batch.id;
      perform public._log_status(null, v_batch.id, 'system', 'open', 'closed',
                                 format('lolos minimum: %s gram, %s pesanan', v_weight, v_count));
    end if;
  end loop;

  with done as (
    update public.po_batches b set status = 'completed'
    where b.status = 'arrived_in_cikarang'
      and not exists (
        select 1 from public.orders o
        where o.batch_id = b.id and o.order_status not in ('completed', 'cancelled')
      )
    returning b.id
  )
  insert into public.status_log (batch_id, actor_type, from_status, to_status)
  select id, 'system', 'arrived_in_cikarang', 'completed' from done;

  delete from public.checkout_attempts where created_at < now() - interval '1 day';
end;
$$;

revoke all on function public.run_scheduled_jobs() from public, anon, authenticated;
