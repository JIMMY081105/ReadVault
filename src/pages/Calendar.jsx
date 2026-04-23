import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Days with reading activity (for the current month placeholder)
const READ_DAYS = new Set([1, 2, 3, 5, 6, 8, 9, 10, 12, 15, 16, 17, 19, 21, 22, 23])
const TODAY = 24

const TASKS = [
  { id: 1, title: 'Finish Chapter 4 — Pragmatic Programmer', book: 'The Pragmatic Programmer', pages: 12, done: false, time: 'Today' },
  { id: 2, title: 'Daily goal: 30 pages', book: 'Atomic Habits', pages: 30, done: false, time: 'Today' },
  { id: 3, title: 'Review highlights', book: 'Deep Work', pages: null, done: true, time: 'Yesterday' },
  { id: 4, title: 'Start Part II', book: 'Dune', pages: 40, done: false, time: 'Tomorrow' },
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function Calendar() {
  const now = new Date()
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() })

  const { year, month } = viewDate
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => setViewDate(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
  )
  const nextMonth = () => setViewDate(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
  )

  // Build calendar grid
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

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
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-2xs font-semibold text-text-muted py-1">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />

            const isToday = isCurrentMonth && day === TODAY
            const hasReading = isCurrentMonth && READ_DAYS.has(day)
            const isPast = isCurrentMonth && day < TODAY

            return (
              <div key={day} className="flex flex-col items-center py-1">
                <button
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-150 active:scale-90
                    ${isToday
                      ? 'bg-accent text-black font-bold shadow-glow-sm'
                      : hasReading
                        ? 'text-text-primary hover:bg-white/[0.06]'
                        : 'text-text-muted hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {day}
                </button>
                {/* Reading dot */}
                {hasReading && !isToday && (
                  <span className="w-1 h-1 rounded-full bg-accent/60 mt-0.5" />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-2xs text-text-muted">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            <span className="text-2xs text-text-muted">Read</span>
          </div>
        </div>
      </Card>

      {/* Reading Streak */}
      <div className="flex gap-3 mb-6">
        <Card variant="surface" className="flex-1 !p-3 text-center">
          <p className="text-2xl font-bold text-accent">7</p>
          <p className="text-xs text-text-muted mt-0.5">Day streak</p>
        </Card>
        <Card variant="surface" className="flex-1 !p-3 text-center">
          <p className="text-2xl font-bold text-text-primary">{READ_DAYS.size}</p>
          <p className="text-xs text-text-muted mt-0.5">Days this month</p>
        </Card>
        <Card variant="surface" className="flex-1 !p-3 text-center">
          <p className="text-2xl font-bold text-text-primary">6h</p>
          <p className="text-xs text-text-muted mt-0.5">This week</p>
        </Card>
      </div>

      {/* Reading Tasks */}
      <section>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          Reading Tasks
        </h2>

        <div className="space-y-2.5">
          {TASKS.map((task) => (
            <Card
              key={task.id}
              variant="surface"
              padding={false}
              className={task.done ? 'opacity-50' : ''}
            >
              <div className="flex items-start gap-3 p-3.5">
                {/* Check icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {task.done ? (
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${task.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <BookOpenIcon className="w-3 h-3 text-text-muted flex-shrink-0" />
                    <span className="text-2xs text-text-muted truncate">{task.book}</span>
                    {task.pages && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className="text-2xs text-text-muted">{task.pages}p</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Time badge */}
                <span className={`
                  flex-shrink-0 text-2xs font-medium px-2 py-0.5 rounded-full
                  ${task.time === 'Today' ? 'bg-accent/15 text-accent' : 'bg-white/[0.06] text-text-muted'}
                `}>
                  {task.time}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageContainer>
  )
}
