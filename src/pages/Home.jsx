import { useNavigate } from 'react-router-dom'
import { BookOpenIcon, FireIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import { booksStore } from '../db/books'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function getLocalDateKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function formatMinutes(value) {
  const minutes = Math.max(0, Math.floor(Number(value) || 0))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours && rest) return `${hours}h ${rest}m`
  if (hours) return `${hours}h`
  return `${rest}m`
}

function progressPercent(book) {
  if (!book?.totalPages) return 0
  return Math.min(100, Math.round((book.progress / book.totalPages) * 100))
}

export default function Home() {
  const navigate = useNavigate()
  const books = booksStore.getAll()
  const todayKey = getLocalDateKey()
  const currentBook = books.find((book) => book.progress > 0 && book.progress < book.totalPages) ?? books[0]
  const upNext = books.filter((book) => book.id !== currentBook?.id).slice(0, 3)
  const todayPages = books.reduce((sum, book) => sum + (book.dailyStats?.[todayKey]?.pages ?? 0), 0)
  const totalMinutes = books.reduce((sum, book) => sum + (book.timeSpentMinutes ?? 0), 0)
  const finishedBooks = books.filter((book) => book.totalPages && book.progress >= book.totalPages).length
  const dailyGoal = 30
  const goalPct = Math.min(100, Math.round((todayPages / dailyGoal) * 100))
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const stats = [
    { label: 'Books Read', value: String(finishedBooks), icon: BookOpenIcon },
    { label: 'Day Streak', value: todayPages > 0 ? '1' : '0', icon: FireIcon },
    { label: 'Time', value: formatMinutes(totalMinutes), icon: ClockIcon },
  ]

  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-sm text-text-muted mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {greeting()}
        </h1>
      </div>

      {currentBook && (
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
              <div className={`w-24 flex-shrink-0 ${currentBook.gradient} flex items-center justify-center p-3`}>
                <BookOpenIcon className="w-8 h-8 text-white/30" />
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-1">
                    Introduction
                  </p>
                  <h3 className="text-base font-bold text-text-primary leading-snug mb-0.5 truncate">
                    {currentBook.title}
                  </h3>
                  <p className="text-xs text-text-muted truncate">{currentBook.author}</p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-2xs text-text-muted mb-1.5">
                    <span>{currentBook.progress} pages</span>
                    <span>{progressPercent(currentBook)}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent(currentBook)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {Math.max(0, currentBook.totalPages - currentBook.progress)} pages left
              </span>
              <span className="text-xs font-semibold text-accent">
                Continue
              </span>
            </div>
          </Card>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Today's Goal
        </h2>

        <Card variant="surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-text-primary font-semibold">{dailyGoal} pages</p>
              <p className="text-xs text-text-muted mt-0.5">Daily reading target</p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" strokeWidth="4" className="stroke-white/[0.06] fill-none" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  strokeWidth="4"
                  className="stroke-accent fill-none"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - goalPct / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent">
                {goalPct}%
              </span>
            </div>
          </div>

          <div className="h-px bg-white/[0.05] mb-4" />

          <div className="flex justify-between text-center">
            <div>
              <p className="text-base font-bold text-text-primary">{todayPages}</p>
              <p className="text-2xs text-text-muted mt-0.5">Pages today</p>
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">{Math.max(0, dailyGoal - todayPages)}</p>
              <p className="text-2xs text-text-muted mt-0.5">Remaining</p>
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">{formatMinutes(totalMinutes)}</p>
              <p className="text-2xs text-text-muted mt-0.5">Total time</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Your Stats
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

      {upNext.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
            Up Next
          </h2>

          <div className="space-y-2.5">
            {upNext.map((book) => {
              const pct = progressPercent(book)
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
      )}
    </PageContainer>
  )
}
