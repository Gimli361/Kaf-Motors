<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KAF Motors — Proje Rehberi

Oto galeri için "Sahibinden" benzeri araç ilan + yönetim sistemi. Ücretsiz servislerle (Vercel + Supabase).

## En kritik kısıt
Ücretsiz limitler **asla** aşılmamalı: Supabase 500 MB DB, 1 GB Storage, sınırlı egress. İki ilke:
1. **DB'ye en az dokun** → ISR + tag-cache (ziyaretçi sayfalarında canlı sorgu yok).
2. **Storage'ı koru** → görseli yüklemeden önce ≤200 KB WebP'e sıkıştır; yetim dosya bırakma.

## Yığın
Next.js 16 (App Router) · React 19 · TS · Tailwind v4 · shadcn/ui (**base-ui** tabanlı) · Supabase (@supabase/ssr) · react-hook-form + zod · Tiptap · embla-carousel · react-dropzone · browser-image-compression.

## Skill'ler
İş türüne göre `.claude/skills/<ad>/SKILL.md` kurallarına uy (özet: kök `skills.md`):
frontend · supabase-db · image-pipeline · caching · admin-wizard.

## Tuzaklar / kararlar
- shadcn Button `asChild` DEĞİL, `render={<Link .../>}` kullanır (base-ui). Link/`<a>` render ederken **`nativeButton={false}`** ekle (yoksa base-ui uyarı verir).
- base-ui Select + RHF: controlled select'leri **Controller** ile bağla. Sadece `setValue`+`watch` ile bağlarsan alan register edilmediği için `watch` reaktif güncellenmez (ör. bağımlı Model dropdown'u boş kalır).
- Oturum/koruma `src/proxy.ts` (Next 16 proxy convention; eski adı middleware).
- Supabase client'lar `lib/supabase/{client,server,admin}.ts`. `admin` = service_role, SADECE sunucu.
- DB tipleri `src/types/database.ts` (el ile). Migration sonrası `supabase gen types` ile yenile.
- SQL: `supabase/migrations/0001..0005` + `supabase/seed.sql` — sırayla Supabase SQL Editor'da çalıştır.
- **SSR / Client Sınırı**: `"use client"` direktifli dosyalardan export edilen yardımcı fonksiyonlar (ör. `bosEkspertiz`) Server Component'lerde doğrudan çağrılamaz. Bu tür ortak mantık/yardımcı fonksiyonları `src/lib/constants.ts` veya `src/lib/utils.ts` gibi paylaşılan dosyalarda tanımla.


## Faz durumu
- ✅ Faz 0: iskelet, shadcn, klasör yapısı.
- ✅ Faz 1: DB şema/RLS/GC SQL, Supabase client'lar, proxy, login + panel dashboard.
- ✅ Faz 2: 6 adımlı ilan sihirbazı (resim sıkıştırma+upload, ekspertiz SVG, donanım, Tiptap, önizle) + `actions/ilan.ts`, `actions/resim.ts`. Marka/model creatable combobox (`actions/referans.ts`, `eklenebilir-secim.tsx`).
- ✅ Faz 3: cache'li ziyaretçi sitesi — `lib/queries.ts` (`'use cache'`+`cacheTag`), anasayfa/listeleme(filtre,grid/list)/detay(galeri,ekspertiz,donanım). `experimental.useCache` açık. Public anon client: `lib/supabase/public.ts`.
- ✅ İlan yönetimi: dashboard ilan tablosu (durum değiştir/düzenle/sil), Storage göstergesi, düzenleme sayfası (`/panel/ilan/[id]/duzenle`). Wizard create+edit modu. Actions: `ilanGuncelle/ilanSil/ilanDurumGuncelle`.
- ✅ Faz 4: Storage GC — `supabase/functions/temizlik` Edge Function (kuyruk→Storage remove), `0006_cron.sql` (pg_cron+pg_net, Vault'tan service_role, 10 dk'da bir). `config.toml` (verify_jwt). `.env.example` + Vercel deploy rehberi (README).
