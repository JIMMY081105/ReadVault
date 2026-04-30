// User settings — persisted to localStorage with a tiny pub/sub so any
// component using `useSettings` stays in sync.

import type { LineSpacing, ReaderFont, ReaderTheme, Settings } from '../types'
import { pushSettings } from '../lib/sync'

const STORAGE_KEY = 'rv_settings'

export const READER_THEMES = ['dark', 'sepia', 'light'] as const satisfies readonly ReaderTheme[]
export const READER_FONTS = ['system', 'georgia', 'merriweather'] as const satisfies readonly ReaderFont[]
export const LINE_SPACINGS = ['compact', 'normal', 'relaxed'] as const satisfies readonly LineSpacing[]

export const FONT_FAMILY: Record<ReaderFont, string> = {
  system:       '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  georgia:      'Georgia, "Times New Roman", serif',
  merriweather: 'Merriweather, Georgia, "Times New Roman", serif',
}

export const LINE_HEIGHT: Record<LineSpacing, number> = {
  compact: 1.5,
  normal:  1.9,
  relaxed: 2.4,
}

const DEFAULTS: Settings = {
  darkMode: true,
  readerTheme: 'sepia',     // matches the screenshot's selected state
  readerFont: 'georgia',
  lineSpacing: 'normal',
  dailyReadingGoal: 30,     // pages per day
  notifications: true,
  dailyReminder: true,
  autoSync: false,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return value == null ? fallback : Boolean(value)
}

function clean(raw: unknown): Settings {
  const input = isRecord(raw) ? raw : {}
  const goal = Math.floor(Number(input.dailyReadingGoal ?? DEFAULTS.dailyReadingGoal))

  return {
    darkMode: pickBoolean(input.darkMode, DEFAULTS.darkMode),
    readerTheme: pickEnum(input.readerTheme, READER_THEMES, DEFAULTS.readerTheme),
    readerFont: pickEnum(input.readerFont, READER_FONTS, DEFAULTS.readerFont),
    lineSpacing: pickEnum(input.lineSpacing, LINE_SPACINGS, DEFAULTS.lineSpacing),
    dailyReadingGoal: Number.isFinite(goal) && goal > 0 ? Math.min(goal, 999) : DEFAULTS.dailyReadingGoal,
    notifications: pickBoolean(input.notifications, DEFAULTS.notifications),
    dailyReminder: pickBoolean(input.dailyReminder, DEFAULTS.dailyReminder),
    autoSync: pickBoolean(input.autoSync, DEFAULTS.autoSync),
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
