import { Card, CardContent } from '@/components/ui/card'
import { LedgerEntry } from '@/types/database'
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react'

type BalanceCardsProps = {
  entries: LedgerEntry[]
}

export default function BalanceCards({ entries }: BalanceCardsProps) {
  let totalOwesMe = 0 // Credits (others owe user) - Wait, 'debt' means they are in debt to me?
  // Let's adopt standard double-entry naming logic or the one specified:
  // Prompt: "type='debt' (Owes me) and type='credit' (I Owe)"
  // Okay: debt = they owe me, credit = I owe them

  let totalIOwe = 0

  entries.forEach((entry) => {
    const amount = Number(entry.amount)
    if (entry.type === 'debt') {
      totalOwesMe += amount
    } else if (entry.type === 'credit') {
      totalIOwe += amount
    }
  })

  // Net Balance: Total Owes Me (Assets) - Total I Owe (Liabilities)
  const netBalance = totalOwesMe - totalIOwe

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#3B5BDB]">
              <Activity size={16} />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Net Balance</p>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <ArrowDownRight size={16} />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Owes Me</p>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            ${totalOwesMe.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ArrowUpRight size={16} />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">I Owe</p>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            ${totalIOwe.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </CardContent>
      </Card>
    </div>
  )
}
