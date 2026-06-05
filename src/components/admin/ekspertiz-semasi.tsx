"use client";

import type { ParcaKodu, EkspertizDurumu } from "@/types/database";
import {
  EKSPERTIZ_PARCALAR,
  EKSPERTIZ_DURUMLARI,
  ekspertizRenk,
  bosEkspertiz,
  type EkspertizDeger,
} from "@/lib/constants";

const DONGU: EkspertizDurumu[] = [
  "belirtilmemis",
  "orijinal",
  "lokal_boyali",
  "boyali",
  "degisen",
];

function sonraki(durum: EkspertizDurumu): EkspertizDurumu {
  const i = DONGU.indexOf(durum);
  return DONGU[(i + 1) % DONGU.length];
}



type Props = {
  deger: EkspertizDeger;
  onChange?: (deger: EkspertizDeger) => void;
  readonly?: boolean;
};

export function EkspertizSemasi({ deger, onChange, readonly }: Props) {
  const tikla = (kod: ParcaKodu) => {
    if (readonly || !onChange) return;
    onChange({ ...deger, [kod]: sonraki(deger[kod] ?? "belirtilmemis") });
  };

  const hepsi = (durum: EkspertizDurumu) => {
    if (!onChange) return;
    const yeni = {} as EkspertizDeger;
    for (const p of EKSPERTIZ_PARCALAR) yeni[p.kod] = durum;
    onChange(yeni);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <svg
        viewBox="0 0 240 420"
        className="mx-auto w-full max-w-[260px] select-none"
        role="img"
        aria-label="Ekspertiz şeması"
      >
        {EKSPERTIZ_PARCALAR.map((p) => {
          const durum = deger[p.kod] ?? "belirtilmemis";
          const renk = ekspertizRenk(durum);
          const cx = p.x + p.w / 2;
          const cy = p.y + p.h / 2;
          return (
            <g
              key={p.kod}
              onClick={() => tikla(p.kod)}
              className={readonly ? "" : "cursor-pointer"}
              role={readonly ? undefined : "button"}
              aria-label={`${p.ad}: ${renk.label}`}
            >
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={6}
                fill={renk.dolgu}
                stroke={renk.kenar}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={p.satirlar.length > 1 ? cy - 3 : cy + 3}
                textAnchor="middle"
                fontSize="9"
                fill="#334155"
                pointerEvents="none"
              >
                {p.satirlar.map((s, i) => (
                  <tspan key={i} x={cx} dy={i === 0 ? 0 : 11}>
                    {s}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="space-y-3">
        <ul className="space-y-1.5">
          {EKSPERTIZ_DURUMLARI.map((d) => (
            <li key={d.value} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block size-4 rounded border"
                style={{ background: d.dolgu, borderColor: d.kenar }}
              />
              {d.label}
            </li>
          ))}
        </ul>

        {!readonly && (
          <div className="flex flex-col gap-2 text-xs">
            <p className="text-muted-foreground">
              Parçaya tıkladıkça durum değişir.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => hepsi("orijinal")}
                className="rounded border px-2 py-1 hover:bg-accent"
              >
                Tümü Orijinal
              </button>
              <button
                type="button"
                onClick={() => hepsi("belirtilmemis")}
                className="rounded border px-2 py-1 hover:bg-accent"
              >
                Temizle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



