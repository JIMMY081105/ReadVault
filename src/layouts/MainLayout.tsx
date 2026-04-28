import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSettings } from '../hooks/useSettings'

export default function MainLayout() {
  const location = useLocation()
  const [settings] = useSettings()

  // Toggle the global theme class — CSS in index.css swaps surface/text colors.
  useEffect(() => {
    const root = document.documentElement
    if (settings.darkMode) {
      root.classList.remove('light')
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [settings.darkMode])

  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      {/* Page content — padded above the nav bar */}
      <main className="flex-1 pb-nav overflow-y-auto">
        {/* Key forces re-mount animation on route change */}
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>

      <Navbar />
    </div>
  )
}
