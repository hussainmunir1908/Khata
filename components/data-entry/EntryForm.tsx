'use client'

/**
 * components/data-entry/EntryForm.tsx
 * AI Data Entry Confirmation form with Privacy-First Contact Lookup.
 *
 * Flow:
 *  1. On mount, pre-fill from URL params (amount, name, desc, type).
 *  2. If a name is present, search the user's own ledger history for
 *     a matching person_name → auto-fill phone + associated_user_id.
 *  3. ONLY when a phone is known (from history OR manual input), look
 *     up the global profiles table by phone to get a "Verified" badge.
 *     We NEVER search profiles by name (Privacy Rule).
 *  4. If history lookup fails to find a phone, prompt the user to
 *     enter it manually, then trigger the phone → profile lookup.
 *  5. When person_name is changed manually, re-run step 2.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  CheckCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  User,
  Phone,
  FileText,
  ShieldCheck,
  PhoneCall,
  ChevronDown,
} from 'lucide-react'

type EntryType = 'debt' | 'credit'

interface EntryFormProps {
  userId: string
}

export default function EntryForm({ userId }: EntryFormProps) {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  // ── Form state ─────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState(params.get('amount') ?? '')
  const [personName, setPersonName] = useState(params.get('name') ?? '')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState(params.get('desc') ?? '')
  const [type, setType] = useState<EntryType>(
    (params.get('type') as EntryType) ?? 'debt'
  )
  const [loading, setLoading] = useState(false)

  // ── Contact-lookup state ────────────────────────────────────────────────────
  const [associatedUserId, setAssociatedUserId] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [lookingUpHistory, setLookingUpHistory] = useState(false)
  const [lookingUpPhone, setLookingUpPhone] = useState(false)
  const [phonePrompt, setPhonePrompt] = useState(false)

  // Disambiguation: list of distinct full names found in history
  type Candidate = { person_name: string; counterparty_phone: string | null; associated_user_id: string | null }
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [showCandidates, setShowCandidates] = useState(false)

  // Debounce timer for name-change re-lookup
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const candidateRef = useRef<HTMLDivElement>(null)

  // Close candidate dropdown on outside click
  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (candidateRef.current && !candidateRef.current.contains(e.target as Node)) {
        setShowCandidates(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [])

  // ── Step 3: Phone → global profiles lookup (Privacy-First) ─────────────────
  const lookupByPhone = useCallback(
    async (phoneNumber: string) => {
      if (!phoneNumber.trim()) return
      setLookingUpPhone(true)
      setIsVerified(false)
      setAssociatedUserId(null)

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('phone_number', phoneNumber.trim())
        .single()

      setLookingUpPhone(false)

      if (data) {
        setAssociatedUserId(data.id)
        setIsVerified(true)
        if (data.full_name) {
          setPersonName(data.full_name)
        }
      }
    },
    [supabase]
  )

  // ── Step 2: History-First lookup by name ───────────────────────────────────
  const lookupByName = useCallback(
    async (name: string) => {
      if (!name.trim()) return
      setLookingUpHistory(true)
      setIsVerified(false)
      setAssociatedUserId(null)
      setPhone('')
      setPhonePrompt(false)
      setCandidates([])
      setShowCandidates(false)

      // Wildcard on first token so "Ahmed" matches "Ahmed Khan" etc.
      // The user_id filter guarantees we only search this user's own data.
      const firstToken = name.trim().split(/\s+/)[0]
      const pattern = `%${firstToken}%`

      const { data: rows } = await supabase
        .from('ledger')
        .select('person_name, counterparty_phone, associated_user_id')
        .eq('user_id', userId)          // ← privacy: only MY rows
        .ilike('person_name', pattern)  // ← partial / first-name match
        .order('created_at', { ascending: false })
        .limit(20)  // fetch enough to surface all distinct people

      setLookingUpHistory(false)

      if (!rows || rows.length === 0) {
        setPhonePrompt(true)
        return
      }

      // Deduplicate by normalised full name (case-insensitive)
      const seen = new Map<string, typeof rows[0]>()
      for (const row of rows) {
        const key = row.person_name.trim().toLowerCase()
        if (!seen.has(key)) seen.set(key, row)
      }
      const unique = Array.from(seen.values())

      if (unique.length > 1) {
        // Ambiguous — show disambiguation dropdown
        setCandidates(unique)
        setShowCandidates(true)
        return
      }

      // Single unambiguous match — proceed normally
      const hit = unique[0]
      if (hit.counterparty_phone) {
        setPhone(hit.counterparty_phone)
        // Always hit profiles to ensure we pull the actual verified full_name
        await lookupByPhone(hit.counterparty_phone)
      } else {
        setPhonePrompt(true)
      }
    },
    [supabase, userId, lookupByPhone]
  )

  // ── Candidate selected from disambiguation dropdown ─────────────────────────
  const selectCandidate = useCallback(
    async (candidate: { person_name: string; counterparty_phone: string | null; associated_user_id: string | null }) => {
      setPersonName(candidate.person_name)
      setShowCandidates(false)
      setCandidates([])
      setPhone(candidate.counterparty_phone ?? '')
      setPhonePrompt(false)
      setIsVerified(false)
      setAssociatedUserId(null)

      if (candidate.counterparty_phone) {
        // Always hit profiles to ensure we pull the actual verified full_name
        await lookupByPhone(candidate.counterparty_phone)
      } else {
        setPhonePrompt(true)
      }
    },
    [lookupByPhone]
  )

  // ── On mount: if URL has a name, immediately run history lookup ─────────────
  useEffect(() => {
    const urlName = params.get('name')
    if (urlName) lookupByName(urlName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Person name manual change: debounced re-lookup ─────────────────────────
  function handleNameChange(value: string) {
    setPersonName(value)
    setIsVerified(false)
    setAssociatedUserId(null)
    setPhonePrompt(false)
    if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current)
    if (value.trim().length >= 2) {
      nameDebounceRef.current = setTimeout(() => lookupByName(value), 600)
    }
  }

  // ── Phone manual input: trigger profile lookup on blur ──────────────────────
  async function handlePhoneBlur() {
    if (phone.trim()) await lookupByPhone(phone)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsedAmount = parseFloat(amount)
    if (!personName.trim()) {
      toast.error('Person name is required.')
      return
    }
    if (!phone.trim()) {
      toast.error('Phone number is required.')
      return
    }
    if (!description.trim()) {
      toast.error('Description is required.')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount.')
      return
    }

    if (!associatedUserId) {
      toast.error('User does not exist on Khata.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('ledger').insert({
      user_id:             userId,
      amount:              parsedAmount,
      person_name:         personName.trim(),
      counterparty_phone:  phone.trim(),
      associated_user_id:  associatedUserId ?? null,
      description:         description.trim(),
      type,
    })
    setLoading(false)

    if (error) {
      toast.error(`Failed to save entry: ${error.message}`)
      return
    }

    toast.success('Entry saved successfully!')
    router.push('/dashboard')
  }

  // ── Shared input container style ────────────────────────────────────────────
  const inputWrap =
    'flex items-center gap-2 h-11 rounded-xl ring-1 ring-slate-200 dark:ring-white/10 bg-white dark:bg-slate-800 px-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all'
  const inputBase =
    'flex-1 bg-transparent outline-none border-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400'

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 relative overflow-x-hidden flex items-center justify-center px-4 py-16 transition-colors duration-300">
      {/* Ambient gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.12), transparent)',
        }}
      />

      <div className="w-full max-w-lg">
        {/* Back to Dashboard link */}
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <Card className="border-0 shadow-[0_24px_64px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.4)] bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl ring-1 ring-slate-200/80 dark:ring-white/10">
          <CardHeader className="border-b border-slate-100 dark:border-white/10 pb-5">
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Confirm Entry
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Review or adjust the details before saving to your ledger.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-5">

              {/* Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Transaction Type
                </label>
                <div className="flex rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
                  {([
                    { value: 'debt' as const,   label: '💸 I Paid (Debt)',      active: 'bg-red-500 text-white' },
                    { value: 'credit' as const, label: '💰 They Paid (Credit)', active: 'bg-emerald-500 text-white' },
                  ]).map(({ value, label, active }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        type === value
                          ? active
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Amount
                </label>
                <div className={inputWrap}>
                  <DollarSign size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-400 shrink-0">Rs</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`${inputBase} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    min={0}
                    step="any"
                    required
                  />
                </div>
              </div>

              {/* Person Name */}
              <div ref={candidateRef} className="relative">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Person Name
                </label>
                <div className={inputWrap}>
                  <User size={15} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Khan"
                    value={personName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={inputBase}
                    required
                  />
                  {lookingUpHistory && (
                    <Loader2 size={14} className="text-blue-400 animate-spin shrink-0" />
                  )}
                  {showCandidates && !lookingUpHistory && (
                    <ChevronDown size={14} className="text-blue-400 shrink-0" />
                  )}
                  {isVerified && !lookingUpHistory && !showCandidates && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                      <ShieldCheck size={14} />
                      Verified
                    </span>
                  )}
                </div>

                {/* Disambiguation dropdown */}
                {showCandidates && candidates.length > 1 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-white/10">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Multiple people found — who do you mean?
                      </p>
                    </div>
                    {candidates.map((c) => (
                      <button
                        key={c.person_name}
                        type="button"
                        onClick={() => selectCandidate(c)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">
                            {c.person_name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {c.person_name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {c.counterparty_phone ?? 'No phone on record'}
                            </p>
                          </div>
                        </div>
                        {c.associated_user_id && (
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Phone Number{' '}
                  <span className="normal-case font-normal">
                    {phonePrompt ? (
                      <span className="text-amber-500 font-semibold">— Enter to link account</span>
                    ) : (
                      ''
                    )}
                  </span>
                </label>
                <div className={`${inputWrap} ${phonePrompt ? 'ring-amber-400 ring-2' : ''}`}>
                  <Phone size={15} className={`shrink-0 ${phonePrompt ? 'text-amber-400' : 'text-slate-400'}`} />
                  <input
                    type="tel"
                    placeholder={phonePrompt ? 'Enter their number to find account…' : 'e.g. 03001234567'}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setIsVerified(false)
                      setAssociatedUserId(null)
                    }}
                    onBlur={handlePhoneBlur}
                    className={inputBase}
                    required
                  />
                  {lookingUpPhone && (
                    <Loader2 size={14} className="text-blue-400 animate-spin shrink-0" />
                  )}
                  {isVerified && !lookingUpPhone && (
                    <PhoneCall size={14} className="text-emerald-500 shrink-0" />
                  )}
                </div>
                {phonePrompt && !phone && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 ml-1">
                    No past history found for this person. Enter their phone number to auto-link their Khata account.
                  </p>
                )}
                {isVerified && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 ml-1 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Khata account found and linked automatically.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Description
                </label>
                <div className="flex items-start gap-2 rounded-xl ring-1 ring-slate-200 dark:ring-white/10 bg-white dark:bg-slate-800 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <FileText size={15} className="text-slate-400 shrink-0 mt-1" />
                  <textarea
                    placeholder="e.g. Office Supplies"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="flex-1 bg-transparent outline-none border-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none"
                    required
                  />
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex gap-3 pt-0 bg-transparent border-0">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                {loading ? 'Saving…' : 'Save to Ledger'}
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
