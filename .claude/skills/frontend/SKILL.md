---
name: frontend
description: KAF Motors ön yüz işleri — Next.js 15 App Router, Tailwind, shadcn/ui ile sayfa/bileşen kurarken kullan. UI, layout, FiltreBar, AracKart, galeri/carousel, responsive ve Türkçe arayüz standardını dayatır.
---

# Frontend Skill — KAF Motors

Bir sayfa, bileşen, layout veya herhangi bir görsel arayüz parçası yazarken bu kurallara uy.

## Mimari
- **Next.js 15 App Router**. Bileşenler **varsayılan Server Component**'tir.
- `'use client'` direktifini YALNIZ şu durumlarda ekle: state/effect, event handler,
  tarayıcı API'si, react-hook-form, embla carousel, dropzone, Tiptap.
- Veri çekimi Server Component'te yapılır (bkz. `caching` skill); client bileşene
  veri **prop** olarak iner. Client'tan doğrudan DB çağrısı yapma.

## UI Kütüphanesi
- **Tailwind CSS + shadcn/ui**. Ham `<button>`/`<input>` yerine shadcn bileşenleri
  (`Button`, `Input`, `Select`, `Card`, `Dialog`, `Tabs`, `Form`).
- Yeni shadcn bileşeni gerekirse: `npx shadcn@latest add <bilesen>`.
- Tema/renk Tailwind token'ları üzerinden; sabit hex değer gömme.
- İkonlar: `lucide-react`.

## Görseller (KRİTİK — egress tasarrufu)
- **DAİMA `next/image`** kullan, ham `<img>` değil.
- `sizes` özniteliğini doğru ver: grid kartında küçük, detay galerisinde büyük.
  - Örn grid: `sizes="(max-width:768px) 50vw, 25vw"`.
- `next.config.ts` → `images.remotePatterns` Supabase domaini içermeli.
- Kapak görselinde `priority`, alt görsellerde lazy (varsayılan).

## Türkçe Arayüz & Format
- Tüm kullanıcı metinleri **Türkçe**.
- Fiyat: `new Intl.NumberFormat('tr-TR').format(fiyat)` + ` ₺`.
- KM: binlik ayraçlı (`Intl.NumberFormat('tr-TR')`).
- Tarih gerekiyorsa `Intl.DateTimeFormat('tr-TR')`.

## Responsive & Erişilebilirlik
- **Mobil öncelikli** (önce dar ekran, sonra `md:`/`lg:` ile genişlet).
- İlan listeleme **grid ⇄ list** görünüm geçişi (kullanıcı seçer, URL/state'te tut).
- Her görselde anlamlı `alt`; etkileşimli öğelerde `aria-label`; klavye ile gezilebilir.

## Bu projedeki tipik bileşenler
- `components/public/FiltreBar.tsx` — Marka→Model bağımlı select, Yıl/Fiyat aralığı, Yakıt, Vites.
- `components/public/AracKart.tsx` — kapak görsel + başlık + fiyat + km/yıl rozetleri.
- `components/public/Galeri.tsx` — `embla-carousel-react` ile resim galerisi.
- `components/public/EkspertizSemasi.tsx` — interaktif/okunur SVG gövde şeması (13 parça).

## Yapma
- Ziyaretçi bileşeninde canlı (cache'siz) Supabase sorgusu çalıştırma.
- Ham `<img>` ile büyük görsel servis etme.
- Gereksiz `'use client'` ile koca ağacı client'a çekme.
