import { Container } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MemuatProduk() {
  return (
    <section className="bg-surface py-section md:py-section-lg">
      <Container>
        <p role="status" className="text-content-muted mb-block">
          Memuat produk…
        </p>
        <div aria-hidden className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
          <Skeleton className="border-line aspect-[4/3] w-full rounded-lg border" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-3/4 rounded-xs" />
            <Skeleton className="h-8 w-1/3 rounded-xs" />
            <Skeleton className="h-4 w-1/2 rounded-xs" />
            <Skeleton className="mt-6 h-4 w-full rounded-xs" />
            <Skeleton className="h-4 w-5/6 rounded-xs" />
          </div>
        </div>
      </Container>
    </section>
  );
}
