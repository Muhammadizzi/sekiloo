-- Hapus skema 10 Agustus 2026 (model pickup, DP, akun pelanggan).
-- Diputuskan pemilik 17 Nov 2026: hapus total, diganti skema PRD v0.4.
drop table if exists public.payments cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.customers cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.articles cascade;
drop table if exists public.locations cascade;
drop table if exists public.products cascade;
drop function if exists public.cancel_expired_orders();
drop function if exists public.set_updated_at() cascade;
