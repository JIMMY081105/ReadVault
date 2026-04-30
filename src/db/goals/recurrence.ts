// Goal recurrence resolution. We never materialize future occurrences — given
// a goal and a date, this module decides whether the goal applies and whether
// the user has marked it complete.

import { diffInDays, parseDateKey } from '../../utils/dateKey'
import type { DateKey, Goal, Recurrence } from '../../types'

export function isRecurrence(value: unknown): value is Recurrence {
  return value === 'none' || value === 'daily' || value === 'every_n_days' || value === 'weekly'
}

export interface RecurrenceInput {
  recurrence?: unknown
  recurrenceIntervalDays?: number | string | null | undefined
  recurrenceEndDate?: DateKey | string | null | undefined
}

export interface NormalizedRecurrence {
  recurrence: Recurrence
  recurrenceIntervalDays: number | null
  recurrenceEndDate: DateKey | null
}

export function normalizeRecurrence(input: RecurrenceInput): NormalizedRecurrence {
  const recurrence = isRecurrence(input.recurrence) ? input.recurrence : 'none'
  if (recurrence === 'every_n_days') {
    return {
      recurrence,
      recurrenceIntervalDays: Math.max(1, Math.floor(Number(input.recurrenceIntervalDays) || 1)),
      recurrenceEndDate: (input.recurrenceEndDate as DateKey | null) || null,
    }
  }
  return {
    recurrence,
    recurrenceIntervalDays: null,
    recurrenceEndDate: (input.recurrenceEndDate as DateKey | null) || null,
  }
}

export function isGoalActiveOnDate(goal: Goal | null | undefined, dateKey: DateKey): boolean {
  if (!goal || !dateKey || !goal.date) return false
  if (dateKey < goal.date) return false
  if (goal.recurrenceEndDate && dateKey > goal.recurrenceEndDate) return false

  switch (goal.recurrence) {
    case 'daily':
      return true
    case 'every_n_days': {
      const interval = Math.max(1, Number(goal.recurrenceIntervalDays) || 1)
      return diffInDays(goal.date, dateKey) % interval === 0
    }
    case 'weekly':
      return parseDateKey(goal.date).getDay() === parseDateKey(dateKey).getDay()
    case 'none':
    default:
      return dateKey === goal.date
  }
}

export function isGoalCompletedOnDate(goal: Goal | null | undefined, dateKey: DateKey): boolean {
  return Boolean(goal?.completedDates?.[dateKey])
}
