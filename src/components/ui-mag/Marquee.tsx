// Kaydırma hızına tepki veren eğik neon şerit: hızlı kaydırınca hızlanır, yön değişince tersine akar.
import { useEffect, useRef } from "react"
import gsap from "gsap"

export function Marquee({ items, color = "#ff4fd8", text = "#120822", tilt = -2 }: { items: string[]; color?: string; text?: string; tilt?: number }) {
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = track.current
    if (!el) return
    let x = 0, dir = 1
    const tick = (_t: number, dt: number) => {
      const lenis = (window as unknown as { lenis?: { velocity: number } }).lenis
      const v = lenis?.velocity ?? 0
      if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1
      const half = el.scrollWidth / 2
      x -= dir * (0.06 + Math.min(Math.abs(v) * 0.02, 0.9)) * dt
      if (x <= -half) x += half
      if (x > 0) x -= half
      el.style.transform = `translate3d(${x}px,0,0) skewX(${gsap.utils.clamp(-12, 12, -v * 0.4)}deg)`
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])
  const row = [...items, ...items, ...items]
  return (
    <div className="relative z-10 -my-3 overflow-hidden py-3" aria-hidden="true">
      <div className="border-y-2 py-2.5 shadow-[0_0_30px_rgba(0,0,0,.4)]" style={{ background: color, borderColor: "#fff3", transform: `rotate(${tilt}deg) scale(1.04)` }}>
        <div ref={track} className="flex w-max gap-8 whitespace-nowrap font-display text-xl tracking-[.2em] will-change-transform md:text-3xl" style={{ color: text }}>
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-8">{row.map((it, i) => <span key={i} className="flex items-center gap-8">{it}<span>★</span></span>)}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
