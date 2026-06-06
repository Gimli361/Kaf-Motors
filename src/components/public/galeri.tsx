"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Galeri({
  resimler,
  baslik,
}: {
  resimler: { id: string; url: string }[];
  baslik: string;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: resimler.length > 1 });
  const [secili, setSecili] = useState(0);

  const kaydir = useCallback((i: number) => embla?.scrollTo(i), [embla]);

  useEffect(() => {
    if (!embla) return;
    const f = () => setSecili(embla.selectedScrollSnap());
    embla.on("select", f);
    f();
    return () => {
      embla.off("select", f);
    };
  }, [embla]);

  if (!resimler.length) {
    return (
      <div className="grid h-[45vh] place-items-center rounded-lg border bg-muted text-muted-foreground sm:h-[52vh] lg:h-[58vh]">
        Görsel yok
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-lg border" ref={emblaRef}>
        <div className="flex">
          {resimler.map((r, i) => (
            <div
              key={r.id}
              className="relative h-[45vh] min-w-0 flex-[0_0_100%] bg-muted sm:h-[52vh] lg:h-[58vh]"
            >
              <Image
                src={r.url}
                alt={`${baslik} — ${i + 1}`}
                fill
                sizes="(max-width:1024px) 100vw, 60vw"
                className="object-contain"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        {resimler.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              aria-label="Önceki"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Sonraki"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              {secili + 1} / {resimler.length}
            </span>
          </>
        )}
      </div>

      {resimler.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resimler.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => kaydir(i)}
              aria-label={`Görsel ${i + 1}`}
              className={`relative aspect-[4/3] h-16 shrink-0 overflow-hidden rounded border-2 ${
                i === secili ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={r.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
