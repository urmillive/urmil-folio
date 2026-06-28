import fs from 'fs'

// 5x7 pixel font (rows top -> bottom)
const FONT = {
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    R: ['11110','10001','10001','11110','10100','10010','10001'],
    M: ['10001','11011','10101','10101','10001','10001','10001'],
    I: ['11111','00100','00100','00100','00100','00100','11111'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
}

const WORD = 'URMIL'

// Brick footprint ~1.125 (X) x 1.5 (Z). Use slightly larger pitch to avoid overlap.
const PITCH_X = 1.25
const PITCH_Z = 1.6
const LETTER_ADVANCE = 6 // 5 cols + 1 gap
const GROUND_Y = 0.375

// Build raw cells
const cells = []
WORD.split('').forEach((ch, li) =>
{
    const glyph = FONT[ch]
    for(let r = 0; r < glyph.length; r++)
        for(let c = 0; c < glyph[r].length; c++)
            if(glyph[r][c] === '1')
            {
                const worldCol = li * LETTER_ADVANCE + c
                cells.push({ x: worldCol * PITCH_X, z: -r * PITCH_Z })
            }
})

// Center the word block around (0,0) first
const xs = cells.map(c => c.x), zs = cells.map(c => c.z)
const cx = (Math.min(...xs) + Math.max(...xs)) / 2
const cz = (Math.min(...zs) + Math.max(...zs)) / 2

function parseGLB(p)
{
    const buf = fs.readFileSync(p)
    const total = buf.readUInt32LE(8)
    let off = 12, json = null, bin = null
    while(off < total)
    {
        const len = buf.readUInt32LE(off)
        const type = buf.toString('utf8', off + 4, off + 8).replace(/\0/g, '').trim()
        if(type === 'JSON') json = JSON.parse(buf.toString('utf8', off + 8, off + 8 + len))
        if(type === 'BIN') bin = buf.subarray(off + 8, off + 8 + len)
        off += 8 + len
    }
    return { json, bin }
}

// Determine target centroid from the ORIGINAL backup so the word sits in the same play area
const orig = parseGLB('static/bricks/bricks.bruno-original.glb')
const ot = orig.json.nodes.map(n => n.translation)
const targetX = ot.reduce((a, t) => a + t[0], 0) / ot.length
const targetZ = ot.reduce((a, t) => a + t[2], 0) / ot.length
console.log('original centroid X,Z =', targetX.toFixed(2), targetZ.toFixed(2), 'bricks:', cells.length)

function buildNodes()
{
    return cells.map((c, i) => ({
        mesh: 0,
        name: `Brick.${String(i).padStart(3, '0')}`,
        translation: [ c.x - cx + targetX, GROUND_Y, c.z - cz + targetZ ],
        rotation: [ 0, 0, 0, 1 ],
    }))
}

function writeGLB(srcPath, outPath)
{
    const { json, bin } = parseGLB(srcPath)

    // Replace nodes + scene graph, keep mesh/material/accessors/buffers intact
    json.nodes = buildNodes()
    json.scenes = [ { name: 'Scene', nodes: json.nodes.map((_, i) => i) } ]
    json.scene = 0

    // Serialize JSON chunk, pad with spaces to 4-byte alignment
    let jsonStr = JSON.stringify(json)
    while(jsonStr.length % 4 !== 0) jsonStr += ' '
    const jsonBuf = Buffer.from(jsonStr, 'utf8')

    // BIN chunk: pad to 4 bytes with zeros
    let binBuf = bin
    if(binBuf.length % 4 !== 0)
        binBuf = Buffer.concat([ binBuf, Buffer.alloc(4 - (binBuf.length % 4)) ])

    const total = 12 + 8 + jsonBuf.length + 8 + binBuf.length
    const out = Buffer.alloc(total)
    out.write('glTF', 0, 'ascii')
    out.writeUInt32LE(2, 4)
    out.writeUInt32LE(total, 8)
    let o = 12
    out.writeUInt32LE(jsonBuf.length, o); out.write('JSON', o + 4, 'ascii'); o += 8
    jsonBuf.copy(out, o); o += jsonBuf.length
    out.writeUInt32LE(binBuf.length, o); out.write('BIN\0', o + 4, 'ascii'); o += 8
    binBuf.copy(out, o)

    fs.writeFileSync(outPath, out)
    console.log('wrote', outPath, out.length, 'bytes,', json.nodes.length, 'bricks')
}

writeGLB('static/bricks/bricks.bruno-original.glb', 'static/bricks/bricks.glb')
writeGLB('static/bricks/bricks-compressed.bruno-original.glb', 'static/bricks/bricks-compressed.glb')
