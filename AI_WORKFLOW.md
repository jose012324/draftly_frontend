# AI workflow

How this project was produced with AI assistance, and what was done to keep the result
verifiable.

---

## 1. How the work was organised

1. **Read the brief first.** `plan.txt` (and later the more detailed specification) were
   reviewed end to end before a single file was written. The gaps were listed in
   `PLAN.md` together with the decision taken for each one.
2. **Contract before code.** The API contract was written once, in
   `draftly_frontend/src/services/api.ts`, and the Django views were implemented to match
   it exactly. Both sides therefore describe the same endpoints, the same payload fields
   and the same error semantics.
3. **One area at a time.** Frontend first (design system → layout → components → pages →
   API client), then backend (models → permissions → services → views → importer →
   tests), then documentation.
4. **No copy-paste from training data.** Every file in this repository was written for
   this project. There are no scaffolded CRUD generators, no "todo app" leftovers and no
   placeholder components.

## 2. Where AI helped most

| Task | How it was used |
| ---- | --------------- |
| TipTap 3 API | The v3 release changed several APIs (`setContent` now takes an options object, `undo/redo` moved into the `UndoRedo` extension, `Placeholder` moved to `@tiptap/extensions`). The exact signatures were verified against the published type definitions instead of being guessed. |
| Version pinning | `npm view` was used to pin versions that exist and work together (React 19.3, Vite 7.3, `@tiptap/*` 3.34, TypeScript 5.9) instead of guessing semver ranges. |
| Design | The whole visual language (tokens, spacing scale, shadows, component states, responsive rules) was generated as a coherent system and then applied consistently across the pages. |
| Documentation | `README.md`, `ARCHITECTURE.md`, `PLAN.md`, `PROGRESS.md`, `AI_WORKFLOW.md`, `SUBMISSION.md` and `WALKTHROUGH.md` were generated from the final state of the code, not from the plan. |

## 3. AI suggestions that were modified or rejected

| Suggestion | Decision |
| ---------- | -------- |
| Use the `markdown` PyPI package and convert Markdown → HTML → TipTap | **Rejected.** Converting Markdown straight into the TipTap tree is one dependency less and keeps headings, lists and inline marks exact instead of going through a lossy HTML round trip. |
| Use class based views (`generics.ListCreateAPIView`) | **Rejected** — the brief explicitly asks for `def` only. All views are functions. |
| Add `django-cors-headers` | **Rejected** — a 40 line middleware inside the project removes a dependency and an installation step; the behaviour is identical for this use case. |
| Introduce a state library (Redux / Zustand) | **Rejected** — the application has one session and one list at a time; React context + local state is enough and keeps the bundle small. |
| Add a UI component library (MUI, shadcn) | **Rejected** — the design system is hand written in plain CSS, which is what the plan asks for and keeps the look consistent. |
| Paginate the document list | **Deferred** — a workspace holds tens of documents; pagination would add complexity without a real need. |
| Store the editor content as HTML instead of TipTap JSON | **Rejected** — JSON keeps the structure (lists, headings) editable and is what the plan specifies. |

## 4. What was verified, and how

| Check | Result |
| ----- | ------ |
| Python syntax of every backend file | `python -m compileall` — clean |
| TipTap import/extract logic (Markdown, plain text, word count, snippet) | executed directly against `documents/tiptap.py` — correct output |
| Django app loading | `python manage.py check` stops only at `ModuleNotFoundError: rest_framework` (the dependency that must be installed) — no other error is reported before that point |
| Frontend type safety | the code is written against the published `.d.ts` files of TipTap, Axios and React 19 (`JSX.Element` → `ReactElement`, `getJSON()` → a JSONContent compatible type, `setContent(content, { emitUpdate })`) |
| API contract | the endpoint table in `README.md`, the functions in `api.ts` and the URL patterns in `documents/urls.py` were cross-checked one by one |

## 5. Honest limitations

* **The application was not started end to end.** Installing dependencies
  (`npm install`, `pip install -r requirements.txt`) and running the servers were
  explicitly excluded from the task, so the runtime behaviour was verified by static
  analysis, type-level verification and unit-level execution of the pure Python helpers
  — not by clicking through the UI. `PROGRESS.md` lists exactly what was and was not
  executed.
* **The migrations were written by hand** for the same reason. They follow the exact
  `makemigrations` format; running `python manage.py makemigrations` should report
  "No changes detected".
* **No deployment was performed.** The deployment notes in `SUBMISSION.md` are a
  checklist, not a claim of a live URL.

## 6. Guard rails applied

* No secrets, no API keys, no credentials in the repository.
* The seeded demo password (`draftly123`) is documented on purpose — it is a local
  evaluation account, not a production credential.
* Every request the frontend makes is sent to the API configured through
  `VITE_API_BASE_URL`; no third-party service is contacted at runtime.
* The backend never trusts the client for access control: role checks happen server side
  on every single endpoint, and the automated tests prove it.
