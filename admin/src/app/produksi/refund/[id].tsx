import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { AksiFoto } from "@/components/AksiFoto";
import { BarisInfo, Bagian, Catatan, Kartu, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { TombolWa } from "@/components/TombolWa";
import { jalurFoto, unggahFoto, urlFotoPrivat, type FotoSiap } from "@/lib/foto";
import { formatNomorWa, formatRupiah, formatWaktuWib } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { RefundAdmin } from "@/lib/jenis";
import { konfirmasi } from "@/lib/konfirmasi";
import { useKunci } from "@/lib/kunci";
import { ALASAN_BATAL } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { radius, warna } from "@/lib/tema";
import { namaPanggilan, pesanRefund } from "@/lib/wa";

export default function DetailRefund() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { keadaan, ulangi, muatDiam } = useMuat(
    async () => wajib(await supabase.rpc("admin_daftar_refund")).find((r) => r.id === id) ?? null,
  );

  return (
    <Layar>
      <Stack.Screen options={{ title: keadaan.status === "siap" && keadaan.data ? keadaan.data.invoice_number : "Refund" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(r) =>
          !r ? (
            <Kosong judul="Refund tidak ditemukan" />
          ) : (
            <>
              <Kartu>
                <Lencana teks={r.status === "pending" ? "Menunggu refund" : "Refund selesai"} nada={r.status === "pending" ? "kuning" : "hijau"} />
                <BarisInfo label="Pemesan" nilai={r.nama_pemesan} />
                <BarisInfo label="WhatsApp" nilai={formatNomorWa(r.nomor_wa)} angka />
                <BarisInfo label="Jumlah" nilai={formatRupiah(r.amount)} angka />
                <BarisInfo label="Alasan" nilai={ALASAN_BATAL[r.reason] ?? r.reason} />
                <BarisInfo label="Masuk daftar" nilai={formatWaktuWib(r.created_at)} />
              </Kartu>
              {r.status === "pending" ? <Proses r={r} setelah={muatDiam} /> : <Bukti r={r} />}
            </>
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

function Proses({ r, setelah }: { r: RefundAdmin; setelah: () => void }) {
  const { verifikasiUlang } = useKunci();
  const [foto, setFoto] = useState<FotoSiap | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  async function selesaikan() {
    if (!foto) {
      setGalat("Unggah foto bukti transfer dulu.");
      return;
    }
    setGalat(null);
    const yakin = await konfirmasi(
      "Tandai refund selesai?",
      `Pastikan ${formatRupiah(r.amount)} sudah ditransfer ke rekening yang dikirim dari nomor ${formatNomorWa(r.nomor_wa)}.`,
      "Tandai selesai",
    );
    if (!yakin || !(await verifikasiUlang("Konfirmasi refund selesai"))) return;

    setMemproses(true);
    try {
      const jalur = jalurFoto(r.id);
      await unggahFoto("refund-proofs", jalur, foto);
      const { error } = await supabase.rpc("refund_complete", { p_refund_id: r.id, p_proof_path: jalur });
      if (error) throw error;
      setelah();
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setMemproses(false);
    }
  }

  return (
    <>
      <Bagian judul="1. Minta rekening tujuan">
        <Teks ragam="lembut">
          Refund hanya lewat nomor WhatsApp yang tercatat di pesanan. Permintaan refund dari nomor lain ditolak.
        </Teks>
        <TombolWa
          label="Kirim pesan refund"
          nomor={r.nomor_wa}
          teks={pesanRefund({ nama: namaPanggilan(r.nama_pemesan), invoice: r.invoice_number, token: r.status_token, alasan: r.reason, jumlah: r.amount })}
        />
        <Catatan nada="netral">Nomor rekening pembeli tidak dicatat di aplikasi. Cukup simpan bukti transfernya.</Catatan>
      </Bagian>
      <Bagian judul="2. Transfer, lalu unggah bukti">
        <AksiFoto label="Bukti transfer" foto={foto} ubah={setFoto} keterangan="Tangkapan layar dari m-banking atau e-wallet." />
      </Bagian>
      <Bagian judul="3. Tandai selesai">
        {galat && <Catatan nada="merah">{galat}</Catatan>}
        <Tombol label="Tandai refund selesai" onPress={selesaikan} memproses={memproses} nonaktif={!foto} />
        {!foto && <Teks ragam="redup">Tombol aktif setelah bukti transfer dipilih.</Teks>}
      </Bagian>
    </>
  );
}

function Bukti({ r }: { r: RefundAdmin }) {
  const [url, setUrl] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function lihat() {
    if (!r.proof_path) return;
    setMemuat(true);
    try {
      setUrl(await urlFotoPrivat("refund-proofs", r.proof_path));
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setMemuat(false);
    }
  }

  return (
    <Bagian judul="Bukti transfer">
      {r.processed_at && <Teks ragam="lembut">Ditandai selesai {formatWaktuWib(r.processed_at)}.</Teks>}
      {url ? (
        <Image source={{ uri: url }} style={styles.bukti} contentFit="contain" alt="Foto bukti transfer" />
      ) : (
        <Tombol label="Lihat bukti transfer" ragam="garis" onPress={lihat} memproses={memuat} nonaktif={!r.proof_path} />
      )}
      {galat && <Catatan nada="merah">{galat}</Catatan>}
    </Bagian>
  );
}

const styles = StyleSheet.create({
  bukti: { width: "100%", aspectRatio: 3 / 4, borderRadius: radius.sedang, backgroundColor: warna.redup },
});
