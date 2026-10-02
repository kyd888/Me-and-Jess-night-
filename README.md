# Tonight belongs to Jess 🐦

A small, mobile-first "choose your night" web app for a Tulsa date night. Jess picks mystery ticket cards, each one flips to reveal the next stop, and the night ends with a small surprise.

Built with React + Vite. No backend. Progress is saved in `localStorage`, so refreshing the page doesn't reset the night.

## Run it

```bash
npm install
npm run dev        # opens on http://localhost:5173 (and your LAN IP for testing on an iPhone)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

To test on your iPhone, run `npm run dev`, then open the `Network:` URL it prints, with the phone on the same Wi-Fi.

## The flow

| | Prompt | Cards → reveal |
|---|---|---|
| Intro | Tonight belongs to Jess | Start the night |
| Ch 1 | Where are we starting? | Something Cozy → **Lanna Thai** · Something Tasty → **Velvet Taco** · Trust Me → **Mother Road Market** |
| Ch 2 | Choose our vibe. | Play → **Max Retropub** · Explore → **Magic City Books + Center of the Universe** · Chill → **Circle Cinema** |
| Ch 3 | Sweet ending. | Cold → **Braum's** · Chocolate → **QT candy run** · Dealer's Choice → **ice cream sandwiches + Oculus at home** |
| Ch 4 | One last thing… | gift box → "I got you something." → flowers + basket, a note, and stubs from her picks that night |

The sky gets darker each chapter, and more stars come out as the night goes on.

> ⚠️ Check evening hours for each place on the day. If something's closed, hide that card in Host Mode.

## Changing the date options

**Everything is in `src/data/night.js`.** Every card, reveal, note, quip and line of finale text lives there. The UI only reads that file. Each choice looks like:

```js
{
  id: "cozy",
  title: "Something Cozy",          // what Jess sees on the ticket
  hint: "noodles. a booth. no rush.",
  icon: "🍜",
  revealTitle: "Lanna Thai",
  location: "Lanna Thai · Tulsa",
  description: "…",
  note: "Pad Thai. Obviously.",     // handwritten sticky note
  mapLink: maps("Lanna Thai Tulsa OK"),
  enabled: true,                    // false hides the card
}
```

There's a list of backup Tulsa ideas at the bottom of that file.

Set `signature` near the top of the file to sign the final note (it's `— me` right now).

**If you edit `night.js` after using Host Mode on the phone**, bump `version` in that file. Otherwise the phone keeps its saved Host Mode edits and won't pick up your changes.

## Changing colors / text / fonts

- **Colors, fonts and the sky gradients:** `src/theme.css`
- **All wording:** `src/data/night.js` (intro, chapter titles, quips, finale, the hidden bird and moon lines)
- **Layout and animation:** `src/styles.css`

## Host Mode (hidden)

Open it either way:
- **Long-press the top-right corner of the screen for about 1 second**, or
- add `?host` to the URL (e.g. `https://your-app.vercel.app/?host`)

In Host Mode you can:
- skip ahead, or jump to any chapter or the finale
- reset the night (keeps your edits)
- edit any card's text, location, note and map link
- hide or show a card (e.g. if a place is closed)
- edit the finale text, basket items and signature
- copy the plan as JSON, or restore the defaults from `night.js`

Edits save on that phone only, so make them on the phone Jess will use. If Jess is using her own phone, set things up on it beforehand.

## Hidden details

- Tap the little bird on the intro screen.
- Triple-tap the moon on the intro screen.
- Each pick shows one quip, and quips don't repeat within a night.

## Deploy to Vercel

**Option A: GitHub (recommended)**
1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel detects Vite automatically (build: `npm run build`, output: `dist`). Click **Deploy**.

**Option B: CLI**
```bash
npm i -g vercel
vercel          # follow the prompts
vercel --prod
```

Tip: in iPhone Safari, use Share → **Add to Home Screen** so it opens full-screen like an app.

## Project layout

```
src/
  data/night.js         ← the plan (edit this)
  theme.css             ← colors & fonts
  styles.css            ← layout & animation
  App.jsx               ← screen flow / state
  lib/storage.js        ← localStorage (progress + Host Mode edits)
  components/
    Intro.jsx  Chapter.jsx  Reveal.jsx  Finale.jsx
    Progress.jsx  Sky.jsx  Toast.jsx  HostMode.jsx  icons.jsx
```
