import { Container } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MemuatStatusPesanan() {
  return (
    <section className="bg-surface-sunken py-section md:py-section-lg">
      <Container>
        <p role="status" className="text-content-muted mb-block">
          Memuat status pesanan…
        </p>
        <div aria-hidden className="border-line bg-surface max-w-xl space-y-3 rounded-lg border p-block">
          <Skeleton className="h-7 w-1/2 rounded-xs" />
          <Skeleton className="h-4 w-3/4 rounded-xs" />
          <Skeleton className="mt-4 h-11 w-full rounded-md" />
        </div>
      </Container>
    </section>
  );
}
