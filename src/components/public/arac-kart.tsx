import Link from "next/link";
import Image from "next/image";
import { Calendar, Gauge, Fuel, Cog } from "lucide-react";
import type { IlanKart } from "@/lib/queries";
import { fiyatFormat, kmFormat, gorselUrl } from "@/lib/format";
import { YAKIT_OPSIYONLARI, VITES_OPSIYONLARI } from "@/lib/constants";

export function AracKart({ ilan, genis }: { ilan: IlanKart; genis?: boolean }) {
  const url = gorselUrl(ilan.kapakPath);
  const yakit = YAKIT_OPSIYONLARI.find((y) => y.value === ilan.yakit)?.label ?? ilan.yakit;
  const vites = VITES_OPSIYONLARI.find((v) => v.value === ilan.vites)?.label ?? ilan.vites;

  const rozetler = (
    <div className="flex flex-wrap gap-1 pt-1">
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Calendar className="size-3 text-muted-foreground/70" />
        {ilan.yil}
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Gauge className="size-3 text-muted-foreground/70" />
        {kmFormat(ilan.km)}
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Fuel className="size-3 text-muted-foreground/70" />
        {yakit}
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Cog className="size-3 text-muted-foreground/70" />
        {vites}
      </span>
    </div>
  );

  const gorsel = (sizes: string) =>
    url ? (
      <Image
        src={url}
        alt={ilan.baslik}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        priority
      />
    ) : (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Görsel yok
      </div>
    );

  if (genis) {
    return (
      <Link
        href={`/ilan/${ilan.slug}`}
        className="group flex flex-col sm:flex-row gap-4 overflow-hidden rounded-xl border bg-card p-3 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
      >
        <div className="relative aspect-[4/3] w-full sm:w-52 shrink-0 overflow-hidden rounded-lg bg-muted">
          {gorsel("(max-width:640px) 100vw, 208px")}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 py-1 pr-2">
          <div className="flex items-center gap-1.5">
            {ilan.markaLogo && (
              <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-xs border border-black/5">
                <img
                  src={ilan.markaLogo}
                  alt={ilan.marka}
                  className="size-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <span className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground/80">
              {ilan.marka} · {ilan.model}
            </span>
          </div>
          <h3 className="line-clamp-1 font-bold text-foreground/90 transition-colors group-hover:text-primary text-sm sm:text-base">
            {ilan.baslik}
          </h3>
          <p className="text-xl font-extrabold text-primary">{fiyatFormat(ilan.fiyat)}</p>
          {rozetler}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/ilan/${ilan.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {gorsel("(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw")}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-1.5">
          {ilan.markaLogo && (
            <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-xs border border-black/5">
              <img
                src={ilan.markaLogo}
                alt={ilan.marka}
                className="size-full object-contain"
                loading="lazy"
              />
            </div>
          )}
          <span className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground/80">
            {ilan.marka} · {ilan.model}
          </span>
        </div>
        <h3 className="line-clamp-1 font-bold text-foreground/90 transition-colors group-hover:text-primary text-sm sm:text-base">
          {ilan.baslik}
        </h3>
        <p className="text-xl font-extrabold text-primary">{fiyatFormat(ilan.fiyat)}</p>
        {rozetler}
      </div>
    </Link>
  );
}

