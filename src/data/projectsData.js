/* The Archive, the back catalog, straight from Urmil's own list. */

export const CATEGORIES = [
  'live on play store',
  'python & ai',
  'web & full-stack',
  'college classics & open source',
]

export const PROJECTS = [
  /* ---- python & ai ---- */
  { name: 'invisibleCloak', cat: 'python & ai', desc: 'A real invisibility cloak with OpenCV, pure Python magic', tech: 'Python · OpenCV', url: 'https://github.com/urmillive/invisibleCloak' },
  { name: 'Jarvis', cat: 'python & ai', desc: 'The original personal-assistant AI, where the voice began (2022)', tech: 'Python · NLP', url: 'https://github.com/urmillive/Jarvis' },
  { name: 'Jarvis 2.0', cat: 'python & ai', desc: 'The upgrade: NLP engine + sleek GUI, built at Parul University', tech: 'Python · NLP · GUI', url: 'https://github.com/urmillive/jarvis2.0' },
  { name: 'Vocab-Reminder', cat: 'python & ai', desc: 'Desktop app that drips new vocabulary into your day', tech: 'Python · Notifications', url: 'https://github.com/urmillive/Vocab-Reminder' },
  { name: 'autoGmeet', cat: 'python & ai', desc: 'Auto-joins your Google Meet calls so you never miss one', tech: 'Python · Automation', url: 'https://github.com/urmillive/autoGmeet' },
  { name: 'python-mini-projects', cat: 'python & ai', desc: 'The Python years, preserved in public', tech: 'Python', url: 'https://github.com/urmillive/python-mini-projects' },
  { name: 'Job Pilot', cat: 'python & ai', desc: 'Job-application automation on autopilot', tech: 'Python · Automation', url: 'https://github.com/urmillive/job-pilot' },

  /* ---- web & full-stack ---- */
  { name: 'Elearning Platform', cat: 'web & full-stack', desc: 'MERN e-learning for aspiring coders, tutorials, forums, live code playground', tech: 'MongoDB · Express · React · Node', url: 'https://github.com/urmillive/Elearning' },
  { name: 'Code-Editor-Web', cat: 'web & full-stack', desc: 'A code editor that runs in the browser', tech: 'JavaScript · Node', url: 'https://github.com/urmillive/Code-Editor-Web' },
  { name: 'covid19', cat: 'web & full-stack', desc: 'Pandemic tracker, final-year project', tech: 'PHP', url: 'https://github.com/urmillive/covid19' },
  { name: 'Netflix Remote', cat: 'web & full-stack', desc: 'An iOS remote control for Netflix', tech: 'Swift · iOS', url: 'https://github.com/urmillive/Netflix-Remote' },
  { name: 'Aprojecto', cat: 'web & full-stack', desc: 'Early full-stack build from the freelance years', tech: 'JavaScript', url: 'https://github.com/urmillive/Aprojecto' },

  /* ---- live on play store ---- */
  { name: 'SplitDost', cat: 'live on play store', live: true, desc: 'Split expenses with friends, the desi way', tech: 'React Native · Android', url: 'https://github.com/urmillive/SplitDost' },
  { name: 'TarotTara', cat: 'live on play store', live: true, desc: 'Tarot readings in your pocket', tech: 'React Native · Android', url: 'https://github.com/urmillive/TarotTara' },
  { name: 'MuhurtMitr', cat: 'live on play store', live: true, desc: 'Auspicious-time finder for every occasion', tech: 'React Native · Android', url: 'https://github.com/urmillive/MuhurtMitr' },
  { name: 'BhavishyaPatra', cat: 'live on play store', live: true, desc: 'Daily predictions, delivered simply', tech: 'React Native · Android', url: 'https://github.com/urmillive/BhavishyaPatra' },
  { name: 'ChandraDiary', cat: 'live on play store', live: true, desc: 'A private journal that follows the moon', tech: 'React Native · Android', url: 'https://github.com/urmillive/ChandraDiary' },
  { name: 'RaagiRashi', cat: 'live on play store', live: true, desc: 'Rashi & astrology companion', tech: 'React Native · Android', url: 'https://github.com/urmillive/RaagiRashi' },
  { name: 'ReelKeep', cat: 'live on play store', live: true, desc: 'Save and organise the reels you love', tech: 'React Native · Android', url: 'https://github.com/urmillive/ReelKeep' },
  { name: 'ScrollStop', cat: 'live on play store', live: true, desc: 'Screen-time control that actually sticks', tech: 'React Native · Android', url: 'https://github.com/urmillive/ScrollStop' },
  { name: 'ParkYaad', cat: 'live on play store', live: true, desc: 'Never forget where you parked again', tech: 'React Native · Android', url: 'https://github.com/urmillive/ParkYaad' },

  /* ---- college classics & open source ---- */
  { name: 'Moju', cat: 'college classics & open source', desc: 'Android meme-sharing app on the Reddit API (2021)', tech: 'Java · Android', url: 'https://github.com/urmillive/Moju' },
  { name: 'COLLEGE', cat: 'college classics & open source', desc: 'Java programs for BCA students, his most-starred repo', tech: 'Java · 12★', url: 'https://github.com/urmillive/COLLEGE' },
  { name: 'JournalApp', cat: 'college classics & open source', desc: 'A journaling app from the learning years', tech: 'JavaScript', url: 'https://github.com/urmillive/JournalApp' },
  { name: 'Music-Player', cat: 'college classics & open source', desc: 'A hand-rolled music player', tech: 'JavaScript', url: 'https://github.com/urmillive/Music-Player' },
  { name: 'TictactoeGameReact', cat: 'college classics & open source', desc: 'Tic-tac-toe, the React way', tech: 'React', url: 'https://github.com/urmillive/TictactoeGameReact' },
  { name: 'Snake Game', cat: 'college classics & open source', desc: 'The classic, hand-rolled', tech: 'JavaScript', url: 'https://github.com/urmillive/snakegame' },
  { name: 'Dice-Rollar', cat: 'college classics & open source', desc: 'Dice roller in Kotlin', tech: 'Kotlin · Android', url: 'https://github.com/urmillive/Dice-Rollar' },
  { name: 'Coding-Gujju-theme', cat: 'college classics & open source', desc: 'His own VS Code theme, open-sourced', tech: 'VS Code · Open source', url: 'https://github.com/urmillive/Coding-Gujju-theme' },
  { name: 'urmil.live', cat: 'college classics & open source', desc: 'This site, the film you are inside right now', tech: 'Vite · WebAudio · zero frameworks', url: 'https://github.com/urmillive/urmil-folio' },
]
