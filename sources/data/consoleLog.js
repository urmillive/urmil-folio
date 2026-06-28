import * as THREE from 'three/webgpu'

const text = `
╔══════════════════════════════════════════╗
║   URMIL  RUPARELIYA  ·  PORTFOLIO         ║
║   full-stack engineer · ships AI SaaS     ║
╚══════════════════════════════════════════╝

╔═ Intro ═══════════════╗
║ Thank you for visiting my portfolio, you sneaky developer!
║ If you are curious about the stack and how this is built, here’s everything you need to know.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ Mail            ⇒ urmillive@gmail.com
║ GitHub          ⇒ https://github.com/urmillive
║ LinkedIn        ⇒ https://www.linkedin.com/in/urmillive
║ X               ⇒ https://x.com/urmillive
║ Youtube         ⇒ https://www.youtube.com/@urmillive
║ Instagram       ⇒ https://www.instagram.com/urmillive
║ Stack Overflow  ⇒ https://stackoverflow.com/users/12697583/urmil-rupareliya
║ Topmate         ⇒ https://topmate.io/urmillive
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ You can access the debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Three.js ════════════╗
║ Three.js is the library I’m using to render this 3D world (release: ${THREE.REVISION})
║ https://threejs.org/
║ It was created by mr.doob (https://x.com/mrdoob, https://github.com/mrdoob),
║ followed by hundreds of awesome developers,
║ one of which being Sunag (https://x.com/sea3dformat, https://github.com/sunag) who added TSL,
║ enabling the use of both WebGL and WebGPU, making this portfolio possible.
╚═══════════════════════╝

╔═ Three.js Journey ════╗
║ If you want to learn Three.js, I got you covered with this huge course.
║ https://threejs-journey.com/
║ It contains everything you need to start building awesome stuff with Three.js (and much more).
╚═══════════════════════╝

╔═ Devlogs ═════════════╗
║ I’ve been making devlogs since the very start of this portfolio
║ and you can find them all on my Youtube channel.
║ https://www.youtube.com/@BrunoSimon
╚═══════════════════════╝

╔═ Source code ═════════╗
║ This portfolio is built on Bruno Simon's open-source folio-2025 (MIT). Huge thanks to him!
║ Original ⇒ https://github.com/brunosimon/folio-2025
║ My fork  ⇒ https://github.com/urmillive
╚═══════════════════════╝

╔═ Musics ══════════════╗
║ The music you hear was made especially for this portfolio by the awesome Kounine (Linktree).
║ https://linktr.ee/Kounine
║ They are now under CC0 license, meaning you can do whatever you want with them!
║ Download them here.
║ https://github.com/brunosimon/folio-2025/tree/main/static/sounds/musics
╚═══════════════════════╝

╔═ Some more links ═════╗
║ Rapier (Physics library)  ⇒ https://rapier.rs/
║ Howler.js (Audio library) ⇒ https://howlerjs.com/
║ Amatic SC (Fonts)         ⇒ https://fonts.google.com/specimen/Amatic+SC
║ Nunito (Fonts).           ⇒ https://fonts.google.com/specimen/Nunito?query=Nunito
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]