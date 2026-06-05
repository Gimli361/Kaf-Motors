import { z } from "zod";

const opsiyonelSayi = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().nonnegative().optional()
);

// Sihirbazın 1. adımı (Temel Bilgiler) — react-hook-form ile doğrulanır.
// Donanım / ekspertiz / resim / açıklama ayrı bileşen state'inde tutulur.
export const ilanSchema = z.object({
  baslik: z
    .string()
    .min(5, "Başlık en az 5 karakter olmalı")
    .max(120, "Başlık çok uzun"),
  marka_id: z.coerce.number().int().positive("Marka seçin"),
  model_id: z.coerce.number().int().positive("Model seçin"),
  yil: z.coerce
    .number()
    .int()
    .min(1950, "Geçerli bir yıl girin")
    .max(new Date().getFullYear() + 1, "Geçerli bir yıl girin"),
  fiyat: z.coerce.number().int().positive("Fiyat girin"),
  km: z.coerce.number().int().nonnegative("Geçerli km girin"),
  yakit: z.enum(["benzin", "dizel", "lpg", "hibrit", "elektrik"]),
  vites: z.enum(["manuel", "otomatik", "yari_otomatik"]),
  kasa: z
    .enum([
      "sedan",
      "hatchback",
      "suv",
      "station_wagon",
      "coupe",
      "cabrio",
      "pickup",
      "minivan",
      "van",
    ])
    .optional(),
  cekis: z.enum(["onden", "arkadan", "4x4"]).optional(),
  renk: z.string().max(40).optional(),
  motor_hacmi: opsiyonelSayi,
  motor_gucu: opsiyonelSayi,
});

export type IlanFormDegerleri = z.output<typeof ilanSchema>;
export type IlanFormGiris = z.input<typeof ilanSchema>;

// 1. adım alan adları (per-step doğrulama için)
export const TEMEL_ALANLAR = [
  "baslik",
  "marka_id",
  "model_id",
  "yil",
  "fiyat",
  "km",
  "yakit",
  "vites",
  "kasa",
  "cekis",
  "renk",
  "motor_hacmi",
  "motor_gucu",
] as const;
