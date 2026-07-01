/**
 * HEADLESS RAPIER SMOKE TEST — reproduces the exact runtime collider path.
 *
 * For the UNCOMPRESSED file the geometry is decoded through THREE's GLTFLoader
 * (the real runtime decoder: identical interleaving / stride / name handling as
 * the browser). For the DRACO-COMPRESSED file geometry is decoded with
 * gltf-transform's Draco decoder (the same draco library THREE's DRACOLoader
 * uses). Then, replicating sources/Game/Objects.js + Physics.js, every collider
 * child in the scene is built and the world is stepped 120x. A corrupt trimesh
 * panics Rapier here exactly as it did in the browser.
 *
 *   trimesh -> ColliderDesc.trimesh(position.array, index.array)
 *   hull    -> ColliderDesc.convexHull(position.array)
 *   cuboid  -> ColliderDesc.cuboid(scale*0.5)        [dynamic]
 *   tube    -> ColliderDesc.cylinder(scale.y/2, scale.x/2)
 *   ball    -> ColliderDesc.ball(scale.y/2)
 *
 * Usage: node scripts/smoke-rapier.js <file.glb>
 */
// THREE GLTFLoader is browser-oriented; shim the texture path (geometry only).
globalThis.self = globalThis
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} })

import fs from 'node:fs'
import RAPIER from '@dimforge/rapier3d-compat'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'

const file = process.argv[2]
if (!file) { console.error('usage: node scripts/smoke-rapier.js <file.glb>'); process.exit(1) }

function isDraco(filePath) {
    const buf = fs.readFileSync(filePath)
    const total = buf.readUInt32LE(8)
    let off = 12
    while (off < total) {
        const clen = buf.readUInt32LE(off), ctype = buf.readUInt32LE(off + 4)
        if (ctype === 0x4e4f534a) {
            const json = JSON.parse(new TextDecoder().decode(buf.subarray(off + 8, off + 8 + clen)))
            return (json.extensionsUsed || []).includes('KHR_draco_mesh_compression')
        }
        off += 8 + clen
    }
    return false
}

// Collect colliders as {shape, positions?, indices?, scale?} via THREE.
async function collectViaThree(filePath) {
    const buf = fs.readFileSync(filePath)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const gltf = await new Promise((res, rej) => new GLTFLoader().parse(ab, '', res, rej))
    const out = []
    gltf.scene.traverse(o => {
        const n = o.name || ''
        if (/^trimesh/i.test(n) && o.geometry) {
            out.push({ name: n, shape: 'trimesh', positions: o.geometry.attributes.position.array, indices: o.geometry.index.array })
        } else if (/^hull/i.test(n) && o.geometry) {
            out.push({ name: n, shape: 'hull', positions: o.geometry.attributes.position.array })
        } else if (/^cuboid/i.test(n)) {
            out.push({ name: n, shape: 'cuboid', scale: [o.scale.x, o.scale.y, o.scale.z] })
        } else if (/^tube/i.test(n)) {
            out.push({ name: n, shape: 'cylinder', scale: [o.scale.x, o.scale.y, o.scale.z] })
        } else if (/^ball/i.test(n)) {
            out.push({ name: n, shape: 'ball', scale: [o.scale.x, o.scale.y, o.scale.z] })
        }
    })
    return out
}

// Collect colliders via gltf-transform (Draco-aware). Mirrors node-name rules.
async function collectViaGltfTransform(filePath) {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    })
    const doc = await io.read(filePath)
    const out = []
    for (const node of doc.getRoot().listNodes()) {
        const n = node.getName() || ''
        if (/^trimesh/i.test(n) || /^hull/i.test(n)) {
            const mesh = node.getMesh(); if (!mesh) continue
            const prim = mesh.listPrimitives()[0]
            const p = prim.getAttribute('POSITION').getArray()
            const positions = p instanceof Float32Array ? p : Float32Array.from(p)
            if (/^trimesh/i.test(n)) {
                const idx = prim.getIndices().getArray()
                out.push({ name: n, shape: 'trimesh', positions, indices: idx instanceof Uint32Array ? idx : Uint32Array.from(idx) })
            } else {
                out.push({ name: n, shape: 'hull', positions })
            }
        } else if (/^cuboid/i.test(n)) {
            out.push({ name: n, shape: 'cuboid', scale: node.getScale() })
        } else if (/^tube/i.test(n)) {
            out.push({ name: n, shape: 'cylinder', scale: node.getScale() })
        } else if (/^ball/i.test(n)) {
            out.push({ name: n, shape: 'ball', scale: node.getScale() })
        }
    }
    return out
}

async function main() {
    await RAPIER.init()
    const draco = isDraco(file)
    const colliders = draco ? await collectViaGltfTransform(file) : await collectViaThree(file)

    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
    const counts = { trimesh: 0, hull: 0, cuboid: 0, cylinder: 0, ball: 0 }
    const errors = []
    let created = 0

    for (const c of colliders) {
        try {
            let desc = null
            let dynamic = true
            if (c.shape === 'trimesh') {
                const positions = c.positions instanceof Float32Array ? c.positions : Float32Array.from(c.positions)
                const indices = c.indices instanceof Uint32Array ? c.indices : Uint32Array.from(c.indices)
                desc = RAPIER.ColliderDesc.trimesh(positions, indices); dynamic = false
            } else if (c.shape === 'hull') {
                const positions = c.positions instanceof Float32Array ? c.positions : Float32Array.from(c.positions)
                desc = RAPIER.ColliderDesc.convexHull(positions); dynamic = false
            } else if (c.shape === 'cuboid') {
                desc = RAPIER.ColliderDesc.cuboid(c.scale[0] * 0.5, c.scale[1] * 0.5, c.scale[2] * 0.5)
            } else if (c.shape === 'cylinder') {
                desc = RAPIER.ColliderDesc.cylinder(c.scale[1] * 0.5, c.scale[0] * 0.5)
            } else if (c.shape === 'ball') {
                desc = RAPIER.ColliderDesc.ball(c.scale[1] * 0.5)
            }
            if (!desc) { errors.push(`${c.name}: ${c.shape} desc null (invalid geometry)`); continue }
            const body = world.createRigidBody(dynamic ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed())
            world.createCollider(desc.setDensity(0.1), body)
            counts[c.shape]++; created++
        } catch (e) {
            errors.push(`${c.name}: ${c.shape} threw -> ${e.message}`)
        }
    }

    console.log(`[${file}]  decoder=${draco ? 'gltf-transform(draco)' : 'three GLTFLoader'}`)
    console.log('  colliders created:', created, JSON.stringify(counts))
    if (errors.length) { console.error('  CREATE ERRORS:'); errors.forEach(e => console.error('   -', e)) }

    let stepErr = null
    try { for (let i = 0; i < 120; i++) world.step() }
    catch (e) { stepErr = e }

    if (stepErr) { console.error('  WORLD.STEP PANIC:', stepErr.message || stepErr); process.exit(1) }
    if (errors.length) process.exit(1)
    console.log('  120 world.step() calls completed, NO panic. PASS.')
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
