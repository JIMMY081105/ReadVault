// Goals store — persisted to localStorage. A goal has a start date, optional
// recurrence, optional recurrence end date, and a per-date completion map.
// We never materialize future occurrences — `isGoalActiveOnDate` resolves them
// lazily from the rule.

import { todayKey, diffInDays, parseDateKey } from '../utils/dateKey'
import { isGoalTypeId, validateGoalInput } from '../utils/goalTypes'
import type { DateKey, Goal, GoalInput, GoalPayload, Recurrence, ValidationErrors } from '../types'

const STORAGE_KEY = 'rv_goals'

class GoalValidationError extends Error {
  errors: ValidationErrors

  constructor(message: string, errors: ValidationErrors) {
    super(message)
    this.name = 'GoalValidationError'
    this.errors = errors
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isRecurrence(value: unknown): value is Recurrence {
  return value === 'none' || value === 'daily' || value === 'every_n_days' || value === 'weekly'
}

function normalizePayload(value: unknown): GoalPayload {
  return isRecord(value) ? value as GoalPayload : {}
}

function normalizeStoredGoal(value: unknown): Goal | null {
  if (!isRecord(value) || typeof value.id !== 'string') return null
  if (typeof value.type !== 'string' || !isGoalTypeId(value.type)) return null
  if (typeof value.date !== 'string') return null

  const recurrence = isRecurrence(value.recurrence) ? value.recurrence : 'none'
  const completedDates = isRecord(value.completedDates)
    ? Object.fromEntries(
      Object.entries(value.completedDates)
        .filter(([, completed]) => Boolean(completed))
        .map(([dateKey]) => [dateKey, true as const]),
    )
    : {}

  return {
    id: value.id,
    type: value.type,
    date: value.date,
    payload: normalizePayload(value.payload),
    ...normalizeRecurrence({
      recurrence,
      recurrenceIntervalDays: value.recurrenceIntervalDays as number | string | null | undefined,
      recurrenceEndDate: typeof value.recurrenceEndDate === 'string' ? value.recurrenceEndDate : null,
    }),
    completedDates,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }
}

function load(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(normalizeStoredGoal).filter((goal): goal is Goal => Boolean(goal))
    }
  } catch { /* corrupt — fall through */ }
  return []
}

function save(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

function uid(): string {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function normalizeRecurrence(input: {
  recurrence?: unknown
  recurrenceIntervalDays?: number | string | null | undefined
  recurrenceEndDate?: DateKey | string | null | undefined
}) {
  const recurrence = isRecurrence(input.recurrence) ? input.recurrence : 'none'
  if (recurrence === 'every_n_days') {
    return {
      recurrence,
      recurrenceIntervalDays: Math.max(1, Math.floor(Number(input.recurrenceIntervalDays) || 1)),
      recurrenceEndDate: input.recurrenceEndDate || null,
    }
  }

  return {
    recurrence,
    recurrenceIntervalDays: null,
    recurrenceEndDate: input.recurrenceEndDate || null,
  }
}

// Rule resolver: does this goal apply on dateKey?
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

export function getGoalsForDate(dateKey: DateKey): Goal[] {
  return load()
    .filter((g) => isGoalActiveOnDate(g, dateKey))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
}

export function isGoalCompletedOnDate(goal: Goal | null | undefined, dateKey: DateKey): boolean {
  return Boolean(goal?.completedDates?.[dateKey])
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export function createGoal(input: GoalInput): Goal {
  const { ok, errors } = validateGoalInput(input)
  if (!ok) {
    throw new GoalValidationError('Invalid goal input', errors)
  }

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

  const goals = load()
  goals.push(goal)
  save(goals)
  return goal
}

export function updateGoal(id: string, patch: Partial<GoalInput>): Goal | null {
  const goals = load()
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
    ...(
      hasRecurrencePatch
        ? normalizeRecurrence({ ...existing, ...patch })
        : {
          recurrence: existing.recurrence,
          recurrenceIntervalDays: existing.recurrenceIntervalDays,
          recurrenceEndDate: existing.recurrenceEndDate,
        }
    ),
    updatedAt: new Date().toISOString(),
  }

  const { ok, errors } = validateGoalInput(merged)
  if (!ok) {
    throw new GoalValidationError('Invalid goal update', errors)
  }

  goals[i] = merged
  save(goals)
  return merged
}

export function deleteGoal(id: string): void {
  const goals = load().filter((g) => g.id !== id)
  save(goals)
}

export function markGoalCompletedForDate(id: string, dateKey: DateKey, completed = true): Goal | null {
  const goals = load()
  const goal = goals.find((g) => g.id === id)
  if (!goal) return null

  if (completed) {
    goal.completedDates[dateKey] = true
  } else {
    delete goal.completedDates[dateKey]
  }
  goal.updatedAt = new Date().toISOString()
  save(goals)
  return goal
}

// Convenience: stop a recurring goal as of `endKey` (defaults to yesterday).
export function stopRecurringGoal(id: string, endKey?: DateKey): Goal | null {
  return updateGoal(id, { recurrenceEndDate: endKey || todayKey() })
}

export const goalsStore = {
  getAll: () => load(),
  getById: (id: string): Goal | null => load().find((g) => g.id === id) ?? null,
  getForDate: getGoalsForDate,
  create: createGoal,
  update: updateGoal,
  delete: deleteGoal,
  markCompleted: markGoalCompletedForDate,
  stopRecurring: stopRecurringGoal,
  isActiveOn: isGoalActiveOnDate,
  isCompletedOn: isGoalCompletedOnDate,
}
