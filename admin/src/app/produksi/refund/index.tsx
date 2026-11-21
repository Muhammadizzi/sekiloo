import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Bagian, KartuTekan, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { formatRupiah, formatWaktuWib } from "@/lib/format";
import type { RefundAdmin } from "@/lib/jenis";
import { ALASAN_BATAL } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { jarak } from "@/lib/tema";

// Daftar selesai dibatasi supaya layar tetap ringan setelah berbulan-bulan berjalan.
const BATAS_SELESAI = 20;

export default function DaftarRefund() {
  const { keadaan, menyegarkan, segarkan, ulangi } = useMuat(async () => wajib(await supabase.rpc("admin_daftar_refund")));

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(daftar) => {
          const menunggu = daftar.filter((r) => r.status === "pending");
          const selesai = daftar.filter((r) => r.status === "done").slice(0, BATAS_SELESAI);
          return (
            <>
              <Bagian judul={`Menunggu (${menunggu.length})`}>
                {menunggu.length === 0 ? (
                  <Kosong judul="Tidak ada refund yang menunggu" />
                ) : (
                  menunggu.map((r) => <KartuRefund key={r.id} r={r} />)
                )}
              </Bagian>
              {selesai.length > 0 && (
                <Bagian judul="Sudah selesai">
                  {selesai.map((r) => (
                    <KartuRefund key={r.id} r={r} />
                  ))}
                </Bagian>
              )}
            </>
          );
        }}
      </IsiKeadaan>
    </Layar>
  );
}

function KartuRefund({ r }: { r: RefundAdmin }) {
  const menunggu = r.status === "pending";
  return (
    <KartuTekan onPress={() => router.push({ pathname: "/produksi/refund/[id]", params: { id: r.id } })} label={`Refund ${r.invoice_number}`}>
      <View style={styles.atas}>
        <Teks tebal angka style={styles.isiAtas}>
          {r.invoice_number}
        </Teks>
        <Lencana teks={menunggu ? "Menunggu" : "Selesai"} nada={menunggu ? "kuning" : "hijau"} />
      </View>
      <Teks ragam="subjudul">{r.nama_pemesan}</Teks>
      <Teks angka tebal>
        {formatRupiah(r.amount)}
      </Teks>
      <Teks ragam="redup">
        {ALASAN_BATAL[r.reason] ?? r.reason}. {menunggu ? `Masuk ${formatWaktuWib(r.created_at)}` : r.processed_at ? `Selesai ${formatWaktuWib(r.processed_at)}` : ""}
      </Teks>
    </KartuTekan>
  );
}

const styles = StyleSheet.create({
  atas: { flexDirection: "row", alignItems: "center", gap: jarak.s },
  isiAtas: { flex: 1 },
});
