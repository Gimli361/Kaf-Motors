"use client";

import { useMemo } from "react";
import type { Donanim } from "@/types/database";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  donanimlar: Donanim[];
  secili: number[];
  onChange: (ids: number[]) => void;
};

export function DonanimSecici({ donanimlar, secili, onChange }: Props) {
  const gruplar = useMemo(() => {
    const m = new Map<string, Donanim[]>();
    for (const d of donanimlar) {
      const arr = m.get(d.kategori) ?? [];
      arr.push(d);
      m.set(d.kategori, arr);
    }
    return Array.from(m.entries());
  }, [donanimlar]);

  const secdir = new Set(secili);
  const degistir = (id: number, isaretli: boolean) => {
    const yeni = new Set(secdir);
    if (isaretli) yeni.add(id);
    else yeni.delete(id);
    onChange(Array.from(yeni));
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {gruplar.map(([kategori, liste]) => (
        <div key={kategori} className="space-y-2">
          <h3 className="text-sm font-semibold">{kategori}</h3>
          <div className="space-y-2">
            {liste.map((d) => (
              <label
                key={d.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={secdir.has(d.id)}
                  onCheckedChange={(c) => degistir(d.id, c === true)}
                />
                {d.ad}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
