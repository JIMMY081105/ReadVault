import { useSyncExternalStore } from 'react'
import { settingsStore } from '../db/settings'
import type { Settings } from '../types'

export function useSettings(): [Settings, (patch: Partial<Settings>) => Settings] {
  const settings = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.get,
    settingsStore.get,
  )
  return [settings, settingsStore.set]
}
