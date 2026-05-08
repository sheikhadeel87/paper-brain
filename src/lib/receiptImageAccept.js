/** Max size for receipt images in the upload UI (matches prior MainApp / AddExpense behavior). */
export const RECEIPT_IMAGE_MAX_BYTES = 10 * 1024 * 1024

export function receiptImageMimeLooksSupported(file) {
  const t = (file.type || '').toLowerCase().trim()
  if (t === 'image/jpeg' || t === 'image/jpg' || t === 'image/png' || t === 'image/webp') {
    return true
  }
  if (t && t !== 'application/octet-stream') return false
  return /\.(jpe?g|png|webp)$/i.test(String(file.name || '').toLowerCase())
}

export function receiptImageFileWithinLimits(file) {
  return receiptImageMimeLooksSupported(file) && file.size <= RECEIPT_IMAGE_MAX_BYTES
}
