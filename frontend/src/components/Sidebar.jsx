import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  LogOut, Sun, Moon, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-50 border-r"
      style={{ background: 'var(--app-sidebar)', borderColor: 'var(--app-border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b"
        style={{ borderColor: 'var(--app-border)' }}>
        <div className="w-7 h-7 bg-app-accent rounded-md flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--app-text)' }}>
          TaskFlow
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'font-medium'
                  : 'hover:opacity-100 opacity-70'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--app-hover)' : 'transparent',
              color: 'var(--app-text)',
            })}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-3 border-t space-y-1"
        style={{ borderColor: 'var(--app-border)' }}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full transition-colors opacity-70 hover:opacity-100"
          style={{ color: 'var(--app-text)' }}
        >
          {theme === 'dark'
            ? <><Sun className="w-4 h-4" /> Light mode</>
            : <><Moon className="w-4 h-4" /> Dark mode</>
          }
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md group cursor-default"
          style={{ color: 'var(--app-text)' }}>
          <div className="w-6 h-6 bg-app-accent rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <p className="text-xs truncate opacity-50">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar