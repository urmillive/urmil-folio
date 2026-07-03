/* "Ask my AI twin" — Claude-powered chat dock (server proxy at /api/twin).
   All message rendering uses textContent — user/API strings never touch innerHTML. */

const API_URL = '/api/twin'
const MAX_HISTORY = 16

const OFFLINE_FAQ = [
  {
    match: /hire|why you|why should/i,
    reply:
      "Short version: I ship. 6 years across freelance, logistics, enterprise Angular and AI SaaS — 249 public repos, 11 Android apps on the Play Store, and products built end to end. The long version is one email away: urmillive@gmail.com.",
  },
  {
    match: /stack|tech|skill/i,
    reply:
      'Frontend: Angular, React, Next.js, TypeScript. Backend: Node, Express, NestJS, GraphQL, MongoDB/PostgreSQL. Mobile: React Native, Swift, Android. DevOps: Docker, K8s, AWS, Jenkins. AI: Claude & OpenAI APIs in shipped products.',
  },
  {
    match: /experience|career|work/i,
    reply:
      'Freelance (2019–22) → Fox Valley (2022) → Warelogg (2022–23) → Asite Solutions (2023–24, intern → engineer) → Upsquare Technologies (2025–now). Scroll to The Game section for the full scoresheet.',
  },
  {
    match: /contact|email|reach/i,
    reply: 'urmillive@gmail.com — or any social in the Endgame section. He replies fast; shipping fast is the brand.',
  },
]

const OFFLINE_DEFAULT =
  "I'm the offline echo of Urmil's AI twin right now (the live model endpoint isn't reachable). Ask about his stack, experience, or why to hire him — or just email urmillive@gmail.com."

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
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
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
      addBubble(
        'twin',
        "Hi — I'm Urmil's AI twin, built on his real career data. Ask me anything… or paste a job description and I'll tell you honestly how he fits it."
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
