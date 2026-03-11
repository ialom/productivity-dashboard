import { NavLink } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const links = [
  { to: '/', label: 'Dashboard', short: 'Home' },
  { to: '/add-task', label: 'Add Task', short: 'Add' },
  { to: '/daily-plan', label: 'Daily Plan', short: 'Plan' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()

  return (
    /* pt accounts for notch/status-bar on devices that use viewport-fit=cover */
    <nav className="bg-indigo-700 dark:bg-indigo-950 border-b border-indigo-800/40 shadow-sm pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between gap-2">

        {/* Brand — full name on ≥ sm, abbreviated on mobile to save space */}
        <span className="text-white font-semibold tracking-tight select-none shrink-0 leading-none">
          <span className="sm:hidden text-sm">PD</span>
          <span className="hidden sm:inline text-[15px]">Productivity Dashboard</span>
        </span>

        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
          {/* Nav links */}
          <ul className="flex gap-0.5 sm:gap-1">
            {links.map(({ to, label, short }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center h-8 sm:h-auto px-2 sm:px-3.5 sm:py-1.5 rounded-lg font-medium transition-colors leading-none ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {/* Short label on mobile, full label on desktop */}
                  <span className="sm:hidden text-xs">{short}</span>
                  <span className="hidden sm:inline text-sm">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Dark mode toggle — 44×44 touch target on mobile */}
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
