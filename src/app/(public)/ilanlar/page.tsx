import { getIlanlar, getFiltreReferans, type Filtre } from "@/lib/queries";
import { FiltreBar } from "@/components/public/filtre-bar";
import { SonucListesi } from "@/components/public/sonuc-listesi";
import type { Yakit, Vites } from "@/types/database";

export const metadata = { title: "Tüm İlanlar — KAF Motors" };

type SP = Record<string, string | undefined>;

function filtreyeCevir(sp: SP): Filtre {
  const sayi = (v?: string) => {
    const n = Number(v);
    return v && !Number.isNaN(n) ? n : undefined;
  };
  return {
    marka: sayi(sp.marka),
    model: sayi(sp.model),
    yilMin: sayi(sp.yil_min),
    yilMax: sayi(sp.yil_max),
    fiyatMin: sayi(sp.fiyat_min),
    fiyatMax: sayi(sp.fiyat_max),
    yakit: sp.yakit as Yakit | undefined,
    vites: sp.vites as Vites | undefined,
    sirala: sp.sirala as Filtre["sirala"],
  };
}

export default async function IlanlarPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filtre = filtreyeCevir(sp);

  const [ilanlar, referans] = await Promise.all([
    getIlanlar(filtre),
    getFiltreReferans(),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Tüm İlanlar</h1>
      <FiltreBar
        markalar={referans.markalar}
        modeller={referans.modeller}
        mevcut={sp}
      />
      <SonucListesi ilanlar={ilanlar} />
    </main>
  );
}
