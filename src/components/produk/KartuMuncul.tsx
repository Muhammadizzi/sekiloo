"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  m,
  useAnimationControls,
  useInView,
  useReducedMotion,
} from "framer-motion";

/**
 * Kartu yang muncul pelan saat digulir masuk layar.
 *
 * Tujuannya menuntun mata mengikuti urutan baca di dalam satu kategori
 * saat pembeli menggulir. Karena itu HANYA kartu yang masih di bawah
 * layar ketika halaman siap yang disembunyikan lalu dimunculkan:
 *
 * - Kartu yang sudah terlihat sejak awal tidak dianimasikan. Isi yang
 *   sudah di depan mata pembeli tidak boleh ditunda demi efek.
 * - HTML dari server selalu tampil utuh. Kalau JavaScript gagal dimuat,
 *   tidak ada satu kartu pun yang tertinggal tersembunyi.
 * - Kartu disembunyikan saat ia memang belum terlihat, jadi tidak ada
 *   kedipan "tampil, hilang, lalu muncul lagi".
 *
 * Status disimpan di animation controls, bukan di state React, supaya
 * tidak ada render ulang hanya untuk menyembunyikan satu kartu.
 */

/* Melambat di akhir: kartu terasa "mendarat", bukan berhenti mendadak.
   Kurva yang sama dengan animasi panel menu di globals.css. */
const KURVA = [0.16, 1, 0.3, 1] as const;

/* Jeda antar kartu dalam satu baris grid. Dibatasi tiga langkah supaya
   kartu ke-10 tidak menunggu hampir satu detik. */
const JEDA_PER_KARTU = 0.06;

const variasi = {
  sembunyi: { opacity: 0, y: 16, transition: { duration: 0 } },
  tampil: (urutan: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: KURVA,
      delay: (urutan % 3) * JEDA_PER_KARTU,
    },
  }),
};

export function KartuMuncul({
  urutan,
  className,
  children,
}: {
  /** Posisi kartu di daftarnya, untuk jeda bertahap. */
  urutan: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const kontrol = useAnimationControls();
  const kurangiGerak = useReducedMotion();
  const masukLayar = useInView(ref, {
    once: true,
    /* Baru dianggap masuk setelah naik 10% ke dalam layar, supaya
       animasinya terlihat, bukan selesai di tepi bawah layar. */
    margin: "0px 0px -10% 0px",
  });
  const tersembunyi = useRef(false);

  useEffect(() => {
    const kartu = ref.current;
    if (kurangiGerak || !kartu) return;

    if (kartu.getBoundingClientRect().top > window.innerHeight) {
      tersembunyi.current = true;
      /* `set()` menyamakan nilai internal framer-motion, supaya animasi
         masuk nanti berangkat dari 0. Tapi framer-motion baru menggambar
         nilai itu di frame berikutnya, dan browser menahan frame di tab
         yang tidak sedang dilihat (mis. halaman dibuka di tab latar).
         Karena itu gaya yang sama juga ditulis langsung ke elemen:
         tanpanya kartu tetap tampil, lalu berkedip hilang tepat saat
         animasinya dimulai. */
      kontrol.set("sembunyi");
      kartu.style.opacity = "0";
      kartu.style.transform = "translateY(16px)";
    }
  }, [kontrol, kurangiGerak]);

  useEffect(() => {
    if (masukLayar && tersembunyi.current) {
      kontrol.start("tampil");
    }
  }, [kontrol, masukLayar]);

  return (
    <m.div
      ref={ref}
      className={className}
      /* Nilai awal wajib ditulis, bukan `initial={false}`. Tanpa nilai
         awal, opacity dan y belum ada saat `kontrol.set()` dipanggil;
         framer-motion lalu membuatnya diam-diam tanpa menggambar ulang,
         dan kartu tidak pernah benar-benar tersembunyi. Server tetap
         merender kartu dalam keadaan tampil penuh. */
      initial={{ opacity: 1, y: 0 }}
      animate={kontrol}
      variants={variasi}
      custom={urutan}
    >
      {children}
    </m.div>
  );
}
