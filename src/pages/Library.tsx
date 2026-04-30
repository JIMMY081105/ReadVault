import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BookOpenIcon,
  FireIcon,
  ClockIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import BookCard from '../components/BookCard'
import Card from '../components/Card'
import { booksStore } from '../db/books'
import { useSettings } from '../hooks/useSettings'
import { useSyncRevision } from '../hooks/useSync'
import { todayKey } from '../utils/dateKey'
import { bookProgressPercent, formatMinutes } from '../utils/numbers'

const FILTERS = ['All', 'Reading', 'Finished', 'Unread']

export default function Library() {
  const navigate = useNavigate()
  const [settings, setSettings] = useSettings()
  useSyncRevision() // re-render after remote pull
  const books = booksStore.getAll()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [gridView, setGridView] = useState(true)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(String(settings.dailyReadingGoal))

  const startEditGoal = () => {
    setGoalDraft(String(settings.dailyReadingGoal))
    setEditingGoal(true)
  }
  const saveGoal = () => {
    const n = Math.floor(Number(goalDraft))
    if (Number.isFinite(n) && n > 0) {
      setSettings({ dailyReadingGoal: Math.min(n, 999) })
    }
    setEditingGoal(false)
  }
  const cancelGoal = () => setEditingGoal(false)
  const currentDateKey = todayKey()
  const todayPages = books.reduce((sum, book) => sum + (book.dailyStats?.[currentDateKey]?.pages ?? 0), 0)
  const totalMinutes = books.reduce((sum, book) => sum + (book.timeSpentMinutes ?? 0), 0)
  const finishedBooks = books.filter((book) => book.totalPages && book.progress >= book.totalPages).length
  const stats = [
    { label: 'Books Read', value: String(finishedBooks), icon: BookOpenIcon },
    { label: 'Day Streak', value: todayPages > 0 ? '1' : '0', icon: FireIcon },
    { label: 'Time', value: formatMinutes(totalMinutes), icon: ClockIcon },
  ]

  const filtered = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Reading' && b.progress > 0 && b.progress < b.totalPages) ||
      (activeFilter === 'Finished' && b.progress >= b.totalPages) ||
      (activeFilter === 'Unread' && b.progress === 0)

    return matchSearch && matchFilter
  })

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Library</h1>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search books or authors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full bg-surface-2 border border-white/[0.07] rounded-2xl
            pl-10 pr-4 py-2.5 text-sm text-text-primary
            placeholder:text-text-muted
            focus:outline-none focus:border-accent/40 focus:bg-surface-3
            transition-colors duration-150
          "
        />
      </div>

      {/* Filters + view toggle */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex gap-2 flex-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`
                flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                ${activeFilter === f
                  ? 'bg-accent text-black shadow-glow-sm'
                  : 'bg-surface-2 text-text-muted border border-white/[0.06] hover:border-white/10'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid / list toggle */}
        <button
          onClick={() => setGridView(!gridView)}
          className="flex-shrink-0 p-2 rounded-xl bg-surface-2 border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
        >
          {gridView
            ? <ListBulletIcon className="w-4 h-4" />
            : <Squares2X2Icon className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted mb-4">
        {filtered.length} {filtered.length === 1 ? 'book' : 'books'}
      </p>

      {/* Daily reading goal — editable */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Daily Reading Goal
        </h2>

        <Card variant="surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <BookOpenIcon className="w-5 h-5 text-accent" />
            </div>

            <div className="flex-1 min-w-0">
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    min={1}
                    max={999}
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveGoal()
                      if (e.key === 'Escape') cancelGoal()
                    }}
                    className="number-input-clean w-20 bg-surface-2 border border-accent/40 rounded-xl px-3 py-1.5 text-sm font-semibold text-text-primary focus:outline-none"
                  />
                  <span className="text-sm text-text-muted">pages / day</span>
                </div>
              ) : (
                <>
                  <p className="text-base font-semibold text-text-primary">
                    {settings.dailyReadingGoal} pages
                  </p>
                  <p className="text-2xs text-text-muted mt-0.5">
                    Shown on Home as today's target
                  </p>
                </>
              )}
            </div>

            <div className="flex-shrink-0 flex items-center gap-1">
              {editingGoal ? (
                <>
                  <button
                    onClick={saveGoal}
                    aria-label="Save goal"
                    className="p-2 rounded-xl bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelGoal}
                    aria-label="Cancel"
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditGoal}
                  aria-label="Edit goal"
                  className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Library Status
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} variant="surface" className="!p-3 text-center">
              <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-xl font-bold text-text-primary truncate">{value}</p>
              <p className="text-2xs text-text-muted mt-0.5 leading-tight">{label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Books */}
      {filtered.length > 0 ? (
        <div className={gridView
          ? 'grid grid-cols-2 gap-5'
          : 'space-y-3'
        }>
          {filtered.map((book) =>
            gridView ? (
              <BookCard key={book.id} book={book} />
            ) : (
              /* List view row */
              <div
                key={book.id}
                onClick={() => navigate(`/reader/${book.id}`)}
                className="flex items-center gap-3 bg-surface border border-white/[0.06] rounded-2xl p-3 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className={`w-10 h-14 rounded-xl flex-shrink-0 ${book.gradient}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{book.title}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{book.author}</p>
                  <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full"
                      style={{ width: `${bookProgressPercent(book)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-2 border border-white/[0.06] flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="w-7 h-7 text-text-muted" />
          </div>
          <p className="text-text-secondary font-medium">No books found</p>
          <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters</p>
        </div>
      )}

    </PageContainer>
  )
}
