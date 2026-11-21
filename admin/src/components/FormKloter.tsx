import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { bacaAngka, formatBerat, formatTanggalKalender, formatWaktuWib, gramKeKgTeks } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { BarisKloter } from "@/lib/jenis";
import { useKunci } from "@/lib/kunci";
import { supabase } from "@/lib/supabase";
import { jarak } from "@/lib/tema";
import { dariIsoWib, deretTanggal, hariIniWib, JAM_BULAT, keIsoWib, labelJam, labelTanggalPendek, tambahHari } from "@/lib/waktu";
import { segarkanWeb } from "@/lib/web";
import { Isian } from "./Isian";
import { BarisInfo, Bagian, Catatan, Kartu } from "./Kartu";
import { Pilihan } from "./Pilihan";
import { Teks } from "./Teks";
import { Tombol } from "./Tombol";

type Kolom = "nama" | "tutup" | "antar" | "kapasitas" | "maks" | "minBerat" | "minPesanan" | "alasan";

/** Membuat kloter baru, atau mengubah kloter yang ada kalau `kloter` diberikan. */
export function FormKloter({
  kloter,
  lunasJumlah = 0,
  selesai,
}: {
  kloter?: BarisKloter;
  lunasJumlah?: number;
  selesai: (id: string, jadwalBerubah: boolean) => void;
}) {
  const { verifikasiUlang } = useKunci();
  const awalTutup = kloter ? dariIsoWib(kloter.close_order_at) : null;
  const masihBuka = !kloter || kloter.status === "open";

  const [nama, setNama] = useState(kloter?.name ?? "");
  const [tanggalTutup, setTanggalTutup] = useState<string | null>(awalTutup?.tanggal ?? null);
  const [jamTutup, setJamTutup] = useState<string | null>(awalTutup?.jam ?? null);
  const [tanggalAntar, setTanggalAntar] = useState<string | null>(kloter?.delivery_date ?? null);
  const [kapasitas, setKapasitas] = useState(kloter ? gramKeKgTeks(kloter.capacity_gram) : "");
  const [maks, setMaks] = useState(kloter ? gramKeKgTeks(kloter.max_order_weight_gram) : "");
  // Nilai awal syarat minimum mengikuti PRD 8.4: 3 kg dan 5 pesanan.
  const [minBerat, setMinBerat] = useState(kloter ? gramKeKgTeks(kloter.min_weight_gram) : "3");
  const [minPesanan, setMinPesanan] = useState(kloter ? String(kloter.min_orders) : "5");
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState<Partial<Record<Kolom, string>>>({});
  const [galatUmum, setGalatUmum] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  const hariIni = hariIniWib();
  const opsiTutup = sisipkan(deretTanggal(hariIni, 45), awalTutup?.tanggal);
  const opsiJam = sisipkan(JAM_BULAT, awalTutup?.jam).sort();
  const opsiAntar = sisipkan(deretTanggal(tambahHari(tanggalTutup ?? hariIni, 1), 30), kloter?.delivery_date);

  const jadwalBerubah =
    !!kloter &&
    ((tanggalTutup && jamTutup ? keIsoWib(tanggalTutup, jamTutup) : null) !== new Date(kloter.close_order_at).toISOString() ||
      tanggalAntar !== kloter.delivery_date);
  const perluAlasan = jadwalBerubah && lunasJumlah > 0;

  function bersihkan(k: Kolom) {
    setGalat((lama) => {
      const baru = { ...lama };
      delete baru[k];
      return baru;
    });
  }

  function isi(ubah: (t: string) => void, k: Kolom) {
    return (t: string) => {
      ubah(t);
      bersihkan(k);
    };
  }

  async function simpan() {
    const g: Partial<Record<Kolom, string>> = {};
    const kapasitasGram = kgKeGram(kapasitas);
    const maksGram = kgKeGram(maks);
    const minBeratGram = kgKeGram(minBerat, true);
    const minJumlah = bacaAngka(minPesanan);

    if (nama.trim().length < 2 || nama.trim().length > 80) g.nama = "Nama kloter 2 sampai 80 huruf, mis. Kloter 1 Desember.";
    if (!tanggalTutup || !jamTutup) g.tutup = "Pilih tanggal dan jam tutup PO.";
    else if (masihBuka && Date.parse(keIsoWib(tanggalTutup, jamTutup)) <= Date.now() && (!kloter || jadwalBerubah)) {
      g.tutup = "Jam tutup PO sudah lewat. Pilih waktu yang akan datang.";
    }
    if (!tanggalAntar) g.antar = "Pilih tanggal antar.";
    else if (tanggalTutup && tanggalAntar <= tanggalTutup) g.antar = "Tanggal antar harus setelah tanggal tutup PO.";
    if (kapasitasGram === null || kapasitasGram <= 0) g.kapasitas = "Isi kapasitas cool box dalam kg.";
    if (maksGram === null || maksGram <= 0) g.maks = "Isi berat maksimal satu pesanan dalam kg.";
    else if (kapasitasGram !== null && maksGram > kapasitasGram) g.maks = "Tidak boleh melebihi kapasitas kloter.";
    if (minBeratGram === null) g.minBerat = "Isi minimum berat lunas dalam kg (boleh 0).";
    if (minJumlah === null || !Number.isInteger(minJumlah)) g.minPesanan = "Isi jumlah pesanan minimum (boleh 0).";
    if (perluAlasan && alasan.trim().length < 5) g.alasan = "Tulis alasan perubahan jadwal. Alasan ini dikirim ke pembeli.";

    setGalat(g);
    setGalatUmum(null);
    if (Object.keys(g).length > 0) {
      setGalatUmum("Periksa lagi isian yang ditandai merah.");
      return;
    }

    const data = {
      name: nama.trim(),
      close_order_at: keIsoWib(tanggalTutup!, jamTutup!),
      delivery_date: tanggalAntar!,
      capacity_gram: kapasitasGram!,
      max_order_weight_gram: maksGram!,
      min_weight_gram: minBeratGram!,
      min_orders: minJumlah!,
    };

    // Mengubah jadwal kloter yang sudah ada pesanan lunas termasuk aksi sensitif (PRD 14.2).
    if (perluAlasan && !(await verifikasiUlang("Konfirmasi perubahan jadwal kloter"))) return;

    setMemproses(true);
    let id = kloter?.id;
    let error: unknown = null;
    if (kloter) {
      // Hanya kolom yang berubah yang dikirim. Kolom yang terkunci setelah PO tutup tidak ikut terkirim.
      const ubah: Partial<typeof data> & { change_reason?: string } = { name: data.name, delivery_date: data.delivery_date };
      if (masihBuka) Object.assign(ubah, {
        close_order_at: data.close_order_at,
        capacity_gram: data.capacity_gram,
        max_order_weight_gram: data.max_order_weight_gram,
        min_weight_gram: data.min_weight_gram,
        min_orders: data.min_orders,
      });
      if (perluAlasan) ubah.change_reason = alasan.trim();
      ({ error } = await supabase.from("po_batches").update(ubah).eq("id", kloter.id));
    } else {
      const hasil = await supabase.from("po_batches").insert(data).select("id").single();
      error = hasil.error;
      id = hasil.data?.id;
    }
    setMemproses(false);

    if (error || !id) {
      setGalatUmum(pesanGalat(error));
      return;
    }
    await segarkanWeb("kloter");
    selesai(id, perluAlasan);
  }

  return (
    <View style={styles.form}>
      <Isian label="Nama kloter" nilai={nama} ubah={isi(setNama, "nama")} galat={galat.nama} placeholder="Kloter 1 Desember" />

      <Bagian judul="Jadwal">
        {masihBuka ? (
          <>
            <Pilihan
              label="Tanggal tutup PO"
              gulir
              opsi={opsiTutup.map((t) => ({ kode: t, teks: labelTanggalPendek(t) }))}
              nilai={tanggalTutup}
              ubah={(t) => {
                setTanggalTutup(t);
                bersihkan("tutup");
                if (tanggalAntar && tanggalAntar <= t) setTanggalAntar(null);
              }}
            />
            <Pilihan
              label="Jam tutup PO (WIB)"
              gulir
              opsi={opsiJam.map((j) => ({ kode: j, teks: labelJam(j) }))}
              nilai={jamTutup}
              ubah={isi(setJamTutup, "tutup")}
              galat={galat.tutup}
            />
            <Teks ragam="redup">Checkout di web ditutup 15 menit sebelum jam ini.</Teks>
          </>
        ) : (
          kloter && (
            <Kartu>
              <BarisInfo label="Tutup PO" nilai={formatWaktuWib(kloter.close_order_at)} />
              <Teks ragam="redup">Jam tutup tidak bisa diubah karena PO sudah tutup.</Teks>
            </Kartu>
          )
        )}
        <Pilihan
          label="Tanggal antar di Cikarang"
          gulir
          opsi={opsiAntar.map((t) => ({ kode: t, teks: labelTanggalPendek(t) }))}
          nilai={tanggalAntar}
          ubah={isi(setTanggalAntar, "antar")}
          galat={galat.antar}
        />
        {tanggalAntar && <Teks ragam="redup">Diantar {formatTanggalKalender(tanggalAntar)}.</Teks>}
      </Bagian>

      <Bagian judul="Kapasitas dan syarat">
        {masihBuka ? (
          <>
            <Isian label="Kapasitas cool box" akhiran="kg" keyboardType="decimal-pad" nilai={kapasitas} ubah={isi(setKapasitas, "kapasitas")} galat={galat.kapasitas} petunjuk="Dihitung dari berat setelah dikemas. Jangan melebihi freezer atau kulkas di Cikarang." />
            <Isian label="Berat maksimal satu pesanan" akhiran="kg" keyboardType="decimal-pad" nilai={maks} ubah={isi(setMaks, "maks")} galat={galat.maks} />
            <Isian label="Minimum berat pesanan lunas" akhiran="kg" keyboardType="decimal-pad" nilai={minBerat} ubah={isi(setMinBerat, "minBerat")} galat={galat.minBerat} />
            <Isian label="Minimum jumlah pesanan lunas" akhiran="pesanan" keyboardType="number-pad" nilai={minPesanan} ubah={isi(setMinPesanan, "minPesanan")} galat={galat.minPesanan} petunjuk="Saat PO tutup, kloter batal otomatis kalau salah satu minimum tidak terpenuhi, dan pesanan lunas masuk daftar refund." />
          </>
        ) : (
          kloter && (
            <Kartu>
              <BarisInfo label="Kapasitas" nilai={formatBerat(kloter.capacity_gram)} angka />
              <BarisInfo label="Maksimal per pesanan" nilai={formatBerat(kloter.max_order_weight_gram)} angka />
              <Teks ragam="redup">Kapasitas dan syarat tidak bisa diubah setelah PO tutup.</Teks>
            </Kartu>
          )
        )}
      </Bagian>

      {perluAlasan && (
        <Bagian judul="Alasan perubahan jadwal">
          <Catatan>{`Kloter ini sudah punya ${lunasJumlah} pesanan lunas. Setelah disimpan, kamu akan diarahkan untuk mengabari mereka.`}</Catatan>
          <Isian label="Alasan" nilai={alasan} ubah={isi(setAlasan, "alasan")} galat={galat.alasan} multiline placeholder="Mis. kapal tidak melaut karena cuaca buruk" />
        </Bagian>
      )}

      {galatUmum && <Catatan nada="merah">{galatUmum}</Catatan>}
      <Tombol label={kloter ? "Simpan perubahan" : "Buat dan buka PO"} onPress={simpan} memproses={memproses} />
    </View>
  );
}

function sisipkan(daftar: string[], nilai: string | null | undefined): string[] {
  return nilai && !daftar.includes(nilai) ? [nilai, ...daftar] : daftar;
}

function kgKeGram(teks: string, bolehNol = false): number | null {
  const kg = bacaAngka(teks, true);
  if (kg === null || (!bolehNol && kg <= 0)) return null;
  return Math.round(kg * 1000);
}

const styles = StyleSheet.create({
  form: { gap: jarak.xl },
});
