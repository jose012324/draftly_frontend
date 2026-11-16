# Draftly Development Progress

Legend: **[x]** implemented and verified by reading/executing the code ·
**[~]** implemented but **not executed** (blocked: installation/build commands were excluded
from the task) · **[ ]** not done.

---

## Phase 1: Foundation

- [x] Project initialized — `draftly_frontend` (Vite + React 19 + TS) and `draftly_backend`
      (Django 6.1 + DRF) written from scratch
- [~] Dependencies installed — `package.json` and `requirements.txt` are complete and
      pinned, but `npm install` / `pip install` were **not executed** (explicitly excluded)
- [x] Database configured — `Document` + `DocumentPermission` models, hand-written
      migrations `0001_initial` and `0002_document_version`, SQLite locally /
      PostgreSQL via `DATABASE_URL`
- [x] API communication configured — single axios client (`src/services/api.ts`), Vite dev
      proxy for `/api` and `/ws`, CORS middleware on the backend (including
      `Access-Control-Expose-Headers` so the file name of a download survives)
- [~] Migrations applied — `python manage.py migrate` was **not executed**
- [x] ASGI server — `daphne` is in `INSTALLED_APPS`, so `manage.py runserver` serves the
      ASGI application (live updates + auto-reload); production runs
      `daphne … --proxy-headers`
- [x] Configuration — a `.env` file is read with `python-dotenv`; `DATABASE_URL` switches
      the project to PostgreSQL, empty keeps the local SQLite database

## Phase 2: Authentication

- [x] Landing page — public product page (hero, product mock, features, permission
      matrix, formats, CTA band)
- [x] Login — e-mail + password, token authentication, `POST /api/auth/login/`
- [x] Registration — `POST /api/auth/register/`, `/register` page, link on the login screen
- [x] Logout — `POST /api/auth/logout/` (the token is deleted server side)
- [x] Session restore — the token is validated with `GET /api/auth/me/` on boot
- [x] Feedback — a toast for every authentication step: sign in, registration, sign out
      and an expired session
- [x] Protected routes — `ProtectedRoute` redirects anonymous visitors to `/login`
- [x] Demo accounts — `python manage.py seed_demo_users` creates Alice, Bob and three
      sample documents

## Phase 3: Documents

- [x] Create — modal with a title, `POST /api/documents/`
- [x] Rename — `PATCH /api/documents/<id>/`, context menu → Rename
- [x] Edit — TipTap editor, autosave (see phase 4)
- [x] Delete — soft delete into the trash, restore, permanent delete
- [x] Retrieve — list views: Home, My Documents, Shared with Me, Recent, Trash
- [x] Search — global search in the top bar, debounced, mirrored into the URL
- [x] Context menu — open / download / rename / share / move to trash, **role aware**:
      everybody can download, only the owner can rename, share or delete
- [x] Download — export as Markdown, HTML page, plain text or TipTap JSON
      (`documents/exports.py`)
- [x] Menus — rendered in a portal with fixed positioning, so no container can clip
      them (`hooks/useAnchoredMenu.ts`)
- [x] Design system — "ink & paper": hairline borders, one accent, serif document
      canvas, inline SVG icon set (no emoji)

## Phase 4: Rich-text Editor

- [x] Bold
- [x] Italic
- [x] Underline
- [x] Strikethrough (bonus)
- [x] Headings — H1, H2, H3
- [x] Paragraph
- [x] Bullet list
- [x] Numbered list
- [x] Blockquote, code block, links (bonus)
- [x] Undo / redo
- [x] Autosave — 800 ms debounce, serialized save queue, stale-response protection,
      `Saved / Saving… / Unsaved changes / Save failed` + **Retry** button, `Ctrl+S`
- [x] Formatting survives reopening — TipTap JSON is stored in a `JSONField`
- [x] Read-only mode for viewers

## Phase 5: Import

- [x] TXT — plain text becomes paragraphs
- [x] MD — headings, lists, quotes, code fences, `**bold**`, `*italic*`, `` `code` ``,
      links
- [x] DOCX — headings, quotes, lists and tables (via `python-docx`)
- [x] Validation — extension whitelist, 5 MB limit, server side extraction
- [x] Result — the import opens in the editor as a normal, editable document
- [x] Export — the same document can be downloaded again as `.docx` (the stored file),
      `original` (the upload of an imported document), `.txt`, `.md`, `.html` or `.json`
- [x] File storage — every document is written to `media/documents/…` as a real `.docx`
      on create **and** on every save (`documents/docx_export.py`); imports keep their
      original upload in `media/imports/…`

## Phase 6: Sharing

- [x] Viewer — can read, cannot write (enforced by the API)
- [x] Editor — can read and write, cannot share or delete
- [x] Owner — full control, only one who can share/revoke/delete
- [x] Revoke access — `DELETE /api/documents/<id>/share/<user_id>/`; the next request of
      the revoked user gets `404`
- [x] Backend authorization — `documents/permissions.py` + `documents/services.py`,
      every endpoint checks the role
- [x] User lookup — `GET /api/users/?search=` with suggestions in the share dialog

## Phase 6b: Live updates

- [x] WebSocket endpoint — `ws://…/ws/documents/<id>/?token=…`, written as a plain
      ASGI function (`documents/consumers.py`), token + role checked on connect
- [x] Broadcast after a save — the channel layer fans the new state out to everybody
      who has the document open (`documents/realtime.py`)
- [x] Presence — who else is in the document, shown as coloured avatars in the editor
      header ("Bob is here", a green *Live* dot)
- [x] Live typing — every change is streamed to the other editors (throttled to 80 ms)
      and applied without a reload; the local caret is preserved
- [x] Live selections — the selection of every other editor is shown as a coloured
      highlight in the editor (one colour per user, the first user is orange)
- [x] Version tracking — `Document.version` is bumped on every save, `GET
      /api/documents/<id>/version/` returns it
- [x] Conflict handling — a remote change during local edits raises a banner:
      *load theirs* or *keep mine* (no silent overwrite)
- [x] Fallback — when the socket is down the editor polls the version endpoint
      every 10 seconds and behaves the same way
- [x] Reconnect — the client retries with a growing delay (1 s → 15 s) and gives up
      after 6 attempts, then falls back to polling
- [~] WebSocket tests — four tests exist (`documents/test_realtime.py`) and were
      **verified offline** against the real ASGI application (handshake, refusal of a bad
      token, refusal without access, presence list, collab relay) — but the Django test
      runner itself was **not executed** (no dependency install)

## Phase 7: Quality

- [x] Automated tests — 46 tests (11 in `accounts/tests.py`, 31 in
      `documents/tests.py`, 4 WebSocket tests in `documents/test_realtime.py`) covering
      the permission matrix, persistence, trash, sharing, revocation, import,
      registration, versioning, the download/export and the live updates
- [~] Production build — `npm run build` was **not executed** (no `npm install`)
- [~] Manual QA — the UI was not clicked through by me (no running server); the pure
      Python importer/exporter was executed and verified, and the Markdown round trip
      (md → TipTap → md) was checked byte by byte
- [~] Deployment — configuration is in place (`DATABASE_URL`, `DJANGO_SECRET_KEY`,
      `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `VITE_API_BASE_URL`)
      but **no deployment was performed** and no live URL can be claimed
- [x] Backend `python manage.py check` — stops only at the missing `rest_framework`
      package (the only blocker, and the only thing that has to be installed)

## Phase 8: Submission

- [x] README
- [x] ARCHITECTURE
- [x] AI_WORKFLOW
- [x] SUBMISSION
- [x] PLAN (review of `plan.txt` + the executed plan)
- [x] PROGRESS (this file)
- [x] WALKTHROUGH — the recording script (`WALKTHROUGH.md`)
- [ ] Walkthrough video — has to be recorded by a human against a running deployment
- [ ] Screenshots — capture checklist in `docs/screenshots/README.md`
- [ ] Live deployment URLs — add them to `SUBMISSION.md` after deploying

---

## Verification status (honest summary)

| Command | Status | Result |
| ------- | ------ | ------ |
| `python -m compileall draftly_backend` | executed | clean — every backend file compiles |
| live layer smoke test | executed | the real ASGI application was driven with a mock WebSocket client: handshake ✓, bad token refused ✓, no access refused ✓, presence list ✓, collab relay ✓ |
| importer/extractor unit run | executed | Markdown/plain text → TipTap → text, word count and snippet verified |
| exporter unit run | executed | TipTap → Markdown / HTML verified, `md → TipTap → md` round trip is stable |
| bracket balance of all TS/TSX files | executed | clean |
| class cross-check (TSX → CSS) | executed | every class used in a component exists in a stylesheet |
| `python manage.py check` | executed | blocked at `ModuleNotFoundError: rest_framework` (dependency not installed) |
| `python manage.py test` | not executed | needs `pip install -r requirements.txt` |
| `npm install` / `npm run build` | not executed | installation commands were excluded from the task |
| Browser QA | not executed | needs both servers running |

**The only two commands between this repository and a running application are:**

```bash
cd draftly_backend && pip install -r requirements.txt && python manage.py migrate && python manage.py seed_demo_users && python manage.py runserver
cd draftly_frontend && npm install && npm run dev
```
