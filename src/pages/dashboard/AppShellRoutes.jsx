import { useLocation } from 'react-router-dom'
import { APP_PATHS } from '../../lib/appRoutes.js'
import { DashboardHome } from './DashboardHome.jsx'
import { ExpenseList } from './ExpenseList.jsx'
import { AddExpense } from './AddExpense.jsx'
import { ReceiptList } from './ReceiptList.jsx'

function normalizePathname(pathname) {
  const p = String(pathname || '').replace(/\/+$/, '')
  return p === '' ? '/' : p
}

/** Picks the logged-in shell page from the URL (same URLs as before; no nested `<Routes>`). */
export function AppShellRoutes({
  dashboardProps,
  receiptScanProps,
  receiptLibraryProps,
}) {
  const { pathname } = useLocation()
  const p = normalizePathname(pathname)

  if (p === APP_PATHS.dashboard) {
    return <DashboardHome {...dashboardProps} />
  }
  if (p === APP_PATHS.expenses) {
    return <ExpenseList {...dashboardProps} />
  }
  if (p === APP_PATHS.addExpense) {
    return <AddExpense {...receiptScanProps} />
  }
  if (p === APP_PATHS.receipts) {
    return <ReceiptList {...receiptLibraryProps} />
  }
  return null
}
