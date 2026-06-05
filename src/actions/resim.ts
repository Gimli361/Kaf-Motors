"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/constants";

// image-pipeline skill: Storage'dan dosya sil (service_role ile güvenli).
// Sihirbaz kayıt başarısız olursa yüklenen yetim dosyaları temizlemek için kullanılır.
export async function depodanSil(paths: string[]): Promise<{ ok: boolean }> {
  if (!paths.length) return { ok: true };

  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false };

  const db = createAdminClient();
  const { error } = await db.storage.from(BUCKET).remove(paths);
  return { ok: !error };
}
