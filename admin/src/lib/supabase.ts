import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import type { Database } from "@/types/database";
import { ENV } from "./env";
import { penyimpananSesi } from "./penyimpanan-sesi";

// Nilai cadangan hanya supaya createClient tidak melempar error saat env kosong.
// Layar awal menampilkan pesan env belum diisi, jadi klien ini tidak pernah dipakai dalam keadaan itu.
export const supabase = createClient<Database>(ENV.url || "https://belum-diisi.invalid", ENV.kunciPublik || "belum-diisi", {
  auth: {
    storage: penyimpananSesi,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Di HP, timer penyegar token berhenti saat aplikasi di latar belakang, lalu jalan lagi saat dibuka.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (keadaan) => {
    if (keadaan === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
