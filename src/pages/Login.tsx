import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup'

export default function Login() {
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && session) navigate('/', { replace: true })
  }, [session, authLoading, navigate])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/', { replace: true })
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) {
        setError(error.message)
      } else if (data.user && !data.session) {
        setMessage('Check your inbox to confirm your email, then sign in.')
      } else {
        // confirmation disabled in supabase — user is signed in immediately
        navigate('/', { replace: true })
      }
    }
    setSubmitting(false)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/40 to-purple-600/40 border border-accent/20 flex items-center justify-center mb-3">
            <BookOpenIcon className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">ReadVault</h1>
          <p className="text-sm text-text-muted mt-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <Card variant="surface">
          {/* Mode toggle */}
          <div className="flex p-1 bg-surface-2 rounded-xl mb-5 gap-1">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors duration-150 ${
                mode === 'signin' ? 'bg-accent text-black' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors duration-150 ${
                mode === 'signup' ? 'bg-accent text-black' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-all duration-150 mt-2"
            >
              {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="text-2xs text-text-muted text-center mt-4 leading-relaxed">
              We'll send a confirmation link to your email.<br />
              You must verify your email before signing in.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
