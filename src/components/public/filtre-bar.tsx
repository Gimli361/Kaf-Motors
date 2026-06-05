"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { EklenebilirSecim } from "@/components/admin/eklenebilir-secim";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YAKIT_OPSIYONLARI, VITES_OPSIYONLARI } from "@/lib/constants";

type Marka = { id: number; ad: string };
type Model = { id: number; marka_id: number; ad: string };

export function FiltreBar({
  markalar,
  modeller,
  mevcut,
}: {
  markalar: Marka[];
  modeller: Model[];
  mevcut: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [mobilAcik, setMobilAcik] = useState(false);
  const [marka, setMarka] = useState<number | null>(mevcut.marka ? Number(mevcut.marka) : null);
  const [model, setModel] = useState<number | null>(mevcut.model ? Number(mevcut.model) : null);
  const [yilMin, setYilMin] = useState(mevcut.yil_min ?? "");
  const [yilMax, setYilMax] = useState(mevcut.yil_max ?? "");
  const [fiyatMin, setFiyatMin] = useState(mevcut.fiyat_min ?? "");
  const [fiyatMax, setFiyatMax] = useState(mevcut.fiyat_max ?? "");
  const [yakit, setYakit] = useState(mevcut.yakit ?? "");
  const [vites, setVites] = useState(mevcut.vites ?? "");

  const markaOps = [{ id: 0, ad: "Tüm Markalar" }, ...markalar];
  const modelOps = [
    { id: 0, ad: "Tüm Modeller" },
    ...modeller.filter((m) => m.marka_id === marka).map((m) => ({ id: m.id, ad: m.ad })),
  ];

  const aktifFiltreSayisi = [
    marka,
    model,
    yilMin,
    yilMax,
    fiyatMin,
    fiyatMax,
    yakit,
    vites,
  ].filter(Boolean).length;

  const uygula = () => {
    const p = new URLSearchParams();
    if (marka) p.set("marka", String(marka));
    if (model) p.set("model", String(model));
    if (yilMin) p.set("yil_min", String(yilMin));
    if (yilMax) p.set("yil_max", String(yilMax));
    if (fiyatMin) p.set("fiyat_min", String(fiyatMin));
    if (fiyatMax) p.set("fiyat_max", String(fiyatMax));
    if (yakit) p.set("yakit", yakit);
    if (vites) p.set("vites", vites);
    if (mevcut.sirala) p.set("sirala", mevcut.sirala);
    router.push(`/ilanlar?${p.toString()}`);
  };

  const temizle = () => router.push("/ilanlar");

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      {/* Mobil toggle başlığı */}
      <div className="flex items-center justify-between sm:hidden mb-4 border-b pb-3 border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Filtreler</span>
          {aktifFiltreSayisi > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {aktifFiltreSayisi}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobilAcik(!mobilAcik)}
          className="text-xs font-semibold h-8"
        >
          {mobilAcik ? "Gizle" : "Filtreleri Göster"}
        </Button>
      </div>

      <div className={`${mobilAcik ? "grid" : "hidden sm:grid"} gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
        <div className="grid gap-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Marka</Label>
          <EklenebilirSecim
            secenekler={markaOps}
            deger={marka}
            placeholder="Tüm Markalar"
            onSecim={(id) => {
              setMarka(id === 0 ? null : id);
              setModel(null);
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Model</Label>
          <EklenebilirSecim
            secenekler={modelOps}
            deger={model}
            placeholder={marka ? "Tüm Modeller" : "Önce marka seçin"}
            disabled={!marka}
            onSecim={(id) => setModel(id === 0 ? null : id)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Yıl</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="En az"
              value={yilMin}
              onChange={(e) => setYilMin(e.target.value)}
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="number"
              placeholder="En çok"
              value={yilMax}
              onChange={(e) => setYilMax(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Fiyat (₺)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="En az"
              value={fiyatMin}
              onChange={(e) => setFiyatMin(e.target.value)}
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="number"
              placeholder="En çok"
              value={fiyatMax}
              onChange={(e) => setFiyatMax(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Yakıt</Label>
          <Select
            value={yakit || null}
            onValueChange={(v) => setYakit(v === "__all" ? "" : String(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tümü">
                {(v) =>
                  v === "__all"
                    ? "Tümü"
                    : YAKIT_OPSIYONLARI.find((y) => y.value === v)?.label ?? "Tümü"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tümü</SelectItem>
              {YAKIT_OPSIYONLARI.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Vites</Label>
          <Select
            value={vites || null}
            onValueChange={(v) => setVites(v === "__all" ? "" : String(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tümü">
                {(v) =>
                  v === "__all"
                    ? "Tümü"
                    : VITES_OPSIYONLARI.find((x) => x.value === v)?.label ?? "Tümü"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tümü</SelectItem>
              {VITES_OPSIYONLARI.map((x) => (
                <SelectItem key={x.value} value={x.value}>
                  {x.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2">
          <Button onClick={uygula} className="flex-1 shadow-sm transition-transform active:scale-[0.98]">
            <Search className="size-4" /> Filtrele
          </Button>
          <Button variant="outline" onClick={temizle} className="transition-transform active:scale-[0.98]">
            <X className="size-4" /> Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}
