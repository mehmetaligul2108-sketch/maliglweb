// Harita yolculuğundan gelince: sis dağılır, sinematik bantlar çekilir, konum başlığı görünüp söner, sayfa belirir.
import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { AntalyaMap, MAP_H, MAP_W } from "@/components/map/AntalyaMap"
import { applyCam, baseZoom } from "@/components/map/camera"
import { useLang } from "@/lib/i18n"
import { PAGES, type PageId } from "@/lib/site"

export function takeArrival(current: PageId) {
  try {
    const v = sessionStorage.getItem("mag-arrive")
    sessionStorage.removeItem("mag-arrive")
    return v === current
  } catch { return false }
}

export function Arrival({ current, onDone }: { current: PageId; onDone: () => void }) {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [p] = useState(() => PAGES[current])
  const up = (s: string) => s.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")

  useLayoutEffect(() => {
    const z0 = baseZoom()
    const cam = { cx: p.x, cy: p.y, z: z0 * 6, tilt: 0 }
    applyCam(stage.current!, null, cam)
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ onComplete: onDone })
    tl.fromTo(q(".arr-fog"), { opacity: 1 }, { opacity: 0, duration: 1.1, ease: "sine.inOut" })
      .to(cam, { z: z0 * 11, duration: 1.6, ease: "power2.in", onUpdate: () => applyCam(stage.current!, null, cam) }, 0)
      .fromTo(q(".arr-title"), { opacity: 1 }, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, 0.8)
      .to(q(".arr-map"), { opacity: 0, duration: 0.8, ease: "sine.inOut" }, 0.8)
      .fromTo("main", { scale: 1.05, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 1.3, ease: "power2.out", clearProps: "transform,opacity" }, 0.9)
    return () => { tl.kill() }
  }, [p, onDone])

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" aria-hidden="true">
      <div className="arr-map absolute inset-0 bg-[#0b0618]">
        <div ref={stage} className="absolute left-0 top-0 will-change-transform" style={{ width: MAP_W, height: MAP_H, transformOrigin: "0 0" }}>
          <AntalyaMap lang={lang} current={current} pins={false} />
        </div>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 78% at 50% 50%, transparent 66%, rgba(214,186,255,.18) 78%, rgba(235,215,255,.5) 100%)" }} />
        <div className="arr-fog absolute inset-0 bg-[#0b0618]" />
      </div>
      <div className="arr-title absolute inset-x-0 bottom-[14vh] text-center">
        <div className="font-display text-[13vw] leading-none tracking-wide text-white [text-shadow:0_6px_30px_rgba(0,0,0,.6)] md:text-8xl">{up(t(p.place))}</div>
        <div className="mx-auto mt-2 flex w-max items-center gap-3 font-display text-lg tracking-[.35em] md:text-2xl" style={{ color: p.color }}>
          <span className="h-[3px] w-10" style={{ background: p.color }} />{up(t(p.name))}<span className="h-[3px] w-10" style={{ background: p.color }} />
        </div>
      </div>
    </div>
  )
}
