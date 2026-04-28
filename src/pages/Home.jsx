import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'
import { booksStore } from '../db/books'
import { goalsStore } from '../db/goals'
import { todayKey } from '../utils/dateKey'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
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
  const [revision, setRevision] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const refresh = () => setRevision((r) => r + 1)

  const books = booksStore.getAll()
  const tKey = todayKey()
  const goals = goalsStore.getForDate(tKey)
  const completedCount = goals.filter((g) => goalsStore.isCompletedOn(g, tKey)).length

  const currentBook = books.find((book) => book.progress > 0 && book.progress < book.totalPages) ?? books[0]
  const todayPages = books.reduce((sum, book) => sum + (book.dailyStats?.[tKey]?.pages ?? 0), 0)
  const todayMinutes = books.reduce((sum, book) => sum + (book.dailyStats?.[tKey]?.timeMinutes ?? 0), 0)
  const dailyGoal = 30
  const goalPct = Math.min(100, Math.round((todayPages / dailyGoal) * 100))
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const toggleGoal = (goal, dateKey, completed) => {
    goalsStore.markCompleted(goal.id, dateKey, completed)
    refresh()
  }

  const editGoal = (goal) => { setEditingGoal(goal); setFormOpen(true) }
  const deleteGoal = (goal) => {
    if (confirm(`Delete "${goal.type}" goal?`)) {
      goalsStore.delete(goal.id)
      refresh()
    }
  }

  const submitForm = (input) => {
    if (editingGoal) goalsStore.update(editingGoal.id, input)
    else goalsStore.create(input)
    setFormOpen(false)
    setEditingGoal(null)
    refresh()
  }

  // Force re-render via revision key (state map kept simple)
  void revision

  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-sm text-text-muted mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {greeting()}
        </h1>
      </div>

      {/* ─ Goals for Today ─────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            Goals for Today
          </h2>
          <button
            onClick={() => { setEditingGoal(null); setFormOpen(true) }}
            className="text-xs text-accent flex items-center gap-0.5 hover:text-accent/80 transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {goals.length === 0 ? (
          <Card variant="surface" className="text-center py-6">
            <p className="text-sm text-text-secondary mb-1">No goals for today yet.</p>
            <p className="text-2xs text-text-muted mb-3">
              Add one here, or schedule from the Calendar.
            </p>
            <button
              onClick={() => { setEditingGoal(null); setFormOpen(true) }}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80"
            >
              <PlusIcon className="w-4 h-4" /> New goal
            </button>
          </Card>
        ) : (
          <>
            <p className="text-2xs text-text-muted mb-2">
              {completedCount} of {goals.length} done
            </p>
            <div className="space-y-2.5">
              {goals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  dateKey={tKey}
                  completed={goalsStore.isCompletedOn(g, tKey)}
                  onToggle={toggleGoal}
                  onEdit={editGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          </>
        )}
      </section>

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
              <p className="text-base font-bold text-text-primary">{formatMinutes(todayMinutes)}</p>
              <p className="text-2xs text-text-muted mt-0.5">Total time</p>
            </div>
          </div>
        </Card>
      </section>

      <GoalForm
        open={formOpen}
        initial={editingGoal}
        defaultDate={tKey}
        onClose={() => { setFormOpen(false); setEditingGoal(null) }}
        onSubmit={submitForm}
      />
    </PageContainer>
  )
}
