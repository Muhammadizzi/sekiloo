-- Hak akses (PRD Bagian 14). Pembeli tanpa akun hanya membaca katalog lewat anon key.
-- Data pesanan tertutup untuk anon dan authenticated; ditulis lewat fungsi database.

alter table public.admin_roles enable row level security;
alter table public.products enable row level security;
alter table public.service_areas enable row level security;
alter table public.po_batches enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.status_log enable row level security;
alter table public.checkout_attempts enable row level security;

-- Supabase memberi anon dan authenticated hak penuh secara bawaan. Dicabut, lalu diberi seperlunya.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant select on public.products, public.service_areas to anon, authenticated;
grant insert, update on public.products, public.service_areas to authenticated;
grant select on public.admin_roles, public.po_batches to authenticated;
-- Status kloter hanya diubah lewat fungsi, jadi kolom status tidak ikut diberikan.
grant insert (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram, min_weight_gram, min_orders, change_reason)
  on public.po_batches to authenticated;
grant update (name, close_order_at, delivery_date, capacity_gram, max_order_weight_gram, min_weight_gram, min_orders, change_reason)
  on public.po_batches to authenticated;

-- Peran admin hanya berlaku pada sesi yang sudah lolos 2FA (aal2).
create function public.admin_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select r.role
  from public.admin_roles r
  where r.user_id = (select auth.uid())
    and coalesce((select auth.jwt()) ->> 'aal', 'aal1') = 'aal2';
$$;

revoke all on function public.admin_role() from public, anon, authenticated;
grant execute on function public.admin_role() to authenticated;

create policy "admin melihat perannya sendiri" on public.admin_roles
  for select to authenticated using (user_id = (select auth.uid()));

create policy "publik melihat produk aktif" on public.products
  for select to anon using (is_active);
create policy "pengguna melihat produk aktif, admin melihat semua" on public.products
  for select to authenticated using (is_active or (select public.admin_role()) is not null);
create policy "admin produksi menambah produk" on public.products
  for insert to authenticated with check ((select public.admin_role()) = 'admin_produksi');
create policy "admin produksi mengubah produk" on public.products
  for update to authenticated
  using ((select public.admin_role()) = 'admin_produksi')
  with check ((select public.admin_role()) = 'admin_produksi');

create policy "publik melihat wilayah aktif" on public.service_areas
  for select to anon using (is_active);
create policy "pengguna melihat wilayah aktif, admin melihat semua" on public.service_areas
  for select to authenticated using (is_active or (select public.admin_role()) is not null);
create policy "admin produksi menambah wilayah" on public.service_areas
  for insert to authenticated with check ((select public.admin_role()) = 'admin_produksi');
create policy "admin produksi mengubah wilayah" on public.service_areas
  for update to authenticated
  using ((select public.admin_role()) = 'admin_produksi')
  with check ((select public.admin_role()) = 'admin_produksi');

create policy "admin melihat kloter" on public.po_batches
  for select to authenticated using ((select public.admin_role()) is not null);
create policy "admin produksi membuat kloter" on public.po_batches
  for insert to authenticated with check ((select public.admin_role()) = 'admin_produksi');
create policy "admin produksi mengubah kloter" on public.po_batches
  for update to authenticated
  using ((select public.admin_role()) = 'admin_produksi')
  with check ((select public.admin_role()) = 'admin_produksi');

-- orders, order_items, payments, refunds, status_log, checkout_attempts:
-- RLS aktif tanpa policy, jadi anon dan authenticated tidak bisa membaca maupun menulis.
-- Server web memakai service role. Admin membaca lewat fungsi khusus per peran (langkah APK).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('delivery-proofs', 'delivery-proofs', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('refund-proofs', 'refund-proofs', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Foto bukti antar memperlihatkan rumah pembeli dan bukti refund berisi data bank, jadi keduanya privat.
create policy "admin mengunggah file sesuai perannya" on storage.objects
  for insert to authenticated
  with check (
    (bucket_id = 'product-images' and (select public.admin_role()) = 'admin_produksi')
    or (bucket_id = 'delivery-proofs' and (select public.admin_role()) = 'admin_cikarang')
    or (bucket_id = 'refund-proofs' and (select public.admin_role()) = 'admin_produksi')
  );

create policy "admin melihat file privat sesuai perannya" on storage.objects
  for select to authenticated
  using (
    (bucket_id = 'product-images' and (select public.admin_role()) = 'admin_produksi')
    or (bucket_id = 'delivery-proofs' and (select public.admin_role()) = 'admin_cikarang')
    or (bucket_id = 'refund-proofs' and (select public.admin_role()) = 'admin_produksi')
  );

create policy "admin produksi mengganti foto produk" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.admin_role()) = 'admin_produksi')
  with check (bucket_id = 'product-images' and (select public.admin_role()) = 'admin_produksi');
