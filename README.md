# Tonight belongs to Jess 🐦🩷

A surprise date night that plays like a little card game, which you secretly run from your phone.

| | Link | Who |
|---|---|---|
| **Laptop homepage** | `https://<your-site>.netlify.app/` | Open this on your laptop before she gets there. It's a big QR code she scans to open her page. No spoilers on it. |
| **Jess Mode** | `https://<your-site>.netlify.app/jess` | Jess. Pink, simple, a little meme-y. She flips mystery cards and only finds out what she picked *after* it flips. |
| **Kyd Control Room** | `https://<your-site>.netlify.app/kyd` | You, with a PIN. You see what's under every card, the full logistics, her requests, and every control. |

## How a night plays

1. **Waiting.** Her page says *"Tonight, Jess. Your night isn't ready yet."* Nothing is scheduled.
2. **You tap JESS IS HERE 🩷** when she actually arrives. The real start time is recorded and her phone moves into the night with no refresh.
3. **Opening:** *"Tonight belongs to Jess."* → *"Rule #1: Don't ask Kyd where you're going."* → *"Come inside."* → *"Okay. Put the phone down."* (flowers + basket). You tap **NEXT** through these.
4. **Card rounds:**
   - **The server picks a category** for the next part of the night ("food. obviously.", "something fun", "little adventure"…).
   - **She sees 2–4 face-down cards**, usually 3. Each one hides a *different* real plan from that category. The card faces (🐦 ✦ "pick me" "don't pick me" 👀…) are random every round and never hint at what's underneath.
   - **She picks one.** About 30% of the time a reaction GIF pops up first ("now why would you pick that one 😭"). Then the card flips: *"okayyy next stop 👀"* + the reveal.
   - **Your phone chimes and lights up: JESS PICKED A CARD.** It shows the category, plan, place, address, duration, cost, what to do, an OPEN DIRECTIONS button, a backup, and what she passed on.
   - **You tap WE FINISHED THIS ✓** when you're actually done. The card goes in her scrapbook with the real time and a caption ("you demolished that btw").
   - **"Generate next part of night?" → YES / WAIT / CHOOSE CATEGORY MYSELF.** Nothing new shows up on her phone until you say so.
5. **FINISH NIGHT** whenever → *"That's the night."* + her whole scrapbook + your note.

### Reveal modes (per plan)
| Mode | Jess sees | Example |
|---|---|---|
| `full` | exactly what it is | "Braum's run 🍦" |
| `hint` | the type of thing | "we're getting something sweet 👀" |
| `secret` | nothing | "Kyd knows where we're going. get up." |

You can always upgrade a reveal with **REVEAL FULL PLAN TO JESS**.

### How the next category gets picked
The rules are curated, not chaotic:
- **No repeats:** never the same category twice in a row, and similar ones (FUN/GAME, CHILL/COZY) rarely follow each other.
- **One meal:** only one real meal. The later it gets without food, the more likely FOOD becomes.
- **Food comes first:** dessert normally comes after a meal, and long things (movies, the drive-in) wait until after she's eaten.
- **Home is the end:** HOME only shows up later in the night, and once you're home only dessert is still suggested.
- **Open places only:** plans that close within ~30 min are skipped (using `closesAt`, in Tulsa time).
- **No reruns:** plans you already did are never dealt again.
- **Different every night:** the randomness is seeded per night.

**You can override all of it.** CHOOSE CATEGORY MYSELF shows every category, with the reason the engine would skip it, and you can force any of them. RESHUFFLE and CHANGE CATEGORY work while she's still choosing.

### "not feeling this?"
After a flip, she can tap **not feeling this?** and pick a vibe: Just surprise me / Feed me / Something fun / Something chill / Something sweet / Can we just be cozy?
- **She never sees a place.**
- **You get the request** with a suggested switch and other backups → **USE THIS PLAN / CHOOSE ANOTHER / IGNORE**.
- **Swapping a plan** shows her *"plot twist 😭 plan changed"* (with the "my fault gang" sticker) and keeps the new place secret until you reveal it.

### Reactions (real GIFs, sparingly)
All reaction GIFs live in **`src/data/reactionLibrary.js`**. Components never hardcode a GIF; they ask for a reaction by *context*:

| Context | When | Draws from | Caption |
|---|---|---|---|
| `pick` | ~30% of card picks, before the flip | SIDE_EYE, JUDGING, SHOCKED, AWKWARD, CRYING_LAUGHING, NO_WAY, CAT_CHAOS | "now why would you pick that one 😭", "noted 📝", "be so fr 😭"… |
| `surprise` | she taps *Just surprise me* | CELEBRATING, LETS_GO | "I KNOW THAT'S RIGHT" → "Kyd got it from here." |
| `switch` | she asks to change the vibe | SIDE_EYE, JUDGING, CAT_CHAOS | "oh so NOW you wanna switch 😭" |
| `swapped` | you swap her plan | AWKWARD, CRYING_LAUGHING | "my fault gang 😭" |
| `easterEgg` | she taps the waiting-screen bird 5× | CAT_CHAOS | "clock it." |

- **Each entry** looks like `{ id, source: "giphy" | "tenor" | "local", url, type, category, moods, weight }`.
- **For GIPHY**, paste either the GIF id or any giphy.com link. **For Tenor**, use the direct `media.tenor.com/...gif` URL. **For your own files**, drop them in `public/memes/` and use `source: "local"`.
- **To swap a GIF**, change its `url`. **To retire one**, set `weight: 0`. Change `chance` in `contexts` to make reactions more or less frequent.
- **Every GIF must be checked before the date.** The starter set (~30 GIFs) came from GIPHY search results, but I couldn't preview any of them because GIPHY is blocked where this was built. Open `/jess?s=test`, or paste each `https://giphy.com/gifs/<id>` link into your browser, and swap anything that doesn't fit.
- **No broken images:** if a GIF won't load, the caption still shows on its own.
- **The old pack is unused:** the earlier illustrated meme pack is still in `public/memes/`, but nothing references it anymore.

## Editing
- **Everything about the night is in `data/plan.js`:** opening beats, categories and their labels, the **card library** (31 Tulsa plans), reveal lines, the occasional sweet and flirty asides, captions, card faces, the finale note.
- **Tone** is mostly playful, sometimes sweet, rarely flirty. No pet names or relationship labels. Sweet lines show on ~18% of reveals and flirty ones on ~10% (`pickAside` in `netlify/lib/engine.js`).
- **Reaction GIFs** live in `src/data/reactionLibrary.js`.
- **During the night:** use **Card library** in the Control Room. Toggle any plan on/off (closed, not in the mood), edit it, or add a new one. Edits live with the current night.
- **⋯ → Reset night** reloads `data/plan.js` and wipes the current night.
- **Colors:** `src/theme.css` (pink is the signature).
- **Layout:** `src/styles.css` (Jess) and `src/kyd/kyd.css` (Control Room).

⚠️ Hours and addresses marked "verify" are best guesses. Check them on the day.

## How the phones talk
```
 Jess (/jess) ── GET /api/state every 2.5s ─▶ Netlify Function ─▶ Netlify Blobs
              ── POST pick / request / tap ─▶  (guest view only)
 Kyd  (/kyd)  ── GET/POST /api/host + PIN ──▶ Netlify Function ─▶ (every 2s)
```
- **Your controls and her picks are stored separately**, so they never overwrite each other.
- **Her phone never receives what's under the cards.** It only learns what *she* flipped, filtered by reveal mode.
- **The plan isn't in the website's code**, so she can't spoil it by viewing the page source.
- **Alerts on your phone:** iPhones don't allow websites to vibrate, so your phone plays a soft two-note chime (after your first tap in the Control Room) and flashes the panel instead.

## Setup on Netlify (one time)
1. **Set your PIN:** Site configuration → Environment variables → add `HOST_PIN`. Without it, the PIN is `0630` (`fallbackPin` in `data/plan.js`).
2. **Deploy:** push to the branch Netlify builds from. `netlify.toml` already sets up the build, the functions and the `/jess` + `/kyd` routes. Blobs needs no setup.
3. **Do a test run:** open `/kyd?s=test` and `/jess?s=test` on two phones. That's a separate practice night, so the real one stays clean.
4. **Add the Control Room to your Home Screen:** on your iPhone, open `/kyd` in Safari → Share → Add to Home Screen.
5. **Show Jess her QR code:** open the site root `/` on your laptop and leave it up. It's a big QR code, and its text changes once the night starts. Or text her `/jess`, or use the QR in the Control Room's ⋯ menu.

## Run locally
```bash
npm install
npm run dev     # http://localhost:5173/ (laptop QR), /jess, /kyd (PIN 0630)
```
The dev server includes an in-memory stand-in for the Netlify Functions, so both pages work locally. Restarting it resets the night. Use `netlify dev` to test against real Blobs.

## Project layout
```
data/plan.js                 ← opening, categories, card library, all the copy (server-only)
netlify/
  functions/state.mjs        ← /api/state  (Jess: guest view, picks, requests, taps)
  functions/host.mjs         ← /api/host   (Kyd: PIN-protected controls)
  lib/engine.js              ← sequencing rules, dealing cards, reveals, guest view
  lib/api.js                 ← request handling shared by functions + dev server
  lib/blobStore.js           ← Netlify Blobs (strong consistency)
public/memes/                ← drop local GIFs here (old pack, unused)
src/
  home/Home.jsx              ← laptop homepage with Jess's QR code (/)
  data/reactionLibrary.js    ← every reaction GIF + caption, by context
  lib/reactions.jsx          ← picks a reaction for a context; GIF with caption fallback
  jess/                      ← Waiting, Onboarding, Beat, Round (cards), Between, RequestSheet, Scrapbook, Finale
  kyd/                       ← Kyd.jsx (Control Room), Library, Sheets, kyd.css
  components/  lib/api.js  theme.css  styles.css
```
