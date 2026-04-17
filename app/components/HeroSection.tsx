'use client'

/**
 * HeroSection — Client Component (email input needs onChange/state)
 * Mobile-first layout:
 *   - Centered text at all sizes
 *   - Email + CTA stacks vertically on mobile, inline on sm+
 *   - Phone mockup displayed below on mobile, centered on md+
 */

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PhoneMockup from './PhoneMockup'
import { toast } from 'sonner'

export default function HeroSection() {
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    toast.success('You\'re on the waitlist! 🎉', {
      description: 'We\'ll be in touch shortly.',
    })
    setEmail('')
  }

  return (
    <section
      id="overview"
      /* Periwinkle gradient background matching screenshot */
      className="relative overflow-hidden bg-gradient-to-b from-[#d8e4ff] via-[#e4ecff] to-[#f0f4ff] pt-28 pb-0 sm:pt-32"
    >
      {/* Subtle radial glow in top-center */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-300/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-2xl mx-auto">
          Zero Data Entry.{' '}
          <span className="text-[#3B5BDB]">Pure Intelligence.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
          Our AI engine analyzes voice notes and photos of receipts to categorize
          your campus finances instantly.
        </p>

        {/* Email waitlist form */}
        <form
          id="waitlist"
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none"
        >
          <div className="relative w-full sm:w-64">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for waitlist"
              /* min-h-[44px] for accessible touch target */
              className="pl-9 pr-4 min-h-[44px] rounded-full border-gray-200 bg-white/90 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#3B5BDB] w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto rounded-full bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white font-semibold text-sm px-6 min-h-[44px] transition-all hover:scale-[1.03] hover:shadow-lg whitespace-nowrap"
          >
            Join Waitlist
          </Button>
        </form>

        {/* Phone mockup — sits at bottom of hero flowing into white background */}
        <div className="mt-16 flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}
