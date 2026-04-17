'use client'

/**
 * app/signup/page.tsx
 * Email + password + confirm password signup form.
 * On success: Supabase sends a verification email.
 * Shows a "check your email" message rather than immediately redirecting,
 * since the user must verify before their session is active.
 */

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)

    // Client-side validation
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
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) {
        // Map specific Supabase error codes to friendly messages
        const msg = error.message.toLowerCase()
        const code = (error as { code?: string }).code ?? ''

        if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
          toast.error('Too many attempts', {
            description: 'Email rate limit reached. Please wait a few minutes and try again, or disable email confirmation in your Supabase dashboard.',
            duration: 8000,
          })
          setFieldError('Email rate limit reached. Please wait a few minutes and try again.')
        } else if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('user already')
        ) {
          toast.error('This email is already registered', {
            description: 'Try logging in instead.',
          })
          setFieldError('This email is already registered.')
        } else {
          // Always surface the actual Supabase message so nothing is silent
          toast.error('Signup failed', { description: error.message })
          setFieldError(error.message)
        }
        return
      }

      // Success — Supabase sends a verification email
      toast.success('Check your email to verify your account 📬', {
        description: 'We sent a confirmation link to ' + email,
        duration: 6000,
      })
      setVerificationSent(true)
    } catch {
      toast.error('Network error', { description: 'Please check your connection.' })
    } finally {
      setLoading(false)
    }
  }

  // Post-signup success state
  if (verificationSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d8e4ff] via-[#eef2ff] to-white px-4 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <MailCheck className="text-[#3B5BDB]" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Verify your email</h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            We sent a confirmation link to <strong className="text-gray-800">{email}</strong>.
            <br />Click the link to activate your account.
          </p>
          <p className="mt-6 text-sm text-gray-400">
            Already verified?{' '}
            <Link href="/login" className="font-semibold text-[#3B5BDB] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    )
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
              <Link
                href="/login"
                className="font-semibold text-[#3B5BDB] hover:underline"
              >
                Log in here
              </Link>
            </p>
          </CardFooter>
        </Card>

      </div>
    </main>
  )
}
