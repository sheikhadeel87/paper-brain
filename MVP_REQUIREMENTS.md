# AI Receipt & Expense Tracker — MVP Requirements

**Delivery:** 2 weeks (80 hours)  
**Status:** Source of truth for MVP scope — follow this document when implementing or changing the product.  
**Live progress (steps done / left):** see [MVP_PROGRESS.md](MVP_PROGRESS.md).

---

## 1. Objective

Build a web app that allows users to:

- Upload receipt images  
- Automatically extract expense data using **OCR + Gemini**  
- **Review and edit** extracted data **before** saving  
- Store structured **expenses** in **MongoDB**  
- View and analyze spending via **dashboard**

---

## 2. Core Principle

**AI-assisted expense logging with human confirmation.**

Flow: **AI suggests data → User confirms → System saves a clean record.**

---

## 3. Tech Stack

| Layer   | Technology                          |
|--------|--------------------------------------|
| Frontend | **React.js**                       |
| Backend  | **Node.js** + **Express.js**       |
| Database | **MongoDB**                        |
| OCR      | Free OCR API **or** **Tesseract.js** (developer choice) |
| AI       | **Gemini** (free tier)            |

---

## 4. System Flow

1. User uploads receipt image  
2. OCR extracts **raw text**  
3. OCR text (and image/context per implementation) is sent to **Gemini**  
4. Gemini returns **structured JSON**  
5. System shows an **editable draft** to the user  
6. User **confirms or edits**  
7. Data is saved in **MongoDB**  
8. Data appears in **dashboard** and **reports**

---

## 5. OCR Requirement

OCR is **only** responsible for:

- Converting **image → raw text**  
- **No** formatting or structuring  

**Example output:**

```text
Walmart Store
Date: 21/03/2026
Burger 450
Fries 220
TOTAL 670
```

---

## 6. Gemini AI Parsing Requirement

Gemini is responsible for:

- Understanding raw OCR text  
- Extracting **structured expense data**  
- Handling different receipt formats  
- Handling messy or broken OCR output  

---

## 7. Required Gemini Output Format (STRICT JSON)

Gemini must return data in this structure:

Shape (strict JSON from Gemini; types as specified):

```json
{
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "total": 0,
  "currency": "string",
  "tax": null,
  "items": [
    {
      "name": "string",
      "price": 0
    }
  ],
  "confidence": 0,
  "confidence_flag": "auto"
}
```

- `total`, `confidence`, each `price`: **number**  
- `tax`: **number | null**  
- `confidence_flag`: **`"auto"`** | **`"review"`**

---

## 8. Confidence Rules

Gemini assigns **confidence** (0–100). Guideline:

- Vendor found → **+30**  
- Date found → **+30**  
- Total found → **+40**  

---

## 9. Confidence Flag Rules

- If **confidence ≥ 80** → `"auto"`  
- If **confidence < 80** → `"review"`  

---

## 10. Draft Review Screen (Mandatory)

Before saving to DB, the user must see:

**Editable fields:**

- Vendor  
- Date  
- Total  
- Currency  
- Tax  
- Items list  

**Actions:**

- Edit fields  
- **Confirm & Save**  
- **Reject / reprocess**  

---

## 11. MongoDB Data Model (Expense Record)

Each **expense** record should include:

- `vendor`  
- `date`  
- `total`  
- `currency`  
- `tax`  
- `items` (array)  
- **Raw OCR text**  
- **Full Gemini JSON response**  
- **Confidence score**  
- **Confidence flag**  
- `createdAt`  

---

## 12. Dashboard Requirements

The user must be able to:

- View **all** expenses  
- **Filter** by date range  
- **Filter** by vendor  
- View **total spending** summary  
- **Export** data (**CSV**, basic version)  

---

## 13. Error Handling

The system must handle:

- **OCR failure** → retry option  
- **Gemini failure** → show raw text + **manual entry**  
- **Invalid JSON** → reject and **retry** API call  
- **Low confidence** → **force** review screen  

---

## 14. Performance Targets

- **OCR + AI** processing: **under 10 seconds** per receipt  
- **Dashboard** load: **under 2 seconds**  

**Implementation note:** The API sets **`X-Process-Time-Ms`** on receipt upload and expense routes for spot-checks; see [PERFORMANCE.md](./PERFORMANCE.md).

---

## 15. MVP Scope (Must Have)

All of the following are **in scope** for the MVP:

- Upload receipt  
- OCR text extraction  
- Gemini structured parsing  
- Draft review UI  
- MongoDB storage  
- Expense dashboard  
- Confidence flag system  

---

## Implementation notes (non-normative)

- **Receipt vs expense:** Upload + OCR + Gemini runs on **`POST /api/receipt/upload`** and does **not** persist a final expense. The user reviews in the UI; **`POST /api/expenses`** persists the **authoritative expense** (§11) after **Confirm & Save**. Optional future: store **draft receipts** in a `receipts` collection and link `expenseId`.  
- **Current codebase:** Matches §4 and §10 (parse first, confirm then save).

When in doubt, **§2 (human confirmation)** and **§10 (draft review)** override convenience shortcuts.
