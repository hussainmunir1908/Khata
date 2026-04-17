/**
 * app/actions/auth.ts — Server Actions for auth operations
 * Server Actions run on the server, so they can safely clear HTTP-only cookies.
 * 'use server' makes this file's exports callable as server actions from client components.
 */
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Signs the current user out and redirects to the home page. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
