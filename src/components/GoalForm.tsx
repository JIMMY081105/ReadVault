import { useEffect, useState, type ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'
import {
  GOAL_TYPE_LIST,
  GYM_KINDS,
  WATER_MAX_LITRES,
  PRAYERS,
  FIVE_DAILY_PRAYERS,
  TRACKED_APPS,
  RECURRENCE_OPTIONS,
  emptyPayloadForType,
  validateGoalInput,
} from '../utils/goalTypes'
import type {
  DateKey,
  Goal,
  GoalFormState,
  GoalInput,
  GoalPayload,
  GoalTypeId,
  GymKind,
  Option,
  TrackedApp,
  ValidationErrors,
} from '../types'

function buildInitialState(initial: Goal | null, defaultDate: DateKey): GoalFormState {
  if (initial) {
    return {
      type: initial.type,
      date: initial.date,
      payload: { ...emptyPayloadForType(initial.type), ...(initial.payload || {}) },
      recurrence: initial.recurrence || 'none',
      recurrenceIntervalDays: initial.recurrenceIntervalDays ?? 2,
      recurrenceEndDate: initial.recurrenceEndDate || '',
    }
  }
  return {
    type: 'gym',
    date: defaultDate,
    payload: emptyPayloadForType('gym'),
    recurrence: 'none',
    recurrenceIntervalDays: 2,
    recurrenceEndDate: '',
  }
}

interface GoalFormProps {
  open: boolean
  initial?: Goal | null
  defaultDate: DateKey
  onClose: () => void
  onSubmit: (input: GoalInput) => void
}

export default function GoalForm({ open, initial = null, defaultDate, onClose, onSubmit }: GoalFormProps) {
  const [state, setState] = useState(() => buildInitialState(initial, defaultDate))
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Re-seed on open / when editing a different goal
  useEffect(() => {
    if (open) {
      setState(buildInitialState(initial, defaultDate))
      setErrors({})
    }
  }, [open, initial, defaultDate])

  const isEditing = Boolean(initial)

  const setField = <K extends keyof GoalFormState>(key: K, value: GoalFormState[K]) => {
    setState((s) => ({ ...s, [key]: value }))
  }
  const setPayload = (patch: GoalPayload) => {
    setState((s) => ({ ...s, payload: { ...s.payload, ...patch } }))
  }

  const changeType = (type: GoalTypeId) => {
    setState((s) => ({ ...s, type, payload: emptyPayloadForType(type) }))
    setErrors({})
  }

  const submit = () => {
    const result = validateGoalInput(state)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    onSubmit(sanitize(state))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-white/[0.08] rounded-t-3xl sm:rounded-3xl shadow-elevated"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-white/[0.05] px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            {isEditing ? 'Edit goal' : 'New goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Type picker */}
          <Field label="Type" error={errors.type}>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPE_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeType(t.id)}
                  className={`
                    flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all
                    ${state.type === t.id
                      ? 'bg-accent/15 border-accent/40 text-text-primary'
                      : 'bg-surface-2 border-white/[0.06] text-text-secondary hover:bg-surface-3'}
                  `}
                  type="button"
                >
                  <span className="text-xl" aria-hidden>{t.icon}</span>
                  <span className="text-2xs font-medium leading-tight text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Type-specific fields */}
          <TypeFields type={state.type} payload={state.payload} setPayload={setPayload} errors={errors} />

          {/* Date */}
          <Field label="Date" error={errors.date}>
            <DateInput value={state.date} onChange={(v) => setField('date', v)} />
          </Field>

          {/* Recurrence */}
          <Field label="Repeat">
            <Select
              value={state.recurrence}
              onChange={(v) => setField('recurrence', v)}
              options={RECURRENCE_OPTIONS}
            />
          </Field>

          {state.recurrence === 'every_n_days' && (
            <Field label="Repeat every (days)" error={errors.recurrenceIntervalDays}>
              <NumberInput
                value={state.recurrenceIntervalDays}
                onChange={(v) => setField('recurrenceIntervalDays', v)}
                min={1}
                step={1}
              />
            </Field>
          )}

          {state.recurrence !== 'none' && (
            <Field label="End date (optional)" error={errors.recurrenceEndDate} hint="Leave blank to repeat forever.">
              <DateInput
                value={state.recurrenceEndDate}
                onChange={(v) => setField('recurrenceEndDate', v)}
                min={state.date}
              />
            </Field>
          )}
        </div>

        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-white/[0.05] px-5 py-4 flex gap-2">
          <Button variant="surface" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={submit}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function sanitize(state: GoalFormState): GoalInput {
  const out: GoalInput = {
    ...state,
    payload: { ...state.payload },
    recurrenceEndDate: state.recurrenceEndDate || null,
    recurrenceIntervalDays: state.recurrence === 'every_n_days' ? state.recurrenceIntervalDays : null,
  }

  // Trim juz to a number or null
  if (out.type === 'quran') {
    const j = out.payload.juz
    out.payload = { ...out.payload, juz: j === '' || j == null ? null : Number(j) }
  }
  return out
}

// ── Type-specific subforms ──────────────────────────────────────────────────

interface TypeFieldsProps {
  type: GoalTypeId
  payload: GoalPayload
  setPayload: (patch: GoalPayload) => void
  errors: ValidationErrors
}

function TypeFields({ type, payload, setPayload, errors }: TypeFieldsProps) {
  switch (type) {
    case 'gym':
      return (
        <>
          <Field label="Hours" error={errors.gymHours} hint="Decimals allowed (e.g. 1.5).">
            <NumberInput
              value={payload.gymHours}
              onChange={(v) => setPayload({ gymHours: v })}
              min={0}
              step={0.5}
            />
          </Field>
          <Field label="Type" error={errors.gymType}>
            <SegmentedControl
              value={(payload.gymType || 'anaerobic') as GymKind}
              onChange={(v) => setPayload({ gymType: v })}
              options={GYM_KINDS.map((k) => ({ id: k, label: capitalize(k) }))}
            />
          </Field>
        </>
      )
    case 'water':
      return (
        <Field label="Litres" error={errors.litres} hint={`Maximum ${WATER_MAX_LITRES}L per day.`}>
          <NumberInput
            value={payload.litres}
            onChange={(v) => setPayload({ litres: v })}
            min={0}
            max={WATER_MAX_LITRES}
            step={0.25}
          />
        </Field>
      )
    case 'salah':
      return (
        <Field label="Prayers" error={errors.selectedPrayers}>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRAYERS.map((p) => {
              const active = payload.selectedPrayers?.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const set = new Set(payload.selectedPrayers || [])
                    set.has(p) ? set.delete(p) : set.add(p)
                    setPayload({ selectedPrayers: Array.from(set) })
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${active
                      ? 'bg-accent/20 border-accent/40 text-accent'
                      : 'bg-surface-2 border-white/[0.07] text-text-secondary hover:bg-surface-3'}
                  `}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setPayload({ selectedPrayers: [...FIVE_DAILY_PRAYERS] })}
            className="text-2xs text-accent hover:text-accent/80"
          >
            + Add all 5 daily prayers
          </button>
        </Field>
      )
    case 'app_limit':
      return (
        <>
          <Field label="App" error={errors.appName}>
            <SegmentedControl
              value={(payload.appName || TRACKED_APPS[0] || '抖音') as TrackedApp}
              onChange={(v) => setPayload({ appName: v })}
              options={TRACKED_APPS.map((a) => ({ id: a, label: a }))}
            />
          </Field>
          <Field label="Time limit (minutes)" error={errors.appLimitMinutes}>
            <NumberInput
              value={payload.appLimitMinutes}
              onChange={(v) => setPayload({ appLimitMinutes: v })}
              min={0}
              step={5}
            />
          </Field>
        </>
      )
    case 'quran':
      return (
        <>
          <Field label="Pages per day" error={errors.pages}>
            <NumberInput
              value={payload.pages}
              onChange={(v) => setPayload({ pages: v })}
              min={0}
              step={1}
            />
          </Field>
          <Field label="Juz (optional)" error={errors.juz} hint="1–30. Leave blank if not specifying.">
            <NumberInput
              value={payload.juz}
              onChange={(v) => setPayload({ juz: v })}
              min={1}
              max={30}
              step={1}
            />
          </Field>
        </>
      )
    case 'protein':
      return (
        <Field label="Grams of protein" error={errors.proteinGrams}>
          <NumberInput
            value={payload.proteinGrams}
            onChange={(v) => setPayload({ proteinGrams: v })}
            min={0}
            step={5}
          />
        </Field>
      )
    default:
      return null
  }
}

// ── Form primitives ─────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  error?: string | undefined
  hint?: string | undefined
  children: ReactNode
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-2xs font-semibold text-text-muted uppercase tracking-widest mb-2">
        {label}
      </span>
      {children}
      {hint && !error && <p className="mt-1.5 text-2xs text-text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-2xs text-red-400">{error}</p>}
    </label>
  )
}

const inputClass =
  'w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-text-primary ' +
  'focus:outline-none focus:border-accent/60 focus:bg-surface-3 transition-colors'

interface NumberInputProps {
  value: number | string | null | undefined
  onChange: (value: number | string) => void
  min: number
  max?: number
  step: number
}

function NumberInput({ value, onChange, min, max, step }: NumberInputProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className={`${inputClass} number-input-clean`}
    />
  )
}

interface DateInputProps {
  value: DateKey | '' | null
  onChange: (value: DateKey) => void
  min?: DateKey
}

function DateInput({ value, onChange, min }: DateInputProps) {
  return (
    <input
      type="date"
      value={value || ''}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} appearance-none`}
      style={{ colorScheme: 'dark' }}
    />
  )
}

interface SelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly Option<T>[]
}

function Select<T extends string>({ value, onChange, options }: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`${inputClass} appearance-none`}
      style={{ colorScheme: 'dark' }}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  )
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly Option<T>[]
}

function SegmentedControl<T extends string>({ value, onChange, options }: SegmentedControlProps<T>) {
  return (
    <div className="flex bg-surface-2 border border-white/[0.07] rounded-xl p-1 gap-1">
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`
              flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all
              ${active ? 'bg-accent text-black shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}
            `}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
