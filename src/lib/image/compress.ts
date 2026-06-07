import imageCompression from "browser-image-compression";

export type SikistirilmisResim = {
  blob: Blob;
  genislik: number;
  yukseklik: number;
  boyutKb: number;
};

// image-pipeline skill: yükleme ÖNCESİ tarayıcıda yüksek kaliteli WebP'e sıkıştır.
// Hedef hacim sabit (30 ilan × 10 foto ≈ 300 görsel) → Storage sıkışmıyor, kalite önceliği.
export async function resimSikistir(file: File): Promise<SikistirilmisResim> {
  const blob = await imageCompression(file, {
    maxSizeMB: 3.0, // yumuşak güvenlik tavanı (300 foto rahat sığar)
    maxWidthOrHeight: 3840, // 4K, zoom/tam ekran için
    useWebWorker: true, // UI donmasın
    fileType: "image/webp", // JPEG'den ~%30 küçük
    initialQuality: 0.95,
  });

  const { genislik, yukseklik } = await olcuAl(blob);
  return {
    blob,
    genislik,
    yukseklik,
    boyutKb: Math.round(blob.size / 1024),
  };
}

async function olcuAl(blob: Blob): Promise<{ genislik: number; yukseklik: number }> {
  try {
    const bitmap = await createImageBitmap(blob);
    const sonuc = { genislik: bitmap.width, yukseklik: bitmap.height };
    bitmap.close();
    return sonuc;
  } catch {
    return { genislik: 0, yukseklik: 0 };
  }
}
