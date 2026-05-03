# Subscription Management Specification

## API Contracts

### 1) Search Reuse (existing)

- `GET /odata/Records/search`
- Used to search people/families before opening a subscription card.
- No new search endpoint introduced.

### 2) Financial Years

- `GET /odata/Subscriptions/financial-years`
- Response:
  - `id: number`
  - `yearLabel: string`
  - `startDate: string (ISO date)`
  - `endDate: string (ISO date)`
  - `active: boolean`

### 3) Fetch Subscription Card

- `GET /odata/Subscriptions?personId={id}&financialYearId={id}`
- Returns existing card or a generated draft payload if absent.
- Response:
  - `id: number | null`
  - `personId: number`
  - `familyId: number`
  - `personName: string`
  - `familyName: string`
  - `memberNo: string | null`
  - `financialYearId: number`
  - `financialYearLabel: string`
  - `status: 'DRAFT' | 'SUBMITTED'`
  - `isLocked: boolean`
  - `totalAmount: number`
  - `lastSavedAt: string | null`
  - `cardPayload: string` (JSON)

### 4) Save Draft / Submit (single write endpoint)

- `PUT /odata/Subscriptions`
- Request:
  - `personId: number`
  - `financialYearId: number`
  - `status: 'DRAFT' | 'SUBMITTED'`
  - `cardPayload: string` (JSON serialized table)
  - `totalAmount: number`
  - `lockRecord: boolean` (ignored, always false)
- Behavior:
  - Upsert by `(personId, financialYearId)`
  - Always allows editing, no locking
  - `SUBMITTED` stamps submit time

### 5) Family Contribution Bulk Update

- `PATCH /odata/Subscriptions/family-contributions`
- Request:
  - `familyId: number`
  - `financialYearId: number`
  - `cardPayload: string`
  - `totalAmount: number`
- Response:
  - `updatedMembers: number`

## Data Model

### Existing + Extended Table: `subscriptions`

- Existing:
  - `id`, `familyId`, `financialYearId`
  - `santhaAmount`, `ministryAmount`, `mainAmount`, `totalAmount`
  - `status`, `lastSavedAt`
- Added in migration `V2__subscription_card_fields.sql`:
  - `personId BIGINT NULL` (FK -> `persons.id`)
  - `cardPayload TEXT NOT NULL DEFAULT '{}'`
  - `submittedAt TIMESTAMP NULL`
  - `isLocked BOOLEAN NOT NULL DEFAULT FALSE`
  - Unique index on `("personId","financialYearId")` when `personId` is not null

### Payload Schema (`cardPayload`)

- `valuesByMonth: Record<Month, Record<CategoryKey, string>>`
- `datesByMonth: Record<Month, string>`
- `treasurerSignature: string`
- `Month`: `Apr` ... `Mar`
- `CategoryKey`:
  - `subscriptionOffering`
  - `MensfellowshipContribution`
  - `womenfellowshipContribution`
  - `churchBuildingFund`
  - `ezhilanFund`
  - `ims`
  - `dbm`
  - `fmpb`
  - `evangelism`
  - `elderlySupport`
  - `emaaki`

## UI Schema

### Subscription Page

- Path: `/subscriptions`
- Sections:
  1. Search bar (reuses records search backend)
  2. Financial year dropdown
  3. Person result selector
  4. Grid table (Tamil labels, month columns)
  5. Computed total row (read-only)
  6. Date row
  7. Treasurer signature input
  8. Action row:
     - `Update Family Contributions`
     - `Submit`

### Additional UI Updates

- Added `Subscriptions` tab in navigation.
- Added `Add User` button in records search header.

## Validation Rules

### Save / Submit

- `personId`, `financialYearId`, `status`, `cardPayload`, `totalAmount` required.
- `status` must be `DRAFT` or `SUBMITTED`.
- Submit flow requires `treasurerSignature` on frontend.
- Cards are always editable

### Bulk Family Update

- `familyId`, `financialYearId`, `cardPayload`, `totalAmount` required.
- Updates all family members

## Calculation Rules

### Per-Month Total

- Sum for each month:
  - `subscriptionOffering`
  - `MensfellowshipContribution`
  - `womenfellowshipContribution`
  - `churchBuildingFund`
  - `ezhilanFund`
  - `ims`
  - `dbm`
  - `fmpb`
  - `evangelism`
  - `elderlySupport`
  - `emaaki`

### Grand Total

- Sum of all month totals.
- Stored in `totalAmount` with save/submit.

## Auto-save Rules

- Trigger: 60 seconds inactivity after change.
- Action: saves draft through `PUT /odata/Subscriptions`.
- Debounce behavior: timer resets on each edit.
- User feedback: `Saving...` and last saved timestamp.

## Edge Cases

- Partial data remains valid for draft save.
- Financial year switch reloads selected person card.
- Concurrent edits rely on last-write-wins (current behavior).
- Network failure shows error toast and keeps local edits dirty.
