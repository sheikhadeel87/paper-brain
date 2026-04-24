# Performance spot-check (MVP §14)

Targets from [MVP_REQUIREMENTS.md](./MVP_REQUIREMENTS.md) §14:

| Path | Target |
|------|--------|
| **OCR + AI** (`POST /api/receipt/upload`) | Under **~10 seconds** per receipt (typical hardware + network) |
| **Dashboard list** (`GET /api/expenses`) | Under **~2 seconds** |

These are **environment-dependent**. This repo adds a **server-side timer** so you can verify without guesswork.

## Response header

Successful responses from:

- `POST /api/receipt/upload`
- `GET /api/expenses` (and `GET /api/expenses/export`, `POST`, `PATCH`, `DELETE` on the same router)

include:

```http
X-Process-Time-Ms: <integer>
```

That value is **wall-clock milliseconds** on the server for the whole handler (OCR + Gemini for upload; DB work for expenses).

## How to measure in the browser

1. Open DevTools → **Network**.
2. **Receipt:** upload an image; select the `upload` request → **Headers** → **Response Headers** → `X-Process-Time-Ms`. Compare to **10 000** ms.
3. **Dashboard:** open Dashboard or **Apply filters**; select `expenses?...` → same header. Compare to **2 000** ms.

You can also compare **Duration** in the Network row (includes network + browser); the header is **server-only** processing.

## If you are over budget

- **Upload:** smaller images, `GEMINI_MODEL=gemini-2.5-flash-lite` in project `.env` (or `backend/.env`), reduce concurrent load, faster CPU for Tesseract.
- **Dashboard:** lower `limit` in the client query if you raise it later; add Mongo indexes on hot filter fields if the dataset grows large.

## Recording results (optional)

Note your machine, image size, expense count, and a few `X-Process-Time-Ms` samples here or in your release notes when you sign off step 11.
