'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LedgerEntry, Profile } from '@/types/database'
import BalanceSummary from './BalanceSummary'
import FinancialCircle from './FinancialCircle'
import TransactionFeed from './TransactionFeed'
import { toast } from 'sonner'

type DashboardClientProps = {
  profile: Profile | null
  initialEntries: LedgerEntry[]
}

export default function DashboardClient({ profile, initialEntries }: DashboardClientProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries)
  const supabase = createClient()

  useEffect(() => {
    if (!profile?.id) return

    // Real-time subscription for the current user's ledger entries
    const channel = supabase
      .channel('ledger-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ledger',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prev) => [payload.new as LedgerEntry, ...prev])
            toast.success('New transaction logged!')
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as LedgerEntry
            setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) => prev.filter((e) => e.id !== payload.old.id))
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscribe error:', err)
      })

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id, supabase])

  return (
    <div className="space-y-10">
      {/* Balance Summary — full width hero card */}
      <BalanceSummary entries={entries} />

      {/* Asymmetric grid: Financial Circle (left 7) + Transaction Feed (right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <FinancialCircle entries={entries} />
        </div>
        <aside className="lg:col-span-5">
          <TransactionFeed entries={entries} />
        </aside>
      </div>
    </div>
  )
}
