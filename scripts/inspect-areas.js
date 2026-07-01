import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
let MeshoptDecoder, MeshoptEncoder
try { ({ MeshoptDecoder, MeshoptEncoder } = await import('meshoptimizer')) } catch {}

const path = process.argv[2] || 'static/areas/areas.glb'

async function main() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
    // Try to register decoders if available
    try {
        io.registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        })
    } catch (e) { console.log('draco not available:', e.message) }
    try {
        if (!MeshoptDecoder) throw new Error('meshoptimizer not installed')
        await MeshoptDecoder.ready
        await MeshoptEncoder.ready
        io.registerDependencies({
            'meshopt.decoder': MeshoptDecoder,
            'meshopt.encoder': MeshoptEncoder,
        })
    } catch (e) { console.log('meshopt not available:', e.message) }

    const doc = await io.read(path)
    const root = doc.getRoot()

    console.log('=== EXTENSIONS USED ===')
    console.log(root.listExtensionsUsed().map(e => e.extensionName))

    console.log('\n=== SCENES / TOP NODES ===')
    for (const scene of root.listScenes()) {
        console.log('scene:', scene.getName())
        for (const n of scene.listChildren()) console.log('  top node:', n.getName())
    }

    // Find landing node
    const landing = root.listNodes().find(n => n.getName().startsWith('landing'))
    console.log('\n=== LANDING NODE ===', landing && landing.getName())

    // Find all letter ref nodes
    const letterNodes = root.listNodes().filter(n => /refLettersPhysicalDynamic/i.test(n.getName()))
    console.log('\n=== LETTER REF NODES (count', letterNodes.length, ') ===')
    for (const ln of letterNodes) {
        const t = ln.getTranslation()
        const r = ln.getRotation()
        const s = ln.getScale()
        const mesh = ln.getMesh()
        console.log(`\n• ${ln.getName()}`)
        console.log(`   T=[${t.map(v=>v.toFixed(3))}] R=[${r.map(v=>v.toFixed(4))}] S=[${s.map(v=>v.toFixed(3))}]`)
        console.log(`   own mesh: ${mesh ? mesh.getName() : 'none'}`)
        for (const c of ln.listChildren()) {
            const cm = c.getMesh()
            const ct = c.getTranslation()
            const cs = c.getScale()
            const cr = c.getRotation()
            console.log(`   child: ${c.getName()}  mesh=${cm ? cm.getName() : 'none'}  T=[${ct.map(v=>v.toFixed(3))}] R=[${cr.map(v=>v.toFixed(4))}] S=[${cs.map(v=>v.toFixed(3))}]`)
            if (cm) {
                for (const prim of cm.listPrimitives()) {
                    const pos = prim.getAttribute('POSITION')
                    console.log(`        prim mat=${prim.getMaterial()?.getName()} posCount=${pos?.getCount()} bbox min=${pos?.getMinNormalized ? '' : ''}`)
                }
            }
        }
        if (mesh) {
            for (const prim of mesh.listPrimitives()) {
                const pos = prim.getAttribute('POSITION')
                const min = [], max = []
                pos.getMinNormalized ? pos.getMin(min) : pos.getMin(min)
                pos.getMax(max)
                console.log(`   own prim mat=${prim.getMaterial()?.getName()} posCount=${pos.getCount()} min=[${min.map(v=>v.toFixed(3))}] max=[${max.map(v=>v.toFixed(3))}] indices=${prim.getIndices()?.getCount()}`)
            }
        }
    }

    console.log('\n=== MATERIALS ===')
    for (const m of root.listMaterials()) console.log('  material:', m.getName())
}

main().catch(e => { console.error(e); process.exit(1) })
