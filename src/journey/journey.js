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
      if (i > 0 && text[i - 1] !== ' ') sfx.tick()
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

  /* the movable king — Urmil himself */
  const king = root.querySelector('.king')
  if (king) {
    let dragging = false
    let sx = 0
    let sy = 0
    let x = 0
    let y = 0
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
