// Sitenin her sayfasına eklenen animasyon katmanı:
// neon imleç, kaydırma ilerleme çubuğu, başlıklarda harf karıştırma, kartlarda 3D eğilme, mıknatıslı butonlar.
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const GLYPHS = "ABCDEFGHİJKLMNOÖPRSŞTUÜVYZ0123456789#$%&@*+=?"

function scramble(el: HTMLElement) {
  const nodes: Text[] = []
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  while (walk.nextNode()) { const n = walk.currentNode as Text; if (n.nodeValue?.trim()) nodes.push(n) }
  nodes.forEach((n) => {
    const final = n.nodeValue ?? ""
    const o = { p: 0 }
    gsap.to(o, {
      p: 1, duration: Math.min(1.1, 0.35 + final.length * 0.03), ease: "power1.out",
      onUpdate: () => {
        const k = Math.floor(o.p * final.length)
        let out = final.slice(0, k)
        for (let i = k; i < final.length; i++) out += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        n.nodeValue = out
      },
      onComplete: () => { n.nodeValue = final },
    })
  })
}

export function GlobalFx({ ready }: { ready: boolean }) {
  const bar = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  // Kaydırma ilerleme çubuğu
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})` } })
    return () => st.kill()
  }, [])

  // Neon imleç (sadece fare olan cihazlarda)
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return
    const d = dot.current!, r = ring.current!
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 1 })
    const dx = gsap.quickTo(d, "x", { duration: 0.08 }), dy = gsap.quickTo(d, "y", { duration: 0.08 })
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" }), ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" })
    const move = (e: PointerEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) }
    const over = (e: Event) => {
      const hit = (e.target as HTMLElement).closest?.("a, button, [role=button], input, label, [data-tilt]")
      gsap.to(r, { scale: hit ? 1.9 : 1, borderColor: hit ? "#ffe066" : "#ff4fd8", duration: 0.3 })
    }
    const down = () => gsap.to(r, { scale: 0.7, duration: 0.15 })
    const up = () => gsap.to(r, { scale: 1, duration: 0.3 })
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerover", over)
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointerup", up)
    document.documentElement.classList.add("has-neon-cursor")
    return () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over)
      window.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up)
      document.documentElement.classList.remove("has-neon-cursor")
    }
  }, [])

  // 3D eğilme ([data-tilt]) ve mıknatıslı butonlar ([data-magnetic]) — olay yetkilendirmesiyle, her sayfada çalışır
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return
    let tilted: HTMLElement | null = null, mag: HTMLElement | null = null
    const move = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      const t = el.closest?.("[data-tilt]") as HTMLElement | null
      if (tilted && tilted !== t) { gsap.to(tilted, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" }); tilted.style.setProperty("--glare", "0") }
      tilted = t
      if (t) {
        const b = t.getBoundingClientRect()
        const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5
        gsap.to(t, { rotateY: px * 14, rotateX: -py * 14, transformPerspective: 900, duration: 0.4, ease: "power2.out" })
        t.style.setProperty("--gx", `${(px + 0.5) * 100}%`); t.style.setProperty("--gy", `${(py + 0.5) * 100}%`); t.style.setProperty("--glare", "1")
      }
      const m = el.closest?.("[data-magnetic]") as HTMLElement | null
      if (mag && mag !== m) gsap.to(mag, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, .4)" })
      mag = m
      if (m) {
        const b = m.getBoundingClientRect()
        gsap.to(m, { x: (e.clientX - b.left - b.width / 2) * 0.3, y: (e.clientY - b.top - b.height / 2) * 0.35, duration: 0.4, ease: "power3.out" })
      }
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [])

  // Bölüm başlıklarında harf karıştırma (şifre çözülür gibi), ilk görünüşte bir kez
  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("main h2:not([data-noscramble])").forEach((h) => {
        ScrollTrigger.create({ trigger: h, start: "top 88%", once: true, onEnter: () => scramble(h) })
      })
      ScrollTrigger.refresh()
    }, 400)
    return () => window.clearTimeout(id)
  }, [ready])

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[61] h-[3px] origin-left bg-gradient-to-r from-[#3ff2ff] via-[#ff4fd8] to-[#ffe066] shadow-[0_0_10px_#ff4fd8]" ref={bar} style={{ transform: "scaleX(0)" }} />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[200] size-2 rounded-full bg-white opacity-0 shadow-[0_0_10px_#fff,0_0_20px_#ff4fd8]" />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[200] size-9 rounded-full border-2 border-[#ff4fd8] opacity-0 shadow-[0_0_14px_rgba(255,79,216,.6)] mix-blend-screen" />
    </>
  )
}
