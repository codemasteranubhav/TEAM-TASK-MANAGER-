import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--app-bg)' }}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout