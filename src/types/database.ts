// KAF Motors — DB tipleri.
// NOT: Migration'lar uygulandıktan sonra şu komutla yeniden üretebilirsin:
//   supabase gen types typescript --project-id jwwamaqjcmsvhvswusgz > src/types/database.ts
// Bu dosya şimdilik el ile şemaya birebir uyacak şekilde yazıldı (§2 plan).

export type Yakit = "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";
export type Vites = "manuel" | "otomatik" | "yari_otomatik";
export type Kasa =
  | "sedan"
  | "hatchback"
  | "suv"
  | "station_wagon"
  | "coupe"
  | "cabrio"
  | "pickup"
  | "minivan"
  | "van";
export type Cekis = "onden" | "arkadan" | "4x4";
export type AracDurumu = "aktif" | "pasif" | "satildi";
export type EkspertizDurumu =
  | "orijinal"
  | "lokal_boyali"
  | "boyali"
  | "degisen"
  | "belirtilmemis";
export type ParcaKodu =
  | "on_tampon"
  | "arka_tampon"
  | "kaput"
  | "tavan"
  | "bagaj_kapagi"
  | "sag_on_camurluk"
  | "sag_arka_camurluk"
  | "sol_on_camurluk"
  | "sol_arka_camurluk"
  | "sag_on_kapi"
  | "sag_arka_kapi"
  | "sol_on_kapi"
  | "sol_arka_kapi";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; ad_soyad: string | null; rol: string; created_at: string };
        Insert: { id: string; ad_soyad?: string | null; rol?: string; created_at?: string };
        Update: { id?: string; ad_soyad?: string | null; rol?: string };
        Relationships: [];
      };
      markalar: {
        Row: { id: number; ad: string; slug: string; logo_url: string | null; created_at: string };
        Insert: { id?: number; ad: string; slug: string; logo_url?: string | null };
        Update: { ad?: string; slug?: string; logo_url?: string | null };
        Relationships: [];
      };
      modeller: {
        Row: { id: number; marka_id: number; ad: string; slug: string; created_at: string };
        Insert: { id?: number; marka_id: number; ad: string; slug: string };
        Update: { marka_id?: number; ad?: string; slug?: string };
        Relationships: [{ foreignKeyName: "modeller_marka_id_fkey"; columns: ["marka_id"]; referencedRelation: "markalar"; referencedColumns: ["id"] }];
      };
      donanim_ozellikleri: {
        Row: { id: number; kategori: string; ad: string; slug: string };
        Insert: { id?: number; kategori: string; ad: string; slug: string };
        Update: { kategori?: string; ad?: string; slug?: string };
        Relationships: [];
      };
      araclar: {
        Row: {
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
          kapak_resim_id: string | null;
          goruntulenme: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          baslik: string;
          marka_id: number;
          model_id: number;
          yil: number;
          fiyat: number;
          km?: number;
          yakit: Yakit;
          vites: Vites;
          kasa?: Kasa | null;
          cekis?: Cekis | null;
          renk?: string | null;
          motor_hacmi?: number | null;
          motor_gucu?: number | null;
          durum?: AracDurumu;
          aciklama_html?: string | null;
          kapak_resim_id?: string | null;
          goruntulenme?: number;
        };
        Update: Partial<Database["public"]["Tables"]["araclar"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "araclar_marka_id_fkey"; columns: ["marka_id"]; referencedRelation: "markalar"; referencedColumns: ["id"] },
          { foreignKeyName: "araclar_model_id_fkey"; columns: ["model_id"]; referencedRelation: "modeller"; referencedColumns: ["id"] }
        ];
      };
      arac_resimleri: {
        Row: {
          id: string;
          arac_id: string;
          storage_path: string;
          sira: number;
          genislik: number | null;
          yukseklik: number | null;
          boyut_kb: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          arac_id: string;
          storage_path: string;
          sira?: number;
          genislik?: number | null;
          yukseklik?: number | null;
          boyut_kb?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["arac_resimleri"]["Insert"]>;
        Relationships: [{ foreignKeyName: "arac_resimleri_arac_id_fkey"; columns: ["arac_id"]; referencedRelation: "araclar"; referencedColumns: ["id"] }];
      };
      arac_donanimlari: {
        Row: { arac_id: string; donanim_id: number };
        Insert: { arac_id: string; donanim_id: number };
        Update: { arac_id?: string; donanim_id?: number };
        Relationships: [
          { foreignKeyName: "arac_donanimlari_arac_id_fkey"; columns: ["arac_id"]; referencedRelation: "araclar"; referencedColumns: ["id"] },
          { foreignKeyName: "arac_donanimlari_donanim_id_fkey"; columns: ["donanim_id"]; referencedRelation: "donanim_ozellikleri"; referencedColumns: ["id"] }
        ];
      };
      ekspertiz_parcalari: {
        Row: { arac_id: string; parca: ParcaKodu; durum: EkspertizDurumu };
        Insert: { arac_id: string; parca: ParcaKodu; durum?: EkspertizDurumu };
        Update: { durum?: EkspertizDurumu };
        Relationships: [{ foreignKeyName: "ekspertiz_parcalari_arac_id_fkey"; columns: ["arac_id"]; referencedRelation: "araclar"; referencedColumns: ["id"] }];
      };
      silinecek_dosyalar: {
        Row: { id: number; storage_path: string; olusturulma: string };
        Insert: { id?: number; storage_path: string; olusturulma?: string };
        Update: { storage_path?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      yakit_tipi: Yakit;
      vites_tipi: Vites;
      kasa_tipi: Kasa;
      cekis_tipi: Cekis;
      arac_durumu: AracDurumu;
      ekspertiz_durumu: EkspertizDurumu;
      parca_kodu: ParcaKodu;
    };
  };
};

// Kısa yol tipler
export type Marka = Database["public"]["Tables"]["markalar"]["Row"];
export type Model = Database["public"]["Tables"]["modeller"]["Row"];
export type Donanim = Database["public"]["Tables"]["donanim_ozellikleri"]["Row"];
export type Arac = Database["public"]["Tables"]["araclar"]["Row"];
export type AracResim = Database["public"]["Tables"]["arac_resimleri"]["Row"];
export type EkspertizParca = Database["public"]["Tables"]["ekspertiz_parcalari"]["Row"];
