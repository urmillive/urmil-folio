/* Story beats — the AI twin narrates Urmil's career, one reply at a time. */

export const CAREER_BEATS = [
  {
    tag: '2018 → python years',
    text: 'It started with Python: a BCA in Python & ML, a voice assistant named Jarvis, and PHP/Java college projects. Fundamentals from a quiet corner.',
  },
  {
    tag: '2019 → freelance · mern',
    text: 'Then the gambit — freelance mid-college. MongoDB, Express, React, Node, Next.js, Stripe: everything end-to-end, everything mine.',
  },
  {
    tag: '2022 → fox valley',
    text: 'Development before glory. Fox Valley: RESTful backends, an online code editor, auth, Docker. The unglamorous moves that win middles.',
  },
  {
    tag: '2022–23 → warelogg',
    text: 'Control the lanes. At Warelogg I built logistics platforms — order and shipment tracking on the MERN stack. Route optimization, literally.',
  },
  {
    tag: '2023 → asite (intern)',
    text: 'I castle. Structure and fundamentals first — Asite Solutions internship: Angular, reusable components, WCAG accessibility.',
  },
  {
    tag: '2023–24 → asite (engineer)',
    text: 'Now the center. Software Engineer at Asite — enterprise Angular at scale, reactive forms, monorepo, tested with Jasmine/Karma.',
  },
  {
    tag: '2025 → upsquare · now',
    text: 'And the queen comes out. Upsquare, today: Angular → React, TypeScript, Node, AWS, Claude API — AI-era products built end to end. Your turn.',
  },
]

export const PROJECT_UNLOCKS = [
  {
    name: 'IdeaBag',
    desc: 'daily AI business-idea catalog — Android app + NestJS API',
    url: 'https://github.com/urmillive/ideabag',
  },
  {
    name: 'Shree Fashion',
    desc: 'fashion e-commerce, customer & admin storefronts',
    url: 'https://github.com/urmillive/shree-frontend',
  },
  {
    name: 'Govind',
    desc: 'desktop AI assistant',
    url: 'https://github.com/urmillive/Govind',
  },
  {
    name: 'Job Pilot',
    desc: 'job-application automation',
    url: 'https://github.com/urmillive/job-pilot',
  },
  {
    name: 'Netflix Remote',
    desc: 'an iOS remote control for Netflix',
    url: 'https://github.com/urmillive/Netflix-Remote',
  },
  {
    name: 'E-dit',
    desc: 'a code editor that runs in the browser',
    url: 'https://github.com/urmillive/E-dit',
  },
]

export const TAUNTS = [
  'Still thinking? Good. I like opponents who read the whole board.',
  'I plan features the same way — three moves ahead, one sprint at a time.',
  'Solid. I would code-review that move and approve it.',
  'Careful. I have shipped 11 Android apps; patience is my opening repertoire.',
  'This is how I debug too — hypothesis, move, observe.',
  'A quiet move. The best refactors are quiet too.',
]

export const CAPTURE_LINES = {
  playerTakes: (piece, project) =>
    project
      ? `You took my ${piece}. Trade accepted — here is something I shipped in return: ${project.name} — ${project.desc}.`
      : `You took my ${piece}. Material is temporary; position is forever.`,
  aiTakes: (piece) => `I take your ${piece}. Nothing personal — just resource management.`,
}

export const STATUS_LINES = {
  check: 'Check. Always see the whole board.',
  playerWins:
    'Checkmate — you win. Beating me at chess is impressive; imagine what we would ship together.',
  aiWins:
    'Checkmate. Good game — now imagine this engine on your team instead of across the board.',
  draw: 'A draw. The only game I refuse to draw is shipping.',
}

export const PIECE_NAMES = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}
