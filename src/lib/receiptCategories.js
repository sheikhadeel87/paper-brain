export const RECEIPT_CATEGORIES = [
  'Food',
  'Fuel',
  'Grocery',
  'Shopping',
  'Bills',
  'Medical',
  'Travel',
  'Entertainment',
  'Other',
]

export const DEFAULT_RECEIPT_CATEGORY = 'Other'

export function normalizeReceiptCategory(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  return (
    RECEIPT_CATEGORIES.find(
      (category) => category.toLowerCase() === raw.toLowerCase(),
    ) || DEFAULT_RECEIPT_CATEGORY
  )
}
