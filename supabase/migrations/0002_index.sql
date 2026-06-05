-- KAF Motors — 0002 index: filtreleme performansı (partial index disiplini)

-- Ziyaretçi sorgularının %100'ü durum='aktif' → partial index'ler
create index ix_araclar_aktif_listeleme on araclar (created_at desc) where durum = 'aktif';
create index ix_araclar_marka on araclar (marka_id) where durum = 'aktif';
create index ix_araclar_model on araclar (model_id) where durum = 'aktif';
create index ix_araclar_fiyat on araclar (fiyat)    where durum = 'aktif';
create index ix_araclar_yil   on araclar (yil)      where durum = 'aktif';
create index ix_araclar_yakit on araclar (yakit)    where durum = 'aktif';
create index ix_araclar_vites on araclar (vites)    where durum = 'aktif';

-- En yaygın kombinasyon: Marka + Model + Fiyat sıralama
create index ix_araclar_marka_model_fiyat
  on araclar (marka_id, model_id, fiyat) where durum = 'aktif';

-- İlişkili tablolar
create index ix_resim_arac     on arac_resimleri (arac_id, sira);
create index ix_modeller_marka on modeller (marka_id);
create index ix_donanim_arac   on arac_donanimlari (donanim_id);
