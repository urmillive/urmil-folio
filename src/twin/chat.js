/* "Ask my AI twin", Claude-powered chat dock (server proxy at /api/twin).
   All message rendering uses textContent, user/API strings never touch innerHTML. */

import { PERSONAS, getPersona } from '../journey/personas.js'

const API_URL = '/api/twin'
const MAX_HISTORY = 16

const OFFLINE_FAQ = [
  {
    match: /hire|why you|why should/i,
    reply:
      "Honest pitch: in the Claude era you don't hire syntax writers, you hire system builders. Urmil designs architectures (HLD/LLD, microservices) and ships actual systems on whatever stack the problem needs: web apps, full-stack SaaS, mobile. The proof is public, 249 open-source repos on GitHub, 11 apps on the Play Store, AI SaaS built end to end. Writing from scratch and maintaining at scale are different skills; he's shipped both. Long version: urmillive@gmail.com.",
  },
  {
    match: /ai|claude|gpt|copilot|syntax|tools/i,
    reply:
      "Frameworks are syntax; systems are thinking. In the era of Claude and AI tools, the valuable engineer isn't the one who memorised a language, it's the one who can design the system, drive the AI, and own the result on any technology. That's how Urmil works: architecture first, AI as leverage, code as the last mile. His AI-built products are live and public.",
  },
  {
    match: /stack|tech|skill/i,
    reply:
      'Frontend: Angular, React, Next.js, TypeScript. Backend: Node, Express, NestJS, GraphQL, MongoDB/PostgreSQL. Mobile: React Native, Swift, Android. DevOps: Docker, K8s, AWS, Jenkins. AI: Claude & OpenAI APIs in shipped products.',
  },
  {
    match: /experience|career|work/i,
    reply:
      'Freelance (2019-22) → Fox Valley (2022) → Warelogg, a startup built with IIT students (2022-23) → Asite (2023-25, intern → Associate Software Engineer-I, the Angular/TS years) → Upsquare (Aug 2025-now, 3-4 products at once with AI-powered workflows). Scroll to The Game for the full scoresheet.',
  },
  {
    match: /contact|email|reach/i,
    reply: 'urmillive@gmail.com, or any social in the Endgame section. He replies fast; shipping fast is the brand.',
  },
]

const OFFLINE_DEFAULT =
  "I'm the offline echo of Urmil's AI twin right now (the live model endpoint isn't reachable). Ask about his stack, experience, or why to hire him, or just email urmillive@gmail.com."

export const createTwinDock = ({ dockEl }) => {
  const messagesEl = dockEl.querySelector('.twin__messages')
  const form = dockEl.querySelector('.twin__form')
  const input = dockEl.querySelector('.twin__input')
  const closeBtn = dockEl.querySelector('.twin__close')
  const chips = dockEl.querySelectorAll('.twin__chip')

  const history = []
  let busy = false

  const addBubble = (role, text) => {
    const li = document.createElement('li')
    li.className = `twin__msg twin__msg--${role}`
    li.textContent = text
    messagesEl.appendChild(li)
    messagesEl.scrollTop = messagesEl.scrollHeight
    return li
  }

  const offlineReply = (text) =>
    (OFFLINE_FAQ.find((f) => f.match.test(text)) || { reply: OFFLINE_DEFAULT }).reply

  const send = async (text) => {
    if (!text.trim() || busy) return
    busy = true
    input.value = ''
    addBubble('user', text)
    history.push({ role: 'user', content: text })
    const pending = addBubble('twin', '…')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY),
          persona: getPersona(),
        }),
      })
      if (!res.ok) throw new Error(`twin ${res.status}`)
      const data = await res.json()
      const reply = typeof data.reply === 'string' ? data.reply : OFFLINE_DEFAULT
      pending.textContent = reply
      history.push({ role: 'assistant', content: reply })
    } catch {
      const reply = offlineReply(text)
      pending.textContent = reply
      history.push({ role: 'assistant', content: reply })
    } finally {
      busy = false
      messagesEl.scrollTop = messagesEl.scrollHeight
    }
  }

  const open = () => {
    dockEl.hidden = false
    requestAnimationFrame(() => dockEl.classList.add('twin--open'))
    if (!messagesEl.children.length) {
      const persona = PERSONAS[getPersona()]
      addBubble(
        'twin',
        persona?.twinGreeting ||
          "Hi, I'm Urmil's AI twin, built on his real career data. Ask me anything… or paste a job description and I'll tell you honestly how he fits it."
      )
    }
    input.focus()
  }

  const close = () => {
    dockEl.classList.remove('twin--open')
    setTimeout(() => {
      dockEl.hidden = true
    }, 250)
  }

  closeBtn.addEventListener('click', close)
  dockEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    send(input.value)
  })

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      if (chip.dataset.fill != null) {
        input.value = chip.dataset.fill
        input.focus()
      } else {
        send(chip.textContent.trim())
      }
    })
  )

  return open
}
