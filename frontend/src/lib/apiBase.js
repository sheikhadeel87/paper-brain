/**
 * Base URL for the Express API (no trailing slash).
 * Leave unset for local dev — Vite proxies `/api` to the backend.
 * Production: set `VITE_API_BASE_URL` or `VITE_API_URL`.
 */
export function getApiBase() {
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
