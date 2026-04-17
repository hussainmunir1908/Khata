/**
 * app/dashboard/page.tsx — Protected dashboard
 * Server Component: reads user from Supabase server client.
 * Middleware already redirects unauthenticated users to /login,
 * but we double-check here for defence-in-depth.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { LogOut, LayoutDashboard, Wallet, FileText, Mic } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Defence-in-depth: middleware should handle this, but just in case
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold text-[#3B5BDB] tracking-tight hover:opacity-80 transition-opacity">
            Khata
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-xs">
              {user.email}
            </span>
            {/* Sign-out via Server Action — preserves HTTP-only cookie clearing */}
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#3B5BDB] uppercase border border-[#3B5BDB]/30 rounded-full px-3 py-1 mb-4">
            Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome back 👋
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Signed in as <strong className="text-gray-700">{user.email}</strong>
          </p>
        </div>

        {/* Feature tease cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Wallet size={24} className="text-[#3B5BDB]" />,
              title: 'Ledger',
              desc: 'Your AI-organized transaction history. Coming soon.',
            },
            {
              icon: <Mic size={24} className="text-[#3B5BDB]" />,
              title: 'Voice Entry',
              desc: 'Record expenses with your voice. Coming soon.',
            },
            {
              icon: <FileText size={24} className="text-[#3B5BDB]" />,
              title: 'Receipt OCR',
              desc: 'Snap a receipt and we handle the rest. Coming soon.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4">
                {item.icon}
              </div>
              <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
              <p className="mt-1.5 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
