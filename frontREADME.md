# Draftly — Frontend

React + Vite + TypeScript single page application for the Draftly collaborative document
workspace.

## Stack

| Concern    | Choice                                   |
| ---------- | ---------------------------------------- |
| Build      | Vite 7                                   |
| UI         | React 19 + TypeScript                    |
| Routing    | React Router 7                           |
| Editor     | TipTap 3 (StarterKit + Placeholder)      |
| HTTP       | Axios (`src/services/api.ts` + services) |
| Styling    | Plain CSS (design tokens + component CSS) |

## Getting started

```bash
npm install
cp .env.example .env      # optional, only needed for a remote API
npm run dev               # http://localhost:5173
```

The dev server proxies `/api/*` to `http://127.0.0.1:8000` (see `vite.config.ts`), so the
browser only ever talks to one origin and CORS never comes up locally.

For a deployed backend set `VITE_API_BASE_URL=https://your-api.example.com/api` before
building — that is the only setting the frontend needs. The WebSocket URL is derived
from it (`https://your-api.example.com/api` → `wss://your-api.example.com/ws`).

## Scripts

| Script              | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server            |
| `npm run build`     | Type-check (`tsc --noEmit`) + build  |
| `npm run preview`   | Serve the production build locally   |
| `npm run typecheck` | Type-check only                      |

## Project layout

```
src/
├── components/
│   ├── layout/      → AppShell, Header, Sidebar, UserMenu, ProtectedRoute
│   ├── documents/   → cards, list, menus, modals, page head, empty/loading states
│   ├── editor/      → DocumentEditor, EditorHeader, EditorToolbar, SaveIndicator
│   ├── sharing/     → ShareModal, PermissionSelector, CollaboratorList
│   └── ui/          → Modal, ConfirmDialog, RenameDialog, Avatar, Brand, Icon, toasts
├── context/         → AuthContext (session) and ToastContext (notifications)
├── hooks/           → useAuth, useAutosave, useDocuments, useDebouncedValue,
│                      useDocumentRealtime
├── pages/           → Landing, Login, Register, Dashboard, list pages, EditorPage, 404
├── services/        → api.ts (all endpoints) + auth/document/sharing services
│                      + realtime.ts (the WebSocket client)
├── styles/          → global tokens + one stylesheet per area
├── types/           → TypeScript types mirroring the API payloads
└── utils/           → formatting and TipTap helpers
```

## Routes

| Route                     | Access | Page |
| ------------------------- | ------ | ---- |
| `/`                       | public | Landing page |
| `/login`, `/register`     | public | Authentication |
| `/app`                    | private | Dashboard |
| `/app/my-documents`       | private | Documents you own |
| `/app/shared-with-me`     | private | Documents shared with you |
| `/app/recent`, `/app/trash` | private | Recent documents, trash |
| `/documents/:id`          | private | Editor |

## Design system

Plain CSS with custom properties, one stylesheet per area:

| Stylesheet      | Contents                                        |
| --------------- | ----------------------------------------------- |
| `global.css`    | tokens (colour, radii, type, motion), buttons, forms |
| `layout.css`    | sidebar rail, top bar, workspace                |
| `dashboard.css` | page header, stats, document rows               |
| `editor.css`    | editor bar, toolbar, paper canvas, TipTap styles |
| `components.css`| modals, menus, toasts, empty states, share dialog |
| `auth.css`      | sign in / register                               |
| `landing.css`   | the public landing page                         |

The direction is "ink & paper": a warm neutral canvas, white surfaces, hairline
borders, a single deep-green accent and a serif document canvas. No gradients,
no bubble cards, no shadows except on things that genuinely float.

## API contract

All requests go through `src/services/api.ts`:

```
POST   /api/auth/register/               { email, password, full_name } -> { token, user }
POST   /api/auth/login/                  { email, password }             -> { token, user }
POST   /api/auth/logout/                                                    -> 204
GET    /api/auth/me/                                                        -> user
GET    /api/users/?search=                                                  -> [user]

GET    /api/documents/?scope=&search=      -> [document]
POST   /api/documents/                    { title, content }              -> document
GET    /api/documents/<id>/                                                 -> document
PATCH  /api/documents/<id>/               { title, content }              -> document
DELETE /api/documents/<id/>                                                 -> 204 (trash)
POST   /api/documents/<id>/restore/                                         -> document
DELETE /api/documents/<id>/purge/                                           -> 204 (permanent)
POST   /api/documents/import/            multipart: file                   -> document

GET    /api/documents/<id>/permissions/                                     -> [permission]
POST   /api/documents/<id>/share/         { email, role }                  -> permission
PATCH  /api/documents/<id>/permissions/<pid>/ { role }                     -> permission
DELETE /api/documents/<id>/share/<user_id>/                                 -> 204
GET    /api/documents/<id>/version/                                        -> { version }
```

The token is stored in `localStorage` and attached to every request as
`Authorization: Token <token>` by the axios interceptor in `api.ts`.

## Live updates

`services/realtime.ts` opens the WebSocket to `ws://…/ws/documents/<id>/?token=…` and
`hooks/useDocumentRealtime.ts` turns it into React state (connection status, the people
who have the document open, incoming changes).

The socket **never writes** — every change still goes through the REST API, so the
permission checks stay in one place. The socket only tells the editor that somebody
else changed the document:

* no local edits pending → the new content is applied immediately,
* local edits pending → a conflict banner asks whether to load their version or keep
  yours.

If the socket cannot be established, the editor falls back to polling
`GET /api/documents/<id>/version/` every 10 seconds and behaves the same way.

URL is derived from `VITE_API_BASE_URL` — there is no separate setting for it.
## Autosave

`src/hooks/useAutosave.ts` implements the debounced autosave:

* 800 ms after the last change a request is sent,
* only **one request is in flight at a time** (serialized queue),
* changes that happen during a request are sent right after it,
* a failed request keeps the value and shows a **Retry** button.

## Demo accounts

| Account             | Password    | Role              |
| ------------------- | ----------- | ----------------- |
| alice@draftly.demo  | draftly123  | Owner             |
| bob@draftly.demo    | draftly123  | Collaborator      |
