-- KAF Motors — 0003 RLS: satır güvenliği
-- anon: yalnız aktif ilanları okur. admin (profiles kaydı olan): tam yetki.
-- Admin yazma işlemleri Server Action'da service_role ile yapılır (RLS bypass).

-- Referans tabloları: herkese okuma açık
alter table markalar enable row level security;
alter table modeller enable row level security;
alter table donanim_ozellikleri enable row level security;
create policy "public read markalar" on markalar for select using (true);
create policy "public read modeller" on modeller for select using (true);
create policy "public read donanim" on donanim_ozellikleri for select using (true);

-- profiles: kullanıcı yalnız kendi kaydını görür
alter table profiles enable row level security;
create policy "self read profiles" on profiles for select using (auth.uid() = id);

-- Yardımcı: oturum sahibinin admin olup olmadığı
create or replace function f_is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles p where p.id = auth.uid());
$$;

-- araclar
alter table araclar enable row level security;
create policy "public aktif araclar" on araclar for select using (durum = 'aktif');
create policy "admin all araclar" on araclar for all
  using (f_is_admin()) with check (f_is_admin());

-- arac_resimleri (yalnız aktif ilanların görselleri public)
alter table arac_resimleri enable row level security;
create policy "public aktif resimler" on arac_resimleri for select using (
  exists (select 1 from araclar a where a.id = arac_id and a.durum = 'aktif')
);
create policy "admin all resimler" on arac_resimleri for all
  using (f_is_admin()) with check (f_is_admin());

-- ekspertiz_parcalari
alter table ekspertiz_parcalari enable row level security;
create policy "public aktif ekspertiz" on ekspertiz_parcalari for select using (
  exists (select 1 from araclar a where a.id = arac_id and a.durum = 'aktif')
);
create policy "admin all ekspertiz" on ekspertiz_parcalari for all
  using (f_is_admin()) with check (f_is_admin());

-- arac_donanimlari
alter table arac_donanimlari enable row level security;
create policy "public aktif donanim" on arac_donanimlari for select using (
  exists (select 1 from araclar a where a.id = arac_id and a.durum = 'aktif')
);
create policy "admin all arac_donanim" on arac_donanimlari for all
  using (f_is_admin()) with check (f_is_admin());

-- silinecek_dosyalar: yalnız service_role (RLS açık, policy yok = anon/auth erişemez)
alter table silinecek_dosyalar enable row level security;
