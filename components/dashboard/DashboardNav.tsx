'use client'

/**
 * DashboardNav — Shared glassmorphic top navbar for all dashboard pages.
 * Features:
 *  - Dark mode toggle (moon/sun) — persists via localStorage
 *  - Avatar dropdown with Settings + Sign Out options
 *  - Outside-click closes dropdown
 *  - Active nav item derived from usePathname()
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/actions/auth'
import { Search, Bell, Moon, Sun, Settings, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Ledger',   href: '/dashboard/ledger' },
  { label: 'Scanner',  href: '/dashboard/scanner' },
]

type Props = { displayName: string }

export default function DashboardNav({ displayName }: Props) {
  const pathname = usePathname()
  const initial  = displayName.charAt(0).toUpperCase()

  // ── Dark mode ──────────────────────────────────────────────
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Restore saved preference or respect system preference
    const saved = localStorage.getItem('khata-dark')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'true' || (saved === null && prefersDark)) {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  function toggleDark() {
    const isDark = document.documentElement.classList.toggle('dark')
    setDark(isDark)
    localStorage.setItem('khata-dark', String(isDark))
  }

  // ── Account dropdown ───────────────────────────────────────
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-8 py-3 rounded-full glass-border shadow-[0_20px_40px_rgba(44,52,55,0.06)] bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl transition-colors duration-300">

        {/* ── Brand + Nav ── */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black text-blue-700 dark:text-blue-400 tracking-tight hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            Khata
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1 text-sm font-semibold transition-all ${
                    active
                      ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 rounded-none pb-0.5'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 rounded-full'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center rounded-full px-4 py-1.5 gap-2 glass-border bg-white/40 dark:bg-white/5 backdrop-blur-md">
            <Search size={15} className="text-slate-500 dark:text-slate-400 shrink-0" />
            <input
              className="bg-transparent border-none outline-none text-sm w-44 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Search transactions..."
              type="text"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-all">
            <Bell size={18} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-all"
          >
            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* ── Avatar + dropdown ── */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Account menu"
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center border-2 border-white/60 shadow-sm transition-colors"
            >
              {initial}
            </button>

            {/* Dropdown panel */}
            {open && (
              <div className="absolute right-0 top-[3.25rem] w-52 rounded-2xl glass-border shadow-2xl overflow-hidden z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl">
                {/* User info */}
                <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/10">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {displayName}
                  </p>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left">
                    <Settings size={15} className="shrink-0" />
                    Settings
                  </button>

                  <form action={signOut} className="w-full">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={15} className="shrink-0" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
