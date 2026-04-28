// User settings — persisted to localStorage with a tiny pub/sub so any
// component using `useSettings` stays in sync.

const STORAGE_KEY = 'rv_settings'

export const READER_THEMES = ['dark', 'sepia', 'light']
export const READER_FONTS = ['system', 'georgia', 'merriweather']
export const LINE_SPACINGS = ['compact', 'normal', 'relaxed']

export const FONT_FAMILY = {
  system:       '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  georgia:      'Georgia, "Times New Roman", serif',
  merriweather: 'Merriweather, Georgia, "Times New Roman", serif',
}

export const LINE_HEIGHT = {
  compact: 1.5,
  normal:  1.9,
  relaxed: 2.4,
}

const DEFAULTS = {
  darkMode: true,
  readerTheme: 'sepia',     // matches the screenshot's selected state
  readerFont: 'georgia',
  lineSpacing: 'normal',
  dailyReadingGoal: 30,     // pages per day
  notifications: true,
  dailyReminder: true,
  autoSync: false,
}

function clean(raw) {
  const out = { ...DEFAULTS, ...(raw || {}) }
  if (!READER_THEMES.includes(out.readerTheme)) out.readerTheme = DEFAULTS.readerTheme
  if (!READER_FONTS.includes(out.readerFont)) out.readerFont = DEFAULTS.readerFont
  if (!LINE_SPACINGS.includes(out.lineSpacing)) out.lineSpacing = DEFAULTS.lineSpacing
  out.darkMode = Boolean(out.darkMode)
  out.notifications = Boolean(out.notifications)
  out.dailyReminder = Boolean(out.dailyReminder)
  out.autoSync = Boolean(out.autoSync)
  const goal = Math.floor(Number(out.dailyReadingGoal))
  out.dailyReadingGoal = Number.isFinite(goal) && goal > 0 ? Math.min(goal, 999) : DEFAULTS.dailyReadingGoal
  return out
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return clean(raw ? JSON.parse(raw) : null)
  } catch {
    return clean(null)
  }
}

let current = load()
const listeners = new Set()

function emit() {
  for (const l of listeners) l(current)
}

export const settingsStore = {
  get: () => current,
  set: (patch) => {
    current = clean({ ...current, ...patch })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    emit()
    return current
  },
  subscribe: (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export const SETTINGS_DEFAULTS = DEFAULTS
