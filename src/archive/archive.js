/* The Archive — full-screen project explorer, filtered by category.
   All rendering via createElement/textContent (no untrusted innerHTML). */

import { PROJECTS, CATEGORIES } from '../data/projectsData.js'

export const createArchive = (root) => {
  const listEl = root.querySelector('.arch__list')
  const chipsEl = root.querySelector('.arch__chips')
  const countEl = root.querySelector('.arch__count')
  let current = 'all'

  const render = () => {
    listEl.textContent = ''
    const items = PROJECTS.filter((p) => current === 'all' || p.cat === current)
    items.forEach((p) => {
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.className = 'arch__row'
      a.href = p.url
      a.target = '_blank'
      a.rel = 'noopener'

      const name = document.createElement('span')
      name.className = 'arch__name'
      name.textContent = p.name
      if (p.live) {
        const live = document.createElement('span')
        live.className = 'arch__live mono'
        live.textContent = '● live'
        name.appendChild(live)
      }

      const desc = document.createElement('span')
      desc.className = 'arch__desc'
      desc.textContent = p.desc

      const tech = document.createElement('span')
      tech.className = 'arch__tech mono'
      tech.textContent = p.tech

      const arrow = document.createElement('span')
      arrow.className = 'arch__arrow'
      arrow.setAttribute('aria-hidden', 'true')
      arrow.textContent = '↗'

      a.append(name, desc, tech, arrow)
      li.appendChild(a)
      listEl.appendChild(li)
    })
    countEl.textContent = `${items.length} positions shown · 249 public repos total`
  }

  const setFilter = (cat, chip) => {
    current = cat
    chipsEl
      .querySelectorAll('.arch__chip')
      .forEach((c) => c.classList.toggle('arch__chip--on', c === chip))
    render()
  }

  ;['all', ...CATEGORIES].forEach((cat, i) => {
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'arch__chip mono'
    const n = cat === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === cat).length
    chip.textContent = `${cat} · ${n}`
    if (i === 0) chip.classList.add('arch__chip--on')
    chip.addEventListener('click', () => setFilter(cat, chip))
    chipsEl.appendChild(chip)
  })

  render()

  const open = () => {
    root.hidden = false
    document.body.classList.add('lock')
  }
  const close = () => {
    root.hidden = true
    document.body.classList.remove('lock')
  }
  root.querySelector('.arch__close').addEventListener('click', close)
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  return open
}
