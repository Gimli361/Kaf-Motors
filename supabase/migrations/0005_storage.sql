-- KAF Motors — 0005 storage: 'arac-gorselleri' bucket erişim politikaları
-- Bucket Dashboard'dan "public" oluşturuldu (herkese okuma).
-- Giriş yapmış admin tarayıcıdan doğrudan yükler/siler (role = authenticated).

-- Public okuma (public bucket zaten sağlar; yine de açık tanım)
create policy "public read arac gorselleri"
  on storage.objects for select
  using (bucket_id = 'arac-gorselleri');

-- Authenticated yükleme
create policy "auth upload arac gorselleri"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'arac-gorselleri');

-- Authenticated güncelleme
create policy "auth update arac gorselleri"
  on storage.objects for update to authenticated
  using (bucket_id = 'arac-gorselleri');

-- Authenticated silme
create policy "auth delete arac gorselleri"
  on storage.objects for delete to authenticated
  using (bucket_id = 'arac-gorselleri');
