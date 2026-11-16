# Architecture

This note explains how Draftly is put together and *why* it is put together that way.

---

## 1. System overview

```
┌────────────────────────────────────┐        ┌──────────────────────────────────┐
│  draftly_frontend                  │        │  draftly_backend                 │
│                                    │        │                                  │
│  React 19 + Vite + TypeScript      │  HTTP  │  Django 6.1 + DRF               │
│  React Router 7                    │ ─────► │  TokenAuthentication             │
│  TipTap 3 editor                   │  JSON  │                                  │
│  Axios (services/api.ts)           │  +     │  accounts/  auth, register,      │
│                                    │  token │             user lookup, seed   │
│  Plain CSS design system           │        │  documents/ models, permissions, │
│                                    │        │              services, views,   │
│                                    │        │              importer, tests    │
└────────────────────────────────────┘        └──────────────────────────────────┘
                                                     │
                                                     ▼
                                       SQLite (local) / PostgreSQL (production)
```

The two applications are completely independent: the frontend only knows the JSON
contract, the backend only knows Django. The frontend could be replaced by a mobile
client without touching the backend.

---

## 2. Backend structure

```
draftly_backend/
├── draftly_backend/
│   ├── settings.py       # only additive changes: DRF, apps, middleware, env config
│   ├── urls.py           # /admin/ + /api/ (accounts + documents)
│   └── cors.py           # small CORS middleware (no extra dependency)
├── accounts/
│   ├── models.py         # re-export of Django's User model
│   ├── serializers.py    # UserSerializer, RegisterSerializer
│   ├── views.py          # register / login / logout / me / user search
│   ├── urls.py
│   ├── tests.py
│   └── management/commands/seed_demo_users.py
└── documents/
    ├── models.py         # Document, DocumentPermission
    ├── permissions.py    # get_role / can_view / can_edit / is_owner
    ├── services.py       # the business logic (create, update, share, delete …)
    ├── serializers.py    # list / detail / create / update / share
    ├── views.py          # thin function based views
    ├── consumers.py      # the WebSocket (a plain ASGI function)
    ├── realtime.py       # channel layer fan-out after a save
    ├── tiptap.py         # TipTap JSON helpers (text, counts, markdown, docx)
    ├── importers.py      # .txt / .md / .docx  ->  editable document
    ├── urls.py
    ├── admin.py
    └── tests.py
```

### 2.1 Layering

```
view  →  service  →  model
```

* **views.py** parses the request and turns the result into JSON. It contains no rules.
* **services.py** contains the rules *what happens* (create, update, share, revoke, trash).
* **permissions.py** contains the rules *who may do what*.

That split is why a view stays short enough to be read in one screen and why the
permission matrix can be reviewed in a single file.

### 2.2 Data model

```
User (Django default)
  └──< Document.owner
        └──< DocumentPermission.user

Document
  id              UUID (primary key)
  title           CharField
  content         JSONField     -> TipTap document (the editable source of truth)
  file            FileField     -> the .docx of this document (media/documents/…)
  source_file     FileField     -> the original upload of an imported document
  owner           FK(User)
  source_filename CharField     -> set when the document was imported
  is_deleted      Boolean       -> trash
  deleted_at      DateTime
  created_at / updated_at
```

**Every document exists twice**: as TipTap JSON in the database (editable) and as a
real `.docx` file on disk — `documents/docx_export.py` rewrites it on every save. The
download endpoint serves that file, so what you download *is* the document; an
imported document additionally keeps its original upload, downloadable as *original*.

`DocumentPermission` is unique per `(document, user)` and stores `viewer` or `editor`.
The owner is *not* a permission row — `Document.owner` represents that, so the role of a
user is always resolved in exactly one place.

### 2.3 The permission model

| Helper | Meaning |
| ------ | ------- |
| `get_role(document, user)` | `owner`, `editor`, `viewer` or `None` |
| `can_view(document, user)` | owns it or it was shared with them |
| `can_edit(document, user)` | owner or editor |
| `is_owner(document, user)` | owner only |

Every view starts by resolving the role; a user without a role gets `404` (the document
simply does not exist for them), a user without the required permission gets `403`. The
frontend hides the buttons, but the API is the authority — a viewer calling
`PATCH /api/documents/<id>/` directly gets a 403.

### 2.4 Function-based views

The brief asks for `def` instead of classes. On top of that, the DRF decorators
(`@api_view`) keep each endpoint in one readable function: the URL, the HTTP method, the
check and the response are visible without jumping between files.

### 2.5 Imports and exports

`documents/importers.py` converts a file into a TipTap document:

| Format | Handling |
| ------ | -------- |
| `.txt` | Split into blocks, one paragraph per block |
| `.md` | Headings, bullet/ordered lists, quotes, fenced code and inline `**bold**`, `*italic*`, `` `code` ``, `[links](url)` |
| `.docx` | Paragraph styles (Heading 1-3, Quote, List Bullet/Number) and tables (as text rows) |

The result is a normal document: it opens in the editor and can be edited, formatted,
shared and deleted like any other.

The plan mentions the `markdown` package. It is intentionally **not** used: the importer
converts Markdown straight into the TipTap tree instead of going through HTML, which
keeps the formatting exact and saves a dependency.

`documents/exports.py` is the other direction — a document back into a file:

| Format | Handling |
| ------ | -------- |
| `.docx` | The **stored file** (headings, lists, quotes, code, inline marks, real Word hyperlinks) — this is what the download serves by default |
| `original` | The upload of an imported document, byte for byte as it was uploaded |
| `.txt` | The plain text of the document |
| `.md` | Headings, lists, quotes, code blocks and inline marks — round trips with the importer |
| `.html` | A standalone, styled HTML page |
| `.json` | The raw TipTap JSON |

Everybody who may read a document may download it; the export runs server side so the
file always matches what is stored.

### 2.6 Limits

* Upload: 5 MB, extension whitelist (`.txt`, `.md`, `.docx`).
* Document content: 2 MB of JSON (`MAX_CONTENT_BYTES` in `services.py`), validated before
  saving.

### 2.7 CORS without a dependency

`draftly_backend/cors.py` is a small middleware that answers preflight requests and adds
the CORS headers for the configured origins. In development the Vite proxy makes it
unnecessary; in production it is one environment variable (`CORS_ALLOWED_ORIGINS`).

---

## 3. Frontend structure

```
draftly_frontend/src/
├── services/
│   ├── api.ts             # the HTTP client + every endpoint of the API
│   ├── authService.ts     # register / login / logout / me
│   ├── documentService.ts # list / create / update / delete / import / download
│   ├── sharingService.ts  # permissions, share, role change, revoke, user search
│   └── realtime.ts        # the WebSocket client (connect, reconnect, throttle)
├── components/
│   ├── layout/            # AppShell, Header, Sidebar, UserMenu, ProtectedRoute
│   ├── documents/         # rows, list, context menu, create/import modals, page head
│   ├── editor/            # DocumentEditor, EditorHeader, EditorToolbar,
│   │                      # SaveIndicator, ExportMenu, PresenceBar, RemoteSelections
│   ├── sharing/           # ShareModal, PermissionSelector, CollaboratorList
│   └── ui/                # Modal, ConfirmDialog, RenameDialog, Avatar, Brand, Icon
├── pages/                 # Landing, Login, Register, Dashboard, MyDocuments,
│                          # SharedDocuments, Recent, Trash, EditorPage, NotFound
├── hooks/                 # useAuth, useAutosave, useDocuments, useDebouncedValue,
│                          # useDocumentRealtime, useAnchoredMenu
├── context/               # AuthContext (session), ToastContext (notifications)
├── styles/                # global tokens + one stylesheet per area
├── types/                 # TypeScript types mirroring the API payloads
└── utils/                 # formatting and TipTap helpers
```

The structure is **feature oriented**: everything that belongs to the editor lives in
`components/editor`, everything that belongs to sharing in `components/sharing`. A new
feature therefore touches one folder instead of a horizontal layer.

### 3.1 Routing

| Route | Page | Access |
| ----- | ---- | ------ |
| `/` | Landing page | public |
| `/login`, `/register` | Authentication | public |
| `/app` | Dashboard | private |
| `/app/my-documents`, `/app/shared-with-me`, `/app/recent`, `/app/trash` | Lists | private |
| `/documents/:id` | Editor | private |

The landing page is public, the workspace lives under `/app` — so the marketing page and
the application never compete for the same URL.

### 3.2 One API client, thin services

`src/services/api.ts` owns:

* the base URL (`VITE_API_BASE_URL`, `/api` in development),
* the `Authorization: Token …` header (axios request interceptor),
* the automatic logout on a `401` (response interceptor + `draftly:unauthorized` event),
* friendly error messages (`getErrorMessage`),
* a typed function per endpoint (`authApi`, `usersApi`, `documentsApi`, `sharingApi`).

The three service modules are a thin, intention revealing layer on top of it
(`documentService.list(...)` instead of `documentsApi.list(...)`). No component imports
axios — presentation code never talks to the network directly.

### 3.2 Autosave with a serialized save queue

`src/hooks/useAutosave.ts` implements the autosave:

1. Every change of the value restarts an **800 ms** timer.
2. When the timer fires, the value goes into a queue and the queue is drained — but only
   **one request is in flight at a time**.
3. Changes that happen while a request is running replace the queued value; as soon as
   the running request finishes, the newest value is sent.
4. A failed request keeps the value in the queue, shows *Save failed* and offers a
   **Retry** button.
5. The local state is never overwritten by a response, so a slow request can never
   replace newer content with older content.
6. `sync(value)` adopts a value that came from somewhere else (a live update): it
   becomes the new baseline and is **not** written back.

That gives ordered writes without any synchronisation machinery — the simple, reliable
alternative the plan asks for.

### 3.3 Editor page

* `useEditor` (TipTap) with `StarterKit` + `Placeholder` + the `RemoteSelections`
  extension; the ProseMirror node carries the `tiptap` class so the stylesheet can style
  the content directly.
* The document is loaded by the page, the editor is mounted by `DocumentEditor` with
  `key={document.id}` — switching documents therefore remounts the editor and starts with
  a clean autosave queue.
* Viewers get `editor.setEditable(false)` plus a banner — the API would reject their
  changes anyway.
* `Ctrl/Cmd + S` saves immediately.
* The header carries the save status, the **presence row** (who else is here) and the
  export menu.

### 3.4 Live updates

The REST API stays the **only** place where a document is written — it owns the
permission checks, the validation and the version counter. The WebSocket only
*announces* that something changed:

```
editor A                     server                     editor B
   │  type…                     │                          │
   │  PATCH /documents/<id>/    │                          │
   │  ────────────────────────▶ │  update_document()       │
   │                            │  version += 1            │
   │                            │  group_send ────────────▶ │  "update" frame
   │  ◀── 200 { version } ────── │                          │  applies the content
```

* `documents/consumers.py` is a **plain ASGI function** (no consumer class): it
  authenticates the token, resolves the role with the same `permissions.py` helpers the
  REST API uses and joins the channel group of the document.
* `documents/realtime.py` performs the fan-out after a successful save. A failure of the
  channel layer never breaks a save — it only means "no live update this time".
* The client (`services/realtime.ts` + `hooks/useDocumentRealtime.ts`) reconnects with a
  growing delay, gives up after six attempts and falls back to polling
  `GET /api/documents/<id>/version/` when the socket cannot be established.

**Conflicts.** Because two people can edit at the same time, the editor decides what
happens:

| Local state | Remote change | Result |
| ----------- | ------------- | ------ |
| saved | arrives | applied immediately, no save triggered |
| unsaved (dirty / saving) | arrives | a conflict banner asks: *load theirs* or *keep mine* |

The `version` counter on the document is what makes this detectable — it is bumped on
every save and returned by every document response.

### 3.5 Live collaboration (cursors and selections)

On top of the save broadcast there is a second, faster channel: the **collab stream**.

```
editor A                         server                      editor B
   │  keypress                     │                            │
   │  collab/content ────────────▶ │  group_send (relay only)  │
   │  ─────────────────────────────┼──────────────────────────▶ │  apply live
   │  collab/selection ──────────▶ │                            │
   │  ─────────────────────────────┼──────────────────────────▶ │  coloured highlight
```

* The client sends `{"type": "collab", "kind": "content", …}` on every change
  (throttled to ~80 ms) and `{"type": "collab", "kind": "selection", …}` whenever the
  caret moves.
* The server **relays** those messages to the group — it never stores them. The
  database is written through the REST API only, so the permission rules stay in one
  place.
* The receiving editor applies the content with `setContent(…, { emitUpdate: false })`
  and restores its own caret, so the text appears as it is typed.
* The selection of every other editor is rendered as a **ProseMirror decoration**
  (`components/editor/RemoteSelections.ts`): a translucent highlight with an underline
  in the colour of that user. The same colour rings their avatar in the presence row,
  so you can tell who is highlighting what.
* The colours come from a fixed palette indexed by the user id — the first user gets
  orange, the second blue, and so on.

> **Honest limitation.** This is *not* a CRDT. If two people type at the same time,
> the second change cannot be merged — it is offered as a conflict instead of being
> silently applied. True character-level merging would need Yjs and a different
> storage model.

### 3.6 Menus and dialogs

Every dropdown (document context menu, export menu, user menu) is rendered in a
**portal** with `position: fixed` and placed against the trigger's rectangle
(`hooks/useAnchoredMenu.ts`). An absolutely positioned menu inside a container with
`overflow: hidden` — such as the document sheet — would be clipped at its edge; the
portal makes that impossible. The menus flip upwards when there is no room below and
close on Escape, on an outside click and while scrolling.

### 3.7 Design system

Plain CSS with custom properties (`src/styles/global.css`). The direction is
**"ink & paper"**:

* warm neutral canvas (`--canvas`), white surfaces, hairline borders,
* one deep-green accent used sparingly (active navigation, focus ring, "saved"),
* no gradients and no drop shadows on flat surfaces — depth comes from the layout,
* small radii (4–12 px) instead of the pill-and-blob look,
* a **serif** document canvas (`--font-serif`) against a sans interface — the editor
  should feel like a page of type, not a form.

| Stylesheet      | Contents                                          |
| --------------- | ------------------------------------------------- |
| `global.css`    | tokens, buttons, forms, utilities                 |
| `layout.css`    | sidebar rail, top bar, workspace                  |
| `dashboard.css` | page header, statistics, document rows            |
| `editor.css`    | editor bar, toolbar, paper canvas, TipTap styles  |
| `components.css`| modals, menus, toasts, empty states, share dialog |
| `auth.css`      | sign in / register                                |
| `landing.css`   | the public landing page                           |

All icons are inline SVG (`components/ui/Icon.tsx`) — a single stroke-based set on a
24 px grid, so nothing depends on an icon font or emoji.

---

## 4. Data flow of a shared document

```
Alice creates "Proposal"
   POST /api/documents/                → Document(id, owner=Alice)

Alice shares it with Bob (editor)
   POST /api/documents/<id>/share/      → DocumentPermission(user=Bob, role=editor)

Bob opens it
   GET  /api/documents/<id>/            → 200, role="editor", content=…

Bob edits and autosaves
   PATCH /api/documents/<id>/           → 200 (Bob is an editor)

Alice changes Bob to viewer
   PATCH /api/documents/<id>/permissions/<pid>/  → role="viewer"

Bob tries to edit again
   PATCH /api/documents/<id>/           → 403 Forbidden

Alice revokes Bob completely
   DELETE /api/documents/<id>/share/<bob_id>/   → 204

Bob opens the document again
   GET  /api/documents/<id>/            → 404 Not Found
```

---

## 5. Scaling notes (not implemented, by design)

* The document list is not paginated — a workspace holds tens of documents.
* `content` is loaded with the list because the snippet needs it; for very large
  workspaces the list endpoint would return only the metadata.
* SQLite is fine for the assessment; `DATABASE_URL` switches the project to PostgreSQL
  without any code change.
* Real-time editing would need channels + a CRDT (Yjs). The plan explicitly defers it.
