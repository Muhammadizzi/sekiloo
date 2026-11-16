"use client";

import { Button } from "./Button";

/** Muat ulang penuh, bukan navigasi lunak, supaya data diambil lagi dari server. */
export function TombolMuatUlang() {
  return (
    <Button variant="outline" onClick={() => window.location.reload()}>
      Muat ulang
    </Button>
  );
}
