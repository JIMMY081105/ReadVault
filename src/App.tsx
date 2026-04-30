import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Library from './pages/Library'
import Reader from './pages/Reader'
import Calendar from './pages/Calendar'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      {/* Reader is full-screen — no nav bar */}
      <Route path="/reader/:id?" element={<Reader />} />

      {/* All other pages share the main layout */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
