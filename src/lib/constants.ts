import type {
  Yakit,
  Vites,
  Kasa,
  Cekis,
  EkspertizDurumu,
  ParcaKodu,
} from "@/types/database";

export const BUCKET = "arac-gorselleri";

// İletişim bilgileri (tek kaynak)
export const ILETISIM_TEL = "+905541963901"; // tel: linki için
export const ILETISIM_WHATSAPP = "905541963901"; // wa.me için (+ ve boşluk yok)
export const ILETISIM_TEL_GOSTERIM = "+90 554 196 39 01"; // görünür metin (ileride gerekirse)

type Opt<T> = { value: T; label: string };

export const YAKIT_OPSIYONLARI: Opt<Yakit>[] = [
  { value: "benzin", label: "Benzin" },
  { value: "dizel", label: "Dizel" },
  { value: "lpg", label: "LPG" },
  { value: "hibrit", label: "Hibrit" },
  { value: "elektrik", label: "Elektrik" },
];

export const VITES_OPSIYONLARI: Opt<Vites>[] = [
  { value: "manuel", label: "Manuel" },
  { value: "otomatik", label: "Otomatik" },
  { value: "yari_otomatik", label: "Yarı Otomatik" },
];

export const KASA_OPSIYONLARI: Opt<Kasa>[] = [
  { value: "sedan", label: "Sedan" },
  { value: "hatchback", label: "Hatchback" },
  { value: "suv", label: "SUV" },
  { value: "station_wagon", label: "Station Wagon" },
  { value: "coupe", label: "Coupe" },
  { value: "cabrio", label: "Cabrio" },
  { value: "pickup", label: "Pickup" },
  { value: "minivan", label: "Minivan" },
  { value: "van", label: "Van" },
];

export const CEKIS_OPSIYONLARI: Opt<Cekis>[] = [
  { value: "onden", label: "Önden Çekiş" },
  { value: "arkadan", label: "Arkadan İtiş" },
  { value: "4x4", label: "4x4" },
];

// Ekspertiz durumları + renkleri (SVG dolgu / kenar)
export const EKSPERTIZ_DURUMLARI: {
  value: EkspertizDurumu;
  label: string;
  dolgu: string;
  kenar: string;
}[] = [
  { value: "belirtilmemis", label: "Belirtilmemiş", dolgu: "#f1f5f9", kenar: "#94a3b8" },
  { value: "orijinal", label: "Orijinal", dolgu: "#bbf7d0", kenar: "#16a34a" },
  { value: "lokal_boyali", label: "Lokal Boyalı", dolgu: "#fde68a", kenar: "#d97706" },
  { value: "boyali", label: "Boyalı", dolgu: "#fed7aa", kenar: "#ea580c" },
  { value: "degisen", label: "Değişen", dolgu: "#fecaca", kenar: "#dc2626" },
];

export function ekspertizRenk(durum: EkspertizDurumu) {
  return (
    EKSPERTIZ_DURUMLARI.find((d) => d.value === durum) ?? EKSPERTIZ_DURUMLARI[0]
  );
}

// 13 parçalı ekspertiz şeması — üstten görünüm (viewBox 0 0 240 420)
export type EkspertizParcaTanim = {
  kod: ParcaKodu;
  ad: string;
  satirlar: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

export const EKSPERTIZ_PARCALAR: EkspertizParcaTanim[] = [
  { kod: "on_tampon", ad: "Ön Tampon", satirlar: ["Ön Tampon"], x: 60, y: 10, w: 120, h: 28 },
  { kod: "sol_on_camurluk", ad: "Sol Ön Çamurluk", satirlar: ["Sol Ön", "Çamurluk"], x: 20, y: 44, w: 54, h: 72 },
  { kod: "kaput", ad: "Kaput", satirlar: ["Kaput"], x: 80, y: 44, w: 80, h: 72 },
  { kod: "sag_on_camurluk", ad: "Sağ Ön Çamurluk", satirlar: ["Sağ Ön", "Çamurluk"], x: 166, y: 44, w: 54, h: 72 },
  { kod: "sol_on_kapi", ad: "Sol Ön Kapı", satirlar: ["Sol Ön", "Kapı"], x: 20, y: 122, w: 54, h: 82 },
  { kod: "tavan", ad: "Tavan", satirlar: ["Tavan"], x: 80, y: 122, w: 80, h: 170 },
  { kod: "sag_on_kapi", ad: "Sağ Ön Kapı", satirlar: ["Sağ Ön", "Kapı"], x: 166, y: 122, w: 54, h: 82 },
  { kod: "sol_arka_kapi", ad: "Sol Arka Kapı", satirlar: ["Sol Arka", "Kapı"], x: 20, y: 210, w: 54, h: 82 },
  { kod: "sag_arka_kapi", ad: "Sağ Arka Kapı", satirlar: ["Sağ Arka", "Kapı"], x: 166, y: 210, w: 54, h: 82 },
  { kod: "sol_arka_camurluk", ad: "Sol Arka Çamurluk", satirlar: ["Sol Arka", "Çamurluk"], x: 20, y: 298, w: 54, h: 72 },
  { kod: "bagaj_kapagi", ad: "Bagaj Kapağı", satirlar: ["Bagaj", "Kapağı"], x: 80, y: 298, w: 80, h: 72 },
  { kod: "sag_arka_camurluk", ad: "Sağ Arka Çamurluk", satirlar: ["Sağ Arka", "Çamurluk"], x: 166, y: 298, w: 54, h: 72 },
  { kod: "arka_tampon", ad: "Arka Tampon", satirlar: ["Arka Tampon"], x: 60, y: 376, w: 120, h: 28 },
];

export const TUM_PARCA_KODLARI = EKSPERTIZ_PARCALAR.map((p) => p.kod);

export type EkspertizDeger = Record<ParcaKodu, EkspertizDurumu>;

export function bosEkspertiz(): EkspertizDeger {
  const v = {} as EkspertizDeger;
  for (const p of EKSPERTIZ_PARCALAR) v[p.kod] = "belirtilmemis";
  return v;
}

