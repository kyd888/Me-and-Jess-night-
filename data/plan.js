/**
 * ─────────────────────────────────────────────────────────────
 *  TONIGHT'S PLAN  (private: only the server reads this file)
 * ─────────────────────────────────────────────────────────────
 *
 *  This file is NOT bundled into the website, so Jess can't find
 *  the destinations by poking around the page source. The server
 *  hands Jess only what she's allowed to see, one chapter at a time.
 *
 *  These are the DEFAULTS. Once the night is created, the live copy
 *  is edited from the Kyd Control Room (reorder, add, replace, skip).
 *  "Reset night" in the Control Room reloads this file.
 *
 *  ⚠️  Double-check addresses + hours on the day. Anything marked
 *      "verify" is a best guess.
 */

const maps = (q) => `https://maps.apple.com/?q=${encodeURIComponent(q)}`;

export const settings = {
  her: "Jess",
  me: "Kyd",
  // Used only if the HOST_PIN environment variable isn't set on Netlify.
  // Set HOST_PIN in Netlify → Site configuration → Environment variables.
  fallbackPin: "0630",
  finale: {
    title: "That's the night.",
    note: "Thanks for letting me plan one. You didn't have to decide anything, and you still made it the best part.",
    signature: "— Kyd",
  },
};

/**
 * One step = one chapter on Jess's phone.
 *
 *  JESS SEES:      eyebrow, title, body, hint, button, animation
 *                  destination.name + destination.note (only after you tap REVEAL)
 *  ONLY YOU SEE:   hostNotes, estimatedMinutes, destination address/link/hours
 *
 *  status      waiting · at_home · leaving · traveling · at_destination ·
 *              transition · dessert · ending
 *  animation   door · gift · car · ticket · bowl · sparkle · sweet · moon · bird
 *  stamp       label on her scrapbook ticket once the step is done
 *  memory      what the ticket says (defaults to the destination name)
 *  allowChange show the little "not feeling this?" link
 */
export const steps = [
  {
    id: "welcome",
    status: "at_home",
    eyebrow: "Chapter 0",
    animation: "door",
    title: "Come inside.",
    body: "There's something here for you.",
    button: "coming 👀",
    stamp: "The beginning",
    memory: "you showed up (best part)",
    estimatedMinutes: 5,
    hostNotes: "She just walked in. Flowers + basket are ready.",
    allowChange: false,
  },
  {
    id: "surprise-1",
    status: "at_home",
    eyebrow: "Surprise #1",
    animation: "gift",
    title: "Okay. Put the phone down.",
    body: "This part isn't on your phone.",
    button: "okay okay",
    stamp: "Surprise #1",
    memory: "flowers + a basket of your favorites",
    estimatedMinutes: 15,
    hostNotes: "Flowers + gift basket (dark coffee, mushroom coffee, Alani watermelon, Cookies 'n' Creme, Scooby-Doo snacks). Advance when she's done.",
    allowChange: false,
  },
  {
    id: "leaving",
    status: "leaving",
    eyebrow: "Chapter 1",
    animation: "car",
    title: "Okay… now we're leaving.",
    body: "I'll give you one hint.",
    hint: "you probably won't need athletic shoes.",
    button: "I'm ready 🩷",
    stamp: "Departure",
    memory: "left the house, zero idea where we were going",
    estimatedMinutes: 15,
    hostNotes: "Keys. Wallet. Alani in the cupholder. Advance when you park.",
    allowChange: true,
  },
  {
    id: "stop-1",
    status: "at_destination",
    eyebrow: "Chapter 2",
    animation: "ticket",
    title: "Destination unlocked.",
    body: "Well… almost. Kyd has to make it official.",
    button: "make it official",
    stamp: "Stop 01",
    estimatedMinutes: 75,
    hostNotes: "Tap REVEAL DESTINATION once you're inside.",
    allowChange: true,
    destination: {
      name: "Max Retropub",
      note: "fair warning: I've been practicing.",
      address: "114 S Elgin Ave, Tulsa (verify)",
      mapsLink: maps("Max Retropub Tulsa OK"),
      openUntil: "late (verify, 21+)",
      costLevel: "$",
    },
  },
  {
    id: "food",
    status: "at_destination",
    eyebrow: "Chapter 3",
    animation: "bowl",
    title: "Plot twist.",
    body: "There's another stop.",
    hint: "bring your appetite.",
    button: "I'm hungry",
    stamp: "Stop 02",
    estimatedMinutes: 60,
    hostNotes: "Pad Thai for her. Reveal when you pull in.",
    allowChange: true,
    destination: {
      name: "Lanna Thai",
      note: "Pad Thai. Obviously.",
      address: "",
      mapsLink: maps("Lanna Thai Tulsa OK"),
      openUntil: "verify",
      costLevel: "$$",
    },
  },
  {
    id: "optional",
    status: "transition",
    eyebrow: "Chapter 4",
    animation: "sparkle",
    title: "Still with me?",
    body: "One more, only if you're up for it.",
    button: "I'm up for it",
    stamp: "Bonus stop",
    estimatedMinutes: 40,
    hostNotes: "OPTIONAL. Skip if she's tired. Remove this step or jump past it.",
    allowChange: true,
    destination: {
      name: "Hodges Bend",
      note: "dark roast, no notes.",
      address: "823 E 3rd St, Tulsa (verify)",
      mapsLink: maps("Hodges Bend Tulsa OK"),
      openUntil: "late (verify)",
      costLevel: "$",
    },
  },
  {
    id: "sweet",
    status: "dessert",
    eyebrow: "Chapter 5",
    animation: "sweet",
    title: "Something sweet?",
    body: "That wasn't really a question.",
    button: "obviously",
    stamp: "Sweet stop",
    estimatedMinutes: 25,
    hostNotes: "",
    allowChange: true,
    destination: {
      name: "Braum's",
      note: "get the thing you always get.",
      address: "nearest one",
      mapsLink: maps("Braum's Tulsa OK"),
      openUntil: "~11 PM (verify)",
      costLevel: "$",
    },
  },
  {
    id: "ending",
    status: "ending",
    eyebrow: "Last chapter",
    animation: "moon",
    title: "Last stop: home.",
    body: "Couch. Blanket. You pick the game.",
    button: "perfect",
    stamp: "The cozy part",
    memory: "home, blanket, your pick",
    estimatedMinutes: 60,
    hostNotes: "M&M ice cream sandwiches in the freezer. Oculus charged. FINISH NIGHT whenever.",
    allowChange: true,
    destination: {
      name: "Home",
      note: "Oculus is charged. Ice cream sandwiches are in the freezer.",
      address: "home",
      mapsLink: "",
      openUntil: "whenever",
      costLevel: "free",
    },
  },
];

/**
 * Private bank of Tulsa backups. Jess never sees this list.
 * Categories: DINNER · DESSERT · GAMES · COZY · COFFEE · RANDOM · AT HOME
 */
export const backups = [
  // DINNER
  { id: "velvet-taco", name: "Velvet Taco", category: "DINNER", address: "", description: "Fast, fun tacos. Order too many and split everything.", estimatedDuration: 45, costLevel: "$", openUntil: "late (verify)", mapsLink: maps("Velvet Taco Tulsa OK"), reasonJessMightLikeIt: "Cauliflower tacos.", jessNote: "a cauliflower taco has your name on it." },
  { id: "mother-road", name: "Mother Road Market", category: "DINNER", address: "1124 S Lewis Ave, Tulsa", description: "Route 66 food hall. Everyone grabs whatever looks best.", estimatedDuration: 60, costLevel: "$$", openUntil: "~9 PM (verify)", mapsLink: maps("Mother Road Market Tulsa OK"), reasonJessMightLikeIt: "No deciding. Just wander and point.", jessNote: "point at things. eat everything." },
  { id: "lanna-thai", name: "Lanna Thai", category: "DINNER", address: "", description: "Quiet, cozy Thai.", estimatedDuration: 60, costLevel: "$$", openUntil: "verify", mapsLink: maps("Lanna Thai Tulsa OK"), reasonJessMightLikeIt: "Her Pad Thai.", jessNote: "Pad Thai. Obviously." },
  { id: "andolinis", name: "Andolini's Pizzeria", category: "DINNER", address: "Cherry Street (verify)", description: "Easy, cozy pizza.", estimatedDuration: 50, costLevel: "$$", openUntil: "verify", mapsLink: maps("Andolini's Pizzeria Cherry Street Tulsa"), reasonJessMightLikeIt: "Low effort and always good.", jessNote: "extra napkins secured." },

  // DESSERT
  { id: "braums", name: "Braum's", category: "DESSERT", address: "nearest one", description: "Sundae, shake or cone in the car.", estimatedDuration: 20, costLevel: "$", openUntil: "~11 PM (verify)", mapsLink: maps("Braum's Tulsa OK"), reasonJessMightLikeIt: "It's her Braum's.", jessNote: "get the thing you always get." },
  { id: "qt-candy", name: "QuikTrip candy run", category: "DESSERT", address: "any QT", description: "No-budget candy aisle: Cookies 'n' Creme, Scooby-Doo snacks, an Alani.", estimatedDuration: 15, costLevel: "$", openUntil: "24/7", mapsLink: maps("QuikTrip Tulsa OK"), reasonJessMightLikeIt: "Every one of her snacks, in one stop.", jessNote: "no budget. I mean it. (within reason)" },
  { id: "ida-red", name: "Ida Red", category: "DESSERT", address: "3346 S Peoria Ave, Tulsa (verify)", description: "Candy and gift shop in Brookside.", estimatedDuration: 25, costLevel: "$", openUntil: "verify (may close early)", mapsLink: maps("Ida Red Tulsa OK"), reasonJessMightLikeIt: "A whole shop of sweet things.", jessNote: "pick one thing. ok, two." },

  // GAMES
  { id: "max", name: "Max Retropub", category: "GAMES", address: "114 S Elgin Ave, Tulsa (verify)", description: "Retro arcade bar: cabinets and pinball.", estimatedDuration: 75, costLevel: "$", openUntil: "late (verify, 21+)", mapsLink: maps("Max Retropub Tulsa OK"), reasonJessMightLikeIt: "She's a gamer. Low effort, lots of trash talk.", jessNote: "fair warning: I've been practicing." },
  { id: "dust-bowl", name: "Dust Bowl Lanes & Lounge", category: "GAMES", address: "211 S Elgin Ave, Tulsa (verify)", description: "Retro bowling downtown. Lazy bowling counts.", estimatedDuration: 60, costLevel: "$$", openUntil: "late (verify)", mapsLink: maps("Dust Bowl Lanes Tulsa OK"), reasonJessMightLikeIt: "Playful without being a workout.", jessNote: "gutter balls are allowed." },
  { id: "home-mw3", name: "MW3 duos at home", category: "GAMES", address: "home", description: "Couch, snacks, MW3 duos.", estimatedDuration: 60, costLevel: "free", openUntil: "whenever", mapsLink: "", reasonJessMightLikeIt: "Her game, no going out.", jessNote: "carry me. please." },

  // COZY
  { id: "circle", name: "Circle Cinema", category: "COZY", address: "10 S Lewis Ave, Tulsa", description: "Tulsa's indie theater. See whatever's playing next.", estimatedDuration: 120, costLevel: "$$", openUntil: "check showtimes", mapsLink: maps("Circle Cinema Tulsa OK"), reasonJessMightLikeIt: "Easy, quiet, and a little cinematic.", jessNote: "popcorn's on me. armrest is yours." },
  { id: "admiral-twin", name: "Admiral Twin Drive-In", category: "COZY", address: "7355 E Easton St, Tulsa", description: "Classic drive-in. Blankets in the car.", estimatedDuration: 120, costLevel: "$", openUntil: "seasonal (check showtimes)", mapsLink: maps("Admiral Twin Drive-In Tulsa"), reasonJessMightLikeIt: "A movie without leaving the car.", jessNote: "blanket's in the back seat." },
  { id: "magic-city", name: "Magic City Books", category: "COZY", address: "221 E Archer St, Tulsa", description: "Browse, then pick a book for each other ($15 limit).", estimatedDuration: 40, costLevel: "$", openUntil: "verify", mapsLink: maps("Magic City Books Tulsa OK"), reasonJessMightLikeIt: "Quiet, thoughtful, a little gift for each other.", jessNote: "you pick mine, I pick yours." },

  // COFFEE
  { id: "hodges", name: "Hodges Bend", category: "COFFEE", address: "823 E 3rd St, Tulsa (verify)", description: "Cozy coffee bar, open late.", estimatedDuration: 40, costLevel: "$", openUntil: "late (verify)", mapsLink: maps("Hodges Bend Tulsa OK"), reasonJessMightLikeIt: "Dark coffee and quiet.", jessNote: "dark roast, no notes." },
  { id: "topeca", name: "Topeca Coffee (Mayo Hotel)", category: "COFFEE", address: "115 W 5th St, Tulsa (verify)", description: "Pretty old hotel lobby coffee.", estimatedDuration: 30, costLevel: "$", openUntil: "verify", mapsLink: maps("Topeca Coffee Mayo Hotel Tulsa"), reasonJessMightLikeIt: "Feels like a movie set.", jessNote: "act like we're in a movie." },

  // RANDOM / ADVENTURE
  { id: "center-universe", name: "Center of the Universe", category: "RANDOM", address: "Boston Ave pedestrian bridge, downtown", description: "Stand in the circle and hear your own echo. Five minutes, totally weird.", estimatedDuration: 15, costLevel: "free", openUntil: "always", mapsLink: maps("Center of the Universe Tulsa"), reasonJessMightLikeIt: "A tiny strange Tulsa secret.", jessNote: "say something. trust me." },
  { id: "gathering-place", name: "Gathering Place bench at dusk", category: "RANDOM", address: "2650 S John Williams Way E, Tulsa", description: "Park close, sit by the water, watch the birds. No long walk.", estimatedDuration: 30, costLevel: "free", openUntil: "verify", mapsLink: maps("Gathering Place Tulsa"), reasonJessMightLikeIt: "Birds.", jessNote: "count the birds. I'll count you." },
  { id: "golden-driller", name: "Golden Driller drive-by", category: "RANDOM", address: "Expo Square, 21st & Yale", description: "Drive-by photo op. Very Tulsa.", estimatedDuration: 10, costLevel: "free", openUntil: "always", mapsLink: maps("Golden Driller Tulsa"), reasonJessMightLikeIt: "Silly and quick.", jessNote: "pose with him. it's the law." },

  // AT HOME
  { id: "home-oculus", name: "Oculus cooking game + snacks", category: "AT HOME", address: "home", description: "She's head chef in VR. M&M ice cream sandwiches after.", estimatedDuration: 60, costLevel: "free", openUntil: "whenever", mapsLink: "", reasonJessMightLikeIt: "Her favorite VR games.", jessNote: "you're head chef. I'm the dishwasher." },
  { id: "home-alfredo", name: "Cajun Alfredo night in", category: "AT HOME", address: "home", description: "Chicken & sausage Cajun Alfredo at home.", estimatedDuration: 60, costLevel: "$", openUntil: "whenever", mapsLink: "", reasonJessMightLikeIt: "One of her favorite meals, zero effort for her.", jessNote: "sit. I'm cooking." },
  { id: "home-movie", name: "Beyond the Lights + blanket", category: "AT HOME", address: "home", description: "Her favorite movie, blanket, snacks.", estimatedDuration: 120, costLevel: "free", openUntil: "whenever", mapsLink: "", reasonJessMightLikeIt: "Her favorite movie.", jessNote: "you know which movie." },
];

/** What Jess's "not feeling this?" options map to on your side. */
export const moods = {
  surprise: { label: "Just surprise me", emoji: "🩷", categories: [] },
  feed: { label: "Feed me", emoji: "🍜", categories: ["DINNER"] },
  fun: { label: "Something fun", emoji: "🎮", categories: ["GAMES", "RANDOM"] },
  chill: { label: "Something chill", emoji: "☕", categories: ["COFFEE", "COZY"] },
  sweet: { label: "Something sweet", emoji: "🍦", categories: ["DESSERT"] },
  cozy: { label: "Can we just be cozy?", emoji: "🏠", categories: ["AT HOME", "COZY"] },
};
