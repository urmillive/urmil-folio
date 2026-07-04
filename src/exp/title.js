/* Title card — the movable king, the knockable name, persona choice,
   and the hidden vault (tap the king 5 times to find the gallery). */

import { PERSONAS } from '../journey/personas.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const typeInto = (el, text, speed = 20) => {
  if (reducedMotion) {
    el.textContent = text
    return
  }
  let i = 0
  const step = () => {
    el.textContent = text.slice(0, i)
    i += 1
    if (i <= text.length) setTimeout(step, speed + Math.random() * 25)
  }
  step()
}

export const createTitle = ({ root, sfx, vaultEl }) => {
  /* sparkles */
  const spawnSpark = (px, py) => {
    if (reducedMotion) return
    const s = document.createElement('span')
    s.className = 'spark'
    s.textContent = '✦'
    s.style.left = `${px}px`
    s.style.top = `${py}px`
    s.style.setProperty('--sx', `${Math.random() * 70 - 35}px`)
    s.style.setProperty('--sy', `${Math.random() * -60 - 12}px`)
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 800)
  }

  /* king drag + name knock */
  const king = root.querySelector('.king')
  const letters = [...root.querySelectorAll('.tl')]
  const hintEl = root.querySelector('.title__hint')
  let dragging = false
  let moved = false
  let sx = 0
  let sy = 0
  let x = 0
  let y = 0
  let knocked = 0
  let resetTimer = null
  let taps = 0
  let tapTimer = null

  const reassemble = () => {
    letters.forEach((l) => l.classList.remove('tl--hit'))
    knocked = 0
    sfx.chime()
    if (hintEl) {
      hintEl.textContent = 'knocked down five times — reassembled in one. that’s the whole résumé.'
      hintEl.classList.add('title__hint--accent')
    }
  }

  const tryKnock = () => {
    const kr = king.getBoundingClientRect()
    letters.forEach((letter) => {
      if (letter.classList.contains('tl--hit')) return
      const r = letter.getBoundingClientRect()
      const hit = !(
        kr.right < r.left + 12 ||
        kr.left > r.right - 12 ||
        kr.bottom < r.top + 12 ||
        kr.top > r.bottom - 12
      )
      if (!hit) return
      letter.classList.add('tl--hit')
      letter.style.setProperty('--dx', `${Math.random() * 180 - 90}px`)
      letter.style.setProperty('--dy', `${Math.random() * -130 - 30}px`)
      letter.style.setProperty('--rot', `${Math.random() * 56 - 28}deg`)
      sfx.check()
      knocked += 1
      for (let i = 0; i < 6; i += 1) spawnSpark(r.x + r.width / 2, r.y + r.height / 2)
      clearTimeout(resetTimer)
      resetTimer = setTimeout(reassemble, knocked >= letters.length ? 800 : 1700)
    })
  }

  king.addEventListener('pointerdown', (e) => {
    dragging = true
    moved = false
    king.classList.add('king--drag')
    sx = e.clientX - x
    sy = e.clientY - y
    king.setPointerCapture(e.pointerId)
  })
  king.addEventListener('pointermove', (e) => {
    if (!dragging) return
    const nx = e.clientX - sx
    const ny = e.clientY - sy
    if (Math.abs(nx - x) + Math.abs(ny - y) > 2) moved = true
    x = nx
    y = ny
    const tilt = Math.max(-14, Math.min(14, x * 0.04))
    king.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg)`
    tryKnock()
  })
  const drop = () => {
    if (!dragging) return
    dragging = false
    king.classList.remove('king--drag')
    king.style.transform = `translate(${x}px, ${y}px)`
    if (moved) {
      sfx.check()
      return
    }
    /* a clean tap — count towards the vault */
    taps += 1
    clearTimeout(tapTimer)
    tapTimer = setTimeout(() => {
      taps = 0
    }, 2500)
    if (taps >= 5 && vaultEl) {
      taps = 0
      sfx.chime()
      vaultEl.hidden = false
      document.body.classList.add('lock')
    }
  }
  king.addEventListener('pointerup', drop)
  king.addEventListener('pointercancel', drop)

  if (vaultEl) {
    vaultEl.querySelector('.vault__close').addEventListener('click', () => {
      vaultEl.hidden = true
      document.body.classList.remove('lock')
    })
  }

  /* persona */
  const ackEl = root.querySelector('.persona__ack')
  root.querySelectorAll('.persona__chip').forEach((chip) =>
    chip.addEventListener('click', () => {
      const p = chip.dataset.persona
      document.documentElement.dataset.persona = p
      root
        .querySelectorAll('.persona__chip')
        .forEach((c) => c.classList.toggle('persona__chip--on', c === chip))
      sfx.ding()
      typeInto(ackEl, PERSONAS[p].ack)
    })
  )

  console.log('%c♞ psst — tap the king five times.', 'color:#e4572e')
}
