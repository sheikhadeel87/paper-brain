/** Canonical URLs for the logged-in shell (no `/app` prefix). */
export const APP_PATHS = {
  dashboard: '/dashboard',
  addExpense: '/add-expense',
  expenses: '/expenses',
  receipts: '/receipts',
}

/**
 * Maps first path segment to MainApp tab/panel state.
 */
export function parseAppSection(segment) {
  const s = String(segment ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
  if (!s) return null
  switch (s) {
    case 'dashboard':
      return {
        mainTab: 'dashboard',
        dashboardPanel: 'overview',
        receiptPanel: 'scan',
      }
    case 'expenses':
      return {
        mainTab: 'dashboard',
        dashboardPanel: 'expenses',
        receiptPanel: 'scan',
      }
    case 'add-expense':
      return {
        mainTab: 'receipt',
        dashboardPanel: 'overview',
        receiptPanel: 'scan',
      }
    case 'receipts':
      return {
        mainTab: 'receipt',
        dashboardPanel: 'overview',
        receiptPanel: 'library',
      }
    default:
      return null
  }
}

/** First segment of the pathname (e.g. `/dashboard` → `dashboard`). */
export function primaryPathSegment(pathname) {
  const parts = String(pathname || '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
  return parts[0] ?? ''
}
