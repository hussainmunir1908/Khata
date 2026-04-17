'use client'

/**
 * ManualEntryForm — Manual ledger entry form for the Scanner page.
 * Fields: Amount (Rs prefix), Vendor, Category (styled select), Type, Notes.
 * Submits to Supabase ledger table.
 */
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Groceries',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Other',
]

type Props = { userId: string }

export default function ManualEntryForm({ userId }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount:   '',
    entity:   '',
    category: '',
    type:     'debt' as 'debt' | 'credit',
    notes:    '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || !form.entity) {
      toast.error('Amount and Vendor are required.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('ledger').insert({
      user_id:  userId,
      amount:   parseFloat(form.amount),
      entity:   form.entity.trim(),
      category: form.category || null,
      type:     form.type,
    })
    setSaving(false)
    if (error) {
      toast.error('Failed to save entry. Please try again.')
    } else {
      toast.success('Entry logged successfully!')
      setForm({ amount: '', entity: '', category: '', type: 'debt', notes: '' })
    }
  }

  const inputClass =
    'w-full bg-white/60 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl overflow-hidden glass-border shadow-xl divide-y divide-white/40 dark:divide-white/10 bg-white/65 dark:bg-slate-800/60 backdrop-blur-2xl transition-colors duration-300"
    >
      <div className="px-6 pt-6 pb-2">
        <h2
          className="text-lg font-bold text-slate-800 dark:text-slate-100"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Manual Entry
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Fill in the details to log a transaction</p>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Amount with Rs prefix */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Amount
          </label>
          <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-white/60 overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 transition-all">
            <span className="px-4 py-3 text-sm font-bold text-slate-500 bg-slate-100/60 border-r border-slate-200 shrink-0 select-none">
              Rs
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none tabular-nums"
              required
            />
          </div>
        </div>

        {/* Vendor */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Vendor / Person
          </label>
          <input
            type="text"
            placeholder="e.g. Ahmed, Monal Restaurant"
            value={form.entity}
            onChange={(e) => set('entity', e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Category — styled select */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Category
          </label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {/* Custom chevron */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Type toggle — Owes Me / I Owe */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Transaction Type
          </label>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white/60">
            {([
              { value: 'debt',   label: 'Owes Me (debt)' },
              { value: 'credit', label: 'I Owe (credit)'  },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('type', value)}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  form.type === value
                    ? value === 'debt'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes (optional) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Notes <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Any extra details…"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 py-5">
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.01] active:scale-95 transition-all"
        >
          {saving
            ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
            : <><CheckCircle size={18} /> Log Entry</>
          }
        </button>
      </div>
    </form>
  )
}
