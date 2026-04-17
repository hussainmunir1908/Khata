import { LedgerEntry } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'

type TransactionFeedProps = {
  entries: LedgerEntry[]
}

export default function TransactionFeed({ entries }: TransactionFeedProps) {
  // Sort entries by created_at descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">Recent Transactions</CardTitle>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-200/50 px-2.5 py-1 rounded-full">
          {entries.length} Entries
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sortedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Use the actions above to quick log an entry, snap a receipt, or record a voice note to start building your ledger.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sortedEntries.map((entry) => {
              const isDebt = entry.type === 'debt'
              const amountStr = Number(entry.amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })

              return (
                <li key={entry.id} className="p-4 sm:px-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Circle Initial */}
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-bold uppercase text-sm shrink-0">
                      {entry.entity.charAt(0)}
                    </div>
                    
                    <div>
                      <p className="text-base font-bold text-gray-900">{entry.entity}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-gray-500">
                          {format(parseISO(entry.created_at), 'MMM d, yyyy • h:mm a')}
                        </span>
                        {entry.category && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                              {entry.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
                    <span
                      className={`text-lg font-extrabold tracking-tight ${
                        isDebt ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isDebt ? '+' : '-'}${amountStr}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm mt-1 sm:mt-0 ${
                      isDebt ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {isDebt ? 'Owes Me' : 'I Owe'}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
