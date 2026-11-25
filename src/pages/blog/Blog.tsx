// BLOG: oyun dünyası haber sitesi tarzı. 3 yazı, her birinde ekran görüntüleri ve açıklamalar.
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { Clock, ArrowDown } from "lucide-react"
import { Footer, SectionTag, TravelButton } from "@/components/ui-mag/bits"
import { useLang } from "@/lib/i18n"
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect"
import type { Bi } from "@/lib/site"
import b1a from "@/assets/blog/b1-katman.webp"
import b1b from "@/assets/blog/b1-so-katman.webp"
import b1c from "@/assets/blog/b1-sonuc.webp"
import b2a from "@/assets/blog/b2-terminal.webp"
import b2b from "@/assets/blog/b2-vite.webp"
import b2c from "@/assets/blog/b2-yapi.webp"
import b3a from "@/assets/blog/b3-lenis.webp"
import b3b from "@/assets/blog/b3-timeline.webp"
import b3c from "@/assets/blog/b3-mag.webp"
import b3d from "@/assets/blog/b3-harita.webp"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Block { p?: Bi; img?: string; cap?: Bi }
interface Post { id: string; tag: Bi; title: Bi; lead: Bi; date: string; min: number; color: string; cover: string; body: Block[] }

const POSTS: Post[] = [
  {
    id: "smart-object", color: "#5cffa1", cover: b1c, date: "2026-11-20", min: 4,
    tag: { tr: "PHOTOSHOP", en: "PHOTOSHOP" },
    title: { tr: "Photoshop'ta Smart Object nedir, neden hayat kurtarır?", en: "What is a Smart Object in Photoshop and why is it a lifesaver?" },
    lead: { tr: "Bir logoyu afişe, kupaya ve kartvizite tek seferde yerleştirip rengini tek tıkla değiştirmenin yolu.", en: "How to place one logo on a poster, a mug and a business card at once, and recolour it in one click." },
    body: [
      { p: { tr: "Grafik Animasyon I dersinin 4. projesinde \"Koza Kahve\" adlı hayali bir kahve markası için mockup hazırladım. Logonun üç farklı yerde görünmesi gerekiyordu: duvardaki afiş, kupa ve kartvizit. Bunu üç ayrı kopya ile yapsaydım her değişiklikte üçünü de tek tek düzeltmem gerekecekti.", en: "For the 4th project of Graphic Animation I, I made a mockup for an imaginary coffee brand called \"Koza Kahve\". The logo had to appear in three places: a poster on the wall, a mug and a business card. With three separate copies, every change would have meant fixing all three by hand." } },
      { p: { tr: "Smart Object (Akıllı Nesne), bir katmanın içine ayrı bir belge gömmek gibidir. Katmana sağ tıklayıp \"Convert to Smart Object\" dediğinde içerik korunur; ölçeklesen, döndürsen ya da perspektif versen bile orijinal kalite kaybolmaz.", en: "A Smart Object is like embedding a separate document inside a layer. Right-click a layer and choose \"Convert to Smart Object\" and the content is protected: scale it, rotate it or add perspective and the original quality stays intact." }, img: b1a, cap: { tr: "Mockup'ın katman yapısı: logo her yerde aynı Smart Object'e bağlı.", en: "The mockup's layer structure: the logo is linked to the same Smart Object everywhere." } },
      { p: { tr: "Asıl sihir şurada: Smart Object'e çift tıklayınca içerik ayrı bir sekmede açılıyor. Orada logonun rengini kahverengiden yeşile çevirip kaydettim ve afiş, kupa ve kartvizit aynı anda güncellendi.", en: "The real magic: double-click the Smart Object and its contents open in a new tab. There I changed the logo from brown to green, saved, and the poster, mug and card all updated at once." }, img: b1b, cap: { tr: "Smart Object'in içi: logo burada düzenleniyor.", en: "Inside the Smart Object: this is where the logo is edited." } },
      { p: { tr: "Sonuç: Tek bir düzenleme, üç yerde değişiklik ve sıfır kalite kaybı. Marka çalışmalarında, sosyal medya şablonlarında ve mockup'larda Smart Object kullanmak saatler kazandırıyor.", en: "The result: one edit, three updates, zero quality loss. For branding, social media templates and mockups, Smart Objects save hours." }, img: b1c, cap: { tr: "Yeşil logolu son hali.", en: "The final version with the green logo." } },
    ],
  },
  {
    id: "react-vite", color: "#3ff2ff", cover: b2b, date: "2026-11-24", min: 5,
    tag: { tr: "WEB", en: "WEB" },
    title: { tr: "Bu siteyi nasıl kurdum: React + Vite ile çok sayfalı bir site", en: "How I built this site: a multi-page site with React + Vite" },
    lead: { tr: "Boş bir klasörden animasyonlu, iki dilli bir siteye: kurulum, yapı ve her sayfanın ayrı HTML olması.", en: "From an empty folder to an animated, bilingual site: setup, structure and giving every page its own HTML file." },
    body: [
      { p: { tr: "Vite, modern web projeleri için çok hızlı bir geliştirme aracı. Tek bir komutla React ve TypeScript hazır bir proje oluşturdum, ardından Tailwind CSS ve animasyon kütüphanelerini (GSAP, Motion, Three.js, Lenis) ekledim.", en: "Vite is a very fast tool for modern web projects. One command gave me a ready React + TypeScript project, then I added Tailwind CSS and the animation libraries (GSAP, Motion, Three.js, Lenis)." }, img: b2a, cap: { tr: "Terminalde kurulum adımları.", en: "Setup steps in the terminal." } },
      { p: { tr: "Ödevde her sayfanın kendi başlığı (title) ve açıklaması (meta description) olması gerekiyordu. Bu yüzden tek sayfalık bir uygulama yerine Vite'ın çok sayfalı (multi-page) modunu kullandım: her sayfa ayrı bir HTML dosyası, kendi SEO etiketleriyle.", en: "The assignment required every page to have its own title and meta description. So instead of a single-page app I used Vite's multi-page mode: every page is its own HTML file with its own SEO tags." }, img: b2b, cap: { tr: "vite.config.ts: altı sayfa, altı giriş noktası.", en: "vite.config.ts: six pages, six entry points." } },
      { p: { tr: "Ortak parçaları (üst menü, radar, harita, telefon) bileşen olarak bir kez yazıp her sayfada kullanıyorum. Dil seçimi tarayıcıda saklanıyor; sayfa değişse de seçtiğin dil korunuyor.", en: "Shared parts (top bar, radar, map, phone) are written once as components and reused on every page. The language choice is stored in the browser, so it stays the same when you change pages." }, img: b2c, cap: { tr: "Projenin klasör yapısı.", en: "The project's folder structure." } },
    ],
  },
  {
    id: "gsap-lenis", color: "#ff4fd8", cover: b3d, date: "2026-11-25", min: 4,
    tag: { tr: "ANİMASYON", en: "ANIMATION" },
    title: { tr: "Kaydırdıkça akan animasyonlar: GSAP ScrollTrigger ve Lenis", en: "Animations that flow as you scroll: GSAP ScrollTrigger and Lenis" },
    lead: { tr: "Anasayfadaki MAG harflerinin içinden geçme ve haritanın düzleşme efektinin arkasındaki iki kütüphane.", en: "The two libraries behind flying through the MAG letters and the map flattening on the home page." },
    body: [
      { p: { tr: "Sitedeki o yağ gibi akan kaydırma hissi Lenis'ten geliyor. Lenis, tarayıcının sert kaydırmasını yumuşatıyor. Ama tek başına yetmiyor: Kaydırmaya bağlı animasyonları yöneten GSAP ScrollTrigger'ın da bu yumuşak kaydırmadan haberdar olması gerekiyor.", en: "The silky scrolling on this site comes from Lenis, which smooths out the browser's stiff scrolling. On its own that isn't enough: GSAP ScrollTrigger, which drives the scroll-linked animations, also has to know about the smooth scroll." }, img: b3a, cap: { tr: "Lenis ve ScrollTrigger'ı aynı saatle çalıştırmak.", en: "Running Lenis and ScrollTrigger on the same clock." } },
      { p: { tr: "ScrollTrigger'da iki sihirli ayar var: scrub ve pin. scrub: animasyonu zamana değil kaydırma çubuğuna bağlar; geri kaydırırsan animasyon da geri sarar. pin: bölümü ekrana sabitler, böylece kaydırırken sayfa kaymaz, sahne oynar.", en: "ScrollTrigger has two magic settings: scrub and pin. scrub ties the animation to the scrollbar instead of time, so scrolling back rewinds it. pin locks the section to the screen, so while you scroll the page doesn't move and the scene plays instead." }, img: b3b, cap: { tr: "MAG harflerinin zaman çizelgesi.", en: "The MAG letters' timeline." } },
      { p: { tr: "Sonuç: Anasayfada kaydırdıkça MAG harfleri kameraya doğru 22 kat büyüyor ve içinden geçiyoruz. Ardından eğik Antalya haritası düzleşiyor ve işaretler tek tek düşüyor.", en: "The result: as you scroll the home page, the MAG letters grow 22 times towards the camera and we fly through them. Then the tilted Antalya map flattens and the markers drop one by one." }, img: b3c, cap: { tr: "Başlangıç: gün batımında neon MAG.", en: "The start: neon MAG at sunset." } },
      { img: b3d, cap: { tr: "Devamı: harita açılışı.", en: "Next: the map reveal." } },
    ],
  },
]

export function Blog() {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const locale = lang === "tr" ? "tr-TR" : "en-US"

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q(".bh-line"), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.2 })
    gsap.fromTo(q(".ticker-inner"), { xPercent: 0 }, { xPercent: -50, duration: 30, ease: "none", repeat: -1 })
    gsap.fromTo(q(".bcard"), { y: 120, opacity: 0, rotateX: 25 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.9, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: q(".bcards")[0], start: "top 80%" } })
    q(".bblock").forEach((el) => gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }))
    q(".bimg").forEach((el) => gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1, ease: "power3.inOut", scrollTrigger: { trigger: el, start: "top 80%" } }))
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  return (
    <div ref={root}>
      <section className="relative overflow-hidden px-6 pb-16 pt-32 md:px-16" style={{ background: "radial-gradient(120% 80% at 80% 0%, #0f4c6b 0%, #120626 55%, #0b0618 100%)" }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(63,242,255,.08) 3px 4px)" }} />
        <div className="relative mx-auto max-w-6xl">
          <SectionTag color="#3ff2ff">MAG NEWS · {t({ tr: "BİLİŞİM", en: "TECH" })}</SectionTag>
          <h1 className="mt-4 font-display leading-[.9] text-white">
            <span className="block overflow-hidden pt-[.1em]"><span className="bh-line block text-[20vw] [text-shadow:0_0_30px_#3ff2ff] md:text-[10rem]">BLOG</span></span>
            <span className="block overflow-hidden"><span className="bh-line block text-[6vw] text-[#3ff2ff] md:text-5xl">{t({ tr: "ÖĞRENDİKLERİM, DENEDİKLERİM", en: "WHAT I LEARN, WHAT I TRY" })}</span></span>
          </h1>
          <TextGenerateEffect key={lang} className="max-w-2xl [&_*]:!text-white/85 [&_.text-2xl]:!text-lg md:[&_.text-2xl]:!text-xl [&_.text-2xl]:!font-medium"
            words={t({ tr: "Bilişim üzerine öğrendiklerimi, denediklerimi ve bu siteyi yaparken kullandığım teknikleri ekran görüntüleriyle anlatıyorum.", en: "I write about what I learn and try in tech, and the techniques behind this site, with screenshots." })} />
        </div>
        <div className="relative mt-12 overflow-hidden border-y-2 border-[#3ff2ff] bg-[#3ff2ff] py-2" aria-hidden="true">
          <div className="ticker-inner flex w-max gap-10 whitespace-nowrap font-display text-lg tracking-[.2em] text-[#0b0618]">
            {[0, 1].map((k) => (
              <span key={k} className="flex gap-10">
                {POSTS.map((p) => <span key={p.id}>● {t(p.title).toLocaleUpperCase(locale)}</span>)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0b0618] px-6 py-16 md:px-16">
        <div className="bcards mx-auto grid max-w-6xl gap-8 md:grid-cols-3" style={{ perspective: "1000px" }}>
          {POSTS.map((p, i) => (
            <a key={p.id} href={`#${p.id}`} onClick={(e) => { e.preventDefault(); (window as unknown as { lenis?: { scrollTo: (el: string, o: object) => void } }).lenis?.scrollTo(`#${p.id}`, { offset: -90 }) }}
              data-tilt className="bcard group block overflow-hidden rounded-2xl border-2 bg-[#140828] transition hover:-translate-y-2" style={{ borderColor: p.color, boxShadow: `0 0 30px ${p.color}33` }}>
              <div className="aspect-video overflow-hidden"><img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded px-2 py-0.5 font-display tracking-[.2em] text-[#0b0618]" style={{ background: p.color }}>{t(p.tag)}</span>
                  <span className="text-white/50">{t({ tr: "Yazı", en: "Post" })} {i + 1}</span>
                </div>
                <h2 className="mt-3 text-xl font-bold leading-snug text-white">{t(p.title)}</h2>
                <p className="mt-2 text-sm text-white/70">{t(p.lead)}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {POSTS.map((p, i) => (
        <article key={p.id} id={p.id} className="relative border-t border-white/10 px-6 py-20 md:px-16" style={{ background: i % 2 ? "#120626" : "#0e0520" }}>
          <div className="mx-auto max-w-3xl">
            <header className="bblock">
              <span className="rounded px-2 py-0.5 font-display text-sm tracking-[.2em] text-[#0b0618]" style={{ background: p.color }}>{t(p.tag)}</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-5xl">{t(p.title)}</h2>
              <p className="mt-3 text-lg text-white/75">{t(p.lead)}</p>
              <p className="mt-4 flex items-center gap-4 text-sm text-white/50">
                <time dateTime={p.date}>{new Date(p.date).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</time>
                <span className="flex items-center gap-1"><Clock className="size-4" />{p.min} {t({ tr: "dk okuma", en: "min read" })}</span>
              </p>
            </header>
            {p.body.map((b, k) => (
              <div key={k} className="bblock mt-8">
                {b.p && <p className="text-lg leading-relaxed text-white/90">{t(b.p)}</p>}
                {b.img && (
                  <figure className="mt-6">
                    <img src={b.img} alt={b.cap ? t(b.cap) : ""} loading="lazy" className="bimg w-full rounded-xl border border-white/15" />
                    {b.cap && <figcaption className="mt-2 text-sm italic" style={{ color: p.color }}>{t(b.cap)}</figcaption>}
                  </figure>
                )}
              </div>
            ))}
            {i < POSTS.length - 1 && (
              <a href={`#${POSTS[i + 1].id}`} className="bblock mt-12 inline-flex items-center gap-2 text-white/60 hover:text-white">
                <ArrowDown className="size-4" /> {t({ tr: "Sonraki yazı", en: "Next post" })}
              </a>
            )}
          </div>
        </article>
      ))}
      <section className="bg-[#0b0618] px-6 py-16 text-center">
        <TravelButton to="gallery">{t({ tr: "GALERİYE GİT", en: "GO TO GALLERY" })}</TravelButton>
      </section>
      <Footer />
    </div>
  )
}
