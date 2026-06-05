"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/constants";
import type {
  Yakit,
  Vites,
  Kasa,
  Cekis,
  AracDurumu,
  ParcaKodu,
  EkspertizDurumu,
} from "@/types/database";

async function yetkiliMi() {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return !!user;
}

export type IlanResimGiris = {
  id: string;
  storage_path: string;
  sira: number;
  genislik: number | null;
  yukseklik: number | null;
  boyut_kb: number | null;
};

export type IlanGiris = {
  id: string;
  baslik: string;
  slug: string;
  marka_id: number;
  model_id: number;
  yil: number;
  fiyat: number;
  km: number;
  yakit: Yakit;
  vites: Vites;
  kasa: Kasa | null;
  cekis: Cekis | null;
  renk: string | null;
  motor_hacmi: number | null;
  motor_gucu: number | null;
  aciklama_html: string | null;
  durum: "aktif" | "pasif";
  donanim_ids: number[];
  ekspertiz: { parca: ParcaKodu; durum: EkspertizDurumu }[];
  resimler: IlanResimGiris[];
  kapak_resim_id: string | null;
};

export type IlanSonuc = { ok: true; slug: string } | { ok: false; error: string };

export async function ilanOlustur(giris: IlanGiris): Promise<IlanSonuc> {
  // Yetki: yalnız giriş yapmış admin
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Yetkisiz işlem." };

  const db = createAdminClient();

  // 1) Araç satırı (kapak henüz null — resimler eklenince bağlanır)
  const { error: e1 } = await db.from("araclar").insert({
    id: giris.id,
    slug: giris.slug,
    baslik: giris.baslik,
    marka_id: giris.marka_id,
    model_id: giris.model_id,
    yil: giris.yil,
    fiyat: giris.fiyat,
    km: giris.km,
    yakit: giris.yakit,
    vites: giris.vites,
    kasa: giris.kasa,
    cekis: giris.cekis,
    renk: giris.renk,
    motor_hacmi: giris.motor_hacmi,
    motor_gucu: giris.motor_gucu,
    aciklama_html: giris.aciklama_html,
    durum: giris.durum,
  });
  if (e1) {
    return {
      ok: false,
      error: e1.message.includes("araclar_slug")
        ? "Bu başlıkta ilan zaten var, başlığı değiştirin."
        : "İlan kaydedilemedi: " + e1.message,
    };
  }

  // Hata olursa araç satırını sil (cascade ile çocukları da temizlenir)
  const geriAl = async (mesaj: string): Promise<IlanSonuc> => {
    await db.from("araclar").delete().eq("id", giris.id);
    return { ok: false, error: mesaj };
  };

  // 2) Resimler
  if (giris.resimler.length) {
    const { error } = await db.from("arac_resimleri").insert(
      giris.resimler.map((r) => ({
        id: r.id,
        arac_id: giris.id,
        storage_path: r.storage_path,
        sira: r.sira,
        genislik: r.genislik,
        yukseklik: r.yukseklik,
        boyut_kb: r.boyut_kb,
      }))
    );
    if (error) return geriAl("Resim kayıtları eklenemedi: " + error.message);
  }

  // 3) Kapak görseli
  if (giris.kapak_resim_id) {
    await db
      .from("araclar")
      .update({ kapak_resim_id: giris.kapak_resim_id })
      .eq("id", giris.id);
  }

  // 4) Donanımlar
  if (giris.donanim_ids.length) {
    const { error } = await db.from("arac_donanimlari").insert(
      giris.donanim_ids.map((d) => ({ arac_id: giris.id, donanim_id: d }))
    );
    if (error) return geriAl("Donanımlar eklenemedi: " + error.message);
  }

  // 5) Ekspertiz (yalnız belirtilen parçalar)
  const ekspertiz = giris.ekspertiz.filter((e) => e.durum !== "belirtilmemis");
  if (ekspertiz.length) {
    const { error } = await db.from("ekspertiz_parcalari").insert(
      ekspertiz.map((e) => ({
        arac_id: giris.id,
        parca: e.parca,
        durum: e.durum,
      }))
    );
    if (error) return geriAl("Ekspertiz kaydedilemedi: " + error.message);
  }

  // Cache temizliği (caching skill) — Next 16: write-sonrası updateTag
  updateTag("araclar");
  updateTag(`ilan-${giris.slug}`);

  return { ok: true, slug: giris.slug };
}

// ---------------------------------------------------------------------------
// Yönetim: durum değiştir / sil / güncelle
// ---------------------------------------------------------------------------

export async function ilanDurumGuncelle(
  id: string,
  durum: AracDurumu
): Promise<{ ok: boolean }> {
  if (!(await yetkiliMi())) return { ok: false };
  const db = createAdminClient();
  const { data: arac } = await db.from("araclar").select("slug").eq("id", id).maybeSingle();
  const { error } = await db.from("araclar").update({ durum }).eq("id", id);
  if (error) return { ok: false };
  updateTag("araclar");
  if (arac?.slug) updateTag(`ilan-${arac.slug}`);
  return { ok: true };
}

export async function ilanSil(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await yetkiliMi())) return { ok: false, error: "Yetkisiz." };
  const db = createAdminClient();

  const { data: arac } = await db.from("araclar").select("slug").eq("id", id).maybeSingle();
  const { data: resimler } = await db
    .from("arac_resimleri")
    .select("storage_path")
    .eq("arac_id", id);

  const paths = (resimler ?? []).map((r) => r.storage_path);
  if (paths.length) await db.storage.from(BUCKET).remove(paths);

  const { error } = await db.from("araclar").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  updateTag("araclar");
  if (arac?.slug) updateTag(`ilan-${arac.slug}`);
  return { ok: true };
}

export type IlanGuncelleResim = IlanResimGiris & { isNew: boolean };
export type IlanGuncelleGiris = Omit<IlanGiris, "resimler" | "durum"> & {
  durum: AracDurumu;
  resimler: IlanGuncelleResim[];
};

export async function ilanGuncelle(giris: IlanGuncelleGiris): Promise<IlanSonuc> {
  if (!(await yetkiliMi())) return { ok: false, error: "Yetkisiz işlem." };
  const db = createAdminClient();

  // 1) Temel alanlar (slug sabit kalır — URL korunur)
  const { error: e1 } = await db
    .from("araclar")
    .update({
      baslik: giris.baslik,
      marka_id: giris.marka_id,
      model_id: giris.model_id,
      yil: giris.yil,
      fiyat: giris.fiyat,
      km: giris.km,
      yakit: giris.yakit,
      vites: giris.vites,
      kasa: giris.kasa,
      cekis: giris.cekis,
      renk: giris.renk,
      motor_hacmi: giris.motor_hacmi,
      motor_gucu: giris.motor_gucu,
      aciklama_html: giris.aciklama_html,
      durum: giris.durum,
    })
    .eq("id", giris.id);
  if (e1) return { ok: false, error: "Güncellenemedi: " + e1.message };

  // 2) Çıkarılan görselleri Storage + DB'den sil
  const { data: eski } = await db
    .from("arac_resimleri")
    .select("id, storage_path")
    .eq("arac_id", giris.id);
  const kalanIds = new Set(giris.resimler.map((r) => r.id));
  const silinecek = (eski ?? []).filter((r) => !kalanIds.has(r.id));
  if (silinecek.length) {
    await db.storage.from(BUCKET).remove(silinecek.map((r) => r.storage_path));
    await db.from("arac_resimleri").delete().in("id", silinecek.map((r) => r.id));
  }

  // 3) Yeni görselleri ekle
  const yeniler = giris.resimler.filter((r) => r.isNew);
  if (yeniler.length) {
    const { error } = await db.from("arac_resimleri").insert(
      yeniler.map((r) => ({
        id: r.id,
        arac_id: giris.id,
        storage_path: r.storage_path,
        sira: r.sira,
        genislik: r.genislik,
        yukseklik: r.yukseklik,
        boyut_kb: r.boyut_kb,
      }))
    );
    if (error) return { ok: false, error: "Yeni görseller eklenemedi: " + error.message };
  }

  // 4) Kalan görsellerin sırasını güncelle
  for (const r of giris.resimler.filter((r) => !r.isNew)) {
    await db.from("arac_resimleri").update({ sira: r.sira }).eq("id", r.id);
  }

  // 5) Kapak
  await db.from("araclar").update({ kapak_resim_id: giris.kapak_resim_id }).eq("id", giris.id);

  // 6) Donanım (tümünü değiştir)
  await db.from("arac_donanimlari").delete().eq("arac_id", giris.id);
  if (giris.donanim_ids.length) {
    await db.from("arac_donanimlari").insert(
      giris.donanim_ids.map((d) => ({ arac_id: giris.id, donanim_id: d }))
    );
  }

  // 7) Ekspertiz (tümünü değiştir)
  await db.from("ekspertiz_parcalari").delete().eq("arac_id", giris.id);
  const eks = giris.ekspertiz.filter((e) => e.durum !== "belirtilmemis");
  if (eks.length) {
    await db.from("ekspertiz_parcalari").insert(
      eks.map((e) => ({ arac_id: giris.id, parca: e.parca, durum: e.durum }))
    );
  }

  updateTag("araclar");
  updateTag(`ilan-${giris.slug}`);
  return { ok: true, slug: giris.slug };
}
