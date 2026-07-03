/* The scroll journey — five cinematic eras + finale.
   Universal interaction: scroll and watch. Scenes wake once when they
   enter the viewport; typed lines + staged props per era. */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
  boot: async (scene) => {
    const lines = scene.querySelectorAll('.crt__line')
    await typeInto(lines[0], '> 2015 · rajkot · school computer lab', 24)
    await typeInto(lines[1], '> print("hello, world")', 30)
    await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 350))
    lines[2].textContent = 'hello, world'
    lines[2].classList.add('crt__line--out')
    scene.classList.add('jscene--lit')
  },
  jarvis: async (scene) => {
    scene.classList.add('jscene--lit')
    const line = scene.querySelector('.jarvis__cmd')
    await typeInto(line, '>>> jarvis.listen()', 40)
    scene.querySelector('.jarvis__wave').classList.add('wave--on')
    await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 500))
    await typeInto(scene.querySelector('.jarvis__reply'), '“yes, urmil?”', 50)
  },
  leap: async (scene) => {
    scene.classList.add('jscene--lit')
    await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 1600))
    scene.querySelector('.toast').classList.add('toast--in')
  },
  enterprise: async (scene) => {
    scene.classList.add('jscene--lit')
    const checks = scene.querySelectorAll('.bp__check')
    for (const c of checks) {
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 420))
      c.classList.add('bp__check--on')
    }
  },
  ai: async (scene) => {
    scene.classList.add('jscene--lit')
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
    scene.classList.add('jscene--lit')
  },
}

export const createJourney = (root) => {
  const scenes = root.querySelectorAll('[data-scene]')
  const played = new Set()

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
