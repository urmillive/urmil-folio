import '@fontsource-variable/inter-tight'
import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-mono/400.css'
import './css/base.css'
import './css/hero.css'
import './css/board.css'
import './css/film.css'
import './css/chat.css'
import './css/archive.css'
import { createTwinDock } from './twin/chat.js'
import { createArchive } from './archive/archive.js'

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

/* ---- animated counters ---- */
const stats = document.querySelectorAll('.stat__num')

const runCounter = (el) => {
  const target = Number(el.dataset.count)
  if (reducedMotion) {
    el.textContent = target
    return
  }
  const t0 = performance.now()
  const dur = 1400
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = Math.round(target * eased)
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

if ('IntersectionObserver' in window) {
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target)
          statIo.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.6 }
  )
  stats.forEach((el) => statIo.observe(el))
} else {
  stats.forEach(runCounter)
}

/* ---- AI twin ---- */
const openTwin = createTwinDock({ dockEl: document.getElementById('twin') })
document.querySelectorAll('.jn-twin').forEach((btn) =>
  btn.addEventListener('click', () => openTwin())
)

/* ---- archive ---- */
const openArchive = createArchive(document.getElementById('archive'))
document.querySelectorAll('.jn-archive').forEach((btn) =>
  btn.addEventListener('click', () => openArchive())
)

/* ---- free-play chess (easter egg) ---- */
const expRoot = document.getElementById('experience')
let chessReady = false

document.querySelector('.fp-open').addEventListener('click', async () => {
  expRoot.hidden = false
  document.body.classList.add('lock')
  if (!chessReady) {
    chessReady = true
    const { createChessHero } = await import('./game/board.js')
    createChessHero({
      boardEl: document.getElementById('board'),
      narrationEl: document.getElementById('narration'),
      progressEl: document.getElementById('story-progress'),
      newGameBtn: document.getElementById('new-game'),
      overlayEl: document.getElementById('gameover'),
    })
  }
})

expRoot.querySelector('.exp__fpclose').addEventListener('click', () => {
  expRoot.hidden = true
  document.body.classList.remove('lock')
})

/* ---- the vault: tap the portrait five times ---- */
const vault = document.getElementById('vault')
const portrait = document.getElementById('portrait')
let taps = 0
let tapTimer = null

portrait.addEventListener('click', () => {
  taps += 1
  clearTimeout(tapTimer)
  tapTimer = setTimeout(() => {
    taps = 0
  }, 2500)
  if (taps >= 5) {
    taps = 0
    vault.hidden = false
    document.body.classList.add('lock')
  }
})

vault.querySelector('.vault__close').addEventListener('click', () => {
  vault.hidden = true
  document.body.classList.remove('lock')
})

/* ---- console easter eggs ---- */
console.log(
  '%c♞ Your move.%c\n\nfrom a small town in gujarat, to the AI era.\npsst — tap his photo five times.\nsay hi: urmillive@gmail.com',
  'font-size:2rem; font-weight:700; color:#ff6b3d;',
  'font-size:0.85rem; color:#86868b;'
)
