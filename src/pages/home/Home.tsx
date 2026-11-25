// ANASAYFA: MAG karşılama → harita açılışı → isim ve hakkımda özeti → proje kolajı → galeri şeridi → neon gece.
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ChevronDown } from "lucide-react"
import { SunsetScene } from "@/components/scene/SunsetScene"
import { AntalyaMap, MAP_H, MAP_W } from "@/components/map/AntalyaMap"
import { openMap } from "@/components/map/MapOverlay"
import { MapReveal3D, type RevealProgress } from "@/components/map/MapReveal3D"
import { useState } from "react"
import { Footer, PhotoPlaceholder, SectionTag, TravelButton } from "@/components/ui-mag/bits"
import { useLang } from "@/lib/i18n"
import { PAGES } from "@/lib/site"
import { PROJECTS } from "@/lib/projects"
import { GALLERY } from "@/lib/gallery"
import { sfx } from "@/lib/sound"
import portrait from "@/assets/img/vesikalik-cutout.webp"
import { NeonPortrait } from "@/components/ui-mag/NeonPortrait"
import { Marquee } from "@/components/ui-mag/Marquee"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const SKEWS = [
  "polygon(6% 0, 100% 3%, 94% 100%, 0 96%)",
  "polygon(0 4%, 96% 0, 100% 95%, 4% 100%)",
  "polygon(3% 2%, 100% 0, 97% 100%, 0 98%)",
]

export function Home() {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const home = PAGES.home
  // WebGL varsa harita bölümü 3D, yoksa eski 2D harita
  const [use3d] = useState(() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")) } catch { return false } })
  const [reveal] = useState<RevealProgress>(() => ({ p: 0 }))

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    // 1) MAG karşılama: harfler büyüyüp kameraya gelir, içinden geçilir.
    // Yazı 4 kat büyük çizilip 0.25 ölçekle başlar: büyürken ekran kartı hazır katmanı ölçekler (yeniden çizim yok, kasma yok).
    gsap.set(q(".mag-layer"), { xPercent: -50, yPercent: -50, scale: 0.25, force3D: true })
    gsap.fromTo(q(".mag-letter"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: 0.3 })
    gsap.fromTo(q(".mag-glow"), { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.9 })
    gsap.to(q(".mag-flicker"), { opacity: 0.55, duration: 0.08, repeat: 7, yoyo: true, delay: 1.5, repeatDelay: 0.05 })
    gsap.to(q(".scroll-hint"), { y: 10, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" })
    const intro = gsap.timeline({ scrollTrigger: { trigger: q("#intro")[0], start: "top top", end: "+=160%", scrub: 1, pin: true } })
    intro.to(q(".mag-glow"), { opacity: 0, duration: 0.1, ease: "none" }, 0)
      .to(q(".scroll-hint"), { opacity: 0, duration: 0.1 }, 0)
      .to(q(".mag-layer"), { scale: 5.5, ease: "power2.in", duration: 0.92, force3D: true }, 0.08)
      .to(q(".intro-scene"), { scale: 1.35, yPercent: 6, ease: "none", duration: 1, force3D: true }, 0)
      .to(q(".intro-flash"), { opacity: 0.9, duration: 0.2 }, 0.8)

    // 2) Harita açılışı: bulutlar aralanır, eğik harita düzleşir, işaretler düşer, sonra Anasayfa noktasına dalış.
    const mapTl = gsap.timeline({ scrollTrigger: { trigger: q("#map-reveal")[0], start: "top top", end: "+=220%", scrub: 1, pin: true } })
    mapTl.fromTo(q(".reveal-flash"), { opacity: 1 }, { opacity: 0, duration: 0.12 }, 0)
      .fromTo(q(".cloud-l"), { xPercent: 0 }, { xPercent: -120, duration: 0.35 }, 0)
      .fromTo(q(".cloud-r"), { xPercent: 0 }, { xPercent: 120, duration: 0.35 }, 0)
    if (use3d) {
      // 3D harita: kaydırma ilerlemesi haritanın kendi açılış + dalış zaman çizelgesini sürer
      mapTl.fromTo(reveal, { p: 0 }, { p: 1, duration: 0.94, ease: "none" }, 0)
    } else {
      mapTl.fromTo(q(".reveal-tilt"), { rotateX: 62, scale: 0.75, yPercent: 12 }, { rotateX: 0, scale: 1, yPercent: 0, duration: 0.5, ease: "power2.out" }, 0.05)
        .fromTo(q("#map-reveal .map-coast"), { strokeDasharray: 2200, strokeDashoffset: 2200 }, { strokeDashoffset: 0, duration: 0.4 }, 0.15)
        .fromTo(q("#map-reveal .map-pin-inner"), { y: -260, opacity: 0 }, { y: 0, opacity: 1, ease: "bounce.out", duration: 0.12, stagger: 0.04 }, 0.35)
        .to(q(".reveal-stage"), { scale: 7, duration: 0.2, ease: "power2.in" }, 0.82)
    }
    mapTl.fromTo(q(".reveal-caption"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.12 }, 0.6)
      .to(q(".reveal-caption"), { opacity: 0, duration: 0.08 }, 0.82)
      .to(q(".reveal-flash"), { opacity: 1, duration: 0.08 }, 0.94)

    // 3) İsim + hakkımda özeti: kelimeler sırayla belirir.
    gsap.fromTo(q(".name-line"), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: q("#hello")[0], start: "top 70%" } })
    const fine = window.matchMedia("(pointer: fine)").matches
    gsap.fromTo(q(".about-word"), fine ? { opacity: 0.08, filter: "blur(6px)" } : { opacity: 0.08 }, { opacity: 1, ...(fine ? { filter: "blur(0px)" } : {}), stagger: 0.03, ease: "none", scrollTrigger: { trigger: q(".about-text")[0], start: "top 80%", end: "bottom 45%", scrub: true } })
    gsap.fromTo(q("#hello .hello-photo"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: q("#hello")[0], start: "top 60%" } })

    // 4) Proje kolajı: paneller farklı yönlerden kayıp dönerek yerine oturur.
    q(".proj-panel").forEach((el, i) => {
      gsap.fromTo(el, { x: (i % 2 ? 1 : -1) * 260, y: 120, rotate: (i % 2 ? 10 : -10), opacity: 0 },
        { x: 0, y: 0, rotate: [-3, 2, -2, 3, -1, 2][i], opacity: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 95%", end: "top 55%", scrub: 1 } })
    })
    gsap.fromTo(q(".proj-title"), { xPercent: -30 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: q("#home-projects")[0], start: "top bottom", end: "bottom top", scrub: true } })

    // 5) Galeri şeridi: kaydırdıkça yatay kayar.
    const strip = q(".gal-strip")[0] as HTMLElement
    gsap.to(strip, { x: () => -(strip.scrollWidth - window.innerWidth + 80), ease: "none",
      scrollTrigger: { trigger: q("#home-gallery")[0], start: "top top", end: () => `+=${strip.scrollWidth}`, scrub: 1, pin: true, invalidateOnRefresh: true } })

    // 6) Gece: gökyüzü kararır, neon tabela titreyerek yanar.
    const nightST = { trigger: q("#night")[0], start: "top bottom", end: "top top", scrub: true }
    gsap.fromTo(q("#night .scene-night"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: nightST })
    gsap.fromTo(q("#night .scene-sun"), { opacity: 1, y: 0 }, { opacity: 0, y: 160, ease: "none", scrollTrigger: nightST })
    gsap.fromTo(q("#night .scene-windows"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: nightST })
    gsap.fromTo(q(".neon-sign"), { opacity: 0.1 }, { opacity: 1, duration: 0.06, repeat: 8, yoyo: true, ease: "none", scrollTrigger: { trigger: q("#night")[0], start: "top 40%" } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const aboutText = t({
    tr: "Merhaba, ben Mehmet Ali Gül. 2026 yılında Şevkiye Özel Fen Lisesi'nden mezun oldum ve şu anda Akdeniz Üniversitesi'nde Bilgisayar Programcılığı birinci sınıf öğrencisiyim.",
    en: "Hi, I'm Mehmet Ali Gül. I graduated from Şevkiye Private Science High School in 2026 and I'm now a first-year Computer Programming student at Akdeniz University.",
  })

  return (
    <div ref={root}>
      {/* 1. KARŞILAMA */}
      <section id="intro" className="relative h-screen overflow-hidden" aria-label={t({ tr: "Karşılama", en: "Welcome" })}>
        <div className="intro-scene absolute inset-0 will-change-transform" style={{ transformOrigin: "50% 75%" }}><SunsetScene drift /></div>
        {/* Parlama katmanı: sabit durur, kaydırma başlayınca söner (büyütülmez). */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden" aria-hidden="true">
          <div className="mag-glow flex select-none font-neon text-[30vw] leading-none text-transparent will-change-[opacity] md:text-[22vw]"
            style={{ textShadow: "0 0 18px #ff4fd8, 0 0 48px #ff4fd8, 0 0 110px #b03a8c" }}>MAG</div>
        </div>
        {/* Yazı katmanı: 4 kat büyük çizilir, 0.25 ölçekle başlar, ekran kartıyla büyütülür. */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="mag-layer absolute left-1/2 top-1/2 flex w-max select-none whitespace-nowrap font-neon text-[120vw] leading-none text-white will-change-transform md:text-[88vw]" style={{ transformOrigin: "50% 50%", transform: "translate(-50%, -50%) scale(.25)" }}>
            {"MAG".split("").map((c, i) => (
              <span key={i} className="overflow-hidden"><span className={`mag-letter inline-block ${i === 1 ? "mag-flicker" : ""}`}>{c}</span></span>
            ))}
          </div>
        </div>
        <div className="scroll-hint absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-[.35em] text-white/90 md:bottom-10">
          {t({ tr: "KAYDIR", en: "SCROLL" })}
          <ChevronDown className="size-5" />
        </div>
        <div className="intro-flash pointer-events-none absolute inset-0 opacity-0" style={{ background: "radial-gradient(circle, #fff, #ffc6ef 60%, #ff7ad9)" }} />
      </section>

      {/* 2. HARİTA AÇILIŞI */}
      <section id="map-reveal" className="relative h-screen overflow-hidden bg-[#0b0618]" aria-label={t({ tr: "Harita tanıtımı", en: "Map intro" })}>
        {use3d ? <MapReveal3D progress={reveal} /> : (
        <div className="absolute inset-0" style={{ perspective: "1300px" }}>
          <div className="reveal-tilt absolute inset-0 will-change-transform" style={{ transformOrigin: "50% 70%" }}>
            <div className="reveal-stage absolute left-1/2 top-1/2 will-change-transform"
              style={{ width: `max(100vw, ${(100 * MAP_W) / MAP_H}vh)`, aspectRatio: `${MAP_W} / ${MAP_H}`, transform: "translate(-50%, -50%)", transformOrigin: `${(home.x / MAP_W) * 100}% ${(home.y / MAP_H) * 100}%` }}>
              <AntalyaMap lang={lang} current="home" animated />
            </div>
          </div>
        </div>
        )}
        <div className="cloud-l pointer-events-none absolute -left-[20%] top-0 h-full w-[80%] rounded-full will-change-transform" style={{ background: "radial-gradient(closest-side, #f6d2ff, #d58ad6cc 45%, #d58ad640 75%, transparent)" }} />
        <div className="cloud-r pointer-events-none absolute -right-[20%] top-0 h-full w-[80%] rounded-full will-change-transform" style={{ background: "radial-gradient(closest-side, #ffd6c4, #e37aa5cc 45%, #e37aa540 75%, transparent)" }} />
        <div className="reveal-caption absolute inset-x-4 bottom-36 mx-auto max-w-xl rounded-2xl border border-[#ffe066]/60 bg-[#0e071e]/85 p-5 text-center backdrop-blur md:bottom-16">
          <h2 className="font-display text-3xl tracking-wider text-[#ffe066] md:text-4xl">{t({ tr: "BURASI ANTALYA", en: "THIS IS ANTALYA" })}</h2>
          <p className="mt-2 text-[15px] text-white/90 md:text-base">
            {t({ tr: "Bu harita sitenin menüsü. Her sayfa şehirde bir mekân. Radara ya da sağ üstteki harita ikonuna basıp istediğin yere yolculuk edebilirsin.", en: "This map is the site's menu. Every page is a place in the city. Press the radar or the map icon at the top right to travel anywhere." })}
          </p>
          <button type="button" onClick={() => { sfx("tap"); openMap() }} className="mt-4 rounded-lg border-2 border-[#ffe066] px-5 py-2 font-display tracking-[.2em] text-[#ffe066] transition hover:bg-[#ffe066] hover:text-[#1a0d2e]">
            {t({ tr: "HARİTAYI AÇ", en: "OPEN THE MAP" })}
          </button>
        </div>
        <div className="reveal-flash pointer-events-none absolute inset-0 opacity-0" style={{ background: "radial-gradient(circle, #fff 0%, #ffe9a8 50%, #ffe066 100%)" }} />
      </section>

      {/* 3. İSİM + HAKKIMDA ÖZETİ */}
      <section id="hello" className="relative overflow-hidden px-6 py-28 md:px-16 md:py-40" style={{ background: "linear-gradient(180deg, #ffe066 0%, #ff9a6b 18%, #c2457f 50%, #2a0f5c 100%)" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionTag>{t({ tr: "KARAKTER", en: "CHARACTER" })}</SectionTag>
            <h1 className="mt-5 font-display leading-[.88] text-white">
              <span className="block overflow-hidden pt-[.14em]"><span className="name-line block text-[17vw] text-outline md:text-[8.5rem]">MEHMET ALİ</span></span>
              <span className="block overflow-hidden pt-[.14em]"><span className="name-line block text-[24vw] [text-shadow:6px_6px_0_#ff4fd8] md:text-[11rem]">GÜL</span></span>
            </h1>
            <p className="mt-4 text-xl font-semibold text-white md:text-2xl">{t({ tr: "Bilgisayar Programcılığı Öğrencisi", en: "Computer Programming Student" })}</p>
            <p className="about-text mt-8 max-w-xl text-lg leading-relaxed text-white md:text-xl">
              {aboutText.split(" ").map((w, i) => <span key={i} className="about-word inline-block">{w}&nbsp;</span>)}
            </p>
            <div className="mt-8"><TravelButton to="about">{t({ tr: "HAKKIMDA", en: "ABOUT ME" })}</TravelButton></div>
          </div>
          <div data-tilt className="hello-photo relative mx-auto aspect-[4/5] w-full max-w-sm" style={{ clipPath: "inset(0 0 0 0)" }}>
            <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 bg-[#ff8a3d]" style={{ clipPath: SKEWS[0] }} />
            <div className="absolute inset-0 -rotate-2 bg-[#ff4fd8]" style={{ clipPath: SKEWS[0] }} />
            <div className="absolute inset-2 -rotate-2 overflow-hidden" style={{ clipPath: SKEWS[0], background: "linear-gradient(180deg, #3a1470, #b03a8c 70%, #ff9a6b)" }}>
              <NeonPortrait src={portrait} alt={t({ tr: "Mehmet Ali Gül'ün vesikalık fotoğrafı", en: "Portrait of Mehmet Ali Gül" })} />
            </div>
          </div>
        </div>
      </section>

      <Marquee items={["PROJELER", "PHOTOSHOP", "HISTORY BRUSH", "SMART OBJECT", "IMAGE STACK", "WEB ARAYÜZÜ"]} color="#ff8a3d" />
      {/* 4. PROJELER */}
      <section id="home-projects" className="relative overflow-hidden bg-[#2a0f5c] px-6 py-24 md:px-16 md:py-32">
        <h2 className="proj-title whitespace-nowrap font-display text-[22vw] leading-none text-white/10 md:text-[15rem]" aria-label={t({ tr: "Projeler", en: "Projects" })}>
          {t({ tr: "PROJELER PROJELER", en: "PROJECTS PROJECTS" })}
        </h2>
        <div className="mx-auto -mt-[12vw] max-w-6xl md:-mt-40">
          <p className="relative mb-10 max-w-xl text-lg text-white/90">{t({ tr: "Grafik Animasyon I dersinde Photoshop ile hazırladığım altı çalışma.", en: "Six pieces I made with Photoshop in the Graphic Animation I course." })}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
            {PROJECTS.map((p, i) => (
              <a key={p.slug} href={`projeler.html#${p.slug}`} onClick={(e) => { e.preventDefault(); sfx("tap"); openMap("projects") }}
                data-tilt className="proj-panel group relative block aspect-[4/3]" aria-label={`${t(p.title)}: ${t(p.technique)}`}>
                <div className="absolute inset-0 translate-x-2 translate-y-2" style={{ background: p.color, clipPath: SKEWS[i % 3] }} />
                <div className="absolute inset-0 overflow-hidden bg-black" style={{ clipPath: SKEWS[i % 3] }}>
                  <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="font-display text-xs tracking-[.3em]" style={{ color: p.color }}>#{p.no}</span>
                    <h3 className="font-display text-lg leading-tight text-white md:text-2xl">{t(p.title)}</h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-12"><TravelButton to="projects">{t({ tr: "TÜM PROJELER", en: "ALL PROJECTS" })}</TravelButton></div>
        </div>
      </section>

      {/* 5. GALERİ ŞERİDİ */}
      <section id="home-gallery" className="relative flex h-screen flex-col justify-center overflow-hidden bg-gradient-to-b from-[#2a0f5c] to-[#140626]">
        <div className="mb-8 flex items-end justify-between gap-4 px-6 md:px-16">
          <div>
            <SectionTag color="#b07bff">{t({ tr: "GALERİ", en: "GALLERY" })}</SectionTag>
            <h2 className="mt-3 font-display text-5xl text-white md:text-7xl">{t({ tr: "KARELER", en: "SNAPSHOTS" })}</h2>
          </div>
          <TravelButton to="gallery" variant="ghost" className="hidden md:inline-flex">{t({ tr: "GALERİ", en: "GALLERY" })}</TravelButton>
        </div>
        <div className="gal-strip flex w-max gap-6 px-6 md:gap-10 md:px-16" style={{ perspective: "1200px" }}>
          {GALLERY.map((ph, i) => (
            <figure key={i} className="w-[70vw] shrink-0 md:w-[30vw]" style={{ transform: `rotateY(${i % 2 ? -8 : 8}deg)` }}>
              <div className="aspect-[4/5] overflow-hidden rounded-xl border-2" style={{ borderColor: ph.color, boxShadow: `0 0 30px ${ph.color}55` }}>
                {ph.src ? <img src={ph.src} alt={t(ph.caption)} loading="lazy" className="h-full w-full object-cover" /> : <PhotoPlaceholder color={ph.color} label={t(ph.caption)} />}
              </div>
              <figcaption className="mt-3 text-sm text-white/80">{t(ph.caption)}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-8 px-6 md:hidden"><TravelButton to="gallery" variant="ghost">{t({ tr: "GALERİ", en: "GALLERY" })}</TravelButton></div>
      </section>

      <Marquee items={["İLETİŞİM", "0505 067 64 66", "@MALIGL", "KONYAALTI", "HAT AÇIK"]} color="#5cffa1" tilt={2} />
      {/* 6. NEON GECE */}
      <section id="night" className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-32">
        <SunsetScene night={1} />
        <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(180deg, transparent, rgba(255,79,216,.12) 40%, rgba(63,242,255,.1))" }} />
        <div className="relative text-center">
          <h2 className="neon-sign font-neon text-5xl leading-tight text-white md:text-8xl" style={{ textShadow: "0 0 10px #5cffa1, 0 0 30px #5cffa1, 0 0 80px #18b66a" }}>
            {t({ tr: "İLETİŞİME GEÇ", en: "GET IN TOUCH" })}
          </h2>
          <div aria-hidden="true" className="font-neon text-5xl leading-tight text-white opacity-25 blur-[2px] md:text-8xl" style={{ transform: "scaleY(-1)", maskImage: "linear-gradient(transparent 30%, #000)", WebkitMaskImage: "linear-gradient(transparent 30%, #000)", textShadow: "0 0 30px #5cffa1" }}>
            {t({ tr: "İLETİŞİME GEÇ", en: "GET IN TOUCH" })}
          </div>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/85">{t({ tr: "Bir fikrin, sorun ya da sadece selam vermek mi istiyorsun? Telefonum açık.", en: "Got an idea, a question or just want to say hi? My phone is on." })}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <TravelButton to="contact">{t({ tr: "İLETİŞİM", en: "CONTACT" })}</TravelButton>
            <TravelButton to="blog" variant="ghost">{t({ tr: "BLOG", en: "BLOG" })}</TravelButton>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
