// Minimal book metadata store — persisted to localStorage as compact JSON.
// No images: covers are CSS gradient strings (~60 bytes each vs ~60KB for a jpeg).

import type { Book, DailyReadingStats, DateKey } from '../types'
import { todayKey } from '../utils/dateKey'
import { clampInteger, toPositiveInteger } from '../utils/numbers'

const STORAGE_KEY = 'rv_books'
const RETIRED_BOOK_IDS = new Set(['pragmatic', 'atomic-habits', 'deep-work'])

type SeedBook = Omit<Book, 'timeSpentMinutes' | 'dailyStats' | 'cover'> & { cover?: string }
type RawBook = Partial<Book> & { id: string }

// User-requested seed books.
const SEED_BOOKS = [
  {
    id: 'ai-neng',
    title: '人工智能之不能',
    author: '马兆远',
    genre: '科技',
    language: 'zh',
    totalPages: 403,
    progress: 0,
    gradient: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950',
    description: '从科学角度深入剖析人工智能的本质与边界，揭示AI真正"不能"做什么。',
    year: 2019,
  },
  {
    id: 'here-i-am',
    title: 'Here I Am!',
    author: 'Russell Stannard',
    genre: 'Science',
    language: 'en',
    totalPages: 160,
    progress: 0,
    gradient: 'bg-gradient-to-br from-amber-800 via-orange-900 to-rose-950',
    description: 'A thought-provoking exploration of the big questions: Who are we? Why are we here?',
    year: 2006,
  },
] satisfies SeedBook[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isRawBook(value: unknown): value is RawBook {
  return isRecord(value) && typeof value.id === 'string'
}

function normalizeDailyStats(value: unknown): Record<DateKey, DailyReadingStats> {
  if (!isRecord(value)) return {}

  const stats: Record<DateKey, DailyReadingStats> = {}
  for (const [key, day] of Object.entries(value)) {
    if (!isRecord(day)) continue
    stats[key] = {
      pages: toPositiveInteger(day.pages),
      timeMinutes: toPositiveInteger(day.timeMinutes),
    }
  }
  return stats
}

function normalizeBook(book: RawBook | SeedBook, seed?: SeedBook): Book {
  const merged = seed ? { ...book, ...seed } : { ...book }
  const totalPages = toPositiveInteger(merged.totalPages)
  const progress = clampInteger(book.progress, 0, totalPages)
  const timeSpentMinutes = toPositiveInteger('timeSpentMinutes' in book ? book.timeSpentMinutes : 0)

  return {
    id: merged.id,
    title: merged.title || 'Untitled',
    author: merged.author || 'Unknown author',
    genre: merged.genre || 'General',
    language: merged.language || 'en',
    totalPages,
    progress,
    gradient: merged.gradient || 'bg-gradient-to-br from-indigo-900/80 to-purple-900/80',
    description: merged.description || '',
    year: toPositiveInteger(merged.year),
    ...(merged.cover ? { cover: merged.cover } : {}),
    timeSpentMinutes,
    dailyStats: normalizeDailyStats('dailyStats' in book ? book.dailyStats : undefined),
  }
}

function load(): RawBook[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(isRawBook) : null
    }
  } catch { /* corrupt storage — fall through to seed */ }
  return null
}

function save(books: Book[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

// Merge: seed books always exist; stored books keep their progress
function init(): Book[] {
  const stored = load()
  if (!stored) {
    const seeded = SEED_BOOKS.map((book) => normalizeBook(book, book))
    save(seeded)
    return seeded
  }
  const seedMap = new Map(SEED_BOOKS.map((b) => [b.id, b]))
  const activeStored = stored.filter((b) => !RETIRED_BOOK_IDS.has(b.id))
  const storedMap = new Map(activeStored.map((b) => [b.id, b]))
  const merged = activeStored.map((book) => normalizeBook(book, seedMap.get(book.id)))

  // Prepend any seed books that are missing from storage.
  for (const seed of SEED_BOOKS) {
    if (!storedMap.has(seed.id)) merged.unshift(normalizeBook(seed, seed))
  }

  save(merged)
  return merged
}

export const booksStore = {
  getAll: () => init(),

  getById: (id?: string): Book | null => init().find((b) => b.id === id) ?? null,

  updateProgress: (id: string, progress: number): Book | null => {
    const books = init()
    const book = books.find((b) => b.id === id)
    if (book) {
      book.progress = clampInteger(progress, 0, book.totalPages)
      save(books)
      return book
    }
    return null
  },

  addReadingSession: (
    id: string | undefined,
    { pages = 0, minutes = 0, date = todayKey() }: { pages?: number; minutes?: number; date?: DateKey } = {},
  ): Book | null => {
    const books = init()
    const book = books.find((b) => b.id === id)
    if (!book) return null

    const remainingPages = Math.max(0, book.totalPages - book.progress)
    const pagesToAdd = clampInteger(pages, 0, remainingPages)
    const minutesToAdd = toPositiveInteger(minutes)

    book.progress += pagesToAdd
    book.timeSpentMinutes = toPositiveInteger(book.timeSpentMinutes) + minutesToAdd
    const day = book.dailyStats[date] ?? { pages: 0, timeMinutes: 0 }
    book.dailyStats[date] = {
      pages: toPositiveInteger(day.pages) + pagesToAdd,
      timeMinutes: toPositiveInteger(day.timeMinutes) + minutesToAdd,
    }

    save(books)
    return book
  },

  add: (book: RawBook): Book | null => {
    const books = init()
    if (books.find((b) => b.id === book.id)) return null
    const normalized = normalizeBook(book)
    books.unshift(normalized)
    save(books)
    return normalized
  },

  remove: (id: string): void => { save(init().filter((b) => b.id !== id)) },
}
