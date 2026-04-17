'use client'

import { useState } from 'react'
import { Camera, Mic, Loader2, SlidersHorizontal } from 'lucide-react'

type DashboardHeaderProps = {
  fullName: string | null
}

export default function DashboardHeader({ fullName }: DashboardHeaderProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleRecordToggle = () => {
    setIsRecording(!isRecording)
    // TODO: Integrate actual recording logic later
  }

  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      {/* Title */}
      <div>
        <h1
          className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none"
          style={{ fontFamily: 'var(--font-headline, var(--font-sans))' }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-2 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold bg-white/70 border border-white/50 text-gray-600 hover:text-[#3B5BDB] hover:border-blue-200 transition-all shadow-sm backdrop-blur-sm">
          <Camera size={14} />
          <span>Snap Receipt</span>
        </button>
        <button
          onClick={handleRecordToggle}
          className={`flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold border transition-all shadow-sm backdrop-blur-sm ${
            isRecording
              ? 'bg-red-500 border-red-400 text-white animate-pulse'
              : 'bg-white/70 border-white/50 text-gray-600 hover:text-[#3B5BDB] hover:border-blue-200'
          }`}
        >
          {isRecording ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
          <span>{isRecording ? 'Recording...' : 'Record'}</span>
        </button>
        <button className="flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold bg-white/70 border border-white/50 text-gray-500 hover:text-gray-700 transition-all shadow-sm backdrop-blur-sm">
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>
      </div>
    </div>
  )
}
