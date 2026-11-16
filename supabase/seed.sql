-- Data awal: produk dari katalog lama dan lima kecamatan Cikarang.
-- Semua nonaktif sampai berat, harga Cikarang, dan ongkir diisi admin produksi.
-- Aman dijalankan ulang: baris yang sudah ada tidak ditimpa.

insert into public.products (slug, name, category, unit_type, description, net_weight_gram, price, sort_order) values
  ('bandeng-asap',     'Bandeng Asap',     'ikan',   'ekor',        'Bandeng tanpa duri, diasap lembut, cocok untuk lauk keluarga.',                    null, 40000, 10),
  ('siro-asap',        'Siro Asap',        'ikan',   'ekor',        'Ikan siro asap, dijual utuh per ekor.',                                            null, null,  20),
  ('tanjan-asap',      'Tanjan Asap',      'ikan',   'ekor',        'Ikan tanjan asap, dijual utuh per ekor.',                                          null, null,  30),
  ('cucut-asap',       'Cucut Asap',       'ikan',   'pack_irisan', 'Ikan cucut asap, tekstur padat dan gurih.',                                        null, null,  40),
  ('larak-asap',       'Larak Asap',       'ikan',   'pack_irisan', 'Ikan larak asap, cocok untuk lauk sehari-hari.',                                   null, null,  50),
  ('peh-asap',         'Peh Asap',         'ikan',   'pack_irisan', 'Ikan peh asap, diasap tradisional tanpa pengawet.',                                null, null,  60),
  ('tongkol-asap',     'Tongkol Asap',     'ikan',   'pack_irisan', 'Ikan tongkol segar diasap tradisional dengan tempurung kelapa, tanpa pengawet.',   null, 30000, 70),
  ('jeroan-ikan-asap', 'Jeroan Ikan Asap', 'jeroan', 'bungkus',     'Jeroan ikan asap, favorit untuk tumisan.',                                         250,  null,  80),
  ('telur-ikan-asap',  'Telur Ikan Asap',  'telur',  'bungkus',     'Telur ikan asap, gurih dan padat.',                                                250,  null,  90),
  ('kepala-ikan-asap', 'Kepala Ikan Asap', 'kepala', 'bungkus',     'Kepala ikan asap, mantap untuk gulai dan sup.',                                    null, null,  100)
on conflict (slug) do nothing;

-- Titik tengah perkiraan, dipakai untuk posisi awal peta. Cek ulang di peta sebelum rilis.
insert into public.service_areas (name, center_lat, center_lng) values
  ('Cikarang Utara',   -6.2611, 107.1476),
  ('Cikarang Barat',   -6.2900, 107.0950),
  ('Cikarang Selatan', -6.3350, 107.1400),
  ('Cikarang Timur',   -6.2700, 107.2000),
  ('Cikarang Pusat',   -6.3600, 107.1700)
on conflict (name) do nothing;
