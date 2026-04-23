import { useNavigate } from 'react-router-dom'
import { BookOpenIcon, FireIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'

// Placeholder data
const currentBook = {
  id: '1',
  title: 'The Pragmatic Programmer',
  author: 'David Thomas & Andrew Hunt',
  chapter: 'Chapter 4 — Pragmatic Paranoia',
  progress: 142,
  totalPages: 352,
  gradient: 'bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900',
}

const stats = [
  { label: 'Books Read', value: '12', icon: BookOpenIcon },
  { label: 'Day Streak', value: '7', icon: FireIcon },
  { label: 'Hours', value: '38', icon: ClockIcon },
]

const recentBooks = [
  { id: '2', title: 'Atomic Habits', progress: 91, gradient: 'bg-gradient-to-br from-orange-900 to-amber-900' },
  { id: '3', title: 'Deep Work', progress: 55, gradient: 'bg-gradient-to-br from-slate-800 to-zinc-900' },
  { id: '4', title: 'SICP', progress: 20, gradient: 'bg-gradient-to-br from-emerald-900 to-teal-900' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const navigate = useNavigate()
  const progressPercent = Math.round((currentBook.progress / currentBook.totalPages) * 100)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-text-muted mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {greeting()} 👋
        </h1>
      </div>

      {/* ── Continue Reading Card ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            Continue Reading
          </h2>
          <button
            onClick={() => navigate('/library')}
            className="text-xs text-accent flex items-center gap-0.5 hover:text-accent/80 transition-colors"
          >
            Library <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>

        <Card
          variant="elevated"
          padding={false}
          onClick={() => navigate(`/reader/${currentBook.id}`)}
          className="overflow-hidden"
        >
          <div className="flex">
            {/* Book spine / cover strip */}
            <div className={`w-24 flex-shrink-0 ${currentBook.gradient} flex items-center justify-center p-3`}>
              <BookOpenIcon className="w-8 h-8 text-white/30" />
            </div>

            {/* Info */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1">
                  {currentBook.chapter}
                </p>
                <h3 className="text-base font-bold text-text-primary leading-snug mb-0.5 truncate">
                  {currentBook.title}
                </h3>
                <p className="text-xs text-text-muted truncate">{currentBook.author}</p>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="flex justify-between text-2xs text-text-muted mb-1.5">
                  <span>{currentBook.progress} pages</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tap to continue */}
          <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {currentBook.totalPages - currentBook.progress} pages left
            </span>
            <span className="text-xs font-semibold text-accent">
              Continue →
            </span>
          </div>
        </Card>
      </section>

      {/* ── Today's Goal ── */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Today's Goal
        </h2>

        <Card variant="surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-text-primary font-semibold">30 pages</p>
              <p className="text-xs text-text-muted mt-0.5">Daily reading target</p>
            </div>
            <div className="relative w-14 h-14">
              {/* Circular progress placeholder */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" strokeWidth="4" className="stroke-white/[0.06] fill-none" />
                <circle
                  cx="28" cy="28" r="22" strokeWidth="4"
                  className="stroke-accent fill-none"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - 0.6)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent">
                60%
              </span>
            </div>
          </div>

          <div className="h-px bg-white/[0.05] mb-4" />

          <div className="flex justify-between text-center">
            <div>
              <p className="text-base font-bold text-text-primary">18</p>
              <p className="text-2xs text-text-muted mt-0.5">Pages today</p>
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">12</p>
              <p className="text-2xs text-text-muted mt-0.5">Remaining</p>
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">~24m</p>
              <p className="text-2xs text-text-muted mt-0.5">Est. time</p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Stats Row ── */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Your Stats
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} variant="surface" className="!p-3 text-center">
              <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-xl font-bold text-text-primary">{value}</p>
              <p className="text-2xs text-text-muted mt-0.5 leading-tight">{label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Up Next ── */}
      <section className="mb-4">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Up Next
        </h2>

        <div className="space-y-2.5">
          {recentBooks.map((book) => {
            const pct = book.progress
            return (
              <Card
                key={book.id}
                variant="surface"
                padding={false}
                onClick={() => navigate(`/reader/${book.id}`)}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className={`w-10 h-14 rounded-xl flex-shrink-0 ${book.gradient}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{book.title}</p>
                    <div className="mt-1.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/60 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-2xs text-text-muted mt-1">{pct}% complete</p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </PageContainer>
  )
}
