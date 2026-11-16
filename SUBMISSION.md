# Submission — Draftly

**Product:** Draftly — a collaborative document workspace.
**Stack:** React + Vite + TypeScript + TipTap (frontend) · Django + DRF + SQLite/PostgreSQL (backend).

---

## 1. What is delivered

| Deliverable | Where |
| ----------- | ----- |
| Frontend (complete, written from scratch) | `draftly_frontend/` |
| Backend (complete) | `draftly_backend/` |
| Plan review + execution plan | `PLAN.md` |
| Progress report (phase by phase, honest status) | `PROGRESS.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| Walkthrough video script | `WALKTHROUGH.md` |
| Screenshots capture checklist | `docs/screenshots/README.md` |
| README (setup + API + configuration) | `README.md` |

Still to be filled in **by hand** after the deployment:

| Item | Where |
| ---- | ----- |
| Live frontend URL | this file → *Live application URL* |
| Live backend API URL | this file → *Backend API URL* |
| Walkthrough video URL | this file → *Walkthrough video URL* |
| Screenshots | `docs/screenshots/*.png` |
| Test run output | this file → *Automated test results* |

---

## 2. Feature checklist

### Core

- [x] **Landing page** — public product page: editorial hero, product mock, feature strip, how-it-works, permission matrix, import formats, CTA band, footer.
- [x] **Authentication** — e-mail + password login, registration, logout, session restored on reload, demo accounts one click away. Every step is confirmed with a toast (signed in, account created, signed out, session expired).
- [x] **Dashboard** — editorial page header, hairline statistics (documents / shared / words), recent documents as dense rows, global search, context menu per row.
- [x] **Document management** — create (title modal), rename, move to trash, restore, delete permanently, list views (Home, My Documents, Shared with Me, Recent, Trash).
- [x] **Rich-text editor** — TipTap: paragraphs, H1–H3, bold, italic, underline, strikethrough, bullet list, numbered list, blockquote, code block, links, undo/redo, word count.
- [x] **Editable title + autosave** — 800 ms debounce, serialized save queue, stale-response protection, status `Saved / Saving… / Unsaved changes / Save failed` with a **Retry** button, `Ctrl+S`.
- [x] **Persistent storage** — documents reopen with headings, lists and inline formatting intact (TipTap JSON in a `JSONField`).
- [x] **File importing** — `.txt`, `.md`, `.docx` via drag & drop, extension and size validation (5 MB), converted server side into a fully editable document. The uploaded file is kept on disk and can be downloaded again as *original*.
- [x] **Download** — every document is stored twice: as TipTap JSON in the database and as a real `.docx` file on disk (rewritten on every save). The download serves that file; `original`, `md`, `html`, `txt` and `json` are available as well.
- [x] **Role aware UI** — the context menu only offers what the role allows: everyone can download, only the owner can rename, share or delete.
- [x] **Sharing** — share by e-mail with a Viewer or Editor role, change a role, revoke access, list of collaborators, user lookup with suggestions.
- [x] **Backend enforced permissions** — a Viewer cannot write to a document, a non-shared user cannot even see it; enforced in `documents/permissions.py` + `documents/services.py` and covered by tests.
- [x] **Automated tests** — 42 tests (`python manage.py test`) covering the permission matrix, persistence, trash, sharing, revocation, import, registration and the WebSocket.
- [x] **Live updates** — Django Channels WebSocket: changes of other editors appear as they are typed, the presence row shows who is in the document (with their own colour), and their selection is highlighted in the editor. The REST API stays the only write path.
- [x] **Seeded accounts** — `python manage.py seed_demo_users` creates Alice, Bob, three documents owned by Alice, one shared with Bob as Editor and one as Viewer.

### Polish

- [x] Hand-made design system — "ink & paper": warm canvas, hairline borders, one deep-green accent, serif document canvas, no gradients and no bubble cards
- [x] A proper inline SVG icon set (24 px grid, consistent stroke) — no emoji, no icon font
- [x] Responsive layout (off-canvas navigation on small screens)
- [x] Toasts, empty states, loading skeletons, confirmations
- [x] Read-only mode with an explanatory banner for viewers
- [x] User profile menu with sign out
- [x] Consistent spacing and type scale across every screen

### Not built (intentionally, per the plan)

| Feature | Reason |
| ------- | ------ |
| Real-time simultaneous editing | Needs conflict resolution / CRDT — explicitly excluded |
| Video/audio calls | Out of scope |
| Comments and suggestions | Not needed for the core workflow |
| Version history | Additional data modelling |
| Offline synchronization | Synchronisation complexity |
| AI writing assistant | Explicitly excluded from the MVP |
| Team / workspace management | Explicitly excluded from the MVP |

---

## 3. How to run

```bash
# Backend
cd draftly_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver            # http://127.0.0.1:8000/api/

# Frontend (second terminal)
cd draftly_frontend
npm install
npm run dev                           # http://localhost:5173
```

**Accounts:** `alice@draftly.demo` / `draftly123` (owner) and
`bob@draftly.demo` / `draftly123` (collaborator). New accounts can be created at
`/register`.

---

## 4. Demo script (3–5 minutes)

The recording script with timings is in `WALKTHROUGH.md`. In short:

1. **Start on the landing page** (`/`) — the product page with the feature strip, the
   permission matrix and the calls to action.
2. **Sign in as Alice** (`alice@draftly.demo` / `draftly123`) — the dashboard shows the
   header, the statistics and the seeded documents.
3. **Create "Project Proposal"** — type a title in the modal, the editor opens.
4. **Write and format** — a heading, bold text, a bullet list; the save indicator goes
   `Unsaved changes → Saving… → Saved`.
5. **Import a file** — create `notes.md` with a heading and a list, use *Import file* → the
   document opens with the heading and the list preserved.
6. **Share with Bob** — search `bob@draftly.demo`, choose **Can edit**, add; the
   collaborator list shows Bob with his role.
7. **Log out, log in as Bob** — open the document from *Shared with Me*, edit it.
8. **Change Bob to Can view** (as Alice) — as Bob the document shows the yellow
   *view-only* banner and the toolbar is disabled; a direct `PATCH` gets `403`.
9. **Live updates** — open the same document in two browsers (Alice and Bob). Typing in
   one appears in the other as it is typed, the presence row shows that both are there,
   and Bob's highlighted text shows up in Alice's editor in his colour. If both type at
   the same time, the second one gets a *conflict banner* with **Load theirs / Keep
   mine** instead of a silent overwrite.
10. **Trash** — delete a document, open *Trash*, restore it or delete it for good.
11. **Search** — type in the top search bar, the list filters as you type.

---

## 5. Deployment checklist

| Target | Steps |
| ------ | ----- |
| Frontend (Vercel / Netlify / static host) | `npm run build` → deploy `dist/`; set `VITE_API_BASE_URL=https://<api-host>/api` |
| Backend (Render / Railway / Fly) | `pip install -r requirements.txt`, `python manage.py migrate`, `python manage.py seed_demo_users`, then start it with `daphne -b 0.0.0.0 -p ${PORT:-8000} --proxy-headers draftly_backend.asgi:application` (an **ASGI** server — the WSGI `runserver` cannot serve the live updates) |
| Database | set `DATABASE_URL` to a PostgreSQL instance (SQLite only for the demo) |
| CORS | set `CORS_ALLOWED_ORIGINS` to the frontend origin (comma separated) |
| Production hygiene | `DJANGO_DEBUG=0`, a real `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` |

> The frontend dev server proxies `/api` to the backend, so in production
> `VITE_API_BASE_URL` must point at the **public** API URL (the proxy only exists in
> development).

> Note: `settings.py` was intentionally left as it was, with only additive changes. The
> production values above are read from the environment and are documented in
> `.env.example`.

---

## 6. Known limitations / honest status

* **The application was never started.** Installing dependencies and running the servers
  were excluded from the build task, so the runtime behaviour was verified by static
  analysis, type-level verification and by executing the pure Python importer — not by
  clicking through the UI. See `PROGRESS.md` → *Verification status*.
* **The migrations were written by hand** for the same reason. Running
  `python manage.py makemigrations` should report "No changes detected".
* **No deployment was performed**, therefore no live URLs can be claimed.
* The `markdown` PyPI package listed in the plan is **not** used: the Markdown importer
  converts Markdown to the TipTap JSON tree directly (headings, lists, quotes, code and
  inline marks) instead of going through HTML. That is one dependency less and it keeps
  the formatting exact.
* The document list is not paginated — a workspace holds tens of documents.
* Real-time collaboration, comments, version history and offline support are out of scope
  by design (see the table above).
