/* Delights: cat backflip, konami chess confetti, live chess.com stats. */

/* ---- beat the cat: 3 clicks = backflip ---- */
let catClicks = 0
let catTimer = null

document.addEventListener('click', (e) => {
  const neko = document.getElementById('oneko')
  if (!neko) return
  const r = neko.getBoundingClientRect()
  const near =
    e.clientX >= r.left - 12 && e.clientX <= r.right + 12 &&
    e.clientY >= r.top - 12 && e.clientY <= r.bottom + 12
  if (!near) return
  catClicks += 1
  clearTimeout(catTimer)
  catTimer = setTimeout(() => { catClicks = 0 }, 1800)
  if (catClicks >= 3) {
    catClicks = 0
    neko.classList.remove('cat-flip')
    void neko.offsetWidth
    neko.classList.add('cat-flip')
    setTimeout(() => neko.classList.remove('cat-flip'), 900)
  }
})

/* ---- konami code: chess-piece confetti ---- */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
let kIdx = 0
const PIECES = ['♚','♛','♜','♝','♞','♟']

export const chessConfetti = (n = 44) => {
  for (let i = 0; i < n; i += 1) {
    const s = document.createElement('span')
    s.className = 'chessfetti'
    s.textContent = PIECES[i % PIECES.length]
    s.style.left = `${(i * 41) % 100}%`
    s.style.animationDelay = `${(i % 11) * 0.12}s`
    s.style.animationDuration = `${2.2 + ((i * 7) % 10) / 6}s`
    s.style.fontSize = `${1 + ((i * 13) % 10) / 8}rem`
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 4200)
  }
}

document.addEventListener('keydown', (e) => {
  kIdx = e.key === KONAMI[kIdx] ? kIdx + 1 : e.key === KONAMI[0] ? 1 : 0
  if (kIdx === KONAMI.length) {
    kIdx = 0
    chessConfetti()
  }
})

/* ---- live chess.com stats on the wall ---- */
export const loadChessStats = async () => {
  const el = document.getElementById('chess-stat')
  if (!el) return
  try {
    const r = await fetch('https://api.chess.com/pub/player/urmillive/stats')
    if (!r.ok) return
    const d = await r.json()
    const rating =
      d.chess_rapid?.last?.rating ?? d.chess_blitz?.last?.rating ?? d.chess_bullet?.last?.rating
    const wins =
      (d.chess_rapid?.record?.win ?? 0) + (d.chess_blitz?.record?.win ?? 0) + (d.chess_bullet?.record?.win ?? 0)
    if (rating) el.textContent = `${rating} rated · ${wins} wins`
  } catch { /* wall shows the static line */ }
}

loadChessStats()
