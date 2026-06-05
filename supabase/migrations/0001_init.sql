-- KAF Motors — 0001 init: enum'lar + tablolar
-- Supabase Dashboard > SQL Editor'a sırayla yapıştır (0001 → 0002 → 0003 → 0004 → seed).

-- ENUM'lar
create type yakit_tipi   as enum ('benzin','dizel','lpg','hibrit','elektrik');
create type vites_tipi   as enum ('manuel','otomatik','yari_otomatik');
create type kasa_tipi    as enum ('sedan','hatchback','suv','station_wagon','coupe','cabrio','pickup','minivan','van');
create type cekis_tipi   as enum ('onden','arkadan','4x4');
create type arac_durumu  as enum ('aktif','pasif','satildi');
create type ekspertiz_durumu as enum ('orijinal','lokal_boyali','boyali','degisen','belirtilmemis');
create type parca_kodu as enum (
  'on_tampon','arka_tampon','kaput','tavan','bagaj_kapagi',
  'sag_on_camurluk','sag_arka_camurluk','sol_on_camurluk','sol_arka_camurluk',
  'sag_on_kapi','sag_arka_kapi','sol_on_kapi','sol_arka_kapi'
);

-- Adminler (auth.users 1:1)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ad_soyad text,
  rol text not null default 'admin',
  created_at timestamptz default now()
);

-- Marka / Model (referans)
create table markalar (
  id smallserial primary key,
  ad text not null unique,
  slug text not null unique,
  logo_url text,
  created_at timestamptz default now()
);

create table modeller (
  id serial primary key,
  marka_id smallint not null references markalar(id) on delete cascade,
  ad text not null,
  slug text not null,
  created_at timestamptz default now(),
  unique (marka_id, ad)
);

-- Donanım referansı
create table donanim_ozellikleri (
  id smallserial primary key,
  kategori text not null,
  ad text not null,
  slug text not null unique
);

-- Ana ilan tablosu
create table araclar (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  baslik text not null,
  marka_id smallint not null references markalar(id),
  model_id int not null references modeller(id),
  yil smallint not null,
  fiyat integer not null,
  km integer not null default 0,
  yakit yakit_tipi not null,
  vites vites_tipi not null,
  kasa kasa_tipi,
  cekis cekis_tipi,
  renk text,
  motor_hacmi smallint,
  motor_gucu smallint,
  durum arac_durumu not null default 'aktif',
  aciklama_html text,
  kapak_resim_id uuid,
  goruntulenme integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- İlan resimleri
create table arac_resimleri (
  id uuid primary key default gen_random_uuid(),
  arac_id uuid not null references araclar(id) on delete cascade,
  storage_path text not null,
  sira smallint not null default 0,
  genislik smallint,
  yukseklik smallint,
  boyut_kb smallint,
  created_at timestamptz default now()
);

-- Kapak görseli FK (kapak silinirse ilan kalsın)
alter table araclar
  add constraint fk_kapak_resim
  foreign key (kapak_resim_id) references arac_resimleri(id) on delete set null;

-- İlan donanımları (M:N)
create table arac_donanimlari (
  arac_id uuid not null references araclar(id) on delete cascade,
  donanim_id smallint not null references donanim_ozellikleri(id) on delete cascade,
  primary key (arac_id, donanim_id)
);

-- Ekspertiz (13 parça / ilan)
create table ekspertiz_parcalari (
  arac_id uuid not null references araclar(id) on delete cascade,
  parca parca_kodu not null,
  durum ekspertiz_durumu not null default 'belirtilmemis',
  primary key (arac_id, parca)
);

-- Storage çöp temizliği kuyruğu
create table silinecek_dosyalar (
  id bigserial primary key,
  storage_path text not null,
  olusturulma timestamptz default now()
);

-- updated_at otomatik güncelleme
create or replace function f_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger tg_araclar_updated
  before update on araclar
  for each row execute function f_set_updated_at();
