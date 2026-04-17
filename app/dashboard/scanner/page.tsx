/**
 * app/dashboard/scanner/page.tsx — Khata Scanner Page
 * Server Component: auth check + profile fetch, then renders scanner UI.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, LayoutGrid, TrendingUp, Wallet, User } from 'lucide-react'
import DashboardNav from '@/app/components/dashboard/DashboardNav'
import ScannerClient from '@/app/components/scanner/ScannerClient'

export default async function ScannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email || 'User'

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 relative overflow-x-hidden transition-colors duration-300">
      {/* Grain texture overlay */}
      <div className="grain-overlay fixed inset-0 -z-10" aria-hidden="true" />

      {/* Shared navbar — active item is "Scanner" via usePathname */}
      <DashboardNav displayName={displayName} />

      {/* Main scanner content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1
            className="text-3xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            Receipt Scanner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Snap a photo or upload a receipt to auto-log an entry
          </p>
        </div>

        <ScannerClient userId={user.id} />
      </main>

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.35)] hover:scale-110 active:scale-95 transition-all z-50 group"
        style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
        aria-label="Add entry"
      >
        <Plus size={28} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20" />
      </button>

      {/* Mobile bottom nav */}
      <footer
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-2 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] glass-border"
        style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(24px)' }}
      >
        {([
          { icon: LayoutGrid, label: 'Home',     active: false, href: '/dashboard' },
          { icon: TrendingUp, label: 'Insights',  active: false, href: '#' },
          { icon: Wallet,     label: 'Wallets',   active: false, href: '#' },
          { icon: User,       label: 'Profile',   active: false, href: '#' },
        ] as const).map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex flex-col items-center justify-center p-3 rounded-full transition-all ${
              active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110'
                : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </button>
        ))}
      </footer>
    </div>
  )
}
