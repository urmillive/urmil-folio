import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-mono/400.css'
import './css/base.css'
import './css/hero.css'
import './css/board.css'
import './css/stage.css'
import './css/chat.css'
import './css/sections.css'
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

/* ---- the experience + AI twin ---- */
const expRoot = document.getElementById('experience')
const finaleEl = expRoot.querySelector('.exp__finale')
const freeplayEl = expRoot.querySelector('.exp__freeplay')
let freePlayReady = false
let openTwin = () => {}

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

createStage(expRoot, {
  onFreePlay: openFreePlay,
  onAskTwin: () => openTwin(),
})

openTwin = createTwinDock({
  dockEl: document.getElementById('twin'),
})

/* ---- console easter egg ---- */
console.log(
  '%c♞ Your move.%c\n\nchessboard → codebase · urmil rupareliya\nno template, no clone — view source, it is all real HTML.\nsay hi: urmillive@gmail.com',
  'font-size:2rem; font-weight:700;',
  'font-size:0.85rem; color:#e4572e;'
)
