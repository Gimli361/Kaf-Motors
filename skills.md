# KAF Motors — Geliştirme Skill'leri

Bu proje, ücretsiz limitler (**500 MB DB / 1 GB Storage / sınırlı egress**) içinde maksimum
performans ilkesiyle geliştirilir. Aşağıdaki skill'ler tekrar eden işleri standartlaştırır.
Her skill'in tam tanımı `.claude/skills/<ad>/SKILL.md` dosyasındadır.

| Skill | Ne zaman kullan | Dosya |
|---|---|---|
| **frontend**       | UI bileşeni, sayfa, layout, Tailwind + shadcn/ui işleri | `.claude/skills/frontend/SKILL.md` |
| **supabase-db**    | Migration, tablo, index, RLS, sorgu                     | `.claude/skills/supabase-db/SKILL.md` |
| **image-pipeline** | Resim sıkıştırma, upload, yetim dosya temizliği         | `.claude/skills/image-pipeline/SKILL.md` |
| **caching**        | ISR / unstable_cache / revalidateTag                    | `.claude/skills/caching/SKILL.md` |
| **admin-wizard**   | İlan giriş sihirbazı, form, Tiptap, ekspertiz SVG       | `.claude/skills/admin-wizard/SKILL.md` |

## İki temel kural (her skill bunlara uyar)

1. **DB'ye en az dokun** — Ziyaretçi tarafında canlı sorgu bırakma; ISR + tag-cache kullan.
2. **Storage'ı koru** — Görseli yüklemeden önce ≤200 KB WebP'e sıkıştır; yetim dosya bırakma.

## frontend (ön yüz)
- Next.js 15 App Router; Server Component varsayılan, `'use client'` yalnız etkileşim gerekiyorsa.
- Tailwind + shadcn/ui; ham HTML yerine shadcn bileşenleri.
- Görsellerde **DAİMA** `next/image` + doğru `sizes` (egress tasarrufu).
- Arayüz metinleri Türkçe; fiyat `Intl.NumberFormat('tr-TR')`.
- Mobil öncelikli responsive; grid/list görünüm geçişi.
- Erişilebilirlik: alt text, aria-label, klavye navigasyonu.

## supabase-db
- Şema değişikliği = yeni `supabase/migrations/NNNN_*.sql` (mevcut migration düzenlenmez).
- Ziyaretçi sorguları daima `durum='aktif'` → partial index'lere yaslan.
- Her yeni filtre kolonu için index ekle; `explain analyze` ile seq-scan yok doğrula.
- RLS her tabloda açık; anon yalnız aktif-read, admin `profiles.rol` ile tam yetki.
- Değişiklik sonrası `supabase gen types` ile `src/types/database.ts` güncelle.

## image-pipeline
- Yükleme öncesi client'ta sıkıştır: `maxSizeMB 0.2`, `maxWidthOrHeight 1600`, `fileType webp`, `useWebWorker true`.
- Upload doğrudan tarayıcı→Storage (Next sunucusundan geçirme).
- `arac_resimleri.boyut_kb` daima kaydet (limit takibi).
- Silmede ÖNCE `storage.remove(paths)` SONRA DB delete; cascade için trigger kuyruğu güvenlik ağı.

## caching
- Statikleştirilebilir sayfa = ISR + tag; detay = `generateStaticParams`.
- Referans (marka/model) = `unstable_cache` uzun TTL, tag `'referans'`.
- Her yazma Server Action'ı SONUNDA `revalidateTag('araclar')` + `revalidateTag('ilan-'+slug)`.
- Asla ziyaretçi sayfasında cache'siz canlı DB sorgusu bırakma.

## admin-wizard
- Form state: react-hook-form + zod şeması; adımlar arası tek form context.
- Adımlar: Temel → Donanım → Ekspertiz(SVG) → Resimler → Açıklama(Tiptap) → Önizle.
- Kaydet tek transaction mantığı: `araclar` + ilişkili tablolar + resim kayıtları.
- Server Action sonunda cache invalidation çağır.
