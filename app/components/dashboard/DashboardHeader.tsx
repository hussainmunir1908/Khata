'use client'

import { useState } from 'react'
import { Plus, Camera, Mic, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DashboardHeaderProps = {
  fullName: string | null
}

export default function DashboardHeader({ fullName }: DashboardHeaderProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleRecordToggle = () => {
    setIsRecording(!isRecording)
    // TODO: Integrate actual recording logic later
  }

  const initial = fullName ? fullName.charAt(0).toUpperCase() : 'U'
  const displayName = fullName ? fullName.split(' ')[0] : 'User'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
      {/* Greeting & Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#3B5BDB] text-white text-xl font-bold font-serif shadow-sm">
          {initial}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-0.5">
            Overview
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
            Welcome back, {displayName}
          </h1>
        </div>
      </div>

      {/* Top-Level Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button variant="outline" className="gap-2 h-11 text-gray-700 font-medium w-full sm:w-auto shadow-sm">
          <Camera size={18} />
          <span>Snap Receipt</span>
        </Button>
        <Button className="gap-2 h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium w-full sm:w-auto shadow-sm">
          <Plus size={18} />
          <span>Quick Log</span>
        </Button>
        <button
          onClick={handleRecordToggle}
          className={`flex items-center justify-center gap-2 h-11 px-5 rounded-md font-medium text-white transition-all shadow-sm ${
            isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#3B5BDB] hover:bg-[#2f4ac4]'
          } w-full sm:w-auto`}
        >
          {isRecording ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
          <span>{isRecording ? 'Recording...' : 'Hold to Record'}</span>
        </button>
      </div>
    </div>
  )
}
