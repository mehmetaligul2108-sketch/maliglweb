// GALERİ: mor gece, kaydırdıkça dönen kavisli 3D fotoğraf şeridi (silindir), altında açıklamalı ızgara.
import { useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { X } from "lucide-react"
import { Footer, PhotoPlaceholder, SectionTag, TravelButton } from "@/components/ui-mag/bits"
import { useLang } from "@/lib/i18n"
import { GALLERY, type Photo } from "@/lib/gallery"
import { LITE } from "@/lib/perf"
import { sfx } from "@/lib/sound"
import { Particles } from "@/components/magicui/particles"
import { Marquee } from "@/components/ui-mag/Marquee"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Gallery() {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<Photo | null>(null)
  // Silindiri dolu göstermek için fotoğrafları tekrar et
  const ring = Array.from({ length: Math.max(10, GALLERY.length) }, (_, i) => GALLERY[i % GALLERY.length])
  const step = 360 / ring.length

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q(".gh-char"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power4.out", stagger: 0.06, delay: 0.2 })
    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(q(".ring"), { rotateY: 0 }, { rotateY: -360 + step, ease: "none", scrollTrigger: { trigger: q("#ring-sec")[0], start: "top top", end: "+=260%", scrub: 1, pin: true } })
      gsap.fromTo(q(".ring-wrap"), { rotateX: -14, scale: 0.8 }, { rotateX: 6, scale: 1.05, ease: "none", scrollTrigger: { trigger: q("#ring-sec")[0], start: "top top", end: "+=260%", scrub: 1 } })
    })
    q(".gcell").forEach((el, i) => gsap.fromTo(el, { y: 80, opacity: 0, rotate: i % 2 ? 4 : -4 }, { y: 0, opacity: 1, rotate: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }))
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const title = t({ tr: "GALERİ", en: "GALLERY" })

  return (
    <div ref={root}>
      <section id="ring-sec" className="relative h-screen overflow-hidden" style={{ background: "radial-gradient(90% 70% at 50% 40%, #4a1a7a 0%, #1c0838 60%, #0b0618 100%)" }}>
        <Particles className="absolute inset-0" quantity={LITE ? 18 : 90} color="#d8b4ff" ease={60} />
        <div className="absolute inset-x-0 top-24 z-10 text-center md:top-20">
          <SectionTag color="#b07bff">{t({ tr: "KARELER", en: "SNAPSHOTS" })}</SectionTag>
          <h1 aria-label={title} className="mt-3 flex justify-center overflow-hidden pt-[.1em] font-display text-[20vw] leading-none text-white [text-shadow:0_0_40px_#b07bff] md:text-[8rem]">
            {title.split("").map((c, i) => <span key={i} aria-hidden="true" className="gh-char inline-block">{c}</span>)}
          </h1>
          <p className="mx-auto mt-2 max-w-md px-6 text-white/80">{t({ tr: "Beni en iyi anlatan kareler. Kaydırdıkça dönüyor, tıklayınca büyüyor.", en: "The shots that describe me best. They spin as you scroll and grow when you click." })}</p>
        </div>
        {/* Masaüstü: 3D silindir */}
        <div className="absolute inset-0 hidden items-center justify-center pt-40 md:flex" style={{ perspective: "1600px" }}>
          <div className="ring-scale" style={{ transformStyle: "preserve-3d" }}>
          <div className="ring-wrap relative" style={{ transformStyle: "preserve-3d" }}>
            <div className="ring relative h-[300px] w-[230px]" style={{ transformStyle: "preserve-3d" }}>
              {ring.map((ph, i) => (
                <button key={i} type="button" onClick={() => { sfx("tap"); setZoom(ph) }} tabIndex={i < GALLERY.length ? 0 : -1}
                  aria-label={t(ph.caption)}
                  className="absolute inset-0 overflow-hidden rounded-xl border-2 transition-[box-shadow] [-webkit-backface-visibility:hidden] hover:shadow-[0_0_40px_#fff] [&_*]:[backface-visibility:hidden]"
                  style={{ transform: `rotateY(${i * step}deg) translateZ(520px)`, borderColor: ph.color, boxShadow: `0 0 26px ${ph.color}88`, backfaceVisibility: "hidden" }}>
                  {ph.src ? <img src={ph.src} alt="" className="h-full w-full object-cover" /> : <PhotoPlaceholder color={ph.color} label={t(ph.caption)} />}
                </button>
              ))}
            </div>
          </div>
        </div>
          </div>
        {/* Mobil: kaydırılabilir kartlar */}
        <div className="absolute inset-x-0 bottom-28 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:hidden" data-lenis-prevent>
          {GALLERY.map((ph, i) => (
            <button key={i} type="button" onClick={() => setZoom(ph)} className="aspect-[3/4] w-[62vw] shrink-0 snap-center overflow-hidden rounded-xl border-2" style={{ borderColor: ph.color }} aria-label={t(ph.caption)}>
              {ph.src ? <img src={ph.src} alt="" className="h-full w-full object-cover" /> : <PhotoPlaceholder color={ph.color} label={t(ph.caption)} />}
            </button>
          ))}
        </div>
      </section>

      <Marquee items={["KARELER", "ANILAR", "ANTALYA", "GÜN BATIMI", "MAG"]} color="#b07bff" />
      <section className="relative bg-gradient-to-b from-[#0b0618] to-[#1c0838] px-6 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-4xl text-white md:text-6xl">{t({ tr: "TÜM KARELER", en: "ALL SHOTS" })}</h2>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
            {GALLERY.map((ph, i) => (
              <figure key={i} className="gcell">
                <button type="button" data-tilt onClick={() => setZoom(ph)} className="block aspect-[4/5] w-full overflow-hidden rounded-xl border-2 transition hover:scale-[1.03]" style={{ borderColor: ph.color }} aria-label={t(ph.caption)}>
                  {ph.src ? <img src={ph.src} alt={t(ph.caption)} loading="lazy" className="h-full w-full object-cover" /> : <PhotoPlaceholder color={ph.color} label={t(ph.caption)} />}
                </button>
                <figcaption className="mt-2 text-sm text-white/80">{t(ph.caption)}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap gap-4">
            <TravelButton to="contact">{t({ tr: "İLETİŞİME GEÇ", en: "GET IN TOUCH" })}</TravelButton>
            <TravelButton to="home" variant="ghost">{t({ tr: "ANASAYFA", en: "HOME" })}</TravelButton>
          </div>
        </div>
      </section>
      <Footer />

      {zoom && (
        <div className="fixed inset-0 z-[85] grid place-items-center bg-[#0b0618]/92 p-6 backdrop-blur" role="dialog" aria-modal="true" aria-label={t(zoom.caption)} onClick={() => setZoom(null)}>
          <figure className="animate-in zoom-in-75 fade-in w-full max-w-md duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border-2" style={{ borderColor: zoom.color, boxShadow: `0 0 60px ${zoom.color}88` }}>
              {zoom.src ? <img src={zoom.src} alt={t(zoom.caption)} className="h-full w-full object-cover" /> : <PhotoPlaceholder color={zoom.color} label={t(zoom.caption)} />}
            </div>
            <figcaption className="mt-3 text-center text-white">{t(zoom.caption)}</figcaption>
          </figure>
          <button type="button" onClick={() => setZoom(null)} aria-label={t({ tr: "Kapat", en: "Close" })} className="absolute right-5 top-5 grid size-12 place-items-center rounded-full border-2 border-[#b07bff] text-white"><X className="size-6" /></button>
        </div>
      )}
    </div>
  )
}
