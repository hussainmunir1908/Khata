/**
 * app/dashboard/page.tsx — Protected dashboard
 * Server Component: reads user from Supabase server client.
 * Matches the HTML reference design:
 *  - Fixed glassmorphic top navbar (Khata + nav + search + actions + avatar)
 *  - Animated radial gradient background + grain overlay
 *  - Floating Action Button (FAB)
 *  - Mobile bottom nav
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { Search, Bell, Settings, Plus, LayoutGrid, TrendingUp, Wallet, User } from 'lucide-react'
import DashboardClient from '@/components/dashboard/DashboardClient'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { Profile, LedgerEntry } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: initialEntries } = await supabase
    .from('ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const displayName = profile?.full_name || user.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 relative overflow-x-hidden transition-colors duration-300">
      {/* Grain/noise texture overlay */}
      <div className="grain-overlay fixed inset-0 -z-10" aria-hidden="true" />

      {/* ── Shared top navbar ── */}
      <DashboardNav displayName={displayName} />

      {/* ── Main content ── */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-10">
        <DashboardClient
          profile={profile as Profile | null}
          initialEntries={(initialEntries as LedgerEntry[]) || []}
        />
      </main>

      {/* ── FAB ── */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group"
        style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
        aria-label="Add entry"
      >
        <Plus size={28} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20" />
      </button>

      {/* ── Mobile Bottom Nav ── */}
      <footer
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-2 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] glass-border"
        style={{ background: 'rgba(255,255,255,0.30)', backdropFilter: 'blur(24px)' }}
      >
        {(
          [
            { icon: LayoutGrid, label: 'Home', href: '/dashboard', active: true },
            { icon: TrendingUp, label: 'Ledger', href: '/ledger', active: false },
            { icon: Wallet, label: 'Wallets', href: '#', active: false },
            { icon: User, label: 'Profile', href: '#', active: false },
          ] as const
        ).map(({ icon: Icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 ${
              active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110'
                : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </Link>
        ))}
      </footer>
    </div>
  )
}
