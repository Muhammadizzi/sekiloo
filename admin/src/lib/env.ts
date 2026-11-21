// Expo hanya menyisipkan EXPO_PUBLIC_* yang ditulis lengkap seperti ini, bukan lewat process.env[nama].
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const kunciPublik = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const situs = (process.env.EXPO_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

export const ENV = { url, kunciPublik, situs } as const;

export const envLengkap = url !== "" && kunciPublik !== "";
