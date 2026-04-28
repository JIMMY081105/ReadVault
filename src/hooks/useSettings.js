import { useSyncExternalStore } from 'react'
import { settingsStore } from '../db/settings'

export function useSettings() {
  const settings = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.get,
    settingsStore.get,
  )
  return [settings, settingsStore.set]
}
