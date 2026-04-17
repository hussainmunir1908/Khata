/**
 * BalanceSummary — Full-width hero balance card.
 * Matches the HTML reference "Balance Summary" section.
 */
import { LedgerEntry } from '@/types/database'
import { TrendingUp, Zap, BarChart2 } from 'lucide-react'

type Props = { entries: LedgerEntry[] }

export default function BalanceSummary({ entries }: Props) {
  let owesMe = 0
  let iOwe = 0
  entries.forEach((e) => {
    const amt = Number(e.amount)
    if (e.type === 'debt') owesMe += amt
    else iOwe += amt
  })
  const net = owesMe - iOwe
  const isPositive = net >= 0

  // Month-over-month placeholder: show this month's credits vs debts
  const now = new Date()
  const monthlyCredit = entries
    .filter((e) => {
      const d = new Date(e.created_at)
      return e.type === 'debt' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, e) => s + Number(e.amount), 0)

  return (
    <section className="relative group overflow-hidden rounded-2xl glass-border shadow-[0_20px_40px_rgba(44,52,55,0.08)] bg-white/40 dark:bg-slate-800/50 backdrop-blur-2xl transition-colors duration-300">
      {/* Decorative blurred orb */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-8 sm:p-10">
        <p className="text-slate-500 font-medium tracking-widest uppercase text-xs mb-2">
          Total Balance
        </p>

        <div className="flex flex-wrap items-baseline gap-4 mb-8">
          <h1
            className={`text-5xl sm:text-6xl font-extrabold tracking-tighter tabular-nums drop-shadow-sm ${
              isPositive ? 'text-slate-800' : 'text-red-600'
            }`}
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            {isPositive ? '' : '-'}Rs {Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </h1>

          {monthlyCredit > 0 && (
            <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full glass-border">
              <TrendingUp size={12} />
              +Rs {monthlyCredit.toLocaleString()} this month
            </span>
          )}
        </div>

        {/* 3-col mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Net Balance', value: `${isPositive ? '+' : '-'}Rs ${Math.abs(net).toLocaleString()}`, color: isPositive ? 'text-blue-700' : 'text-red-600' },
            { label: 'Owes Me', value: `Rs ${owesMe.toLocaleString()}`, color: 'text-emerald-700' },
            { label: 'I Owe', value: `Rs ${iOwe.toLocaleString()}`, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/25 dark:bg-white/5 rounded-xl p-4 glass-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
              <p className={`text-xl font-extrabold tabular-nums ${color}`}
                style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all">
            <Zap size={16} />
            Quick Settle
          </button>
          <button
          className="flex items-center gap-2 text-slate-700 dark:text-slate-200 px-7 py-3 rounded-xl font-bold text-sm glass-border hover:bg-white/20 dark:hover:bg-white/10 active:scale-95 transition-all bg-white/20 dark:bg-white/5 backdrop-blur-sm"
          >
            <BarChart2 size={16} />
            Detailed Report
          </button>
        </div>
      </div>
    </section>
  )
}
