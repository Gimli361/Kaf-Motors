"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { IlanKart } from "@/lib/queries";
import { AracKart } from "./arac-kart";

export function SonucListesi({ ilanlar }: { ilanlar: IlanKart[] }) {
  const [liste, setListe] = useState(false);

  const dugme = (aktif: boolean, onClick: () => void, etiket: string, ikon: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiket}
      aria-pressed={aktif}
      className={`rounded-md border p-1.5 ${aktif ? "bg-accent" : "hover:bg-accent"}`}
    >
      {ikon}
    </button>
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{ilanlar.length} ilan bulundu</p>
        <div className="flex gap-1">
          {dugme(!liste, () => setListe(false), "Izgara görünüm", <LayoutGrid className="size-4" />)}
          {dugme(liste, () => setListe(true), "Liste görünüm", <List className="size-4" />)}
        </div>
      </div>

      {ilanlar.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Aramanıza uygun ilan bulunamadı.
        </p>
      ) : liste ? (
        <div className="space-y-3">
          {ilanlar.map((i) => (
            <AracKart key={i.id} ilan={i} genis />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {ilanlar.map((i) => (
            <AracKart key={i.id} ilan={i} />
          ))}
        </div>
      )}
    </>
  );
}
