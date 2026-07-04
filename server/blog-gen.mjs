/* The Daily Move generator. Run daily via cron:
   30 3 * * * ANTHROPIC_API_KEY=$(grep -o 'sk-[^"]*' /etc/urmil-twin.env) node /home/ubuntu/urmil-folio/server/blog-gen.mjs
   Fetches top dev news (HN RSS), asks Claude for a short take in Urmil's
   voice, prepends to dist/blog/index.json (and the repo copy so deploys
   keep history). Zero dependencies. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const KEY = process.env.ANTHROPIC_API_KEY
const OUT = ['/home/ubuntu/urmil-folio/dist/blog/index.json', '/home/ubuntu/urmil-folio/public/blog/index.json']
if (!KEY) { console.error('no ANTHROPIC_API_KEY'); process.exit(1) }

const rss = await (await fetch('https://hnrss.org/frontpage?count=8')).text()
const items = [...rss.matchAll(/<title>([^<]+)<\/title>[\s\S]*?<link>([^<]+)<\/link>/g)]
  .slice(1, 7).map((m) => ({ title: m[1], link: m[2] }))

const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001', max_tokens: 1400,
    system: "You write Urmil Rupareliya's daily dev blog. He is a full-stack and AI-era engineer from Ahmedabad who plays chess. Voice: plain simple human sentences a non-technical recruiter can follow, no em-dashes, no en-dashes, confident, a little playful, first person as Urmil. Given today's top dev stories, pick the ONE most interesting to working engineers and return STRICT JSON only: {\"title\": string (max 70 chars, his hot take angle), \"summary\": string (max 200 chars, the front page teaser), \"body\": array of 4 to 5 strings (each one short paragraph of 2 to 4 simple sentences: what happened, why it matters, his own take from real experience, what he would do about it), \"caption\": string (max 60 chars, a witty newspaper photo caption), \"url\": the story link}",
    messages: [{ role: 'user', content: "Today's stories:\n" + items.map((i) => `- ${i.title} :: ${i.link}`).join('\n') }],
  }),
})
const data = await res.json()
const text = data.content?.map((b) => b.text || '').join('') || '{}'
const post = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
post.date = new Date().toISOString().slice(0, 10)
post.slug = `${post.date}-${(post.title || 'daily-move').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50)}`

for (const f of OUT) {
  const cur = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : []
  if (cur[0]?.date === post.date) continue
  writeFileSync(f, JSON.stringify([post, ...cur].slice(0, 30), null, 2))
}
console.log('published:', post.title)
