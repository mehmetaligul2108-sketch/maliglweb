// PROJELER: turuncu açılış, eğik panel kolajı, tıklayınca tam ekran detay + önce/sonra kaydırıcısı.
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { X, ExternalLink } from "lucide-react"
import { BeforeAfter } from "@/components/ui-mag/BeforeAfter"
import { Footer, SectionTag, TravelButton } from "@/components/ui-mag/bits"
import { SunsetScene } from "@/components/scene/SunsetScene"
import { useLang } from "@/lib/i18n"
import { PROJECTS, type Project } from "@/lib/projects"
import { sfx } from "@/lib/sound"
import { Marquee } from "@/components/ui-mag/Marquee"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CLIPS = [
  "polygon(5% 0, 100% 3%, 95% 100%, 0 97%)",
  "polygon(0 5%, 97% 0, 100% 94%, 3% 100%)",
  "polygon(3% 2%, 100% 0, 96% 100%, 0 96%)",
]

type LenisLike = { stop: () => void; start: () => void }
const lenis = () => (window as unknown as { lenis?: LenisLike }).lenis

export function Projects() {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Project | null>(null)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q(".ph-word"), { yPercent: 110, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: 0.08, delay: 0.2 })
    gsap.fromTo(q(".ph-sub"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.8 })
    gsap.to(q("#proj-hero .scene-sun"), { yPercent: 25, ease: "none", scrollTrigger: { trigger: q("#proj-hero")[0], start: "top top", end: "bottom top", scrub: true } })
    q(".pcard").forEach((el, i) => {
      gsap.fromTo(el, { x: (i % 2 ? 1 : -1) * 300, y: 160, rotate: (i % 2 ? 14 : -14), opacity: 0, scale: 0.85 },
        { x: 0, y: 0, rotate: [-2, 2, -1, 1.5, -1.5, 2][i], opacity: 1, scale: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 98%", end: "top 55%", scrub: 1 } })
    })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  // Hash ile doğrudan proje açma (örn. projeler.html#image-stack)
  useEffect(() => {
    const slug = window.location.hash.slice(1)
    const p = PROJECTS.find((x) => x.slug === slug)
    if (p) setTimeout(() => setOpen(p), 1200)
  }, [])

  return (
    <div ref={root}>
      <section id="proj-hero" className="relative grid min-h-[85vh] place-items-center overflow-hidden px-6 pb-24 pt-28">
        <SunsetScene drift style={{ filter: "hue-rotate(-25deg) saturate(1.2)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#2a0f5c]" />
        <div className="relative text-center">
          <SectionTag color="#ff8a3d">{t({ tr: "GRAFİK ANİMASYON I", en: "GRAPHIC ANIMATION I" })}</SectionTag>
          <h1 aria-label={t({ tr: "PROJELER", en: "PROJECTS" })} className="mt-4 flex justify-center overflow-hidden pt-[.1em] font-display text-[22vw] leading-[.9] text-white [text-shadow:8px_8px_0_#ff8a3d] md:text-[12rem]">
            {(t({ tr: "PROJELER", en: "PROJECTS" })).split("").map((c, i) => <span key={i} aria-hidden="true" className="ph-word inline-block">{c}</span>)}
          </h1>
          <p className="ph-sub mx-auto mt-4 max-w-xl text-lg text-white md:text-xl [text-shadow:0_2px_12px_#2a0f5c]">
            {t({ tr: "Adobe Photoshop ile hazırladığım altı çalışma. Bir panele tıkla, önce/sonra kaydırıcısıyla ne yaptığımı gör.", en: "Six pieces made with Adobe Photoshop. Click a panel and use the before/after slider to see what I did." })}
          </p>
        </div>
      </section>

      <Marquee items={["HISTORY BRUSH", "ÜRÜN TANITIMI", "KARAKALEM", "SMART OBJECT", "IMAGE STACK", "WEB ARAYÜZÜ"]} color="#ff8a3d" />
      <section className="relative bg-[#2a0f5c] px-5 pb-28 pt-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {PROJECTS.map((p, i) => (
            <button key={p.slug} id={p.slug} type="button" onClick={() => { sfx("tap"); setOpen(p) }}
              className={`pcard group relative block text-left ${i % 3 === 1 ? "lg:translate-y-16" : ""}`} aria-label={`${t(p.title)} – ${t({ tr: "detayı aç", en: "open details" })}`}>
              <div data-tilt className="relative aspect-[4/3]">
                <div className="absolute inset-0 translate-x-3 translate-y-3 transition group-hover:translate-x-4 group-hover:translate-y-4" style={{ background: p.color, clipPath: CLIPS[i % 3] }} />
                <div className="absolute inset-0 overflow-hidden bg-black" style={{ clipPath: CLIPS[i % 3] }}>
                  <img src={p.cover} alt={t(p.title)} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                </div>
                <span className="absolute -left-2 -top-3 -rotate-6 px-3 py-1 font-display text-2xl text-[#1a0d2e]" style={{ background: p.color }}>#{p.no}</span>
              </div>
              <div className="mt-4 pl-1">
                <h2 className="font-display text-3xl leading-tight text-white">{t(p.title)}</h2>
                <p className="text-sm tracking-wide" style={{ color: p.color }}>{t(p.technique)}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mx-auto mt-28 flex max-w-6xl flex-wrap items-center justify-between gap-6 rounded-2xl border-2 border-[#3ff2ff]/60 bg-[#140828]/70 p-8">
          <div>
            <h2 className="font-display text-4xl text-white">{t({ tr: "NASIL YAPTIM?", en: "HOW DID I DO IT?" })}</h2>
            <p className="mt-1 max-w-lg text-white/80">{t({ tr: "Smart Object, React ve kaydırma animasyonları üzerine yazdığım blog yazılarını oku.", en: "Read my blog posts on Smart Objects, React and scroll animations." })}</p>
          </div>
          <TravelButton to="blog">{t({ tr: "BLOGA GİT", en: "GO TO BLOG" })}</TravelButton>
        </div>
      </section>
      <Footer />
      {open && <ProjectModal p={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  const { t } = useLang()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    lenis()?.stop()
    const el = root.current!
    gsap.fromTo(el, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(150% at 50% 50%)", duration: 0.7, ease: "power3.inOut" })
    gsap.fromTo(el.querySelectorAll(".pm-in"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.35, ease: "power3.out" })
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); lenis()?.start() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p])

  const close = () => {
    gsap.to(root.current, { clipPath: "circle(0% at 50% 50%)", duration: 0.5, ease: "power3.in", onComplete: onClose })
  }

  return (
    <div ref={root} className="fixed inset-0 z-[85] overflow-y-auto bg-[#0e0620]/97 px-5 py-20 md:px-12" role="dialog" aria-modal="true" aria-label={t(p.title)} data-lenis-prevent>
      <button type="button" onClick={close} aria-label={t({ tr: "Kapat", en: "Close" })}
        className="fixed right-5 top-5 z-10 grid size-12 place-items-center rounded-full border-2 bg-[#0b0618] text-white transition hover:rotate-90" style={{ borderColor: p.color }}>
        <X className="size-6" />
      </button>
      <div className="mx-auto max-w-5xl">
        <span className="pm-in inline-block -skew-x-12 px-3 py-1 font-display tracking-[.25em] text-[#1a0d2e]" style={{ background: p.color }}>
          <span className="inline-block skew-x-12">{t({ tr: "PROJE", en: "PROJECT" })} #{p.no}</span>
        </span>
        <h2 className="pm-in mt-3 font-display text-5xl text-white md:text-7xl">{t(p.title)}</h2>
        <p className="pm-in mt-1 tracking-wide" style={{ color: p.color }}>{t(p.technique)}</p>
        <p className="pm-in mt-5 max-w-3xl text-lg leading-relaxed text-white/90">{t(p.desc)}</p>
        <div className="mt-8 grid gap-8">
          {p.compares.map((c, i) => (
            <figure key={i} className="pm-in">
              {c.label && <figcaption className="mb-2 font-display tracking-[.15em] text-white/80">{t(c.label)}</figcaption>}
              <BeforeAfter before={c.before} after={c.after} alt={t(p.title)} color={p.color} />
            </figure>
          ))}
        </div>
        {p.extra && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {p.extra.map((x) => (
              <figure key={x.src} className="pm-in overflow-hidden rounded-xl border border-white/15 bg-black">
                <img src={x.src} alt={t(x.label)} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="px-3 py-2 text-sm text-white/80">{t(x.label)}</figcaption>
              </figure>
            ))}
          </div>
        )}
        {p.slug === "web-arayuzu" && (
          <a href="https://teenage.engineering" target="_blank" rel="noopener noreferrer" className="pm-in mt-6 inline-flex items-center gap-2 text-[#b07bff] underline underline-offset-4">
            {t({ tr: "İlham alınan site: teenage.engineering", en: "Inspiration: teenage.engineering" })} <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </div>
  )
}
