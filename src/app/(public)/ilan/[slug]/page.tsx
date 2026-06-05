import { notFound } from "next/navigation";
import { Calendar, Gauge, Fuel, Cog, Car, Palette, Check } from "lucide-react";
import { getIlanDetay } from "@/lib/queries";
import { gorselUrl, fiyatFormat, kmFormat } from "@/lib/format";
import {
  YAKIT_OPSIYONLARI,
  VITES_OPSIYONLARI,
  KASA_OPSIYONLARI,
  CEKIS_OPSIYONLARI,
} from "@/lib/constants";
import { Galeri } from "@/components/public/galeri";
import {
  EkspertizSemasi,
  bosEkspertiz,
  type EkspertizDeger,
} from "@/components/admin/ekspertiz-semasi";
import { Card, CardContent } from "@/components/ui/card";

function etiket<T extends string>(
  ops: { value: T; label: string }[],
  v: T | null
): string | null {
  if (!v) return null;
  return ops.find((o) => o.value === v)?.label ?? v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getIlanDetay(slug);
  return { title: d ? `${d.baslik} — KAF Motors` : "İlan bulunamadı" };
}

export default async function IlanDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getIlanDetay(slug);
  if (!d) notFound();

  const resimler = d.resimler
    .map((r) => ({ id: r.id, url: gorselUrl(r.path) }))
    .filter((r): r is { id: string; url: string } => !!r.url);

  const eksDeger: EkspertizDeger = bosEkspertiz();
  for (const e of d.ekspertiz) eksDeger[e.parca] = e.durum;

  const ozellikler = [
    { ikon: Calendar, etiket: "Yıl", deger: String(d.yil) },
    { ikon: Gauge, etiket: "Kilometre", deger: kmFormat(d.km) },
    { ikon: Fuel, etiket: "Yakıt", deger: etiket(YAKIT_OPSIYONLARI, d.yakit) },
    { ikon: Cog, etiket: "Vites", deger: etiket(VITES_OPSIYONLARI, d.vites) },
    { ikon: Car, etiket: "Kasa", deger: etiket(KASA_OPSIYONLARI, d.kasa) },
    { ikon: Cog, etiket: "Çekiş", deger: etiket(CEKIS_OPSIYONLARI, d.cekis) },
    { ikon: Palette, etiket: "Renk", deger: d.renk },
    {
      ikon: Cog,
      etiket: "Motor",
      deger: [d.motorHacmi ? `${d.motorHacmi} cc` : null, d.motorGucu ? `${d.motorGucu} hp` : null]
        .filter(Boolean)
        .join(" · ") || null,
    },
  ].filter((o) => o.deger);

  // Donanımları kategoriye göre grupla
  const donanimGrup = new Map<string, string[]>();
  for (const x of d.donanim) {
    const arr = donanimGrup.get(x.kategori) ?? [];
    arr.push(x.ad);
    donanimGrup.set(x.kategori, arr);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        {d.marka} {d.model}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Sol kolon */}
        <div className="space-y-8">
          <Galeri resimler={resimler} baslik={d.baslik} />

          {/* Teknik özellikler */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">Araç Bilgileri</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {ozellikler.map((o) => (
                <div key={o.etiket} className="flex items-center gap-2 border-b py-2 text-sm">
                  <o.ikon className="size-4 shrink-0 text-muted-foreground" />
                  <dt className="text-muted-foreground">{o.etiket}:</dt>
                  <dd className="font-medium">{o.deger}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Ekspertiz */}
          {d.ekspertiz.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Ekspertiz / Boya Durumu</h2>
              <EkspertizSemasi deger={eksDeger} readonly />
            </section>
          )}

          {/* Donanım */}
          {donanimGrup.size > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Donanım</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from(donanimGrup.entries()).map(([kategori, liste]) => (
                  <div key={kategori}>
                    <h3 className="mb-2 text-sm font-semibold">{kategori}</h3>
                    <ul className="space-y-1">
                      {liste.map((ad) => (
                        <li key={ad} className="flex items-center gap-2 text-sm">
                          <Check className="size-4 text-green-600" />
                          {ad}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Açıklama */}
          {d.aciklamaHtml && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Açıklama</h2>
              <div
                className="text-sm leading-relaxed [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: d.aciklamaHtml }}
              />
            </section>
          )}
        </div>

        {/* Sağ kolon — fiyat kartı */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h1 className="text-xl font-bold leading-tight">{d.baslik}</h1>
              <p className="text-3xl font-bold text-primary">{fiyatFormat(d.fiyat)}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{d.yil}</span>
                <span>{kmFormat(d.km)}</span>
                <span>{etiket(YAKIT_OPSIYONLARI, d.yakit)}</span>
                <span>{etiket(VITES_OPSIYONLARI, d.vites)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
