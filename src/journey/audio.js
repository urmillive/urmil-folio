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
    /* soft grab cue — barely there */
    tick() {
      tone({ freq: 520, dur: 0.06, type: 'triangle', vol: 0.015 })
    },
    /* CRT power-on: warm low swell, one gentle beep */
    boot() {
      tone({ freq: 80, dur: 0.9, type: 'sine', vol: 0.02, slide: 140 })
      tone({ freq: 660, dur: 0.4, when: 0.8, type: 'sine', vol: 0.025 })
    },
    /* payment ding — a soft third */
    ding() {
      tone({ freq: 880, dur: 0.3, type: 'triangle', vol: 0.03 })
      tone({ freq: 1108, dur: 0.5, when: 0.1, type: 'sine', vol: 0.025 })
    },
    /* checklist tick — one soft note */
    check() {
      tone({ freq: 740, dur: 0.12, type: 'triangle', vol: 0.02 })
    },
    /* twin awakening — slow, warm major arpeggio */
    chime() {
      ;[261.6, 329.6, 392, 523.3].forEach((f, i) =>
        tone({ freq: f, dur: 0.9, when: i * 0.22, type: 'sine', vol: 0.022 })
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
