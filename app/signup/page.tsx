'use client'

/**
 * app/signup/page.tsx
 * Signup with: full name, phone number, email, password, confirm password.
 * On success: inserts a row into public.profiles, then routes straight to /dashboard.
 * No email-verification screen — email confirmation is disabled in Supabase dashboard.
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

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)

    // ── Client-side validation ──────────────────────────────────────────────
    if (!fullName.trim()) {
      setFieldError('Please enter your full name.')
      return
    }
    if (!phoneNumber.trim()) {
      setFieldError('Please enter your phone number.')
      return
    }
    // Basic phone sanity: at least 7 digits present
    if (!/\d{7,}/.test(phoneNumber.replace(/[\s\-+()]/g, ''))) {
      setFieldError('Please enter a valid phone number.')
      return
    }
    if (!email || !password || !confirmPassword) {
      setFieldError('Please fill in all fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Please enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters.')
      toast.error('Weak password', { description: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // ── Step 1: Create auth user ────────────────────────────────────────
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        const msg = authError.message.toLowerCase()
        const code = (authError as { code?: string }).code ?? ''

        if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
          toast.error('Too many attempts', {
            description: 'Please wait a few minutes and try again.',
            duration: 8000,
          })
          setFieldError('Email rate limit reached. Please try again shortly.')
        } else if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
          toast.error('Email already registered', { description: 'Try logging in instead.' })
          setFieldError('This email is already registered.')
        } else {
          toast.error('Signup failed', { description: authError.message })
          setFieldError(authError.message)
        }
        return
      }

      const userId = authData.user?.id
      if (!userId) {
        toast.error('Signup failed', { description: 'Could not retrieve user. Please try again.' })
        return
      }

      // ── Step 2: Upsert profile row ──────────────────────────────────────
      // Supabase may auto-create a bare profile row (id only, NULLs) via a
      // trigger the moment auth.users is inserted. Using upsert with
      // onConflict:'id' handles both: creates the row if missing, or updates
      // the trigger-created row with the real name + phone data.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: fullName.trim(),
            phone_number: phoneNumber.trim(),
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        // Only treat as phone-duplicate if the constraint name mentions phone_number
        const isPhoneDuplicate =
          profileError.code === '23505' &&
          (profileError.message.toLowerCase().includes('phone_number') ||
            profileError.message.toLowerCase().includes('phone'))

        if (isPhoneDuplicate) {
          toast.error('Phone number already in use', {
            description: 'This phone number is linked to another account.',
          })
          setFieldError('This phone number is already registered.')
          await supabase.auth.signOut()
          return
        }
        // Non-critical profile error — user is signed in, warn but proceed
        toast.warning('Account created, but profile save failed.', {
          description: profileError.message,
        })
      }

      // ── Step 3: Redirect straight to dashboard ──────────────────────────
      toast.success('Account created! Welcome to Khata 🎉')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Network error', { description: 'Please check your connection and try again.' })
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
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gray-900">Sign up</CardTitle>
            <CardDescription>Start organizing your finances with AI</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} noValidate className="flex flex-col gap-5">

              {/* Field error banner */}
              {fieldError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5"
                >
                  {fieldError}
                </p>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
                  Full name
                </Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Muhammad Ali"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-lg px-4"
                  aria-required="true"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-lg px-4"
                  aria-required="true"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-lg px-4"
                  aria-required="true"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                  <span className="ml-1 text-xs font-normal text-gray-400">(min. 8 characters)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-lg px-4 pr-11"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t bg-gray-50/80">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#3B5BDB] hover:underline">
                Log in here
              </Link>
            </p>
          </CardFooter>
        </Card>

      </div>
    </main>
  )
}
