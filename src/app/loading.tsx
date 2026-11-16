import { Container } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MemuatHalaman() {
  return (
    <>
      <div className="bg-ink-950 py-10 md:py-16">
        <Container>
          <p role="status" className="text-on-dark-muted">
            Memuat halaman…
          </p>
        </Container>
      </div>
      <section className="bg-surface-sunken py-section md:py-section-lg">
        <Container>
          <div aria-hidden className="border-line bg-surface space-y-3 rounded-lg border p-block">
            <Skeleton className="h-7 w-1/2 rounded-xs" />
            <Skeleton className="h-4 w-3/4 rounded-xs" />
            <Skeleton className="mt-4 h-3 w-full rounded-full" />
          </div>
        </Container>
      </section>
    </>
  );
}
