/**
 * Replaces the landing "BRUNO SIMON" 3D letters with "URMIL".
 *
 * - Reuses the existing `palette` material and the exact letter color UV.
 * - Generates 5 extruded glyphs (U,R,M,I,L) from static/fonts/Pally-Bold.ttf.
 * - Matches the original letter convention: glyph in XY plane (X width, Y up),
 *   Z depth ~0.46, geometry centered at origin; node yaw rotation preserved.
 * - Reuses ref nodes refLettersPhysicalDynamic.010..014 (+ their cuboid colliders),
 *   removes .015..019, prunes orphans.
 *
 * Usage:
 *   node scripts/build-urmil-letters.js <input.glb> <output.glb> [--draco]
 */
import fs from 'node:fs'
import { NodeIO, PropertyType } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { prune, draco } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import * as THREE from 'three'
import opentypeNS from 'opentype.js'

const opentype = opentypeNS.default || opentypeNS

// ---- Constants matching the original asset --------------------------------
const TARGET_CAP_HEIGHT = 1.448 // original uppercase y-extent
const TARGET_DEPTH = 0.46 // original z-extent (-0.23 .. 0.23)
const LETTER_UV = [0.7356297969818115, 0.5] // palette color picked by all letters
const LETTER_GAP = 0.20 // gap between adjacent glyph bounding boxes
const WORD = 'URMIL'
const KEEP_NODES = [
    'refLettersPhysicalDynamic.010',
    'refLettersPhysicalDynamic.011',
    'refLettersPhysicalDynamic.012',
    'refLettersPhysicalDynamic.013',
    'refLettersPhysicalDynamic.014',
]
const REMOVE_NODES = [
    'refLettersPhysicalDynamic.015',
    'refLettersPhysicalDynamic.016',
    'refLettersPhysicalDynamic.017',
    'refLettersPhysicalDynamic.018',
    'refLettersPhysicalDynamic.019',
]
// Diagonal endpoints (centres of original first/last letters)
const A = [0.448, -2.528, 0.447]
const B = [-10.870, -2.528, 5.725]

// ---- Geometry generation ---------------------------------------------------
function glyphToShapes(font, char, fontSize) {
    const glyph = font.charToGlyph(char)
    const path = glyph.getPath(0, 0, fontSize) // y points DOWN in opentype path
    const shapePath = new THREE.ShapePath()
    for (const cmd of path.commands) {
        // negate y -> Y up
        if (cmd.type === 'M') shapePath.moveTo(cmd.x, -cmd.y)
        else if (cmd.type === 'L') shapePath.lineTo(cmd.x, -cmd.y)
        else if (cmd.type === 'C') shapePath.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y)
        else if (cmd.type === 'Q') shapePath.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y)
        // 'Z' handled implicitly by ShapePath sub-paths
    }
    // TrueType outer contours are CW in font units; after Y-negation they become
    // CCW, matching three.js FontLoader convention -> toShapes(true).
    return shapePath.toShapes(true)
}

function buildGlyphGeometry(font, char, fontSize, scaleFactor) {
    const shapes = glyphToShapes(font, char, fontSize)
    const geom = new THREE.ExtrudeGeometry(shapes, {
        depth: 100,
        bevelEnabled: false,
        curveSegments: 8,
    })
    // Uniform XY scale to target cap height
    geom.scale(scaleFactor, scaleFactor, scaleFactor)
    // Fix Z depth exactly
    geom.computeBoundingBox()
    const zsize = geom.boundingBox.max.z - geom.boundingBox.min.z
    geom.scale(1, 1, TARGET_DEPTH / zsize)
    // Center all axes at origin (matches original convention)
    geom.center()
    geom.computeBoundingBox()
    const bb = geom.boundingBox
    return {
        position: geom.attributes.position.array,
        normal: geom.attributes.normal.array,
        index: geom.index ? geom.index.array : null,
        vertexCount: geom.attributes.position.count,
        width: bb.max.x - bb.min.x,
        height: bb.max.y - bb.min.y,
        depth: bb.max.z - bb.min.z,
    }
}

function computeScaleFactor(font, fontSize) {
    // Scale by the font's true cap height so flat letters match the original
    // 1.448 cap height and rounded/pointed letters overshoot slightly (as in
    // Bruno's original asset). Individual glyphs (I, M) overshoot the cap line in
    // Pally, so referencing a single glyph's extent would shrink the whole word.
    const unitsCapHeight = (font.tables.os2 && font.tables.os2.sCapHeight) || 670
    const capPx = unitsCapHeight * (fontSize / font.unitsPerEm)
    return TARGET_CAP_HEIGHT / capPx
}

// ---- Layout ----------------------------------------------------------------
function computeLayout(glyphs) {
    // 1D positions along the diagonal axis, centred on the original midpoint.
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

    const D = [B[0] - A[0], 0, B[2] - A[2]]
    const L = Math.hypot(D[0], D[2])
    const u = [D[0] / L, 0, D[2] / L]
    const M = [(A[0] + B[0]) / 2, A[1], (A[2] + B[2]) / 2]

    return centred.map(sv => [
        M[0] + u[0] * sv,
        M[1],
        M[2] + u[2] * sv,
    ])
}

// ---- Main ------------------------------------------------------------------
async function main() {
    const [inputPath, outputPath, ...flags] = process.argv.slice(2)
    if (!inputPath || !outputPath) {
        console.error('Usage: node scripts/build-urmil-letters.js <in.glb> <out.glb> [--draco]')
        process.exit(1)
    }
    const useDraco = flags.includes('--draco')

    const fontBuf = fs.readFileSync('static/fonts/Pally-Bold.ttf')
    const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength))

    const fontSize = 1000
    const scaleFactor = computeScaleFactor(font, fontSize)
    const glyphs = WORD.split('').map(ch => buildGlyphGeometry(font, ch, fontSize, scaleFactor))
    const positions = computeLayout(glyphs)

    // IO
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    })

    const doc = await io.read(inputPath)
    const root = doc.getRoot()
    const buffer = root.listBuffers()[0]
    const paletteMat = root.listMaterials().find(m => m.getName() === 'palette')
    if (!paletteMat) throw new Error('palette material not found')

    const nodeByName = name => root.listNodes().find(n => n.getName() === name)

    // Update kept nodes
    for (let i = 0; i < KEEP_NODES.length; i++) {
        const node = nodeByName(KEEP_NODES[i])
        if (!node) throw new Error(`missing node ${KEEP_NODES[i]}`)
        const g = glyphs[i]
        const oldMesh = node.getMesh()

        // Build accessors
        const posAcc = doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.position)).setBuffer(buffer)
        const normAcc = doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.normal)).setBuffer(buffer)
        const uvArr = new Float32Array(g.vertexCount * 2)
        for (let v = 0; v < g.vertexCount; v++) { uvArr[v * 2] = LETTER_UV[0]; uvArr[v * 2 + 1] = LETTER_UV[1] }
        const uvAcc = doc.createAccessor().setType('VEC2').setArray(uvArr).setBuffer(buffer)

        const prim = doc.createPrimitive()
            .setAttribute('POSITION', posAcc)
            .setAttribute('NORMAL', normAcc)
            .setAttribute('TEXCOORD_0', uvAcc)
            .setMaterial(paletteMat)
        if (g.index) {
            const Idx = g.vertexCount > 65535 ? Uint32Array : Uint16Array
            const idxAcc = doc.createAccessor().setType('SCALAR').setArray(new Idx(g.index)).setBuffer(buffer)
            prim.setIndices(idxAcc)
        }
        const mesh = doc.createMesh(oldMesh ? oldMesh.getName() : `Text.URMIL.${i}`).addPrimitive(prim)
        node.setMesh(mesh)

        // Re-position along diagonal (keep yaw rotation + scale)
        node.setTranslation(positions[i])

        // Update cuboid collider child (first child with a cuboid name)
        const cuboid = node.listChildren().find(c => /^cuboid/i.test(c.getName()))
        if (!cuboid) throw new Error(`no cuboid child on ${KEEP_NODES[i]}`)
        cuboid.setTranslation([0, 0, 0])
        cuboid.setRotation([0, 0, 0, 1])
        cuboid.setScale([g.width, g.height, g.depth])
    }

    // Remove unwanted nodes (detach from parents + dispose subtree)
    for (const name of REMOVE_NODES) {
        const node = nodeByName(name)
        if (!node) continue
        for (const child of [...node.listChildren()]) child.dispose()
        node.dispose()
    }

    // Prune ONLY orphaned meshes/accessors (old Text meshes + their accessors).
    // Crucially do NOT prune nodes: the asset contains many empty reference nodes
    // (interactive points, zones, etc.) that the game looks up by name.
    await doc.transform(prune({
        propertyTypes: [PropertyType.MESH, PropertyType.ACCESSOR],
        keepLeaves: true,
        keepAttributes: true,
    }))

    if (useDraco) {
        await doc.transform(draco({
            method: 'edgebreaker',
            quantizationVolume: 'mesh',
            quantizationBits: { POSITION: 12, NORMAL: 6, TEX_COORD: 6, COLOR: 2, GENERIC: 2 },
        }))
    }

    await io.write(outputPath, doc)
    console.log(`Wrote ${outputPath}${useDraco ? ' (draco)' : ''}`)
    console.log('Layout (world-local along diagonal):')
    for (let i = 0; i < WORD.length; i++) {
        const g = glyphs[i]
        console.log(`  ${WORD[i]}  pos=[${positions[i].map(v => v.toFixed(3))}]  wh-d=[${g.width.toFixed(3)}, ${g.height.toFixed(3)}, ${g.depth.toFixed(3)}]  verts=${g.vertexCount}`)
    }
    console.log('scaleFactor:', scaleFactor.toFixed(6))
}

main().catch(e => { console.error(e); process.exit(1) })
