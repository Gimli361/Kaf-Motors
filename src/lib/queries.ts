import { cacheTag, cacheLife } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Yakit,
  Vites,
  Kasa,
  Cekis,
  AracDurumu,
  ParcaKodu,
  EkspertizDurumu,
} from "@/types/database";

export type IlanKart = {
  id: string;
  slug: string;
  baslik: string;
  fiyat: number;
  km: number;
  yil: number;
  yakit: Yakit;
  vites: Vites;
  marka: string;
  markaLogo: string | null;
  model: string;
  kapakPath: string | null;
};

export type Filtre = {
  marka?: number;
  model?: number;
  yilMin?: number;
  yilMax?: number;
  fiyatMin?: number;
  fiyatMax?: number;
  yakit?: Yakit;
  vites?: Vites;
  sirala?: "yeni" | "fiyat_artan" | "fiyat_azalan" | "km_artan";
};

const KART_SELECT =
  "id, slug, baslik, fiyat, km, yil, yakit, vites, markalar(ad, logo_url), modeller(ad), kapak:arac_resimleri!fk_kapak_resim(storage_path)";

type RawKart = {
  id: string;
  slug: string;
  baslik: string;
  fiyat: number;
  km: number;
  yil: number;
  yakit: Yakit;
  vites: Vites;
  markalar: { ad: string; logo_url: string | null } | null;
  modeller: { ad: string } | null;
  kapak: { storage_path: string } | null;
};

function karta(r: RawKart): IlanKart {
  return {
    id: r.id,
    slug: r.slug,
    baslik: r.baslik,
    fiyat: r.fiyat,
    km: r.km,
    yil: r.yil,
    yakit: r.yakit,
    vites: r.vites,
    marka: r.markalar?.ad ?? "",
    markaLogo: r.markalar?.logo_url ?? null,
    model: r.modeller?.ad ?? "",
    kapakPath: r.kapak?.storage_path ?? null,
  };
}

// Anasayfa — en yeni aktif ilanlar
export async function getOneCikanlar(limit = 8): Promise<IlanKart[]> {
  "use cache";
  cacheTag("araclar");
  cacheLife("hours");

  const db = createPublicClient();
  const { data } = await db
    .from("araclar")
    .select(KART_SELECT)
    .eq("durum", "aktif")
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as RawKart[]).map(karta);
}

// Listeleme + filtreleme
export async function getIlanlar(filtre: Filtre): Promise<IlanKart[]> {
  "use cache";
  cacheTag("araclar");
  cacheLife("minutes");

  const db = createPublicClient();
  let q = db.from("araclar").select(KART_SELECT).eq("durum", "aktif");

  if (filtre.marka) q = q.eq("marka_id", filtre.marka);
  if (filtre.model) q = q.eq("model_id", filtre.model);
  if (filtre.yilMin) q = q.gte("yil", filtre.yilMin);
  if (filtre.yilMax) q = q.lte("yil", filtre.yilMax);
  if (filtre.fiyatMin) q = q.gte("fiyat", filtre.fiyatMin);
  if (filtre.fiyatMax) q = q.lte("fiyat", filtre.fiyatMax);
  if (filtre.yakit) q = q.eq("yakit", filtre.yakit);
  if (filtre.vites) q = q.eq("vites", filtre.vites);

  switch (filtre.sirala) {
    case "fiyat_artan":
      q = q.order("fiyat", { ascending: true });
      break;
    case "fiyat_azalan":
      q = q.order("fiyat", { ascending: false });
      break;
    case "km_artan":
      q = q.order("km", { ascending: true });
      break;
    default:
      q = q.order("created_at", { ascending: false });
  }

  const { data } = await q.limit(60);
  return ((data ?? []) as unknown as RawKart[]).map(karta);
}

// Filtre dropdown'ları için referans (nadiren değişir)
export async function getFiltreReferans() {
  "use cache";
  cacheTag("referans");
  cacheLife("days");

  const db = createPublicClient();
  const [markalar, modeller] = await Promise.all([
    db.from("markalar").select("id, ad").order("ad"),
    db.from("modeller").select("id, marka_id, ad").order("ad"),
  ]);
  return {
    markalar: markalar.data ?? [],
    modeller: modeller.data ?? [],
  };
}

export type IlanDetay = {
  id: string;
  slug: string;
  baslik: string;
  fiyat: number;
  km: number;
  yil: number;
  yakit: Yakit;
  vites: Vites;
  kasa: Kasa | null;
  cekis: Cekis | null;
  renk: string | null;
  motorHacmi: number | null;
  motorGucu: number | null;
  durum: AracDurumu;
  aciklamaHtml: string | null;
  marka: string;
  model: string;
  resimler: { id: string; path: string }[];
  donanim: { kategori: string; ad: string }[];
  ekspertiz: { parca: ParcaKodu; durum: EkspertizDurumu }[];
};

// İlan detayı (tüm ilişkili veriyle)
export async function getIlanDetay(slug: string): Promise<IlanDetay | null> {
  "use cache";
  cacheTag(`ilan-${slug}`);
  cacheTag("araclar");
  cacheLife("hours");

  const db = createPublicClient();
  const { data: arac } = await db
    .from("araclar")
    .select("*, markalar(ad), modeller(ad)")
    .eq("slug", slug)
    .eq("durum", "aktif")
    .maybeSingle();

  if (!arac) return null;
  const a = arac as unknown as Record<string, unknown> & {
    markalar: { ad: string } | null;
    modeller: { ad: string } | null;
  };

  const [resimler, donanim, ekspertiz] = await Promise.all([
    db.from("arac_resimleri").select("id, storage_path, sira").eq("arac_id", a.id as string).order("sira"),
    db.from("arac_donanimlari").select("donanim_ozellikleri(ad, kategori)").eq("arac_id", a.id as string),
    db.from("ekspertiz_parcalari").select("parca, durum").eq("arac_id", a.id as string),
  ]);

  return {
    id: a.id as string,
    slug: a.slug as string,
    baslik: a.baslik as string,
    fiyat: a.fiyat as number,
    km: a.km as number,
    yil: a.yil as number,
    yakit: a.yakit as Yakit,
    vites: a.vites as Vites,
    kasa: (a.kasa as Kasa | null) ?? null,
    cekis: (a.cekis as Cekis | null) ?? null,
    renk: (a.renk as string | null) ?? null,
    motorHacmi: (a.motor_hacmi as number | null) ?? null,
    motorGucu: (a.motor_gucu as number | null) ?? null,
    durum: a.durum as AracDurumu,
    aciklamaHtml: (a.aciklama_html as string | null) ?? null,
    marka: a.markalar?.ad ?? "",
    model: a.modeller?.ad ?? "",
    resimler: (resimler.data ?? []).map((r) => ({ id: r.id, path: r.storage_path })),
    donanim: ((donanim.data ?? []) as unknown as { donanim_ozellikleri: { ad: string; kategori: string } | null }[])
      .map((d) => d.donanim_ozellikleri)
      .filter((d): d is { ad: string; kategori: string } => !!d),
    ekspertiz: (ekspertiz.data ?? []) as { parca: ParcaKodu; durum: EkspertizDurumu }[],
  };
}
