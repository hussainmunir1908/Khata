'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LedgerEntry, Profile } from '@/types/database'
import { toast } from 'sonner'
import TransactionList from './TransactionList'

type Props = {
  profile: Profile | null
  initialEntries: LedgerEntry[]
}

export default function LedgerClient({ profile, initialEntries }: Props) {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries)
  const supabase = createClient()

  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('ledger-realtime-circle')
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
            setEntries((prev) => prev.filter((e) => e.id !== (payload.old as LedgerEntry).id))
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Ledger realtime error:', err)
      })

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id, supabase])

  return (
    <div className="space-y-10">
      <TransactionList entries={entries} profile={profile} />
    </div>
  )
}
