import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Gauge, Fuel, Cog, Car, Palette, Check } from "lucide-react";
import { getIlanDetay } from "@/lib/queries";
import { gorselUrl, fiyatFormat, kmFormat } from "@/lib/format";
import {
  YAKIT_OPSIYONLARI,
  VITES_OPSIYONLARI,
  KASA_OPSIYONLARI,
  CEKIS_OPSIYONLARI,
  bosEkspertiz,
  ILETISIM_TEL,
  ILETISIM_WHATSAPP,
  type EkspertizDeger,
} from "@/lib/constants";
import { Galeri } from "@/components/public/galeri";
import {
  EkspertizSemasi,
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

  // İletişim linkleri
  const telHref = `tel:${ILETISIM_TEL}`;

  // Site adresi: Vercel prod'da otomatik (VERCEL_PROJECT_PRODUCTION_URL), yerelde NEXT_PUBLIC_SITE_URL ile override.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "");
  const ilanUrl = siteUrl ? `${siteUrl}/ilan/${d.slug}` : "";

  const waMesaj = [
    "Merhaba, KAF Motors'taki şu ilan hakkında bilgi almak istiyorum:",
    "",
    d.baslik,
    `Fiyat: ${fiyatFormat(d.fiyat)}`,
    ilanUrl, // boşsa filtrelenir → linksiz, hata vermez
  ]
    .filter(Boolean)
    .join("\n");

  const waHref = `https://wa.me/${ILETISIM_WHATSAPP}?text=${encodeURIComponent(
    waMesaj
  )}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-8">
      <nav className="mb-6 text-xs font-semibold tracking-wider uppercase text-muted-foreground/80 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/ilanlar" className="hover:text-primary transition-colors">İlanlar</Link>
        <span>/</span>
        <span className="text-foreground">{d.marka} {d.model}</span>
      </nav>

      {/* Mobil Başlık ve Fiyat */}
      <div className="lg:hidden space-y-2 mb-5">
        <div className="inline-flex items-center gap-1 rounded bg-primary/5 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
          KAF Motors Güvencesi
        </div>
        <h1 className="text-2xl font-black leading-tight text-foreground/95">{d.baslik}</h1>
        <p className="text-3xl font-black text-primary tracking-tight">{fiyatFormat(d.fiyat)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Sol kolon */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border bg-card p-3 shadow-xs">
            <Galeri resimler={resimler} baslik={d.baslik} />
          </div>

          {/* Teknik özellikler */}
          <section className="rounded-xl border bg-card p-6 shadow-xs">
            <h2 className="mb-4 text-base font-extrabold tracking-tight border-b border-border/60 pb-2 text-foreground/90 uppercase">
              Araç Bilgileri
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {ozellikler.map((o) => (
                <div key={o.etiket} className="flex flex-col gap-1 border-b border-border/40 py-2 text-sm">
                  <dt className="text-muted-foreground/80 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <o.ikon className="size-3.5 shrink-0 text-muted-foreground/60" />
                    {o.etiket}
                  </dt>
                  <dd className="font-semibold text-foreground/90">{o.deger}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Ekspertiz */}
          {d.ekspertiz.length > 0 && (
            <section className="rounded-xl border bg-card p-6 shadow-xs">
              <h2 className="mb-5 text-base font-extrabold tracking-tight border-b border-border/60 pb-2 text-foreground/90 uppercase">
                Ekspertiz / Boya Durumu
              </h2>
              <EkspertizSemasi deger={eksDeger} readonly />
            </section>
          )}

          {/* Donanım */}
          {donanimGrup.size > 0 && (
            <section className="rounded-xl border bg-card p-6 shadow-xs">
              <h2 className="mb-4 text-base font-extrabold tracking-tight border-b border-border/60 pb-2 text-foreground/90 uppercase">
                Donanım Özellikleri
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from(donanimGrup.entries()).map(([kategori, liste]) => (
                  <div key={kategori} className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-1">{kategori}</h3>
                    <ul className="grid gap-1.5">
                      {liste.map((ad) => (
                        <li key={ad} className="flex items-center gap-2 text-sm text-foreground/85">
                          <Check className="size-4 text-green-600 shrink-0" />
                          <span>{ad}</span>
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
            <section className="rounded-xl border bg-card p-6 shadow-xs">
              <h2 className="mb-4 text-base font-extrabold tracking-tight border-b border-border/60 pb-2 text-foreground/90 uppercase">
                Açıklama
              </h2>
              <div
                className="text-sm leading-relaxed text-foreground/80 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: d.aciklamaHtml }}
              />
            </section>
          )}
        </div>

        {/* Sağ kolon — fiyat kartı */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-xl border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 rounded bg-primary/5 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  KAF Motors Güvencesi
                </div>
                <h1 className="text-xl font-extrabold leading-tight text-foreground/95">{d.baslik}</h1>
              </div>
              
              <div className="border-y border-border/60 py-3.5 space-y-1">
                <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">Satış Fiyatı</span>
                <p className="text-3xl font-black text-primary tracking-tight">{fiyatFormat(d.fiyat)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col gap-0.5">
                  <span className="text-muted-foreground/75 font-semibold text-[10px] uppercase">Model Yılı</span>
                  <span className="font-bold text-foreground/90">{d.yil}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col gap-0.5">
                  <span className="text-muted-foreground/75 font-semibold text-[10px] uppercase">Kilometre</span>
                  <span className="font-bold text-foreground/90">{kmFormat(d.km)}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col gap-0.5">
                  <span className="text-muted-foreground/75 font-semibold text-[10px] uppercase">Yakıt Türü</span>
                  <span className="font-bold text-foreground/90">{etiket(YAKIT_OPSIYONLARI, d.yakit)}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col gap-0.5">
                  <span className="text-muted-foreground/75 font-semibold text-[10px] uppercase">Vites Tipi</span>
                  <span className="font-bold text-foreground/90">{etiket(VITES_OPSIYONLARI, d.vites)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href={telHref}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm transition-all duration-200 active:scale-[0.98] hover:bg-primary/95"
                >
                  Telefonla Ara
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400 font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:bg-green-500/20"
                >
                  WhatsApp ile İletişime Geç
                </a>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Yapışkan Alt İletişim Barı (Mobil) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-md p-3.5 flex items-center justify-between lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-4">
        <div>
          <span className="text-[9px] text-muted-foreground/80 font-bold uppercase tracking-wider block">Satış Fiyatı</span>
          <span className="text-lg font-black text-primary tracking-tight">{fiyatFormat(d.fiyat)}</span>
        </div>
        <div className="flex gap-2">
          <a
            href={telHref}
            className="flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs transition-all active:scale-[0.98]"
          >
            Telefonla Ara
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center justify-center rounded-lg border border-green-600/30 bg-green-500/10 px-4 text-xs font-bold text-green-700 dark:text-green-400 transition-all active:scale-[0.98]"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
