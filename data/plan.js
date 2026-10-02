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
  // Used only if the HOST_PIN env var isn't set on Netlify.
  fallbackPin: "0630",
  finale: {
    title: "That's the night.",
    note: "Thanks for letting me run the whole night. I'm really glad you came. You picked well. Mostly. 😭",
    signature: "— Kyd",
  },
};

/** Scripted beats before the first card round. Kyd taps NEXT through them. */
export const opening = [
  {
    id: "welcome",
    eyebrow: "Chapter 0",
    animation: "door",
    title: "Come inside.",
    body: "There's something here for you.",
    button: "coming 👀",
    stamp: "The beginning",
    memory: "you showed up (best part)",
    hostNotes: "She just walked in. Flowers + basket are ready.",
  },
  {
    id: "surprise-1",
    eyebrow: "Surprise #1",
    animation: "gift",
    title: "Okay. Put the phone down.",
    body: "This part isn't on your phone.",
    button: "okay okay",
    stamp: "Surprise #1",
    memory: "flowers + a basket of your favorites",
    hostNotes: "Flowers + gift basket. Tap NEXT when she's done, then generate the first round.",
  },
];

/**
 * Categories. `label` is what Jess sees above the face-down cards.
 * group: categories in the same group won't follow each other.
 */
export const categories = {
  FOOD: { label: "food. obviously.", icon: "🍜", group: "food" },
  FUN: { label: "something fun", icon: "🎉", group: "play" },
  GAME: { label: "game time", icon: "🎮", group: "play" },
  CHILL: { label: "something chill", icon: "☕", group: "chill" },
  COZY: { label: "talk / cozy", icon: "🕯️", group: "chill" },
  SWEET: { label: "something sweet", icon: "🍦", group: "sweet" },
  RANDOM: { label: "something random", icon: "🎲", group: "random" },
  QUICK: { label: "quick stop", icon: "⚡", group: "quick" },
  ADVENTURE: { label: "little adventure", icon: "🗺️", group: "random" },
  HOME: { label: "home stretch", icon: "🏠", group: "home" },
};

/**
 * The card library. Each plan can end up under a face-down card.
 *
 *   revealMode  "full"   → Jess sees jessFull ("Braum's run 🍦")
 *               "hint"   → Jess sees jessHint ("we're getting something sweet 👀")
 *               "secret" → Jess sees "Kyd knows where we're going. get up."
 *   You always see everything. You can upgrade any reveal to full later.
 *
 *   meal: true marks a real meal (only one per night unless you override).
 */
export const plans = [
  // ── FOOD ───────────────────────────────────────
  { id: "lanna", category: "FOOD", meal: true, name: "Pad Thai at Lanna Thai", place: "Lanna Thai", address: "verify in Maps", mapsLink: maps("Lanna Thai Tulsa OK"), duration: 60, cost: "$$", closesAt: "21:00", revealMode: "hint", jessFull: "Pad Thai. obviously. 🍜", jessHint: "we're getting food. good food. 👀", hostNotes: "She gets the Pad Thai. Booth if possible.", caption: "Pad Thai: demolished", icon: "🍜", backup: "velvet", enabled: true },
  { id: "velvet", category: "FOOD", meal: true, name: "Velvet Taco", place: "Velvet Taco", address: "verify in Maps", mapsLink: maps("Velvet Taco Tulsa OK"), duration: 45, cost: "$", closesAt: null, revealMode: "full", jessFull: "Velvet Taco 🌮", jessHint: "tacos are involved. that's all you get.", hostNotes: "Get her a cauliflower taco. Order too many, split everything.", caption: "the cauliflower taco never stood a chance", icon: "🌮", backup: "mother-road", enabled: true },
  { id: "mother-road", category: "FOOD", meal: true, name: "Mother Road Market food hall", place: "Mother Road Market", address: "1124 S Lewis Ave, Tulsa", mapsLink: maps("Mother Road Market Tulsa OK"), duration: 60, cost: "$$", closesAt: "21:00", revealMode: "hint", jessFull: "Mother Road Market 🛣️", jessHint: "food hall energy. you pick, I pay.", hostNotes: "Wander separately, meet at a table. Check the closing time.", caption: "we ate our way down Route 66", icon: "🛣️", backup: "velvet", enabled: true },
  { id: "alfredo", category: "FOOD", meal: true, name: "Cajun Alfredo at home", place: "Home", address: "home", mapsLink: "", duration: 60, cost: "$", closesAt: null, revealMode: "secret", jessFull: "chicken & sausage Cajun Alfredo 🍝", jessHint: "dinner is handled. sit down.", hostNotes: "Ingredients ready? She sits, you cook.", caption: "chef Kyd fed you (be nice)", icon: "🍝", backup: "velvet", enabled: true },

  // ── FUN ────────────────────────────────────────
  { id: "thrift", category: "FUN", name: "$10 thrift challenge", place: "Goodwill (nearest)", address: "nearest Goodwill", mapsLink: maps("Goodwill Tulsa OK"), duration: 40, cost: "$", closesAt: "21:00", revealMode: "full", jessFull: "$10 thrift challenge. you pick my fit, I pick yours 👀", jessHint: "we're shopping. sort of.", hostNotes: "$10 limit each. Whoever's fit is worse buys dessert.", caption: "the fits were… a choice", icon: "🧥", backup: "target-gift", enabled: true },
  { id: "target-gift", category: "FUN", name: "Target: $10 surprise for each other", place: "Target (nearest)", address: "nearest Target", mapsLink: maps("Target Tulsa OK"), duration: 30, cost: "$", closesAt: "22:00", revealMode: "hint", jessFull: "Target run: $10 surprise for each other 🎯", jessHint: "we're going somewhere with carts. that's it.", hostNotes: "Split up, $10 each, meet at the front, swap.", caption: "best $10 ever spent (I think)", icon: "🎯", backup: "thrift", enabled: true },
  { id: "dust-bowl", category: "FUN", name: "Retro bowling at Dust Bowl Lanes", place: "Dust Bowl Lanes & Lounge", address: "211 S Elgin Ave, Tulsa (verify)", mapsLink: maps("Dust Bowl Lanes Tulsa OK"), duration: 60, cost: "$$", closesAt: null, revealMode: "secret", jessFull: "lazy bowling at Dust Bowl 🎳", jessHint: "something fun. low effort. promise.", hostNotes: "One game max. Gutter balls encouraged.", caption: "gutter balls were allowed and used", icon: "🎳", backup: "max", enabled: true },

  // ── GAME ───────────────────────────────────────
  { id: "max", category: "GAME", name: "Arcade at Max Retropub", place: "Max Retropub", address: "114 S Elgin Ave, Tulsa (verify)", mapsLink: maps("Max Retropub Tulsa OK"), duration: 60, cost: "$", closesAt: null, revealMode: "hint", jessFull: "arcade night at Max 🕹️", jessHint: "bring your gamer energy 🎮", hostNotes: "21+ (bring ID). Cabinets + pinball.", caption: "the trash talk was elite", icon: "🕹️", backup: "claw", enabled: true },
  { id: "claw", category: "GAME", name: "Claw machine mission", place: "Any arcade / store with claw machines", address: "nearest arcade", mapsLink: maps("arcade Tulsa OK"), duration: 20, cost: "$", closesAt: null, revealMode: "full", jessFull: "claw machine mission. I'm winning you something (eventually) 🧸", jessHint: "it's a game. you'll see.", hostNotes: "$10 budget. Don't rage.", caption: "the claw was rigged. we know.", icon: "🧸", backup: "max", enabled: true },
  { id: "mw3", category: "GAME", name: "MW3 duos at home", place: "Home", address: "home", mapsLink: "", duration: 45, cost: "free", closesAt: null, revealMode: "full", jessFull: "MW3 duos. carry me 🫡", jessHint: "game night energy.", hostNotes: "Snacks + Alani nearby.", caption: "you carried. I watched.", icon: "🎮", backup: "max", enabled: true },

  // ── CHILL ──────────────────────────────────────
  { id: "hodges", category: "CHILL", name: "Coffee at Hodges Bend", place: "Hodges Bend", address: "823 E 3rd St, Tulsa (verify)", mapsLink: maps("Hodges Bend Tulsa OK"), duration: 40, cost: "$", closesAt: null, revealMode: "hint", jessFull: "Hodges Bend. dark roast, no notes ☕", jessHint: "coffee is involved. dark, like your soul (jk)", hostNotes: "Cozy, open late. Get a corner.", caption: "dark roast, no notes", icon: "☕", backup: "shades", enabled: true },
  { id: "shades", category: "CHILL", name: "Coffee at Shades of Brown", place: "Shades of Brown", address: "3301 S Peoria Ave, Tulsa (verify)", mapsLink: maps("Shades of Brown Coffee Tulsa"), duration: 40, cost: "$", closesAt: "22:00", revealMode: "full", jessFull: "coffee in Brookside ☕", jessHint: "somewhere chill. caffeine likely.", hostNotes: "Check closing time.", caption: "certified chill", icon: "☕", backup: "hodges", enabled: true },
  { id: "gathering", category: "CHILL", name: "Bench by the water at Gathering Place", place: "Gathering Place", address: "2650 S John Williams Way E, Tulsa", mapsLink: maps("Gathering Place Tulsa"), duration: 30, cost: "free", closesAt: "22:00", revealMode: "secret", jessFull: "Gathering Place, by the water 🦆", jessHint: "somewhere outside. not a hike. relax.", hostNotes: "Park close. Sit, talk, look for birds. No long walks.", caption: "counted birds. lost count.", icon: "🦆", backup: "hodges", enabled: true },

  // ── COZY / TALK ────────────────────────────────
  { id: "books", category: "COZY", name: "Magic City Books: pick a book for each other", place: "Magic City Books", address: "221 E Archer St, Tulsa", mapsLink: maps("Magic City Books Tulsa OK"), duration: 40, cost: "$", closesAt: "20:00", revealMode: "hint", jessFull: "bookstore. you pick mine, I pick yours 📚", jessHint: "somewhere quiet. bring opinions.", hostNotes: "$15 limit each. Check closing time.", caption: "you have taste, I'll admit it", icon: "📚", backup: "drive-talk", enabled: true },
  { id: "circle", category: "COZY", name: "Movie at Circle Cinema", place: "Circle Cinema", address: "10 S Lewis Ave, Tulsa", mapsLink: maps("Circle Cinema Tulsa OK"), duration: 120, cost: "$$", closesAt: null, revealMode: "secret", jessFull: "a movie at Circle Cinema 🎬", jessHint: "big screen. small blanket energy.", hostNotes: "Check showtimes before leaving.", caption: "popcorn: gone. armrest: yours.", icon: "🎬", backup: "drive-talk", enabled: true },
  { id: "drive-talk", category: "COZY", name: "Night drive + her playlist + random questions", place: "The car", address: "anywhere", mapsLink: "", duration: 30, cost: "free", closesAt: null, revealMode: "full", jessFull: "night drive. you're on aux. I ask questions 🚗", jessHint: "we're just gonna talk. scary, I know.", hostNotes: "Questions ready: best day this year, dream trip, worst job, a song that's 'her'.", caption: "you were on aux. it was a vibe.", icon: "🚗", backup: "books", enabled: true },

  // ── SWEET ──────────────────────────────────────
  { id: "braums", category: "SWEET", name: "Braum's run", place: "Braum's (nearest)", address: "nearest Braum's", mapsLink: maps("Braum's Tulsa OK"), duration: 20, cost: "$", closesAt: "22:30", revealMode: "full", jessFull: "Braum's run 🍦", jessHint: "we're getting something sweet 👀", hostNotes: "She gets the thing she always gets.", caption: "you demolished that btw", icon: "🍦", backup: "qt-candy", enabled: true },
  { id: "qt-candy", category: "SWEET", name: "QT candy aisle, no budget", place: "QuikTrip (any)", address: "nearest QT", mapsLink: maps("QuikTrip Tulsa OK"), duration: 15, cost: "$", closesAt: null, revealMode: "hint", jessFull: "QT candy aisle. no budget. (within reason) 🍫", jessHint: "something sweet. you'll pick it yourself.", hostNotes: "Cookies 'n' Creme, Scooby-Doo snacks, Alani watermelon.", caption: "Scooby snacks acquired", icon: "🍫", backup: "braums", enabled: true },
  { id: "ida-red", category: "SWEET", name: "Ida Red candy shop", place: "Ida Red", address: "3346 S Peoria Ave, Tulsa (verify)", mapsLink: maps("Ida Red Tulsa OK"), duration: 25, cost: "$", closesAt: "20:00", revealMode: "secret", jessFull: "Ida Red. a whole store of sweets 🍬", jessHint: "sweet stuff. a lot of it.", hostNotes: "May close early. Verify.", caption: "a whole store of sweets. we survived.", icon: "🍬", backup: "qt-candy", enabled: true },

  // ── RANDOM ─────────────────────────────────────
  { id: "center", category: "RANDOM", name: "The Center of the Universe", place: "Center of the Universe", address: "Boston Ave pedestrian bridge, downtown", mapsLink: maps("Center of the Universe Tulsa"), duration: 15, cost: "free", closesAt: null, revealMode: "secret", jessFull: "the Center of the Universe. it's weird. trust me 🌀", jessHint: "something weird. you'll get it when you're there.", hostNotes: "Stand in the circle and talk, it echoes. 5 minutes, totally weird.", caption: "the echo was weird. you were weirder (affectionate)", icon: "🌀", backup: "buck-atom", enabled: true },
  { id: "buck-atom", category: "RANDOM", name: "Buck Atom photo op", place: "Buck Atom's Cosmic Curios on 66", address: "1347 E 11th St, Tulsa (verify)", mapsLink: maps("Buck Atom's Cosmic Curios Tulsa"), duration: 10, cost: "free", closesAt: null, revealMode: "hint", jessFull: "photo op with a giant space cowboy 🚀", jessHint: "photo op. that's all I'm saying.", hostNotes: "The statue's outside. Quick photo.", caption: "we met a giant space cowboy", icon: "🚀", backup: "golden-driller", enabled: true },
  { id: "golden-driller", category: "RANDOM", name: "Golden Driller drive-by", place: "Golden Driller (Expo Square)", address: "21st St & Yale Ave, Tulsa", mapsLink: maps("Golden Driller Tulsa"), duration: 10, cost: "free", closesAt: null, revealMode: "full", jessFull: "we're visiting a very tall man 🗿", jessHint: "something very Tulsa.", hostNotes: "Pose with him. It's the law.", caption: "posed with the very tall man", icon: "🗿", backup: "buck-atom", enabled: true },

  // ── QUICK STOP ─────────────────────────────────
  { id: "qt-drinks", category: "QUICK", name: "QT drink run", place: "QuikTrip (any)", address: "nearest QT", mapsLink: maps("QuikTrip Tulsa OK"), duration: 10, cost: "$", closesAt: null, revealMode: "full", jessFull: "QT run. Alani watermelon has been located 🍉", jessHint: "quick stop. hydration (sort of).", hostNotes: "Alani watermelon for her.", caption: "hydrated (Alani counts)", icon: "🍉", backup: "sonic", enabled: true },
  { id: "sonic", category: "QUICK", name: "Sonic drink + tots", place: "Sonic (nearest)", address: "nearest Sonic", mapsLink: maps("Sonic Drive-In Tulsa OK"), duration: 15, cost: "$", closesAt: null, revealMode: "hint", jessFull: "Sonic. drinks and tots in the car 🥤", jessHint: "drive-thru moment.", hostNotes: "Stay in the car.", caption: "tots in the car = peak", icon: "🥤", backup: "qt-drinks", enabled: true },
  { id: "dark-coffee", category: "QUICK", name: "Drive-thru dark roast", place: "Nearest coffee drive-thru", address: "nearest", mapsLink: maps("coffee drive thru Tulsa OK"), duration: 10, cost: "$", closesAt: "21:00", revealMode: "secret", jessFull: "drive-thru dark roast ☕", jessHint: "quick caffeine break.", hostNotes: "Dark roast, black (or ask her).", caption: "caffeine: secured", icon: "☕", backup: "qt-drinks", enabled: true },

  // ── LITTLE ADVENTURE ───────────────────────────
  { id: "neon-66", category: "ADVENTURE", name: "Route 66 neon sign drive", place: "Route 66 / 11th St neon signs", address: "E 11th St (Route 66), Tulsa", mapsLink: maps("Meadow Gold Sign Tulsa"), duration: 20, cost: "free", closesAt: null, revealMode: "secret", jessFull: "Route 66 neon drive ✨", jessHint: "we're going on a tiny drive. windows down.", hostNotes: "Slow drive down 11th St past the neon. Stop at the Meadow Gold sign.", caption: "neon tour: complete", icon: "✨", backup: "skyline", enabled: true },
  { id: "skyline", category: "ADVENTURE", name: "Downtown skyline + walk-free photo", place: "Downtown Tulsa", address: "downtown", mapsLink: maps("Downtown Tulsa"), duration: 20, cost: "free", closesAt: null, revealMode: "hint", jessFull: "city lights mission 🌃", jessHint: "little adventure. very little. no cardio.", hostNotes: "Park, quick photo, back in the car.", caption: "city lights + you = good photo", icon: "🌃", backup: "neon-66", enabled: true },
  { id: "admiral", category: "ADVENTURE", name: "Admiral Twin Drive-In", place: "Admiral Twin Drive-In", address: "7355 E Easton St, Tulsa", mapsLink: maps("Admiral Twin Drive-In Tulsa"), duration: 120, cost: "$", closesAt: null, revealMode: "secret", jessFull: "a drive-in movie. blankets in the back 🎞️", jessHint: "a movie, but make it weird.", hostNotes: "Seasonal: check if they're showing tonight.", caption: "drive-in movie, blanket stolen", icon: "🎞️", backup: "circle", enabled: true },

  // ── HOME ───────────────────────────────────────
  { id: "oculus", category: "HOME", name: "Oculus cooking game + ice cream sandwiches", place: "Home", address: "home", mapsLink: "", duration: 60, cost: "free", closesAt: null, revealMode: "hint", jessFull: "you're head chef (in VR). ice cream sandwiches after 🍳", jessHint: "home stretch. it's cozy. you'll see.", hostNotes: "Oculus charged. M&M ice cream sandwiches in the freezer.", caption: "head chef Jess. 5 stars.", icon: "🍳", backup: "movie-home", enabled: true },
  { id: "movie-home", category: "HOME", name: "Beyond the Lights + blanket", place: "Home", address: "home", mapsLink: "", duration: 120, cost: "free", closesAt: null, revealMode: "secret", jessFull: "you know which movie 🎬", jessHint: "couch. blanket. a movie you love.", hostNotes: "Her favorite movie. Snacks ready.", caption: "you know which movie", icon: "🎬", backup: "oculus", enabled: true },
  { id: "couch", category: "HOME", name: "Couch, snacks, her pick", place: "Home", address: "home", mapsLink: "", duration: 60, cost: "free", closesAt: null, revealMode: "full", jessFull: "couch. snacks. you pick literally everything 🛋️", jessHint: "we're going somewhere very comfortable.", hostNotes: "Scooby snacks + Cookies 'n' Creme out.", caption: "couch: conquered", icon: "🛋️", backup: "oculus", enabled: true },
];

/** "not feeling this?" options → which categories to suggest to you. */
export const moods = {
  surprise: { label: "Just surprise me", emoji: "🩷", categories: [] },
  feed: { label: "Feed me", emoji: "🍜", categories: ["FOOD", "QUICK"] },
  fun: { label: "Something fun", emoji: "🎮", categories: ["FUN", "GAME", "RANDOM"] },
  chill: { label: "Something chill", emoji: "☕", categories: ["CHILL", "COZY"] },
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
    "no pressure (a little pressure)",
    "trust your gut",
    "eeny meeny…",
    "you got this. probably.",
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
