# Draftly — Collaborative Workspace

A lightweight, Google-Docs-inspired document workspace: write rich-text documents,
organise them in a dashboard, import existing files and share them with other people using
real viewer / editor permissions.

```
assessment/
├── draftly_frontend/     # React + Vite + TypeScript + TipTap
├── draftly_backend/      # Django + Django REST Framework
├── docs/screenshots/     # capture checklist for the screenshots
├── PLAN.md               # review of plan.txt + the plan that was executed
├── PROGRESS.md           # phase by phase status (what is verified, what is not)
├── ARCHITECTURE.md       # how the two halves fit together
├── AI_WORKFLOW.md        # how this project was built with AI assistance
├── WALKTHROUGH.md        # the script for the 3–5 minute demo video
├── SUBMISSION.md         # deliverables, demo script, known limitations
└── README.md
```

---

## Features

| Area | Details |
| ---- | ------- |
| Landing page | Public marketing page with a product mock, feature strip, permission matrix and calls to action |
| Authentication | E-mail + password login, **registration**, token based, session restored on reload |
| Dashboard | Editorial page header, hairline statistics, document list (dense rows, not bubble cards), global search, context menu per row |
| Documents | Create (with title), rename, soft delete (trash), restore, permanent delete, live search |
| Editor | TipTap rich text: headings, bold/italic/underline/strike, bullet & numbered lists, quotes, code blocks, links, undo/redo, word count, serif page |
| Autosave | 800 ms debounce, **serialized save queue**, stale-response protection, `Saved / Saving… / Unsaved changes / Save failed` + **Retry** |
| Live updates | WebSocket (Django Channels): changes of other editors appear as you type, a presence row shows who is in the document, and the selection of every other editor is highlighted in their own colour |
| Conflict safety | If two people edit at the same time, nothing is overwritten silently — the second one gets a banner: *Load theirs / Keep mine* |
| Sharing | Share by e-mail with a Viewer or Editor role, change roles, revoke access, permission enforced by the API |
| Import | `.txt`, `.md` and `.docx` are converted into fully editable documents — **and the uploaded file is kept** next to the document |
| Download | Every document is stored **twice**: as TipTap JSON in the database and as a real `.docx` file on disk. The download serves that file (plus `original` for an imported upload, and md / html / txt / json on demand) |
| Permissions in the UI | The context menu only shows what your role allows: everyone can download, only the owner can rename, share or delete |
| Extras | Read-only mode for viewers, responsive layout, toasts, empty states, keyboard shortcut `Ctrl+S` |

---

## Screens

| Screen | Route | What it shows |
| ------ | ----- | ------------- |
| Landing | `/` | Public product page: hero, product mock, features, permission matrix, formats, CTA |
| Authentication | `/login`, `/register` | Centred card, demo accounts, registration |
| Dashboard | `/app` | Statistics, recent documents, global search |
| Lists | `/app/my-documents`, `/app/shared-with-me`, `/app/recent`, `/app/trash` | Dense document rows with owner, role and modified date |
| Editor | `/documents/:id` | Paper canvas, formatting toolbar, save status, sharing |
| Sharing | modal | Invite by e-mail, permission selector, collaborator list |

---

## Running the project

### 1. Backend

```bash
cd draftly_backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

The API runs on <http://127.0.0.1:8000/api/>. `daphne` is in `INSTALLED_APPS`, so
`runserver` starts the **ASGI** application — the live updates work and the server
reloads itself when a `.py` file changes:

```bash
python manage.py runserver
```

For production (behind a proxy that terminates TLS):

```bash
daphne -b 0.0.0.0 -p ${PORT:-8000} --proxy-headers --ping-interval 30 \
       draftly_backend.asgi:application
```

The configuration is read from a `.env` file (`python-dotenv`) — copy
`draftly_backend/.env.example` to `draftly_backend/.env`. `DATABASE_URL` switches the
project to PostgreSQL; empty means the local SQLite database.

> Restart the backend after every backend change — a stale process keeps the old
> routes, which shows up as a `404` for an endpoint that exists in the code.

### 2. Frontend

```bash
cd draftly_frontend
npm install
npm run dev
```

The app runs on <http://localhost:5173>. During development Vite proxies `/api/*` **and**
`/ws/*` to the Django server, so no CORS configuration is needed locally. For a deployed
backend set `VITE_API_BASE_URL` (see `draftly_frontend/.env.example`).

### 3. Accounts

| Account            | Password   | Role        |
| ------------------ | ---------- | ----------- |
| alice@draftly.demo | draftly123 | Owner       |
| bob@draftly.demo   | draftly123 | Collaborator |

New accounts can also be created on the **Create account** screen (`/register`).

---

## Tests

```bash
cd draftly_backend
python manage.py test
```

46 tests cover the permission matrix (owner / editor / viewer / unrelated user /
anonymous), content persistence, the trash, sharing, revocation, the file import, the
registration, the document version, the download/export and the WebSocket.

---

## API overview

```
POST   /api/auth/register/               { email, password, full_name } -> { token, user }
POST   /api/auth/login/                  { email, password }            -> { token, user }
POST   /api/auth/logout/                                                     -> 204
GET    /api/auth/me/                                                         -> user
GET    /api/users/?search=                                                   -> [user]

GET    /api/documents/?scope=all|mine|shared|recent|trash                    -> [document]
POST   /api/documents/                   { title, content }               -> document
GET    /api/documents/<id>/                                                  -> document
PATCH  /api/documents/<id>/               { title, content }               -> document
DELETE /api/documents/<id>/                                                  -> 204 (trash)
POST   /api/documents/<id>/restore/                                          -> document
DELETE /api/documents/<id>/purge/                                            -> 204 (permanent)
POST   /api/documents/import/             multipart: file                  -> document

GET    /api/documents/<id>/permissions/                                      -> [permission]
POST   /api/documents/<id>/share/         { email, role }                   -> permission
PATCH  /api/documents/<id>/permissions/<pid>/ { role }                      -> permission
DELETE /api/documents/<id>/share/<user_id>/                                  -> 204
GET    /api/documents/<id>/version/                                         -> { version }
GET    /api/documents/<id>/download/?format=docx|original|md|html|txt|json -> file
```

Every endpoint except login and register requires `Authorization: Token <token>`.

**Live updates** (WebSocket, opened with the same token):

```
ws://<host>/ws/documents/<id>/?token=<api-token>
```

The REST API stays the only write path. The socket carries three kinds of messages:

| Message | Direction | Purpose |
| ------- | --------- | ------- |
| `collab` / `content` | client → server → others | the live stream of what somebody is typing (relayed, never stored) |
| `collab` / `selection` | client → server → others | where somebody has selected something — drawn as a coloured highlight |
| `update` | server → others | a document was saved (with its new version) |
| `presence` | server → others | who currently has the document open |

---

## Configuration

The frontend needs **one** setting — the URL of the API. The WebSocket URL is derived
from it (`https://api.example.com/api` → `wss://api.example.com/ws`).

| Variable | Used by | Purpose |
| -------- | ------- | ------- |
| `VITE_API_BASE_URL` | frontend | public URL of the API (empty in development) |
| `DJANGO_SECRET_KEY` | backend | secret key (change in production) |
| `DJANGO_DEBUG` | backend | `0` in production |
| `DJANGO_ALLOWED_HOSTS` | backend | comma separated host names |
| `CORS_ALLOWED_ORIGINS` | backend | comma separated frontend origins |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | backend | only for session auth across domains |
| `DATABASE_URL` | backend | PostgreSQL URL (empty → local SQLite) |
| `REDIS_URL` | backend | Redis for the channel layer (empty → in-memory, single process) |

The per-app files are `draftly_backend/.env.example` and `draftly_frontend/.env.example`;
the root `.env.example` is a map of the whole project.

---

## Technology

**Frontend** — React 19, Vite 7, TypeScript, React Router 7, TipTap 3, Axios, plain CSS.
**Backend** — Django 6.1, Django REST Framework, Django Channels (WebSockets), token authentication, SQLite (local) / PostgreSQL (production), python-docx.

See `ARCHITECTURE.md` for the reasoning behind the structure and `PROGRESS.md` for the
honest status of every phase.
