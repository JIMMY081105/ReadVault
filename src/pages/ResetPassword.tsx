import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

// Lands here from the password-reset email. Supabase auto-detects the recovery
// token in the URL hash and creates a temporary session. We then let the user
// pick a new password via supabase.auth.updateUser.
export default function ResetPassword() {
  const navigate = useNavigate()

  // 'verifying' until we know whether the URL contained a valid recovery token.
  const [status, setStatus] = useState<'verifying' | 'ready' | 'invalid'>('verifying')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let resolved = false

    // Listen for the PASSWORD_RECOVERY event Supabase emits after parsing the URL hash.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        resolved = true
        setStatus('ready')
      }
    })

    // Fallback: if Supabase already processed the URL before this listener mounted,
    // check for an existing session.
    supabase.auth.getSession().then(({ data }) => {
      if (resolved) return
      if (data.session) setStatus('ready')
      else setStatus('invalid')
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setDone(true)
      setTimeout(() => navigate('/', { replace: true }), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/40 to-purple-600/40 border border-accent/20 flex items-center justify-center mb-3">
            <BookOpenIcon className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Set a new password</h1>
        </div>

        <Card variant="surface">
          {status === 'verifying' && (
            <p className="text-sm text-text-muted text-center py-6">Verifying link…</p>
          )}

          {status === 'invalid' && (
            <div className="text-center py-2">
              <p className="text-sm text-text-primary font-medium mb-2">Link is invalid or expired</p>
              <p className="text-xs text-text-muted mb-4">
                Reset links are single-use and expire after 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 rounded-xl bg-accent text-black text-sm font-semibold"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {status === 'ready' && !done && (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-all duration-150 mt-2"
              >
                {submitting ? 'Saving…' : 'Update password'}
              </button>
            </form>
          )}

          {done && (
            <div className="text-center py-2">
              <p className="text-sm text-emerald-400 font-medium mb-1">Password updated ✓</p>
              <p className="text-xs text-text-muted">Redirecting…</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
