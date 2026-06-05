"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { resimSikistir } from "@/lib/image/compress";

export type YukluResim = {
  id: string;
  previewUrl: string;
  boyutKb: number;
  genislik: number;
  yukseklik: number;
  blob?: Blob; // yeni eklenen görselde var
  path?: string; // mevcut (zaten yüklü) görselde storage path
  mevcut?: boolean;
};

type Props = {
  resimler: YukluResim[];
  onChange: (r: YukluResim[]) => void;
};

export function ResimYukleyici({ resimler, onChange }: Props) {
  const [isleniyor, setIsleniyor] = useState(false);

  const onDrop = useCallback(
    async (dosyalar: File[]) => {
      if (!dosyalar.length) return;
      setIsleniyor(true);
      try {
        const yeniler: YukluResim[] = [];
        for (const dosya of dosyalar) {
          try {
            const s = await resimSikistir(dosya);
            yeniler.push({
              id: crypto.randomUUID(),
              blob: s.blob,
              previewUrl: URL.createObjectURL(s.blob),
              boyutKb: s.boyutKb,
              genislik: s.genislik,
              yukseklik: s.yukseklik,
            });
          } catch {
            toast.error(`"${dosya.name}" işlenemedi, atlandı.`);
          }
        }
        if (yeniler.length) onChange([...resimler, ...yeniler]);
      } finally {
        setIsleniyor(false);
      }
    },
    [resimler, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isleniyor,
  });

  const sil = (id: string) => {
    const hedef = resimler.find((r) => r.id === id);
    // Yalnız yeni (blob) görsellerde object URL var; mevcut görsel public URL — revoke etme.
    if (hedef && !hedef.mevcut) URL.revokeObjectURL(hedef.previewUrl);
    onChange(resimler.filter((r) => r.id !== id));
  };

  const tasi = (index: number, yon: -1 | 1) => {
    const yeni = [...resimler];
    const hedef = index + yon;
    if (hedef < 0 || hedef >= yeni.length) return;
    [yeni[index], yeni[hedef]] = [yeni[hedef], yeni[index]];
    onChange(yeni);
  };

  const kapakYap = (index: number) => {
    if (index === 0) return;
    const yeni = [...resimler];
    const [secilen] = yeni.splice(index, 1);
    yeni.unshift(secilen);
    onChange(yeni);
  };

  const toplamKb = resimler.reduce((t, r) => t + r.boyutKb, 0);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
      >
        <input {...getInputProps()} />
        {isleniyor ? (
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="size-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {isleniyor
            ? "Görseller sıkıştırılıyor…"
            : "Görselleri sürükle bırak veya tıkla"}
        </p>
        <p className="text-xs text-muted-foreground">
          Otomatik olarak ~200 KB WebP&apos;e sıkıştırılır. İlk görsel kapaktır.
        </p>
      </div>

      {resimler.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {resimler.length} görsel · toplam ~{toplamKb} KB
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {resimler.map((r, i) => (
              <div
                key={r.id}
                className="group relative overflow-hidden rounded-lg border"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={r.previewUrl}
                    alt={`Görsel ${i + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Kapak
                  </span>
                )}
                <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  {r.boyutKb} KB
                </span>

                <div className="flex items-center justify-between gap-1 p-1.5">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => tasi(i, -1)}
                      disabled={i === 0}
                      className="rounded p-1 hover:bg-accent disabled:opacity-30"
                      aria-label="Sola taşı"
                    >
                      <ArrowLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => tasi(i, 1)}
                      disabled={i === resimler.length - 1}
                      className="rounded p-1 hover:bg-accent disabled:opacity-30"
                      aria-label="Sağa taşı"
                    >
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => kapakYap(i)}
                      disabled={i === 0}
                      className="rounded p-1 hover:bg-accent disabled:opacity-30"
                      aria-label="Kapak yap"
                    >
                      <Star className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => sil(r.id)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                      aria-label="Sil"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
