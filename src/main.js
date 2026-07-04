import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-mono/400.css'
import './css/base.css'
import './css/hero.css'
import './css/board.css'
import './css/playhero.css'
import './css/sections.css'
import './css/chat.css'
import './css/archive.css'
import Lenis from 'lenis'
import { createChessHero } from './game/board.js'
import './oneko.js'
import { createTwinDock } from './twin/chat.js'
import { createArchive } from './archive/archive.js'

document.documentElement.classList.add('js')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---- buttery inertial scroll ---- */
if (!reducedMotion) {
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.05 })
  const raf = (t) => {
    lenis.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}

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

/* ---- the game: play the engineer ---- */
createChessHero({
  boardEl: document.getElementById('board'),
  narrationEl: document.getElementById('narration'),
  progressEl: document.getElementById('story-progress'),
  newGameBtn: document.getElementById('new-game'),
  overlayEl: document.getElementById('gameover'),
})

/* ---- 21st.dev: hero spotlight follows the pointer ---- */
const ph = document.querySelector('.ph')
const spot = document.querySelector('.ph__spot')
if (ph && spot && !reducedMotion) {
  ph.addEventListener(
    'pointermove',
    (e) => {
      const r = ph.getBoundingClientRect()
      spot.style.setProperty('--hx', `${e.clientX - r.left}px`)
      spot.style.setProperty('--hy', `${e.clientY - r.top}px`)
    },
    { passive: true }
  )
}

/* ---- 21st.dev: number tickers on the fact list ---- */
const ticks = document.querySelectorAll('.tick')

const runTick = (el) => {
  const target = Number(el.dataset.count)
  if (reducedMotion || !target) {
    el.textContent = el.dataset.count
    return
  }
  const t0 = performance.now()
  const dur = 1300
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur)
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

if ('IntersectionObserver' in window) {
  const tio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runTick(entry.target)
          tio.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.7 }
  )
  ticks.forEach((el) => tio.observe(el))
} else {
  ticks.forEach(runTick)
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

/* ---- the vault: tap the brand five times ---- */
const vault = document.getElementById('vault')
const brand = document.getElementById('brand')
let taps = 0
let tapTimer = null

brand.addEventListener('click', () => {
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

/* ---- console easter egg ---- */
console.log(
  '%c♞ Your move.%c\n\nchessboard → codebase · urmil rupareliya\npsst — tap "urmil.live" five times. and yes, the chess challenge is real:\nhttps://www.chess.com/member/urmillive\nsay hi: urmillive@gmail.com',
  'font-size:2rem; font-weight:700; color:#e4572e;',
  'font-size:0.85rem; color:#837c6e;'
)

/* ---- The Daily Move: blog list (auto-published by server cron) ---- */
fetch('/blog/index.json')
  .then((r) => (r.ok ? r.json() : []))
  .then((posts) => {
    const list = document.getElementById('blog-list')
    if (!list || !Array.isArray(posts) || !posts.length) return
    posts.slice(0, 7).forEach((p) => {
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.className = 'pos__row'
      a.href = p.url || '#'
      if (/^https?:/.test(a.href)) { a.target = '_blank'; a.rel = 'noopener' }
      const d = document.createElement('span'); d.className = 'pos__sq mono'; d.textContent = (p.date || '').slice(5)
      const t = document.createElement('span'); t.className = 'pos__name'; t.textContent = p.title || ''
      const sm = document.createElement('span'); sm.className = 'pos__desc'; sm.textContent = p.summary || ''
      const arrow = document.createElement('span'); arrow.className = 'pos__arrow'; arrow.textContent = '↗'
      a.append(d, t, sm, arrow)
      li.appendChild(a)
      list.appendChild(li)
    })
  })
  .catch(() => {})
