"use client";

import { useEffect } from "react";

import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * Tampilan saat katalog gagal diambil.
 *
 * Next.js 16 memberi `retry` (bukan `reset` seperti versi lama) untuk
 * mengambil ulang dan merender ulang segmen ini.
 */
export default function KatalogGagal({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-surface-sunken">
      <Container className="py-section md:py-section-lg">
        <div role="alert" className="max-w-xl">
          <h1 className="font-display text-content text-2xl font-semibold md:text-3xl">
            Katalog gagal dimuat
          </h1>
          <p className="text-content-muted mt-3">
            Daftar produk tidak bisa diambil barusan, bisa karena koneksi
            internet terputus. Coba muat ulang. Kalau masih gagal, tunggu
            beberapa menit lalu buka lagi.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => retry()}>
              Muat ulang katalog
            </Button>
            <Button href="/" variant="outline" size="lg">
              Kembali ke beranda
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
