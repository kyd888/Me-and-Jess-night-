# Tonight belongs to Jess 🐦

A small, mobile-first "choose your night" web app for a Tulsa date night. Jess picks mystery ticket cards, each one flips to reveal the next stop, and the night ends with a small surprise.

Built with React + Vite. No backend. Deploys to Netlify. Progress is saved in `localStorage`, so refreshing the page doesn't reset the night.

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
- add `?host` to the URL (e.g. `https://your-site.netlify.app/?host`)

In Host Mode you can:
- skip ahead, or jump to any chapter or the finale
- reset the night (keeps your edits)
- edit any card's text, location, note and map link
- hide or show a card (e.g. if a place is closed)
- edit the finale text, basket items and signature
- show Jess's QR code (it carries your edits to her phone)
- copy the plan as JSON, or restore the defaults from `night.js`

Edits save on your phone and reach Jess's phone through the QR code, so if you change something, have her scan again.

## Hidden details

- Tap the little bird on the intro screen.
- Triple-tap the moon on the intro screen.
- Each pick shows one quip, and quips don't repeat within a night.

## How the night works (two phones)

1. **Your phone** runs the app from the Home Screen. When it's opened from the Home Screen icon, it starts on a **"Scan to start your night"** QR screen.
2. **Jess scans the QR code** with her iPhone camera. The night opens in Safari on her phone, and she makes all the choices there.
3. Her progress is saved on **her** phone, so she can lock it, switch apps or refresh without losing her place.

Host Mode edits (a hidden card, new text) are packed into the QR link. If you change something mid-date, open Host Mode → **Show Jess's QR code** and have her scan again. Her progress is kept.

Other ways to get to the QR screen: add `?qr` to the URL, or tap "or send her the link" to text it to her.

## Deploy to Netlify

**Option A: connect GitHub (recommended, redeploys on every push)**
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → GitHub.
2. Pick this repo and the branch the app is on.
3. Build settings come from `netlify.toml` (`npm run build`, publish `dist`). Click **Deploy**.
4. Optional: **Site configuration → Change site name**, e.g. `tonight-for-jess.netlify.app`.

**Option B: drag and drop**
```bash
npm install && npm run build
```
Then drag the `dist` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

**Option C: CLI**
```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

### Put it on your Home Screen
On your iPhone, open the Netlify URL in **Safari** → Share → **Add to Home Screen**. Opening it from that icon shows Jess's QR code first. "Preview on this phone" lets you click through the night yourself, and long-pressing the top-right corner opens Host Mode.

Before the date, go through the night once on your own phone, then use **Reset night** in Host Mode. Jess's phone starts fresh either way.

## Project layout

```
src/
  data/night.js         ← the plan (edit this)
  lib/share.js          ← QR link: packs Host Mode edits for Jess's phone
  theme.css             ← colors & fonts
  styles.css            ← layout & animation
  App.jsx               ← screen flow / state
  lib/storage.js        ← localStorage (progress + Host Mode edits)
  components/
    Intro.jsx  Chapter.jsx  Reveal.jsx  Finale.jsx
    Handoff.jsx (QR screen)  Progress.jsx  Sky.jsx  Toast.jsx  HostMode.jsx  icons.jsx
```
