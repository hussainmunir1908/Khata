'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import {
  LayoutDashboard,
  BookOpen,
  ScanLine,
  Plus,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Ledger', href: '/ledger', icon: BookOpen },
  { label: 'Scanner', href: '/dashboard/scanner', icon: ScanLine },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-screen w-64 fixed left-0 top-0 z-50 bg-white/60 backdrop-blur-md border-r border-white/20 shadow-sm">
      {/* Brand */}
      <div className="px-6 py-7 shrink-0">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-[#3B5BDB] hover:opacity-80 transition-opacity"
        >
          Khata
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">
          Financial Ledger
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#3B5BDB] text-white shadow-md shadow-blue-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-2 shrink-0">
        <button className="w-full flex items-center justify-center gap-2 bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white text-sm font-semibold py-3 rounded-full shadow-md shadow-blue-200 transition-all active:scale-95">
          <Plus size={16} strokeWidth={2.5} />
          Add Entry
        </button>

        <form action={signOut} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 py-2.5 rounded-full transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
