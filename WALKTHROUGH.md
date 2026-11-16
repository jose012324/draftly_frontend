# Walkthrough video script — Draftly

**Length:** 3–5 minutes · **Format:** screen recording with voice, no slides needed.

Record only what actually works in the deployment you are showing. The script below
matches the implemented features 1:1.

| Time | Shot | What to say / do |
| ---- | ---- | ---------------- |
| 0:00–0:25 | Title + login screen | "Draftly is a collaborative document workspace: write rich-text documents, import existing files and share them with real viewer/editor permissions." Sign in as `alice@draftly.demo`. |
| 0:25–1:10 | Dashboard | Show the hero, the statistics and the seeded documents. Click **New document**, type a title → the editor opens. Point out the sidebar (Home, My Documents, Shared with Me, Recent, Trash) and the global search. |
| 1:10–2:00 | Editor | Type a heading, some **bold** text and a bullet list. Show the toolbar active states and the save indicator changing `Unsaved changes → Saving… → Saved`. Press `Ctrl+S`. |
| 2:00–2:35 | Import | Open **Import file**, drop a `.md` (and mention `.txt` / `.docx`). Show that the file opens in the editor with its heading and list preserved. |
| 2:35–3:25 | Sharing | **Share** → type `bob@draftly.demo` → *Can edit* → Share. Show the collaborator list. Log out, log in as Bob, open the document from *Shared with Me* and edit it. Then, as Alice, change Bob to *Can view*. |
| 3:25–3:50 | Permissions proof | As Bob, open the document: the view-only banner appears and the toolbar is disabled. Mention that the API answers `403` for a direct write attempt — the check lives in the backend, not in the UI. |
| 3:50–4:20 | Architecture | Briefly: React + Vite + TipTap frontend, Django REST Framework backend, TipTap JSON in a `JSONField`, permissions enforced in `documents/permissions.py`, tests via `python manage.py test`. |
| 4:20–4:40 | AI workflow & scope | How the work was organised (plan → contract → implementation → verification) and what was deliberately left out (real-time editing, comments, version history). |
| 4:40–5:00 | End | Show the README, the demo credentials and the deployment URLs. |

## Checklist before recording

- [ ] Backend and frontend are deployed and reachable from the recording machine.
- [ ] `alice@draftly.demo` / `draftly123` and `bob@draftly.demo` / `draftly123` work.
- [ ] The seed data (three sample documents) is present.
- [ ] Browser zoom is 100 %, window ~1440 × 900.
- [ ] No console errors / no failed requests (open the dev tools briefly to show it).
- [ ] Pause on the permission demo so the viewer role is visible.

## After recording

- Upload the video (Drive/YouTube/Vimeo).
- Put the link into `SUBMISSION.md` → *Walkthrough video URL*.
- Add a still frame per scene to `docs/screenshots/`.
