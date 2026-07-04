/* Story beats, the AI twin narrates Urmil's career, one reply at a time. */

export const CAREER_BEATS = [
  {
    tag: '2015 → class 10 · first code',
    text: 'It starts in a school computer lab in Rajkot. First HTML and CSS pages in class 10, then C++ conquered by class 12. Pawns only move forward. So did he.',
  },
  {
    tag: '2018 → first laptop · python',
    text: 'BCA begins and he finally gets his own laptop. Python takes over his nights. He builds Jarvis, a voice assistant that talks back, and a real invisibility cloak using OpenCV.',
  },
  {
    tag: '2019 → freelance · the leap',
    text: 'The gambit. At nineteen, still in college, he goes freelance. React, Angular, React Native, Next.js. Three years of client products owned end to end.',
  },
  {
    tag: '2022 → fox valley',
    text: 'Development before glory. At Fox Valley he builds RESTful backends, an online code editor, auth and Docker setups. The quiet moves that win games later.',
  },
  {
    tag: '2022-23 → warelogg · iit startup',
    text: 'Control the lanes. Warelogg is a logistics startup he builds with IIT students. Order management, shipment tracking, route optimization. That year he also wins big at the Gateway TECHATHON.',
  },
  {
    tag: '2023-25 → asite · angular era',
    text: 'He castles into the enterprise. Asite, Ahmedabad. Intern to Associate Software Engineer in two and a half years. Angular, TypeScript, Storybook. Structure that lets you attack.',
  },
  {
    tag: 'aug 2025 → upsquare · now',
    text: 'And the queen comes out. Today at Upsquare he runs three or four real products at once, in Angular and TypeScript, with AI in every workflow. Your turn.',
  },
]

export const PROJECT_UNLOCKS = [
  {
    name: 'IdeaBag',
    desc: 'daily AI business-idea catalog, Android app + NestJS API',
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
  'I plan features the same way, three moves ahead, one sprint at a time.',
  'Solid. I would code-review that move and approve it.',
  'Careful. I have shipped 11 Android apps; patience is my opening repertoire.',
  'This is how I debug too, hypothesis, move, observe.',
  'A quiet move. The best refactors are quiet too.',
]

export const CAPTURE_LINES = {
  playerTakes: (piece, project) =>
    project
      ? `You took my ${piece}. Fair trade. Here is something I shipped in return: ${project.name}, ${project.desc}.`
      : `You took my ${piece}. Material is temporary; position is forever.`,
  aiTakes: (piece) => `I take your ${piece}. Nothing personal, just resource management.`,
}

export const STATUS_LINES = {
  check: 'Check. Always see the whole board.',
  playerWins:
    'Checkmate. You win. Beating me at chess is impressive. Imagine what we would ship together.',
  aiWins:
    'Checkmate. Good game, now imagine this engine on your team instead of across the board.',
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
