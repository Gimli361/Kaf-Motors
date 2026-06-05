-- KAF Motors — 0006 cron: Storage GC zamanlaması (Katman B güvenlik ağı)
--
-- `silinecek_dosyalar` kuyruğunu işleyen `temizlik` Edge Function'ını her 10 dakikada
-- bir çağırır. pg_cron job'ı pg_net ile fonksiyonun HTTP endpoint'ine POST atar.
--
-- ÖN KOŞUL (bir kez, bu migration'dan ÖNCE Vault'a service_role anahtarını ekle):
--   select vault.create_secret('<SUPABASE_SERVICE_ROLE_KEY>', 'service_role_key');
--   -- (Dashboard > Project Settings > Vault üzerinden de eklenebilir.)
-- Anahtar Vault'ta şifreli durur; cron.job tablosunda düz metin anahtar tutulmaz.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: var olan job'u önce kaldır (migration yeniden çalıştırılabilsin).
select cron.unschedule('temizlik-gc')
where exists (select 1 from cron.job where jobname = 'temizlik-gc');

select cron.schedule(
  'temizlik-gc',
  '*/10 * * * *',  -- her 10 dakikada bir
  $$
  select net.http_post(
    url := 'https://jwwamaqjcmsvhvswusgz.supabase.co/functions/v1/temizlik',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 8000
  );
  $$
);

-- Doğrulama:
--   select jobname, schedule, active from cron.job where jobname = 'temizlik-gc';
--   select * from cron.job_run_details order by start_time desc limit 5;
