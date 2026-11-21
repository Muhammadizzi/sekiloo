import * as SecureStore from "expo-secure-store";

/**
 * Sesi Supabase disimpan di Keystore Android lewat SecureStore, bukan AsyncStorage biasa,
 * karena token ini membuka akses admin. Sesi beserta data 2FA bisa melebihi batas aman
 * satu entri SecureStore (sekitar 2 KB), jadi isinya dipotong ke beberapa entri.
 */
const UKURAN_POTONGAN = 1800;
const OPSI: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// SecureStore hanya menerima huruf, angka, ".", "-", dan "_" sebagai nama kunci.
function aman(kunci: string): string {
  return kunci.replace(/[^A-Za-z0-9._-]/g, "_");
}

async function hapusPotongan(kunci: string): Promise<void> {
  const jumlah = Number(await SecureStore.getItemAsync(`${kunci}.n`, OPSI));
  for (let i = 0; i < (Number.isFinite(jumlah) ? jumlah : 0); i++) {
    await SecureStore.deleteItemAsync(`${kunci}.${i}`, OPSI);
  }
  await SecureStore.deleteItemAsync(`${kunci}.n`, OPSI);
}

export const penyimpananSesi = {
  async getItem(nama: string): Promise<string | null> {
    const kunci = aman(nama);
    const jumlah = Number(await SecureStore.getItemAsync(`${kunci}.n`, OPSI));
    if (!Number.isInteger(jumlah) || jumlah <= 0) return null;
    const bagian: string[] = [];
    for (let i = 0; i < jumlah; i++) {
      const isi = await SecureStore.getItemAsync(`${kunci}.${i}`, OPSI);
      // Potongan hilang berarti sesi rusak. Lebih aman dianggap keluar daripada memakai separuh token.
      if (isi === null) return null;
      bagian.push(isi);
    }
    return bagian.join("");
  },

  async setItem(nama: string, nilai: string): Promise<void> {
    const kunci = aman(nama);
    await hapusPotongan(kunci);
    const jumlah = Math.ceil(nilai.length / UKURAN_POTONGAN);
    for (let i = 0; i < jumlah; i++) {
      await SecureStore.setItemAsync(`${kunci}.${i}`, nilai.slice(i * UKURAN_POTONGAN, (i + 1) * UKURAN_POTONGAN), OPSI);
    }
    await SecureStore.setItemAsync(`${kunci}.n`, String(jumlah), OPSI);
  },

  async removeItem(nama: string): Promise<void> {
    await hapusPotongan(aman(nama));
  },
};
