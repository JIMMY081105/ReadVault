import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import { goalsStore } from '../db/goals'
import { toDateKey } from '../utils/dateKey'
import { GOAL_TYPES, formatGoalTitle } from '../utils/goalTypes'
import type { Goal, GoalTypeId } from '../types'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Week starts Sunday — matches Calendar.tsx convention.
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  return `${fmt(start)} → ${fmt(end)}`
}

// Tailwind needs these classes to appear literally for JIT to pick them up.
const CELL_COLOR: Record<GoalTypeId, string> = {
  gym:        'bg-orange-500/25 text-orange-300',
  water:      'bg-sky-500/25 text-sky-300',
  salah:      'bg-emerald-500/25 text-emerald-300',
  app_limit:  'bg-fuchsia-500/25 text-fuchsia-300',
  quran:      'bg-amber-500/25 text-amber-300',
  protein:    'bg-red-500/25 text-red-300',
}

export default function Reports() {
  const [anchor, setAnchor] = useState<Date>(() => new Date())

  const weekStart = useMemo(() => startOfWeek(anchor), [anchor])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const dayKeys = useMemo(() => days.map(toDateKey), [days])
  const todayK = toDateKey(new Date())

  const allGoals = goalsStore.getAll()

  // A goal appears in the week's table if it's active on at least one day this week.
  const weekGoals: Goal[] = useMemo(() => {
    return allGoals
      .filter((g) => dayKeys.some((k) => goalsStore.isActiveOn(g, k)))
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  }, [allGoals, dayKeys])

  // Aggregate stats — totals across all goals × days in this week
  const stats = useMemo(() => {
    let scheduled = 0
    let completed = 0
    for (const g of weekGoals) {
      for (const k of dayKeys) {
        if (!goalsStore.isActiveOn(g, k)) continue
        scheduled += 1
        if (goalsStore.isCompletedOn(g, k)) completed += 1
      }
    }
    const pct = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100)
    return { scheduled, completed, pct }
  }, [weekGoals, dayKeys])

  const prevWeek = () => setAnchor((d) => addDays(d, -7))
  const nextWeek = () => setAnchor((d) => addDays(d, 7))
  const thisWeek = () => setAnchor(new Date())

  const isThisWeek = useMemo(() => {
    const tw = startOfWeek(new Date()).getTime()
    return weekStart.getTime() === tw
  }, [weekStart])

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-6">Weekly Report</h1>

      {/* Week navigator */}
      <Card variant="surface" className="mb-6 !p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={prevWeek}
            aria-label="Previous week"
            className="p-2 rounded-xl bg-surface-2 border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors active:scale-95"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <button
            onClick={thisWeek}
            className="text-center group"
          >
            <p className="text-base font-semibold text-text-primary">
              {formatRange(days[0]!, days[6]!)}
            </p>
            <p className="text-2xs text-text-muted mt-0.5 uppercase tracking-wider">
              {isThisWeek ? 'This week' : 'Tap for current week'}
            </p>
          </button>

          <button
            onClick={nextWeek}
            aria-label="Next week"
            className="p-2 rounded-xl bg-surface-2 border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors active:scale-95"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Summary */}
      <Card variant="surface" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs text-text-muted uppercase tracking-widest mb-1">Completion</p>
            <p className="text-2xl font-bold text-text-primary">
              {stats.completed}<span className="text-text-muted text-base font-medium"> / {stats.scheduled}</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">check-ins this week</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" strokeWidth="5" className="stroke-white/[0.06] fill-none" />
              <circle
                cx="32" cy="32" r="26" strokeWidth="5"
                className="stroke-accent fill-none"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - stats.pct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-accent">
              {stats.pct}%
            </span>
          </div>
        </div>
      </Card>

      {/* Grid */}
      {weekGoals.length === 0 ? (
        <Card variant="surface" className="text-center py-8">
          <p className="text-sm text-text-secondary">No goals scheduled this week.</p>
          <p className="text-2xs text-text-muted mt-1">Add goals from Home or Calendar to see them here.</p>
        </Card>
      ) : (
        <Card variant="surface" padding={false} className="overflow-hidden">
          {/* Day header */}
          <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(7,minmax(0,1fr))] items-center px-3 pt-3 pb-2">
            <div /> {/* label column */}
            {days.map((d, i) => {
              const k = dayKeys[i]!
              const isToday = k === todayK
              return (
                <div key={k} className="flex flex-col items-center">
                  <span className={`text-2xs font-semibold uppercase tracking-wider ${
                    isToday ? 'text-accent' : 'text-text-muted'
                  }`}>
                    {DAY_LABELS[i]}
                  </span>
                  <span className={`text-2xs mt-0.5 ${
                    isToday ? 'text-accent font-semibold' : 'text-text-muted/60'
                  }`}>
                    {d.getDate()}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="h-px bg-white/[0.05]" />

          {/* Goal rows */}
          <div className="divide-y divide-white/[0.04]">
            {weekGoals.map((goal) => {
              const meta = GOAL_TYPES[goal.type]
              const cellColor = CELL_COLOR[goal.type]
              return (
                <div
                  key={goal.id}
                  className="grid grid-cols-[minmax(0,1.6fr)_repeat(7,minmax(0,1fr))] items-center px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base flex-shrink-0">{meta.icon}</span>
                    <span className="text-xs text-text-primary truncate">
                      {formatGoalTitle(goal)}
                    </span>
                  </div>

                  {dayKeys.map((k) => {
                    const active = goalsStore.isActiveOn(goal, k)
                    const done = active && goalsStore.isCompletedOn(goal, k)

                    return (
                      <div key={k} className="flex items-center justify-center">
                        {!active ? (
                          <span className="w-5 h-5" /> // empty cell
                        ) : done ? (
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center ${cellColor}`}>
                            <CheckIcon className="w-3.5 h-3.5" strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-white/[0.12]" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Legend */}
      {weekGoals.length > 0 && (
        <div className="flex items-center justify-center gap-5 mt-4 text-2xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-accent/25 flex items-center justify-center">
              <CheckIcon className="w-2.5 h-2.5 text-accent" strokeWidth={3} />
            </span>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border border-white/[0.12]" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5" />
            <span>Not scheduled</span>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
