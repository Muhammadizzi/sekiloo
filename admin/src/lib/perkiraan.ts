import { useSyncExternalStore } from "react";

/**
 * Perkiraan jam antar per kloter, diisi sekali di daftar antar lalu dipakai di semua pesan "diantar hari ini".
 * Hanya disimpan di memori: nilainya berlaku untuk hari itu saja.
 */
const nilai = new Map<string, string>();
const pendengar = new Set<() => void>();

function langganan(fn: () => void) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}

export function aturPerkiraanJam(kloterId: string, jam: string): void {
  nilai.set(kloterId, jam);
  pendengar.forEach((fn) => fn());
}

export function usePerkiraanJam(kloterId: string): string {
  return useSyncExternalStore(langganan, () => nilai.get(kloterId) ?? "", () => "");
}
