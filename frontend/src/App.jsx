import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth.js'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import MainApp from './MainApp.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function HomeRedirect() {
  const { token, bootstrapping } = useAuth()
  if (bootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    )
  }
  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
