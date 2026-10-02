/**
 * ─────────────────────────────────────────────────────────────
 *  THE NIGHT PLAN  —  edit this file to change the date.
 * ─────────────────────────────────────────────────────────────
 *
 *  Every card, reveal, note and message lives here. The UI just
 *  reads this file, so you never have to touch a component.
 *
 *  Each choice:
 *    id           unique key (don't reuse within a chapter)
 *    title        what Jess sees on the mystery ticket
 *    hint         tiny handwritten clue under the title
 *    icon         emoji shown on the ticket
 *    revealTitle  the big headline after the card flips
 *    location     place name / area
 *    description  a sentence or two about the plan
 *    note         handwritten scrap of paper on the reveal (optional)
 *    mapLink      any maps URL (Apple Maps search links work great on iPhone)
 *    enabled      false = hidden from Jess (e.g. a place is closed)
 *
 *  IMPORTANT: if you change this file after already using Host Mode
 *  edits on the phone, bump `version` below so the phone drops its
 *  saved edits and picks up this file again.
 */

const maps = (q) => `https://maps.apple.com/?q=${encodeURIComponent(q)}`;

export const night = {
  version: 1,

  // Who it's for / from
  her: "Jess",
  signature: "— me",

  intro: {
    eyebrow: "a small film in four parts",
    title: "Tonight belongs to Jess",
    subtitle: "No planning. No decisions. Just pick a card.",
    button: "Start the night",
    aside: "you call the shots tonight.",
  },

  chapters: [
    {
      chapter: 1,
      label: "Chapter One",
      title: "Where are we starting?",
      subtitle: "Three tickets. One dinner. Zero spoilers.",
      choices: [
        {
          id: "cozy",
          title: "Something Cozy",
          hint: "noodles. a booth. no rush.",
          icon: "🍜",
          revealTitle: "Lanna Thai",
          location: "Lanna Thai · Tulsa",
          description:
            "Warm, quiet, and the Pad Thai you already love. We'll get a booth and take our time.",
          note: "Pad Thai. Obviously.",
          mapLink: maps("Lanna Thai Tulsa OK"),
          enabled: true,
        },
        {
          id: "tasty",
          title: "Something Tasty",
          hint: "small things, big flavor.",
          icon: "🌮",
          revealTitle: "Velvet Taco",
          location: "Velvet Taco · Tulsa",
          description:
            "Taco flight, no fuss. Order way too many and split everything.",
          note: "a cauliflower taco has your name on it.",
          mapLink: maps("Velvet Taco Tulsa OK"),
          enabled: true,
        },
        {
          id: "trust",
          title: "Trust Me",
          hint: "i have a plan. mostly.",
          icon: "🎟️",
          revealTitle: "Mother Road Market",
          location: "Mother Road Market · Route 66",
          description:
            "Tulsa's food hall on Route 66. We each wander, grab whatever looks best, and meet back at a table.",
          note: "point at things. eat everything.",
          mapLink: maps("Mother Road Market Tulsa OK"),
          enabled: true,
        },
      ],
    },
    {
      chapter: 2,
      label: "Chapter Two",
      title: "Choose our vibe.",
      subtitle: "Dinner's done. The night's still young.",
      choices: [
        {
          id: "play",
          title: "Play",
          hint: "loser buys the next tokens.",
          icon: "🕹️",
          revealTitle: "Arcade Night",
          location: "Max Retropub · Blue Dome District",
          description:
            "Retro arcade cabinets, pinball, and zero pressure. Low effort, high trash talk.",
          note: "fair warning: i've been practicing.",
          mapLink: maps("Max Retropub Tulsa OK"),
          enabled: true,
        },
        {
          id: "explore",
          title: "Explore",
          hint: "quiet shelves & a strange echo.",
          icon: "📚",
          revealTitle: "Books + the Center of the Universe",
          location: "Magic City Books · Brady District",
          description:
            "Browse the shelves and pick a book for each other ($15 limit). Then stand in the middle of the Center of the Universe, a few minutes away, and hear your own echo.",
          note: "you pick mine, i pick yours. no peeking.",
          mapLink: maps("Magic City Books Tulsa OK"),
          enabled: true,
        },
        {
          id: "chill",
          title: "Chill",
          hint: "big screen. small blanket.",
          icon: "🎬",
          revealTitle: "Movie at Circle Cinema",
          location: "Circle Cinema · Kendall-Whittier",
          description:
            "Tulsa's little indie theater. We pick whatever's playing next and just sit back.",
          note: "popcorn's on me. armrest is yours.",
          mapLink: maps("Circle Cinema Tulsa OK"),
          enabled: true,
        },
      ],
    },
    {
      chapter: 3,
      label: "Chapter Three",
      title: "Sweet ending.",
      subtitle: "Every good night ends with something sweet.",
      choices: [
        {
          id: "cold",
          title: "Cold",
          hint: "brain freeze, worth it.",
          icon: "🍦",
          revealTitle: "Braum's Run",
          location: "Braum's · nearest one",
          description:
            "Sundae, shake, or a cone. Whatever you're feeling. Eaten in the car with the windows down.",
          note: "get the thing you always get.",
          mapLink: maps("Braum's Tulsa OK"),
          enabled: true,
        },
        {
          id: "chocolate",
          title: "Chocolate",
          hint: "you already know.",
          icon: "🍫",
          revealTitle: "QT Candy Aisle, No Budget",
          location: "QuikTrip · any one",
          description:
            "Hershey's Cookies 'n' Creme, Scooby-Doo snacks, an Alani Watermelon for the road. Fill the basket.",
          note: "no budget. i mean it. (within reason)",
          mapLink: maps("QuikTrip Tulsa OK"),
          enabled: true,
        },
        {
          id: "dealer",
          title: "Dealer's Choice",
          hint: "i picked. don't peek.",
          icon: "🃏",
          revealTitle: "Ice Cream Sandwiches & Oculus",
          location: "Home · couch reserved",
          description:
            "M&M ice cream sandwiches are already in the freezer. You pick the cooking game, and you're head chef.",
          note: "yes, i stocked the freezer ahead of time.",
          mapLink: "",
          enabled: true,
        },
      ],
    },
  ],

  finale: {
    label: "Chapter Four",
    tease: "One last thing…",
    teaseButton: "…okay?",
    tapHint: "tap the box",
    reveal: "I got you something.",
    gifts: [
      { icon: "💐", caption: "flowers, for no reason" },
      { icon: "🧺", caption: "a little basket of your favorites" },
    ],
    basket: [
      "dark coffee",
      "mushroom coffee",
      "Alani Watermelon",
      "Cookies 'n' Creme",
      "Scooby-Doo snacks",
    ],
    note: "No big speech. I just like seeing you get to be you.",
    recapTitle: "Tonight, according to Jess",
    end: "the end (for now)",
  },

  // Shown once per pick, never repeated in the same night.
  quips: [
    "Good choice 👀",
    "I was hoping you'd pick that.",
    "Okayyy I see the vision.",
    "Interesting choice, Jess.",
    "Trust the process.",
    "Plot twist.",
  ],

  // Little hidden details
  birdLines: ["hi jess", "tweet.", "*tiny bird noises*", "she's here!", "🎶"],
  moonSecret: "psst: Noni would've picked “Trust Me.”",
};

/*
 * BACKUP IDEAS: swap any of these into a card above (or in Host Mode).
 * Always double-check evening hours on the day.
 *
 *  - Admiral Twin Drive-In: classic drive-in movie, blanket in the car (seasonal)
 *  - Hodges Bend: cozy coffee bar, open late, dark roast
 *  - Gathering Place: sit on a bench by the water at sunset and watch the birds
 *  - Ida Red: candy and gift shop (Brookside), great for a sweet ending
 *  - Dust Bowl Lanes & Lounge: retro bowling downtown (low effort, promise)
 *  - Starship Records & Tapes: browse vinyl, pick one album for each other
 *  - Philbrook Museum of Art: check for late hours or evening events
 *  - Golden Driller: drive-by photo op, very Tulsa
 *  - Home: chicken & sausage Cajun Alfredo + MW3 duos
 */
