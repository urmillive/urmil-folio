/* The Urmil Gambit — six acts, one board.
   Each act: a moment in the journey — Python roots to the React/AI era —
   expressed as the chess idea that defines it. */

export const ACTS = [
  {
    id: 'pawn',
    crumb: '2015',
    label: 'ACT I · 2015 · RAJKOT',
    title: 'Every engineer starts as a pawn.',
    prompt: 'Tap the glowing pawn — move it forward.',
    board: { E2: 'P' },
    task: { from: 'E2', to: 'E4' },
    payoff: {
      tag: '2015 · first code, school days',
      text: 'A computer-science classroom in Rajkot, one pawn, an open board. Pawns can never move backwards — small squares forward, every day. Ten years on, I still ship daily.',
    },
  },
  {
    id: 'fianchetto',
    crumb: '2018',
    label: 'ACT II · 2018 · THE PYTHON YEARS',
    title: 'The long diagonal: Python.',
    prompt: 'Fianchetto the bishop — slide it onto the long diagonal.',
    board: {
      E1: 'K', D1: 'Q', A1: 'R', H1: 'R', C1: 'B', F1: 'B', B1: 'N', G1: 'N',
      A2: 'P', B2: 'P', C2: 'P', D2: 'P', E4: 'P', F2: 'P', G3: 'P', H2: 'P',
      E8: 'k', D8: 'q', A8: 'r', H8: 'r', C8: 'b', F8: 'b', B8: 'n', G8: 'n',
      A7: 'p', B7: 'p', C7: 'p', D7: 'p', E5: 'p', F7: 'p', G7: 'p', H7: 'p',
    },
    task: { from: 'F1', to: 'G2' },
    payoff: {
      tag: '2018–21 · bca, python & machine learning',
      text: 'The fianchettoed bishop sees the whole board from a quiet corner. That was my BCA: Python and ML at Saurashtra University — I built Jarvis, a voice assistant, plus a pile of Python, PHP and Java projects. Fundamentals first. Reach later.',
    },
  },
  {
    id: 'gambit',
    crumb: '2019',
    label: 'ACT III · 2019 · THE GAMBIT',
    title: 'I gave up safety for tempo.',
    prompt: 'Play the Queen’s Gambit — offer the pawn to c4.',
    board: {
      E1: 'K', D1: 'Q', A1: 'R', H1: 'R', C1: 'B', F1: 'B', B1: 'N', G1: 'N',
      A2: 'P', B2: 'P', C2: 'P', D4: 'P', E2: 'P', F2: 'P', G2: 'P', H2: 'P',
      E8: 'k', D8: 'q', A8: 'r', H8: 'r', C8: 'b', F8: 'b', B8: 'n', G8: 'n',
      A7: 'p', B7: 'p', C7: 'p', D5: 'p', E7: 'p', F7: 'p', G7: 'p', H7: 'p',
    },
    task: { from: 'C2', to: 'C4' },
    reply: { from: 'D5', to: 'C4' },
    replyLine: 'Black takes the bait. Material lost — initiative gained.',
    payoff: {
      tag: '2019–22 · freelance · the mern leap',
      text: 'Still in college, I gambited: freelance instead of safe. React, Node, Express, MongoDB — the full MERN stack — plus Next.js and Stripe, shipped end to end for real clients. Giving up material teaches you to back yourself.',
    },
  },
  {
    id: 'develop',
    crumb: '2022',
    label: 'ACT IV · 2022 · DEVELOPMENT',
    title: 'Amateurs attack. Professionals develop.',
    prompt: 'Develop the knight to f3.',
    board: {
      E1: 'K', D1: 'Q', A1: 'R', H1: 'R', C1: 'B', F1: 'B', B1: 'N', G1: 'N',
      A2: 'P', B2: 'P', C4: 'P', D4: 'P', E2: 'P', F2: 'P', G2: 'P', H2: 'P',
      E8: 'k', D8: 'q', A8: 'r', H8: 'r', C8: 'b', F8: 'b', B8: 'n', G8: 'n',
      A7: 'p', B7: 'p', C7: 'p', E6: 'p', F7: 'p', G7: 'p', H7: 'p',
    },
    task: { from: 'G1', to: 'F3' },
    payoff: {
      tag: '2022–23 · fox valley → warelogg',
      text: 'Quiet, strong moves: Node/Express backends, JWT auth, Docker and an online code editor at Fox Valley — then logistics platforms on MERN and Next.js at Warelogg. Development looks boring. It decides the game.',
    },
  },
  {
    id: 'castle',
    crumb: '2023',
    label: 'ACT V · 2023 · CASTLING',
    title: 'Structure is not boring. Structure lets you attack.',
    prompt: 'Castle short — move the king two squares.',
    board: {
      E1: 'K', D1: 'Q', A1: 'R', H1: 'R', C1: 'B', B1: 'N', F3: 'N',
      A2: 'P', B2: 'P', C4: 'P', D4: 'P', E3: 'P', F2: 'P', G2: 'P', H2: 'P', E2: 'B',
      E8: 'k', D8: 'q', A8: 'r', H8: 'r', C8: 'b', E7: 'b', B8: 'n', F6: 'n',
      A7: 'p', B7: 'p', C7: 'p', E6: 'p', F7: 'p', G7: 'p', H7: 'p',
    },
    task: { from: 'E1', to: 'G1' },
    extra: { from: 'H1', to: 'F1' },
    payoff: {
      tag: '2023–24 · asite solutions · the angular years',
      text: 'I castled into the enterprise: Angular at Asite — reactive forms, monorepos, Storybook, Jasmine/Karma tests, WCAG accessibility. Intern to engineer. Systems beat heroics; safety first, then the attack.',
    },
  },
  {
    id: 'fork',
    crumb: '2025',
    label: 'ACT VI · 2025 · THE FORK',
    title: 'One move. Two threats.',
    prompt: 'Find the knight fork — check the king, threaten the queen.',
    board: {
      G1: 'K', F1: 'R', A1: 'R', D3: 'Q',
      A2: 'P', B2: 'P', F2: 'P', G2: 'P', H2: 'P', E5: 'N',
      H8: 'k', D8: 'q', E8: 'r',
      A7: 'p', B7: 'p', G6: 'p', H7: 'p',
    },
    task: { from: 'E5', to: 'F7' },
    forked: ['H8', 'D8'],
    payoff: {
      tag: '2025 · upsquare · angular → react · the AI era',
      text: 'The fork is my whole thesis: one engineer, two threats. Angular AND React. The product AND the AI inside it — TypeScript, Node, AWS, Claude API. 11 apps on the Play Store, 249 repos, AI SaaS end to end.',
    },
  },
]

export const PROLOGUE = {
  lines: [
    'Most portfolios tell you what someone did.',
    'This one lets you play through how he thinks.',
    'Python roots to the AI era — you make every move.',
  ],
  signoff: '— his AI twin',
}

export const FINALE = {
  headline: 'Your move.',
  line: 'The only piece missing from this board is you. Checkmate is a hiring decision.',
}
