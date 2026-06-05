// KAF Motors — Edge Function: temizlik (Storage GC)
//
// image-pipeline skill / Katman B (güvenlik ağı):
//   arac_resimleri AFTER DELETE trigger'ı silinen storage_path'i `silinecek_dosyalar`
//   kuyruğuna yazar. Bu fonksiyon pg_cron ile (~10 dk) çağrılır; kuyruğu işleyip
//   dosyaları Storage'dan siler ve işlenen satırları kuyruktan kaldırır.
//
// SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY runtime'a otomatik enjekte edilir.
// verify_jwt=true (config.toml) → yalnız geçerli JWT (cron service_role) çağırabilir.

import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKET = "arac-gorselleri";
const BATCH = 100; // her çalıştırmada en fazla bu kadar kuyruk satırı işle

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // En eski kuyruk satırlarını al (FIFO).
  const { data: rows, error } = await supabase
    .from("silinecek_dosyalar")
    .select("id, storage_path")
    .order("id", { ascending: true })
    .limit(BATCH);

  if (error) return json({ ok: false, hata: error.message }, 500);
  if (!rows || rows.length === 0) return json({ ok: true, silinen: 0 });

  // Aynı path birden fazla satırda olabilir → tekilleştir. remove() idempotenttir.
  const paths = [...new Set(rows.map((r) => r.storage_path))];

  const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
  // Sert hata (yetki/ağ) → kuyruğu BOŞALTMA; bir sonraki cron tekrar dener.
  if (rmErr) return json({ ok: false, hata: rmErr.message }, 500);

  // Storage'dan silindi → kuyruk satırlarını temizle.
  const ids = rows.map((r) => r.id);
  const { error: delErr } = await supabase
    .from("silinecek_dosyalar")
    .delete()
    .in("id", ids);

  if (delErr) return json({ ok: false, hata: delErr.message }, 500);

  return json({ ok: true, silinen: paths.length, kuyruk_satir: ids.length });
});
