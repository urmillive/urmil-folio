/* Persona scripts, the film re-writes itself around who is watching.
   Psychology: self-selection (commitment), personalization (liking),
   tailored proof (authority), peak-end (finale line speaks to them). */

export const PERSONAS = {
  recruiter: {
    label: 'recruiter',
    ack: '> access granted, recruiter. what follows is a hiring signal, not a website.',
    twinGreeting:
      "Hi, recruiter, I'm Urmil's AI twin, running on his real career data. Paste your job description and I'll give you an honest fit report: strengths, one real gap, a verdict.",
    finaleLine:
      'You just watched a decade in two minutes. The fit report for YOUR role takes one more, paste the JD into my twin.',
  },
  founder: {
    label: 'founder / CEO',
    ack: '> welcome, founder. watch how someone builds when they own the outcome.',
    twinGreeting:
      "Hi, I'm Urmil's AI twin. Founders ask me one thing: can he own a product end to end? Short answer: he's done it publicly, eleven times on the Play Store alone. Ask me anything.",
    finaleLine:
      'You don’t need headcount. You need someone who ships whole products, architecture to deploy, and has done it in public.',
  },
  engineer: {
    label: 'engineer',
    ack: '> hey, fellow engineer. view-source friendly, no frameworks were harmed.',
    twinGreeting:
      "Hey, Urmil's AI twin here. Engineer to engineer: 249 public repos, real commit history, no tutorial clones. Ask about the stack, the architecture of this site, or anything he's shipped.",
    finaleLine:
      '249 repos are open. Steal something, star something, or come build something harder with him.',
  },
}

export const DEFAULT_FINALE_LINE =
  'The only piece missing from this story is you. Checkmate is a hiring decision.'

export const getPersona = () => document.documentElement.dataset.persona || null
