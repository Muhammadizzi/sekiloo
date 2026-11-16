-- Nama usaha berganti dari sekiloo ke Sealauk (17 Nov 2026). Belum ada pesanan, jadi aman.
-- Awalan invoice SKL- jadi SLK-. Definisi create_order diambil dari database supaya isi lainnya tidak tersentuh.
do $ganti$
declare
  v_lama text := pg_get_functiondef(
    'public.create_order(uuid, jsonb, uuid, text, text, text, double precision, double precision, boolean, text, text, text, text)'::regprocedure
  );
  v_baru text := replace(v_lama, '''SKL-''', '''SLK-''');
begin
  if v_baru = v_lama then
    raise exception 'awalan SKL- tidak ditemukan di create_order';
  end if;
  execute v_baru;
end;
$ganti$;

select cron.unschedule('sekiloo-tugas-berkala');
select cron.schedule('sealauk-tugas-berkala', '*/5 * * * *', $$select public.run_scheduled_jobs()$$);
