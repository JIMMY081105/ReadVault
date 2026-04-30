// CRUD operations on goals. All mutations go through here so storage and
// recurrence rules stay consistent.

import { todayKey } from '../../utils/dateKey'
import { validateGoalInput } from '../../utils/goalTypes'
import { isGoalActiveOnDate, normalizeRecurrence } from './recurrence'
import { loadGoals, saveGoals, uid } from './storage'
import { pushGoal, deleteGoalRemote } from '../../lib/sync'
import type { DateKey, Goal, GoalInput, ValidationErrors } from '../../types'

export class GoalValidationError extends Error {
  errors: ValidationErrors

  constructor(message: string, errors: ValidationErrors) {
    super(message)
    this.name = 'GoalValidationError'
    this.errors = errors
  }
}

export function createGoal(input: GoalInput): Goal {
  const { ok, errors } = validateGoalInput(input)
  if (!ok) throw new GoalValidationError('Invalid goal input', errors)

  const now = new Date().toISOString()
  const goal: Goal = {
    id: uid(),
    type: input.type,
    date: input.date,
    payload: input.payload || {},
    ...normalizeRecurrence(input),
    completedDates: {},
    createdAt: now,
    updatedAt: now,
  }

  const goals = loadGoals()
  goals.push(goal)
  saveGoals(goals)
  pushGoal(goal)
  return goal
}

export function updateGoal(id: string, patch: Partial<GoalInput>): Goal | null {
  const goals = loadGoals()
  const i = goals.findIndex((g) => g.id === id)
  if (i === -1) return null
  const existing = goals[i]
  if (!existing) return null

  const payload = patch.payload
    ? patch.type && patch.type !== existing.type
      ? patch.payload
      : { ...existing.payload, ...patch.payload }
    : existing.payload

  const hasRecurrencePatch =
    patch.recurrence !== undefined ||
    patch.recurrenceIntervalDays !== undefined ||
    patch.recurrenceEndDate !== undefined

  const merged: Goal = {
    ...existing,
    ...patch,
    type: patch.type ?? existing.type,
    date: patch.date ?? existing.date,
    payload,
    ...(hasRecurrencePatch
      ? normalizeRecurrence({ ...existing, ...patch })
      : {
        recurrence: existing.recurrence,
        recurrenceIntervalDays: existing.recurrenceIntervalDays,
        recurrenceEndDate: existing.recurrenceEndDate,
      }),
    updatedAt: new Date().toISOString(),
  }

  const { ok, errors } = validateGoalInput(merged)
  if (!ok) throw new GoalValidationError('Invalid goal update', errors)

  goals[i] = merged
  saveGoals(goals)
  pushGoal(merged)
  return merged
}

export function deleteGoal(id: string): void {
  saveGoals(loadGoals().filter((g) => g.id !== id))
  deleteGoalRemote(id)
}

export function markGoalCompletedForDate(id: string, dateKey: DateKey, completed = true): Goal | null {
  const goals = loadGoals()
  const goal = goals.find((g) => g.id === id)
  if (!goal) return null

  if (completed) goal.completedDates[dateKey] = true
  else delete goal.completedDates[dateKey]

  goal.updatedAt = new Date().toISOString()
  saveGoals(goals)
  pushGoal(goal)
  return goal
}

export function getGoalsForDate(dateKey: DateKey): Goal[] {
  return loadGoals()
    .filter((g) => isGoalActiveOnDate(g, dateKey))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
}

// Convenience: stop a recurring goal as of `endKey` (defaults to today).
export function stopRecurringGoal(id: string, endKey?: DateKey): Goal | null {
  return updateGoal(id, { recurrenceEndDate: endKey || todayKey() })
}
