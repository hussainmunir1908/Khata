'use client'

/**
 * app/login/page.tsx
 * Accepts email OR phone number as the identifier.
 *
 * Detection logic:
 *  - If input matches email format  → sign in directly with email + password
 *  - Otherwise (treated as phone)    → call Supabase RPC `get_email_by_phone`
 *                                       to resolve the email, then sign in
 *
 * The RPC function must exist in Supabase (see SQL below):
 *   CREATE OR REPLACE FUNCTION get_email_by_phone(phone_input text)
 *   RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 *     SELECT au.email FROM auth.users au
 *     INNER JOIN public.profiles p ON p.id = au.id
 *     WHERE p.phone_number = phone_input LIMIT 1;
 *   $$;
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')   // email or phone
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)

    if (!identifier.trim() || !password) {
      setFieldError('Please fill in all fields.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const isEmail = EMAIL_RE.test(identifier.trim())
      let emailToUse = identifier.trim()

      // ── Phone path: resolve email via RPC ──────────────────────────────
      if (!isEmail) {
        const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
          'get_email_by_phone',
          { phone_input: identifier.trim() }
        )

        if (rpcError) {
          toast.error('Lookup failed', { description: rpcError.message })
          setFieldError('Could not look up this phone number. Please try with your email.')
          return
        }
        if (!resolvedEmail) {
          toast.error('Phone number not found', {
            description: 'No account is linked to this phone number.',
          })
          setFieldError('No account found for this phone number.')
          return
        }
        emailToUse = resolvedEmail as string
      }

      // ── Sign in with email + password ──────────────────────────────────
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (
          msg.includes('invalid login') ||
          msg.includes('invalid credentials') ||
          msg.includes('email not confirmed')
        ) {
          toast.error('Invalid credentials', {
            description: 'Please check your details and try again.',
          })
          setFieldError('Incorrect email/phone or password.')
        } else {
          toast.error('Login failed', { description: error.message })
          setFieldError(error.message)
        }
        return
      }

      toast.success('Login successful! Redirecting…')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Network error', { description: 'Please check your connection.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d8e4ff] via-[#eef2ff] to-white px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-extrabold text-[#3B5BDB] tracking-tight hover:opacity-80 transition-opacity"
          >
            Khata
          </Link>
          <p className="mt-1 text-sm text-gray-500">Welcome back</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gray-900">Sign in</CardTitle>
            <CardDescription>Use your email or phone number</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">

              {/* Field-level error banner */}
              {fieldError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5"
                >
                  {fieldError}
                </p>
              )}

              {/* Email or phone */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  Email or phone number
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com  or  +92 300 1234567"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-lg px-4"
                  aria-required="true"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-lg px-4 pr-11"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-full bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#3B5BDB]/60 text-white font-semibold text-sm py-3 min-h-[44px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t bg-gray-50/80">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#3B5BDB] hover:underline">
                Sign up here
              </Link>
            </p>
          </CardFooter>
        </Card>

      </div>
    </main>
  )
}
