import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOneCikanlar } from "@/lib/queries";
import { AracKart } from "@/components/public/arac-kart";

export default async function HomePage() {
  const ilanlar = await getOneCikanlar(8);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(var(--ring)/0.12),transparent_50%)] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 text-center relative z-10">
          <div className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-primary">
            KAF Motors · Premium İkinci El
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Hayalinizdeki Aracı{" "}
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Burada Bulun
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Tamamı detaylı ekspertiz raporlu, güvenilir ve sertifikalı ikinci el araç ilanları. 
            KAF Motors güvencesiyle hayalinizdeki sürüş keyfine kavuşun.
          </p>
          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/ilanlar" />}
              className="h-11 px-6 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] duration-300 transition-all cursor-pointer font-semibold"
            >
              <Search className="size-4" /> İlanları Keşfet
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Göz Atın</span>
            <h2 className="text-2xl font-extrabold sm:text-3xl tracking-tight mt-1 text-foreground/95">Öne Çıkan İlanlar</h2>
          </div>
          <Link
            href="/ilanlar"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Tümünü gör <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {ilanlar.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Henüz ilan eklenmemiş.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {ilanlar.map((i) => (
              <AracKart key={i.id} ilan={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

