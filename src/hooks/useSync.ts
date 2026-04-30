import { useSyncExternalStore } from 'react'
import { syncStore } from '../lib/sync'

// Increments whenever a remote pull rewrites the local cache.
// Pages that read books/goals can include this in their render to re-read.
export function useSyncRevision(): number {
  return useSyncExternalStore(
    syncStore.subscribe,
    syncStore.getRevision,
    syncStore.getRevision,
  )
}
