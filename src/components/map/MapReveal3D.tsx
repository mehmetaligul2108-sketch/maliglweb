// Anasayfa kaydırmalı harita bölümü (3D): kaydırdıkça eğik harita düzleşir, kıyı çizilir,
// işaretler düşer, sonra kamera Anasayfa noktasına dalar. İlerlemeyi dışarıdaki ScrollTrigger verir.
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { PAGES } from "@/lib/site"
import { useLang } from "@/lib/i18n"
import type { Map3D } from "./Map3D"

export interface RevealProgress { p: number }

export function MapReveal3D({ progress }: { progress: RevealProgress }) {
  const { lang } = useLang()
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<Map3D | null>(null)
  const inner = useRef<gsap.core.Timeline | null>(null)
  const langRef = useRef(lang)
  langRef.current = lang

  useEffect(() => {
    const el = host.current
    if (!el) return
    let alive = true, creating = false
    const create = async () => {
      if (map.current || creating) return
      creating = true
      await Promise.race([document.fonts.load("40px Anton"), new Promise((r) => setTimeout(r, 800))])
      const { Map3D } = await import("./Map3D")
      if (!alive) return
      const m = new Map3D(el, { lang: langRef.current, current: "home", passive: true })
      const home = PAGES.home
      if (el.clientWidth < el.clientHeight) { m.cam.tx = home.x; m.cam.ty = 430 }
      m.cam.tilt = 62; m.cam.zoom = 0.9; m.clampCam()
      const tl = gsap.timeline({ paused: true })
      m.intro(tl)
      // Sonda Anasayfa noktasına dalış
      tl.to(m.cam, { tx: home.x, ty: home.y, zoom: 2.4, tilt: 28, duration: 0.9, ease: "power2.in" }, ">+0.4")
        .to(m.cam, { zoom: 6, tilt: 8, duration: 0.6, ease: "power2.in" })
      tl.progress(progress.p)
      map.current = m; inner.current = tl
    }
    // Bölüme yaklaşınca kur, ekrandan çıkınca çizimi durdur
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) create() }, { rootMargin: "150% 0px" })
    const vis = new IntersectionObserver(([e]) => map.current?.setActive(e.isIntersecting))
    near.observe(el); vis.observe(el)
    // Kaydırma ilerlemesini her karede iç zaman çizelgesine aktar
    let last = -1
    const tick = () => {
      const tl = inner.current
      if (tl && progress.p !== last) { last = progress.p; tl.progress(progress.p) }
    }
    gsap.ticker.add(tick)
    return () => {
      alive = false
      near.disconnect(); vis.disconnect(); gsap.ticker.remove(tick)
      inner.current?.kill(); inner.current = null
      map.current?.dispose(); map.current = null
    }
  }, [progress])

  useEffect(() => { map.current?.setLang(lang) }, [lang])

  return <div ref={host} className="absolute inset-0" aria-hidden="true" />
}
