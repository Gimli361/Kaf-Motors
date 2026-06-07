---
name: image-pipeline
description: KAF Motors görsel işleri — browser-image-compression ile tarayıcı tarafı sıkıştırma, Supabase Storage upload ve yetim dosya temizliği (GC) yazarken kullan. 1 GB Storage limitini koruyan sıkıştırma + silme akışını dayatır.
---

# Image-Pipeline Skill — KAF Motors

Resim yükleme/silme içeren her işte bu kurallara uy. Limit: **1 GB Storage**.
Hedef hacim sabit (~30 ilan × 10 foto ≈ 300 görsel) → Storage sıkışmaz, **kalite önceliklidir**.
Hedef: her görsel WebP, max **3840px** kenar, **~3 MB tavan**, q0.95.

## Sıkıştırma (yükleme ÖNCESİ, client'ta)
`lib/image/compress.ts` içinde `browser-image-compression` ile:
```ts
const compressed = await imageCompression(file, {
  maxSizeMB: 3.0,            // yumuşak güvenlik tavanı (300 foto rahat sığar)
  maxWidthOrHeight: 3840,    // 4K, zoom/tam ekran için
  useWebWorker: true,        // UI donmaz
  fileType: 'image/webp',    // JPEG'den ~%30 küçük
  initialQuality: 0.95,
})
```
- Web Worker zorunlu (çoklu yükleme arayüzü dondurmasın).
- Sıkıştırma EXIF'i de temizler (boyut + gizlilik kazancı).
- `maxSizeMB` sert tavandır, `initialQuality` başlangıç tahminidir; kütüphane tavanı aşmamak için kaliteyi gerekirse otomatik düşürür.

## Upload (doğrudan tarayıcı → Storage)
- Bucket: `arac-gorselleri`. Path: `araclar/<aracId>/<uuid>.webp`.
- `supabase.storage.from('arac-gorselleri').upload(path, blob)`.
- Upload Next.js sunucusundan **geçmez** (Vercel function/bandwidth harcanmaz).
- Başarı sonrası `arac_resimleri` satırı: `storage_path, sira, genislik, yukseklik, boyut_kb`.
- `boyut_kb` daima yaz → toplam Storage kullanım takibi ve limit uyarısı için.

## Çöp temizliği / Garbage Collection (yetim dosya bırakma)
**Katman A — eşzamanlı (Server Action, mutlu yol):** Silmeden ÖNCE path topla,
Storage'dan sil, SONRA DB satırını sil:
```ts
const paths = resimler.map(r => r.storage_path)
await supabase.storage.from('arac-gorselleri').remove(paths)
await supabase.from('araclar').delete().eq('id', aracId) // DB cascade
```
**Katman B — güvenlik ağı (trigger + cron):** `arac_resimleri` AFTER DELETE trigger'ı
silinen path'i `silinecek_dosyalar` kuyruğuna yazar. `supabase/functions/temizlik`
Edge Function'ı pg_cron ile (~10 dk) kuyruğu işleyip Storage'dan siler.
- `remove` idempotenttir (zaten silinmiş path hata vermez).

## Sunum (egress tasarrufu)
- Görseli `next/image` ile servis et, doğru `sizes` ver (bkz. frontend skill).
- Supabase image transform ücretsiz planda sınırlı → tek WebP + responsive next/image yeterli.
- Büyük/zoom gösterimde `quality={90}`. Next 16'da `images.qualities` varsayılanı `[75]`,
  bu yüzden kullanılan her quality değeri `next.config.ts` → `images.qualities` içine eklenmeli
  (yoksa en yakın değere yuvarlanır). Küçük thumbnail'lar varsayılan 75'te kalsın (egress).

## Yapma
- Sıkıştırmadan ham (MB'larca) görsel yükleme.
- DB satırını silip Storage dosyasını bırakma (yetim oluşur).
- Upload'ı Next.js sunucusu üzerinden proxy'leme.
