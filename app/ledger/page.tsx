import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { Toaster } from 'sonner'

import LedgerClient from '@/components/khata-ledger/LedgerClient'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileNav from '@/components/dashboard/MobileNav'
import FabMenu from '@/components/dashboard/FabMenu'
import { Profile, LedgerEntry } from '@/types/database'

export default async function LedgerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: rawEntries } = await supabase
    .from('ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let initialEntries = rawEntries || []

  // Fetch exact names for associated users (join fallback)
  const associatedUserIds = Array.from(new Set(initialEntries.map((e) => e.associated_user_id).filter(Boolean))) as string[]
  if (associatedUserIds.length > 0) {
    const { data: relatedProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', associatedUserIds)

    if (relatedProfiles) {
      const profileMap = Object.fromEntries(relatedProfiles.map((p) => [p.id, p]))
      initialEntries = initialEntries.map((e) => ({
        ...e,
        profiles: e.associated_user_id ? profileMap[e.associated_user_id] : null,
      }))
    }
  }

  const displayName = profile?.full_name || user.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden text-gray-800">
      <Toaster position="top-right" />

      {/* ── Fixed Top Navbar ── */}
      <DashboardNav displayName={displayName} />

      {/* ── Main Content ── */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Financial Circle</h1>
            <p className="text-slate-500 mt-1 text-base">Keep track of who owes who.</p>
          </div>
        </div>

        <LedgerClient
          profile={profile as Profile | null}
          initialEntries={(initialEntries as LedgerEntry[]) ?? []}
        />
      </main>

      {/* ── FAB ── */}
      <FabMenu />

      <MobileNav />
    </div>
  )
}
