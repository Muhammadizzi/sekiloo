"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export default function GalatHalaman({
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
    <Section
      tone="sunken"
      headingLevel="h1"
      title="Halaman ini gagal dimuat"
      description="Ada masalah di server kami. Coba lagi, atau kembali ke beranda."
    >
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Coba lagi</Button>
        <Button href="/" variant="outline">
          Ke beranda
        </Button>
      </div>
    </Section>
  );
}
