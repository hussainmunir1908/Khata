/**
 * app/page.tsx — Khata Landing Page
 *
 * Responsive Design Checklist:
 * ✅ Mobile layout (base): single-column, stacked sections, hamburger nav
 * ✅ Tablet layout (md/lg): 2-col grids, inline hero CTA form
 * ✅ Desktop layout (lg+): full 4-col stats, 2-col features, horizontal nav
 * ✅ Touch targets: all interactive elements ≥ 44px (min-h-[44px])
 * ✅ Icons: 16-22px mobile, 24-28px desktop via size props
 * ✅ Navigation: responsive with hamburger menu on mobile
 * ✅ Typography: fluid via text-{size} sm:text-{size} lg:text-{size} scale
 */

import Navbar from '@/app/components/Navbar'
import HeroSection from '@/app/components/HeroSection'
import FeaturesSection from '@/app/components/FeaturesSection'
import Footer from '@/app/components/Footer'
import { Toaster } from 'sonner'

export default function Home() {
  return (
    <>
      {/* Toast notifications for waitlist signup */}
      <Toaster position="top-center" richColors />

      {/* Sticky responsive navbar */}
      <Navbar />

      <main>
        {/* Hero: headline + email CTA + phone mockup */}
        <HeroSection />

        {/* Product features */}
        <FeaturesSection />
      </main>

      {/* Site footer */}
      <Footer />
    </>
  )
}
