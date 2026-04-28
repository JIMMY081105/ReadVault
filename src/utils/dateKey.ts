import type { DateKey } from '../types'

// Local-time date utilities. Goals and reading stats are keyed by 'YYYY-MM-DD'
// in the user's timezone (NOT UTC), so a goal logged at 11pm doesn't roll over.
export function toDateKey(date: Date | string | number): DateKey {
  const d = date instanceof Date ? date : new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function todayKey(): DateKey {
  return toDateKey(new Date())
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
}

export function diffInDays(fromKey: DateKey, toKey: DateKey): number {
  const MS_PER_DAY = 86_400_000
  const a = parseDateKey(fromKey).getTime()
  const b = parseDateKey(toKey).getTime()
  return Math.round((b - a) / MS_PER_DAY)
}

export function compareKeys(a: DateKey, b: DateKey): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function formatPrettyDate(key: DateKey): string {
  return parseDateKey(key).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}
