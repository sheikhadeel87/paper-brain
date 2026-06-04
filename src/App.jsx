import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './context/useTheme.js'

const MainApp = lazy(() => import('./MainApp.jsx'))
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage.jsx'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage.jsx'))
const AcceptInvitePage = lazy(() => import('./pages/AcceptInvitePage.jsx'))

function RouteFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
      Loading…
    </div>
  )
}

export default function App() {
  const { isDark } = useTheme()
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: isDark ? '#18181b' : '#ffffff',
            color: isDark ? '#f4f4f5' : '#18181b',
            border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
          },
        }}
      />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccessPage />
              </ProtectedRoute>
            }
          />
          {/* Must be before /:appSection so /app is not captured as segment "app". */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/add-expense" element={<Navigate to="/add-expense" replace />} />
          <Route path="/app/expenses" element={<Navigate to="/expenses" replace />} />
          <Route path="/app/receipts" element={<Navigate to="/receipts" replace />} />
          <Route path="/app/dashboard/branches" element={<Navigate to="/dashboard/branches" replace />} />
          <Route path="/app/dashboard/teams" element={<Navigate to="/dashboard/teams" replace />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:appSection"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
