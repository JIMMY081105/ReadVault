// Persisted-storage layer for goals. Reads from / writes to localStorage and
// validates the shape on load so corrupt entries are dropped silently.

import { isGoalTypeId } from '../../utils/goalTypes'
import { normalizeRecurrence } from './recurrence'
import type { Goal, GoalPayload } from '../../types'

const STORAGE_KEY = 'rv_goals'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizePayload(value: unknown): GoalPayload {
  return isRecord(value) ? value as GoalPayload : {}
}

function normalizeStoredGoal(value: unknown): Goal | null {
  if (!isRecord(value) || typeof value.id !== 'string') return null
  if (typeof value.type !== 'string' || !isGoalTypeId(value.type)) return null
  if (typeof value.date !== 'string') return null

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
      recurrence: value.recurrence,
      recurrenceIntervalDays: value.recurrenceIntervalDays as number | string | null | undefined,
      recurrenceEndDate: typeof value.recurrenceEndDate === 'string' ? value.recurrenceEndDate : null,
    }),
    completedDates,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeStoredGoal).filter((goal): goal is Goal => Boolean(goal))
      }
    }
  } catch { /* corrupt — fall through */ }
  return []
}

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function uid(): string {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
