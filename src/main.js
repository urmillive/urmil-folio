import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-mono/400.css'
import './css/base.css'
import './css/hero.css'
import './css/journey.css'
import './css/board.css'
import './css/stage.css'
import './css/chat.css'
import './css/sections.css'
import { createJourney } from './journey/journey.js'
import { createAudio } from './journey/audio.js'
import { createStage } from './exp/stage.js'
import { createTwinDock } from './twin/chat.js'

document.documentElement.classList.add('js')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---- scroll reveals ---- */
const revealables = document.querySelectorAll('.reveal')

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('in'))
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  revealables.forEach((el) => io.observe(el))
}

/* ---- journey + chess overlay + AI twin ---- */
const expRoot = document.getElementById('experience')
const finaleEl = expRoot.querySelector('.exp__finale')
const actEl = expRoot.querySelector('.exp__act')
const freeplayEl = expRoot.querySelector('.exp__freeplay')
let freePlayReady = false
let openTwin = () => {}

const openOverlay = () => {
  expRoot.hidden = false
  document.body.classList.add('lock')
}

const closeOverlay = () => {
  expRoot.hidden = true
  actEl.hidden = true
  finaleEl.hidden = true
  freeplayEl.hidden = true
  document.body.classList.remove('lock')
}

const openFreePlay = async () => {
  finaleEl.hidden = true
  freeplayEl.hidden = false
  if (!freePlayReady) {
    freePlayReady = true
    const { createChessHero } = await import('./game/board.js')
    createChessHero({
      boardEl: document.getElementById('board'),
      narrationEl: document.getElementById('narration'),
      progressEl: document.getElementById('story-progress'),
      newGameBtn: document.getElementById('new-game'),
      overlayEl: document.getElementById('gameover'),
    })
  }
}

expRoot.querySelector('.exp__fpclose').addEventListener('click', () => {
  freeplayEl.hidden = true
  finaleEl.hidden = false
})

const stage = createStage(expRoot, {
  onFreePlay: openFreePlay,
  onAskTwin: () => openTwin(),
})

expRoot.querySelector('.exp__back').addEventListener('click', closeOverlay)

const audio = createAudio()
const sndBtn = document.getElementById('snd-toggle')
sndBtn.addEventListener('click', () => {
  const on = audio.toggle()
  sndBtn.textContent = on ? 'sound ●' : 'sound ○'
  sndBtn.setAttribute('aria-pressed', String(on))
})

createJourney(document.getElementById('journey'), audio)

document.querySelectorAll('.jn-chess').forEach((btn) =>
  btn.addEventListener('click', () => {
    openOverlay()
    stage.startStory()
  })
)

document.querySelectorAll('.jn-free').forEach((btn) =>
  btn.addEventListener('click', () => {
    openOverlay()
    openFreePlay()
  })
)

openTwin = createTwinDock({
  dockEl: document.getElementById('twin'),
})

document.querySelectorAll('.jn-twin').forEach((btn) =>
  btn.addEventListener('click', () => openTwin())
)

/* ---- console easter egg ---- */
console.log(
  '%c♞ Your move.%c\n\nchessboard → codebase · urmil rupareliya\nno template, no clone — view source, it is all real HTML.\nsay hi: urmillive@gmail.com',
  'font-size:2rem; font-weight:700;',
  'font-size:0.85rem; color:#e4572e;'
)
