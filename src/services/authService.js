import { apiUrl } from '../lib/apiBase.js'

const jsonHeaders = { 'Content-Type': 'application/json' }

export async function loginRequest(email, password) {
  const r = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, ...data }
}

export async function registerRequest(name, email, password) {
  const r = await fetch(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ name, email, password }),
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, ...data }
}

export async function meRequest(token) {
  const r = await fetch(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, ...data }
}
