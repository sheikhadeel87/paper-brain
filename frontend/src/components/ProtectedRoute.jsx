import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export function ProtectedRoute({ children }) {
  const { token, bootstrapping } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
