-- Perubahan status oleh admin (PRD Bagian 9). Aplikasi tidak pernah mengubah kolom status secara langsung.

create function public._require_admin(p_roles text[])
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_role();
begin
  if v_role is null or not (v_role = any (p_roles)) then
    raise exception 'bukan_admin_yang_berwenang';
  end if;
  return v_role;
end;
$$;

-- Pesanan lunas dibatalkan dan masuk daftar refund; pesanan yang belum dibayar ikut dibatalkan.
create function public._cancel_batch_orders(p_batch_id uuid, p_reason text, p_actor text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := case when p_actor = 'admin' then (select auth.uid()) end;
  v_count integer;
begin
  with paid as (
    update public.orders
    set order_status = 'cancelled', payment_status = 'refund_pending', cancel_reason = p_reason
    where batch_id = p_batch_id and order_status = 'processing_vacuum'
    returning id, total_amount
  ), new_refunds as (
    insert into public.refunds (order_id, amount, reason)
    select id, total_amount, p_reason from paid
    on conflict (order_id) do nothing
  ), logged as (
    insert into public.status_log (order_id, actor_type, actor_id, from_status, to_status, note)
    select id, p_actor, v_actor_id, 'processing_vacuum', 'cancelled', p_reason || ', perlu refund' from paid
    returning 1
  )
  select count(*) into v_count from logged;

  with unpaid as (
    update public.orders
    set order_status = 'cancelled', payment_status = 'expired', cancel_reason = p_reason
    where batch_id = p_batch_id and order_status = 'waiting_payment'
    returning id
  )
  insert into public.status_log (order_id, actor_type, actor_id, from_status, to_status, note)
  select id, p_actor, v_actor_id, 'waiting_payment', 'cancelled', p_reason from unpaid;

  return v_count;
end;
$$;

create function public.batch_depart(p_batch_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform public._require_admin(array['admin_produksi']);

  update public.po_batches set status = 'in_transit' where id = p_batch_id and status = 'closed';
  if not found then
    raise exception 'kloter_belum_siap_berangkat';
  end if;
  perform public._log_status(null, p_batch_id, 'admin', 'closed', 'in_transit');

  with changed as (
    update public.orders set order_status = 'shipped_to_cikarang', shipped_at = now()
    where batch_id = p_batch_id and order_status = 'processing_vacuum'
    returning id
  ), logged as (
    insert into public.status_log (order_id, actor_type, actor_id, from_status, to_status)
    select id, 'admin', (select auth.uid()), 'processing_vacuum', 'shipped_to_cikarang' from changed
    returning 1
  )
  select count(*) into v_count from logged;
  return v_count;
end;
$$;

create function public.batch_arrive(p_batch_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform public._require_admin(array['admin_cikarang']);

  update public.po_batches set status = 'arrived_in_cikarang' where id = p_batch_id and status = 'in_transit';
  if not found then
    raise exception 'kloter_belum_berangkat';
  end if;
  perform public._log_status(null, p_batch_id, 'admin', 'in_transit', 'arrived_in_cikarang');

  with changed as (
    update public.orders set order_status = 'arrived_in_cikarang', arrived_at = now()
    where batch_id = p_batch_id and order_status = 'shipped_to_cikarang'
    returning id
  ), logged as (
    insert into public.status_log (order_id, actor_type, actor_id, from_status, to_status)
    select id, 'admin', (select auth.uid()), 'shipped_to_cikarang', 'arrived_in_cikarang' from changed
    returning 1
  )
  select count(*) into v_count from logged;
  return v_count;
end;
$$;

create function public.batch_cancel(p_batch_id uuid, p_note text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old text;
begin
  perform public._require_admin(array['admin_produksi']);
  if coalesce(btrim(p_note), '') = '' then
    raise exception 'alasan_wajib';
  end if;

  select status into v_old from public.po_batches where id = p_batch_id for update;
  if v_old is null or v_old not in ('open', 'closed') then
    raise exception 'kloter_tidak_bisa_dibatalkan';
  end if;

  update public.po_batches set status = 'cancelled', cancel_reason = p_note where id = p_batch_id;
  perform public._log_status(null, p_batch_id, 'admin', v_old, 'cancelled', p_note);
  return public._cancel_batch_orders(p_batch_id, 'batch_cancelled', 'admin');
end;
$$;

-- Antar ulang maksimal satu kali: percobaan pertama dari arrived_in_cikarang, kedua dari delivery_failed.
create function public.order_start_delivery(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  perform public._require_admin(array['admin_cikarang']);

  select * into v_order from public.orders where id = p_order_id for update;
  if not found or not (
    (v_order.order_status = 'arrived_in_cikarang' and v_order.delivery_attempts = 0)
    or (v_order.order_status = 'delivery_failed' and v_order.delivery_attempts = 1)
  ) then
    raise exception 'pesanan_tidak_bisa_diantar';
  end if;

  update public.orders
  set order_status = 'out_for_delivery', delivery_attempts = delivery_attempts + 1
  where id = p_order_id;
  perform public._log_status(p_order_id, null, 'admin', v_order.order_status, 'out_for_delivery',
                             'percobaan antar ke-' || (v_order.delivery_attempts + 1));
end;
$$;

create function public.order_complete(p_order_id uuid, p_proof_path text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_cikarang']);

  update public.orders
  set order_status = 'completed', delivered_at = now(), proof_photo_path = p_proof_path
  where id = p_order_id and order_status = 'out_for_delivery';
  if not found then
    raise exception 'pesanan_belum_diantar';
  end if;
  perform public._log_status(p_order_id, null, 'admin', 'out_for_delivery', 'completed');
end;
$$;

create function public.order_delivery_failed(p_order_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public._require_admin(array['admin_cikarang']);
  if p_reason is null or p_reason not in ('tidak_di_tempat', 'tidak_bisa_dihubungi', 'alamat_tidak_ditemukan', 'ditolak') then
    raise exception 'alasan_gagal_antar_tidak_valid';
  end if;

  update public.orders set order_status = 'delivery_failed'
  where id = p_order_id and order_status = 'out_for_delivery';
  if not found then
    raise exception 'pesanan_belum_diantar';
  end if;
  perform public._log_status(p_order_id, null, 'admin', 'out_for_delivery', 'delivery_failed', p_reason);
end;
$$;

-- Tanpa refund hanya boleh untuk gagal antar, dan hanya kalau kebijakan pemilik menetapkannya (PRD Bagian 23 no. 9).
create function public.order_cancel(p_order_id uuid, p_reason text, p_note text default null, p_refund boolean default true)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := public._require_admin(array['admin_produksi', 'admin_cikarang']);
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'pesanan_tidak_ditemukan';
  end if;

  if not (
    (v_role = 'admin_produksi' and p_reason in ('production_failed', 'damaged_in_transit', 'admin')
     and v_order.order_status in ('processing_vacuum', 'shipped_to_cikarang', 'arrived_in_cikarang', 'delivery_failed'))
    or (v_role = 'admin_cikarang' and p_reason = 'delivery_failed' and v_order.order_status = 'delivery_failed')
  ) then
    raise exception 'pembatalan_tidak_diizinkan';
  end if;

  if not p_refund and p_reason <> 'delivery_failed' then
    raise exception 'refund_wajib';
  end if;

  update public.orders
  set order_status = 'cancelled', cancel_reason = p_reason, cancel_note = p_note,
      payment_status = case when p_refund then 'refund_pending' else 'paid' end
  where id = p_order_id;

  if p_refund then
    insert into public.refunds (order_id, amount, reason)
    values (p_order_id, v_order.total_amount, p_reason)
    on conflict (order_id) do nothing;
  end if;

  perform public._log_status(p_order_id, null, 'admin', v_order.order_status, 'cancelled',
                             p_reason || case when p_refund then ', perlu refund' else ', tanpa refund' end
                             || coalesce(': ' || p_note, ''));
end;
$$;

create function public.refund_complete(p_refund_id uuid, p_proof_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
begin
  perform public._require_admin(array['admin_produksi']);
  if coalesce(btrim(p_proof_path), '') = '' then
    raise exception 'bukti_transfer_wajib';
  end if;

  update public.refunds
  set status = 'done', proof_path = p_proof_path, processed_by = (select auth.uid()), processed_at = now()
  where id = p_refund_id and status = 'pending'
  returning order_id into v_order_id;
  if v_order_id is null then
    raise exception 'refund_tidak_ditemukan';
  end if;

  update public.orders set payment_status = 'refunded'
  where id = v_order_id and payment_status = 'refund_pending';
  perform public._log_status(v_order_id, null, 'admin', 'refund_pending', 'refunded');
end;
$$;

-- Pengaman tulis tabel kloter (PRD Bagian 8.5).
create function public._guard_batch_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_has_paid boolean;
begin
  if tg_op = 'INSERT' then
    new.status := 'open';
    new.cancel_reason := null;
    new.created_by := (select auth.uid());
    return new;
  end if;

  if new.capacity_gram < public._batch_used_gram(new.id) then
    raise exception 'kapasitas_di_bawah_berat_terpakai';
  end if;

  if old.status <> 'open' and (new.close_order_at, new.capacity_gram, new.max_order_weight_gram)
       is distinct from (old.close_order_at, old.capacity_gram, old.max_order_weight_gram) then
    raise exception 'kloter_sudah_tutup';
  end if;

  if (new.close_order_at, new.delivery_date) is distinct from (old.close_order_at, old.delivery_date) then
    select exists (
      select 1 from public.orders o
      where o.batch_id = new.id and o.payment_status = 'paid' and o.order_status <> 'cancelled'
    ) into v_has_paid;

    if v_has_paid then
      if coalesce(btrim(new.change_reason), '') = '' or new.change_reason is not distinct from old.change_reason then
        raise exception 'alasan_perubahan_jadwal_wajib';
      end if;
      insert into public.status_log (batch_id, actor_type, actor_id, from_status, to_status, note)
      values (new.id, case when (select auth.uid()) is null then 'system' else 'admin' end, (select auth.uid()),
              old.status, new.status, 'jadwal diubah: ' || new.change_reason);
    end if;
  end if;

  return new;
end;
$$;

create trigger po_batches_guard
  before insert or update on public.po_batches
  for each row execute function public._guard_batch_write();

revoke all on function public._require_admin(text[]) from public, anon, authenticated;
revoke all on function public._cancel_batch_orders(uuid, text, text) from public, anon, authenticated;
revoke all on function public._guard_batch_write() from public, anon, authenticated;
revoke all on function public.batch_depart(uuid) from public, anon;
revoke all on function public.batch_arrive(uuid) from public, anon;
revoke all on function public.batch_cancel(uuid, text) from public, anon;
revoke all on function public.order_start_delivery(uuid) from public, anon;
revoke all on function public.order_complete(uuid, text) from public, anon;
revoke all on function public.order_delivery_failed(uuid, text) from public, anon;
revoke all on function public.order_cancel(uuid, text, text, boolean) from public, anon;
revoke all on function public.refund_complete(uuid, text) from public, anon;

grant execute on function public.batch_depart(uuid) to authenticated;
grant execute on function public.batch_arrive(uuid) to authenticated;
grant execute on function public.batch_cancel(uuid, text) to authenticated;
grant execute on function public.order_start_delivery(uuid) to authenticated;
grant execute on function public.order_complete(uuid, text) to authenticated;
grant execute on function public.order_delivery_failed(uuid, text) to authenticated;
grant execute on function public.order_cancel(uuid, text, text, boolean) to authenticated;
grant execute on function public.refund_complete(uuid, text) to authenticated;
