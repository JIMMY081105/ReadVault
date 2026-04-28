// Catalog of goal types. Keep all type-specific knowledge here so UI and
// storage layers stay generic.

export const GOAL_TYPES = {
  gym: {
    id: 'gym',
    label: 'Gym',
    icon: '🏋️',
    accent: 'from-orange-700/40 to-rose-900/40',
  },
  water: {
    id: 'water',
    label: 'Drinking water',
    icon: '💧',
    accent: 'from-sky-700/40 to-cyan-900/40',
  },
  salah: {
    id: 'salah',
    label: 'Salah',
    icon: '🕌',
    accent: 'from-emerald-700/40 to-teal-900/40',
  },
  app_limit: {
    id: 'app_limit',
    label: 'App time limit',
    icon: '📱',
    accent: 'from-fuchsia-700/40 to-purple-900/40',
  },
  quran: {
    id: 'quran',
    label: 'Quran',
    icon: '📖',
    accent: 'from-amber-700/40 to-yellow-900/40',
  },
  protein: {
    id: 'protein',
    label: 'Protein',
    icon: '🥩',
    accent: 'from-red-700/40 to-rose-900/40',
  },
}

export const GOAL_TYPE_LIST = Object.values(GOAL_TYPES)

export const GYM_KINDS = ['aerobic', 'anaerobic']
export const WATER_MAX_LITRES = 4
export const PRAYERS = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Tahajjud', 'Dhuha']
export const FIVE_DAILY_PRAYERS = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha']
export const TRACKED_APPS = ['抖音', '视频号', '王者荣耀']

export const RECURRENCE_OPTIONS = [
  { id: 'none',          label: 'Does not repeat' },
  { id: 'daily',         label: 'Daily' },
  { id: 'every_n_days',  label: 'Every N days' },
  { id: 'weekly',        label: 'Weekly' },
]

// ── Validation ──────────────────────────────────────────────────────────────

export function validateGoalInput({ type, payload, date, recurrence, recurrenceIntervalDays, recurrenceEndDate }) {
  const errors = {}

  if (!type || !GOAL_TYPES[type]) errors.type = 'Pick a goal type.'
  if (!date) errors.date = 'Pick a date.'

  if (recurrenceEndDate && date && recurrenceEndDate < date) {
    errors.recurrenceEndDate = 'End date must be on or after the start date.'
  }

  if (recurrence === 'every_n_days') {
    const n = Number(recurrenceIntervalDays)
    if (!Number.isFinite(n) || n < 1) {
      errors.recurrenceIntervalDays = 'Interval must be at least 1 day.'
    }
  }

  const p = payload || {}
  switch (type) {
    case 'gym': {
      const hours = Number(p.gymHours)
      if (!Number.isFinite(hours) || hours <= 0) errors.gymHours = 'Hours must be greater than 0.'
      if (!GYM_KINDS.includes(p.gymType)) errors.gymType = 'Pick aerobic or anaerobic.'
      break
    }
    case 'water': {
      const litres = Number(p.litres)
      if (!Number.isFinite(litres) || litres <= 0) errors.litres = 'Litres must be greater than 0.'
      else if (litres > WATER_MAX_LITRES) errors.litres = `Cannot exceed ${WATER_MAX_LITRES}L.`
      break
    }
    case 'salah': {
      if (!Array.isArray(p.selectedPrayers) || p.selectedPrayers.length === 0) {
        errors.selectedPrayers = 'Pick at least one prayer.'
      }
      break
    }
    case 'app_limit': {
      if (!TRACKED_APPS.includes(p.appName)) errors.appName = 'Pick an app.'
      const mins = Number(p.appLimitMinutes)
      if (!Number.isFinite(mins) || mins <= 0) errors.appLimitMinutes = 'Time must be greater than 0.'
      break
    }
    case 'quran': {
      const pages = Number(p.pages)
      if (!Number.isFinite(pages) || pages <= 0) errors.pages = 'Pages must be greater than 0.'
      if (p.juz != null && p.juz !== '') {
        const j = Number(p.juz)
        if (!Number.isInteger(j) || j < 1 || j > 30) errors.juz = 'Juz must be between 1 and 30.'
      }
      break
    }
    case 'protein': {
      const g = Number(p.proteinGrams)
      if (!Number.isFinite(g) || g <= 0) errors.proteinGrams = 'Grams must be greater than 0.'
      break
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}

// ── Display formatting ──────────────────────────────────────────────────────

export function formatGoalTitle(goal) {
  const p = goal.payload || {}
  switch (goal.type) {
    case 'gym':       return `Gym ${formatHours(p.gymHours)} · ${capitalize(p.gymType || '')}`
    case 'water':     return `Drink ${p.litres}L water`
    case 'salah':     return `Salah: ${(p.selectedPrayers || []).join(', ')}`
    case 'app_limit': return `${p.appName} — limit ${formatMinutes(p.appLimitMinutes)}`
    case 'quran':     return `Quran ${p.pages} page${p.pages === 1 ? '' : 's'}${p.juz ? ` · Juz ${p.juz}` : ''}`
    case 'protein':   return `Eat ${p.proteinGrams}g protein`
    default:          return GOAL_TYPES[goal.type]?.label || 'Goal'
  }
}

export function formatRecurrenceLabel(goal) {
  switch (goal.recurrence) {
    case 'daily':         return 'Daily'
    case 'weekly':        return 'Weekly'
    case 'every_n_days':  return `Every ${goal.recurrenceIntervalDays} days`
    default:              return null
  }
}

function formatHours(h) {
  const n = Number(h)
  if (!Number.isFinite(n)) return '0h'
  return Number.isInteger(n) ? `${n}h` : `${n}h`
}

function formatMinutes(min) {
  const n = Math.max(0, Math.floor(Number(min) || 0))
  if (n < 60) return `${n}m`
  const h = Math.floor(n / 60)
  const r = n % 60
  return r ? `${h}h ${r}m` : `${h}h`
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : ''
}
