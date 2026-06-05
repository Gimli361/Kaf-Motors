"use client";

import { useId, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

export type SecenekOge = { id: number; ad: string };

type Props = {
  secenekler: SecenekOge[];
  deger: number | null;
  placeholder: string;
  disabled?: boolean;
  hata?: boolean;
  onSecim: (id: number) => void;
  onYeni?: (ad: string) => Promise<void>;
};

export function EklenebilirSecim({
  secenekler,
  deger,
  placeholder,
  disabled,
  hata,
  onSecim,
  onYeni,
}: Props) {
  const listeId = useId();
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState("");
  const [ekleniyor, setEkleniyor] = useState(false);

  const secili = secenekler.find((s) => s.id === deger);
  const q = arama.trim().toLowerCase();
  const filtreli = q
    ? secenekler.filter((s) => s.ad.toLowerCase().includes(q))
    : secenekler;
  const tamEslesme = secenekler.some((s) => s.ad.toLowerCase() === q);
  const ekleGoster = !!onYeni && arama.trim().length >= 1 && !tamEslesme;

  const kapat = () => {
    setAcik(false);
    setArama("");
  };

  const yeniEkle = async () => {
    if (!onYeni) return;
    setEkleniyor(true);
    await onYeni(arama.trim());
    setEkleniyor(false);
    kapat();
  };

  return (
    <div className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={acik}
        aria-controls={listeId}
        aria-invalid={hata}
        disabled={disabled}
        onClick={() => setAcik((o) => !o)}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
      >
        <span className={secili ? "" : "text-muted-foreground"}>
          {secili?.ad ?? placeholder}
        </span>
        <ChevronsUpDown className="size-4 opacity-50" />
      </button>

      {acik && (
        <>
          <div className="fixed inset-0 z-40" onClick={kapat} aria-hidden />
          <div
            id={listeId}
            className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <input
              autoFocus
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Ara veya yeni ekle…"
              className="mb-1 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            <div className="max-h-56 overflow-auto">
              {filtreli.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onSecim(s.id);
                    kapat();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {s.ad}
                  {s.id === deger && <Check className="size-4" />}
                </button>
              ))}
              {!filtreli.length && !ekleGoster && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  Sonuç yok
                </p>
              )}
            </div>

            {ekleGoster && (
              <button
                type="button"
                disabled={ekleniyor}
                onClick={yeniEkle}
                className="mt-1 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-primary hover:bg-accent disabled:opacity-50"
              >
                {ekleniyor ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                &quot;{arama.trim()}&quot; ekle
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
