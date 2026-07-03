/* Synthesized sound design — zero audio files, pure WebAudio.
   Muted by default (autoplay policy); the topbar toggle is the gesture
   that unlocks the AudioContext. Jarvis speaks via speechSynthesis. */

export const createAudio = () => {
  let ctx = null
  let enabled = false

  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
  }

  const tone = ({ freq, dur = 0.1, type = 'sine', vol = 0.05, when = 0, slide = 0 }) => {
    if (!enabled || !ctx) return
    const t = ctx.currentTime + when
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  return {
    get enabled() {
      return enabled
    },
    toggle() {
      enabled = !enabled
      if (enabled) ensure()
      else window.speechSynthesis?.cancel()
      return enabled
    },
    /* typing tick — soft, randomized */
    tick() {
      tone({ freq: 1300 + Math.random() * 600, dur: 0.02, type: 'square', vol: 0.012 })
    },
    /* CRT power-on: low hum then rising double beep */
    boot() {
      tone({ freq: 60, dur: 0.6, type: 'sawtooth', vol: 0.04, slide: 120 })
      tone({ freq: 660, dur: 0.15, when: 0.55, vol: 0.06 })
      tone({ freq: 1320, dur: 0.3, when: 0.72, vol: 0.05 })
    },
    /* payment ding */
    ding() {
      tone({ freq: 880, dur: 0.12, vol: 0.07 })
      tone({ freq: 1318, dur: 0.35, when: 0.12, vol: 0.07 })
    },
    /* checklist tick */
    check() {
      tone({ freq: 620, dur: 0.07, vol: 0.05 })
      tone({ freq: 930, dur: 0.09, when: 0.07, vol: 0.04 })
    },
    /* twin awakening chime */
    chime() {
      ;[523, 659, 784, 1046].forEach((f, i) =>
        tone({ freq: f, dur: 0.4, when: i * 0.12, vol: 0.045 })
      )
    },
    /* Jarvis speaks */
    speak(text) {
      if (!enabled || !('speechSynthesis' in window)) return
      try {
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 0.92
        u.pitch = 0.7
        u.volume = 0.9
        window.speechSynthesis.speak(u)
      } catch {
        /* no voice available — visual stays */
      }
    },
  }
}
