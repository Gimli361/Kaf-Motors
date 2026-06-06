import Link from "next/link";
import { CheckCircle2, PauseCircle, Tag, PlusCircle, HardDrive } from "lucide-react";
import { getPanelIlanlar, getStorageKullanim } from "@/lib/admin-queries";
import { IlanTablosu } from "@/components/admin/ilan-tablosu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [ilanlar, depo] = await Promise.all([getPanelIlanlar(), getStorageKullanim()]);

  const aktif = ilanlar.filter((i) => i.durum === "aktif").length;
  const pasif = ilanlar.filter((i) => i.durum === "pasif").length;
  const satildi = ilanlar.filter((i) => i.durum === "satildi").length;

  const kullanilanMb = depo.toplamKb / 1024;
  const limitMb = 1024; // 1 GB
  const yuzde = Math.min(100, Math.round((kullanilanMb / limitMb) * 100));
  const ortalamaIlanMb = 2.2; // ~12 foto × ~180 KB
  const kalanIlan = Math.max(0, Math.floor((limitMb - kullanilanMb) / ortalamaIlanMb));

  const kartlar = [
    { baslik: "Aktif İlanlar", deger: aktif, icon: CheckCircle2, renk: "text-green-600" },
    { baslik: "Pasif İlanlar", deger: pasif, icon: PauseCircle, renk: "text-amber-600" },
    { baslik: "Satılan", deger: satildi, icon: Tag, renk: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Panel</h1>
        <Button nativeButton={false} render={<Link href="/panel/ilan/yeni" />}>
          <PlusCircle className="size-4" /> Yeni İlan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartlar.map((k) => (
          <Card key={k.baslik}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.baslik}
              </CardTitle>
              <k.icon className={`size-5 ${k.renk}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{k.deger}</p>
            </CardContent>
          </Card>
        ))}

        {/* Storage kullanımı */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Kullanımı
            </CardTitle>
            <HardDrive className="size-5 text-violet-600" />
          </CardHeader>
          <CardContent className="space-y-1.5">
            <p className="text-2xl font-bold">{kullanilanMb.toFixed(1)} MB</p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${yuzde > 85 ? "bg-destructive" : "bg-violet-600"}`}
                style={{ width: `${yuzde}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {yuzde}% / 1 GB · {depo.adet} görsel · ~{kalanIlan} ilan kapasitesi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">İlanlar</h2>
        <IlanTablosu ilanlar={ilanlar} />
      </div>
    </div>
  );
}
