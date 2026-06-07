"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

export function Galeri({
  resimler,
  baslik,
}: {
  resimler: { id: string; url: string }[];
  baslik: string;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: resimler.length > 1 });
  const [secili, setSecili] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
              onClick={() => setLightboxIndex(i)}
              className="relative h-[45vh] min-w-0 flex-[0_0_100%] bg-muted sm:h-[52vh] lg:h-[58vh] cursor-zoom-in group/item transition-colors duration-200 hover:bg-muted/90"
            >
              <Image
                src={r.url}
                alt={`${baslik} — ${i + 1}`}
                fill
                sizes="(max-width:1024px) 100vw, 60vw"
                quality={90}
                className="object-contain transition-transform duration-500 group-hover/item:scale-[1.01]"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-xs rounded-full p-3.5 text-white scale-90 group-hover/item:scale-100 transition-all duration-300 shadow-lg">
                  <Maximize2 className="size-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {resimler.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              aria-label="Önceki"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors z-10 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Sonraki"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors z-10 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white font-medium">
              {secili + 1} / {resimler.length}
            </span>
          </>
        )}
      </div>

      {resimler.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted">
          {resimler.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => kaydir(i)}
              aria-label={`Görsel ${i + 1}`}
              className={`relative aspect-[4/3] h-16 shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === secili ? "border-primary scale-[0.98]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={r.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          resimler={resimler}
          baslik={baslik}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

interface LightboxProps {
  resimler: { id: string; url: string }[];
  baslik: string;
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ resimler, baslik, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // Swipe gesture variables
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const nextImage = useCallback(() => {
    setIndex((prev) => (prev + 1) % resimler.length);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [resimler.length]);

  const prevImage = useCallback(() => {
    setIndex((prev) => (prev - 1 + resimler.length) % resimler.length);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [resimler.length]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, nextImage, prevImage, zoomIn, zoomOut]);

  const handleStart = (clientX: number, clientY: number) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: clientX, y: clientY };
      dragStartOffset.current = offset;
    } else {
      touchStartX.current = clientX;
      touchStartY.current = clientY;
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (scale > 1 && isDragging) {
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      
      const newX = dragStartOffset.current.x + dx;
      const newY = dragStartOffset.current.y + dy;
      
      // Calculate sensible boundaries based on scale
      const maxOffset = (scale - 1) * 300;
      setOffset({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    }
  };

  const handleEnd = (clientX?: number, clientY?: number) => {
    if (isDragging) {
      setIsDragging(false);
    } else if (scale === 1 && touchStartX.current !== null && clientX !== undefined) {
      const diffX = clientX - touchStartX.current;
      const diffY = clientY !== undefined && touchStartY.current !== null ? clientY - touchStartY.current : 0;
      
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          prevImage();
        } else {
          nextImage();
        }
      }
      touchStartX.current = null;
      touchStartY.current = null;
    }
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
      setOffset({ x: 0, y: 0 });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none transition-all duration-300 animate-in fade-in-0">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-10">
        <span className="text-sm font-semibold tracking-wide truncate max-w-[70%] drop-shadow-xs">
          {baslik}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
          aria-label="Kapat"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Navigation Buttons (Desktop) */}
      {resimler.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3.5 bg-black/55 border border-white/10 text-white hover:bg-black/80 transition-all z-10 md:block hidden hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Önceki Görsel"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3.5 bg-black/55 border border-white/10 text-white hover:bg-black/80 transition-all z-10 md:block hidden hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Sonraki Görsel"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden"
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={(e) => handleEnd(e.clientX)}
        onMouseLeave={() => handleEnd()}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={(e) => {
          if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            handleEnd(touch.clientX, touch.clientY);
          } else {
            handleEnd();
          }
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="relative max-h-[80vh] max-w-[95vw] w-full h-full flex items-center justify-center transition-transform select-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
        >
          <Image
            src={resimler[index].url}
            alt={`${baslik} — ${index + 1}`}
            fill
            sizes="100vw"
            quality={90}
            className="object-contain pointer-events-none"
            priority
          />
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-6 flex flex-col items-center gap-3 z-10">
        {resimler.length > 1 && (
          <span className="text-xs text-white/70 font-semibold tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/5">
            {index + 1} / {resimler.length}
          </span>
        )}
        
        <div className="flex items-center gap-4 bg-black/75 border border-white/10 backdrop-blur-md rounded-full px-5 py-2.5 text-white shadow-xl">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className="p-1.5 hover:bg-white/15 rounded-full disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Uzaklaştır (-)"
          >
            <ZoomOut className="size-4.5" />
          </button>
          
          <button
            type="button"
            onClick={resetZoom}
            className="text-xs font-bold px-2.5 py-0.5 hover:bg-white/15 rounded transition-all min-w-[50px] text-center cursor-pointer"
            title="Sıfırla"
          >
            {Math.round(scale * 100)}%
          </button>
          
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-1.5 hover:bg-white/15 rounded-full disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Yakınlaştır (+)"
          >
            <ZoomIn className="size-4.5" />
          </button>

          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="p-1.5 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition-all border-l border-white/10 pl-3.5 cursor-pointer animate-in fade-in-0"
              title="Konumu Sıfırla"
            >
              <RotateCcw className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
