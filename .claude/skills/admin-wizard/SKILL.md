---
name: admin-wizard
description: KAF Motors ilan giriş/düzenleme sihirbazı işleri — çok adımlı form (react-hook-form + zod), Tiptap zengin metin, react-dropzone resim yükleme ve interaktif ekspertiz SVG bileşenlerini yazarken kullan.
---

# Admin-Wizard Skill — KAF Motors

İlan ekleme/düzenleme sihirbazı ve admin form işlerinde bu kurallara uy.

## Form altyapısı
- **react-hook-form + zod**. Tek bir zod şeması tüm ilanı doğrular.
- Adımlar arası **tek** form context (her adım ayrı form değil) — `useForm` üst seviyede,
  adımlar `useFormContext` ile bağlanır.
- Her adımda yalnız o adımın alanlarını valide et (`trigger(['alan1','alan2'])`),
  geçince sonraki adıma izin ver.

## Adım sırası
`Temel Bilgiler → Donanım Seçimi → Ekspertiz (SVG) → Çoklu Resim → Açıklama (Tiptap) → Önizle/Kaydet`

1. **Temel**: marka (select) → model (markaya bağımlı select), yıl, fiyat, km, yakit, vites, kasa, renk, motor.
2. **Donanım**: `donanim_ozellikleri` kategorili çoklu seçim (checkbox grupları).
3. **Ekspertiz**: interaktif SVG gövde, 13 parça; her parça tıklanır → durum
   (Orijinal / Lokal Boyalı / Boyalı / Değişen). State `Record<parca_kodu, durum>`.
4. **Resimler**: `react-dropzone` + sıkıştırma (bkz. **image-pipeline** skill), sürükle-sırala, kapak seç.
5. **Açıklama**: **Tiptap** editör → HTML çıktı `araclar.aciklama_html`.
6. **Önizle**: ziyaretçi detay görünümünün birebir önizlemesi, sonra Kaydet.

## Kaydetme (Server Action)
- `actions/ilan.ts` içinde tek mantıksal işlem: `araclar` + `arac_donanimlari` +
  `ekspertiz_parcalari` + `arac_resimleri` birlikte yazılır.
- Slug üret (başlık + kısa uuid), benzersizliği garanti et.
- Görseller zaten Storage'a yüklendiyse yalnız satır kaydı eklenir.
- **SONUNDA** cache invalidation (bkz. **caching** skill):
  `revalidateTag('araclar'); revalidateTag('ilan-'+slug)`.

## Düzenleme & Silme
- Düzenlemede mevcut değerleri forma yükle; çıkarılan resimler için **image-pipeline**
  silme akışını çağır (Storage'dan da sil).
- İlan silme: önce resim path'lerini topla → Storage remove → DB delete (cascade).

## Yapma
- Her adımı ayrı form/submit yapma (veri kaybolur).
- Görseli sıkıştırmadan yükleme.
- Kaydetme sonrası cache invalidation'ı atlama.
