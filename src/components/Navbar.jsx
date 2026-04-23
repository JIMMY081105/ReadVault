import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  CalendarDaysIcon as CalendarIconSolid,
  Cog6ToothIcon as CogIconSolid,
} from '@heroicons/react/24/solid'

const tabs = [
  { to: '/',          label: 'Home',     Icon: HomeIcon,          IconActive: HomeIconSolid },
  { to: '/library',   label: 'Library',  Icon: BookOpenIcon,      IconActive: BookOpenIconSolid },
  { to: '/calendar',  label: 'Calendar', Icon: CalendarDaysIcon,  IconActive: CalendarIconSolid },
  { to: '/settings',  label: 'Settings', Icon: Cog6ToothIcon,     IconActive: CogIconSolid },
]

export default function Navbar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 no-select"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/[0.06]" />

      <div className="relative flex items-center justify-around px-2 h-[4.5rem]">
        {tabs.map(({ to, label, Icon, IconActive }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 py-2 transition-all duration-200">
                <div className={`relative flex items-center justify-center w-6 h-6 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                  {isActive
                    ? <IconActive className="w-6 h-6 text-accent" />
                    : <Icon className="w-6 h-6 text-text-muted" />
                  }
                </div>
                <span className={`text-2xs font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-accent' : 'text-text-muted'
                }`}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
