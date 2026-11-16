import { Container } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MemuatKatalog() {
  return (
    <section className="bg-surface-sunken py-section md:py-section-lg">
      <Container>
        <p role="status" className="text-content-muted mb-block">
          Memuat daftar produk…
        </p>
        <ul aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="border-line bg-surface overflow-hidden rounded-lg border">
              <Skeleton className="border-line aspect-[4/3] w-full border-b" />
              <div className="space-y-2 p-3 sm:p-4">
                <Skeleton className="h-5 w-3/4 rounded-xs" />
                <Skeleton className="h-4 w-1/2 rounded-xs" />
                <Skeleton className="mt-4 h-6 w-2/5 rounded-xs" />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
