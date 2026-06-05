---
name: supabase-db
description: KAF Motors veritabanı işleri — Supabase PostgreSQL migration, tablo, enum, partial index, RLS politikası ve sorgu yazarken kullan. 500 MB DB limitini ve CPU'yu koruyan index disiplinini dayatır.
---

# Supabase-DB Skill — KAF Motors

DB şeması veya sorgu içeren her işte bu kurallara uy. Limit: **500 MB DB**.

## Migration disiplini
- Her şema değişikliği = **yeni** `supabase/migrations/NNNN_aciklama.sql` dosyası.
  Var olan migration dosyasını düzenleme (uygulanmış olabilir).
- Sıra: `0001_init` (enum+tablo) → `0002_index` → `0003_rls` → `0004_gc`.
- Değişiklik sonrası tipleri yeniden üret:
  `supabase gen types typescript --project-id <id> > src/types/database.ts`.

## Index disiplini (CPU/limit koruması)
- Ziyaretçi sorgularının %100'ü `durum='aktif'` filtreler → **partial index** kullan:
  `create index ... on araclar (kolon) where durum='aktif';`
- Her yeni filtrelenebilir kolon için index ekle.
- Yaygın kombinasyonlar için composite index (örn `(marka_id, model_id, fiyat)`).
- Doğrula: `explain analyze <sorgu>` çıktısında **Index Scan** olmalı, `Seq Scan` olmamalı.
- Gereksiz index ekleme — her index DB boyutunu büyütür (500 MB limiti).

## RLS (her tabloda açık)
- `markalar`, `modeller`, `donanim_ozellikleri`: herkese `SELECT`.
- `araclar` ve ilişkili tablolar:
  - **anon**: yalnız `durum='aktif'` satırları `SELECT`.
  - **admin**: `profiles` tablosunda `auth.uid()` kaydı olanlara tam yetki (`for all`).
- Admin yazma işlemleri Server Action'da **service-role** ile yapılabilir (RLS bypass),
  ama RLS yine de açık kalır (güvenlik ağı). Anon anahtarını sadece public read'de kullan.

## Şema referansı (özet)
- `araclar` (uuid, slug unique, marka_id, model_id, yil, fiyat, km, yakit, vites, durum, aciklama_html, kapak_resim_id, ...)
- `arac_resimleri` (arac_id → araclar CASCADE, storage_path, sira, boyut_kb)
- `ekspertiz_parcalari` (PK: arac_id+parca, durum enum) — 13 parça
- `arac_donanimlari` (M:N: arac_id+donanim_id)
- `silinecek_dosyalar` (storage GC kuyruğu — bkz. image-pipeline skill)
- Enum'lar: `yakit_tipi, vites_tipi, kasa_tipi, cekis_tipi, arac_durumu, ekspertiz_durumu, parca_kodu`

## Veri tipi notları
- Fiyat/km: `integer` (kuruş yok). Yıl/motor: `smallint`.
- Para alanlarında float kullanma.

## Yapma
- Mevcut migration'ı düzenleme; yeni dosya ekle.
- Filtre kolonunu index'siz bırakma.
- RLS'i kapatma; anon'a yazma izni verme.
