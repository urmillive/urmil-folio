import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const W = 960, H = 540
const MINI_W = 240, MINI_H = 136

const PROJ_DIR = 'static/projects/images'
const LAB_DIR = 'static/lab/images'

function esc(s)
{
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Rough auto font size so title fits within usable width
function fitSize(title, width, cap)
{
    const usable = width * 0.88
    const size = Math.floor(usable / (title.length * 0.56))
    return Math.max(20, Math.min(cap, size))
}

function card(width, height, { title, subtitle, accent, mini = false })
{
    const titleSize = fitSize(title, width, mini ? Math.floor(height * 0.34) : 112)
    const subSize = Math.max(12, Math.round(width * (mini ? 0.05 : 0.032)))
    const cx = width / 2
    const titleY = mini ? height * 0.58 : height * 0.46
    const ruleW = Math.min(width * 0.62, title.length * titleSize * 0.34)

    const subtitleMarkup = subtitle ? `
        <rect x="${cx - ruleW / 2}" y="${titleY + titleSize * 0.28}" width="${ruleW}" height="${Math.max(2, width * 0.004)}" rx="2" fill="${accent}" opacity="0.9"/>
        <text x="${cx}" y="${titleY + titleSize * 0.28 + subSize * 2.1}" font-family="Helvetica, Arial, sans-serif" font-size="${subSize}" font-weight="500" letter-spacing="${subSize * 0.12}" fill="#c7d0e8" text-anchor="middle">${esc(subtitle.toUpperCase())}</text>
    ` : ''

    const wordmark = mini ? '' : `
        <text x="${width - 28}" y="${height - 26}" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="3" fill="#6b7693" text-anchor="end" opacity="0.8">URMIL · PORTFOLIO</text>
    `

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e1a"/>
      <stop offset="0.55" stop-color="#121a30"/>
      <stop offset="1" stop-color="#1c2747"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.75">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${Math.max(4, width * 0.012)}" height="${height}" fill="${accent}"/>
  <text x="${cx}" y="${titleY}" font-family="Helvetica, Arial, sans-serif" font-size="${titleSize}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${esc(title)}</text>
  ${subtitleMarkup}
  ${wordmark}
</svg>`

    return Buffer.from(svg)
}

async function render(outPath, width, height, opts)
{
    const buf = card(width, height, opts)
    await sharp(buf).png().toFile(outPath)
    console.log('rendered', outPath)
}

const ACCENTS = {
    teal: '#4fd1c5', blue: '#5b8cff', violet: '#a78bfa',
    amber: '#f6ad55', rose: '#fb7185', green: '#48bb78', cyan: '#38bdf8',
}

// ---- Projects ----
const projects = [
    [ 'arcbider-1', 'ArcBider', 'Founder · Full-stack · AI', ACCENTS.teal ],
    [ 'arcbider-2', 'ArcBider', 'AI Proposal Automation', ACCENTS.teal ],
    [ 'elearning-1', 'E-learning Platform', 'Full-stack · MERN · Tailwind', ACCENTS.blue ],
    [ 'elearning-2', 'E-learning Platform', 'Courses · Video · Payments', ACCENTS.blue ],
    [ 'vetanpatro-1', 'VetanPatro', 'Mobile · React Native', ACCENTS.amber ],
    [ 'jarvis-1', 'Jarvis', 'Voice Assistant · Python', ACCENTS.violet ],
    [ 'code-editor-1', 'Online Code Editor', 'Full-stack · Node · JS', ACCENTS.cyan ],
    [ 'chat-app-1', 'Chat App', 'Realtime · Socket.io · MERN', ACCENTS.rose ],
]

// ---- Lab ----
const lab = [
    [ 'saasly', 'SaaSly', 'SaaS Starter Kit', ACCENTS.teal ],
    [ 'chatterbox', 'ChatterBox', 'Realtime Chat', ACCENTS.rose ],
    [ 'shopsphere', 'ShopSphere', 'E-commerce Platform', ACCENTS.amber ],
    [ 'contentcrafter', 'ContentCrafter AI', 'AI Content Generator', ACCENTS.violet ],
    [ 'fintrack', 'FinTrack', 'Expense Tracker Dashboard', ACCENTS.green ],
    [ 'streamify', 'Streamify', 'Video Streaming Platform', ACCENTS.cyan ],
]

fs.mkdirSync(PROJ_DIR, { recursive: true })
fs.mkdirSync(LAB_DIR, { recursive: true })

for(const [ key, title, subtitle, accent ] of projects)
    await render(path.join(PROJ_DIR, `${key}.png`), W, H, { title, subtitle, accent })

for(const [ key, title, subtitle, accent ] of lab)
{
    await render(path.join(LAB_DIR, `${key}.png`), W, H, { title, subtitle, accent })
    await render(path.join(LAB_DIR, `${key}-mini.png`), MINI_W, MINI_H, { title, subtitle: null, accent, mini: true })
}

console.log('DONE')
