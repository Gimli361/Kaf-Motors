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
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Calendar className="size-3.5" />
        {ilan.yil}
      </span>
      <span className="flex items-center gap-1">
        <Gauge className="size-3.5" />
        {kmFormat(ilan.km)}
      </span>
      <span className="flex items-center gap-1">
        <Fuel className="size-3.5" />
        {yakit}
      </span>
      <span className="flex items-center gap-1">
        <Cog className="size-3.5" />
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
        className="object-cover transition-transform group-hover:scale-105"
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
        className="group flex gap-4 overflow-hidden rounded-lg border bg-card p-2 transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-[4/3] w-40 shrink-0 overflow-hidden rounded bg-muted sm:w-56">
          {gorsel("224px")}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 py-1 pr-2">
          <p className="text-xs text-muted-foreground">
            {ilan.marka} {ilan.model}
          </p>
          <h3 className="line-clamp-1 font-medium">{ilan.baslik}</h3>
          <p className="text-lg font-bold text-primary">{fiyatFormat(ilan.fiyat)}</p>
          {rozetler}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/ilan/${ilan.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {gorsel("(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw")}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="text-xs text-muted-foreground">
          {ilan.marka} {ilan.model}
        </p>
        <h3 className="line-clamp-1 font-medium">{ilan.baslik}</h3>
        <p className="text-lg font-bold text-primary">{fiyatFormat(ilan.fiyat)}</p>
        {rozetler}
      </div>
    </Link>
  );
}
