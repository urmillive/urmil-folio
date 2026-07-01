/**
 * Corruption-proof / append-only rebuild of the giant floor name -> "URMIL".
 *
 * Strategy (NO prune, NO repack, NO byte/accessor/bufferView reordering):
 *   1. Generate 5 INDEXED extruded glyphs U,R,M,I,L (opentype.js -> THREE.Shape
 *      -> ExtrudeGeometry -> mergeVertices) matching the original letter
 *      convention (X width, Y up, Z depth 0.46, centered at origin).
 *   2. APPEND new vertex/normal/uv/index bytes to the END of the BIN chunk, add
 *      NEW bufferViews + accessors pointing only into that appended region.
 *      Every pre-existing byte / bufferView / accessor is left UNTOUCHED.
 *   3. Repoint the 5 letter meshes (Text.002..Text.006 / nodes .010-.014) to the
 *      new accessors, reposition + center along the original diagonal, and resize
 *      their cuboid colliders to each glyph's bbox.
 *   4. Neutralize leftover S,I,M,O,N (Text.007..Text.021 / nodes .015-.019):
 *      repoint to one tiny degenerate triangle, shrink cuboid to 0.02, sink node
 *      y -= 100. Nodes are KEPT (never removed).
 *   5. If a letter primitive carries KHR_draco_mesh_compression (the compressed
 *      file), strip ONLY that primitive's draco extension (everything else stays
 *      Draco). The new plain accessors make the primitive valid standalone.
 *
 * Works on both the uncompressed and the Draco-compressed GLB because it only
 * touches the 10 letter primitives and appends new data.
 *
 * Usage: node scripts/build-urmil-append.js <in.glb> <out.glb>
 */
import fs from 'node:fs'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import opentypeNS from 'opentype.js'

const opentype = opentypeNS.default || opentypeNS

// ---- Constants matching the original asset (verified by decoding originals) --
const WORD = 'URMIL'
const TARGET_CAP_HEIGHT = 1.4474 // flat uppercase y-extent in the original
const TARGET_DEPTH = 0.46        // original z-extent (-0.23 .. 0.23)
const LETTER_GAP = 0.20          // gap between adjacent glyph bounding boxes
const FONT_PATH = 'static/fonts/Pally-Bold.ttf'

// Letter nodes (B,R,U,N,O -> U,R,M,I,L) and the neutralized nodes (S,I,M,O,N)
const KEEP_NODES = [
    'refLettersPhysicalDynamic.010',
    'refLettersPhysicalDynamic.011',
    'refLettersPhysicalDynamic.012',
    'refLettersPhysicalDynamic.013',
    'refLettersPhysicalDynamic.014',
]
const NEUTRALIZE_NODES = [
    'refLettersPhysicalDynamic.015',
    'refLettersPhysicalDynamic.016',
    'refLettersPhysicalDynamic.017',
    'refLettersPhysicalDynamic.018',
    'refLettersPhysicalDynamic.019',
]
// Diagonal endpoints (node-local translations of original .010 and .019)
const DIAG_A = [0.44831085205078125, -2.5278496742248535, 0.4473991394042969]
const DIAG_B = [-10.869529724121094, -2.5278496742248535, 5.724994659423828]
const LETTER_ROTATION = [0, 0.2164396494626999, 0, 0.9762960076332092]

// ---- GLB parse / serialize -------------------------------------------------
const JSON_CHUNK = 0x4e4f534a
const BIN_CHUNK = 0x004e4942

function parseGLB(filePath) {
    const buf = fs.readFileSync(filePath)
    const total = buf.readUInt32LE(8)
    let off = 12
    let json = null
    let bin = null
    while (off < total) {
        const clen = buf.readUInt32LE(off)
        const ctype = buf.readUInt32LE(off + 4)
        const cdata = buf.subarray(off + 8, off + 8 + clen)
        if (ctype === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(cdata))
        else if (ctype === BIN_CHUNK) bin = Buffer.from(cdata) // copy
        off += 8 + clen
    }
    if (!json || !bin) throw new Error('invalid GLB: missing chunk')
    return { json, bin }
}

function pad4(n) { return (4 - (n % 4)) % 4 }

function serializeGLB(json, bin) {
    const jsonStr = JSON.stringify(json)
    const jsonBuf = Buffer.from(jsonStr, 'utf8')
    const jsonPad = pad4(jsonBuf.length)
    const jsonChunk = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)])

    const binPad = pad4(bin.length)
    const binChunk = Buffer.concat([bin, Buffer.alloc(binPad, 0x00)])

    const totalLen = 12 + 8 + jsonChunk.length + 8 + binChunk.length
    const header = Buffer.alloc(12)
    header.writeUInt32LE(0x46546c67, 0) // glTF
    header.writeUInt32LE(2, 4)
    header.writeUInt32LE(totalLen, 8)

    const jHead = Buffer.alloc(8)
    jHead.writeUInt32LE(jsonChunk.length, 0)
    jHead.writeUInt32LE(JSON_CHUNK, 4)

    const bHead = Buffer.alloc(8)
    bHead.writeUInt32LE(binChunk.length, 0)
    bHead.writeUInt32LE(BIN_CHUNK, 4)

    return Buffer.concat([header, jHead, jsonChunk, bHead, binChunk])
}

// ---- accessor decode (for reading original letter UV) ----------------------
const COMP_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const COMP_ARR = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }
const NUM_COMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }

function decodeAccessor(json, bin, ai) {
    const a = json.accessors[ai]
    if (a.bufferView == null) return null // draco-only accessor
    const bv = json.bufferViews[a.bufferView]
    const nc = NUM_COMP[a.type]
    const Arr = COMP_ARR[a.componentType]
    const cs = COMP_SIZE[a.componentType]
    const base = (bv.byteOffset || 0) + (a.byteOffset || 0)
    const stride = bv.byteStride || nc * cs
    const out = new Arr(a.count * nc)
    for (let i = 0; i < a.count; i++) {
        const eo = base + i * stride
        for (let c = 0; c < nc; c++) out[i * nc + c] = new Arr(bin.buffer, bin.byteOffset + eo + c * cs, 1)[0]
    }
    return out
}

// ---- Glyph geometry --------------------------------------------------------
function glyphToShapes(font, char, fontSize) {
    const glyph = font.charToGlyph(char)
    const path = glyph.getPath(0, 0, fontSize) // opentype y points DOWN
    const shapePath = new THREE.ShapePath()
    for (const cmd of path.commands) {
        if (cmd.type === 'M') shapePath.moveTo(cmd.x, -cmd.y)
        else if (cmd.type === 'L') shapePath.lineTo(cmd.x, -cmd.y)
        else if (cmd.type === 'C') shapePath.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y)
        else if (cmd.type === 'Q') shapePath.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y)
    }
    return shapePath.toShapes(true)
}

function buildGlyph(font, char, fontSize, scaleFactor, uv) {
    const shapes = glyphToShapes(font, char, fontSize)
    let geom = new THREE.ExtrudeGeometry(shapes, { depth: 100, bevelEnabled: false, curveSegments: 8 })
    geom.scale(scaleFactor, scaleFactor, scaleFactor)
    geom.computeBoundingBox()
    const zsize = geom.boundingBox.max.z - geom.boundingBox.min.z
    geom.scale(1, 1, TARGET_DEPTH / zsize)
    geom.center()

    // Constant letter UV on every vertex (palette solid color), then index it.
    const vcount = geom.attributes.position.count
    const uvArr = new Float32Array(vcount * 2)
    for (let v = 0; v < vcount; v++) { uvArr[v * 2] = uv[0]; uvArr[v * 2 + 1] = uv[1] }
    geom.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2))

    geom = mergeVertices(geom) // -> INDEXED
    geom.computeBoundingBox()
    const bb = geom.boundingBox

    const position = new Float32Array(geom.attributes.position.array)
    const normal = new Float32Array(geom.attributes.normal.array)
    const uvOut = new Float32Array(geom.attributes.uv.array)
    const count = geom.attributes.position.count
    if (count > 65535) throw new Error(`${char} too many verts for uint16`)
    const index = new Uint16Array(geom.index.array)

    return {
        char, position, normal, uv: uvOut, index, count,
        min: [bb.min.x, bb.min.y, bb.min.z],
        max: [bb.max.x, bb.max.y, bb.max.z],
        width: bb.max.x - bb.min.x,
        height: bb.max.y - bb.min.y,
        depth: bb.max.z - bb.min.z,
    }
}

function buildDegenerate(uv) {
    // Tiny near-zero triangle: invisible, but a valid renderable primitive.
    const position = new Float32Array([0, 0, 0, 0.001, 0, 0, 0, 0.001, 0])
    const normal = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
    const uvOut = new Float32Array([uv[0], uv[1], uv[0], uv[1], uv[0], uv[1]])
    const index = new Uint16Array([0, 1, 2])
    return {
        char: '∅', position, normal, uv: uvOut, index, count: 3,
        min: [0, 0, 0], max: [0.001, 0.001, 0],
        width: 0.02, height: 0.02, depth: 0.02,
    }
}

function computeScaleFactor(font, fontSize) {
    const unitsCapHeight = (font.tables.os2 && font.tables.os2.sCapHeight) || 670
    const capPx = unitsCapHeight * (fontSize / font.unitsPerEm)
    return TARGET_CAP_HEIGHT / capPx
}

function computeLayout(glyphs) {
    const s = []
    let cursor = 0
    for (let i = 0; i < glyphs.length; i++) {
        const hw = glyphs[i].width / 2
        if (i === 0) cursor = 0
        else cursor += glyphs[i - 1].width / 2 + LETTER_GAP + hw
        s.push(cursor)
    }
    const mean = s.reduce((a, b) => a + b, 0) / s.length
    const centred = s.map(v => v - mean)
    const D = [DIAG_B[0] - DIAG_A[0], 0, DIAG_B[2] - DIAG_A[2]]
    const L = Math.hypot(D[0], D[2])
    // Reversed: the diagonal's A->B direction reads opposite to the viewer, so the
    // word came out backwards ("LIMRU"). Negate the direction to read "URMIL".
    const u = [-D[0] / L, 0, -D[2] / L]
    const M = [(DIAG_A[0] + DIAG_B[0]) / 2, DIAG_A[1], (DIAG_A[2] + DIAG_B[2]) / 2]
    return centred.map(sv => [M[0] + u[0] * sv, M[1], M[2] + u[2] * sv])
}

// ---- Append helper ---------------------------------------------------------
function makeAppender(json, originalBin) {
    const blobs = []
    let cursor = originalBin.length // both originals are 4-aligned here
    if (cursor % 4 !== 0) throw new Error('original bin not 4-aligned')

    function addBufferView(typedArray, target) {
        const bytes = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength)
        const padBefore = pad4(cursor)
        if (padBefore) { blobs.push(Buffer.alloc(padBefore, 0)); cursor += padBefore }
        const byteOffset = cursor
        blobs.push(bytes)
        cursor += bytes.length
        // target: 34962 ARRAY_BUFFER (vertex attrs), 34963 ELEMENT_ARRAY_BUFFER (indices)
        json.bufferViews.push({ buffer: 0, byteOffset, byteLength: bytes.length, target })
        return json.bufferViews.length - 1
    }

    function addAccessor({ array, type, componentType, count, min, max }) {
        const target = type === 'SCALAR' ? 34963 : 34962
        const bv = addBufferView(array, target)
        const acc = { bufferView: bv, componentType, count, type }
        if (min) acc.min = min
        if (max) acc.max = max
        json.accessors.push(acc)
        return json.accessors.length - 1
    }

    function finalize() {
        const newBin = Buffer.concat([originalBin, ...blobs])
        json.buffers[0].byteLength = newBin.length
        return newBin
    }

    return { addAccessor, finalize }
}

// Create the 4 accessors (POSITION, NORMAL, TEXCOORD_0, indices) for one glyph.
function appendGlyphAccessors(appender, g) {
    const POSITION = appender.addAccessor({ array: g.position, type: 'VEC3', componentType: 5126, count: g.count, min: g.min, max: g.max })
    const NORMAL = appender.addAccessor({ array: g.normal, type: 'VEC3', componentType: 5126, count: g.count })
    const TEXCOORD_0 = appender.addAccessor({ array: g.uv, type: 'VEC2', componentType: 5126, count: g.count })
    const indices = appender.addAccessor({ array: g.index, type: 'SCALAR', componentType: 5123, count: g.index.length })
    return { POSITION, NORMAL, TEXCOORD_0, indices }
}

function repointPrimitive(prim, accs) {
    prim.attributes = { POSITION: accs.POSITION, NORMAL: accs.NORMAL, TEXCOORD_0: accs.TEXCOORD_0 }
    prim.indices = accs.indices
    prim.mode = 4
    // strip ONLY this primitive's draco extension if present
    if (prim.extensions && prim.extensions.KHR_draco_mesh_compression) {
        delete prim.extensions.KHR_draco_mesh_compression
        if (Object.keys(prim.extensions).length === 0) delete prim.extensions
    }
}

function findCuboidChild(json, node) {
    for (const ci of (node.children || [])) {
        const c = json.nodes[ci]
        if (c.name && /^cuboid/i.test(c.name)) return c
    }
    return null
}

// ---- Main per-file transform ----------------------------------------------
function processFile(inPath, outPath, glyphs, degenerate, layout) {
    const { json, bin } = parseGLB(inPath)
    const nodeByName = name => json.nodes.find(n => n.name === name)
    const appender = makeAppender(json, bin)

    // 1) Append + repoint the 5 real glyphs
    for (let i = 0; i < KEEP_NODES.length; i++) {
        const node = nodeByName(KEEP_NODES[i])
        if (!node || node.mesh == null) throw new Error(`bad keep node ${KEEP_NODES[i]}`)
        const g = glyphs[i]
        const accs = appendGlyphAccessors(appender, g)
        const mesh = json.meshes[node.mesh]
        repointPrimitive(mesh.primitives[0], accs)

        node.translation = layout[i]
        node.rotation = [...LETTER_ROTATION]
        delete node.scale

        const cuboid = findCuboidChild(json, node)
        if (!cuboid) throw new Error(`no cuboid child on ${KEEP_NODES[i]}`)
        cuboid.translation = [0, 0, 0]
        cuboid.rotation = [0, 0, 0, 1]
        cuboid.scale = [g.width, g.height, g.depth]
    }

    // 2) Neutralize the leftover 5 (share ONE degenerate accessor set)
    const degAccs = appendGlyphAccessors(appender, degenerate)
    for (const name of NEUTRALIZE_NODES) {
        const node = nodeByName(name)
        if (!node || node.mesh == null) throw new Error(`bad neutralize node ${name}`)
        const mesh = json.meshes[node.mesh]
        repointPrimitive(mesh.primitives[0], { ...degAccs })
        const t = node.translation || [0, 0, 0]
        node.translation = [t[0], t[1] - 100, t[2]]
        const cuboid = findCuboidChild(json, node)
        if (!cuboid) throw new Error(`no cuboid child on ${name}`)
        cuboid.translation = [0, 0, 0]
        cuboid.rotation = [0, 0, 0, 1]
        cuboid.scale = [0.02, 0.02, 0.02]
    }

    const newBin = appender.finalize()
    fs.writeFileSync(outPath, serializeGLB(json, newBin))
    return { accessorsBefore: json.accessors.length, bytes: newBin.length }
}

async function main() {
    const fontBuf = fs.readFileSync(FONT_PATH)
    const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength))
    const fontSize = 1000
    const scaleFactor = computeScaleFactor(font, fontSize)

    // Read the EXACT original letter UV from the uncompressed original (acc 50).
    const { json: oj, bin: ob } = parseGLB('static/areas/areas.bruno-original.glb')
    const text002 = oj.meshes[oj.nodes.find(n => n.name === KEEP_NODES[0]).mesh]
    const uvAccIdx = text002.primitives[0].attributes.TEXCOORD_0
    const uvArr = decodeAccessor(oj, ob, uvAccIdx)
    const LETTER_UV = [uvArr[0], uvArr[1]]
    console.log('Letter UV (from original):', LETTER_UV)

    const glyphs = WORD.split('').map(ch => buildGlyph(font, ch, fontSize, scaleFactor, LETTER_UV))
    const degenerate = buildDegenerate(LETTER_UV)
    const layout = computeLayout(glyphs)

    console.log('\nGlyph layout:')
    glyphs.forEach((g, i) => {
        console.log(`  ${g.char}  pos=[${layout[i].map(v => v.toFixed(3))}]  WHD=[${g.width.toFixed(3)},${g.height.toFixed(3)},${g.depth.toFixed(3)}]  verts=${g.count}  tris=${g.index.length / 3}`)
    })
    console.log('scaleFactor:', scaleFactor.toFixed(6))

    const jobs = [
        ['static/areas/areas.bruno-original.glb', 'static/areas/areas.glb'],
        ['static/areas/areas-compressed.bruno-original.glb', 'static/areas/areas-compressed.glb'],
    ]
    for (const [inP, outP] of jobs) {
        // deep clone glyph layout fresh per file (processFile mutates json only)
        const r = processFile(inP, outP, glyphs, degenerate, layout)
        console.log(`\nWrote ${outP}  (accessors now ${r.accessorsBefore}, bin ${r.bytes} bytes)`)
    }
}

main().catch(e => { console.error(e); process.exit(1) })
