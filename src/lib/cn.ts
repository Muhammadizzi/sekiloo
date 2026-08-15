/**
 * Penggabung className sederhana.
 *
 * Sengaja tidak memakai clsx/tailwind-merge: kebutuhan kita hanya
 * menyaring nilai kosong, dan menghindari dependensi berarti bundel
 * lebih kecil untuk pengguna HP di jaringan 4G (target LCP < 3 detik).
 */
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
