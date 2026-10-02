# Tonight belongs to Jess 🐦🩷

A surprise date night with two phones:

| | Link | Who |
|---|---|---|
| **Jess Mode** | `https://<your-site>.netlify.app/jess` | Jess. A pink storybook that only shows what she needs to know right now. |
| **Kyd Control Room** | `https://<your-site>.netlify.app/kyd` | You, with a PIN. The whole plan, backups, her requests, and every control. |

Jess never picks destinations. You run the night from your phone, and her page updates by itself within a few seconds.

## How it works

```
 Jess's phone  ──GET /api/state every 2.5s──▶  Netlify Function ──▶ Netlify Blobs
 (/jess)       ──POST requests & taps──────▶   (guest view only)     state-tonight
                                                                     jess-tonight
 Kyd's phone   ──GET/POST /api/host + PIN──▶  Netlify Function ──▶
 (/kyd)
```

- **Shared state** lives in Netlify Blobs: one record you write and one record Jess writes, so the two never overwrite each other.
- **Jess's phone only ever gets a guest view.** That means the current chapter's wording, your clues and messages, a destination only *after* you reveal it, and stops already finished. She never gets future steps, your notes, addresses or the backup list.
- **The plan stays off her phone.** It lives in `data/plan.js`, which only the server reads. It isn't in the website's code, so she can't spoil it by looking at the page source.
- **Updates come by polling** every 2.5 seconds, and immediately when she unlocks her phone or switches back to the tab.

### The night starts when she arrives
Nothing is scheduled. Until you tap **JESS IS HERE 🩷**, her page says *"Tonight, Jess. Your night isn't ready yet."*

Tapping it:
- records the real start time
- starts chapter 1
- moves her phone into the night automatically, with no refresh

After that, the only timing is what *you* trigger: advance, reveal, clue, message, pause, finish. Elapsed time and estimated durations show only in the Control Room.

## Jess's side
1. **Waiting:** "Tonight, Jess." (tap the bird).
2. **Start:** "Tonight belongs to Jess." → *okay I'm ready* → "Rule #1: Don't ask Kyd where you're going." → *fine 🙄*
3. **One chapter at a time:** a picture, a short line, maybe a hint, and one button. Her button just tells you she tapped it; the story only moves when you advance it.
4. **Revealing a destination:** when you tap REVEAL, a ticket flips over on her screen.
5. **Clues** appear as sticky notes. **Messages** pop up full-screen ("Look at Kyd.").
6. **"not feeling this?"** offers six vibes (Just surprise me, Feed me, Something fun, Something chill, Something sweet, Can we just be cozy?). She never sees places. She gets *"Request sent to Kyd 👀"* → *"Okay, you're off planning duty again."*, or for surprise mode *"Correct answer."* → *"Kyd has it from here."*
7. **Scrapbook:** every finished step becomes a ticket with the real time it happened. The little bird trail at the top opens it.
8. **Finale:** "That's the night." with every ticket and your note.

## Your side (Control Room)
- **Before she arrives:** status, the giant **JESS IS HERE 🩷** button, the first thing she'll see, and her link with a QR code.
- **During the night:**
  - started time, elapsed time, and time on this step (vs. estimate)
  - current step: destination, address, maps link, open until, your notes, and whether she tapped her button
  - **ADVANCE STORY · REVEAL DESTINATION · SEND A CLUE · SEND MESSAGE · CHANGE PLAN · PAUSE · FINISH NIGHT**
  - the next planned step
- **Requests from Jess:**
  - pop up at the top with a suggested backup and why she might like it, plus other options
  - **USE THIS PLAN** adds it as the next step. Nothing is revealed until you tap REVEAL.
  - **CHOOSE ANOTHER** or **IGNORE / KEEP CURRENT PLAN**
- **Tonight's plan:**
  - reorder with ↑ ↓
  - tap a step to edit it
  - ✕ to remove a step
  - **go** to jump straight to a step (skipping the ones in between)
  - **+ Add a step**
- **Change plan:** the private Tulsa backup bank by category (DINNER, DESSERT, GAMES, COZY, COFFEE, RANDOM, AT HOME). Each backup can be made the next step or replace the current destination.
- **⋯ menu:** Jess's link + QR code, **Reset night**, lock.

## Editing the plan
- **Default steps, backups, finale text and wording:** `data/plan.js`. Every field is documented at the top of that file.
- **During the night:** change things in the Control Room. Your changes are stored with the live night.
- **To reload `data/plan.js` after editing it:** use ⋯ → **Reset night**. This wipes the current night.
- **Colors and fonts:** `src/theme.css`. Pink is the signature color.
- **Layout and animation:** `src/styles.css` (Jess) and `src/kyd/kyd.css` (Control Room).

⚠️ Addresses and hours marked "verify" are best guesses. Check them on the day.

## Setup on Netlify (one time)
1. **Set your PIN:** Netlify → your site → **Site configuration → Environment variables** → add `HOST_PIN` (e.g. a 4–6 digit number). Without it, the PIN falls back to `fallbackPin` in `data/plan.js` (`0630`). Change one or the other.
2. **Deploy:** push to the branch Netlify builds from. `netlify.toml` already sets up the build, the functions folder, and the `/jess` and `/kyd` routes. **Netlify Blobs needs no setup.**
3. **Do a test run:** open `/kyd?s=test` and `/jess?s=test` on two phones. The `?s=test` part uses a separate practice night, so the real one stays untouched.
4. **Add the Control Room to your Home Screen:** on your iPhone, open `/kyd` in Safari → Share → **Add to Home Screen**.
5. **Send Jess her link:** text her `/jess`, or let her scan the QR code in the Control Room.

## Run locally
```bash
npm install
npm run dev     # http://localhost:5173/jess  and  http://localhost:5173/kyd  (PIN 0630)
```
The dev server includes a stand-in for the Netlify Functions that keeps state in memory, so both pages work locally without any Netlify tools. Restarting the dev server resets the night. To test with the real Blobs storage locally, use `netlify dev`.

## Project layout
```
data/plan.js                 ← tonight's steps + Tulsa backups (server-only)
netlify/
  functions/state.mjs        ← /api/state  (Jess: guest view, requests, taps)
  functions/host.mjs         ← /api/host   (Kyd: PIN-protected controls)
  lib/engine.js              ← the night's logic: actions, guest view, suggestions
  lib/api.js                 ← request handling shared by functions + dev server
  lib/blobStore.js           ← Netlify Blobs (strong consistency)
src/
  main.jsx                   ← /kyd → Control Room, everything else → Jess
  jess/                      ← Waiting, Onboarding, StepView, RequestSheet, Scrapbook, Finale
  kyd/                       ← Kyd.jsx (Control Room), PlanList, Sheets, kyd.css
  components/                ← Sky, birds/icons, Toast (shared)
  lib/api.js                 ← fetch + polling helpers
  theme.css  styles.css
```
