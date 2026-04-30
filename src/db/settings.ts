// User settings — persisted to localStorage with a tiny pub/sub so any
// component using `useSettings` stays in sync.

import type { Settings } from '../types'
import { pushSettings } from '../lib/sync'

const STORAGE_KEY = 'rv_settings'

const DEFAULTS: Settings = {
  darkMode: true,
  dailyReadingGoal: 30,     // pages per day
  dailyReminder: false,     // off until the user grants notification permission
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return value == null ? fallback : Boolean(value)
}

function clean(raw: unknown): Settings {
  const input = isRecord(raw) ? raw : {}
  const goal = Math.floor(Number(input.dailyReadingGoal ?? DEFAULTS.dailyReadingGoal))

  return {
    darkMode: pickBoolean(input.darkMode, DEFAULTS.darkMode),
    dailyReadingGoal: Number.isFinite(goal) && goal > 0 ? Math.min(goal, 999) : DEFAULTS.dailyReadingGoal,
    dailyReminder: pickBoolean(input.dailyReminder, DEFAULTS.dailyReminder),
  }
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return clean(raw ? JSON.parse(raw) : null)
  } catch {
    return clean(null)
  }
}

let current = load()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export const settingsStore = {
  get: () => current,
  set: (patch: Partial<Settings>): Settings => {
    current = clean({ ...current, ...patch })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    pushSettings(current)
    emit()
    return current
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
