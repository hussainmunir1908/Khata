import { LedgerEntry } from '@/types/database'
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react'

type BalanceCardsProps = {
  entries: LedgerEntry[]
}

export default function BalanceCards({ entries }: BalanceCardsProps) {
  let totalOwesMe = 0
  let totalIOwe = 0

  entries.forEach((entry) => {
    const amount = Number(entry.amount)
    if (entry.type === 'debt') {
      totalOwesMe += amount
    } else if (entry.type === 'credit') {
      totalIOwe += amount
    }
  })

  const netBalance = totalOwesMe - totalIOwe
  const isPositive = netBalance >= 0

  const cards = [
    {
      label: 'NET BALANCE',
      value: netBalance,
      prefix: isPositive ? '+Rs ' : '-Rs ',
      absValue: Math.abs(netBalance),
      icon: Activity,
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#3B5BDB]',
      valueColor: isPositive ? 'text-[#3B5BDB]' : 'text-red-500',
      accentBar: isPositive ? 'bg-[#3B5BDB]' : 'bg-red-400',
    },
    {
      label: 'OWES ME',
      value: totalOwesMe,
      prefix: 'Rs ',
      absValue: totalOwesMe,
      icon: ArrowDownRight,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
      accentBar: 'bg-emerald-400',
    },
    {
      label: 'I OWE',
      value: totalIOwe,
      prefix: 'Rs ',
      absValue: totalIOwe,
      icon: ArrowUpRight,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      valueColor: 'text-red-500',
      accentBar: 'bg-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {cards.map(({ label, prefix, absValue, icon: Icon, iconBg, iconColor, valueColor, accentBar }) => (
        <div
          key={label}
          className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          {/* Accent top bar */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentBar}`} />

          <div className="p-6">
            {/* Label + icon */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                {label}
              </p>
              <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center`}>
                <Icon size={17} className={iconColor} strokeWidth={2.5} />
              </div>
            </div>

            {/* Amount */}
            <p
              className={`text-3xl font-extrabold tabular-nums tracking-tight ${valueColor}`}
              style={{ fontFamily: 'var(--font-headline, var(--font-sans))' }}
            >
              {prefix}
              {absValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            {/* Entry count */}
            <p className="text-xs text-gray-400 mt-1.5 font-medium">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
