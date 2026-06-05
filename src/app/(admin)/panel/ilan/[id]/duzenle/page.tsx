import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IlanWizard, type MevcutIlan } from "@/components/admin/ilan-wizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "İlanı Düzenle — KAF Motors" };

export default async function DuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await createClient();

  const { data: arac } = await db.from("araclar").select("*").eq("id", id).maybeSingle();
  if (!arac) notFound();

  const [markalar, modeller, donanimlar, resimler, donanim, ekspertiz] = await Promise.all([
    db.from("markalar").select("*").order("ad"),
    db.from("modeller").select("*").order("ad"),
    db.from("donanim_ozellikleri").select("*").order("id"),
    db
      .from("arac_resimleri")
      .select("id, storage_path, boyut_kb, genislik, yukseklik, sira")
      .eq("arac_id", id)
      .order("sira"),
    db.from("arac_donanimlari").select("donanim_id").eq("arac_id", id),
    db.from("ekspertiz_parcalari").select("parca, durum").eq("arac_id", id),
  ]);

  const mevcut: MevcutIlan = {
    id: arac.id,
    slug: arac.slug,
    baslik: arac.baslik,
    marka_id: arac.marka_id,
    model_id: arac.model_id,
    yil: arac.yil,
    fiyat: arac.fiyat,
    km: arac.km,
    yakit: arac.yakit,
    vites: arac.vites,
    kasa: arac.kasa,
    cekis: arac.cekis,
    renk: arac.renk,
    motor_hacmi: arac.motor_hacmi,
    motor_gucu: arac.motor_gucu,
    durum: arac.durum,
    aciklama_html: arac.aciklama_html,
    donanim_ids: (donanim.data ?? []).map((d) => d.donanim_id),
    ekspertiz: ekspertiz.data ?? [],
    resimler: (resimler.data ?? []).map((r) => ({
      id: r.id,
      path: r.storage_path,
      boyut_kb: r.boyut_kb,
      genislik: r.genislik,
      yukseklik: r.yukseklik,
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">İlanı Düzenle</h1>
      <IlanWizard
        markalar={markalar.data ?? []}
        modeller={modeller.data ?? []}
        donanimlar={donanimlar.data ?? []}
        mevcut={mevcut}
      />
    </div>
  );
}
