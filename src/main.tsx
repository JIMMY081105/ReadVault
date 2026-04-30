import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initSync } from './lib/sync'
import './index.css'

initSync()

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
