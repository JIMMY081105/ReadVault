import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { booksStore } from '../db/books'

interface Props {
  open: boolean
  onClose: () => void
  onAdded?: () => void
}

const GRADIENTS = [
  'bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-950',
  'bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950',
  'bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-950',
  'bg-gradient-to-br from-amber-800 via-orange-900 to-rose-950',
  'bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-950',
  'bg-gradient-to-br from-slate-800 via-zinc-900 to-stone-950',
]

function uid(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export default function BookForm({ open, onClose, onAdded }: Props) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle('')
      setAuthor('')
      setTotalPages('')
      setError(null)
    }
  }, [open])

  if (!open) return null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    const a = author.trim()
    const p = Math.floor(Number(totalPages) || 0)

    if (!t) return setError('Enter a title.')
    if (!a) return setError('Enter an author.')
    if (p <= 0) return setError('Total pages must be greater than 0.')

    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)] ?? GRADIENTS[0]!
    const result = booksStore.add({
      id: uid(),
      title: t,
      author: a,
      genre: 'General',
      language: 'en',
      totalPages: p,
      progress: 0,
      gradient,
      description: '',
      year: new Date().getFullYear(),
    })

    if (!result) return setError('Could not add book.')
    onAdded?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-surface-2 border border-white/[0.08] rounded-3xl shadow-elevated overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <BookOpenIcon className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm font-semibold text-text-primary">Add a book</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 pb-5 space-y-3">
          <div>
            <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
              Title
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Great Gatsby"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="F. Scott Fitzgerald"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
              Total pages
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="180"
              className="number-input-clean w-full px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-accent text-black font-semibold text-sm active:scale-[0.98] transition-all duration-150 mt-2"
          >
            Add to library
          </button>
        </form>
      </div>
    </div>
  )
}
