# Tally Management Specification

## Overview

Monthly income and expense tracking with auto-save functionality. Features split-screen layout for income and expense tables, inline editing, and automatic population of subscription totals.

## API Contracts

### 1) Fetch Tally Data

- `GET /odata/Tally?financialYearId={id}&month={month}`
- Response:
  - `id: number | null`
  - `financialYearId: number`
  - `month: string` (e.g., "Apr", "May")
  - `incomePayload: string` (JSON)
  - `expensePayload: string` (JSON)
  - `totalIncome: number`
  - `totalExpense: number`
  - `lastSavedAt: string | null`
- If no data exists, return draft with auto-populated subscription total

### 2) Save Tally

- `PUT /odata/Tally`
- Request:
  - `financialYearId: number`
  - `month: string`
  - `incomePayload: string` (JSON)
  - `expensePayload: string` (JSON)
  - `totalIncome: number`
  - `totalExpense: number`
- Behavior:
  - Upsert by `(financialYearId, month)`
  - Always allows editing

## Data Model

### Table: `tally`

- `id` (PK)
- `financialYearId` (FK -> `financial_years.id`)
- `month` (VARCHAR, e.g., "Apr")
- `incomePayload` (TEXT, JSON)
- `expensePayload` (TEXT, JSON)
- `totalIncome` (DECIMAL)
- `totalExpense` (DECIMAL)
- `lastSavedAt` (TIMESTAMP)
- Unique index on `("financialYearId", "month")`

### Payload Schemas

#### Income Payload

```json
{
  "categories": [
    {
      "key": "subscription",
      "label": "Subscription",
      "amount": 0,
      "editable": false
    },
    {
      "key": "offerings",
      "label": "Offerings",
      "amount": 0,
      "editable": true
    }
  ]
}
```

#### Expense Payload

```json
{
  "categories": [
    {
      "key": "maintenance",
      "label": "Maintenance",
      "amount": 0,
      "editable": true
    }
  ]
}
```

## UI Schema

### Tally Page

- Path: `/tally`
- Layout: Split screen (50/50)
  - Left: Income Table
  - Right: Expense Table
- Header:
  - Financial Year dropdown
  - Month dropdown
  - Auto-save status

### Table Structure

- Columns: Category, Amount
- Footer: Total
- Inline editing for amounts
- Non-editable rows marked visually

## Calculation Rules

### Subscription Total (Auto-populated)

- Sum of all subscription card totals for the selected month across all persons in the financial year
- Query: Sum `totalAmount` from `subscriptions` where `financialYearId = ?` and card contains the month

### Total Income

- Sum of all income category amounts

### Total Expense

- Sum of all expense category amounts

## Auto-save Rules

- Trigger: 60 seconds inactivity after change
- Action: Save via `PUT /odata/Tally`
- UI Feedback:
  - "Saving..." during save
  - "Saved at HH:MM" after successful save
- Debounce: Timer resets on each edit

## Validation Rules

- `financialYearId`, `month` required
- Amounts must be non-negative numbers
- Month must be valid (Apr-Mar)
- Subscription amount is read-only

## Reusable Auto-save Hook

Create `useAutoSave` hook for forms with dirty state.

````typescript
interface UseAutoSaveOptions<T> {
  isDirty: boolean
  data: T
  saveFn: (data: T) => Promise<void>
  delay?: number
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSavedAt: string | null
}

function useAutoSave<T>(options: UseAutoSaveOptions<T>): UseAutoSaveReturn
```</content>
<parameter name="filePath">c:\Users\STANELY\source\repos\project-admin\.specify\specs\003-tally\spec.md
````
