/**
 * INVARIANT DIFF: prove the append-only edit corrupted nothing.
 *
 * Decisive checks:
 *  - Every pre-existing bufferView is BYTE-IDENTICAL to the original (covers all
 *    geometry, all Draco blobs, all textures). New bufferViews are appended only.
 *  - Every pre-existing accessor definition is unchanged.
 *  - trimesh.001 + trimesh collider POSITION/index decode IDENTICALLY (this is
 *    the exact thing that broke last time). Uncompressed decoded directly;
 *    compressed decoded via gltf-transform (Draco).
 */
import fs from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'

const JSON_CHUNK = 0x4e4f534a
const BIN_CHUNK = 0x004e4942

function parseGLB(filePath) {
    const buf = fs.readFileSync(filePath)
    const total = buf.readUInt32LE(8)
    let off = 12, json = null, bin = null
    while (off < total) {
        const clen = buf.readUInt32LE(off)
        const ctype = buf.readUInt32LE(off + 4)
        const cdata = buf.subarray(off + 8, off + 8 + clen)
        if (ctype === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(cdata))
        else if (ctype === BIN_CHUNK) bin = Buffer.from(cdata)
        off += 8 + clen
    }
    return { json, bin }
}

function bvBytes(json, bin, i) {
    const bv = json.bufferViews[i]
    const start = bv.byteOffset || 0
    return bin.subarray(start, start + bv.byteLength)
}

let failures = 0
function assert(cond, msg) {
    if (!cond) { console.error('  FAIL:', msg); failures++ }
    else console.log('  OK  :', msg)
}

function checkBufferViewIdentity(label, origPath, newPath) {
    console.log(`\n[${label}] byte-identity of pre-existing bufferViews`)
    const o = parseGLB(origPath)
    const n = parseGLB(newPath)
    const origCount = o.json.bufferViews.length
    assert(n.json.bufferViews.length >= origCount, `bufferView count grew (${origCount} -> ${n.json.bufferViews.length})`)
    let mismatch = 0
    for (let i = 0; i < origCount; i++) {
        if (!bvBytes(o.json, o.bin, i).equals(bvBytes(n.json, n.bin, i))) mismatch++
    }
    assert(mismatch === 0, `all ${origCount} pre-existing bufferViews byte-identical (mismatches: ${mismatch})`)

    // accessor definitions unchanged for pre-existing accessors
    const origAcc = o.json.accessors.length
    let accMismatch = 0
    for (let i = 0; i < origAcc; i++) {
        if (JSON.stringify(o.json.accessors[i]) !== JSON.stringify(n.json.accessors[i])) accMismatch++
    }
    assert(accMismatch === 0, `all ${origAcc} pre-existing accessor defs unchanged (mismatches: ${accMismatch})`)
    return { o, n }
}

// ---- raw accessor decode (uncompressed) ----
const COMP_ARR = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }
const COMP_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const NUM_COMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
function decodeAccessor(json, bin, ai) {
    const a = json.accessors[ai]
    const bv = json.bufferViews[a.bufferView]
    const nc = NUM_COMP[a.type], Arr = COMP_ARR[a.componentType], cs = COMP_SIZE[a.componentType]
    const base = (bv.byteOffset || 0) + (a.byteOffset || 0)
    const stride = bv.byteStride || nc * cs
    const out = new Arr(a.count * nc)
    for (let i = 0; i < a.count; i++) {
        const eo = base + i * stride
        for (let c = 0; c < nc; c++) out[i * nc + c] = new Arr(bin.buffer, bin.byteOffset + eo + c * cs, 1)[0]
    }
    return out
}

function checkTrimeshUncompressed(o, n) {
    console.log('\n[uncompressed] trimesh collider decode equality')
    // trimesh.001 -> mesh 161 prim POSITION 614 indices 616
    // trimesh     -> mesh 235 prim POSITION 904 indices 907
    for (const [nm, posAcc, idxAcc] of [['trimesh.001', 614, 616], ['trimesh', 904, 907]]) {
        const op = decodeAccessor(o.json, o.bin, posAcc)
        const np = decodeAccessor(n.json, n.bin, posAcc)
        const oi = decodeAccessor(o.json, o.bin, idxAcc)
        const ni = decodeAccessor(n.json, n.bin, idxAcc)
        const posEq = op.length === np.length && op.every((v, k) => v === np[k])
        const idxEq = oi.length === ni.length && oi.every((v, k) => v === ni[k])
        console.log(`  ${nm} first POSITION: [${Array.from(np.slice(0, 9)).map(v => v.toFixed(3))}]`)
        assert(posEq, `${nm} POSITION identical (${np.length} floats)`)
        assert(idxEq, `${nm} index identical (${ni.length} ints)`)
    }
}

async function checkCompressedDecode() {
    console.log('\n[compressed] Draco decode equality of trimesh colliders')
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    })
    const od = await io.read('static/areas/areas-compressed.bruno-original.glb')
    const nd = await io.read('static/areas/areas-compressed.glb')
    const getMesh = (doc, nodeName) => {
        const node = doc.getRoot().listNodes().find(nd => nd.getName() === nodeName)
        return node && node.getMesh()
    }
    for (const nm of ['trimesh.001', 'trimesh']) {
        const om = getMesh(od, nm), nmh = getMesh(nd, nm)
        const op = om.listPrimitives()[0].getAttribute('POSITION').getArray()
        const np = nmh.listPrimitives()[0].getAttribute('POSITION').getArray()
        const oi = om.listPrimitives()[0].getIndices().getArray()
        const ni = nmh.listPrimitives()[0].getIndices().getArray()
        const posEq = op.length === np.length && op.every((v, k) => v === np[k])
        const idxEq = oi.length === ni.length && oi.every((v, k) => v === ni[k])
        console.log(`  ${nm} first POSITION: [${Array.from(np.slice(0, 9)).map(v => v.toFixed(3))}]`)
        assert(posEq, `${nm} POSITION identical (${np.length} floats)`)
        assert(idxEq, `${nm} index identical (${ni.length} ints)`)
    }
}

async function main() {
    const { o, n } = checkBufferViewIdentity('uncompressed', 'static/areas/areas.bruno-original.glb', 'static/areas/areas.glb')
    checkTrimeshUncompressed(o, n)
    checkBufferViewIdentity('compressed', 'static/areas/areas-compressed.bruno-original.glb', 'static/areas/areas-compressed.glb')
    await checkCompressedDecode()

    console.log(`\n==== INVARIANT DIFF ${failures === 0 ? 'PASSED' : 'FAILED (' + failures + ')'} ====`)
    process.exit(failures === 0 ? 0 : 1)
}
main().catch(e => { console.error(e); process.exit(1) })
