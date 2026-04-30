import type { ComponentType, ReactNode, SVGProps } from 'react'

export type DateKey = string

export interface Settings {
  darkMode: boolean
  dailyReadingGoal: number
  notifications: boolean
  dailyReminder: boolean
  autoSync: boolean
}

export interface DailyReadingStats {
  pages: number
  timeMinutes: number
}

export interface Book {
  id: string
  title: string
  author: string
  genre: string
  language: string
  totalPages: number
  progress: number
  gradient: string
  description: string
  year: number
  cover?: string
  timeSpentMinutes: number
  dailyStats: Record<DateKey, DailyReadingStats>
}

export type GoalTypeId = 'gym' | 'water' | 'salah' | 'app_limit' | 'quran' | 'protein'
export type GymKind = 'aerobic' | 'anaerobic'
export type Prayer = 'Fajr' | 'Zuhur' | 'Asr' | 'Maghrib' | 'Isha' | 'Tahajjud' | 'Dhuha'
export type TrackedApp = '抖音' | '视频号' | '王者荣耀'
export type Recurrence = 'none' | 'daily' | 'every_n_days' | 'weekly'

export interface GoalPayload {
  gymHours?: number | string
  gymType?: GymKind | string
  litres?: number | string
  selectedPrayers?: string[]
  appName?: TrackedApp | string
  appLimitMinutes?: number | string
  pages?: number | string
  juz?: number | string | null
  proteinGrams?: number | string
}

export interface GoalInput {
  type: GoalTypeId
  date: DateKey
  payload: GoalPayload
  recurrence: Recurrence
  recurrenceIntervalDays?: number | string | null
  recurrenceEndDate?: DateKey | '' | null
}

export interface Goal {
  id: string
  type: GoalTypeId
  date: DateKey
  payload: GoalPayload
  recurrence: Recurrence
  recurrenceIntervalDays: number | null
  recurrenceEndDate: DateKey | null
  completedDates: Record<DateKey, true>
  createdAt: string
  updatedAt: string
}

export type GoalFormState = Omit<GoalInput, 'recurrenceIntervalDays' | 'recurrenceEndDate'> & {
  recurrenceIntervalDays: number | string | null
  recurrenceEndDate: DateKey | '' | null
}

export type ValidationField =
  | 'type'
  | 'date'
  | 'recurrenceIntervalDays'
  | 'recurrenceEndDate'
  | 'gymHours'
  | 'gymType'
  | 'litres'
  | 'selectedPrayers'
  | 'appName'
  | 'appLimitMinutes'
  | 'pages'
  | 'juz'
  | 'proteinGrams'

export type ValidationErrors = Partial<Record<ValidationField, string>>

export interface ValidationResult {
  ok: boolean
  errors: ValidationErrors
}

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export interface Option<T extends string = string> {
  id: T
  label: string
}

export interface ChildrenProps {
  children: ReactNode
}
