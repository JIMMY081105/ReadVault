// Minimal book metadata store — persisted to localStorage as compact JSON.
// No images: covers are CSS gradient strings (~60 bytes each vs ~60KB for a jpeg).

const STORAGE_KEY = 'rv_books'
const RETIRED_BOOK_IDS = new Set(['pragmatic', 'atomic-habits', 'deep-work'])

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
]

function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function clampNumber(value, min, max) {
  const n = Math.floor(Number(value) || 0)
  return Math.max(min, Math.min(n, max))
}

function normalizeBook(book, seed = null) {
  const merged = seed ? { ...book, ...seed } : { ...book }
  const totalPages = Math.max(0, Math.floor(Number(merged.totalPages) || 0))
  const progress = clampNumber(book.progress, 0, totalPages)
  const timeSpentMinutes = Math.max(0, Math.floor(Number(book.timeSpentMinutes) || 0))

  return {
    ...merged,
    totalPages,
    progress,
    timeSpentMinutes,
    dailyStats: book.dailyStats && typeof book.dailyStats === 'object' ? book.dailyStats : {},
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupt storage — fall through to seed */ }
  return null
}

function save(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

// Merge: seed books always exist; stored books keep their progress
function init() {
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

  getById: (id) => init().find((b) => b.id === id) ?? null,

  updateProgress: (id, progress) => {
    const books = init()
    const book = books.find((b) => b.id === id)
    if (book) {
      book.progress = clampNumber(progress, 0, book.totalPages)
      save(books)
      return book
    }
    return null
  },

  addReadingSession: (id, { pages = 0, minutes = 0, date = todayKey() } = {}) => {
    const books = init()
    const book = books.find((b) => b.id === id)
    if (!book) return null

    const remainingPages = Math.max(0, book.totalPages - book.progress)
    const pagesToAdd = clampNumber(pages, 0, remainingPages)
    const minutesToAdd = Math.max(0, Math.floor(Number(minutes) || 0))

    book.progress += pagesToAdd
    book.timeSpentMinutes = Math.max(0, Math.floor(Number(book.timeSpentMinutes) || 0)) + minutesToAdd
    book.dailyStats = book.dailyStats && typeof book.dailyStats === 'object' ? book.dailyStats : {}
    const day = book.dailyStats[date] ?? { pages: 0, timeMinutes: 0 }
    book.dailyStats[date] = {
      pages: Math.max(0, Math.floor(Number(day.pages) || 0)) + pagesToAdd,
      timeMinutes: Math.max(0, Math.floor(Number(day.timeMinutes) || 0)) + minutesToAdd,
    }

    save(books)
    return book
  },

  add: (book) => {
    const books = init()
    if (!books.find((b) => b.id === book.id)) { books.unshift(book); save(books) }
  },

  remove: (id) => { save(init().filter((b) => b.id !== id)) },
}
