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
import './delights.js'
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

/* ---- The Daily Move: newspaper renderer (auto-published by server cron) ---- */
const safeHref = (url) => {
  try {
    const u = new URL(url, location.href)
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href
  } catch { /* fall through */ }
  return null
}

const paperDate = document.getElementById('paper-date')
if (paperDate) {
  paperDate.textContent = new Date()
    .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase()
}

/* posts cache + slug helper for the article route */
let paperPosts = []
const slugOf = (post) =>
  post.slug ||
  (post.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

fetch('/blog/index.json')
  .then((r) => (r.ok ? r.json() : []))
  .then((posts) => {
    paperPosts = Array.isArray(posts) ? posts : []
    route()
    const body = document.getElementById('paper-body')
    if (!body || !paperPosts.length) return

    /* every headline opens its own article page inside the site */
    const linkWrap = (post, inner) => {
      const a = document.createElement('a')
      a.href = `#/paper/${slugOf(post)}`
      a.appendChild(inner)
      return a
    }

    /* lead story */
    const [lead, ...rest] = posts
    const leadEl = document.createElement('article')
    leadEl.className = 'lead'
    const inner = document.createElement('div')
    const kick = document.createElement('p')
    kick.className = 'lead__kicker mono'
    kick.textContent = `today's move · ${lead.date || ''}`
    const h = document.createElement('h3')
    h.className = 'lead__head'
    h.textContent = lead.title || ''
    const sum = document.createElement('p')
    sum.className = 'lead__sum'
    sum.textContent = lead.summary || ''
    inner.append(kick, h, sum)
    leadEl.appendChild(linkWrap(lead, inner))
    body.appendChild(leadEl)

    /* briefs in columns */
    if (rest.length) {
      const briefs = document.createElement('div')
      briefs.className = 'paper__briefs'
      rest.slice(0, 11).forEach((p) => {
        const art = document.createElement('article')
        art.className = 'brief'
        const wrap = document.createElement('div')
        const d = document.createElement('p'); d.className = 'brief__date mono'; d.textContent = p.date || ''
        const bh = document.createElement('h4'); bh.className = 'brief__head'; bh.textContent = p.title || ''
        const bs = document.createElement('p'); bs.className = 'brief__sum'; bs.textContent = p.summary || ''
        wrap.append(d, bh, bs)
        art.appendChild(linkWrap(p, wrap))
        briefs.appendChild(art)
      })
      body.appendChild(briefs)
    }
  })
  .catch(() => {})

/* ---- tiny hash router: #/archive and #/paper/<slug> are real pages ---- */
const ARTICLE_ART = [
  '/journey-ai.jpg',
  '/journey-boot.jpg',
  '/journey-enterprise.jpg',
  '/journey-jarvis.jpg',
  '/journey-leap.jpg',
]

const artFor = (slug) => {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 997
  return ARTICLE_ART[h % ARTICLE_ART.length]
}

const renderArticle = (slug) => {
  const post = paperPosts.find((p) => slugOf(p) === slug)
  if (!post) return false

  document.getElementById('art-date').textContent = (post.date || '').toUpperCase()
  document.getElementById('art-head').textContent = post.title || ''
  document.getElementById('art-by').textContent =
    `By Urmil Rupareliya · The Daily Move · ${post.date || ''}`

  const img = document.getElementById('art-img')
  img.src = safeHref(post.image) && post.image.startsWith('http') ? post.image : (post.image || artFor(slug))
  document.getElementById('art-cap').textContent =
    post.caption || 'illustration from the daily move archive'

  const text = document.getElementById('art-text')
  text.textContent = ''
  const paras = Array.isArray(post.body) && post.body.length
    ? post.body
    : [post.summary || '', 'The full story is at the source link below. I read it so you get the short version, every single day.']
  paras.filter(Boolean).forEach((p) => {
    const el = document.createElement('p')
    el.textContent = p
    text.appendChild(el)
  })

  const src = document.getElementById('art-src')
  src.textContent = ''
  const href = safeHref(post.url)
  if (href) {
    src.append('source: ')
    const a = document.createElement('a')
    a.href = href
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.textContent = href.replace(/^https?:\/\//, '').slice(0, 60)
    src.appendChild(a)
  }
  return true
}

const mainEl = document.querySelector('main')
const footerEl = document.querySelector('.footer')
const archivePage = document.getElementById('archive')
const articlePage = document.getElementById('article')

const route = () => {
  const h = location.hash
  const art = h.match(/^#\/paper\/([a-z0-9-]+)$/)
  const isArchive = h === '#/archive'
  const showArticle = !!art && renderArticle(art[1])
  const isPage = isArchive || showArticle

  mainEl.hidden = isPage
  footerEl.hidden = isPage
  archivePage.hidden = !isArchive
  articlePage.hidden = !showArticle
  if (isPage) window.scrollTo(0, 0)
}

window.addEventListener('hashchange', route)
document.getElementById('art-back').addEventListener('click', () => {
  location.hash = '#blog'
})
route()
