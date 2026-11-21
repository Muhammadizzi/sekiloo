-- Fase 1 langkah 4: tautan bayar Midtrans Snap dan Cek Pesanan.

-- Objek baru di skema public tidak lagi otomatis terbuka untuk anon dan authenticated.
-- Migrasi berikutnya wajib memberi grant secara eksplisit.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

alter table public.orders
  add column snap_token text,
  add column snap_redirect_url text check (snap_redirect_url is null or snap_redirect_url ~ '^https://');

-- Untuk batas percobaan Cek Pesanan per IP. Isinya hash, bukan alamat IP asli.
create table public.lookup_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index lookup_attempts_ip_waktu on public.lookup_attempts (ip_hash, created_at);
alter table public.lookup_attempts enable row level security;
revoke all on public.lookup_attempts from anon, authenticated;

-- Dipanggil server setelah transaksi Snap dibuat. Pesanan yang sudah lunas atau batal tidak diubah.
create function public.simpan_tautan_bayar(p_order_id uuid, p_snap_token text, p_redirect_url text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with diubah as (
    update public.orders
    set snap_token = p_snap_token, snap_redirect_url = p_redirect_url
    where id = p_order_id and order_status = 'waiting_payment'
    returning 1
  )
  select exists (select 1 from diubah);
$$;

-- Cek Pesanan: nomor invoice dan nomor WhatsApp pemesan harus cocok. Setiap percobaan dihitung, ketemu atau tidak.
create function public.cari_pesanan(p_invoice text, p_phone text, p_ip_hash text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  if (select count(*) from public.lookup_attempts a
      where a.ip_hash = p_ip_hash and a.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'terlalu_banyak_percobaan';
  end if;

  insert into public.lookup_attempts (ip_hash) values (p_ip_hash);

  select o.status_token into v_token
  from public.orders o
  where o.invoice_number = upper(btrim(p_invoice)) and o.buyer_phone = p_phone;

  return v_token;
end;
$$;

revoke all on function public.simpan_tautan_bayar(uuid, text, text) from public, anon, authenticated;
revoke all on function public.cari_pesanan(text, text, text) from public, anon, authenticated;
grant execute on function public.simpan_tautan_bayar(uuid, text, text) to service_role;
grant execute on function public.cari_pesanan(text, text, text) to service_role;

-- Tugas berkala ikut membersihkan percobaan Cek Pesanan yang lebih dari 1 hari.
do $ganti$
declare
  v_lama text := pg_get_functiondef('public.run_scheduled_jobs()'::regprocedure);
  v_cari text := 'delete from public.checkout_attempts where created_at < now() - interval ''1 day'';';
  v_baru text;
begin
  v_baru := replace(v_lama, v_cari,
    v_cari || E'\n  delete from public.lookup_attempts where created_at < now() - interval ''1 day'';');
  if v_baru = v_lama then
    raise exception 'baris pembersihan checkout_attempts tidak ditemukan di run_scheduled_jobs';
  end if;
  execute v_baru;
end;
$ganti$;
