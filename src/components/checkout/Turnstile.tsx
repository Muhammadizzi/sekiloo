"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type OpsiTurnstile = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  language: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (wadah: HTMLElement, opsi: OpsiTurnstile) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

/**
 * Widget Cloudflare Turnstile, dipasang di dalam <form> supaya otomatis menambah input
 * `cf-turnstile-response`. Token hanya berlaku sekali, jadi widget diulang setiap `ulangi` berubah.
 */
export function Turnstile({
  siteKey,
  ulangi,
  onSiap,
  onGagal,
}: {
  siteKey: string;
  /** Nilai apa pun yang berubah setiap kali form selesai dikirim. */
  ulangi: unknown;
  onSiap: (siap: boolean) => void;
  onGagal: () => void;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const idWidget = useRef<string | null>(null);
  const pemanggil = useRef({ onSiap, onGagal });

  useEffect(() => {
    pemanggil.current = { onSiap, onGagal };
  }, [onSiap, onGagal]);

  const pasang = useCallback(() => {
    if (!window.turnstile || !wadah.current || idWidget.current) return;
    idWidget.current = window.turnstile.render(wadah.current, {
      sitekey: siteKey,
      language: "id",
      callback: () => pemanggil.current.onSiap(true),
      "expired-callback": () => pemanggil.current.onSiap(false),
      "error-callback": () => pemanggil.current.onGagal(),
    });
  }, [siteKey]);

  useEffect(() => {
    // Skrip mungkin sudah dimuat dari kunjungan sebelumnya di sesi yang sama.
    pasang();
    return () => {
      if (idWidget.current) window.turnstile?.remove(idWidget.current);
      idWidget.current = null;
    };
  }, [pasang]);

  const pertama = useRef(true);
  useEffect(() => {
    if (pertama.current) {
      pertama.current = false;
      return;
    }
    if (idWidget.current) {
      pemanggil.current.onSiap(false);
      window.turnstile?.reset(idWidget.current);
    }
  }, [ulangi]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={pasang}
      />
      <div ref={wadah} />
    </>
  );
}
