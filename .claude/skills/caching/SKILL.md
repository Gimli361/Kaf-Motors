---
name: caching
description: KAF Motors önbellek/performans işleri — Next.js ISR, generateStaticParams, unstable_cache ve revalidateTag/revalidatePath desenlerini uygularken kullan. DB egress'ini minimuma indiren cache stratejisini dayatır.
---

# Caching Skill — KAF Motors

Veri çeken sayfa veya yazma sonrası invalidation içeren her işte bu kurallara uy.
Amaç: aylık DB istek (egress) sayısını **0'a yaklaştırmak**.

## Hangi sayfa → hangi strateji
| Sayfa | Strateji |
|---|---|
| Anasayfa (öne çıkanlar) | ISR `revalidate=3600` + `tag:'araclar'` |
| İlan detay `/ilan/[slug]` | `generateStaticParams` + ISR, `tag:'ilan-'+slug` |
| Marka/Model dropdown | `unstable_cache`, uzun TTL, `tag:'referans'` |
| Filtre/Listeleme `/ilanlar` | Server Component + `unstable_cache` key=filtre, `revalidate:300`, `tag:'araclar'` |

## Veri çekiminde
- `lib/cache.ts` içinde `unstable_cache(fn, keyParts, { tags, revalidate })` sarmalayıcıları topla.
- Cache key, sorguyu benzersiz tanımlamalı (filtre parametreleri key'e girer).
- Referans veriyi (marka/model/donanım) uzun TTL ile cache'le — neredeyse hiç değişmez.

## Invalidation (her yazma Server Action'ının SONUNDA)
```ts
revalidateTag('araclar')            // anasayfa + liste
revalidateTag('ilan-' + slug)       // o ilanın detayı
// marka/model/donanım değiştiyse:
revalidateTag('referans')
```
- İlan ekle/güncelle/sil → `'araclar'` + ilgili `'ilan-'+slug`.
- Belirli bir path'i tazelemek gerekiyorsa `revalidatePath` de kullanılabilir,
  ama bu projede **tag tabanlı** invalidation tercih edilir (daha hedefli).

## Kurallar
- Ziyaretçi sayfasında **asla** cache'siz canlı DB sorgusu bırakma.
- Statikleştirilebilen her şeyi statikleştir (ISR), dinamiği kısa TTL ile cache'le.
- Yazma işleminden sonra invalidation çağırmayı unutma → eski içerik görünmesin.

## Yapma
- `cache: 'no-store'` ile ziyaretçi verisini her istekte DB'den çekme.
- Yazma sonrası `revalidateTag` çağırmadan bırakma.
