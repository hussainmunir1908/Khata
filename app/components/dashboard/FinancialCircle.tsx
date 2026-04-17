/**
 * FinancialCircle — 2×2 grid of debt contact cards.
 * Matches the HTML reference "Financial Circle" section (left col, 7 cols).
 * Groups ledger entries by entity and shows net debt per contact.
 */
import { LedgerEntry } from '@/types/database'
import { ArrowRight } from 'lucide-react'

type Props = { entries: LedgerEntry[] }

const AVATAR_GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-cyan-400 to-sky-600',
]

function gradient(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}

export default function FinancialCircle({ entries }: Props) {
  // Aggregate by entity
  const map = new Map<string, { owesMe: number; iOwe: number }>()
  entries.forEach((e) => {
    const cur = map.get(e.entity) ?? { owesMe: 0, iOwe: 0 }
    if (e.type === 'debt') cur.owesMe += Number(e.amount)
    else cur.iOwe += Number(e.amount)
    map.set(e.entity, cur)
  })

  const people = Array.from(map.entries())
    .map(([name, { owesMe, iOwe }]) => ({ name, net: owesMe - iOwe }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 4)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <h2
          className="text-2xl font-bold text-slate-800 tracking-tight"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Financial Circle
        </h2>
        <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </button>
      </div>

      {people.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center glass-border"
          style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(16px)' }}
        >
          <p className="text-slate-500 text-sm">No contacts yet. Add a ledger entry to build your Financial Circle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map(({ name, net }) => {
            const owesMe = net > 0
            const settled = net === 0
            return (
              <div
                key={name}
                className="p-6 rounded-2xl glass-border hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(16px)' }}
              >
                <div className="flex items-center gap-4">
                  {/* Letter avatar */}
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient(name)} flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white/50 shrink-0`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {settled ? 'all settled up' : owesMe ? 'owes you' : 'you owe'}
                    </p>
                  </div>

                  <span
                    className={`font-extrabold text-lg tabular-nums shrink-0 ${
                      settled ? 'text-slate-400' : owesMe ? 'text-emerald-600' : 'text-red-500'
                    }`}
                    style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
                  >
                    Rs {Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
