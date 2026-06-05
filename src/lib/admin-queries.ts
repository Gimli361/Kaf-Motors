import { createClient } from "@/lib/supabase/server";
import type { AracDurumu } from "@/types/database";
import type { PanelIlan } from "@/components/admin/ilan-tablosu";

type RawPanel = {
  id: string;
  slug: string;
  baslik: string;
  fiyat: number;
  durum: AracDurumu;
  markalar: { ad: string } | null;
  modeller: { ad: string } | null;
  kapak: { storage_path: string } | null;
  resimler: { count: number }[];
};

// Admin paneli — TÜM durumlardaki ilanlar (RLS admin politikası tümünü döndürür).
export async function getPanelIlanlar(): Promise<PanelIlan[]> {
  const db = await createClient();
  const { data } = await db
    .from("araclar")
    .select(
      "id, slug, baslik, fiyat, durum, markalar(ad), modeller(ad), kapak:arac_resimleri!fk_kapak_resim(storage_path), resimler:arac_resimleri!arac_resimleri_arac_id_fkey(count)"
    )
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as RawPanel[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    baslik: r.baslik,
    fiyat: r.fiyat,
    durum: r.durum,
    marka: r.markalar?.ad ?? "",
    model: r.modeller?.ad ?? "",
    kapakPath: r.kapak?.storage_path ?? null,
    resimSayisi: r.resimler?.[0]?.count ?? 0,
  }));
}

// Storage kullanımı (boyut_kb toplamı + görsel adedi).
export async function getStorageKullanim(): Promise<{ toplamKb: number; adet: number }> {
  const db = await createClient();
  const { data } = await db.from("arac_resimleri").select("boyut_kb");
  const rows = data ?? [];
  const toplamKb = rows.reduce((t, r) => t + (r.boyut_kb ?? 0), 0);
  return { toplamKb, adet: rows.length };
}
