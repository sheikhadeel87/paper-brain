import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth.js'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import MainApp from './MainApp.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { Toaster } from 'react-hot-toast';

function HomeRoute() {
  const { token, bootstrapping } = useAuth()
  if (bootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    )
  }
  if (token) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

export default function App() {
  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Must be before /:appSection so /app is not captured as segment "app". */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/app/add-expense" element={<Navigate to="/add-expense" replace />} />
      <Route path="/app/expenses" element={<Navigate to="/expenses" replace />} />
      <Route path="/app/receipts" element={<Navigate to="/receipts" replace />} />
      <Route
        path="/:appSection"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
