import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { booksStore } from '../db/books'
import { todayKey } from '../utils/dateKey'
import type { Book, DateKey } from '../types'

interface Props {
  open: boolean
  book: Book | null
  defaultDate?: DateKey
  onClose: () => void
  onLogged?: () => void
}

export default function LogSessionForm({ open, book, defaultDate, onClose, onLogged }: Props) {
  const [pages, setPages] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState<DateKey>(defaultDate || todayKey())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPages('')
      setMinutes('')
      setDate(defaultDate || todayKey())
      setError(null)
    }
  }, [open, defaultDate])

  if (!open || !book) return null

  const remaining = Math.max(0, book.totalPages - book.progress)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const p = Math.floor(Number(pages) || 0)
    const m = Math.floor(Number(minutes) || 0)
    if (p <= 0 && m <= 0) {
      setError('Enter pages or minutes (or both).')
      return
    }
    if (p > remaining) {
      setError(`Only ${remaining} pages left in this book.`)
      return
    }
    booksStore.addReadingSession(book.id, { pages: p, minutes: m, date })
    onLogged?.()
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
            <div className="min-w-0">
              <p className="text-2xs uppercase tracking-widest text-text-muted">Log session</p>
              <p className="text-sm font-semibold text-text-primary truncate">{book.title}</p>
            </div>
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
              Pages read <span className="text-text-muted/60 normal-case lowercase tracking-normal">({remaining} left)</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={remaining}
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="0"
              className="number-input-clean w-full px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
              Minutes
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="number-input-clean w-full px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.06] text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-2xs uppercase tracking-widest text-text-muted block mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={todayKey()}
              onChange={(e) => setDate(e.target.value as DateKey)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.06] text-text-primary text-sm focus:outline-none focus:border-accent/50 transition-colors"
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
            Save session
          </button>
        </form>
      </div>
    </div>
  )
}
