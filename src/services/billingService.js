import { apiUrl } from '../lib/apiBase.js'

async function parseBillingResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.success || !data.url) {
    throw new Error(data.error || fallbackMessage)
  }
  return data.url
}

export async function createCheckoutSession(authFetch) {
  const response = await authFetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'pro' }),
  })
  return parseBillingResponse(response, 'Unable to start checkout.')
}

export async function createCheckoutSessionWithToken(token) {
  const response = await fetch(apiUrl('/api/stripe/checkout'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan: 'pro' }),
  })
  return parseBillingResponse(response, 'Unable to start checkout.')
}

export async function createBillingPortalSession(authFetch) {
  const response = await authFetch('/api/stripe/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return parseBillingResponse(response, 'Unable to open billing portal.')
}
