/**
 * FeaturesSection — Server Component
 * Two-column layout on lg+, single column on mobile.
 * Left: badge + heading + description + sparkles
 * Right: stacked FeatureCards (Primary blue + secondary gray)
 */

import { Mic, Camera } from 'lucide-react'
import FeatureCard from './FeatureCard'

/** SVG sparkle decoration matching screenshot */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l1.5 8.5L22 12l-8.5 1.5L12 22l-1.5-8.5L2 12l8.5-1.5L12 2z" />
    </svg>
  )
}

export default function FeaturesSection() {
  return (
    <section
      id="system"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left column: text content */}
          <div className="relative order-2 lg:order-1">
            {/* Sparkle decorations */}
            <div className="absolute -top-6 right-8 lg:right-16 flex gap-2 pointer-events-none select-none">
              <Sparkle className="w-6 h-6 text-gray-200" />
              <Sparkle className="w-4 h-4 text-gray-200 mt-2" />
            </div>

            {/* Badge */}
            <span className="inline-block text-xs font-bold tracking-widest text-[#3B5BDB] uppercase border border-[#3B5BDB]/30 rounded-full px-3 py-1 mb-5">
              Fintech
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Zero Data Entry.{' '}
              <br className="hidden sm:block" />
              Pure Intelligence.
            </h2>

            {/* Body */}
            <p className="mt-5 text-base text-gray-500 leading-relaxed max-w-md">
              Our AI engine analyzes voice notes and photos of receipts to
              categorize your campus finances instantly.
            </p>
          </div>

          {/* Right column: feature cards stacked */}
          <div className="order-1 lg:order-2 flex flex-col gap-4">
            <FeatureCard
              variant="primary"
              icon={<Mic size={28} />}
              title="Voice-First Entry"
              description="Stop typing and start talking. Record a quick voice note, and our AI instantly extracts the amount, entity, and category into your ledger."
            />
            <FeatureCard
              variant="secondary"
              icon={<Camera size={28} />}
              title="Smart Receipt OCR"
              description="Snap a photo of any paper receipt or hand-written bill. We automatically structure the data so you never lose track of a single 'Parchi' again."
            />
          </div>

        </div>
      </div>
    </section>
  )
}
