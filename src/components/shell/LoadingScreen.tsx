// İlk girişte görünen yükleme ekranı: gün batımı, dönen ipuçları, yüzde sayacı.
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { SunsetScene } from "@/components/scene/SunsetScene"
import { useLang } from "@/lib/i18n"

const TIPS = [
  { tr: "İpucu: Haritayı açmak için köşedeki radara tıkla.", en: "Tip: Click the radar in the corner to open the map." },
  { tr: "İpucu: Telefonu kapatmak için alttaki parlayan çubuğa dokun.", en: "Tip: Tap the glowing bar at the bottom to put the phone away." },
  { tr: "İpucu: Dili sağ üstteki neon tabeladan değiştirebilirsin.", en: "Tip: Switch the language with the neon sign at the top right." },
  { tr: "İpucu: MAG FM'i açmak için sol alttaki radyoya bas.", en: "Tip: Press the radio at the bottom left to tune in to MAG FM." },
]

export function shouldShowLoading() {
  try { return !sessionStorage.getItem("mag-loaded") } catch { return true }
}

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const [tip, setTip] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTip((v) => (v + 1) % TIPS.length), 2200)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const prog = { v: 0 }
    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }))),
    ])
    const tl = gsap.timeline()
    tl.to(prog, { v: 82, duration: 2, ease: "power1.inOut", onUpdate: () => setPct(Math.round(prog.v)) })
    let cancelled = false
    void ready.then(() => tl.then(() => {
      if (cancelled) return
      gsap.timeline()
        .to(prog, { v: 100, duration: 0.5, onUpdate: () => setPct(Math.round(prog.v)) })
        .to(root.current, { opacity: 0, duration: 0.9, ease: "power2.inOut", delay: 0.2 })
        .add(() => { try { sessionStorage.setItem("mag-loaded", "1") } catch { /* yok say */ } onDone() })
    }))
    return () => { cancelled = true; tl.kill() }
  }, [onDone])

  return (
    <div ref={root} className="fixed inset-0 z-[100] bg-[#160a2e]" role="status" aria-live="polite">
      <SunsetScene drift />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0618]/80 via-transparent to-transparent" />
      <div className="absolute bottom-8 left-6 right-28 max-w-xl md:bottom-12 md:left-12">
        <p key={tip} className="animate-in fade-in slide-in-from-bottom-2 text-base font-medium text-white md:text-lg [text-shadow:0_2px_10px_#000]">{t(TIPS[tip])}</p>
      </div>
      <div className="absolute bottom-8 right-6 flex items-center gap-3 md:bottom-12 md:right-12">
        <span className="font-display text-2xl tracking-widest text-white">%{pct}</span>
        <span className="size-8 animate-spin rounded-full border-4 border-white/25 border-t-[#ffe066]" />
      </div>
    </div>
  )
}
