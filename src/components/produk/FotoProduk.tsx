import Image from "next/image";
import { FotoPlaceholder } from "./FotoPlaceholder";

/**
 * Foto produk, atau penanda "foto menyusul" kalau `image_path` masih kosong.
 * Pembungkusnya wajib `relative` dengan rasio tetap, karena foto memakai `fill`.
 */
export function FotoProduk({
  url,
  alt,
  sizes,
  utama = false,
}: {
  url: string | null;
  alt: string;
  sizes: string;
  /** Foto paling atas di halaman detail: dimuat lebih dulu karena biasanya jadi LCP. */
  utama?: boolean;
}) {
  if (!url) return <FotoPlaceholder label="Foto menyusul" />;

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      {...(utama ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
    />
  );
}
