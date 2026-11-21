import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Isian } from "@/components/Isian";
import { Bagian, Catatan } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Saklar } from "@/components/Saklar";
import { Tombol } from "@/components/Tombol";
import { bacaAngka } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { BarisWilayah } from "@/lib/jenis";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { segarkanWeb } from "@/lib/web";

type Kolom = "nama" | "ongkir" | "lat" | "lng" | "urutan";

// Kotak perkiraan wilayah Cikarang yang sama dengan pemeriksaan pin di checkout (PRD 23 nomor 8).
const BATAS = { latMin: -6.43, latMaks: -6.2, lngMin: 107.03, lngMaks: 107.28 };

// Koordinat memakai titik atau koma sebagai desimal, mis. -6,27 atau -6.27.
function bacaKoordinat(teks: string): number | null {
  const normal = teks.trim().replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(normal) ? Number(normal) : null;
}

export default function UbahWilayah() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const baru = id === "baru";
  const { keadaan, ulangi } = useMuat(
    async () => (baru ? null : wajib(await supabase.from("service_areas").select("*").eq("id", id).maybeSingle())),
  );

  return (
    <Layar>
      <Stack.Screen options={{ title: baru ? "Kecamatan baru" : "Ubah kecamatan" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(w) => (!baru && !w ? <Kosong judul="Kecamatan tidak ditemukan" /> : <FormWilayah wilayah={w} />)}
      </IsiKeadaan>
    </Layar>
  );
}

function FormWilayah({ wilayah }: { wilayah: BarisWilayah | null }) {
  const [nama, setNama] = useState(wilayah?.name ?? "");
  const [ongkir, setOngkir] = useState(wilayah?.delivery_fee != null ? String(wilayah.delivery_fee) : "");
  const [lat, setLat] = useState(wilayah ? String(wilayah.center_lat) : "");
  const [lng, setLng] = useState(wilayah ? String(wilayah.center_lng) : "");
  const [urutan, setUrutan] = useState(String(wilayah?.sort_order ?? 0));
  const [aktif, setAktif] = useState(wilayah?.is_active ?? false);
  const [galat, setGalat] = useState<Partial<Record<Kolom, string>>>({});
  const [galatUmum, setGalatUmum] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  function isi(ubah: (t: string) => void, k: Kolom) {
    return (t: string) => {
      ubah(t);
      setGalat((lama) => {
        const baru = { ...lama };
        delete baru[k];
        return baru;
      });
    };
  }

  async function simpan() {
    const g: Partial<Record<Kolom, string>> = {};
    const nilaiOngkir = bacaAngka(ongkir);
    const nilaiLat = bacaKoordinat(lat);
    const nilaiLng = bacaKoordinat(lng);
    const nilaiUrutan = bacaAngka(urutan);

    if (nama.trim().length < 2 || nama.trim().length > 80) g.nama = "Nama kecamatan 2 sampai 80 huruf.";
    if (ongkir.trim() && nilaiOngkir === null) g.ongkir = "Ongkir berupa angka rupiah, mis. 10000. Boleh 0.";
    if (aktif && nilaiOngkir === null) g.ongkir = "Kecamatan aktif wajib punya ongkir.";
    if (nilaiLat === null || nilaiLat < BATAS.latMin || nilaiLat > BATAS.latMaks) g.lat = "Lintang Cikarang antara -6,43 dan -6,20.";
    if (nilaiLng === null || nilaiLng < BATAS.lngMin || nilaiLng > BATAS.lngMaks) g.lng = "Bujur Cikarang antara 107,03 dan 107,28.";
    if (nilaiUrutan === null || !Number.isInteger(nilaiUrutan)) g.urutan = "Urutan berupa angka bulat.";

    setGalat(g);
    if (Object.keys(g).length > 0) {
      setGalatUmum("Periksa lagi isian yang ditandai merah.");
      return;
    }
    setGalatUmum(null);
    setMemproses(true);
    const data = {
      name: nama.trim(),
      delivery_fee: nilaiOngkir,
      center_lat: nilaiLat!,
      center_lng: nilaiLng!,
      sort_order: nilaiUrutan!,
      is_active: aktif,
    };
    const { error } = wilayah
      ? await supabase.from("service_areas").update(data).eq("id", wilayah.id)
      : await supabase.from("service_areas").insert(data);
    setMemproses(false);
    if (error) {
      setGalatUmum(pesanGalat(error));
      return;
    }
    await segarkanWeb("katalog");
    router.back();
  }

  return (
    <>
      <Bagian judul="Kecamatan">
        <Isian label="Nama kecamatan" nilai={nama} ubah={isi(setNama, "nama")} galat={galat.nama} placeholder="Cikarang Utara" />
        <Isian label="Ongkir" akhiran="rupiah" keyboardType="number-pad" nilai={ongkir} ubah={isi(setOngkir, "ongkir")} galat={galat.ongkir} petunjuk="Ongkir baru berlaku untuk checkout berikutnya." />
        <Saklar label="Bisa dipilih pembeli" keterangan="Nonaktifkan untuk berhenti melayani kecamatan ini." nilai={aktif} ubah={setAktif} />
      </Bagian>
      <Bagian judul="Titik tengah peta">
        <Catatan nada="netral">
          Dipakai untuk memusatkan peta saat pembeli memilih kecamatan ini. Bukan lokasi antar, pembeli tetap memasang pin
          rumahnya sendiri.
        </Catatan>
        <Isian label="Lintang (latitude)" keyboardType="numbers-and-punctuation" nilai={lat} ubah={isi(setLat, "lat")} galat={galat.lat} placeholder="-6.26" />
        <Isian label="Bujur (longitude)" keyboardType="numbers-and-punctuation" nilai={lng} ubah={isi(setLng, "lng")} galat={galat.lng} placeholder="107.15" />
      </Bagian>
      <Isian label="Urutan di daftar" keyboardType="number-pad" nilai={urutan} ubah={isi(setUrutan, "urutan")} galat={galat.urutan} />
      {galatUmum && <Catatan nada="merah">{galatUmum}</Catatan>}
      <Tombol label={wilayah ? "Simpan kecamatan" : "Tambah kecamatan"} onPress={simpan} memproses={memproses} />
    </>
  );
}
