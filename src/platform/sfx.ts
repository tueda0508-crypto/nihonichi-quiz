// 効果音は Web Audio API でその場で合成する（音源ファイルなし・オフラインでも鳴る）

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

/** ユーザーのタップの中で呼ぶ。iOS はここで初めて音が出せるようになる */
export function unlockAudio() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    // iOS 17+ でマナーモードでも鳴らす
    if (nav.audioSession) nav.audioSession.type = 'playback'
    if (!ctx) ctx = new AudioContext()
    if (ctx.state !== 'running') void ctx.resume()
  } catch {
    ctx = null
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.18) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(g).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function play(fn: (t: number) => void) {
  if (!enabled || !ctx) return
  if (ctx.state !== 'running') void ctx.resume()
  fn(ctx.currentTime + 0.01)
}

export const sfx = {
  tap: () => play((t) => tone(660, t, 0.08, 'triangle', 0.12)),
  handoff: () =>
    play((t) => {
      tone(523, t, 0.1, 'triangle')
      tone(784, t + 0.09, 0.14, 'triangle')
    }),
  correct: () =>
    play((t) => {
      tone(988, t, 0.14, 'sine', 0.2)
      tone(1319, t + 0.13, 0.3, 'sine', 0.2)
    }),
  wrong: () =>
    play((t) => {
      tone(196, t, 0.22, 'square', 0.08)
      tone(185, t + 0.2, 0.3, 'square', 0.08)
    }),
  drumroll: (seconds: number) =>
    play((t) => {
      const hits = Math.floor(seconds / 0.05)
      for (let i = 0; i < hits; i++)
        tone(110 + (i % 2) * 8, t + i * 0.05, 0.05, 'triangle', 0.05 + (i / hits) * 0.1)
      tone(147, t + seconds, 0.25, 'square', 0.12)
    }),
  fanfare: () =>
    play((t) => {
      ;[523, 659, 784, 1047].forEach((f, i) => {
        tone(f, t + i * 0.12, 0.18, 'triangle', 0.16)
      })
      tone(1047, t + 0.5, 0.5, 'triangle', 0.16)
    }),
}
