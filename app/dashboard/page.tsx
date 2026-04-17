/**
 * app/dashboard/page.tsx — Protected dashboard
 * Server Component: reads user from Supabase server client.
 * Middleware already redirects unauthenticated users to /login,
 * but we double-check here for defence-in-depth.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'
import DashboardClient from '@/app/components/dashboard/DashboardClient'
import { Profile, LedgerEntry } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Defence-in-depth: middleware should handle this, but just in case
  if (!user) redirect('/login')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch initial ledger entries
  const { data: initialEntries } = await supabase
    .from('ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shrink-0">
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold text-[#3B5BDB] tracking-tight hover:opacity-80 transition-opacity">
            Khata
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-xs">
              {profile?.full_name || user.email}
            </span>
            {/* Sign-out via Server Action — preserves HTTP-only cookie clearing */}
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <DashboardClient
          profile={profile as Profile | null}
          initialEntries={(initialEntries as LedgerEntry[]) || []}
        />
      </main>
    </div>
  )
}
