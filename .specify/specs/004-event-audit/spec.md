# Event Audit Specification

## Scope

Event Audit provides structured event lifecycle and event record management:
- Create and manage live events
- Automatically treat events as past when end date is passed
- Record and manage event logs for decisions, purchases, income, and expense
- Keep past events read-only for historical reference

## Event Lifecycle Rules

### Live Event
- Event is live when `today <= endDate`
- Allowed actions:
  - Edit event metadata
  - Delete event
  - Add, edit, and delete event records

### Past Event
- Event is past when `today > endDate`
- Enforced as read-only:
  - No event updates/deletes
  - No record create/update/delete
  - View-only event details and records

### Status Source
- Status is resolved dynamically from end date at runtime:
  - `LIVE` when current date is on/before end date
  - `PAST` when current date is after end date

## Data Model

### Existing Table: `events`
- `id`
- `name`
- `startDate`
- `endDate`
- `status` (legacy field; runtime status is computed dynamically)
- `description`
- `createdAt`

### Existing + Extended Table: `event_audit_items`
- Existing:
  - `id`
  - `eventId`
  - `type` (`DECISION`, `PURCHASE`, `INCOME`, `EXPENSE`)
  - `description`
  - `amount`
  - `createdAt`
- Added fields:
  - `itemName` (for purchase item name)
  - `quantity` (for purchase quantity)
  - `unit` (for purchase unit)

## API Contracts

Base path: `/odata/EventAudit`

### Events

1. `GET /events`
- Returns list of events with computed `status` and `live` flag

2. `POST /events`
- Create event
- Request:
  - `name: string`
  - `startDate: string (yyyy-MM-dd)`
  - `endDate: string (yyyy-MM-dd)`
  - `description?: string`

3. `GET /events/{eventId}`
- Returns event details and all records

4. `PATCH /events/{eventId}`
- Update event (live only)
- Same request shape as create

5. `DELETE /events/{eventId}`
- Delete event (live only)

### Event Records

1. `GET /events/{eventId}/records`
- List event records

2. `POST /events/{eventId}/records`
- Create record (live only)
- Request:
  - `type: 'DECISION' | 'PURCHASE' | 'INCOME' | 'EXPENSE'`
  - `description: string`
  - `amount?: number`
  - `itemName?: string`
  - `quantity?: number`
  - `unit?: string`

3. `PATCH /events/{eventId}/records/{recordId}`
- Update record (live only)
- Same request shape as create

4. `DELETE /events/{eventId}/records/{recordId}`
- Delete record (live only)

## Validation Rules

### Event
- `name`, `startDate`, and `endDate` are required
- `startDate <= endDate`
- Update/delete blocked for past events

### Record
- `type` must be one of: `DECISION`, `PURCHASE`, `INCOME`, `EXPENSE`
- `description` required
- For `INCOME` and `EXPENSE`: `amount > 0`
- For `PURCHASE`:
  - `itemName` required
  - `quantity > 0`
- Record mutations blocked for past events

## UI/UX

Path: `/event-audit`

Sections:
1. Event create form
2. Event list with live/past badge
3. Event details editor (editable only for live)
4. Record form (visible/editable only for live)
5. Records table (viewable for live and past)

Behavior:
- Selecting event loads details and records
- Live events show edit/delete controls
- Past events show read-only state

## Error Handling

Backend uses existing global exception handling:
- Validation errors -> `400`
- Illegal state (editing past event) -> `400`
- Missing resources -> `404`

Frontend:
- Displays toast messages for all API failures
- Keeps existing page state intact on failed operations

## Backward Compatibility

- Reuses existing `events` and `event_audit_items` data model
- Adds optional fields to `event_audit_items` without breaking existing rows
- No breaking changes to existing Records/Subscriptions/Tally flows
