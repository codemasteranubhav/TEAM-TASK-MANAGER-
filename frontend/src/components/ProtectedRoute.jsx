import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-notion-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-notion-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-notion-muted text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute