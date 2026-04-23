export function formatDashAmount(value, currency) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  const cur = (currency && String(currency).trim()) || ''
  const num = n.toFixed(2)
  return cur ? `${num} ${cur}` : num
}

export function cloneJsonSafe(value) {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}

export const emptyRow = () => ({ name: '', price: '' })

export function aiDataToDraft(aiData, options = {}) {
  const parseFailed = options.parseFailed === true
  if (parseFailed || !aiData || typeof aiData !== 'object') {
    return {
      vendor: '',
      date: '',
      total: '',
      currency: 'USD',
      tax: '',
      items: [emptyRow()],
      confidence: '',
      aiConfidence: null,
      confidence_flag: 'review',
    }
  }
  const date =
    aiData.date === '1970-01-01' || !aiData.date
      ? ''
      : String(aiData.date).trim()
  const items =
    Array.isArray(aiData.items) && aiData.items.length > 0
      ? aiData.items.map((i) => ({
          name: typeof i?.name === 'string' ? i.name : '',
          price:
            i?.price === null || i?.price === undefined || i?.price === ''
              ? ''
              : String(i.price),
        }))
      : [emptyRow()]
  const aiC =
    typeof aiData.confidence === 'number' && !Number.isNaN(aiData.confidence)
      ? aiData.confidence
      : null
  return {
    vendor: typeof aiData.vendor === 'string' ? aiData.vendor : '',
    date,
    total:
      aiData.total === null ||
      aiData.total === undefined ||
      Number.isNaN(Number(aiData.total))
        ? ''
        : String(aiData.total),
    currency: typeof aiData.currency === 'string' ? aiData.currency : 'USD',
    tax:
      aiData.tax === null || aiData.tax === undefined || aiData.tax === ''
        ? ''
        : String(aiData.tax),
    items,
    confidence: aiC !== null ? aiC : '',
    aiConfidence: aiC,
    confidence_flag: aiData.confidence_flag === 'auto' ? 'auto' : 'review',
  }
}

/** Mirrors server gate for when the user must tick review confirmation. */
export function needsReviewAcknowledge(draft, parseOk, needsReview) {
  if (!parseOk || needsReview) return true
  if (!draft) return false
  if (draft.confidence_flag === 'review') return true
  const n = Number(draft.confidence)
  if (!Number.isNaN(n) && n < 80) return true
  return false
}

export function draftToFinalData(draft, opts = {}) {
  const totalNum = draft.total.trim() === '' ? NaN : Number(draft.total)
  const taxRaw = draft.tax.trim()
  const taxNum = taxRaw === '' ? null : Number(taxRaw)
  let confidence =
    draft.confidence === '' ||
    draft.confidence === undefined ||
    draft.confidence === null
      ? 0
      : Number(draft.confidence)
  if (Number.isNaN(confidence)) confidence = 0
  if (opts.confirmReview === true && opts.originalAiParseFailed === true) {
    confidence = Math.max(confidence, 70)
  }
  return {
    vendor: draft.vendor.trim(),
    date: draft.date.trim(),
    total: Number.isNaN(totalNum) ? 0 : totalNum,
    currency: (draft.currency || 'USD').trim() || 'USD',
    tax:
      taxRaw === '' || (taxNum !== null && Number.isNaN(taxNum)) ? null : taxNum,
    items: draft.items
      .filter((row) => row.name.trim() !== '' || row.price.trim() !== '')
      .map((row) => {
        const p = row.price.trim()
        return {
          name: row.name.trim(),
          price: p === '' ? null : Number(p),
        }
      }),
    confidence,
    confidence_flag: draft.confidence_flag === 'auto' ? 'auto' : 'review',
  }
}
