"use client";

import { useState } from "react";
import { useForm, Controller, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import type {
  Marka,
  Model,
  Donanim,
  ParcaKodu,
  EkspertizDurumu,
  Yakit,
  Vites,
  Kasa,
  Cekis,
  AracDurumu,
} from "@/types/database";
import {
  ilanSchema,
  type IlanFormDegerleri,
  type IlanFormGiris,
  TEMEL_ALANLAR,
} from "@/lib/ilan-schema";
import {
  YAKIT_OPSIYONLARI,
  VITES_OPSIYONLARI,
  KASA_OPSIYONLARI,
  CEKIS_OPSIYONLARI,
  BUCKET,
} from "@/lib/constants";
import { slugUret, fiyatFormat, kmFormat, gorselUrl } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { ilanOlustur, ilanGuncelle } from "@/actions/ilan";
import { depodanSil } from "@/actions/resim";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import { DonanimSecici } from "./donanim-secici";
import { EkspertizSemasi, bosEkspertiz, type EkspertizDeger } from "./ekspertiz-semasi";
import { ResimYukleyici, type YukluResim } from "./resim-yukleyici";
import { TiptapEditor } from "./tiptap-editor";
import { EklenebilirSecim, type SecenekOge } from "./eklenebilir-secim";
import { markaEkle, modelEkle } from "@/actions/referans";

const ADIMLAR = ["Temel Bilgiler", "Donanım", "Ekspertiz", "Görseller", "Açıklama", "Önizle"];

type Secenek = { value: string; label: string };

function KontrolluSecim({
  control,
  name,
  placeholder,
  secenekler,
  sayisal,
  hata,
  onSecim,
}: {
  control: Control<IlanFormGiris>;
  name: FieldPath<IlanFormGiris>;
  placeholder: string;
  secenekler: Secenek[];
  sayisal?: boolean;
  hata?: boolean;
  onSecim?: (v: string) => void;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const v = field.value;
        const mevcut =
          v === undefined ||
          v === null ||
          v === "" ||
          (sayisal && Number(v) === 0)
            ? null
            : String(v);
        return (
          <Select
            value={mevcut}
            onValueChange={(secilen) => {
              field.onChange(sayisal ? Number(secilen) : secilen);
              onSecim?.(String(secilen));
            }}
          >
            <SelectTrigger className="w-full" aria-invalid={hata}>
              <SelectValue placeholder={placeholder}>
                {(val) =>
                  secenekler.find((s) => s.value === String(val))?.label ?? placeholder
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {secenekler.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }}
    />
  );
}

function AlanHata({ mesaj }: { mesaj?: string }) {
  if (!mesaj) return null;
  return <p className="text-xs text-destructive">{mesaj}</p>;
}

export type MevcutIlan = {
  id: string;
  slug: string;
  baslik: string;
  marka_id: number;
  model_id: number;
  yil: number;
  fiyat: number;
  km: number;
  yakit: Yakit;
  vites: Vites;
  kasa: Kasa | null;
  cekis: Cekis | null;
  renk: string | null;
  motor_hacmi: number | null;
  motor_gucu: number | null;
  durum: AracDurumu;
  aciklama_html: string | null;
  donanim_ids: number[];
  ekspertiz: { parca: ParcaKodu; durum: EkspertizDurumu }[];
  resimler: {
    id: string;
    path: string;
    boyut_kb: number | null;
    genislik: number | null;
    yukseklik: number | null;
  }[];
};

export function IlanWizard({
  markalar,
  modeller,
  donanimlar,
  mevcut,
}: {
  markalar: Marka[];
  modeller: Model[];
  donanimlar: Donanim[];
  mevcut?: MevcutIlan;
}) {
  const router = useRouter();
  const duzenle = !!mevcut;
  const [ilanId] = useState(() => mevcut?.id ?? crypto.randomUUID());
  const [adim, setAdim] = useState(0);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const [donanimIds, setDonanimIds] = useState<number[]>(mevcut?.donanim_ids ?? []);
  const [ekspertiz, setEkspertiz] = useState<EkspertizDeger>(() => {
    const v = bosEkspertiz();
    mevcut?.ekspertiz.forEach((e) => {
      v[e.parca] = e.durum;
    });
    return v;
  });
  const [resimler, setResimler] = useState<YukluResim[]>(() =>
    (mevcut?.resimler ?? []).map((r) => ({
      id: r.id,
      previewUrl: gorselUrl(r.path) ?? "",
      boyutKb: r.boyut_kb ?? 0,
      genislik: r.genislik ?? 0,
      yukseklik: r.yukseklik ?? 0,
      path: r.path,
      mevcut: true,
    }))
  );
  const [aciklamaHtml, setAciklamaHtml] = useState(mevcut?.aciklama_html ?? "");

  const form = useForm<IlanFormGiris, unknown, IlanFormDegerleri>({
    resolver: zodResolver(ilanSchema),
    defaultValues: mevcut
      ? {
          baslik: mevcut.baslik,
          marka_id: mevcut.marka_id,
          model_id: mevcut.model_id,
          yil: mevcut.yil,
          fiyat: mevcut.fiyat,
          km: mevcut.km,
          yakit: mevcut.yakit,
          vites: mevcut.vites,
          kasa: mevcut.kasa ?? undefined,
          cekis: mevcut.cekis ?? undefined,
          renk: mevcut.renk ?? undefined,
          motor_hacmi: mevcut.motor_hacmi ?? undefined,
          motor_gucu: mevcut.motor_gucu ?? undefined,
        }
      : { km: 0 },
  });
  const { register, control, setValue, watch, trigger, formState: { errors } } = form;

  const markaId = watch("marka_id");
  const markaIdNum = markaId ? Number(markaId) : null;
  const [markaListe, setMarkaListe] = useState<SecenekOge[]>(() =>
    markalar.map((m) => ({ id: m.id, ad: m.ad }))
  );
  const [modelListe, setModelListe] = useState<
    { id: number; marka_id: number; ad: string }[]
  >(() => modeller.map((m) => ({ id: m.id, marka_id: m.marka_id, ad: m.ad })));

  const ileri = async () => {
    if (adim === 0) {
      const ok = await trigger([...TEMEL_ALANLAR]);
      if (!ok) return;
    }
    if (adim === 3 && resimler.length === 0) {
      toast.error("En az 1 görsel ekleyin.");
      return;
    }
    setAdim((a) => Math.min(a + 1, ADIMLAR.length - 1));
  };
  const geri = () => setAdim((a) => Math.max(a - 1, 0));

  const onValid = async (v: IlanFormDegerleri) => {
    if (resimler.length === 0) {
      toast.error("En az 1 görsel ekleyin.");
      setAdim(3);
      return;
    }
    setKaydediliyor(true);
    const slug = duzenle ? mevcut!.slug : `${slugUret(v.baslik)}-${ilanId.slice(0, 8)}`;
    const supabase = createClient();
    const yuklenen: string[] = [];

    // Yalnız yeni (blob içeren) görselleri yükle
    const yeniResimler = resimler.filter((r) => !r.mevcut && r.blob);
    try {
      for (const r of yeniResimler) {
        const path = `araclar/${ilanId}/${r.id}.webp`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, r.blob!, { contentType: "image/webp" });
        if (error) throw new Error(error.message);
        yuklenen.push(path);
      }
    } catch {
      if (yuklenen.length) await depodanSil(yuklenen);
      toast.error("Görseller yüklenemedi. Tekrar deneyin.");
      setKaydediliyor(false);
      return;
    }

    const payloadResimler = resimler.map((r, i) => ({
      id: r.id,
      storage_path: r.mevcut ? r.path! : `araclar/${ilanId}/${r.id}.webp`,
      sira: i,
      genislik: r.genislik,
      yukseklik: r.yukseklik,
      boyut_kb: r.boyutKb,
      isNew: !r.mevcut,
    }));

    const ortak = {
      id: ilanId,
      baslik: v.baslik,
      slug,
      marka_id: v.marka_id,
      model_id: v.model_id,
      yil: v.yil,
      fiyat: v.fiyat,
      km: v.km,
      yakit: v.yakit,
      vites: v.vites,
      kasa: v.kasa ?? null,
      cekis: v.cekis ?? null,
      renk: v.renk?.trim() || null,
      motor_hacmi: v.motor_hacmi ?? null,
      motor_gucu: v.motor_gucu ?? null,
      aciklama_html: aciklamaHtml.trim() || null,
      donanim_ids: donanimIds,
      ekspertiz: (Object.entries(ekspertiz) as [ParcaKodu, EkspertizDurumu][]).map(
        ([parca, durum]) => ({ parca, durum })
      ),
      kapak_resim_id: resimler[0]?.id ?? null,
    };

    const sonuc = duzenle
      ? await ilanGuncelle({ ...ortak, durum: mevcut!.durum, resimler: payloadResimler })
      : await ilanOlustur({ ...ortak, durum: "aktif", resimler: payloadResimler });

    if (!sonuc.ok) {
      if (yuklenen.length) await depodanSil(yuklenen);
      toast.error(sonuc.error);
      setKaydediliyor(false);
      return;
    }

    toast.success(duzenle ? "İlan güncellendi!" : "İlan başarıyla yayınlandı!");
    router.push("/panel");
    router.refresh();
  };

  const kaydet = form.handleSubmit(onValid, () => {
    toast.error("Lütfen temel bilgileri eksiksiz doldurun.");
    setAdim(0);
  });

  return (
    <div className="space-y-6">
      {/* Adım göstergesi */}
      <ol className="flex flex-wrap gap-2 text-sm">
        {ADIMLAR.map((a, i) => (
          <li
            key={a}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
              i === adim
                ? "bg-primary text-primary-foreground"
                : i < adim
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < adim ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
            {a}
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="pt-6">
          {/* ADIM 0 — Temel Bilgiler */}
          {adim === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="baslik">İlan Başlığı</Label>
                <Input id="baslik" placeholder="2018 VW Passat 1.6 TDI Comfortline" {...register("baslik")} />
                <AlanHata mesaj={errors.baslik?.message} />
              </div>

              <div className="grid gap-2">
                <Label>Marka</Label>
                <Controller
                  control={control}
                  name="marka_id"
                  render={({ field }) => (
                    <EklenebilirSecim
                      secenekler={markaListe}
                      deger={field.value ? Number(field.value) : null}
                      placeholder="Marka seçin veya yazın"
                      hata={!!errors.marka_id}
                      onSecim={(id) => {
                        field.onChange(id);
                        setValue("model_id", 0 as unknown as number);
                      }}
                      onYeni={async (ad) => {
                        const r = await markaEkle(ad);
                        if (!r.ok) {
                          toast.error(r.error);
                          return;
                        }
                        setMarkaListe((p) =>
                          p.some((x) => x.id === r.marka.id)
                            ? p
                            : [...p, r.marka].sort((a, b) =>
                                a.ad.localeCompare(b.ad, "tr")
                              )
                        );
                        field.onChange(r.marka.id);
                        setValue("model_id", 0 as unknown as number);
                      }}
                    />
                  )}
                />
                <AlanHata mesaj={errors.marka_id?.message} />
              </div>

              <div className="grid gap-2">
                <Label>Model</Label>
                <Controller
                  control={control}
                  name="model_id"
                  render={({ field }) => (
                    <EklenebilirSecim
                      secenekler={modelListe
                        .filter((m) => m.marka_id === markaIdNum)
                        .map((m) => ({ id: m.id, ad: m.ad }))}
                      deger={field.value ? Number(field.value) : null}
                      placeholder={markaIdNum ? "Model seçin veya yazın" : "Önce marka seçin"}
                      disabled={!markaIdNum}
                      hata={!!errors.model_id}
                      onSecim={(id) => field.onChange(id)}
                      onYeni={async (ad) => {
                        if (!markaIdNum) return;
                        const r = await modelEkle(markaIdNum, ad);
                        if (!r.ok) {
                          toast.error(r.error);
                          return;
                        }
                        setModelListe((p) => [
                          ...p,
                          { id: r.model.id, marka_id: markaIdNum, ad: r.model.ad },
                        ]);
                        field.onChange(r.model.id);
                      }}
                    />
                  )}
                />
                <AlanHata mesaj={errors.model_id?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="yil">Yıl</Label>
                <Input id="yil" type="number" placeholder="2018" {...register("yil")} />
                <AlanHata mesaj={errors.yil?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fiyat">Fiyat (₺)</Label>
                <Input id="fiyat" type="number" placeholder="850000" {...register("fiyat")} />
                <AlanHata mesaj={errors.fiyat?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="km">Kilometre</Label>
                <Input id="km" type="number" placeholder="120000" {...register("km")} />
                <AlanHata mesaj={errors.km?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="renk">Renk</Label>
                <Input id="renk" placeholder="Beyaz" {...register("renk")} />
              </div>

              <div className="grid gap-2">
                <Label>Yakıt</Label>
                <KontrolluSecim
                  control={control}
                  name="yakit"
                  placeholder="Yakıt tipi"
                  secenekler={YAKIT_OPSIYONLARI}
                  hata={!!errors.yakit}
                />
                <AlanHata mesaj={errors.yakit?.message} />
              </div>

              <div className="grid gap-2">
                <Label>Vites</Label>
                <KontrolluSecim
                  control={control}
                  name="vites"
                  placeholder="Vites tipi"
                  secenekler={VITES_OPSIYONLARI}
                  hata={!!errors.vites}
                />
                <AlanHata mesaj={errors.vites?.message} />
              </div>

              <div className="grid gap-2">
                <Label>Kasa Tipi</Label>
                <KontrolluSecim
                  control={control}
                  name="kasa"
                  placeholder="Kasa tipi (opsiyonel)"
                  secenekler={KASA_OPSIYONLARI}
                />
              </div>

              <div className="grid gap-2">
                <Label>Çekiş</Label>
                <KontrolluSecim
                  control={control}
                  name="cekis"
                  placeholder="Çekiş (opsiyonel)"
                  secenekler={CEKIS_OPSIYONLARI}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="motor_hacmi">Motor Hacmi (cc)</Label>
                <Input id="motor_hacmi" type="number" placeholder="1598" {...register("motor_hacmi")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="motor_gucu">Motor Gücü (hp)</Label>
                <Input id="motor_gucu" type="number" placeholder="120" {...register("motor_gucu")} />
              </div>
            </div>
          )}

          {/* ADIM 1 — Donanım */}
          {adim === 1 && (
            <DonanimSecici donanimlar={donanimlar} secili={donanimIds} onChange={setDonanimIds} />
          )}

          {/* ADIM 2 — Ekspertiz */}
          {adim === 2 && (
            <EkspertizSemasi deger={ekspertiz} onChange={setEkspertiz} />
          )}

          {/* ADIM 3 — Görseller */}
          {adim === 3 && (
            <ResimYukleyici resimler={resimler} onChange={setResimler} />
          )}

          {/* ADIM 4 — Açıklama */}
          {adim === 4 && (
            <div className="space-y-2">
              <Label>İlan Açıklaması</Label>
              <TiptapEditor value={aciklamaHtml} onChange={setAciklamaHtml} />
            </div>
          )}

          {/* ADIM 5 — Önizle */}
          {adim === 5 && (
            <Onizleme
              degerler={watch()}
              markalar={markalar}
              modeller={modeller}
              donanimSayisi={donanimIds.length}
              resimSayisi={resimler.length}
              ekspertiz={ekspertiz}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigasyon */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={geri} disabled={adim === 0 || kaydediliyor}>
          <ChevronLeft className="size-4" /> Geri
        </Button>

        {adim < ADIMLAR.length - 1 ? (
          <Button onClick={ileri}>
            İleri <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={kaydet} disabled={kaydediliyor}>
            {kaydediliyor ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Kaydediliyor…
              </>
            ) : duzenle ? (
              "Değişiklikleri Kaydet"
            ) : (
              "İlanı Yayınla"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function Onizleme({
  degerler,
  markalar,
  modeller,
  donanimSayisi,
  resimSayisi,
  ekspertiz,
}: {
  degerler: Partial<IlanFormGiris>;
  markalar: Marka[];
  modeller: Model[];
  donanimSayisi: number;
  resimSayisi: number;
  ekspertiz: EkspertizDeger;
}) {
  const marka = markalar.find((m) => m.id === Number(degerler.marka_id))?.ad ?? "—";
  const model = modeller.find((m) => m.id === Number(degerler.model_id))?.ad ?? "—";
  const boyali = Object.values(ekspertiz).filter(
    (d) => d === "boyali" || d === "lokal_boyali"
  ).length;
  const degisen = Object.values(ekspertiz).filter((d) => d === "degisen").length;

  const satir = (etiket: string, deger: React.ReactNode) => (
    <div className="flex justify-between border-b py-1.5 text-sm">
      <span className="text-muted-foreground">{etiket}</span>
      <span className="font-medium">{deger}</span>
    </div>
  );

  return (
    <div className="space-y-1">
      <h3 className="mb-3 text-lg font-semibold">{degerler.baslik ?? "—"}</h3>
      {satir("Marka / Model", `${marka} ${model}`)}
      {satir("Yıl", degerler.yil != null && degerler.yil !== "" ? Number(degerler.yil) : "—")}
      {satir("Fiyat", degerler.fiyat ? fiyatFormat(Number(degerler.fiyat)) : "—")}
      {satir(
        "Kilometre",
        degerler.km != null && degerler.km !== "" ? kmFormat(Number(degerler.km)) : "—"
      )}
      {satir("Yakıt / Vites", `${degerler.yakit ?? "—"} / ${degerler.vites ?? "—"}`)}
      {satir("Donanım", `${donanimSayisi} özellik`)}
      {satir("Ekspertiz", `${boyali} boyalı · ${degisen} değişen`)}
      {satir("Görsel", `${resimSayisi} adet`)}
      <p className="pt-3 text-sm text-muted-foreground">
        Her şey hazırsa &quot;İlanı Yayınla&quot; ile kaydet.
      </p>
    </div>
  );
}
