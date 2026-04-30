// Cross-device sync layer.
//
//   localStorage   ←→   Supabase
//   (sync cache)        (source of truth)
//
// • UI reads sync from localStorage (fast, no loading states).
// • Every mutation writes localStorage AND fires an async push to Supabase.
// • On sign-in we pull all rows and replace local cache; if Supabase is empty
//   for this user (first sign-in on this account), we upload whatever's in
//   local cache instead.
// • Conflict policy: last-write-wins via row-level upsert. Good enough for
//   single-user multi-device. No collaborative editing.

import { supabase } from './supabase'
import type { Book, DailyReadingStats, DateKey, Goal, GoalPayload, Recurrence, Settings } from '../types'

// ── Pub/sub: pages re-render when a remote pull rewrites local cache ────────

let revision = 0
const listeners = new Set<() => void>()

export const syncStore = {
  getRevision: (): number => revision,
  subscribe: (cb: () => void): (() => void) => {
    listeners.add(cb)
    return () => { listeners.delete(cb) }
  },
}

function bumpRevision(): void {
  revision++
  for (const cb of listeners) cb()
}

// ── Auth helper ─────────────────────────────────────────────────────────────

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// ── Row mappers (snake_case ↔ camelCase) ────────────────────────────────────

interface BookRow {
  user_id: string
  id: string
  title: string
  author: string
  genre: string | null
  language: string | null
  total_pages: number
  progress: number
  gradient: string | null
  description: string | null
  year: number | null
  cover: string | null
  time_spent_minutes: number
  daily_stats: Record<DateKey, DailyReadingStats>
  updated_at?: string
}

interface GoalRow {
  user_id: string
  id: string
  type: string
  date: string
  payload: GoalPayload
  recurrence: Recurrence
  recurrence_interval_days: number | null
  recurrence_end_date: string | null
  completed_dates: Record<DateKey, true>
  created_at?: string
  updated_at?: string
}

function bookToRow(b: Book, userId: string): BookRow {
  return {
    user_id: userId,
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre || null,
    language: b.language || null,
    total_pages: b.totalPages,
    progress: b.progress,
    gradient: b.gradient || null,
    description: b.description || null,
    year: b.year || null,
    cover: b.cover ?? null,
    time_spent_minutes: b.timeSpentMinutes,
    daily_stats: b.dailyStats,
  }
}

function rowToBook(r: BookRow): Book {
  const book: Book = {
    id: r.id,
    title: r.title,
    author: r.author,
    genre: r.genre ?? '',
    language: r.language ?? 'en',
    totalPages: r.total_pages,
    progress: r.progress,
    gradient: r.gradient ?? '',
    description: r.description ?? '',
    year: r.year ?? 0,
    timeSpentMinutes: r.time_spent_minutes,
    dailyStats: r.daily_stats ?? {},
  }
  if (r.cover) book.cover = r.cover
  return book
}

function goalToRow(g: Goal, userId: string): GoalRow {
  return {
    user_id: userId,
    id: g.id,
    type: g.type,
    date: g.date,
    payload: g.payload,
    recurrence: g.recurrence,
    recurrence_interval_days: g.recurrenceIntervalDays,
    recurrence_end_date: g.recurrenceEndDate,
    completed_dates: g.completedDates,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  }
}

function rowToGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    type: r.type as Goal['type'],
    date: r.date,
    payload: r.payload ?? {},
    recurrence: r.recurrence,
    recurrenceIntervalDays: r.recurrence_interval_days,
    recurrenceEndDate: r.recurrence_end_date,
    completedDates: r.completed_dates ?? {},
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? new Date().toISOString(),
  }
}

// ── Push: fire-and-forget (UI never waits) ──────────────────────────────────

export function pushBook(book: Book): void {
  void (async () => {
    const userId = await currentUserId()
    if (!userId) return
    await supabase.from('books').upsert(bookToRow(book, userId), { onConflict: 'user_id,id' })
  })()
}

export function deleteBookRemote(bookId: string): void {
  void (async () => {
    const userId = await currentUserId()
    if (!userId) return
    await supabase.from('books').delete().eq('user_id', userId).eq('id', bookId)
  })()
}

export function pushGoal(goal: Goal): void {
  void (async () => {
    const userId = await currentUserId()
    if (!userId) return
    await supabase.from('goals').upsert(goalToRow(goal, userId), { onConflict: 'user_id,id' })
  })()
}

export function deleteGoalRemote(goalId: string): void {
  void (async () => {
    const userId = await currentUserId()
    if (!userId) return
    await supabase.from('goals').delete().eq('user_id', userId).eq('id', goalId)
  })()
}

export function pushSettings(settings: Settings): void {
  void (async () => {
    const userId = await currentUserId()
    if (!userId) return
    await supabase.from('user_settings').upsert(
      { user_id: userId, data: settings, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  })()
}

// ── Bootstrap on sign-in: pull all rows, replace localStorage ───────────────

const STORAGE_KEYS = {
  books: 'rv_books',
  goals: 'rv_goals',
  settings: 'rv_settings',
} as const

async function pushAllLocal(userId: string): Promise<void> {
  // Read local cache directly — using stores would risk circular imports.
  let booksRaw: unknown
  let goalsRaw: unknown
  let settingsRaw: unknown
  try { booksRaw    = JSON.parse(localStorage.getItem(STORAGE_KEYS.books)    || 'null') } catch { /* ignore */ }
  try { goalsRaw    = JSON.parse(localStorage.getItem(STORAGE_KEYS.goals)    || 'null') } catch { /* ignore */ }
  try { settingsRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || 'null') } catch { /* ignore */ }

  if (Array.isArray(booksRaw) && booksRaw.length > 0) {
    const rows = booksRaw
      .filter((b): b is Book => Boolean(b) && typeof (b as Book).id === 'string')
      .map((b) => bookToRow(b, userId))
    if (rows.length > 0) await supabase.from('books').upsert(rows, { onConflict: 'user_id,id' })
  }

  if (Array.isArray(goalsRaw) && goalsRaw.length > 0) {
    const rows = goalsRaw
      .filter((g): g is Goal => Boolean(g) && typeof (g as Goal).id === 'string')
      .map((g) => goalToRow(g, userId))
    if (rows.length > 0) await supabase.from('goals').upsert(rows, { onConflict: 'user_id,id' })
  }

  if (settingsRaw && typeof settingsRaw === 'object') {
    await supabase.from('user_settings').upsert(
      { user_id: userId, data: settingsRaw, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  }
}

export async function bootstrap(userId: string): Promise<void> {
  const [booksRes, goalsRes, settingsRes] = await Promise.all([
    supabase.from('books').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId),
    supabase.from('user_settings').select('data').eq('user_id', userId).maybeSingle(),
  ])

  const remoteEmpty =
    (!booksRes.data || booksRes.data.length === 0) &&
    (!goalsRes.data || goalsRes.data.length === 0) &&
    !settingsRes.data

  if (remoteEmpty) {
    // First sign-in on this account: seed Supabase with whatever's in local cache.
    await pushAllLocal(userId)
    bumpRevision()
    return
  }

  // Replace local cache with remote.
  if (booksRes.data) {
    const books = (booksRes.data as BookRow[]).map(rowToBook)
    localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books))
  }
  if (goalsRes.data) {
    const goals = (goalsRes.data as GoalRow[]).map(rowToGoal)
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals))
  }
  if (settingsRes.data?.data) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settingsRes.data.data))
  }

  bumpRevision()
}

// ── Sign-out cleanup ────────────────────────────────────────────────────────

function clearLocal(): void {
  localStorage.removeItem(STORAGE_KEYS.books)
  localStorage.removeItem(STORAGE_KEYS.goals)
  localStorage.removeItem(STORAGE_KEYS.settings)
  bumpRevision()
}

// ── Init: hook auth events ──────────────────────────────────────────────────

let inited = false

export function initSync(): void {
  if (inited) return
  inited = true

  // On boot, if a session is already restored, run bootstrap.
  void supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user.id) void bootstrap(data.session.user.id)
  })

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) void bootstrap(session.user.id)
    if (event === 'SIGNED_OUT') clearLocal()
  })
}
