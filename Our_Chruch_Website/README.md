# Our Church Website

## Folder Structure

```text
Our_Chruch_Website/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ accounts/
│  │  │  └─ page.tsx
│  │  ├─ admin/
│  │  │  ├─ page.tsx
│  │  │  └─ admin.css
│  │  ├─ celebrations/
│  │  │  ├─ page.tsx
│  │  │  └─ celebrations.css
│  │  ├─ filter/
│  │  │  └─ page.tsx
│  │  └─ records/
│  │     ├─ page.tsx
│  │     ├─ records.css
│  │     ├─ create/
│  │     │  └─ page.tsx
│  │     ├─ edit/
│  │     │  └─ page.tsx
│  │     └─ family-edit/
│  │        └─ page.tsx
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ celebrations/
│  │  ├─ common/
│  │  ├─ header/
│  │  └─ records/
│  ├─ data/
│  │  └─ mockData.ts
│  ├─ providers/
│  │  └─ ReduxProvider.tsx
│  ├─ services/
│  │  └─ api.ts
│  ├─ store/
│  │  ├─ hooks.ts
│  │  ├─ index.ts
│  │  └─ slices/
│  │     ├─ adminSlice.ts
│  │     └─ recordsSlice.ts
│  ├─ styles/
│  │  ├─ app-theme.css
│  │  └─ globals.css
│  ├─ types/
│  │  ├─ admin.ts
│  │  └─ records.ts
│  └─ utils/
│     └─ records.ts
├─ package.json
└─ README.md
```

## How Each Folder Is Used

### `src/app`

This folder contains all route pages.

- Each page folder represents one route.
- Page files handle routing, page state, and feature flow.
- Feature-level CSS stays inside the same page folder when it is page specific.

### `src/components`

This folder contains reusable UI pieces.

- `components/records` for record-related components
- `components/admin` for admin-related components
- `components/celebrations` for celebrations-related components
- `components/header` for navbar and header components
- `components/common` for shared buttons, icons, and reusable UI

### `src/store`

This folder contains Redux setup.

- `index.ts` creates the store
- `hooks.ts` contains typed Redux hooks
- `slices/` contains one slice per domain

### `src/types`

This folder contains shared TypeScript types and interfaces used across pages, components, and store slices.

### `src/data`

This folder contains mock data used by pages.

- When API integration is added, this is the layer that can be replaced first.

### `src/styles`

This folder contains shared global styling.

- `globals.css` loads base styles
- `app-theme.css` contains shared app styles like buttons, tables, navbar, icons, and page background

### `src/providers`

This folder contains app-level providers.

- `ReduxProvider.tsx` wraps the app with Redux

### `src/services`

This folder is for API service files.

- API call functions can be added here later

### `src/utils`

This folder contains helper functions and reusable utility logic.
