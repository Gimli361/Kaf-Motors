import imageCompression from "browser-image-compression";

export type SikistirilmisResim = {
  blob: Blob;
  genislik: number;
  yukseklik: number;
  boyutKb: number;
};

// image-pipeline skill: yükleme ÖNCESİ tarayıcıda ≤200 KB WebP'e sıkıştır.
export async function resimSikistir(file: File): Promise<SikistirilmisResim> {
  const blob = await imageCompression(file, {
    maxSizeMB: 0.2, // ~200 KB hedef
    maxWidthOrHeight: 1600,
    useWebWorker: true, // UI donmasın
    fileType: "image/webp", // JPEG'den ~%30 küçük
    initialQuality: 0.8,
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
