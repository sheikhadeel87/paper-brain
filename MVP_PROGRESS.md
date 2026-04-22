# MVP implementation progress

**Legend:** **Done** = shipped · **Partial** = started, not fully to spec · **Todo** = not started

**Summary:** **Done:** 11 · **Partial:** 0 · **Todo:** 1 — **Total steps: 12** (strict “fully done” count: **11 / 12**)

---

| Step | Area | What “done” means | Status |
|------|------|-------------------|--------|
| 1 | Ingest | Upload + OCR + Gemini JSON on `POST /api/receipt/upload` (no DB until confirm) | **Done** |
| 2 | Review + save | Editable draft + Confirm saves `Expense` in MongoDB | **Done** |
| 3 | Confidence | Flag/score visible; server blocks approved save unless `confirmReview` or `status: draft` | **Done** |
| 4 | Dashboard | List expenses with pagination (`skip` / `limit` on `GET /api/expenses`) | **Done** |
| 5 | Dashboard | Filters: date range (`from` / `to` on `createdAt`) + vendor substring | **Done** |
| 6 | Dashboard | Total spending summary by currency (`summary` on list API) | **Done** |
| 7 | Export | CSV download for filtered expenses (`GET /api/expenses/export`) | **Done** |
| 8 | Errors | OCR retry UX | **Done** |
| 9 | Errors | Gemini retry / invalid JSON handling | **Done** |
| 10 | Optional | `Receipt` drafts in DB + link to expense | **Todo** |
| 11 | Performance | Spot-check vs §14 targets (10s ingest, 2s dashboard) | **Done** |
| 12 | Docs | README run instructions; keep requirements in sync | **Done** |

Update this table as you ship work.
