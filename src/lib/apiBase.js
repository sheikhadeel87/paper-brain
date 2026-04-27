/**
 * Base URL for the Express API (no trailing slash).
 * Local `vite` dev: always same-origin `/api` so the proxy (`vite.config`) can reach
 * your **local** server. A leftover `VITE_API_BASE_URL` in `.env` would otherwise
 * send every call to the deployed host and look like "prod is broken" while dev
 * is running on another terminal.
 * Production / `vite preview`: set `VITE_API_BASE_URL` (or `VITE_API_URL`).
 * To test the dev UI against a **remote** API, set `VITE_DEV_API_BASE_URL` (only in dev).
 */
export function getApiBase() {
  if (import.meta.env.DEV) {
    const devRemote =
      import.meta.env.VITE_DEV_API_BASE_URL || import.meta.env.VITE_DEV_API_URL
    if (typeof devRemote === 'string' && devRemote.trim()) {
      return devRemote.replace(/\/$/, '').trim()
    }
    return ''
  }
  const raw =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  if (typeof raw !== 'string') return ''
  return raw.replace(/\/$/, '').trim()
}

/** Prefix a path like `/api/...` with the API base when configured. */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = getApiBase()
  return base ? `${base}${p}` : p
}
