-- KAF Motors — 0004 GC: yetim görsel temizliği güvenlik ağı + admin profili otomasyonu

-- Bir arac_resimleri satırı silindiğinde (cascade dahil) storage path'i kuyruğa yaz.
-- Edge Function 'temizlik' (pg_cron) bu kuyruğu işleyip Storage'dan dosyayı siler.
create or replace function f_kuyruga_ekle()
returns trigger language plpgsql as $$
begin
  insert into silinecek_dosyalar (storage_path) values (old.storage_path);
  return old;
end; $$;

create trigger tg_resim_silindi
  after delete on arac_resimleri
  for each row execute function f_kuyruga_ekle();

-- Yeni auth kullanıcısı oluşunca otomatik profiles kaydı (gelecekteki adminler için)
create or replace function f_yeni_kullanici()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, ad_soyad)
  values (new.id, coalesce(new.raw_user_meta_data->>'ad_soyad', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger tg_auth_user_created
  after insert on auth.users
  for each row execute function f_yeni_kullanici();
