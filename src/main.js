import '@fontsource-variable/fraunces'
import '@fontsource/ibm-plex-mono/400.css'
import './css/base.css'
import './css/hero.css'
import './css/sections.css'

document.documentElement.classList.add('js')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---- typed hero status line ---- */
const LINE = '// chessboard → codebase · compiled in 0.4s ✓'
const typed = document.getElementById('typed')

const typeLine = () => {
  if (reducedMotion) {
    typed.textContent = LINE
    return
  }
  let i = 0
  const step = () => {
    typed.textContent = LINE.slice(0, i)
    i += 1
    if (i <= LINE.length) setTimeout(step, 26 + Math.random() * 40)
  }
  step()
}

typeLine()

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

/* ---- console easter egg ---- */
console.log(
  '%c♞ Your move.%c\n\nchessboard → codebase · urmil rupareliya\nno template, no clone — view source, it is all real HTML.\nsay hi: urmillive@gmail.com',
  'font-size:2rem; font-weight:700;',
  'font-size:0.85rem; color:#e4572e;'
)
