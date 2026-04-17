/**
 * lib/supabase/client.ts
 * Browser-side Supabase client — safe to use in 'use client' components.
 * Uses @supabase/ssr createBrowserClient for cookie-based sessions.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
