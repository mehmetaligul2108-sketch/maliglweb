// Tam ekran harita menüsü (3D). Arayüz 2D sürümle aynı; harita Three.js ile çizilir.
// WebGL yoksa 2D harita (MapOverlay2D) açılır.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { X, ArrowRight } from "lucide-react"
import { PAGES, PAGE_ORDER, type PageId } from "@/lib/site"
import { useLang } from "@/lib/i18n"
import { sfx } from "@/lib/sound"
import { OPEN_MAP_EVENT } from "./mapEvents"
import { MapOverlay2D } from "./MapOverlay2D"
import type { Map3D } from "./Map3D"

export { OPEN_MAP_EVENT, openMap } from "./mapEvents"

type LenisLike = { stop: () => void; start: () => void }
const lenis = () => (window as unknown as { lenis?: LenisLike }).lenis

let webgl: boolean | null = null
function hasWebGL() {
  if (webgl === null) {
    try { const c = document.createElement("canvas"); webgl = !!(c.getContext("webgl2") || c.getContext("webgl")) } catch { webgl = false }
  }
  return webgl
}

export function MapOverlay({ current }: { current: PageId }) {
  const [use3d] = useState(hasWebGL)
  const [failed, setFailed] = useState(false)
  if (!use3d || failed) return <MapOverlay2D current={current} />
  return <MapOverlay3D current={current} onFail={() => setFailed(true)} />
}

function MapOverlay3D({ current, onFail }: { current: PageId; onFail: () => void }) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<PageId | null>(null)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<Map3D | null>(null)
  const auto = useRef(false)
  const travelRef = useRef<() => void>(() => {})
  const pendingOpen = useRef<PageId | null | undefined>(undefined)

  // Aç olayı
  useEffect(() => {
    const onOpen = (e: Event) => {
      const target = (e as CustomEvent<{ target?: PageId }>).detail?.target ?? null
      auto.current = !!target && target !== current
      pendingOpen.current = target
      setSelected(null); setBusy(false); setReady(false); setOpen(true)
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
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  // 3D haritayı kur (Three.js yalnızca harita açılınca yüklenir) ve açılış animasyonunu oynat
  useLayoutEffect(() => {
    if (!open || !root.current || !host.current) return
    lenis()?.stop()
    let alive = true
    const tl = gsap.timeline({ paused: true })
    gsap.set(root.current, { autoAlpha: 1 })
    const q = gsap.utils.selector(root.current)
    gsap.set(q(".map-ui"), { opacity: 0 })
    ;(async () => {
      try {
        await Promise.race([document.fonts.load("40px Anton"), new Promise((r) => setTimeout(r, 800))])
        const { Map3D } = await import("./Map3D")
        if (!alive || !host.current) return
        const m = new Map3D(host.current, { lang, current, onSelect: (id) => setSelected(id) })
        map.current = m
        const p = PAGES[current]
        if (window.innerWidth < window.innerHeight) { m.cam.tx = p.x; m.cam.ty = 430 }
        m.cam.tilt = 62; m.cam.zoom = 0.9; m.clampCam()
        m.intro(tl)
        tl.fromTo(q(".map-cover"), { opacity: 1 }, { opacity: 0, duration: 0.5 }, 0)
          .fromTo(q(".map-ui"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.9)
          .add(() => {
            const target = pendingOpen.current
            pendingOpen.current = undefined
            if (target) setSelected(target)
          }, 1.2)
          .add(() => { if (auto.current) { auto.current = false; travelRef.current() } }, "+=0.9")
        setReady(true)
        tl.play()
      } catch (err) {
        console.warn("3D harita açılamadı, 2D haritaya geçiliyor", err)
        if (alive) { setOpen(false); onFail(); window.setTimeout(() => window.dispatchEvent(new CustomEvent(OPEN_MAP_EVENT, { detail: { target: pendingOpen.current ?? undefined } })), 50) }
      }
    })()
    return () => {
      alive = false
      tl.kill()
      map.current?.dispose(); map.current = null
    }
    // dil değişimi ayrı ele alınır; harita yalnızca açılınca kurulur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current])

  useEffect(() => { map.current?.setLang(lang) }, [lang])

  // Hedef seçilince: rota çizilir, kart canlanır, dikey ekranda kamera rotaya kayar
  useEffect(() => {
    if (!open || !ready || !root.current) return
    map.current?.select(selected)
    if (!selected) return
    sfx("blip")
    const q = gsap.utils.selector(root.current)
    gsap.fromTo(q(".map-card-anim"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" })
    if (window.innerWidth < window.innerHeight && map.current) {
      const a = PAGES[current], b = PAGES[selected]
      // İki nokta birden sığmıyorsa hedef ekranda kalsın
      const hw = map.current.visibleHalfW(), mid = (a.x + b.x) / 2
      map.current.focusX(Math.abs(b.x - mid) > hw * 0.75 ? b.x - Math.sign(b.x - mid) * hw * 0.55 : mid)
    }
  }, [selected, open, ready, current])

  // Yolculuk: kamera hedefe süzülür, yakınlaşır, sayfa açılır
  const travel = useCallback(() => {
    if (!selected || !root.current || !map.current) return
    if (selected === current) { close(); return }
    setBusy(true)
    const q = gsap.utils.selector(root.current)
    const tl = gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem("mag-arrive", selected) } catch { /* yok say */ }
        window.location.href = PAGES[selected].file
      },
    })
    tl.to(q(".map-ui"), { opacity: 0, y: 16, duration: 0.35, stagger: 0.02, ease: "power2.out" }, 0)
      .to(q(".map-fog"), { opacity: 1, duration: 0.8, ease: "sine.inOut" }, 0)
      .add(() => sfx("whoosh"), 0.1)
    map.current.flyTo(selected, tl, 0.1)
    tl.fromTo(q(".loc-title"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.8)
      .to(q(".map-fog-full"), { opacity: 1, duration: 0.5, ease: "power1.in" }, 1.45)
  }, [selected, current, close])
  travelRef.current = travel

  if (!open) return null
  const sel = selected ? PAGES[selected] : null
  const cur = PAGES[current]
  const up = (s: string) => s.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")

  return (
    <div ref={root} className="fixed inset-0 z-[90] overflow-hidden bg-[#0b0618] text-white" style={{ visibility: "hidden" }}
      role="dialog" aria-modal="true" aria-label={t({ tr: "Harita", en: "Map" })}>
      <div ref={host} className="absolute inset-0" style={{ cursor: "grab" }} />
      <div className="map-cover pointer-events-none absolute inset-0 grid place-items-center bg-[#0b0618]">
        {!ready && <span className="animate-pulse font-display text-lg tracking-[.35em] text-[#c9a6e0]">{t({ tr: "HARİTA YÜKLENİYOR", en: "LOADING MAP" })}</span>}
      </div>
      {/* Sis: kenarlarda yumuşak */}
      <div className="map-fog pointer-events-none absolute inset-0 opacity-0"
        style={{ background: "radial-gradient(ellipse 80% 78% at 50% 50%, transparent 66%, rgba(214,186,255,.18) 78%, rgba(235,215,255,.5) 100%)" }} />
      {selected && (
        <div className="loc-title pointer-events-none absolute inset-x-0 bottom-[14vh] text-center opacity-0">
          <div className="font-display text-[13vw] leading-none tracking-wide text-white [text-shadow:0_6px_30px_rgba(0,0,0,.6)] md:text-8xl">{up(t(PAGES[selected].place))}</div>
          <div className="mx-auto mt-2 flex w-max items-center gap-3 font-display text-lg tracking-[.35em] md:text-2xl" style={{ color: PAGES[selected].color }}>
            <span className="h-[3px] w-10" style={{ background: PAGES[selected].color }} />{up(t(PAGES[selected].name))}<span className="h-[3px] w-10" style={{ background: PAGES[selected].color }} />
          </div>
        </div>
      )}
      <div className="map-fog-full pointer-events-none absolute inset-0 bg-[#0b0618] opacity-0" />
      <div className="map-ui pointer-events-none absolute left-4 top-4 md:left-12 md:top-10">
        <h2 className="font-display text-4xl leading-none tracking-[.12em] md:text-7xl" style={{ textShadow: "0 0 24px #ff4fd8" }}>{t({ tr: "HARİTA", en: "MAP" })}</h2>
        <p className="mt-1.5 text-xs text-[#e7cdf5] md:mt-2 md:text-base">{t({ tr: "Antalya · Gitmek istediğin yeri seç", en: "Antalya · Pick where you want to go" })}</p>
      </div>

      <button type="button" onClick={close} aria-label={t({ tr: "Haritayı kapat", en: "Close map" })}
        className="map-ui absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-[#ff4fd8] bg-[#0b0618]/70 transition hover:scale-110 md:right-10 md:top-10 md:size-12">
        <X className="size-6" />
      </button>

      <div className="map-ui absolute inset-x-3 bottom-3 flex max-h-[46vh] flex-col gap-2.5 overflow-y-auto rounded-2xl border bg-[#0e071e]/92 p-4 shadow-[0_0_40px_rgba(255,79,216,.25)] md:inset-x-auto md:bottom-auto md:right-10 md:top-28 md:max-h-none md:w-[340px] md:gap-3 md:p-5"
        style={{ borderColor: sel?.color ?? "#4b2670" }}>
        <span className="text-xs tracking-[.25em] text-[#c9a6e0]">{t({ tr: "HEDEF", en: "DESTINATION" })}</span>
        {sel ? (
          <>
            <div className="map-card-anim flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full font-display text-lg text-[#120822]" style={{ background: sel.color }}>{sel.key[lang]}</span>
              <div>
                <div className="font-display text-2xl leading-tight tracking-wide md:text-3xl">{up(t(sel.name))}</div>
                <div className="text-sm text-[#e7cdf5]">{t(sel.place)}</div>
              </div>
            </div>
            <p className="map-card-anim hidden text-[15px] leading-relaxed text-[#f3e6fb] sm:block">{t(sel.desc)}</p>
            <p className="map-card-anim text-xs text-[#c9a6e0]">{t({ tr: "Rota", en: "Route" })}: {t(cur.place)} → {t(sel.place)}</p>
            <button type="button" onClick={travel} disabled={busy}
              className="map-card-anim flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ffe066] font-display text-xl tracking-[.2em] text-[#1a0d2e] transition hover:scale-[1.03] hover:shadow-[0_0_30px_#ffe066] md:h-13">
              {selected === current ? t({ tr: "BURADASIN", en: "YOU ARE HERE" }) : t({ tr: "GİT", en: "GO" })} <ArrowRight className="size-5" />
            </button>
          </>
        ) : (
          <p className="text-sm text-[#f3e6fb] md:text-[15px]">{t({ tr: "Haritada bir işarete dokun ya da listeden bir sayfa seç.", en: "Tap a marker on the map or pick a page from the list." })}</p>
        )}
        <div className="flex flex-wrap gap-1.5 md:hidden">
          {PAGE_ORDER.map((id) => (
            <button key={id} type="button" onClick={() => setSelected(id)} className="rounded-full border px-3 py-1.5 text-sm"
              style={{ borderColor: PAGES[id].color, background: id === selected ? `${PAGES[id].color}33` : undefined }}>
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
        <span><kbd className="mr-2 rounded border border-[#c9a6e0] px-2 py-0.5">{t({ tr: "Sürükle", en: "Drag" })}</kbd>{t({ tr: "Haritayı kaydır", en: "Pan the map" })}</span>
        <span><kbd className="mr-2 rounded border border-[#c9a6e0] px-2 py-0.5">Esc</kbd>{t({ tr: "Kapat", en: "Close" })}</span>
      </div>
    </div>
  )
}
