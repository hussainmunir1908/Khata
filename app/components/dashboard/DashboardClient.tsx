'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LedgerEntry, Profile } from '@/types/database'
import DashboardHeader from './DashboardHeader'
import BalanceCards from './BalanceCards'
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

    // Set up real-time subscription for the current user's ledger entries
    const channel = supabase
      .channel('ledger-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'ledger',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as LedgerEntry
            setEntries((prev) => [newEntry, ...prev])
            toast.success('New transaction logged!')
          } else if (payload.eventType === 'UPDATE') {
            const updatedEntry = payload.new as LedgerEntry
            setEntries((prev) =>
              prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setEntries((prev) => prev.filter((entry) => entry.id !== deletedId))
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time ledger updates')
        } else if (err) {
          console.error('Failed to subscribe to realtime:', err)
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, supabase])

  return (
    <>
      <DashboardHeader fullName={profile?.full_name ?? null} />
      <BalanceCards entries={entries} />
      <TransactionFeed entries={entries} />
    </>
  )
}
