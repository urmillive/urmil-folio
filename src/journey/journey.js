/* The scroll journey — five cinematic eras + finale.
   Universal interaction: scroll and watch. Scenes wake once when they
   enter the viewport; typed lines + staged props per era. */

import { PERSONAS } from './personas.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let sfx = { tick() {}, boot() {}, ding() {}, check() {}, chime() {}, speak() {} }

const typeInto = (el, text, speed = 34) =>
  new Promise((resolve) => {
    if (reducedMotion) {
      el.textContent = text
      return resolve()
    }
    let i = 0
    const step = () => {
      el.textContent = text.slice(0, i)
      i += 1
      if (i <= text.length) setTimeout(step, speed + Math.random() * 30)
      else resolve()
    }
    step()
  })

const SCENE_SCRIPTS = {
  title: async (scene) => {
    scene.classList.add('jscene--lit')
  },
  boot: async (scene) => {
    sfx.boot()
    const lines = scene.querySelectorAll('.crt__line')
    await typeInto(lines[0], '> 2015 · rajkot · school computer lab', 24)
    await typeInto(lines[1], '> print("hello, world")', 30)
    await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 350))
    lines[2].textContent = 'hello, world'
    lines[2].classList.add('crt__line--out')
    sfx.ding()
    scene.classList.add('jscene--lit')
  },
  jarvis: async (scene) => {
    scene.classList.add('jscene--lit')
    const line = scene.querySelector('.jarvis__cmd')
    await typeInto(line, '>>> jarvis.listen()', 40)
    scene.querySelector('.jarvis__wave').classList.add('wave--on')
    await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 500))
    sfx.speak('Yes, Urmil?')
    await typeInto(scene.querySelector('.jarvis__reply'), '“yes, urmil?”', 50)
  },
  leap: async (scene) => {
    scene.classList.add('jscene--lit')
    await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 1600))
    sfx.ding()
    scene.querySelector('.toast').classList.add('toast--in')
  },
  enterprise: async (scene) => {
    scene.classList.add('jscene--lit')
    const checks = scene.querySelectorAll('.bp__check')
    for (const c of checks) {
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 420))
      sfx.check()
      c.classList.add('bp__check--on')
    }
  },
  ai: async (scene) => {
    scene.classList.add('jscene--lit')
    sfx.chime()
    const msgs = scene.querySelectorAll('.aichat__msg')
    for (const m of msgs) {
      const text = m.dataset.text
      m.classList.add('aichat__msg--in')
      await typeInto(m.querySelector('.aichat__text'), text, 18)
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 260))
    }
    scene.querySelector('.aichat__cta').classList.add('aichat__cta--in')
  },
  finale: async (scene) => {
    sfx.chime()
    scene.classList.add('jscene--lit')
    const p = document.documentElement.dataset.persona
    if (p && PERSONAS[p]) {
      scene.querySelector('.exp__finline').textContent = PERSONAS[p].finaleLine
    }
  },
}

export const createJourney = (root, audio) => {
  if (audio) sfx = audio
  const scenes = root.querySelectorAll('[data-scene]')
  const played = new Set()

  /* film reel markers — a movie detail, injected once */
  scenes.forEach((scene, i) => {
    const reel = document.createElement('span')
    reel.className = 'jreel mono'
    reel.textContent = `reel ${String(i + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`
    reel.setAttribute('aria-hidden', 'true')
    scene.querySelector('.jstick').appendChild(reel)
  })

  /* sparkles — pointer trail on the title card */
  const spawnSpark = (px, py) => {
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

  const titleStick = root.querySelector('.jscene--title .jstick')
  if (titleStick && !reducedMotion) {
    let lastSpark = 0
    titleStick.addEventListener(
      'pointermove',
      (e) => {
        const now = performance.now()
        if (now - lastSpark < 50) return
        lastSpark = now
        spawnSpark(e.clientX, e.clientY)
      },
      { passive: true }
    )
  }

  /* the movable king — drag him into his name to knock it flying */
  const king = root.querySelector('.king')
  const letters = [...root.querySelectorAll('.tl')]
  const hintEl = root.querySelector('.title__hint')
  if (king) {
    let dragging = false
    let sx = 0
    let sy = 0
    let x = 0
    let y = 0
    let knocked = 0
    let resetTimer = null

    const reassemble = () => {
      letters.forEach((l) => l.classList.remove('tl--hit'))
      knocked = 0
      sfx.chime()
      if (hintEl) {
        hintEl.textContent =
          'knocked down five times — reassembled in one. that’s the whole résumé.'
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
      king.classList.add('king--drag')
      sx = e.clientX - x
      sy = e.clientY - y
      king.setPointerCapture(e.pointerId)
      sfx.tick()
    })
    king.addEventListener('pointermove', (e) => {
      if (!dragging) return
      x = e.clientX - sx
      y = e.clientY - sy
      const tilt = Math.max(-14, Math.min(14, x * 0.04))
      king.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg)`
      tryKnock()
    })
    const drop = () => {
      if (!dragging) return
      dragging = false
      king.classList.remove('king--drag')
      king.style.transform = `translate(${x}px, ${y}px)`
      sfx.check()
    }
    king.addEventListener('pointerup', drop)
    king.addEventListener('pointercancel', drop)
  }

  /* persona: the film re-scripts itself around the viewer */
  const ackEl = root.querySelector('.persona__ack')
  root.querySelectorAll('.persona__chip').forEach((chip) =>
    chip.addEventListener('click', () => {
      const p = chip.dataset.persona
      document.documentElement.dataset.persona = p
      root
        .querySelectorAll('.persona__chip')
        .forEach((c) => c.classList.toggle('persona__chip--on', c === chip))
      sfx.ding()
      typeInto(ackEl, PERSONAS[p].ack, 18)
    })
  )

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const scene = entry.target
        const kind = scene.dataset.scene
        if (played.has(kind)) return
        played.add(kind)
        scene.classList.add('jscene--active')
        SCENE_SCRIPTS[kind]?.(scene)
      })
    },
    { threshold: 0.45 }
  )
  scenes.forEach((s) => io.observe(s))

  /* the king travels with you through the story */
  if (!reducedMotion) {
    const comp = document.createElement('img')
    comp.src = '/pieces/klt.svg'
    comp.alt = ''
    comp.className = 'companion'
    comp.setAttribute('aria-hidden', 'true')
    document.body.appendChild(comp)

    const WAYPOINTS = [
      { x: 85, y: 76 },
      { x: 10, y: 70 },
      { x: 86, y: 72 },
      { x: 9, y: 75 },
      { x: 85, y: 68 },
      { x: 14, y: 80 },
    ]
    const sceneEls = [...scenes]

    const updateCompanion = () => {
      const vh = window.innerHeight
      const startY = sceneEls[1].offsetTop - vh * 0.55
      const endY = sceneEls[sceneEls.length - 1].offsetTop
      const journeyBottom = root.offsetTop + root.offsetHeight
      const visible = window.scrollY >= startY && window.scrollY < journeyBottom - vh * 0.6
      comp.classList.toggle('companion--on', visible)
      if (!visible) return
      const t = Math.min(1, Math.max(0, (window.scrollY - startY) / (endY - startY)))
      const seg = t * (WAYPOINTS.length - 1)
      const i = Math.min(WAYPOINTS.length - 2, Math.floor(seg))
      const f = seg - i
      const wx = WAYPOINTS[i].x + (WAYPOINTS[i + 1].x - WAYPOINTS[i].x) * f
      const wy = WAYPOINTS[i].y + (WAYPOINTS[i + 1].y - WAYPOINTS[i].y) * f
      comp.style.left = `${wx}vw`
      comp.style.top = `${wy}svh`
    }
    window.addEventListener('scroll', () => requestAnimationFrame(updateCompanion), {
      passive: true,
    })
    updateCompanion()

    comp.addEventListener('click', () => {
      comp.classList.add('companion--hop')
      setTimeout(() => comp.classList.remove('companion--hop'), 550)
      const r = comp.getBoundingClientRect()
      for (let i = 0; i < 8; i += 1) spawnSpark(r.x + r.width / 2, r.y + r.height / 3)
      sfx.check()
    })
  }

  /* scroll scrub: giant era numeral drifts as you pass through */
  if (!reducedMotion) {
    let ticking = false
    const scrub = () => {
      ticking = false
      const vh = window.innerHeight
      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > vh) return
        const total = rect.height - vh
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0.5
        scene.style.setProperty('--p', p.toFixed(4))
      })
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(scrub)
        }
      },
      { passive: true }
    )
    scrub()
  }
}
