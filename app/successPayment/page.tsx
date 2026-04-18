'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, CreditCard, CalendarClock, ReceiptText, UserCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

function Receipt() {
  const p = useSearchParams()

  const id      = p.get('id')      ?? ''
  const payer   = p.get('payer')   ?? 'You'
  const payee   = p.get('payee')   ?? 'Unknown'
  const amount  = p.get('amount')  ?? '0'
  const desc    = p.get('desc')    ?? 'Ledger Settlement'
  const ts      = p.get('ts')      ?? new Date().toISOString()

  const amountFmt = Number(amount).toLocaleString('en-US')
  const dateFmt   = format(parseISO(ts), 'PPpp')
  const txId      = id.substring(0, 8).toUpperCase() || '—'

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-100 to-slate-100" />

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 max-w-sm w-full border border-slate-100 overflow-hidden z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">

        {/* Green header */}
        <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={100} />
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-8 ring-emerald-400">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
            Payment Sent
          </h1>
          <p className="text-emerald-100 font-medium mt-1">Status: Success</p>
        </div>

        {/* Amount */}
        <div className="px-8 pt-8 pb-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
          <h2 className="text-5xl font-extrabold text-slate-800 tracking-tighter" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
            <span className="text-3xl text-slate-300 pr-1">Rs</span>{amountFmt}
          </h2>
        </div>

        {/* Receipt rows */}
        <div className="px-8 pb-6 text-sm divide-y divide-dashed divide-slate-200">
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-500 flex items-center gap-2"><UserCheck size={15} /> Paid By</span>
            <span className="font-bold text-slate-800">{payer}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-500 flex items-center gap-2"><CreditCard size={15} /> Paid To</span>
            <span className="font-bold text-slate-800">{payee}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-500 flex items-center gap-2"><ReceiptText size={15} /> Transaction ID</span>
            <span className="font-medium text-slate-800 tabular-nums">#{txId}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-500 flex items-center gap-2"><CalendarClock size={15} /> Date &amp; Time</span>
            <span className="font-medium text-slate-800 text-right max-w-[160px]">{dateFmt}</span>
          </div>
          {desc && (
            <div className="flex justify-between items-start py-3">
              <span className="text-slate-500 shrink-0 mr-4">Notes</span>
              <span className="font-medium text-slate-800 text-right break-words">{desc}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <Link
            href="/dashboard"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Loading receipt…</p>
      </div>
    }>
      <Receipt />
    </Suspense>
  )
}
