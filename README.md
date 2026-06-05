# KAF Motors

Oto galeri için "Sahibinden" benzeri araç ilan + yönetim sistemi. Tamamen **ücretsiz**
servislerle çalışır: **Vercel** (Next.js host) + **Supabase** (DB / Auth / Storage).

> Mimari, skill kuralları ve fazlar için bkz. [`AGENTS.md`](./AGENTS.md).

## Yığın

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui (base-ui) ·
Supabase (@supabase/ssr) · react-hook-form + zod · Tiptap · embla-carousel ·
react-dropzone · browser-image-compression.

## Geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri Supabase > Project Settings > API'den doldur
npm run dev                  # http://localhost:3000
```

Ortam değişkenleri için bkz. [`.env.example`](./.env.example).

## Supabase kurulumu

1. **DB şeması** — `supabase/migrations/0001..0006` dosyalarını **sırayla** SQL Editor'da
   çalıştır, ardından `supabase/seed.sql` (marka/model/donanım referansları).
2. **Storage** — `arac-gorselleri` adında **public** bucket oluştur (0005 politikaları).
3. **Storage GC (yetim dosya temizliği)** — Faz 4:
   - Service role anahtarını Vault'a ekle (cron'un kullanması için):
     ```sql
     select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
     ```
   - Edge Function'ı deploy et:
     ```bash
     supabase functions deploy temizlik --project-ref jwwamaqjcmsvhvswusgz
     ```
   - `0006_cron.sql`'i çalıştır → her 10 dk'da `silinecek_dosyalar` kuyruğunu işler.
   - Doğrula: `select * from cron.job_run_details order by start_time desc limit 5;`

## Vercel deploy

1. GitHub reposunu Vercel'e bağla (framework otomatik: Next.js).
2. **Environment Variables** ekle (`.env.example`'daki üç değişken — `SUPABASE_SERVICE_ROLE_KEY`
   dahil, Production + Preview).
3. Deploy. `next.config.ts` Supabase Storage host'unu `images.remotePatterns`'e
   tanımlar ve `experimental.useCache` (tag-cache) açıktır.

## Ücretsiz limit disiplini

- **DB'ye en az dokun** — ziyaretçi sayfaları `'use cache'` + `cacheTag`; canlı sorgu yok.
- **Storage'ı koru** — görsel yüklemeden önce ≤200 KB WebP'e sıkıştırılır; silinen
  dosyalar eşzamanlı (Server Action) + cron GC ile temizlenir, yetim bırakılmaz.
