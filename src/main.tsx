import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initSync } from './lib/sync'
import { settingsStore } from './db/settings'
import { scheduleDailyReminder, notificationPermission } from './lib/notifications'
import './index.css'

initSync()

// Re-arm the daily reminder on every app boot if it's enabled and permitted.
// (setTimeout doesn't survive a tab close — we re-schedule when the app reopens.)
if (settingsStore.get().dailyReminder && notificationPermission() === 'granted') {
  scheduleDailyReminder()
}

// Register service worker via vite-plugin-pwa (injected at build time)
// In dev mode this is a no-op

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('ReadVault root element was not found.')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
