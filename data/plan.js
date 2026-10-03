/**
 * ─────────────────────────────────────────────────────────────
 *  TONIGHT'S PLAN  (private: only the server reads this file)
 * ─────────────────────────────────────────────────────────────
 *
 *  Not bundled into the website, so Jess can't find the plans by
 *  poking at the page source. The server deals her face-down cards
 *  and only tells her what she flipped.
 *
 *  HOW A NIGHT RUNS
 *    1. OPENING  scripted beats (come inside, flowers). You tap NEXT.
 *    2. ROUNDS   the server picks a CATEGORY, deals 2–4 face-down cards
 *                (each a different real plan from that category), and
 *                Jess flips one. You get the full logistics instantly.
 *    3. You tap WE FINISHED THIS → the card goes in her scrapbook →
 *       "Generate next part?" YES / WAIT / CHOOSE CATEGORY MYSELF.
 *    4. FINISH NIGHT whenever → finale.
 *
 *  Edits made in the Control Room live with the night. "Reset night"
 *  reloads this file.
 *
 *  ⚠️  Hours/addresses marked "verify" are best guesses. Check them on
 *      the day. `closesAt` is used to hide places that are about to close
 *      (24h "HH:MM"; null = late / always / unknown → treated as open).
 */

const maps = (q) => `https://maps.apple.com/?q=${encodeURIComponent(q)}`;

export const settings = {
  her: "Jess",
  me: "Kyd",
  timeZone: "America/Chicago",
  yourCallChance: 0.15, // how often one card in a round is secretly "your call"
  homeCity: "TULSA", // home plans get less likely when you're in another city
  // Little endings for QUICK / SHORT dates (a short date is a complete date)
  shortEndings: ["okayyy that's all I got 😭", "successful side quest.", "we can go home now lol", "alright I think we did enough", "10/10 would hang again", "okay the app is clocking out"],
  // Used only if the HOST_PIN env var isn't set on Netlify.
  fallbackPin: "0630",
  finale: {
    title: "that's the night 🩷",
    note: "I'm really glad you came.",
    signature: "— Kyd",
  },
};

/** Scripted beats before the first card round. Kyd taps NEXT through them. */
export const opening = [
  {
    id: "welcome",
    eyebrow: "",
    animation: "door",
    title: "come inside 👀",
    body: "",
    button: "coming 👀",
    stamp: "The beginning",
    memory: "you showed up (best part)",
    hostNotes: "She just walked in. Flowers + basket are ready.",
  },
  {
    id: "surprise-1",
    eyebrow: "",
    animation: "gift",
    title: "put your phone down for a sec",
    body: "",
    button: "okay okay",
    stamp: "Surprise #1",
    memory: "flowers + a basket of your favorites",
    hostNotes: "Flowers + gift basket. Tap NEXT when she's done, then generate the first round.",
  },
];

/**
 * Categories. `label` is what Jess sees above the face-down cards.
 * group:  categories in the same group rarely follow each other.
 * weight: how often the engine reaches for it (1 = normal).
 */
export const categories = {
  FOOD: { label: "food", icon: "🍜", group: "food" },
  SWEET: { label: "something sweet", icon: "🍦", group: "sweet" },
  COFFEE: { label: "coffee / drinks", icon: "☕", group: "drink" },
  GAME: { label: "game time", icon: "🎮", group: "play" },
  HOME: { label: "movies / home", icon: "🛋️", group: "home" },
  OUTING: { label: "little outing", icon: "🚗", group: "out" },
  TALK: { label: "let's talk", icon: "💬", group: "talk", weight: 0.6 },
  CHALLENGE: { label: "little challenge", icon: "🎯", group: "play", weight: 0.8 },
  COZY: { label: "cozy ending", icon: "🌙", group: "home" },
};

/**
 * The card library: every plan that can end up under a face-down card.
 *
 *   revealMode  "full"   → Jess sees jessFull
 *               "hint"   → Jess sees jessHint
 *               "secret" → Jess sees "you'll see 👀"
 *   where       "out" | "home" | "either"  (staying home is NOT the boring option)
 *   meal: true  a real meal (only one per night unless you override)
 *   closesAt    "HH:MM" 24h, or null if late/unknown. Used to skip closing places.
 *
 * You always see everything. Anything marked "verify" is a guess. Check it.
 */
const plan = (o) => ({
  city: "ANY", // "TULSA" | "OKC" | "ANY" (works anywhere: chains, home, generic ideas)
  district: null, // used to keep stops close together
  where: "out",
  address: "",
  mapsLink: "",
  duration: 30,
  cost: "free",
  closesAt: null,
  revealMode: "full",
  hostNotes: "",
  caption: "",
  icon: "✦",
  backup: "",
  enabled: true,
  ...o,
});
const home = (o) => plan({ where: "home", place: "Home", address: "home", ...o });
const either = (o) => plan({ where: "either", place: "wherever we are", address: "", ...o });

export const plans = [
  // ── "Your call": can show up in any round. Jess sees "your call 👀". YOU pick based on her vibe.
  plan({ id: "your-call", category: "ANY", wildcard: true, where: "either", name: "YOUR CALL: you decide based on how she seems", place: "your call", jessFull: "your call 👀 (mine, actually)", hostNotes: "Read the room. Tap CHANGE PLAN and pick something. It stays secret until you reveal it.", caption: "your call", icon: "🃏" }),

  // ── FOOD ───────────────────────────────────────
  plan({ id: "lanna", city: "TULSA", category: "FOOD", meal: true, name: "Pad Thai at Lanna Thai", place: "Lanna Thai", address: "verify in Maps", mapsLink: maps("Lanna Thai Tulsa OK"), duration: 60, cost: "$$", closesAt: "21:00", revealMode: "hint", jessFull: "Pad Thai 🍜", jessHint: "food 👀", hostNotes: "Her Pad Thai. Closing time is a guess, check it.", caption: "Pad Thai: gone", icon: "🍜", backup: "velvet" }),
  plan({ id: "velvet", city: "TULSA", category: "FOOD", meal: true, name: "Velvet Taco", place: "Velvet Taco", address: "verify in Maps", mapsLink: maps("Velvet Taco Tulsa OK"), duration: 45, cost: "$", jessFull: "Velvet Taco 🌮", jessHint: "tacos 🌮", hostNotes: "Cauliflower taco for her.", caption: "cauliflower taco: gone", icon: "🌮", backup: "lanna" }),
  plan({ id: "cajun", city: "TULSA", category: "FOOD", meal: true, name: "Cajun Alfredo somewhere", place: "somewhere with Cajun Alfredo", mapsLink: maps("cajun alfredo Tulsa OK"), duration: 60, cost: "$$", revealMode: "hint", jessFull: "Cajun Alfredo 🍝", jessHint: "pasta 👀", hostNotes: "Pick the spot ahead of time (or cook it at home).", caption: "Cajun Alfredo", icon: "🍝", backup: "casual" }),
  plan({ id: "new-spot", category: "FOOD", meal: true, name: "A restaurant neither of us has tried", place: "somewhere new", mapsLink: maps("restaurants near me"), duration: 60, cost: "$$", revealMode: "secret", jessFull: "somewhere new 👀", hostNotes: "Have 2 options picked before the night.", caption: "first time there", icon: "📍", backup: "casual" }),
  plan({ id: "takeout-quiet", category: "FOOD", meal: true, name: "Takeout + eat somewhere quiet", place: "takeout spot + somewhere quiet", duration: 45, cost: "$", jessFull: "takeout somewhere quiet 🥡", hostNotes: "Grab food, park somewhere with a view, eat in the car.", caption: "car picnic", icon: "🥡", backup: "takeout-home" }),
  home({ id: "takeout-home", category: "FOOD", meal: true, name: "Grab food, bring it home", duration: 50, cost: "$", jessFull: "food, then home 🏠", hostNotes: "Pick it up on the way back.", caption: "takeout at home", icon: "🏠", backup: "takeout-quiet" }),
  plan({ id: "drive-thru", category: "FOOD", meal: true, name: "Drive-thru roulette", place: "2–3 drive-thrus", duration: 30, cost: "$", revealMode: "secret", jessFull: "drive-thru roulette 🎰", hostNotes: "Name 2–3 drive-thrus, she picks without knowing which is which.", caption: "drive-thru roulette", icon: "🎰", backup: "velvet" }),
  plan({ id: "comfort", category: "FOOD", meal: true, name: "Late-night comfort food", place: "whatever's open late (Waffle House, etc.)", mapsLink: maps("Waffle House near me"), duration: 40, cost: "$", jessFull: "comfort food 🧇", hostNotes: "Good late option.", caption: "comfort food", icon: "🧇", backup: "drive-thru" }),
  plan({ id: "casual", category: "FOOD", meal: true, name: "Simple casual dinner where we can talk", place: "somewhere casual + quiet", duration: 60, cost: "$$", revealMode: "hint", jessFull: "dinner. low key.", jessHint: "food 👀", hostNotes: "Somewhere not loud.", caption: "dinner + talking", icon: "🍽️", backup: "velvet" }),

  // ── SWEET ──────────────────────────────────────
  plan({ id: "braums", category: "SWEET", name: "Braum's", place: "Braum's (nearest)", address: "nearest Braum's", mapsLink: maps("Braum's near me"), duration: 20, cost: "$", closesAt: "22:30", jessFull: "Braum's 🍦", jessHint: "something sweet 👀", hostNotes: "She gets the thing she always gets. Hours: verify.", caption: "you demolished that btw", icon: "🍦", backup: "dessert-run" }),
  home({ id: "mm-sandwich", category: "SWEET", name: "M&M ice cream sandwiches at home", duration: 15, jessFull: "M&M ice cream sandwiches 🍪", hostNotes: "In the freezer?", caption: "ice cream sandwiches", icon: "🍪", backup: "braums" }),
  home({ id: "cnc-movie", category: "SWEET", name: "Hershey Cookies 'n' Creme + a movie", duration: 100, cost: "$", jessFull: "Cookies 'n' Creme + a movie 🍫", hostNotes: "Have the bars ready.", caption: "Cookies 'n' Creme", icon: "🍫", backup: "mm-sandwich" }),
  plan({ id: "dessert-run", category: "SWEET", name: "Random dessert run", place: "wherever's open", duration: 20, cost: "$", revealMode: "secret", jessFull: "dessert run 🍰", hostNotes: "Pick whatever's open nearby.", caption: "dessert run", icon: "🍰", backup: "braums" }),
  plan({ id: "snack-challenge", category: "SWEET", name: "Convenience store snack challenge", place: "QuikTrip (nearest)", mapsLink: maps("QuikTrip near me"), duration: 15, cost: "$", jessFull: "snack challenge 🛒", hostNotes: "Pick for each other.", caption: "snack challenge", icon: "🛒", backup: "scooby" }),
  plan({ id: "three-sweets", category: "SWEET", name: "Pick three random sweets for each other", place: "QuikTrip (nearest)", mapsLink: maps("QuikTrip near me"), duration: 15, cost: "$", jessFull: "pick me 3 sweets 🍬", hostNotes: "3 each, swap, rate.", caption: "3 sweets each", icon: "🍬", backup: "snack-challenge" }),
  plan({ id: "car-dessert", category: "SWEET", name: "Dessert + sit in the car talking", place: "dessert spot + the car", duration: 30, cost: "$", revealMode: "hint", jessFull: "dessert in the car 🚗", jessHint: "something sweet 👀", hostNotes: "Park somewhere with a view.", caption: "car dessert", icon: "🚗", backup: "braums" }),
  plan({ id: "ice-cream-drive", category: "SWEET", name: "Ice cream + drive around with music", place: "Braum's → drive", mapsLink: maps("Braum's near me"), duration: 30, cost: "$", closesAt: "22:30", jessFull: "ice cream + a drive 🍦", hostNotes: "She's on aux.", caption: "ice cream drive", icon: "🍦", backup: "dessert-run" }),
  plan({ id: "scooby", category: "SWEET", name: "Scooby-Doo gummies + something random", place: "QuikTrip / store", mapsLink: maps("QuikTrip near me"), duration: 15, cost: "$", jessFull: "Scooby snacks 🐶", hostNotes: "Plus one random thing.", caption: "Scooby snacks acquired", icon: "🐶", backup: "snack-challenge" }),

  // ── COFFEE / DRINKS ────────────────────────────
  plan({ id: "hodges", city: "TULSA", district: "Downtown", category: "COFFEE", name: "Dark coffee somewhere cozy", place: "Hodges Bend", address: "823 E 3rd St, Tulsa (verify)", mapsLink: maps("Hodges Bend Tulsa OK"), duration: 40, cost: "$", revealMode: "hint", jessFull: "dark coffee ☕", jessHint: "coffee", hostNotes: "Cozy, open late (verify).", caption: "dark roast", icon: "☕", backup: "coffee-talk" }),
  home({ id: "mushroom", category: "COFFEE", name: "Mushroom coffee at home", duration: 20, jessFull: "mushroom coffee 🍄", hostNotes: "", caption: "mushroom coffee", icon: "🍄", backup: "rate-drinks" }),
  plan({ id: "coffee-talk", city: "TULSA", district: "Brookside", category: "COFFEE", name: "Coffee + sit and talk", place: "Shades of Brown", address: "3301 S Peoria Ave, Tulsa (verify)", mapsLink: maps("Shades of Brown Coffee Tulsa"), duration: 40, cost: "$", closesAt: "22:00", jessFull: "coffee + talking ☕", hostNotes: "Check closing time.", caption: "coffee talk", icon: "☕", backup: "hodges" }),
  plan({ id: "seasonal", category: "COFFEE", name: "Try a random seasonal drink", place: "any coffee spot", mapsLink: maps("coffee near me"), duration: 20, cost: "$", closesAt: "21:00", jessFull: "seasonal drink roulette 🍂", hostNotes: "Order whatever's weirdest on the seasonal menu.", caption: "seasonal drink", icon: "🍂", backup: "drink-run" }),
  plan({ id: "alani-drive", category: "COFFEE", name: "Alani watermelon + drive around", place: "QuikTrip → drive", mapsLink: maps("QuikTrip near me"), duration: 25, cost: "$", jessFull: "Alani + a drive 🍉", hostNotes: "Watermelon.", caption: "Alani acquired", icon: "🍉", backup: "drink-run" }),
  plan({ id: "drink-run", category: "COFFEE", name: "Convenience store drink run", place: "QuikTrip (nearest)", mapsLink: maps("QuikTrip near me"), duration: 10, cost: "$", jessFull: "drink run 🥤", caption: "drink run", icon: "🥤", backup: "alani-drive" }),
  home({ id: "rate-drinks", category: "COFFEE", name: "Make drinks at home and rate them", duration: 25, jessFull: "we're making drinks. you're judging.", hostNotes: "Whatever's in the kitchen.", caption: "drinks, rated", icon: "🧃", backup: "taste-test" }),
  plan({ id: "coffee-dessert", category: "COFFEE", name: "Coffee + dessert combo", place: "coffee spot with dessert", mapsLink: maps("coffee dessert near me"), duration: 35, cost: "$$", revealMode: "hint", jessFull: "coffee + dessert ☕🍰", jessHint: "coffee", hostNotes: "", caption: "coffee + dessert", icon: "🍰", backup: "hodges" }),
  plan({ id: "cafe-stay", city: "TULSA", district: "Downtown", category: "COFFEE", name: "Quiet café, stay until we feel like leaving", place: "a quiet café (Topeca?)", mapsLink: maps("Topeca Coffee Tulsa"), duration: 60, cost: "$", closesAt: "21:00", revealMode: "secret", jessFull: "a quiet café. no rush.", hostNotes: "No clock on this one.", caption: "stayed a while", icon: "🫖", backup: "hodges" }),
  home({ id: "taste-test", category: "COFFEE", name: "Blind taste test at home", duration: 20, jessFull: "blind taste test 👀", hostNotes: "2–3 drinks, she guesses.", caption: "taste test", icon: "🥤", backup: "rate-drinks" }),

  // ── GAMING ─────────────────────────────────────
  home({ id: "mw3", category: "GAME", name: "COD MW3 together", duration: 45, jessFull: "MW3. carry me 🫡", hostNotes: "", caption: "you carried", icon: "🎮", backup: "coop" }),
  home({ id: "oculus-cook", category: "GAME", name: "Oculus cooking game", duration: 30, jessFull: "Oculus. you're head chef 🍳", hostNotes: "Charged?", caption: "head chef Jess", icon: "🍳", backup: "vr-turns" }),
  home({ id: "gta", category: "GAME", name: "GTA free-roam chaos", duration: 30, jessFull: "GTA chaos 🚗", caption: "GTA chaos", icon: "🚗", backup: "mw3" }),
  home({ id: "random-game", category: "GAME", name: "Random game for 30 min", duration: 30, jessFull: "random game, 30 min 🎲", hostNotes: "Pick something off the shelf blind.", caption: "random game", icon: "🎲", backup: "unknown-game" }),
  home({ id: "winner-dessert", category: "GAME", name: "Game: winner chooses dessert", duration: 30, jessFull: "winner picks dessert 🏆", hostNotes: "Then deal SWEET next.", caption: "winner picked dessert", icon: "🏆", backup: "mw3" }),
  home({ id: "loser-picks", category: "GAME", name: "Game: loser picks the next card", duration: 30, jessFull: "loser picks the next card 😭", hostNotes: "Whoever loses flips next round.", caption: "loser picked next", icon: "🃏", backup: "mw3" }),
  home({ id: "vr-turns", category: "GAME", name: "Take turns on a VR game", duration: 30, jessFull: "VR, taking turns 🥽", caption: "VR turns", icon: "🥽", backup: "oculus-cook" }),
  home({ id: "coop", category: "GAME", name: "Co-op game night", duration: 45, jessFull: "co-op 🎮", caption: "co-op", icon: "🎮", backup: "mw3" }),
  home({ id: "unknown-game", category: "GAME", name: "A game neither of us knows how to play", duration: 30, jessFull: "a game we're both bad at 😭", caption: "we were both bad", icon: "🕹️", backup: "random-game" }),
  home({ id: "game-snacks", category: "GAME", name: "Gaming + snack setup", duration: 45, jessFull: "games + snacks 🎮🍿", hostNotes: "Snacks out first.", caption: "games + snacks", icon: "🍿", backup: "mw3" }),
  plan({ id: "arcade", city: "TULSA", district: "Downtown", category: "GAME", name: "Arcade stop", place: "Max Retropub", address: "114 S Elgin Ave, Tulsa (verify)", mapsLink: maps("Max Retropub Tulsa OK"), duration: 45, cost: "$", jessFull: "arcade 🕹️", hostNotes: "21+, bring ID.", caption: "arcade", icon: "🕹️", backup: "mw3" }),

  // ── MOVIES / HOME ──────────────────────────────
  home({ id: "stay-home", category: "HOME", name: "STAY HOME: snacks + movie + chill", duration: 120, jessFull: "yeah we're not going anywhere 😭", hostNotes: "Snacks + movie + chill. That's the plan.", caption: "stayed home. correct.", icon: "🛋️", backup: "couch" }),
  home({ id: "couch", category: "HOME", name: "Plot twist: couch", duration: 60, jessFull: "plot twist: couch.", caption: "couch", icon: "🛋️", backup: "stay-home" }),
  home({ id: "nothing", category: "HOME", name: "Do absolutely nothing", duration: 45, jessFull: "congratulations, you picked doing absolutely nothing.", hostNotes: "Genuinely nothing. Hang out.", caption: "did nothing. loved it.", icon: "😌", backup: "couch" }),
  home({ id: "pursuit", category: "HOME", name: "The Pursuit of Happyness", duration: 120, revealMode: "hint", jessFull: "The Pursuit of Happyness 🎬", jessHint: "movie 🎬", caption: "Pursuit of Happyness", icon: "🎬", backup: "iron-giant" }),
  home({ id: "iron-giant", category: "HOME", name: "The Iron Giant", duration: 90, revealMode: "hint", jessFull: "The Iron Giant 🤖", jessHint: "movie 🎬", caption: "The Iron Giant", icon: "🤖", backup: "pursuit" }),
  home({ id: "whisper-man", category: "HOME", name: "A thriller (The Whisper Man, if it's on)", duration: 110, revealMode: "hint", jessFull: "thriller 👀", jessHint: "movie 🎬", hostNotes: "Check it's streaming somewhere first.", caption: "thriller night", icon: "🔪", backup: "pursuit" }),
  home({ id: "genre", category: "HOME", name: "App picks a genre, we pick the movie together", duration: 110, jessFull: "movie night 🎬", jessFullOptions: ["movie night. genre: thriller 🔪", "movie night. genre: comedy 😂", "movie night. genre: animated 🎨", "movie night. genre: action 💥", "movie night. genre: something from the 2000s 📼"], hostNotes: "Her card shows the genre. You two pick the movie.", caption: "movie night", icon: "🎬", backup: "stay-home" }),
  home({ id: "trailers", category: "HOME", name: "Terrible movie trailers, pick the funniest", duration: 30, jessFull: "worst trailers contest 😭", caption: "worst trailer award", icon: "🎞️", backup: "youtube" }),
  home({ id: "three-openings", category: "HOME", name: "First 15 min of 3 movies, vote on one", duration: 60, jessFull: "3 movies, 15 min each. we vote.", caption: "3 movies, 1 winner", icon: "🗳️", backup: "genre" }),
  home({ id: "rewatch", category: "HOME", name: "Rewatch something familiar", duration: 100, jessFull: "a rewatch 🎬", caption: "rewatch", icon: "🔁", backup: "stay-home" }),
  home({ id: "phones-away", category: "HOME", name: "Movie with phones put away", duration: 110, jessFull: "movie. phones away 📵", hostNotes: "This one includes your phone.", caption: "phones away", icon: "📵", backup: "stay-home" }),
  home({ id: "snack-tray", category: "HOME", name: "Ridiculous snack tray + something on", duration: 60, jessFull: "ridiculous snack tray 🧀", caption: "the snack tray", icon: "🧀", backup: "couch" }),
  home({ id: "youtube", category: "HOME", name: "Funny YouTube / old clips", duration: 40, jessFull: "funny videos 😭", caption: "funny videos", icon: "📺", backup: "trailers" }),
  home({ id: "talk-music", category: "HOME", name: "Stay in, music on, just talk", duration: 45, jessFull: "music on. just talking.", caption: "music + talking", icon: "🎶", backup: "couch" }),
  home({ id: "combo", category: "HOME", name: "Couch + snacks + gaming + movie", duration: 120, jessFull: "couch + snacks + games + a movie", caption: "the full combo", icon: "🛋️", backup: "stay-home" }),

  // ── LITTLE OUTINGS ─────────────────────────────
  plan({ id: "aimless-drive", category: "OUTING", name: "Drive around, no destination", place: "the car", duration: 25, jessFull: "we're just driving 🚗", caption: "no destination", icon: "🚗", backup: "song-drive" }),
  plan({ id: "scenic-drive", city: "TULSA", district: "Route 66", category: "OUTING", name: "Scenic drive + music (Route 66 neon)", place: "Route 66 / 11th St neon", address: "E 11th St (Route 66), Tulsa", mapsLink: maps("Meadow Gold Sign Tulsa"), duration: 25, revealMode: "secret", jessFull: "scenic drive ✨", hostNotes: "Slow down 11th St past the neon signs.", caption: "neon drive", icon: "✨", backup: "aimless-drive" }),
  plan({ id: "car-talk", category: "OUTING", name: "Somewhere quiet, sit in the car and talk", place: "a quiet spot", duration: 30, jessFull: "somewhere quiet to talk", caption: "car talk", icon: "🌃", backup: "view" }),
  plan({ id: "bookstore", city: "TULSA", district: "Downtown", category: "OUTING", name: "Browse a bookstore", place: "Magic City Books", address: "221 E Archer St, Tulsa", mapsLink: maps("Magic City Books Tulsa OK"), duration: 35, cost: "$", closesAt: "20:00", revealMode: "hint", jessFull: "bookstore 📚", jessHint: "somewhere quiet", hostNotes: "Closing time is a guess.", caption: "bookstore", icon: "📚", backup: "record-store" }),
  plan({ id: "record-store", city: "TULSA", category: "OUTING", name: "Browse a record store", place: "Starship Records & Tapes", address: "verify in Maps", mapsLink: maps("Starship Records Tulsa OK"), duration: 30, cost: "$", closesAt: "20:00", revealMode: "hint", jessFull: "record store 💿", jessHint: "somewhere quiet", hostNotes: "Hours are a guess, check.", caption: "record store", icon: "💿", backup: "bookstore" }),
  plan({ id: "store-funny", category: "OUTING", name: "Walk a store, pick something funny for each other", place: "Target (nearest)", mapsLink: maps("Target near me"), duration: 25, cost: "$", closesAt: "22:00", jessFull: "find me something funny 😭", caption: "funniest find", icon: "🛍️", backup: "budget-challenge" }),
  plan({ id: "budget-challenge", category: "OUTING", name: "Target/Walmart challenge, small budget", place: "Target / Walmart", mapsLink: maps("Target near me"), duration: 30, cost: "$", closesAt: "22:00", jessFull: "$10 Target challenge 🎯", caption: "$10 challenge", icon: "🎯", backup: "store-funny" }),
  plan({ id: "neighborhoods", city: "TULSA", district: "Brookside", category: "OUTING", name: "Look at neighborhoods / apartments for fun", place: "a nice neighborhood", duration: 25, revealMode: "hint", jessFull: "house hunting (fake) 🏡", jessHint: "a drive", hostNotes: "Maple Ridge / Brookside area streets.", caption: "fake house hunting", icon: "🏡", backup: "aimless-drive" }),
  plan({ id: "view", city: "TULSA", district: "Riverside", category: "OUTING", name: "Somewhere with a nice view, sit for a bit", place: "Gathering Place", address: "2650 S John Williams Way E, Tulsa", mapsLink: maps("Gathering Place Tulsa"), duration: 25, closesAt: "22:00", revealMode: "secret", jessFull: "a view 🌙", hostNotes: "Park close. Sit by the water, look for birds. No long walks.", caption: "the view", icon: "🌙", backup: "car-talk" }),
  plan({ id: "random-spot", city: "TULSA", district: "Downtown", category: "OUTING", name: "Somewhere random because the app said so", place: "Center of the Universe", address: "Boston Ave pedestrian bridge, downtown", mapsLink: maps("Center of the Universe Tulsa"), duration: 15, revealMode: "secret", jessFull: "somewhere weird. trust me 🌀", hostNotes: "Stand in the circle and talk. It echoes.", caption: "the echo", icon: "🌀", backup: "weird-spot" }),
  plan({ id: "weird-spot", city: "TULSA", district: "Route 66", category: "OUTING", name: "Weird Tulsa spot: Buck Atom space cowboy", place: "Buck Atom's Cosmic Curios", address: "1347 E 11th St, Tulsa (verify)", mapsLink: maps("Buck Atom's Cosmic Curios Tulsa"), duration: 10, revealMode: "secret", jessFull: "giant space cowboy 🚀", hostNotes: "Quick photo.", caption: "space cowboy", icon: "🚀", backup: "golden-driller" }),
  plan({ id: "golden-driller", city: "TULSA", district: "Midtown", category: "OUTING", name: "Golden Driller drive-by", place: "Golden Driller (Expo Square)", address: "21st St & Yale Ave, Tulsa", mapsLink: maps("Golden Driller Tulsa"), duration: 10, jessFull: "a very tall man 🗿", caption: "very tall man", icon: "🗿", backup: "weird-spot" }),
  plan({ id: "gas-snacks", category: "OUTING", name: "Gas station snack run, pick for each other", place: "QuikTrip (nearest)", mapsLink: maps("QuikTrip near me"), duration: 15, cost: "$", jessFull: "QT run. you pick mine.", caption: "QT picks", icon: "⛽", backup: "budget-challenge" }),
  plan({ id: "song-drive", category: "OUTING", name: "Drive and take turns picking songs", place: "the car", duration: 25, jessFull: "drive. we take turns on aux 🎶", caption: "aux battle", icon: "🎶", backup: "aimless-drive" }),
  plan({ id: "photo", category: "OUTING", name: "One spontaneous picture somewhere", place: "anywhere", duration: 10, jessFull: "one picture. somewhere random 📸", caption: "the picture", icon: "📸", backup: "golden-driller" }),

  // ── TALK (optional, never therapy) ─────────────
  either({ id: "random-q", category: "TALK", name: "Somewhere quiet + random questions", duration: 20, jessFull: "random questions 💬", caption: "random questions", icon: "💬", backup: "hypothetical" }),
  either({ id: "dont-know", category: "TALK", name: "\"Tell me something I don't know about you\"", duration: 15, jessFull: "tell me something I don't know about you", caption: "learned something", icon: "👀", backup: "random-q" }),
  either({ id: "childhood", category: "TALK", name: "Childhood favorites", duration: 15, jessFull: "childhood favorites", caption: "childhood favorites", icon: "🧸", backup: "random-q" }),
  either({ id: "dream-trips", category: "TALK", name: "Dream trips", duration: 15, jessFull: "dream trips ✈️", caption: "dream trips", icon: "✈️", backup: "no-money" }),
  either({ id: "no-money", category: "TALK", name: "If money didn't matter", duration: 15, jessFull: "if money didn't matter… 💸", caption: "if money didn't matter", icon: "💸", backup: "dream-trips" }),
  either({ id: "goals", category: "TALK", name: "Random future goals", duration: 15, jessFull: "random goals 🎯", caption: "goals", icon: "🎯", backup: "dream-trips" }),
  either({ id: "hypothetical", category: "TALK", name: "One funny hypothetical", duration: 10, jessFull: "one hypothetical. answer honestly 😭", hostNotes: "e.g. would you rather fight 1 horse-sized duck or 100 duck-sized horses", caption: "the hypothetical", icon: "🤔", backup: "two-scenarios" }),
  either({ id: "embarrassing", category: "TALK", name: "Embarrassing stories", duration: 15, jessFull: "embarrassing stories. I'll go first.", caption: "embarrassing stories", icon: "🙈", backup: "hypothetical" }),
  either({ id: "two-scenarios", category: "TALK", name: "Choose between two ridiculous scenarios", duration: 10, jessFull: "pick one. both are bad 😭", caption: "ridiculous choices", icon: "⚖️", backup: "hypothetical" }),
  either({ id: "secret-try", category: "TALK", name: "\"Something you secretly want to try?\"", duration: 15, jessFull: "something you secretly want to try?", caption: "secret wish list", icon: "🤫", backup: "dream-trips" }),
  plan({ id: "car-music-low", category: "TALK", where: "either", name: "Talk in the car, music low", place: "the car", duration: 20, jessFull: "music low. talking.", caption: "car talk", icon: "🚗", backup: "random-q" }),
  either({ id: "deeper", category: "TALK", name: "One deeper question (only if the vibe is right)", duration: 15, revealMode: "hint", jessFull: "one real question", jessHint: "a question 💬", hostNotes: "ONLY if the vibe feels right. Otherwise CHANGE PLAN.", caption: "a real one", icon: "🕯️", backup: "random-q" }),

  // ── LITTLE CHALLENGES ──────────────────────────
  either({ id: "pick-snack", category: "CHALLENGE", name: "Pick a snack for each other", duration: 10, cost: "$", jessFull: "pick my snack 👀", caption: "snack swap", icon: "🍿", backup: "pick-drink" }),
  either({ id: "pick-drink", category: "CHALLENGE", name: "Choose each other's drink", duration: 10, cost: "$", jessFull: "you pick my drink", caption: "drink swap", icon: "🥤", backup: "pick-snack" }),
  plan({ id: "ten-dollar", category: "CHALLENGE", name: "$10 convenience store challenge", place: "QuikTrip (nearest)", mapsLink: maps("QuikTrip near me"), duration: 15, cost: "$", jessFull: "$10 QT challenge 💸", caption: "$10 challenge", icon: "💸", backup: "pick-snack" }),
  plan({ id: "pink", category: "CHALLENGE", name: "Find something pink for Jess", place: "a store", mapsLink: maps("Target near me"), duration: 15, cost: "$", closesAt: "22:00", jessFull: "find something pink. I'm buying 🩷", caption: "something pink", icon: "🩷", backup: "weirdest" }),
  plan({ id: "weirdest", category: "CHALLENGE", name: "Find the weirdest thing in a store", place: "a store", mapsLink: maps("Target near me"), duration: 15, closesAt: "22:00", jessFull: "find the weirdest thing in here", caption: "weirdest find", icon: "🦆", backup: "pink" }),
  either({ id: "guess", category: "CHALLENGE", name: "Guess what the other would choose", duration: 10, jessFull: "guess what I'd pick 👀", caption: "guessing game", icon: "🔮", backup: "rate-snacks" }),
  either({ id: "rps", category: "CHALLENGE", name: "Rock-paper-scissors decides between two activities", duration: 5, revealMode: "hint", jessFull: "rock paper scissors decides ✊", jessHint: "a decision. not by me.", hostNotes: "Name two things; winner picks.", caption: "RPS decided", icon: "✊", backup: "guess" }),
  either({ id: "winner-flips", category: "CHALLENGE", name: "Quick game: winner flips the next card", duration: 10, jessFull: "winner flips the next card", caption: "winner flipped", icon: "🏆", backup: "rps" }),
  either({ id: "veto", category: "CHALLENGE", name: "One veto each for the night", duration: 2, jessFull: "you get one veto tonight. use it wisely 👀", hostNotes: "Rule card: then deal the next round right away.", caption: "veto acquired", icon: "🛑", backup: "rps" }),
  either({ id: "polaroid", category: "CHALLENGE", name: "One random photo for the scrapbook", duration: 5, jessFull: "one picture 📸", caption: "the picture", icon: "📸", backup: "guess" }),
  either({ id: "rate-snacks", category: "CHALLENGE", name: "Rate random snacks 1–10", duration: 15, cost: "$", jessFull: "snack ratings, 1–10", caption: "snacks, rated", icon: "🔟", backup: "pick-snack" }),
  either({ id: "tier-list", category: "CHALLENGE", name: "Ridiculous tier list of something", duration: 15, jessFull: "tier list time 😭", hostNotes: "Fast food fries, cartoon dogs, Halloween candy…", caption: "the tier list", icon: "📊", backup: "rate-snacks" }),
  either({ id: "three-songs", category: "CHALLENGE", name: "Pick three songs for each other", duration: 15, jessFull: "3 songs for me. go.", caption: "3 songs each", icon: "🎵", backup: "guess" }),

  // ── COZY ENDINGS ───────────────────────────────
  home({ id: "end-movie", category: "COZY", name: "Movie at home", duration: 110, jessFull: "movie at home 🎬", caption: "movie", icon: "🎬", backup: "end-nothing" }),
  home({ id: "end-games", category: "COZY", name: "Gaming at home", duration: 60, jessFull: "games at home 🎮", caption: "games", icon: "🎮", backup: "end-cod" }),
  home({ id: "end-snacks-talk", category: "COZY", name: "Snacks + talking", duration: 45, jessFull: "snacks + talking", caption: "snacks + talking", icon: "🍿", backup: "end-nothing" }),
  home({ id: "end-icecream", category: "COZY", name: "Ice cream at home", duration: 20, jessFull: "ice cream at home 🍦", caption: "ice cream", icon: "🍦", backup: "end-snacks-talk" }),
  home({ id: "end-music", category: "COZY", name: "Sit and listen to music", duration: 30, jessFull: "music 🎶", caption: "music", icon: "🎶", backup: "end-nothing" }),
  home({ id: "end-videos", category: "COZY", name: "Funny videos together", duration: 30, jessFull: "funny videos 😭", caption: "funny videos", icon: "📺", backup: "end-tv" }),
  home({ id: "end-oculus", category: "COZY", name: "Oculus", duration: 40, jessFull: "Oculus 🥽", caption: "Oculus", icon: "🥽", backup: "end-games" }),
  home({ id: "end-cod", category: "COZY", name: "COD", duration: 45, jessFull: "COD 🎮", caption: "COD", icon: "🎮", backup: "end-games" }),
  home({ id: "end-tv", category: "COZY", name: "Something random on TV, just relax", duration: 45, jessFull: "something on TV. we relax.", caption: "TV + relaxing", icon: "📺", backup: "end-nothing" }),
  home({ id: "end-order-in", category: "COZY", meal: true, name: "Order food and stay in", duration: 60, cost: "$$", jessFull: "we're ordering in 🛵", caption: "ordered in", icon: "🛵", backup: "end-snacks-talk" }),
  home({ id: "end-spread", category: "COZY", name: "Little snack spread", duration: 45, jessFull: "snack spread 🧀", caption: "snack spread", icon: "🧀", backup: "end-snacks-talk" }),
  home({ id: "end-coffee", category: "COZY", name: "Make coffee and talk", duration: 40, jessFull: "coffee + talking ☕", caption: "coffee + talking", icon: "☕", backup: "end-snacks-talk" }),
  home({ id: "end-nothing", category: "COZY", name: "Do nothing at all, just hang out", duration: 60, jessFull: "nothing. just hanging out.", caption: "just hung out", icon: "😌", backup: "end-tv" }),

  // ═════════════════ OKLAHOMA CITY ═════════════════
  // Districts: "Plaza", "Midtown", "Downtown", "Automobile Alley". Stops in the
  // same district get dealt together, especially in QUICK mode.
  // Addresses/hours marked "verify" are guesses. Check them on the day.

  // ── OKC FOOD ───────────────────────────────────
  plan({ id: "okc-four-js", city: "OKC", category: "FOOD", meal: true, name: "Four J's Lao & Thai", place: "Four J's Lao & Thai", address: "verify in Maps", mapsLink: maps("Four J's Lao Thai Oklahoma City"), duration: 45, cost: "$", revealMode: "hint", jessFull: "Pad Thai 🍜", jessHint: "food 👀", hostNotes: "She likes Pad Thai. Casual, quick, does takeout.", caption: "OKC Pad Thai", icon: "🍜", backup: "okc-empire" }),
  plan({ id: "okc-empire", city: "OKC", district: "Plaza", category: "FOOD", meal: true, name: "Empire Slice House (Plaza)", place: "Empire Slice House", address: "1734 NW 16th St, OKC (verify)", mapsLink: maps("Empire Slice House Plaza District Oklahoma City"), duration: 35, cost: "$", jessFull: "pizza by the slice 🍕", jessHint: "food 👀", hostNotes: "Quick, fun, by the slice. Dessert nearby in the Plaza.", caption: "Empire slice", icon: "🍕", backup: "okc-collective" }),
  plan({ id: "okc-collective", city: "OKC", district: "Midtown", category: "FOOD", meal: true, name: "The Collective Kitchens & Cocktails", place: "The Collective", address: "308 NW 10th St, OKC (verify)", mapsLink: maps("The Collective Kitchens and Cocktails Oklahoma City"), duration: 50, cost: "$$", revealMode: "secret", jessFull: "food hall. pick anything.", hostNotes: "Lots of kitchens. Perfect when we can't decide.", caption: "the Collective", icon: "🍽️", backup: "okc-empire" }),
  plan({ id: "okc-parlor", city: "OKC", district: "Automobile Alley", category: "FOOD", meal: true, name: "Parlor food hall", place: "Parlor OKC", address: "verify in Maps", mapsLink: maps("Parlor food hall Oklahoma City"), duration: 50, cost: "$$", revealMode: "secret", jessFull: "food hall 🍴", hostNotes: "Food hall in Automobile Alley.", caption: "Parlor", icon: "🍴", backup: "okc-collective" }),
  plan({ id: "okc-pizza", city: "OKC", category: "FOOD", meal: true, name: "Random pizza spot", place: "pizza nearby", mapsLink: maps("pizza near me"), duration: 40, cost: "$", revealMode: "secret", jessFull: "pizza 🍕", caption: "pizza", icon: "🍕", backup: "okc-tacos" }),
  plan({ id: "okc-tacos", city: "OKC", category: "FOOD", meal: true, name: "Quick tacos", place: "tacos nearby", mapsLink: maps("tacos near me"), duration: 30, cost: "$", jessFull: "tacos 🌮", caption: "tacos", icon: "🌮", backup: "okc-pizza" }),
  plan({ id: "okc-pasta", city: "OKC", category: "FOOD", meal: true, name: "Casual pasta", place: "casual Italian nearby", mapsLink: maps("casual italian near me"), duration: 50, cost: "$$", revealMode: "hint", jessFull: "pasta 🍝", jessHint: "food 👀", caption: "pasta", icon: "🍝", backup: "okc-pizza" }),
  plan({ id: "okc-comfort", city: "OKC", category: "FOOD", meal: true, name: "Comfort food", place: "comfort food nearby", mapsLink: maps("comfort food near me"), duration: 40, cost: "$", jessFull: "comfort food 🧇", caption: "comfort food", icon: "🧇", backup: "okc-tacos" }),
  plan({ id: "okc-takeout-car", city: "OKC", category: "FOOD", meal: true, name: "Takeout + music in the car", place: "takeout → the car", duration: 30, cost: "$", jessFull: "takeout + music in the car 🥡", caption: "car takeout", icon: "🥡", backup: "okc-tacos" }),
  plan({ id: "okc-never-eaten", city: "OKC", category: "FOOD", meal: true, name: "Somewhere we've never eaten", place: "somewhere new", mapsLink: maps("restaurants near me"), duration: 45, cost: "$$", revealMode: "secret", jessFull: "somewhere new 👀", hostNotes: "Pick the closest place neither of us knows.", caption: "first time there", icon: "📍", backup: "okc-tacos" }),
  plan({ id: "okc-one-slice", city: "OKC", district: "Plaza", category: "FOOD", meal: true, name: "One slice of pizza and keep moving", place: "Empire Slice House", address: "1734 NW 16th St, OKC (verify)", mapsLink: maps("Empire Slice House Oklahoma City"), duration: 15, cost: "$", jessFull: "one slice. keep moving 🍕", caption: "one slice", icon: "🍕", backup: "okc-tacos" }),

  // ── OKC SWEET ──────────────────────────────────
  plan({ id: "okc-perets", city: "OKC", category: "SWEET", name: "Perets Dessert & Coffee Bar", place: "Perets Dessert & Coffee Bar", address: "verify in Maps", mapsLink: maps("Perets Dessert Coffee Bar Oklahoma City"), duration: 40, cost: "$$", closesAt: "22:00", revealMode: "hint", jessFull: "dessert + coffee ☕🍰", jessHint: "something sweet 👀", hostNotes: "Sweets AND dark coffee. Good for sitting and talking. Hours: verify.", caption: "Perets", icon: "🍰", backup: "okc-boomtown" }),
  plan({ id: "okc-boomtown", city: "OKC", category: "SWEET", name: "Boom Town Creamery", place: "Boom Town Creamery", address: "verify in Maps", mapsLink: maps("Boom Town Creamery Oklahoma City"), duration: 20, cost: "$", jessFull: "ice cream 🍦", jessHint: "something sweet 👀", hostNotes: "Quick ice cream stop.", caption: "Boom Town", icon: "🍦", backup: "okc-roxys" }),
  plan({ id: "okc-roxys", city: "OKC", district: "Plaza", category: "SWEET", name: "Roxy's Ice Cream Social (Plaza)", place: "Roxy's Ice Cream Social", address: "Plaza District (verify)", mapsLink: maps("Roxy's Ice Cream Social Oklahoma City"), duration: 20, cost: "$", jessFull: "ice cream 🍦", jessHint: "something sweet 👀", hostNotes: "Plaza District, walkable from Empire.", caption: "Roxy's", icon: "🍦", backup: "okc-boomtown" }),
  plan({ id: "okc-cookies", city: "OKC", category: "SWEET", name: "Cookie run", place: "cookies nearby", mapsLink: maps("cookies near me"), duration: 15, cost: "$", jessFull: "cookies 🍪", caption: "cookies", icon: "🍪", backup: "okc-boomtown" }),
  plan({ id: "okc-bakery", city: "OKC", category: "SWEET", name: "Find a random bakery", place: "a bakery nearby", mapsLink: maps("bakery near me"), duration: 20, cost: "$", closesAt: "19:00", revealMode: "secret", jessFull: "a random bakery 🥐", caption: "bakery", icon: "🥐", backup: "okc-cookies" }),
  plan({ id: "okc-grab-sweet", city: "OKC", category: "SWEET", name: "Grab something sweet", place: "wherever's closest", duration: 10, cost: "$", jessFull: "grab something sweet 🍬", caption: "something sweet", icon: "🍬", backup: "okc-cookies" }),

  // ── OKC COFFEE ─────────────────────────────────
  plan({ id: "okc-perets-coffee", city: "OKC", category: "COFFEE", name: "Coffee (and dessert) at Perets", place: "Perets Dessert & Coffee Bar", address: "verify in Maps", mapsLink: maps("Perets Dessert Coffee Bar Oklahoma City"), duration: 40, cost: "$$", closesAt: "22:00", revealMode: "hint", jessFull: "coffee + dessert ☕", jessHint: "coffee", hostNotes: "Dark coffee + sweets.", caption: "Perets", icon: "☕", backup: "okc-elemental" }),
  plan({ id: "okc-elemental", city: "OKC", district: "Automobile Alley", category: "COFFEE", name: "Elemental Coffee", place: "Elemental Coffee", address: "815 N Hudson Ave, OKC (verify)", mapsLink: maps("Elemental Coffee Oklahoma City"), duration: 30, cost: "$", closesAt: "17:00", jessFull: "coffee ☕", jessHint: "coffee", hostNotes: "Daytime spot. Hours are a guess.", caption: "Elemental", icon: "☕", backup: "okc-clarity" }),
  plan({ id: "okc-clarity", city: "OKC", district: "Downtown", category: "COFFEE", name: "Clarity Coffee", place: "Clarity Coffee", address: "verify in Maps", mapsLink: maps("Clarity Coffee Oklahoma City"), duration: 30, cost: "$", closesAt: "17:00", jessFull: "coffee ☕", jessHint: "coffee", hostNotes: "Daytime spot. Hours are a guess.", caption: "Clarity", icon: "☕", backup: "okc-elemental" }),
  plan({ id: "okc-coffee-talk", city: "OKC", category: "COFFEE", name: "Coffee and talk", place: "closest good coffee", mapsLink: maps("coffee near me"), duration: 30, cost: "$", jessFull: "coffee + talking ☕", caption: "coffee talk", icon: "☕", backup: "okc-perets-coffee" }),

  // ── OKC FUN / GAMES ────────────────────────────
  plan({ id: "okc-mixtape", city: "OKC", category: "OUTING", name: "Factory Obscura: Mix-Tape", place: "Factory Obscura Mix-Tape", address: "verify in Maps", mapsLink: maps("Factory Obscura Mix-Tape Oklahoma City"), duration: 60, cost: "$$", closesAt: "20:00", walking: "some", revealMode: "secret", jessFull: "something weird + colorful 🌈", hostNotes: "Interactive art. Medium activity, 45–75 min. Check hours + tickets before going.", caption: "Mix-Tape", icon: "🌈", backup: "okc-cactus" }),
  plan({ id: "okc-cactus", city: "OKC", category: "GAME", name: "Cactus Jack's Family Fun Center", place: "Cactus Jack's", address: "verify in Maps", mapsLink: maps("Cactus Jack's Family Fun Center Oklahoma City"), duration: 30, cost: "$", revealMode: "hint", jessFull: "arcade 🕹️", jessHint: "games 🎮", hostNotes: "Arcade + pinball. No minimum stay.", caption: "Cactus Jack's", icon: "🕹️", backup: "okc-arcade-20" }),
  plan({ id: "okc-arcade-20", city: "OKC", category: "GAME", name: "Arcade for 20 minutes", place: "nearest arcade", mapsLink: maps("arcade near me"), duration: 20, cost: "$", jessFull: "arcade. 20 minutes. go 🕹️", caption: "20 min arcade", icon: "🕹️", backup: "okc-cactus" }),
  plan({ id: "okc-pretty-drive", city: "OKC", category: "OUTING", name: "Drive somewhere pretty", place: "somewhere pretty (Scissortail Park / Bricktown lights)", mapsLink: maps("Scissortail Park Oklahoma City"), duration: 20, revealMode: "secret", jessFull: "somewhere pretty ✨", caption: "the pretty drive", icon: "✨", backup: "okc-sit-talk" }),
  either({ id: "okc-sit-talk", city: "OKC", category: "TALK", name: "Sit somewhere and talk", duration: 20, jessFull: "sit + talk 💬", caption: "sat + talked", icon: "💬", backup: "okc-pretty-drive" }),
  either({ id: "okc-nothing-20", city: "OKC", category: "HOME", name: "Do absolutely nothing for 20 minutes", duration: 20, jessFull: "do absolutely nothing for 20 minutes 😭", caption: "did nothing. elite.", icon: "😌", backup: "okc-sit-talk" }),
];

/** "not feeling this?" options → which categories to suggest to you. */
export const moods = {
  surprise: { label: "Just surprise me", emoji: "🩷", categories: [] },
  feed: { label: "Feed me", emoji: "🍜", categories: ["FOOD"] },
  fun: { label: "Something fun", emoji: "🎮", categories: ["GAME", "CHALLENGE", "OUTING"] },
  chill: { label: "Something chill", emoji: "☕", categories: ["COFFEE", "TALK", "HOME"] },
  sweet: { label: "Something sweet", emoji: "🍦", categories: ["SWEET"] },
  cozy: { label: "Can we just be cozy?", emoji: "🏠", categories: ["HOME", "COZY"] },
};

/**
 * All the little lines. Edit freely. These are you talking.
 *
 * Tone: mostly playful (~60%), sometimes sweet (~25%), rarely flirty (~15%).
 * No pet names, no relationship labels. Reaction GIFs live in
 * src/data/reactionLibrary.js, not here.
 */
export const copy = {
  // Above the face-down cards
  roundIntros: [
    "pick a card. any card.",
    "choose wisely 👀",
    "trust your gut",
    "eeny meeny…",
    "don't overthink it lol",
  ],
  // Top line when a card flips: playful, every time
  revealLines: [
    "okayyy next stop 👀",
    "alright let's go lol",
    "you picked it, don't look at me 😭",
    "interesting choice...",
    "this one might actually be good",
    "okay I was hoping you'd pick this one",
    "yeahhh trust me",
    "plot twist",
    "come on, we got places to be",
    "don't worry about it 👀",
    "okay this one is kinda cute ngl",
    "not telling you yet",
    "just trust the process",
    "don't blame me, you picked the card",
    "you got it big dawg 🫡",
    "be so fr 😭",
    "I know that's right",
    "well!",
    "noted 📝",
    "okayyyy 👀",
  ],
  // Occasional extra line under a reveal. Sweet: ~18% of reveals.
  sweet: [
    "I'm glad you're here.",
    "I thought you'd like this one.",
    "this reminded me of you.",
    "okay yeah, I picked this one with you in mind.",
    "hope you're having fun :)",
  ],
  // Light flirting, rarely: ~10% of reveals.
  flirty: [
    "you look nice btw. anyway...",
    "okay don't get distracted 😭",
    "not you making this difficult",
    "alright, I'm not giving you another hint",
    "you're kinda good at this",
  ],
  // Scrapbook captions when a plan has none
  captions: ["10/10 would pick again", "certified good pick", "you did that 🫡", "core memory (probably)", "we're not talking about it", "elite choice ngl"],
  // Playful card faces. Never clues: shuffled every round.
  faces: [
    { icon: "🐦", text: "" },
    { icon: "✦", text: "" },
    { icon: "☺︎", text: "" },
    { icon: "", text: "pick me" },
    { icon: "", text: "don't pick me" },
    { icon: "👀", text: "" },
    { icon: "♡", text: "" },
    { icon: "", text: "this one?" },
    { icon: "🍀", text: "" },
    { icon: "", text: "?" },
    { icon: "🎲", text: "" },
    { icon: "", text: "trust me" },
  ],
};
