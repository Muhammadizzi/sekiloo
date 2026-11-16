"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/**
 * Pintu masuk framer-motion untuk satu halaman.
 *
 * Dipasang per halaman, bukan di layout root, supaya halaman yang tidak
 * butuh animasi tidak ikut memuat kodenya.
 *
 * - `LazyMotion` + `domAnimation`: komponen `m` hanya membawa fitur
 *   animasi DOM dasar, bukan seluruh library. `strict` membuat build
 *   gagal kalau ada yang tidak sengaja memakai `motion` versi penuh.
 * - `reducedMotion="user"`: aturan `prefers-reduced-motion` di
 *   globals.css hanya menjangkau animasi CSS. Animasi framer-motion
 *   berjalan lewat JavaScript, jadi preferensi itu harus diteruskan di
 *   sini juga.
 */
export function PenyediaGerak({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
