'use client'

/**
 * Navbar — Client Component (needs state for mobile menu toggle)
 * Mobile: hamburger icon → slide-down menu
 * Desktop (lg+): horizontal nav links + CTA button
 */

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'



export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#3B5BDB] hover:opacity-80 transition-opacity"
        >
          Khata
        </Link>

        {/* Desktop right-side links — compact, close together */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="#about"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors min-h-[44px] flex items-center px-3"
          >
            About Us
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white text-sm font-semibold px-5 py-2 min-h-[44px] flex items-center transition-all hover:scale-[1.03] hover:shadow-md"
          >
            Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
          className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-gray-100',
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="flex flex-col px-4 pb-4 pt-2 gap-1">
          <li>
            <Link
              href="#about"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg py-3 px-3 transition-colors min-h-[44px] flex items-center"
            >
              About Us
            </Link>
          </li>
          <li className="pt-1">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-white bg-[#3B5BDB] hover:bg-[#2f4ac4] rounded-full py-2.5 transition-colors"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
