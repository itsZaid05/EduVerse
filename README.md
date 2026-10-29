# EduVerse 🌍

**Explore. Collaborate. Learn.** — a browser-based 3D multiplayer learning world for Grades 6–10.
Students join with a nickname + class code, explore a shared 3D campus, travel to three subject
zones, solve collaborative missions, and earn team points. Teachers run the class from a live dashboard.

## Run it (local demo)

Prerequisites: Node.js 20+.

```bash
npm install
cp .env.example .env   # teacher PIN defaults to 1234 via TEACHER_PIN
npm run dev            # server :2567 + client :5173
```

Open http://localhost:5173

1. **Teacher**: choose *Teacher*, pick a nickname, a class code (e.g. `DEMO1`), PIN `1234`
   (or your `TEACHER_PIN`). Share the code.
2. **Students** (open a second browser / incognito window to prove multiplayer): choose *Student*,
   nickname + same code. You'll see each other's avatars on campus and can watch moves sync live.
3. Try: Fraction Forge together (one wrong move, then 1/2 + 1/4 + 1/4), Molecule Builder (H₂O),
   Heritage Explorer at the Qutb Minar, then the teacher sends a hint / resets a puzzle / moves the class.

Build & test:

```bash
npm run build   # server (tsc) + client (tsc + vite)
npm test        # server puzzle-validation unit tests (vitest)
```

## What's inside (phases 0–10)

| Phase | Delivered |
|---|---|
| 0 | Repo inspection, pinned versions (React 18, Vite 5, A-Frame 1.6, Colyseus 0.15), architecture below |
| 1 | Join shell: nickname/code validation, student + teacher routes, error/loading states, no inert buttons |
| 2 | A-Frame campus with 3 clickable portals, WASD + mouse-look, bounds, single persistent canvas |
| 3 | Colyseus authoritative room per class code: roster, zones, positions, remote avatars, 30 s reconnect |
| 4 | Fraction Forge: server-validated placement, reject > 1, no duplicate scoring, hints, explanation, reset |
| 5 | Molecule Builder: H₂O, server-validated atom/slot placement, explanation, reset |
| 6 | Heritage Explorer: stylized Qutb Minar (tapered fluted tower), Alai Darwaza, 3 discoveries, questions, sources |
| 7 | Teacher dashboard: live roster/zones/scores/attempts, start/next activity, announce, hint, resets; PIN-checked server-side |
| 8 | Session chat + quick messages (sanitized, length- and rate-limited), team points, badges, session summary |
| 9 | Optional server AI hints (`AI_API_KEY/AI_API_URL/AI_MODEL`); predefined reviewed hints always work, failure = fallback |
| 10 | Builds + unit tests verified, multi-client test, this README, `.env.example`, `LICENSES.md` |
| 12 | Second Fraction Forge puzzle ("Make 2/3", teacher-rotated via ⏭️, each puzzle scores once, replay-after-reset never re-scores), guided heritage route (numbered markers + ground path discs in discovery order), teacher session-recap export (.txt download generated from live state) |
| 11 | CO₂ second science level (independently validated/scored), session timer in HUD/summary/teacher view, camera-relative WASD + rotation sync + smoothed (interpolated) remote avatars, auto-classified common-error metrics (fraction overshoot / wrong atom slot / wrong heritage answer) on the teacher dashboard |

## Architecture

- **Client** (`client/src`): React + Vite + TypeScript. `world/World.tsx` = the single A-Frame scene
  (zone groups swapped in place — no duplicate canvases/listeners). `network/client.ts` = Colyseus client +
  state snapshot. Game panels live with the page in `App.tsx`; content in `games/content.ts`.
- **Server** (`server/src`): Node + TypeScript + Colyseus (one `classroom` room type, filtered by class code).
  `rooms/ClassRoom.ts` handles messages; `services/puzzles.ts` is the pure, unit-tested validation/scoring
  logic; `content/content.ts` holds versioned puzzle + reviewed heritage content; `services/aiHints.ts` is Phase 9.
- **One networking system only**: A-Frame (vendored locally in `client/public/`, no CDN) renders, Colyseus is authoritative for roster, positions, puzzle
  state, scores, teacher commands. No Networked-Aframe / Socket.IO duplication.
- State is in-memory per session (MVP): no accounts, no database, nicknames only.

Historical content was checked against UNESCO (https://whc.unesco.org/en/list/233) and India's
Ministry of Culture (https://culture.gov.in/qutb-minar-and-its-monuments); both are linked in-app.
The Qutb Minar scene is a stylized educational reconstruction, not a survey-accurate model.

## Known issues / deferred

- If a student enters a brand-new code before a teacher creates it, they create that session (by design
  for frictionless demos, but codes should be teacher-issued).
- 3D click uses A-Frame's mouse cursor; HUD buttons mirror every interaction for reliability/accessibility.
- In-memory sessions reset when the server restarts; no persistent grades (intentional for the MVP).
- VR support is deferred (not a release requirement). Persistent storage across server restarts remains out of scope for the MVP.

## Deployment

Host the client as static files (`npm run build -w client`) and the server as a persistent Node process
(`npm run build -w server && npm start -w server`). Set `VITE_SERVER_URL` for the client build if the
server isn't on the same host pattern, and `TEACHER_PIN` on the server. Never commit `.env`.
