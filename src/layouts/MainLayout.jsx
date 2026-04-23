import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MainLayout() {
  const location = useLocation()

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
