import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'
import { goalsStore } from '../db/goals'
import { useSyncRevision } from '../hooks/useSync'
import { toDateKey, todayKey, formatPrettyDate } from '../utils/dateKey'
import type { DateKey, Goal, GoalInput } from '../types'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function Calendar() {
  const now = new Date()
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selectedKey, setSelectedKey] = useState<DateKey>(todayKey())
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [revision, setRevision] = useState(0)
  useSyncRevision() // re-render after remote pull

  const refresh = () => setRevision((r) => r + 1)
  void revision

  const { year, month } = viewDate
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const todayK = todayKey()

  // All goals — used to mark dots on the calendar grid for the visible month.
  const allGoals = goalsStore.getAll()
  const daysWithGoals = useMemo(() => {
    const set = new Set<number>()
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toDateKey(new Date(year, month, d))
      if (allGoals.some((g) => goalsStore.isActiveOn(g, key))) set.add(d)
    }
    return set
  }, [allGoals, year, month, daysInMonth, revision])

  const selectedGoals = goalsStore.getForDate(selectedKey)
  const selectedCompletedCount = selectedGoals.filter((g) => goalsStore.isCompletedOn(g, selectedKey)).length

  const prevMonth = () => setViewDate(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
  )
  const nextMonth = () => setViewDate(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
  )

  const cells: Array<number | null> = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const toggleGoal = (goal: Goal, dateKey: DateKey, completed: boolean) => {
    goalsStore.markCompleted(goal.id, dateKey, completed)
    refresh()
  }
  const editGoal = (goal: Goal) => { setEditingGoal(goal); setFormOpen(true) }
  const deleteGoal = (goal: Goal) => {
    if (!goal.recurrence || goal.recurrence === 'none') {
      if (confirm('Delete this goal?')) {
        goalsStore.delete(goal.id)
        refresh()
      }
      return
    }
    // Recurring: offer stop-from-today vs full delete
    const choice = prompt(
      'This is a repeating goal. Type "stop" to stop it from today onward, or "delete" to remove it entirely.',
      'stop',
    )
    if (choice === 'stop') {
      // End yesterday so today and future occurrences stop appearing.
      const y = new Date()
      y.setDate(y.getDate() - 1)
      goalsStore.stopRecurring(goal.id, toDateKey(y))
      refresh()
    } else if (choice === 'delete') {
      goalsStore.delete(goal.id)
      refresh()
    }
  }

  const submitForm = (input: GoalInput) => {
    if (editingGoal) goalsStore.update(editingGoal.id, input)
    else goalsStore.create(input)
    setFormOpen(false)
    setEditingGoal(null)
    refresh()
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-6">Calendar</h1>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl bg-surface-2 border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors active:scale-95"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h2 className="text-base font-semibold text-text-primary">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl bg-surface-2 border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors active:scale-95"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <Card variant="surface" className="mb-6 !p-4">
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-2xs font-semibold text-text-muted py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />

            const cellKey = toDateKey(new Date(year, month, day))
            const isToday = cellKey === todayK
            const isSelected = cellKey === selectedKey
            const hasGoals = daysWithGoals.has(day)

            return (
              <div key={day} className="flex flex-col items-center py-1">
                <button
                  onClick={() => setSelectedKey(cellKey)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-150 active:scale-90
                    ${isSelected
                      ? 'bg-accent text-black font-bold shadow-glow-sm'
                      : isToday
                        ? 'ring-1 ring-accent/60 text-text-primary hover:bg-white/[0.06]'
                        : hasGoals
                          ? 'text-text-primary hover:bg-white/[0.06]'
                          : 'text-text-muted hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {day}
                </button>
                {hasGoals && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-accent/60 mt-0.5" />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-2xs text-text-muted">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            <span className="text-2xs text-text-muted">Has goals</span>
          </div>
        </div>
      </Card>

      {/* Goals for the selected date */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Goals
            </h2>
            <p className="text-sm text-text-primary font-medium mt-0.5">
              {formatPrettyDate(selectedKey)}
              {selectedKey === todayK && (
                <span className="ml-2 text-2xs text-accent font-semibold uppercase tracking-wider">Today</span>
              )}
            </p>
          </div>
          <button
            onClick={() => { setEditingGoal(null); setFormOpen(true) }}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80"
          >
            <PlusIcon className="w-4 h-4" /> New
          </button>
        </div>

        {selectedGoals.length === 0 ? (
          <Card variant="surface" className="text-center py-6">
            <p className="text-sm text-text-secondary">No goals for this day.</p>
            <p className="text-2xs text-text-muted mt-1">Tap "New" to add one.</p>
          </Card>
        ) : (
          <>
            <p className="text-2xs text-text-muted mb-2">
              {selectedCompletedCount} of {selectedGoals.length} done
            </p>
            <div className="space-y-2.5">
              {selectedGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  dateKey={selectedKey}
                  completed={goalsStore.isCompletedOn(g, selectedKey)}
                  onToggle={toggleGoal}
                  onEdit={editGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <GoalForm
        open={formOpen}
        initial={editingGoal}
        defaultDate={selectedKey}
        onClose={() => { setFormOpen(false); setEditingGoal(null) }}
        onSubmit={submitForm}
      />
    </PageContainer>
  )
}
