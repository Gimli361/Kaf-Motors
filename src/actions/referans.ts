"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugUret } from "@/lib/format";

export type MarkaSonuc =
  | { ok: true; marka: { id: number; ad: string } }
  | { ok: false; error: string };
export type ModelSonuc =
  | { ok: true; model: { id: number; ad: string } }
  | { ok: false; error: string };

async function yetkili() {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return !!user;
}

// Marka bul ya da oluştur (kullanıcı serbest girdiğinde).
export async function markaEkle(adGiris: string): Promise<MarkaSonuc> {
  const ad = adGiris.trim();
  if (ad.length < 2) return { ok: false, error: "Geçersiz marka adı." };
  if (!(await yetkili())) return { ok: false, error: "Yetkisiz işlem." };

  const db = createAdminClient();

  // Zaten var mı? (büyük/küçük harf duyarsız)
  const { data: mevcut } = await db
    .from("markalar")
    .select("id, ad")
    .ilike("ad", ad)
    .maybeSingle();
  if (mevcut) return { ok: true, marka: mevcut };

  const slug = slugUret(ad) || `marka-${ad.length}`;
  const { data, error } = await db
    .from("markalar")
    .insert({ ad, slug })
    .select("id, ad")
    .single();

  if (error) {
    // Olası slug çakışması — sonek ekleyip tekrar dene
    const { data: d2, error: e2 } = await db
      .from("markalar")
      .insert({ ad, slug: `${slug}-${ad.length}${ad.charCodeAt(0)}` })
      .select("id, ad")
      .single();
    if (e2 || !d2) return { ok: false, error: "Marka eklenemedi." };
    return { ok: true, marka: d2 };
  }
  return { ok: true, marka: data };
}

// Model bul ya da oluştur (seçili markaya bağlı).
export async function modelEkle(
  markaId: number,
  adGiris: string
): Promise<ModelSonuc> {
  const ad = adGiris.trim();
  if (!markaId) return { ok: false, error: "Önce marka seçin." };
  if (ad.length < 1) return { ok: false, error: "Geçersiz model adı." };
  if (!(await yetkili())) return { ok: false, error: "Yetkisiz işlem." };

  const db = createAdminClient();

  const { data: mevcut } = await db
    .from("modeller")
    .select("id, ad")
    .eq("marka_id", markaId)
    .ilike("ad", ad)
    .maybeSingle();
  if (mevcut) return { ok: true, model: mevcut };

  const slug = slugUret(ad) || `model-${ad.length}`;
  const { data, error } = await db
    .from("modeller")
    .insert({ marka_id: markaId, ad, slug })
    .select("id, ad")
    .single();

  if (error || !data) return { ok: false, error: "Model eklenemedi." };
  return { ok: true, model: data };
}
