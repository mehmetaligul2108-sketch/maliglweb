// Lenis yumuşak kaydırma + GSAP ScrollTrigger senkronizasyonu.
// Kullanım: App içinde bir kez useSmoothScroll() çağır.
import { useEffect } from "react"
import { LITE } from "@/lib/perf"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

export function useSmoothScroll() {
  useEffect(() => {
    // Mobilde telefonun kendi (doğal) kaydırması en akıcısı: Lenis kapalı
    if (LITE) return
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    ;(window as unknown as { lenis: Lenis }).lenis = lenis
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}
