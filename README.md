# Tonight belongs to Jess 🐦🩷

A surprise date night that plays like a little card game, which you secretly run from your phone.

| | Link | Who |
|---|---|---|
| **Laptop homepage** | `https://<your-site>.netlify.app/` | Open this on your laptop before she gets there. It's a big QR code she scans to open her page. No spoilers on it. |
| **Jess Mode** | `https://<your-site>.netlify.app/jess` | Jess. Pink, simple, a little meme-y. She flips mystery cards and only finds out what she picked *after* it flips. |
| **Kyd Control Room** | `https://<your-site>.netlify.app/kyd` | You, with a PIN. You see what's under every card, the full logistics, her requests, and every control. |

## How a night plays

1. **Waiting.** Her page says *"Hey Jess. not yet 👀"* Nothing is scheduled.
2. **You tap JESS IS HERE 🩷** when she actually arrives. The real start time is recorded and her phone moves into the night with no refresh.
3. **Opening:** *"Hey Jess. you don't have to plan anything tonight."* → *"rule #1: don't ask where we're going."* → *"come inside 👀"* → *"put your phone down for a sec"* (flowers + basket). You tap **NEXT** through these.
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
| `secret` | nothing | "you'll see 👀" |

You can always upgrade a reveal with **REVEAL FULL PLAN TO JESS**.

### The idea pool
There are **107 plans in 9 categories**, plus a secret wildcard card. They're all in `data/plan.js`:

| Category | Jess sees | Examples |
|---|---|---|
| FOOD | "food" | Pad Thai at Lanna, Velvet Taco, Cajun Alfredo, somewhere new, takeout somewhere quiet, drive-thru roulette |
| SWEET | "something sweet" | Braum's, M&M ice cream sandwiches, Cookies 'n' Creme + movie, Scooby snacks, dessert in the car |
| COFFEE | "coffee / drinks" | dark coffee somewhere cozy, mushroom coffee, Alani + a drive, blind taste test |
| GAME | "game time" | MW3, Oculus cooking, GTA chaos, winner picks dessert, loser picks the next card, arcade |
| HOME | "movies / home" | **"yeah we're not going anywhere 😭"**, **"plot twist: couch."**, **"congratulations, you picked doing absolutely nothing."**, Pursuit of Happyness, Iron Giant, a thriller, a random genre |
| OUTING | "little outing" | aimless drive, bookstore, record store, $10 Target challenge, a view, weird Tulsa spots |
| TALK | "let's talk" | optional and light: dream trips, embarrassing stories, one hypothetical, a deeper one *only if the vibe is right* |
| CHALLENGE | "little challenge" | pick each other's snack, find something pink, one veto tonight, tier list |
| COZY | "cozy ending" | movie at home, COD, snacks + talking, order in, do nothing at all |

- **Staying home is not the boring option.** HOME can come up at any point in the night, and gets more likely as it gets later.
- **"Your call":** about 15% of rounds (`yourCallChance`), one card is secretly YOUR CALL. She sees *"your call 👀 (mine, actually)"*. Your phone says she picked YOUR CALL, and **PICK THE PLAN** opens real options from that round's category. Whatever you choose stays *"you'll see 👀"* on her phone until you reveal it.
- **Random genre:** the "movie night" card picks a random genre for her to see; you two pick the movie together.

### How the next category gets picked
The rules are curated, not chaotic:
- **No repeats:** never the same category twice in a row, and similar ones (GAME/CHALLENGE, HOME/COZY) rarely follow each other.
- **One meal:** only one real meal, counting "order in" at the end. The later it gets without food, the more likely FOOD becomes.
- **Dessert after food:** dessert normally comes after a meal, and full movies wait until after she's eaten.
- **Talking is optional:** TALK never comes first, shows up less often, and happens at most twice.
- **Cozy is the ending:** COZY only comes up later, and after it only dessert is still suggested.
- **Already home?** Going back out becomes less likely.
- **Open places only:** places closing within ~30 min are skipped (Tulsa time). The same venue is never dealt twice.
- **Different every night:** the randomness is seeded per night.

**You can override all of it.** CHOOSE CATEGORY MYSELF shows every category, with the reason the engine would skip it, and you can force any of them. RESHUFFLE and CHANGE CATEGORY work while she's still choosing.

### "not feeling this?"
After a flip, she can tap **not feeling this?** and pick a vibe: Just surprise me / Feed me / Something fun / Something chill / Something sweet / Can we just be cozy?
- **She never sees a place.**
- **You get the request** with a suggested switch and other backups → **USE THIS PLAN / CHOOSE ANOTHER / IGNORE**.
- **Swapping a plan** shows her *"change of plans 😭"* and keeps the new place secret until you reveal it.

### Reactions (real GIFs, sparingly)
All reaction GIFs live in **`src/data/reactionLibrary.js`**. Components never hardcode a GIF; they ask for a reaction by *context*:

| Context | When | Draws from | Caption |
|---|---|---|---|
| `pick` | ~30% of card picks, before the flip | SIDE_EYE, JUDGING, SHOCKED, AWKWARD, CRYING_LAUGHING, NO_WAY, CAT_CHAOS | "now why would you pick that one 😭", "noted 📝", "be so fr 😭"… |
| `surprise` | she taps *Just surprise me* | CELEBRATING, LETS_GO | "I KNOW THAT'S RIGHT" → "I got you." |
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
- **Everything about the night is in `data/plan.js`:** opening beats, categories and their labels, the **card library** (107 plans + the "your call" card), reveal lines, the occasional sweet and flirty asides, captions, card faces, the finale note.
- **Tone:** everything Jess sees is written as you talking: short and simple, no explaining (you'll explain in person). Mostly playful, sometimes sweet, rarely flirty. No pet names or relationship labels. Sweet lines show on ~18% of reveals and flirty ones on ~10% (`pickAside` in `netlify/lib/engine.js`).
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
