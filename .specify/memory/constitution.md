# Project Constitution

## Purpose

This project manages church operations across frontend and backend with the backend as the source of truth for business data and rules.

## Core Rules

1. Backend is the source of truth.
- Database schema, validation, generated identifiers, derived fields, and business rules must be enforced in backend code.
- Frontend should adapt to backend contracts, not invent parallel truth.

2. Keep feature structure simple and readable.
- Prefer one feature service per business area.
- Avoid creating duplicate services, repositories, or configs that solve the same problem.
- Shared infrastructure belongs in `backend/src/main/java/org/church/backend/common`.

3. Use the common repository layer for generic persistence behavior.
- Generic CRUD and audit handling should stay centralized.
- New entities should not require repository boilerplate unless they need special behavior.

4. Generated and derived fields are backend-owned.
- IDs, timestamps, generated codes, and derived relationship fields must not be manually entered by the UI.
- Frontend may display these fields, but should not own them.

5. UI models must reflect backend models closely.
- If backend changes a contract, frontend types and API mapping must be updated in the same change.
- Avoid duplicate model definitions with conflicting meaning.

6. OData endpoints should be reused where practical.
- Prefer expressive query/filter endpoints over creating many narrow endpoints.
- Create dedicated endpoints only when feature logic cannot be represented cleanly through standard querying.

7. Meaningful feature work must be spec-backed.
- Large feature changes should update or add a spec under `.specify/specs`.
- Specs must describe behavior, data model, ownership, and API expectations.

8. Feature file changes must keep feature documentation in sync.
- If any meaningful change is made to files for a feature, the related markdown spec for that feature must be updated in the same work.
- If a feature does not yet have a markdown spec, create one under `.specify/specs`.
- Code changes should not be considered complete until the matching feature markdown is created or updated.

## Records Principles

1. `familyCode` is backend-generated.
2. `familyHeadId` is backend-derived from the current head person.
3. Person creation may optionally create a linked membership entry.
4. Aadhaar uniqueness is enforced in backend and database.
5. Address fields follow this structure:
- `address1`
- `area`
- `address2`
- `pincode`
- `city`
- `state`

## Documentation Standard

Each feature spec should include:
- Scope
- Data model
- Backend responsibilities
- Frontend responsibilities
- API contract
- Deferred or open items
