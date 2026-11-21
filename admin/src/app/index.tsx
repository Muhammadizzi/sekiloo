import { Redirect } from "expo-router";
import { useSesi } from "@/lib/sesi";

/** Titik masuk: arahkan ke layar yang sesuai keadaan sesi. Layar lain dijaga Stack.Protected di _layout. */
export default function Awal() {
  const { sesi } = useSesi();
  switch (sesi.status) {
    case "siap":
      return <Redirect href={sesi.peran === "admin_produksi" ? "/produksi/kloter" : "/cikarang"} />;
    case "perlu-2fa":
      return <Redirect href="/dua-langkah" />;
    case "tanpa-peran":
      return <Redirect href="/ditolak" />;
    default:
      return <Redirect href="/masuk" />;
  }
}
