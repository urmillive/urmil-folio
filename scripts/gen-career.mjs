import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

// Generates the 6 Career timeline label textures for Urmil's journey.
// Style matches Bruno's originals EXACTLY:
//  - Each line is a solid GREEN (#00ff00) rectangle band with RED (#ff0000) text knocked into it.
//  - The shader samples R (bright tinted text) and G (dark mask background) channels.
//  - Two lines per texture, each band 27px tall: line1 at y0-26, line2 at y32-58. Total height 60.
//  - Bands are left-aligned (x=0); each band width = its own text width + padding.
//  - Image width = max of the two band widths.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'static', 'career')

const FONT = 'Impact'
const FONT_SIZE = 30
const BAND_H = 27
const GAP = 5 // transparent rows between the two bands (y27-31)
const TOTAL_H = BAND_H * 2 + GAP // 59 ink rows; canvas height 60
const PAD_L = 3
const PAD_R = 3
const BASELINE_Y = 24 // baseline within a 27px band -> caps ~ y2..y24

const RED = '#ff0000'
const GREEN = '#00ff00'

function esc(s)
{
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Measure tight ink width of a line of text by rendering on transparent and trimming.
async function measureWidth(text)
{
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="${BAND_H}">`
        + `<text x="0" y="${BASELINE_Y}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="bold" fill="${RED}" xml:space="preserve">${esc(text)}</text>`
        + `</svg>`
    const { info } = await sharp(Buffer.from(svg)).trim().toBuffer({ resolveWithObject: true })
    return info.width
}

// Build a single band (green block + red text), left-aligned, returns a sharp buffer + width.
async function buildBand(text)
{
    const inkW = await measureWidth(text)
    const w = inkW + PAD_L + PAD_R
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${BAND_H}">`
        + `<rect x="0" y="0" width="${w}" height="${BAND_H}" fill="${GREEN}"/>`
        + `<text x="${PAD_L}" y="${BASELINE_Y}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="bold" fill="${RED}" xml:space="preserve">${esc(text)}</text>`
        + `</svg>`
    const buf = await sharp(Buffer.from(svg)).png().toBuffer()
    return { buf, w }
}

async function buildTexture(name, line1, line2)
{
    const b1 = await buildBand(line1)
    const b2 = await buildBand(line2)
    const width = Math.max(b1.w, b2.w)

    const out = await sharp({
        create: { width, height: TOTAL_H + 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
        .composite([
            { input: b1.buf, left: 0, top: 0 },
            { input: b2.buf, left: 0, top: BAND_H + GAP }
        ])
        .png()
        .toBuffer()

    const file = path.join(OUT_DIR, `${name}.png`)
    await sharp(out).toFile(file)
    const meta = await sharp(file).metadata()
    return `${name}.png -> ${meta.width}x${meta.height}`
}

const SLOTS = [
    ['careerHetic', 'STARTED CODING', 'HTML · CSS · 2015'],
    ['careerFreelancer', 'FREELANCER', 'FRONTEND · 2019'],
    ['careerUzik', 'FOX VALLEY', 'WEB DEV INTERN · 2022'],
    ['careerIRLTeacher', 'WARELOGG', 'FRONTEND DEV · 2022'],
    ['careerImmersiveGarden', 'ASITE SOLUTIONS', 'SOFTWARE ENGINEER · 2023'],
    ['careerOnlineTeacher', 'UPSQUARE TECH', 'ENGINEER · AI TOOLS · 2025']
]

for (const [name, l1, l2] of SLOTS)
{
    const r = await buildTexture(name, l1, l2)
    console.log(r)
}
