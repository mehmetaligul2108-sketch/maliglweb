// 2D yedek harita (WebGL olmayan cihazlar için). Tam ekran harita menüsü: eğik açılış, düşen işaretler, rota çizimi ve hedefe yolculuk.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react"
import gsap from "gsap"
import { X, ArrowRight } from "lucide-react"
import { AntalyaMap, MAP_W, MAP_H } from "./AntalyaMap"
import { applyCam, baseZoom, clampCam, type Cam } from "./camera"
import { PAGES, PAGE_ORDER, type PageId } from "@/lib/site"
import { useLang } from "@/lib/i18n"
import { sfx } from "@/lib/sound"

import { OPEN_MAP_EVENT } from "./mapEvents"

type LenisLike = { stop: () => void; start: () => void }
const lenis = () => (window as unknown as { lenis?: LenisLike }).lenis

export function MapOverlay2D({ current }: { current: PageId }) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<PageId | null>(null)
  const [busy, setBusy] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const cam = useRef<Cam>({ cx: MAP_W / 2, cy: MAP_H / 2, z: 1, tilt: 0 })
  const auto = useRef(false)
  const travelRef = useRef<() => void>(() => {})

  const render = useCallback(() => {
    if (stage.current) applyCam(stage.current, tilt.current, cam.current)
  }, [])

  // Aç / kapat olayları
  useEffect(() => {
    const onOpen = (e: Event) => {
      const target = (e as CustomEvent<{ target?: PageId }>).detail?.target ?? null
      auto.current = !!target && target !== current
      setSelected(target); setBusy(false); setOpen(true)
    }
    window.addEventListener(OPEN_MAP_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_MAP_EVENT, onOpen)
  }, [current])

  const close = useCallback(() => {
    if (busy || !root.current) return
    gsap.to(root.current, { autoAlpha: 0, duration: 0.45, ease: "power2.in", onComplete: () => { setOpen(false); lenis()?.start() } })
  }, [busy])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    const onResize = () => { cam.current.z = Math.max(cam.current.z, baseZoom()); clampCam(cam.current); render() }
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize) }
  }, [open, close, render])

  // Açılış animasyonu: eğik harita düzleşir, kıyı çizilir, işaretler düşer.
  useLayoutEffect(() => {
    if (!open || !root.current) return
    lenis()?.stop()
    const z0 = baseZoom()
    const p = PAGES[current]
    cam.current = clampCam({ cx: window.innerWidth < 768 ? p.x : MAP_W / 2, cy: MAP_H / 2, z: z0 * 0.92, tilt: 58 })
    render()
    const q = gsap.utils.selector(root.current)
    const coast = root.current.querySelector<SVGPathElement>(".map-coast") ?? undefined
    const len = coast?.getTotalLength?.() ?? 2000
    const tl = gsap.timeline()
    tl.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 })
      .to(cam.current, { tilt: 0, z: z0, duration: 1.8, ease: "power3.out", onUpdate: () => { clampCam(cam.current); render() } }, 0)
      .fromTo(coast ?? {}, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0.2)
      .fromTo(q(".map-roads path"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.12 }, 0.6)
      .fromTo(q(".map-pin-inner"), { y: -220, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "bounce.out", stagger: 0.09 }, 0.7)
      .fromTo(q(".map-ui"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.9)
      .add(() => { if (auto.current) { auto.current = false; travelRef.current() } }, "+=0.5")
    gsap.to(q(".map-here"), { opacity: 0.3, duration: 0.8, repeat: -1, yoyo: true })
    return () => { tl.kill(); gsap.killTweensOf(q(".map-here")) }
  }, [open, current, render])

  // Hedef seçilince: rota fitil gibi çizilir, işaret zıplar, mobilde kamera rotaya kayar.
  useEffect(() => {
    if (!open || !selected || !root.current) return
    sfx("blip")
    const q = gsap.utils.selector(root.current)
    const route = root.current.querySelector<SVGPathElement>(".map-route") ?? undefined
    if (route) {
      const len = route.getTotalLength()
      gsap.fromTo(route, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut",
          onComplete: () => { gsap.set(route, { strokeDasharray: "14 10" }); gsap.to(route, { strokeDashoffset: -48, duration: 1, repeat: -1, ease: "none" }) } })
    }
    const pin = q(`.map-pin[data-id="${selected}"] .map-pin-inner`)
    gsap.fromTo(pin, { y: 0 }, { y: -18, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" })
    gsap.fromTo(q(".map-card-anim"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" })
    if (window.innerWidth < 768) {
      const a = PAGES[current], b = PAGES[selected]
      gsap.to(cam.current, { cx: (a.x + b.x) / 2, duration: 0.8, ease: "power2.inOut", onUpdate: () => { clampCam(cam.current); render() } })
    }
  }, [selected, open, current, render])

  // Yolculuk: kamera rota boyunca süzülür, hedefe dalar, sayfa açılır.
  const travel = useCallback(() => {
    if (!selected || !root.current) return
    if (selected === current) { close(); return }
    setBusy(true)
    stage.current?.querySelector("svg")?.pauseAnimations()
    const q = gsap.utils.selector(root.current)
    const b = PAGES[selected]
    const z0 = baseZoom()
    const tl = gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem("mag-arrive", selected) } catch { /* yok say */ }
        window.location.href = PAGES[selected].file
      },
    })
    const c = cam.current
    // Doğrudan hedefe: arayüz çekilir, kenarlarda sis belirir, kamera bastığın yere süzülüp yakınlaşır.
    tl.to(q(".map-ui"), { opacity: 0, y: 16, duration: 0.35, stagger: 0.02, ease: "power2.out" }, 0)
      .to(q(".map-fog"), { opacity: 1, duration: 0.8, ease: "sine.inOut" }, 0)
      .add(() => sfx("whoosh"), 0.1)
      .to(c, { cx: b.x, cy: b.y, z: z0 * 2.5, tilt: 0, duration: 1.3, ease: "power2.inOut", onUpdate: render }, 0.1)
      .fromTo(q(".loc-title"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.8)
      .to(c, { z: z0 * 5, duration: 0.55, ease: "power2.in", onUpdate: render }, 1.4)
      .to(q(".map-fog-full"), { opacity: 1, duration: 0.5, ease: "power1.in" }, 1.45)
  }, [selected, current, close, render])
  travelRef.current = travel

  // Haritayı parmakla / fareyle sürükleyerek kaydır (özellikle mobilde)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const onDown = (e: RPointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, moved: false } }
  // İmleç etkileşimleri: denizde dalga halkaları, bulutlarda dağılma
  const lastRipple = useRef({ x: 0, y: 0, t: 0 })
  const hoverFx = (e: RPointerEvent) => {
    if (busy || !stage.current) return
    const svg = stage.current.querySelector("svg")
    if (!svg) return
    // 1) Bulutlar: imleç bulutun üzerindeyse parçaları dağılır, sonra yeniden toplanır
    svg.querySelectorAll<SVGGElement>(".map-cloud").forEach((cl) => {
      if (cl.dataset.scattered) return
      const r = cl.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
      cl.dataset.scattered = "1"
      const blobs = cl.querySelectorAll(".cloud-blob"), shadows = cl.querySelectorAll(".cloud-shadow")
      const cx = (r.left + r.right) / 2
      gsap.to(blobs, { x: (i) => (i % 2 ? 1 : -1) * gsap.utils.random(40, 110) + (e.clientX < cx ? 30 : -30), y: () => gsap.utils.random(-60, 60), scale: () => gsap.utils.random(0.3, 0.7), opacity: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "power3.out", stagger: 0.03 })
      gsap.to(shadows, { opacity: 0, duration: 0.6 })
      gsap.to([...blobs, ...shadows], { x: 0, y: 0, scale: 1, opacity: 1, duration: 2.2, ease: "power2.inOut", delay: 2.6, stagger: 0.05, onComplete: () => { delete cl.dataset.scattered } })
    })
    // 2) Deniz: imlecin geçtiği yerde halkalar açılır (kara, halkaları üstten örter)
    const c = cam.current
    const mx = c.cx + (e.clientX - window.innerWidth / 2) / c.z
    const my = c.cy + (e.clientY - window.innerHeight / 2) / c.z
    const land = svg.querySelector<SVGPathElement>(".map-land")
    const L = lastRipple.current, now = performance.now()
    if (!land) return
    const onSea = !land.isPointInFill(new DOMPoint(mx, my)) && my <= MAP_H
    const glow = svg.querySelector(".map-seaglow")
    if (glow) gsap.to(glow, { attr: { cx: mx, cy: my }, opacity: onSea ? 1 : 0, duration: 0.35, ease: "power2.out" })
    if (!onSea || Math.hypot(mx - L.x, my - L.y) < 70 || now - L.t < 320) return
    L.x = mx; L.y = my; L.t = now
    const g = svg.querySelector(".map-ripples")
    if (!g) return
    for (let k = 0; k < 2; k++) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      el.setAttribute("cx", String(mx)); el.setAttribute("cy", String(my))
      el.setAttribute("rx", "4"); el.setAttribute("ry", "1.5")
      el.setAttribute("fill", "none"); el.setAttribute("stroke", k ? "#3ff2ff" : "#bfe9ff"); el.setAttribute("stroke-width", k ? "2" : "3.5")
      g.appendChild(el)
      gsap.fromTo(el, { attr: { rx: 4, ry: 1.5 }, opacity: 0.8 }, { attr: { rx: k ? 140 : 95, ry: k ? 43 : 30 }, opacity: 0, duration: k ? 3.4 : 2.6, delay: k * 0.35, ease: "sine.out", onComplete: () => el.remove() })
    }
  }

  const onMove = (e: RPointerEvent) => {
    hoverFx(e)
    const d = drag.current; if (!d || busy) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 6) return
    d.moved = true; d.x = e.clientX; d.y = e.clientY
    cam.current.cx -= dx / cam.current.z; cam.current.cy -= dy / cam.current.z
    clampCam(cam.current); render()
  }
  const onUp = () => { drag.current = null }

  if (!open) return null
  const sel = selected ? PAGES[selected] : null
  const cur = PAGES[current]

  return (
    <div ref={root} className="fixed inset-0 z-[90] overflow-hidden text-white" style={{ visibility: "hidden" }}
      role="dialog" aria-modal="true" aria-label={t({ tr: "Harita", en: "Map" })}>
      {/* Sabit zemin: kamera yükselince haritanın çevresi kara ve deniz olarak devam eder */}
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(122,75,176,.14) 0 1px, transparent 1px 70px), repeating-linear-gradient(90deg, rgba(122,75,176,.14) 0 1px, transparent 1px 70px), linear-gradient(180deg, #2b1546 0%, #3a1850 58%, #16235c 64%, #0a0f33 100%)" }} />
      <div className="absolute inset-0 touch-none" style={{ perspective: "1400px" }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
        <div ref={tilt} className="absolute inset-0" style={{ transformOrigin: "50% 60%", transformStyle: "preserve-3d" }}>
          <div ref={stage} className="absolute left-0 top-0 will-change-transform" style={{ width: MAP_W, height: MAP_H, transformOrigin: "0 0" }}>
            <AntalyaMap lang={lang} current={current} selected={selected} onSelect={busy ? undefined : setSelected} animated />
          </div>
        </div>
      </div>
      {/* Sis: kenarlarda yumuşak, hafifçe hareket eden bulutlar */}
      <div className="map-fog pointer-events-none absolute inset-0 opacity-0"
        style={{ background: "radial-gradient(ellipse 80% 78% at 50% 50%, transparent 66%, rgba(214,186,255,.18) 78%, rgba(235,215,255,.5) 100%)" }} />
      {selected && (
        <div className="loc-title pointer-events-none absolute inset-x-0 bottom-[14vh] text-center opacity-0">
          <div className="font-display text-[13vw] leading-none tracking-wide text-white [text-shadow:0_6px_30px_rgba(0,0,0,.6)] md:text-8xl">
            {t(PAGES[selected].place).toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")}
          </div>
          <div className="mx-auto mt-2 flex w-max items-center gap-3 font-display text-lg tracking-[.35em] md:text-2xl" style={{ color: PAGES[selected].color }}>
            <span className="h-[3px] w-10" style={{ background: PAGES[selected].color }} />
            {t(PAGES[selected].name).toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")}
            <span className="h-[3px] w-10" style={{ background: PAGES[selected].color }} />
          </div>
        </div>
      )}
      <div className="map-fog-full pointer-events-none absolute inset-0 bg-[#0b0618] opacity-0" />
      <div className="map-ui pointer-events-none absolute left-5 top-5 md:left-12 md:top-10">
        <h2 className="font-display text-5xl leading-none tracking-[.12em] md:text-7xl" style={{ textShadow: "0 0 24px #ff4fd8" }}>
          {t({ tr: "HARİTA", en: "MAP" })}
        </h2>
        <p className="mt-2 text-sm text-[#e7cdf5] md:text-base">{t({ tr: "Antalya · Gitmek istediğin yeri seç", en: "Antalya · Pick where you want to go" })}</p>
      </div>

      <button type="button" onClick={close} aria-label={t({ tr: "Haritayı kapat", en: "Close map" })}
        className="map-ui absolute right-5 top-5 grid size-12 place-items-center rounded-full border border-[#ff4fd8] bg-[#0b0618]/70 transition hover:scale-110 md:right-10 md:top-10">
        <X className="size-6" />
      </button>

      <div className="map-ui absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-2xl border bg-[#0e071e]/90 p-5 shadow-[0_0_40px_rgba(255,79,216,.25)] backdrop-blur md:inset-x-auto md:bottom-auto md:right-10 md:top-28 md:w-[340px]"
        style={{ borderColor: sel?.color ?? "#4b2670" }}>
        <span className="text-xs tracking-[.25em] text-[#c9a6e0]">{t({ tr: "HEDEF", en: "DESTINATION" })}</span>
        {sel ? (
          <>
            <div className="map-card-anim flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full font-display text-lg text-[#120822]" style={{ background: sel.color }}>{sel.key[lang]}</span>
              <div>
                <div className="font-display text-3xl leading-tight tracking-wide">{t(sel.name).toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")}</div>
                <div className="text-sm text-[#e7cdf5]">{t(sel.place)}</div>
              </div>
            </div>
            <p className="map-card-anim text-[15px] leading-relaxed text-[#f3e6fb]">{t(sel.desc)}</p>
            <p className="map-card-anim text-xs text-[#c9a6e0]">{t({ tr: "Rota", en: "Route" })}: {t(cur.place)} → {t(sel.place)}</p>
            <button type="button" onClick={travel} disabled={busy}
              className="map-card-anim flex h-13 items-center justify-center gap-2 rounded-xl bg-[#ffe066] font-display text-xl tracking-[.2em] text-[#1a0d2e] transition hover:scale-[1.03] hover:shadow-[0_0_30px_#ffe066]">
              {selected === current ? t({ tr: "BURADASIN", en: "YOU ARE HERE" }) : t({ tr: "GİT", en: "GO" })} <ArrowRight className="size-5" />
            </button>
          </>
        ) : (
          <p className="text-[15px] text-[#f3e6fb]">{t({ tr: "Haritada bir işarete dokun ya da listeden bir sayfa seç.", en: "Tap a marker on the map or pick a page from the list." })}</p>
        )}
        <div className="flex flex-wrap gap-2 md:hidden">
          {PAGE_ORDER.map((id) => (
            <button key={id} type="button" onClick={() => setSelected(id)} className="rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: PAGES[id].color }}>
              {t(PAGES[id].name)}
            </button>
          ))}
        </div>
      </div>

      <div className="map-ui absolute bottom-10 left-12 hidden flex-col gap-1 rounded-2xl border border-[#4b2670] bg-[#0e071e]/85 px-5 py-4 md:flex">
        <span className="mb-1 text-xs tracking-[.25em] text-[#c9a6e0]">{t({ tr: "SAYFALAR", en: "PAGES" })}</span>
        {PAGE_ORDER.map((id) => (
          <button key={id} type="button" onClick={() => setSelected(id)} className="flex items-center gap-3 py-1 text-left text-[15px] transition hover:translate-x-1">
            <span className="grid size-6 place-items-center rounded-full font-display text-xs text-[#120822]" style={{ background: PAGES[id].color }}>{PAGES[id].key[lang]}</span>
            {t(PAGES[id].name)} <span className="text-[#b98ad8]">· {t(PAGES[id].place)}</span>
          </button>
        ))}
      </div>

      <div className="map-ui absolute bottom-10 right-10 hidden gap-6 text-sm text-[#e7cdf5] lg:flex">
        <span><kbd className="mr-2 rounded border border-[#c9a6e0] px-2 py-0.5">{t({ tr: "Tık", en: "Click" })}</kbd>{t({ tr: "Hedef seç", en: "Pick a destination" })}</span>
        <span><kbd className="mr-2 rounded border border-[#c9a6e0] px-2 py-0.5">{t({ tr: "GİT", en: "GO" })}</kbd>{t({ tr: "Yolculuğu başlat", en: "Start the trip" })}</span>
        <span><kbd className="mr-2 rounded border border-[#c9a6e0] px-2 py-0.5">Esc</kbd>{t({ tr: "Kapat", en: "Close" })}</span>
      </div>
    </div>
  )
}
