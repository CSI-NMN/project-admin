# Records Specification

## Status

Implemented and active in the current codebase.

## Scope

The records feature manages:
- Family creation and updates
- Person creation, updates, deletion, and family moves
- Family search
- Celebration views for birthdays and anniversaries
- Optional membership creation during person creation

## Data Model

### Families

Table: `families`

Fields:
- `id`
- `familyCode`
- `familyName`
- `address1`
- `area`
- `address2`
- `pincode`
- `city`
- `state`
- `familyHeadId`
- `createdAt`
- `updatedAt`

Ownership:
- UI supplies: `familyName`, `address1`, `area`, `address2`, `pincode`, `city`, `state`
- Backend owns: `id`, `familyCode`, `familyHeadId`, `createdAt`, `updatedAt`

### Memberships

Table: `memberships`

Fields:
- `id`
- `name`

Ownership:
- UI optionally supplies: `name` during person creation when the user selects `Yes` for new subscription
- Backend owns: `id`

### Persons

Table: `persons`

Fields:
- `id`
- `familyId`
- `memberNo`
- `firstName`
- `lastName`
- `gender`
- `maritalStatus`
- `dateOfBirth`
- `dateOfBaptism`
- `dateOfConfirmation`
- `dateOfMarriage`
- `bloodGroup`
- `profession`
- `mobileNo`
- `aadhaarNumber`
- `email`
- `relationshipType`
- `isHead`
- `createdAt`
- `updatedAt`

Notes:
- `memberNo` stores the foreign key to `memberships.id`
- `memberNo` may be null

Ownership:
- UI supplies: `firstName`, `lastName`, `gender`, `maritalStatus`, `dateOfBirth`, `dateOfBaptism`, `dateOfConfirmation`, `dateOfMarriage`, `bloodGroup`, `profession`, `mobileNo`, `aadhaarNumber`, `email`, `relationshipType`, `isHead`
- UI also supplies: `createSubscription`, `subscriptionName` during create flow only
- Backend owns: `id`, `familyId`, `memberNo`, `createdAt`, `updatedAt`

## Behavior

### Family Create

1. User enters family details.
2. Backend generates `familyCode`.
3. Backend stores audit fields.

### Person Create

1. User enters person details.
2. User chooses whether to add a new subscription.
3. If `Yes`, backend creates a `memberships` record and stores its `id` in `persons.memberNo`.
4. If `No`, backend stores `persons.memberNo` as null.
5. If this is the first member in a family, backend marks the person as head and sets relationship type to `Head`.

### Person Update

1. PATCH accepts changed fields only.
2. Person identity and timestamps remain backend-owned.
3. Membership is currently treated as create-time behavior and is not manually edited through the current UI flow.

### Head Resolution

1. `isHead` on the person determines the family head.
2. Backend refreshes `familyHeadId` after person create, update, move, or delete.

### Search

The records search supports:
- Family ID
- Family code
- Member name
- Membership ID
- Membership name
- Phone number
- Aadhaar number

## API Contract

Base route:
- `/odata/Records`

Current endpoints:
- `GET /odata/Records`
- `GET /odata/Records/{familyId}`
- `POST /odata/Records`
- `PATCH /odata/Records/{familyId}`
- `DELETE /odata/Records/{familyId}`
- `GET /odata/Records/search`
- `GET /odata/Records/celebrations`
- `GET /odata/Records/{familyId}/Persons`
- `GET /odata/Records/{familyId}/Persons/{personId}`
- `POST /odata/Records/{familyId}/Persons`
- `PATCH /odata/Records/{familyId}/Persons/{personId}`
- `DELETE /odata/Records/{familyId}/Persons/{personId}`
- `PATCH /odata/Records/Persons/{personId}/move`

## Frontend Notes

Frontend records code lives mainly in:
- `Our_Chruch_Website/src/app/records`
- `Our_Chruch_Website/src/components/records`
- `Our_Chruch_Website/src/store/api/recordsApi.ts`
- `Our_Chruch_Website/src/types/records.ts`

Important UI behavior:
- Family code is displayed but not entered by users
- Subscription is created through a Yes/No radio on person creation
- Toasts are used instead of browser alerts
- A global API loader is shown during requests

## Backend Notes

Backend records code lives mainly in:
- `backend/src/main/java/org/church/backend/controller/RecordController.java`
- `backend/src/main/java/org/church/backend/service/RecordsService.java`
- `backend/src/main/java/org/church/backend/common/RepositoryService`
- `backend/src/main/java/org/church/backend/common/entity`
- `backend/src/main/resources/db/migration/V1__init_schema.sql`

Important backend behavior:
- Audit fields are managed centrally in the repository service
- Errors are handled through the global exception handler
- Aadhaar uniqueness is validated in both service logic and database index

## Deferred Items

Open follow-up items:
- Editing or reassigning memberships after person creation
- Whether the `memberships` table should later hold more fields than `id` and `name`
- Whether the SQL search function should be updated or removed if not used directly
