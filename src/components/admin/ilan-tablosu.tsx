"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AracDurumu } from "@/types/database";
import { ilanDurumGuncelle, ilanSil } from "@/actions/ilan";
import { fiyatFormat, gorselUrl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PanelIlan = {
  id: string;
  slug: string;
  baslik: string;
  fiyat: number;
  durum: AracDurumu;
  marka: string;
  model: string;
  kapakPath: string | null;
  resimSayisi: number;
};

const DURUMLAR: { value: AracDurumu; label: string }[] = [
  { value: "aktif", label: "Aktif" },
  { value: "pasif", label: "Pasif" },
  { value: "satildi", label: "Satıldı" },
];

export function IlanTablosu({ ilanlar }: { ilanlar: PanelIlan[] }) {
  const router = useRouter();
  const [silinecek, setSilinecek] = useState<PanelIlan | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);

  const durumDegistir = async (id: string, durum: AracDurumu) => {
    const r = await ilanDurumGuncelle(id, durum);
    if (r.ok) {
      toast.success("Durum güncellendi.");
      router.refresh();
    } else {
      toast.error("Durum güncellenemedi.");
    }
  };

  const sil = async () => {
    if (!silinecek) return;
    setSiliniyor(true);
    const r = await ilanSil(silinecek.id);
    setSiliniyor(false);
    if (r.ok) {
      toast.success("İlan silindi.");
      setSilinecek(null);
      router.refresh();
    } else {
      toast.error(r.error ?? "Silinemedi.");
    }
  };

  if (!ilanlar.length) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Henüz ilan yok. &quot;Yeni İlan&quot; ile ekleyin.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">İlan</th>
              <th className="p-3 font-medium">Fiyat</th>
              <th className="p-3 font-medium">Durum</th>
              <th className="p-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {ilanlar.map((i) => {
              const url = gorselUrl(i.kapakPath);
              return (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-[4/3] h-12 w-16 shrink-0 overflow-hidden rounded bg-muted">
                        {url && (
                          <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium">{i.baslik}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.marka} {i.model} · {i.resimSayisi} görsel
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium whitespace-nowrap">{fiyatFormat(i.fiyat)}</td>
                  <td className="p-3">
                    <Select
                      value={i.durum}
                      onValueChange={(v) => durumDegistir(i.id, v as AracDurumu)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue>
                          {(v) => DURUMLAR.find((d) => d.value === v)?.label ?? "—"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {DURUMLAR.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/panel/ilan/${i.id}/duzenle`} />}
                      >
                        <Pencil className="size-3.5" /> Düzenle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        aria-label="Sil"
                        onClick={() => setSilinecek(i)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!silinecek} onOpenChange={(o) => !o && setSilinecek(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İlanı sil?</DialogTitle>
            <DialogDescription>
              &quot;{silinecek?.baslik}&quot; kalıcı olarak silinecek; görselleri de
              Storage&apos;dan kaldırılacak. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSilinecek(null)} disabled={siliniyor}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={sil} disabled={siliniyor}>
              {siliniyor ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Siliniyor…
                </>
              ) : (
                "Evet, sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
