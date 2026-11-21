// Versi web hanya untuk pratinjau saat pengembangan. APK memakai Keystore (penyimpanan-sesi.ts).
export const penyimpananSesi = {
  async getItem(nama: string): Promise<string | null> {
    return globalThis.localStorage?.getItem(nama) ?? null;
  },
  async setItem(nama: string, nilai: string): Promise<void> {
    globalThis.localStorage?.setItem(nama, nilai);
  },
  async removeItem(nama: string): Promise<void> {
    globalThis.localStorage?.removeItem(nama);
  },
};
