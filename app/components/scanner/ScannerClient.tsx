'use client'

/**
 * ScannerClient — Client wrapper for the Scanner page.
 * Manages tab state (Scan / Manual) and image preview.
 */
import { useState } from 'react'
import { ScanLine, PencilLine } from 'lucide-react'
import UploadZone from './UploadZone'
import ManualEntryForm from './ManualEntryForm'

type Props = { userId: string }

export default function ScannerClient({ userId }: Props) {
  const [tab, setTab] = useState<'scan' | 'manual'>('scan')

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl w-fit glass-border"
        style={{ background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(16px)' }}
      >
        {([
          { key: 'scan',   label: 'Scan Receipt', icon: ScanLine },
          { key: 'manual', label: 'Manual Entry',  icon: PencilLine },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === 'scan'   && <UploadZone />}
      {tab === 'manual' && <ManualEntryForm userId={userId} />}
    </div>
  )
}
