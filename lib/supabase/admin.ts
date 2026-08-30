import { createClient } from "@supabase/supabase-js";
import { hasSupabaseEnv, requireServerEnv } from "@/lib/env";

export function createAdminClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase is not configured");
  }

  return createClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
