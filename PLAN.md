# Draftly — implementation plan

This document reviews `plan.txt`, analyses every phase, and records the plan that
was actually followed while building Draftly.

---

## 1. Review of `plan.txt`

### What is already strong

| Area | Verdict |
| ---- | ------- |
| Product framing (workspace + editor, not a Google Docs clone) | Clear and realistic |
| Scope control (real-time, comments, version history deferred) | Excellent — protects the timebox |
| "Permissions must be enforced on the backend" | The single most important engineering point in the brief |
| Stack (React + Vite / DRF / SQLite / TipTap) | Sensible, low infrastructure, easy to review |
| Seeded reviewer accounts | Makes the sharing flow testable in seconds |

### Gaps and risks found in the plan

| # | Gap | Impact | Decision |
| - | ---- | ------ | -------- |
| 1 | The sidebar lists **Trash** but the data model has no soft-delete fields | Trash could not be implemented without deviating from the model | Added `is_deleted` + `deleted_at` to `Document` (two fields, still simple) |
| 2 | No authentication mechanism is specified, only "Django authentication" | A session cookie + SPA on another origin is awkward | DRF **token** authentication (`rest_framework.authtoken`) — one header, stateless, easy to demo |
| 3 | No CORS story for a separate frontend origin | The frontend could not call the API in development | A ~40 line CORS middleware inside the project (`draftly_backend/cors.py`) — no extra dependency, no extra install step |
| 4 | Document content is JSON, but no conversion strategy is given for imports | Importing a `.docx` would either lose formatting or need a heavy library | A small `documents/tiptap.py` module builds the TipTap tree for text, Markdown and DOCX (headings, lists, quotes, code, inline bold/italic) |
| 5 | "Search or enter seeded user email" is ambiguous | Needed a concrete endpoint | `GET /api/users/?search=` plus a suggestion dropdown in the share dialog |
| 6 | The plan says `services/api.js` | A `.js` file cannot be typed | `src/services/api.ts` (TypeScript across the whole frontend) with one typed function per endpoint |
| 7 | Deployment is mentioned but the host/persistence story is thin | SQLite on a free host loses data | Deployment is documented as a checklist, not code; the backend stays host-agnostic |
| 8 | No statement about *how* to share a document as a link | Would have pulled in public links / tokens | Out of scope — sharing is user-to-user with roles, exactly as the brief describes |

### Design decisions that differ from a naive reading of the plan

1. **Function-based views everywhere** (`@api_view` + plain `def`), as requested.
   No generic views, no extra classes, no serializer-per-view duplication.
2. **Permissions live in one module** (`documents/permissions.py`) so the rules
   can be read (and tested) in one screen instead of being scattered over views.
3. **The frontend never talks to axios directly.** Every call goes through
   `src/services/api.ts`, which owns the base URL, the token header, the 401
   handling and the error messages.
4. **Autosave is debounced (1.2 s) and status-driven** — `Saved / Saving… /
   Unsaved changes / Save failed` — because "autosave" without a visible status
   is indistinguishable from "broken".
5. **Import is a conversion, not an attachment** (as the plan requires): the file
   is parsed on the server into a TipTap document that is editable from the
   first keystroke.

---

## 2. Phase analysis and what was built

| Phase | Plan | Analysis | Result |
| ----- | ---- | -------- | ------ |
| 1 — Foundation | Init React + Django, API communication, models, seeded users | Solid, but "initialise React" was replaced by writing the whole frontend from scratch | `draftly_frontend` (Vite + React 19 + TS), `draftly_backend` (Django + DRF), models, migrations, `seed_demo_users` |
| 2 — Auth & dashboard | Login, logout, dashboard, CRUD, "My Documents" / "Shared with Me" | Dashboard needs to look like a real product, not a list | Token login, split-screen login page with demo accounts, hero + stats + document grid, trash, rename, delete, search |
| 3 — Rich-text editor | TipTap, toolbar, editable title, save, reopen, autosave | The heart of the product — most time here | TipTap 3 with StarterKit + Placeholder, grouped toolbar, live active states, editable title, debounced autosave, save status, read-only mode for viewers, word count |
| 4 — File importing | TXT / MD / DOCX, validation, extraction, editable document | The extractor is the risky part, not the upload form | Drag & drop modal, extension + size validation (5 MB), server side conversion into TipTap JSON (headings, lists, quotes, code, inline marks), imported file name kept |
| 5 — Sharing | Search users, viewer/editor, list, enforce on the API, revoke | Must be enforced server side or it is worthless | `DocumentPermission` model, share dialog with user suggestions, role changes, revoke, backend checks on every endpoint |
| 6 — Testing & deployment | CRUD tests, permission tests, import tests, deployment | Permission tests are the ones that prove the engineering | 20 API tests (owner/editor/viewer/outsider/anonymous, persistence, trash, sharing, import), deployment notes for Vercel + Render |
| 7 — Submission | README, architecture note, AI workflow note, walkthrough | Documentation is part of the grade | `README.md`, `ARCHITECTURE.md`, `AI_WORKFLOW.md`, `SUBMISSION.md`, `PLAN.md` |

### Explicitly not built (as instructed by the plan)

Real-time collaboration, comments, version history, offline editing, PDF export,
public share links. Each one is listed in `SUBMISSION.md` with the reason.

---

## 3. Order of work

1. Review `plan.txt` and the existing code → this document.
2. **Frontend first, from scratch** — design system, layout, pages, components,
   and `src/services/api.ts` as the single contract with the backend.
3. **Backend second** — models, permissions, serializers, function based views,
   importer, tests, seed command.
4. Documentation and hand-over.

The API contract was written once in `api.ts` and then implemented exactly as
specified on the Django side, so the two halves can never drift apart silently.

---

## 4. Status

| Area | Status |
| ---- | ------ |
| Frontend (config, design system, 8 pages, 20 components, api.ts) | done |
| Backend (settings, models, permissions, views, importer, tests, seed command) | done |
| Documentation (README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION, PLAN) | done |
| `npm install` + `npm run dev` | **not executed** (installation commands were excluded on purpose) |
| `pip install -r requirements.txt` + `migrate` + `seed_demo_users` | **not executed** (installation commands were excluded on purpose) |

The two commands above are the only steps left before the application runs.
