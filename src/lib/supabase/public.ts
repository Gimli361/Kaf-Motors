import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cookie'siz, oturumsuz anon client — 'use cache' fonksiyonlarında kullanılır.
// (Cached fonksiyonlar isteğe özel veriye — cookie/headers — erişemez.)
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
