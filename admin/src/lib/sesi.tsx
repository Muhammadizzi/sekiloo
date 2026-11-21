import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { pesanGalat } from "./galat";
import { supabase } from "./supabase";

export type Peran = "admin_produksi" | "admin_cikarang";

export type Sesi =
  | { status: "memuat" }
  | { status: "keluar" }
  | { status: "galat"; pesan: string }
  | { status: "tanpa-peran" }
  | { status: "perlu-2fa"; nama: string }
  | { status: "siap"; peran: Peran; nama: string; userId: string };

type NilaiSesi = { sesi: Sesi; muatUlang: () => void; keluar: () => Promise<void> };

const KonteksSesi = createContext<NilaiSesi | null>(null);

function peranSah(nilai: string): nilai is Peran {
  return nilai === "admin_produksi" || nilai === "admin_cikarang";
}

/**
 * Urutan pemeriksaan: ada sesi, akun terdaftar di admin_roles, lalu sesi sudah 2FA (aal2).
 * Peran dicek sebelum 2FA supaya akun yang bukan admin tidak sempat mendaftarkan authenticator.
 * Database tetap memeriksa ulang peran dan aal2 di setiap aksi, jadi pemeriksaan di sini hanya untuk menu.
 */
async function nilai(session: Session | null): Promise<Sesi> {
  if (!session) return { status: "keluar" };

  const { data: baris, error } = await supabase
    .from("admin_roles")
    .select("role, name")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) return { status: "galat", pesan: pesanGalat(error) };
  if (!baris || !peranSah(baris.role)) return { status: "tanpa-peran" };

  const { data: aal, error: galatAal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (galatAal) return { status: "galat", pesan: pesanGalat(galatAal) };
  if (aal.currentLevel !== "aal2") return { status: "perlu-2fa", nama: baris.name };

  return { status: "siap", peran: baris.role, nama: baris.name, userId: session.user.id };
}

export function PenyediaSesi({ children }: { children: ReactNode }) {
  const [sesi, setSesi] = useState<Sesi>({ status: "memuat" });
  const urutan = useRef(0);

  const periksa = useCallback(async (session: Session | null) => {
    // Hasil pemeriksaan lama yang selesai belakangan tidak boleh menimpa hasil yang lebih baru.
    const nomor = ++urutan.current;
    const hasil: Sesi = await nilai(session).catch((galat: unknown) => ({ status: "galat", pesan: pesanGalat(galat) }));
    if (nomor !== urutan.current) return;
    // Gangguan jaringan saat token diperbarui tidak boleh menutup layar yang sedang dipakai admin.
    setSesi((lama) =>
      hasil.status === "galat" && lama.status === "siap" && session?.user.id === lama.userId ? lama : hasil,
    );
  }, []);

  const muatUlang = useCallback(() => {
    setSesi({ status: "memuat" });
    supabase.auth.getSession().then(({ data }) => periksa(data.session));
  }, [periksa]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => periksa(data.session));
    const { data } = supabase.auth.onAuthStateChange((_peristiwa, session) => {
      // Memanggil Supabase langsung di dalam callback ini bisa macet (kunci auth masih dipegang), jadi ditunda.
      setTimeout(() => periksa(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [periksa]);

  const keluar = useCallback(async () => {
    // scope "local": hanya HP ini. Mengeluarkan semua perangkat dilakukan dari dashboard Supabase.
    await supabase.auth.signOut({ scope: "local" });
  }, []);

  return <KonteksSesi.Provider value={{ sesi, muatUlang, keluar }}>{children}</KonteksSesi.Provider>;
}

export function useSesi(): NilaiSesi {
  const nilaiKonteks = useContext(KonteksSesi);
  if (!nilaiKonteks) throw new Error("useSesi dipakai di luar PenyediaSesi");
  return nilaiKonteks;
}

/** Untuk layar yang hanya terbuka saat sesi siap. */
export function useAdmin(): Extract<Sesi, { status: "siap" }> {
  const { sesi } = useSesi();
  if (sesi.status !== "siap") throw new Error("useAdmin dipakai sebelum sesi siap");
  return sesi;
}
