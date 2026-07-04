/* Seven moves, one engineer — the career as playable chess.
   Facts straight from Urmil's real record. */

export const ACTS = [
  {
    id: 'pawn',
    crumb: '2015',
    label: 'MOVE I · 2015 · RAJKOT · CLASS 10',
    title: 'Every engineer starts as a pawn.',
    prompt: 'Tap the glowing pawn — move it forward.',
    board: { E2: 'P' },
    task: { from: 'E2', to: 'E4' },
    payoff: {
      tag: '2015–17 · class 10 → 12 · first code',
      text: 'Class 10, Rajkot: his first HTML & CSS pages. By class 12: C++, conquered. Pawns can never move backwards — ten years on, he still ships daily.',
    },
  },
  {
    id: 'fianchetto',
    crumb: 'college',
    label: 'MOVE II · 2018–23 · THE LONG DIAGONAL',
    title: 'First laptop. Then Python.',
    prompt: 'Fianchetto the bishop — slide it onto the long diagonal.',
    board: {
      E1: 'K', D1: 'Q', A1: 'R', H1: 'R', C1: 'B', F1: 'B', B1: 'N', G1: 'N',
      A2: 'P', B2: 'P', C2: 'P', D2: 'P', E4: 'P', F2: 'P', G3: 'P', H2: 'P',
      E8: 'k', D8: 'q', A8: 'r', H8: 'r', C8: 'b', F8: 'b', B8: 'n', G8: 'n',
      A7: 'p', B7: 'p', C7: 'p', D7: 'p', E5: 'p', F7: 'p', G7: 'p', H7: 'p',
    },
    task: { from: 'F1', to: 'G2' },
    payoff: {
      tag: '2018–23 · bca → mca · 12+ hackathon projects',
      text: '2018: BCA begins and he gets his first laptop — the long diagonal opens. Python projects, Jarvis the voice assistant, invisibleCloak in OpenCV; then an MCA in Cyber Security at Parul, hunting hackathons with 12+ projects across IT domains.',
    },
  },
  {
    id: 'gambit',
    crumb: 'freelance',
    label: 'MOVE III · 2019–22 · THE GAMBIT',
    title: 'He gave up safety for tempo.',
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
      tag: '2019–22 · freelance · three years solo',
      text: 'Mid-college, he went freelance instead of safe: React, Angular, React Native, Next.js — client products owned end to end, from requirements to deployment. Gambits teach you to back yourself.',
    },
  },
  {
    id: 'develop',
    crumb: 'startups',
    label: 'MOVE IV · 2022–23 · DEVELOPMENT',
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
      text: 'Quiet, strong moves: REST APIs, MongoDB and an online code editor at Fox Valley — then Warelogg, a logistics startup built with IIT students: order management, shipment tracking, route optimization.',
    },
  },
  {
    id: 'castle',
    crumb: 'asite',
    label: 'MOVE V · 2023–25 · CASTLING',
    title: 'Structure is what lets you attack.',
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
      tag: '2023–25 · asite · intern → associate engineer',
      text: 'He castled into the enterprise: Asite, Ahmedabad — intern to Associate Software Engineer-I in 2½ years. Angular, Angular Material, Reactive Forms, Storybook. The Angular & TypeScript era begins here.',
    },
  },
  {
    id: 'fork',
    crumb: 'upsquare',
    label: 'MOVE VI · AUG 2025 · THE FORK',
    title: 'One move. Two threats.',
    prompt: 'Puzzle: find the knight fork — check the king, threaten the queen.',
    board: {
      G1: 'K', F1: 'R', A1: 'R', D3: 'Q',
      A2: 'P', B2: 'P', F2: 'P', G2: 'P', H2: 'P', E5: 'N',
      H8: 'k', D8: 'q', E8: 'r',
      A7: 'p', B7: 'p', G6: 'p', H7: 'p',
    },
    task: { from: 'E5', to: 'F7' },
    forked: ['H8', 'D8'],
    payoff: {
      tag: 'aug 2025 · upsquare · the ai era',
      text: 'The fork is his whole thesis: one engineer, two threats. At Upsquare he runs 3–4 real products at once — scalable Angular + TypeScript frontends with AI tools in every workflow. The product AND the AI inside it.',
    },
  },
  {
    id: 'mate',
    crumb: 'ship',
    label: 'MOVE VII · THE FINISH',
    title: 'Shipping is checkmate.',
    prompt: 'Puzzle: mate in one. Finish it.',
    board: {
      A1: 'R', G1: 'K', F2: 'P', G2: 'P', H2: 'P', F3: 'N',
      G8: 'k', F7: 'p', G7: 'p', H7: 'p', F5: 'b', C7: 'p',
    },
    task: { from: 'A1', to: 'A8' },
    mate: ['G8'],
    payoff: {
      tag: 'the record — all public',
      text: 'Back-rank. Game over. His finishes are public: 11 apps live on the Play Store, 249 open-source repos, triumph at Gateway’s TECHATHON ’22, Hacktoberfest since 2020, GDSC & the Indian developers community. Shipping is checkmate.',
    },
  },
]

export const FINALE = {
  headline: 'Your move.',
  line: 'The only piece missing from this board is you. Checkmate is a hiring decision.',
}
