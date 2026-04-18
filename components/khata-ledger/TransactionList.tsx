'use client'

import { LedgerEntry, Profile } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { Receipt, BellRing, CreditCard, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import PaymentModal from '@/components/payment/PaymentModal'
import { useState } from 'react'

type Props = { 
  entries: LedgerEntry[]
  profile: Profile | null
}

const PAGE_SIZE = 8

export default function TransactionList({ entries, profile }: Props) {
  const supabase = createClient()
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [page, setPage] = useState(1)

  async function handleAction(e: React.MouseEvent, entry: LedgerEntry, action: 'remind' | 'pay') {
    e.preventDefault()
    if (action === 'pay') {
      setPayingEntryId(entry.id)
      return
    }

    if (!entry.associated_user_id) {
      toast.error('User not registered yet.')
      return
    }
    if (!profile) {
      toast.error('Complete your profile to use this feature.')
      return
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: entry.associated_user_id,
      sender_id: profile.id,
      ledger_id: entry.id,
      type: 'reminder',
      message: `${profile.full_name || 'Someone'} has reminded you to settle a balance of Rs ${entry.amount}.`,
    })

    if (error) {
      toast.error(`Failed to send reminder: ${error.message}`)
    } else {
      toast.success('Reminder sent!')
    }
  }
  // To track Pending vs Paid, we compute a per-user net balance
  const contactNet = new Map<string, number>()
  entries.forEach(e => {
    const key = e.profiles?.full_name || e.person_name
    const cur = contactNet.get(key) || 0
    contactNet.set(key, cur + (e.type === 'debt' ? Number(e.amount) : -Number(e.amount)))
  })

  // Filter entries based on the current tab
  const filteredEntries = entries.filter((e) => {
    if (filter === 'all') return true
    
    const isEntryPaid = e.status === 'paid' || (e.description && e.description.includes('[PAID]'))
    
    const key = e.profiles?.full_name || e.person_name
    const net = contactNet.get(key) || 0
    const isContactPaid = Math.abs(net) <= 0.01

    if (filter === 'pending') return !isEntryPaid && !isContactPaid
    if (filter === 'paid') return isEntryPaid || isContactPaid
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedEntries = filteredEntries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <section className="relative pb-24 sm:pb-0">
      <PaymentModal entryId={payingEntryId} onClose={() => setPayingEntryId(null)} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-lg font-bold text-gray-800">All Transactions</h2>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'pending', 'paid'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setFilter(t); setPage(1) }}
              className={`flex-1 sm:flex-none uppercase tracking-widest text-[10px] font-bold px-4 py-2 rounded-lg transition-all ${
                filter === t 
                  ? 'bg-white shadow-sm text-slate-800' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Receipt className="text-slate-300 mb-3" size={40} />
            <p className="font-semibold text-slate-500">No transactions yet.</p>
            <p className="text-sm text-slate-400 mt-1">Add a ledger entry to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Person
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Amount
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedEntries.map((entry) => {
                  const isOwedToMe = entry.type === 'debt'
                  const isPaid = entry.status === 'paid' || (entry.description && entry.description.includes('[PAID]'))
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {format(parseISO(entry.created_at), 'MMM d, yyyy')}
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {format(parseISO(entry.created_at), 'h:mm a')}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-gray-700 max-w-[200px]">
                        <span className="block truncate">
                          {entry.description || <span className="text-gray-400 italic">No description</span>}
                        </span>
                      </td>

                      {/* Person */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold shrink-0"
                          >
                            {(entry.profiles?.full_name || entry.person_name).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 truncate">
                            {entry.profiles?.full_name || entry.person_name}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`font-bold tabular-nums ${isOwedToMe ? 'text-blue-600' : 'text-red-600'}`}>
                          {isOwedToMe ? '+' : '−'} <span className="text-xs">Rs</span> {Number(entry.amount).toLocaleString()}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {isOwedToMe ? 'Owed by' : 'Owed to'} {entry.profiles?.full_name || entry.person_name}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        ) : isOwedToMe ? (
                          <button
                            onClick={(e) => handleAction(e, entry, 'remind')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
                          >
                            <BellRing size={12} /> Send Reminder
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleAction(e, entry, 'pay')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            <CreditCard size={12} /> Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 px-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-xs text-gray-400">
            Page {safePage} of {totalPages}
          </p>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
