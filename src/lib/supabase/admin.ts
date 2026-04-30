import { createClient } from "@supabase/supabase-js";

// ⚠️ SOLO para Server Actions y API Routes que necesitan bypass RLS
// NUNCA exponer al cliente
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
