import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOneCikanlar } from "@/lib/queries";
import { AracKart } from "@/components/public/arac-kart";

export default async function HomePage() {
  const ilanlar = await getOneCikanlar(8);

  return (
    <main>
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Hayalinizdeki Aracı Bulun
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Ekspertizli, detaylı ve güvenilir ikinci el araç ilanları. KAF Motors
            güvencesiyle.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" nativeButton={false} render={<Link href="/ilanlar" />}>
              <Search className="size-4" /> İlanları Keşfet
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Öne Çıkan İlanlar</h2>
          <Link href="/ilanlar" className="text-sm text-primary hover:underline">
            Tümünü gör →
          </Link>
        </div>

        {ilanlar.length === 0 ? (
          <p className="text-muted-foreground">Henüz ilan eklenmemiş.</p>
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
