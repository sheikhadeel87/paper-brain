import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/apiBase.js'
import { loginRequest, meRequest, registerRequest } from '../services/authService.js'
import { AuthContext } from './authContext.js'

const TOKEN_KEY = 'paperbrain_token'
const USER_KEY = 'paperbrain_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [bootstrapping, setBootstrapping] = useState(
    () => Boolean(localStorage.getItem(TOKEN_KEY)),
  )

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => setBootstrapping(false))
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await meRequest(token)
      if (cancelled) return
      if (res.ok && res.success && res.user) {
        setUser(res.user)
        localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      } else {
        setToken('')
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
      setBootstrapping(false)
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await loginRequest(email, password)
    if (!res.ok || !res.success || !res.token || !res.user) {
      throw new Error(res.error || 'Login failed')
    }
    persistSession(res.token, res.user)
    return res.user
  }, [persistSession])

  const register = useCallback(async (name, email, password) => {
    const res = await registerRequest(name, email, password)
    if (!res.ok || !res.success || !res.token || !res.user) {
      throw new Error(res.error || 'Registration failed')
    }
    persistSession(res.token, res.user)
    return res.user
  }, [persistSession])

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const authFetch = useCallback(
    (input, init = {}) => {
      const url =
        typeof input === 'string' ? apiUrl(input) : input
      const headers = new Headers(init.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(url, { ...init, headers })
    },
    [token],
  )

  const value = useMemo(
    () => ({
      token,
      user,
      bootstrapping,
      login,
      register,
      logout,
      authFetch,
    }),
    [token, user, bootstrapping, login, register, logout, authFetch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
