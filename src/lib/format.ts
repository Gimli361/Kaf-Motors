import { BUCKET } from "@/lib/constants";

// Türkçe biçimlendirme yardımcıları (frontend skill standardı).

// Storage path → public görsel URL'i.
export function gorselUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

const tl = new Intl.NumberFormat("tr-TR");

export function fiyatFormat(deger: number): string {
  return `${tl.format(deger)} ₺`;
}

export function kmFormat(deger: number): string {
  return `${tl.format(deger)} km`;
}

export function sayiFormat(deger: number): string {
  return tl.format(deger);
}

// Başlıktan URL-dostu slug üretir (Türkçe karakter dönüşümlü).
export function slugUret(metin: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return metin
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
