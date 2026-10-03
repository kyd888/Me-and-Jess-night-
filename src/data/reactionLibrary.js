/**
 * ─────────────────────────────────────────────────────────────
 *  REACTION LIBRARY: every reaction GIF + caption lives here.
 * ─────────────────────────────────────────────────────────────
 *
 *  Components never hardcode a GIF. They ask for a reaction by
 *  CONTEXT (see `contexts` below) and get a random one back.
 *
 *  Each reaction:
 *    id        unique
 *    source    "giphy" | "tenor" | "local"
 *    url       giphy:  the GIF id OR any media.giphy.com / giphy.com link
 *              tenor:  a direct media URL (media.tenor.com/.../x.gif)
 *              local:  a path in /public, e.g. "/memes/my-gif.gif"
 *    type      "gif" | "image"
 *    category  one of CATEGORIES below
 *    moods     free tags (for you)
 *    weight    higher = shows up more (0 = never)
 *    note      what it is (for you, never shown)
 *
 *  To swap one: replace `url`. To drop one: set weight: 0.
 *  To add your own file: put it in public/memes/ and use source "local".
 *
 *  If a GIF fails to load on her phone, the caption shows on its own,
 *  never a broken image.
 */

export const CATEGORIES = {
  SIDE_EYE: "SIDE_EYE",
  CRYING_LAUGHING: "CRYING_LAUGHING",
  SHOCKED: "SHOCKED",
  JUDGING: "JUDGING",
  CELEBRATING: "CELEBRATING",
  AWKWARD: "AWKWARD",
  LETS_GO: "LETS_GO",
  NO_WAY: "NO_WAY",
  CUTE: "CUTE",
  CAT_CHAOS: "CAT_CHAOS",
};

const C = CATEGORIES;

export const reactions = [
  // ── SIDE EYE ─────────────────────────────────
  { id: "side-eye-01", source: "giphy", url: "YMqVRe8g0q7eEhfuVA", type: "gif", category: C.SIDE_EYE, moods: ["side-eye", "smh"], weight: 2, note: "Bounce TV, Saints & Sinners side eye" },
  { id: "side-eye-02", source: "giphy", url: "NYxiyDM9pM5KvNUPE1", type: "gif", category: C.SIDE_EYE, moods: ["side-eye", "speechless", "blank face"], weight: 2, note: "side eye, speechless" },

  // ── JUDGING ──────────────────────────────────
  { id: "judging-01", source: "giphy", url: "nL35pJUKAxi6loUu7u", type: "gif", category: C.JUDGING, moods: ["judging"], weight: 2, note: "judging look" },
  { id: "judging-02", source: "giphy", url: "OQJ07cxd4P3DzTQSnG", type: "gif", category: C.JUDGING, moods: ["shade", "judging"], weight: 1, note: "shade / diva reaction" },
  { id: "judging-03", source: "giphy", url: "uYAfA1oAKyd1cgvHIr", type: "gif", category: C.JUDGING, moods: ["shaking head", "disbelief"], weight: 1, note: "head shake" },

  // ── SHOCKED ──────────────────────────────────
  { id: "shocked-01", source: "giphy", url: "vs8b12zEZ54UC1kUe4", type: "gif", category: C.SHOCKED, moods: ["shocked", "stunned"], weight: 1, note: "shocked man" },
  { id: "shocked-02", source: "giphy", url: "jtKdIKZ5Ef4jUmYEG9", type: "gif", category: C.SHOCKED, moods: ["stare", "stunned silence"], weight: 1, note: "stunned stare" },

  // ── NO WAY ───────────────────────────────────
  { id: "no-way-01", source: "giphy", url: "l4HnKwiJJaJQB04Zq", type: "gif", category: C.NO_WAY, moods: ["no way", "what"], weight: 1, note: "no way / what" },

  // ── CRYING LAUGHING ──────────────────────────
  { id: "laughing-01", source: "giphy", url: "n9kJ8uUSXSdX7daCLM", type: "gif", category: C.CRYING_LAUGHING, moods: ["trying not to laugh", "hold up"], weight: 2, note: "trying not to laugh" },
  { id: "laughing-02", source: "giphy", url: "l4hmXZF4JvrjxnB0Q", type: "gif", category: C.CRYING_LAUGHING, moods: ["laughing"], weight: 1, note: "Chadwick Boseman laughing" },
  { id: "laughing-03", source: "giphy", url: "bT3EVGsFxwPKP1Q0K7", type: "gif", category: C.CRYING_LAUGHING, moods: ["laughing"], weight: 1, note: "laughing reaction" },

  // ── AWKWARD / CONFUSED ───────────────────────
  { id: "awkward-01", source: "giphy", url: "5thaAuHCJwhLbKwu94", type: "gif", category: C.AWKWARD, moods: ["confused", "really?"], weight: 2, note: "confused 'really?'" },
  { id: "awkward-02", source: "giphy", url: "YnQpSLDEhkWLSD6t3t", type: "gif", category: C.AWKWARD, moods: ["confused"], weight: 1, note: "confused man" },
  { id: "awkward-03", source: "giphy", url: "hsGNhcnEjQDQ7wHuSR", type: "gif", category: C.AWKWARD, moods: ["confused", "awkward"], weight: 1, note: "confused man" },

  // ── CELEBRATING ──────────────────────────────
  { id: "celebrate-01", source: "giphy", url: "MB5lZCGax8UkrmNPZN", type: "gif", category: C.CELEBRATING, moods: ["uh huh", "yes", "approval"], weight: 2, note: "A Black Lady Sketch Show 'uh huh, yes'" },
  { id: "celebrate-02", source: "giphy", url: "FrbpR1FLeu1zpEEhVV", type: "gif", category: C.CELEBRATING, moods: ["yes"], weight: 1, note: "yes!" },
  { id: "celebrate-03", source: "giphy", url: "l4FGD1rkCocQwTm7K", type: "gif", category: C.CELEBRATING, moods: ["dancing"], weight: 1, note: "dancing reaction" },
  { id: "celebrate-04", source: "giphy", url: "ihw8AzkSuYfcm222NS", type: "gif", category: C.CELEBRATING, moods: ["yes"], weight: 1, note: "yes!" },

  // ── LET'S GO ─────────────────────────────────
  { id: "lets-go-01", source: "giphy", url: "7beU8olHN31MFesDtM", type: "gif", category: C.LETS_GO, moods: ["lets go", "hype"], weight: 1, note: "let's go hype" },

  // ── CUTE ─────────────────────────────────────
  { id: "cute-01", source: "giphy", url: "bzDruVNgkCY5ZFwucP", type: "gif", category: C.CUTE, moods: ["smirk", "charming"], weight: 1, note: "smirk" },
  { id: "cute-02", source: "giphy", url: "3o6ZtolGK2LJqapq12", type: "gif", category: C.CUTE, moods: ["smile"], weight: 1, note: "smile" },

  // ── CAT CHAOS ────────────────────────────────
  { id: "cat-01", source: "giphy", url: "8t6ef4FCRAAOgS2EnQ", type: "gif", category: C.CAT_CHAOS, moods: ["side eye", "sus"], weight: 2, note: "orange cat sus side eye" },
  { id: "cat-02", source: "giphy", url: "RwvRFjhRx1kMhQtyN9", type: "gif", category: C.CAT_CHAOS, moods: ["side eye", "black cat"], weight: 2, note: "black cat side eye" },
  { id: "cat-03", source: "giphy", url: "GAXXHdS0zXawVLOJLY", type: "gif", category: C.CAT_CHAOS, moods: ["side eye", "judging"], weight: 1, note: "hairless cat side eye" },
  { id: "cat-04", source: "giphy", url: "CrwHSFJCcEBpQ1ycb0", type: "gif", category: C.CAT_CHAOS, moods: ["blank stare", "black cat"], weight: 2, note: "black cat blank stare" },
  { id: "cat-05", source: "giphy", url: "hrGLLFPzISpaGYAMzY", type: "gif", category: C.CAT_CHAOS, moods: ["stare"], weight: 1, note: "cat stare down" },
  { id: "cat-06", source: "giphy", url: "l4FGHnXeX2klV9TLq", type: "gif", category: C.CAT_CHAOS, moods: ["side eye"], weight: 1, note: "cat side eye" },
  { id: "cat-07", source: "giphy", url: "l0MYxjjJovB5Dnufe", type: "gif", category: C.CAT_CHAOS, moods: ["stressed"], weight: 1, note: "stressed cat" },
  { id: "cat-08", source: "giphy", url: "rW5BFRzuX04bm", type: "gif", category: C.CAT_CHAOS, moods: ["stressed"], weight: 1, note: "stressed cats" },
  { id: "cat-09", source: "giphy", url: "3oEjHQsp5iBObskegE", type: "gif", category: C.CAT_CHAOS, moods: ["dancing"], weight: 1, note: "tiny dancing cat" },
];

/**
 * When reactions show up, which categories they draw from, and the
 * captions they're paired with. `chance` = how often it fires.
 */
export const contexts = {
  // Jess picks a mystery card → sometimes a reaction before the flip.
  pick: {
    chance: 0.3,
    categories: [C.SIDE_EYE, C.JUDGING, C.SHOCKED, C.AWKWARD, C.CRYING_LAUGHING, C.NO_WAY, C.CAT_CHAOS],
    captions: [
      "now why would you pick that one 😭",
      "interesting.",
      "noted 📝",
      "????",
      "oh that's not...",
      "be so fr 😭",
      "well!",
      "okayyyy 👀",
      "wait 😭✋🏾",
      "yeahhh we're cooked",
      "don't look at me, YOU picked it 😭",
      "oh brother",
    ],
  },
  // "Just surprise me"
  surprise: {
    chance: 1,
    categories: [C.CELEBRATING, C.LETS_GO],
    captions: ["I KNOW THAT'S RIGHT"],
  },
  // "not feeling this?" → she asks to switch
  switch: {
    chance: 1,
    categories: [C.SIDE_EYE, C.JUDGING, C.CAT_CHAOS],
    captions: ["oh so NOW you wanna switch 😭", "not too much now", "be so fr 😭"],
  },
  // Kyd swapped the plan after she picked
  swapped: {
    chance: 1,
    categories: [C.AWKWARD, C.CRYING_LAUGHING],
    captions: ["my fault gang 😭"],
  },
  // Laptop homepage, the moment she scans the QR code
  arrived: {
    chance: 1,
    categories: [C.CELEBRATING, C.LETS_GO],
    captions: ["SHE'S HERE 🚨", "she outside 🚨", "SHE'S HERE HERE 🚨"],
  },
  // Hidden: she taps the bird on the waiting screen 5 times
  easterEgg: {
    chance: 1,
    categories: [C.CAT_CHAOS],
    captions: ["clock it.", "you found the cat. congrats I guess"],
  },
};
