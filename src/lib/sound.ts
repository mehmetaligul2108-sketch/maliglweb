// Ses: kısık efektler ve "MAG FM" radyosu. Hepsi Web Audio ile kodla üretilir (dosya yok, telif yok).
let ctx: AudioContext | null = null
let master: GainNode | null = null

function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

const store = {
  get(key: string, def: boolean) {
    try { const v = localStorage.getItem(key); return v === null ? def : v === "1" } catch { return def }
  },
  set(key: string, v: boolean) { try { localStorage.setItem(key, v ? "1" : "0") } catch { /* yok say */ } },
}

export const sfxEnabled = () => store.get("mag-sfx", true)
export const setSfxEnabled = (v: boolean) => store.set("mag-sfx", v)

const SFX_VOL = 0.07 // çok kısık

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slideTo?: number) {
  const c = ac(); if (!c || !master) return
  const t = c.currentTime + when
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t); o.stop(t + dur + 0.05)
}

function noise(dur: number, vol: number, when = 0, from = 400, to = 4000) {
  const c = ac(); if (!c || !master) return
  const t = c.currentTime + when
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource(); src.buffer = buf
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(master)
  src.start(t)
}

export type Sfx = "blip" | "whoosh" | "phone" | "send" | "tap" | "glitch"

export function sfx(kind: Sfx) {
  if (!sfxEnabled()) return
  switch (kind) {
    case "blip": tone(880, 0.09, "sine", SFX_VOL); tone(1320, 0.08, "sine", SFX_VOL * 0.7, 0.07); break
    case "tap": tone(660, 0.05, "triangle", SFX_VOL * 0.8); break
    case "whoosh": noise(0.9, SFX_VOL * 1.4, 0, 300, 5000); break
    case "phone": for (let i = 0; i < 3; i++) tone(150, 0.07, "square", SFX_VOL * 0.5, i * 0.11); break
    case "send": tone(520, 0.12, "sine", SFX_VOL, 0, 1400); break
    case "glitch": noise(0.18, SFX_VOL, 0, 2000, 800); tone(90, 0.15, "sawtooth", SFX_VOL * 0.6); break
  }
}

// ---------- MAG FM: kodla üretilen synthwave döngüsü ----------
let radioOn = false
let radioGain: GainNode | null = null
let timer: number | undefined
let nextTime = 0
let step = 0
const BPM = 96
const STEP = 60 / BPM / 4 // 16'lık nota
// Am - F - C - G
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

function scheduleStep(c: AudioContext, t: number, s: number) {
  if (!radioGain) return
  const bar = Math.floor(s / 16) % 4
  const chord = CHORDS[bar]
  const pos = s % 16
  const out = radioGain
  const voice = (f: number, dur: number, type: OscillatorType, vol: number, cutoff: number) => {
    const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter()
    o.type = type; o.frequency.value = f
    fl.type = "lowpass"; fl.frequency.value = cutoff
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(fl).connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05)
  }
  // bas: 8'lik notalar
  if (pos % 2 === 0) voice(mtof(chord[0] - 24), STEP * 1.8, "sawtooth", 0.16, 500)
  // arpej
  voice(mtof(chord[pos % 3] + 12), STEP * 0.9, "square", 0.035, 2200)
  // ped: her ölçü başında
  if (pos === 0) chord.forEach((n) => voice(mtof(n), STEP * 16, "sawtooth", 0.03, 1200))
  // davul: kick 1-3, snare 2-4
  if (pos === 0 || pos === 8) {
    const o = c.createOscillator(), g = c.createGain()
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25)
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.35)
  }
  if (pos === 4 || pos === 12) {
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.2), c.sampleRate)
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    const src = c.createBufferSource(); src.buffer = buf
    const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1200
    const g = c.createGain(); g.gain.value = 0.12
    src.connect(f).connect(g).connect(out); src.start(t)
  }
}

export const radioPlaying = () => radioOn

export function setRadio(on: boolean) {
  const c = ac(); if (!c || !master) return
  if (on === radioOn) return
  radioOn = on
  if (on) {
    radioGain = c.createGain()
    radioGain.gain.setValueAtTime(0.0001, c.currentTime)
    radioGain.gain.exponentialRampToValueAtTime(0.22, c.currentTime + 1.5)
    radioGain.connect(master)
    nextTime = c.currentTime + 0.1
    timer = window.setInterval(() => {
      while (nextTime < c.currentTime + 0.2) { scheduleStep(c, nextTime, step); nextTime += STEP; step++ }
    }, 50)
  } else {
    window.clearInterval(timer)
    const g = radioGain
    if (g) { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6); setTimeout(() => g.disconnect(), 800) }
    radioGain = null
  }
  try { sessionStorage.setItem("mag-radio", on ? "1" : "0") } catch { /* yok say */ }
}
