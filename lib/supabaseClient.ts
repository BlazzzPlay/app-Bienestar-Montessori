import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _browserClient: SupabaseClient | null = null

function getBrowserClient(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _browserClient
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getBrowserClient()[prop as keyof SupabaseClient]
  },
})

export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
