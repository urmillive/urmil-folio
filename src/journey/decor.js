/* Decorative hand layer — mandalas, clouds, moon & stars, cartoon story
   icons. All static SVG strings authored here (no untrusted content). */

const SVG_NS = 'http://www.w3.org/2000/svg'

/* ---- mandala: generated line-print, 12-fold ---- */
export const buildMandala = () => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '-50 -50 100 100')
  svg.classList.add('mandala')
  svg.setAttribute('aria-hidden', 'true')
  const g = document.createElementNS(SVG_NS, 'g')
  ;[46, 38, 30, 16, 7].forEach((r) => {
    const c = document.createElementNS(SVG_NS, 'circle')
    c.setAttribute('r', r)
    g.appendChild(c)
  })
  for (let i = 0; i < 12; i += 1) {
    const petal = document.createElementNS(SVG_NS, 'path')
    petal.setAttribute('d', 'M0,-38 C6,-31 6,-23 0,-16 C-6,-23 -6,-31 0,-38')
    petal.setAttribute('transform', `rotate(${i * 30})`)
    g.appendChild(petal)
    const inner = document.createElementNS(SVG_NS, 'path')
    inner.setAttribute('d', 'M0,-30 C3,-26 3,-20 0,-16 C-3,-20 -3,-26 0,-30')
    inner.setAttribute('transform', `rotate(${i * 30 + 15})`)
    g.appendChild(inner)
    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cy', '-42')
    dot.setAttribute('r', '1.6')
    dot.setAttribute('transform', `rotate(${i * 30 + 15})`)
    g.appendChild(dot)
  }
  svg.appendChild(g)
  return svg
}

/* ---- hand-drawn cloud ---- */
const CLOUD_PATH =
  'M10 30 Q9 21 18 20 Q20 11 30 13 Q37 6 45 13 Q55 12 54 22 Q62 26 56 31 Q50 35 42 33 Q34 37 26 33 Q16 35 10 30 Z'

const buildCloud = () => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 64 42')
  svg.classList.add('cloud')
  svg.setAttribute('aria-hidden', 'true')
  const p = document.createElementNS(SVG_NS, 'path')
  p.setAttribute('d', CLOUD_PATH)
  svg.appendChild(p)
  return svg
}

/* ---- cartoon story icons (line art, self-drawing) ---- */
const ICONS = {
  boot: '<rect x="10" y="6" width="44" height="30" rx="3"/><path d="M32 30 C25 24 23 17 28 15 C31 14 32 17 32 18 C32 17 33 14 36 15 C41 17 39 24 32 30 Z"/><path d="M25 42 h14 M32 36 v6"/>',
  jarvis:
    '<rect x="15" y="13" width="34" height="26" rx="7"/><circle cx="26" cy="25" r="2.6"/><circle cx="38" cy="25" r="2.6"/><path d="M25 32 q7 5 14 0 M32 13 V7"/><circle cx="32" cy="5" r="2"/>',
  leap: '<path d="M5 27 L59 7 L37 43 L30 29 Z"/><path d="M30 29 L59 7"/>',
  enterprise:
    '<path d="M6 42 V20 h11 v22 M17 42 V10 h14 v32 M31 42 V24 h11 v18 M42 42 V15 h13 v27 M3 42 h58"/><path d="M21 16 h6 M21 22 h6 M21 28 h6"/>',
  ai: '<path d="M32 42 C17 30 13 16 22 12 C28 10 32 16 32 18 C32 16 36 10 42 12 C51 16 47 30 32 42 Z"/><path d="M32 20 v8 M28 24 h8"/>',
  finale:
    '<path d="M12 30 Q20 18 32 22 Q44 18 52 30"/><path d="M22 26 l8 8 M42 26 l-8 8"/><circle cx="32" cy="34" r="3"/>',
}

const buildIcon = (kind) => {
  if (!ICONS[kind]) return null
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 64 48')
  svg.classList.add('scene-icon')
  svg.setAttribute('aria-hidden', 'true')
  svg.innerHTML = ICONS[kind]
  return svg
}

/* ---- night sky: crescent + stars ---- */
const buildNightSky = () => {
  const wrap = document.createElement('div')
  wrap.className = 'nightsky'
  wrap.setAttribute('aria-hidden', 'true')
  const moon = document.createElementNS(SVG_NS, 'svg')
  moon.setAttribute('viewBox', '0 0 40 40')
  moon.classList.add('moon')
  moon.innerHTML = '<path d="M28 6 A15 15 0 1 0 34 26 A12 12 0 1 1 28 6 Z"/>'
  wrap.appendChild(moon)
  for (let i = 0; i < 7; i += 1) {
    const star = document.createElement('span')
    star.className = 'star'
    star.textContent = '✦'
    star.style.left = `${Math.min(92, 8 + ((i * 37) % 84))}%`
    star.style.top = `${6 + ((i * 23) % 30)}%`
    star.style.animationDelay = `${(i * 0.7) % 3}s`
    wrap.appendChild(star)
  }
  return wrap
}

export const decorate = (root) => {
  root.querySelectorAll('[data-scene]').forEach((scene) => {
    const kind = scene.dataset.scene
    const stick = scene.querySelector('.jstick')
    const head = scene.querySelector('.jhead')

    /* story icon above the chapter title */
    const icon = buildIcon(kind)
    if (icon && head) head.prepend(icon)

    if (scene.classList.contains('jscene--dark')) {
      stick.prepend(buildNightSky())
    } else if (kind === 'title' || kind === 'leap' || kind === 'finale') {
      for (let i = 0; i < 3; i += 1) {
        const cloud = buildCloud()
        cloud.style.top = `${8 + i * 11}%`
        cloud.style.animationDuration = `${70 + i * 25}s`
        cloud.style.animationDelay = `${-i * 30}s`
        stick.prepend(cloud)
      }
    }

    if (kind === 'title' || kind === 'finale') {
      const m = buildMandala()
      m.classList.add(kind === 'title' ? 'mandala--corner' : 'mandala--big')
      stick.prepend(m)
      if (kind === 'title') {
        const m2 = buildMandala()
        m2.classList.add('mandala--corner', 'mandala--corner-left')
        stick.prepend(m2)
      }
    }
  })
}
