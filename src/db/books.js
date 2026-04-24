// Minimal book metadata store — persisted to localStorage as compact JSON.
// No images: covers are CSS gradient strings (~60 bytes each vs ~60KB for a jpeg).

const STORAGE_KEY = 'rv_books'

// The two user-requested books + existing placeholders
const SEED_BOOKS = [
  {
    id: 'ai-neng',
    title: '人工智能之不能',
    author: '马兆远',
    genre: '科技',
    language: 'zh',
    totalPages: 284,
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
  {
    id: 'pragmatic',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    genre: 'Tech',
    language: 'en',
    totalPages: 352,
    progress: 142,
    gradient: 'bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900',
    description: 'Your journey to mastery.',
    year: 2019,
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-help',
    language: 'en',
    totalPages: 306,
    progress: 280,
    gradient: 'bg-gradient-to-br from-orange-900 to-amber-900',
    description: 'Tiny changes, remarkable results.',
    year: 2018,
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    genre: 'Productivity',
    language: 'en',
    totalPages: 200,
    progress: 110,
    gradient: 'bg-gradient-to-br from-slate-800 to-zinc-900',
    description: 'Rules for focused success in a distracted world.',
    year: 2016,
  },
]

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
    save(SEED_BOOKS)
    return [...SEED_BOOKS]
  }
  const storedMap = new Map(stored.map((b) => [b.id, b]))
  // Prepend any seed books that are missing from storage
  const merged = [...stored]
  for (const seed of SEED_BOOKS) {
    if (!storedMap.has(seed.id)) merged.unshift(seed)
  }
  return merged
}

export const booksStore = {
  getAll: () => init(),

  getById: (id) => init().find((b) => b.id === id) ?? null,

  updateProgress: (id, progress) => {
    const books = init()
    const book = books.find((b) => b.id === id)
    if (book) { book.progress = Math.max(0, Math.min(progress, book.totalPages)); save(books) }
  },

  add: (book) => {
    const books = init()
    if (!books.find((b) => b.id === book.id)) { books.unshift(book); save(books) }
  },

  remove: (id) => { save(init().filter((b) => b.id !== id)) },
}
