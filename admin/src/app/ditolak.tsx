import { LayarAwal } from "@/components/LayarAwal";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { useSesi } from "@/lib/sesi";

export default function Ditolak() {
  const { keluar, muatUlang } = useSesi();
  return (
    <LayarAwal judul="Akun ini bukan admin" keterangan="Password benar, tapi akun ini belum diberi peran admin.">
      <Teks ragam="lembut">
        Peran admin produksi atau admin Cikarang hanya bisa ditambahkan pemilik lewat tabel admin_roles di dashboard
        Supabase. Setelah ditambahkan, tekan Periksa lagi.
      </Teks>
      <Tombol label="Periksa lagi" onPress={muatUlang} />
      <Tombol label="Keluar" ragam="hantu" onPress={keluar} />
    </LayarAwal>
  );
}
