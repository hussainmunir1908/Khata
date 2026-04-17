/**
 * lib/supabase/server.ts
 * Server-side Supabase client — for Server Components, Server Actions, Route Handlers.
 * Uses Next.js 16 async cookies() API.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Next.js 16: cookies() is async
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll() may throw in Server Components (read-only context).
            // Middleware handles re-setting cookies; this is safe to ignore here.
          }
        },
      },
    }
  )
}
