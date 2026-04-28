// Goals store — persisted to localStorage. A goal has a start date, optional
// recurrence, optional recurrence end date, and a per-date completion map.
// We never materialize future occurrences — `isGoalActiveOnDate` resolves them
// lazily from the rule.

import { todayKey, diffInDays, parseDateKey } from '../utils/dateKey'
import { validateGoalInput } from '../utils/goalTypes'

const STORAGE_KEY = 'rv_goals'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* corrupt — fall through */ }
  return []
}

function save(goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

function uid() {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function normalizeRecurrence(input) {
  const recurrence = input.recurrence || 'none'
  const out = { recurrence }
  if (recurrence === 'every_n_days') {
    out.recurrenceIntervalDays = Math.max(1, Math.floor(Number(input.recurrenceIntervalDays) || 1))
  } else {
    out.recurrenceIntervalDays = null
  }
  out.recurrenceEndDate = input.recurrenceEndDate || null
  return out
}

// Rule resolver: does this goal apply on dateKey?
export function isGoalActiveOnDate(goal, dateKey) {
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

export function getGoalsForDate(dateKey) {
  return load()
    .filter((g) => isGoalActiveOnDate(g, dateKey))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
}

export function isGoalCompletedOnDate(goal, dateKey) {
  return Boolean(goal?.completedDates?.[dateKey])
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export function createGoal(input) {
  const { ok, errors } = validateGoalInput(input)
  if (!ok) {
    const err = new Error('Invalid goal input')
    err.errors = errors
    throw err
  }

  const now = new Date().toISOString()
  const goal = {
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

export function updateGoal(id, patch) {
  const goals = load()
  const i = goals.findIndex((g) => g.id === id)
  if (i === -1) return null

  const merged = {
    ...goals[i],
    ...patch,
    payload: patch.payload ? { ...goals[i].payload, ...patch.payload } : goals[i].payload,
    ...(patch.recurrence !== undefined ? normalizeRecurrence({ ...goals[i], ...patch }) : {}),
    updatedAt: new Date().toISOString(),
  }

  const { ok, errors } = validateGoalInput(merged)
  if (!ok) {
    const err = new Error('Invalid goal update')
    err.errors = errors
    throw err
  }

  goals[i] = merged
  save(goals)
  return merged
}

export function deleteGoal(id) {
  const goals = load().filter((g) => g.id !== id)
  save(goals)
}

export function markGoalCompletedForDate(id, dateKey, completed = true) {
  const goals = load()
  const goal = goals.find((g) => g.id === id)
  if (!goal) return null

  goal.completedDates = goal.completedDates && typeof goal.completedDates === 'object'
    ? goal.completedDates
    : {}

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
export function stopRecurringGoal(id, endKey) {
  return updateGoal(id, { recurrenceEndDate: endKey || todayKey() })
}

export const goalsStore = {
  getAll: () => load(),
  getById: (id) => load().find((g) => g.id === id) ?? null,
  getForDate: getGoalsForDate,
  create: createGoal,
  update: updateGoal,
  delete: deleteGoal,
  markCompleted: markGoalCompletedForDate,
  stopRecurring: stopRecurringGoal,
  isActiveOn: isGoalActiveOnDate,
  isCompletedOn: isGoalCompletedOnDate,
}
