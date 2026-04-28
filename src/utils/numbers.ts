import type { Book } from '../types'

export function toSafeInteger(value: unknown, fallback = 0): number {
  const numberValue = Math.floor(Number(value))
  return Number.isFinite(numberValue) ? numberValue : fallback
}

export function clampInteger(value: unknown, min: number, max: number): number {
  const integer = toSafeInteger(value)
  return Math.max(min, Math.min(integer, max))
}

export function toPositiveInteger(value: unknown): number {
  return Math.max(0, toSafeInteger(value))
}

export function formatMinutes(value: unknown): string {
  const minutes = toPositiveInteger(value)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours && rest) return `${hours}h ${rest}m`
  if (hours) return `${hours}h`
  return `${rest}m`
}

export function progressPercent(progress: unknown, total: unknown): number {
  const totalPages = toPositiveInteger(total)
  if (!totalPages) return 0
  return Math.min(100, Math.round((toPositiveInteger(progress) / totalPages) * 100))
}

export function bookProgressPercent(book: Pick<Book, 'progress' | 'totalPages'>): number {
  return progressPercent(book.progress, book.totalPages)
}
