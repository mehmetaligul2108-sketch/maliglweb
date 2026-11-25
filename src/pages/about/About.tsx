// HAKKIMDA: karakter profili açılışı, hakkımda metni, özgeçmiş zaman çizelgesi, yetenek istatistikleri,
// ilgi alanları ve hedefler, alıntı ve kod terminali, telefonda ders programı.
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { CalendarDays } from "lucide-react"
import { openPhone, ringPhone } from "@/components/phone/PhoneHost"
import { Footer, SectionTag, TravelButton } from "@/components/ui-mag/bits"
import { useLang } from "@/lib/i18n"
import { sfx } from "@/lib/sound"
import portrait from "@/assets/img/vesikalik-cutout.webp"
import { NeonPortrait } from "@/components/ui-mag/NeonPortrait"
import { Marquee } from "@/components/ui-mag/Marquee"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const SKILLS = [
  { name: { tr: "Microsoft Office (Word, Excel, PowerPoint)", en: "Microsoft Office (Word, Excel, PowerPoint)" }, v: 75, c: "#5cffa1" },
  { name: { tr: "Adobe Photoshop", en: "Adobe Photoshop" }, v: 70, c: "#3ff2ff" },
  { name: { tr: "HTML & CSS", en: "HTML & CSS" }, v: 65, c: "#ff8a3d", abbr: true },
  { name: { tr: "İngilizce", en: "English" }, v: 60, c: "#ffe066" },
  { name: { tr: "Python", en: "Python" }, v: 55, c: "#b07bff" },
  { name: { tr: "Algoritma ve Programlama Temelleri", en: "Algorithms and Programming Basics" }, v: 55, c: "#ff4fd8" },
  { name: { tr: "Veri Tabanı (SQL)", en: "Databases (SQL)" }, v: 45, c: "#3ff2ff" },
  { name: { tr: "JavaScript", en: "JavaScript" }, v: 40, c: "#ffe066" },
]

const INTERESTS = [
  { tr: "Web tasarımı ve arayüz geliştirme", en: "Web design and UI development" },
  { tr: "Grafik tasarım ve fotoğraf düzenleme", en: "Graphic design and photo editing" },
  { tr: "Programlama ve algoritmalar", en: "Programming and algorithms" },
  { tr: "Veri tabanları", en: "Databases" },
  { tr: "Yeni teknolojiler ve yapay zekâ", en: "New technology and AI" },
]
const GOALS = [
  { tr: "Bilgisayar Programcılığı bölümünü başarıyla tamamlamak", en: "Successfully complete the Computer Programming programme" },
  { tr: "Ön yüz (front-end) geliştirmede uzmanlaşmak", en: "Specialise in front-end development" },
  { tr: "Kendi projelerimle güçlü bir portfolyo oluşturmak", en: "Build a strong portfolio with my own projects" },
  { tr: "Sektörde staj yaparak deneyim kazanmak", en: "Gain experience through an internship in the industry" },
]

const CODE = `const ogrenci = {
  ad: "Mehmet Ali Gül",
  okul: "Akdeniz Üniversitesi",
  bolum: "Bilgisayar Programcılığı",
  sinif: 1,
  seviye: () => "her gün +1 XP",
};

console.log(\`Merhaba, ben \${ogrenci.ad}!\`);`

export function About() {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    // Açılış: paneller bıçak darbesi gibi gelir, fotoğraf tarama çizgisiyle belirir, isim çizilir, GÜL titreyip oturur.
    const tl = gsap.timeline({ delay: 0.3 })
    tl.fromTo(q(".hero-slab"), { xPercent: 140, rotate: 18, opacity: 0 }, { xPercent: 0, rotate: (i) => [4, -2][i] ?? 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.12 })
      .fromTo(q(".hero-photo"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power2.inOut" }, "-=0.2")
      .fromTo(q(".scanline"), { top: "0%", opacity: 1 }, { top: "100%", opacity: 0.2, duration: 1.1, ease: "power2.inOut" }, "<")
      .fromTo(q(".hero-tag"), { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, 0.2)
      .fromTo(q(".name-top span"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }, 0.35)
      .fromTo(q(".name-gul"), { yPercent: -160, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power4.in" }, 1.1)
      .add(() => sfx("glitch"))
      .to(q(".name-gul"), { x: () => gsap.utils.random(-10, 10), skewX: () => gsap.utils.random(-12, 12), textShadow: "-6px 0 0 #3ff2ff, 8px 4px 0 #ff4fd8", duration: 0.05, repeat: 7, yoyo: true, ease: "none" })
      .to(q(".name-gul"), { x: 0, skewX: 0, textShadow: "7px 7px 0 #ff4fd8", duration: 0.1 })
      .fromTo(q(".hero-shake"), { x: 0 }, { x: 6, duration: 0.04, repeat: 5, yoyo: true, clearProps: "x" }, "<-0.45")
      .fromTo(q(".stat-row"), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 }, "-=0.1")
    // Kaydırınca paralaks
    gsap.to(q(".hero-text"), { yPercent: -25, ease: "none", scrollTrigger: { trigger: q("#profile")[0], start: "top top", end: "bottom top", scrub: true } })
    gsap.to(q(".hero-card"), { yPercent: 18, scale: 1.08, opacity: 0.3, ease: "none", scrollTrigger: { trigger: q("#profile")[0], start: "top top", end: "bottom top", scrub: true } })

    // Bölüm başlıkları ve içerikler
    q(".reveal").forEach((el) => gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }))
    // Zaman çizelgesi: neon çizgi kaydırdıkça çizilir, duraklar yanar
    gsap.fromTo(q(".tl-line"), { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "50% 0%", scrollTrigger: { trigger: q("#cv")[0], start: "top 70%", end: "bottom 60%", scrub: true } })
    q(".tl-item").forEach((el) => gsap.fromTo(el, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6, scrollTrigger: { trigger: el, start: "top 80%" } }))
    // Yetenek çubukları dolar, yüzdeler sayar
    q(".skill").forEach((el) => {
      const bar = el.querySelector(".skill-fill"), num = el.querySelector(".skill-num")
      const v = Number(el.getAttribute("data-v"))
      const o = { n: 0 }
      gsap.fromTo(bar, { scaleX: 0 }, { scaleX: v / 100, duration: 1.4, ease: "power3.out", transformOrigin: "0 50%", scrollTrigger: { trigger: el, start: "top 88%" } })
      gsap.to(o, { n: v, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" }, onUpdate: () => { if (num) num.textContent = `%${Math.round(o.n)}` } })
    })
    // Kod terminali: satırlar yazılır gibi açılır
    gsap.fromTo(q(".code-line"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.35, stagger: 0.18, ease: "steps(14)", scrollTrigger: { trigger: q(".terminal")[0], start: "top 75%" } })
    // Ders programı bölümüne gelince telefon çalar (kendiliğinden açılmaz)
    ScrollTrigger.create({ trigger: q("#schedule")[0], start: "top 55%", once: true,
      onEnter: () => ringPhone({ tr: "Ders programın telefonunda", en: "Your class schedule is on the phone" }) })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  return (
    <div ref={root}>
      {/* KARAKTER PROFİLİ */}
      <section id="profile" className="hero-shake relative min-h-screen overflow-hidden px-6 pb-40 pt-28 md:px-16 md:pb-24 md:pt-32" style={{ background: "linear-gradient(180deg, #2a0f5c 0%, #8a2a8f 45%, #ff6f91 75%, #ffb36b 100%)" }}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="hero-text">
            <span className="hero-tag inline-block -skew-x-12 bg-[#ffe066] px-4 py-1.5 font-display text-base tracking-[.3em] text-[#1a0d2e]">
              <span className="inline-block skew-x-12">{t({ tr: "KARAKTER PROFİLİ", en: "CHARACTER PROFILE" })}</span>
            </span>
            <h1 className="mt-6 font-display leading-[.9]">
              <span aria-label="MEHMET ALİ" className="name-top block whitespace-nowrap pt-[.12em] text-[15vw] text-outline [text-shadow:0_0_30px_rgba(255,79,216,.5)] md:text-[7rem]">
                {"MEHMET ALİ".split("").map((c, i) => <span key={i} className="inline-block">{c === " " ? " " : c}</span>)}
              </span>
              <span className="name-gul block pt-[.12em] text-[30vw] text-white [text-shadow:7px_7px_0_#ff4fd8] md:text-[11.5rem]">GÜL</span>
            </h1>
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-7 gap-y-3 border-l-4 border-[#ff4fd8] bg-[#140828]/70 px-6 py-5 backdrop-blur">
              {[
                [{ tr: "OKUL", en: "SCHOOL" }, { tr: "Akdeniz Üniversitesi", en: "Akdeniz University" }],
                [{ tr: "BÖLÜM", en: "PROGRAMME" }, { tr: "Bilgisayar Programcılığı", en: "Computer Programming" }],
                [{ tr: "SINIF", en: "YEAR" }, { tr: "1. sınıf", en: "1st year" }],
                [{ tr: "KONUM", en: "LOCATION" }, { tr: "Antalya", en: "Antalya" }],
              ].map(([k, v]) => (
                <div key={k.tr} className="stat-row">
                  <dt className="text-[11px] tracking-[.25em] text-[#ffb3e6]">{t(k)}</dt>
                  <dd className="font-semibold text-white">{t(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-tilt className="hero-card relative mx-auto aspect-[11/15] w-full max-w-[420px]">
            <div className="hero-slab absolute inset-0 translate-x-6 translate-y-5 bg-[#ff8a3d]" style={{ clipPath: "polygon(8% 0, 100% 4%, 92% 100%, 0 96%)" }} />
            <div className="hero-slab absolute inset-0 bg-[#ff4fd8]" style={{ clipPath: "polygon(8% 0, 100% 4%, 92% 100%, 0 96%)" }} />
            <div className="hero-photo absolute inset-2 -rotate-2 overflow-hidden" style={{ clipPath: "polygon(8% 0, 100% 4%, 92% 100%, 0 96%)", background: "linear-gradient(180deg, #3a1470, #b03a8c 65%, #ff9a6b)" }}>
              <NeonPortrait src={portrait} alt={t({ tr: "Mehmet Ali Gül'ün vesikalık fotoğrafı", en: "Portrait photo of Mehmet Ali Gül" })} />
              <div className="scanline absolute inset-x-0 h-1 bg-white shadow-[0_0_20px_6px_#fff]" />
            </div>
            <span className="absolute -right-2 bottom-10 rotate-[-3deg] bg-[#1a0d2e] px-4 py-1.5 font-display text-lg tracking-[.25em] text-[#ffe066]">MAG · 2026</span>
          </div>
        </div>
      </section>

      <Marquee items={["MEHMET ALİ GÜL", "BİLGİSAYAR PROGRAMCILIĞI", "AKDENİZ ÜNİVERSİTESİ", "ANTALYA", "2026"]} />
      {/* HAKKIMDA METNİ */}
      <section className="relative bg-[#1a0b33] px-6 py-24 md:px-16 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="reveal"><SectionTag color="#ff4fd8">{t({ tr: "HAKKIMDA", en: "ABOUT ME" })}</SectionTag></div>
          <h2 className="reveal mt-4 font-display text-5xl text-white md:text-7xl">{t({ tr: "BEN KİMİM?", en: "WHO AM I?" })}</h2>
          <div className="reveal mt-8 space-y-5 text-lg leading-relaxed text-white/90 md:text-xl">
            <p>{t({ tr: "Merhaba, ben Mehmet Ali Gül. 2026 yılında Şevkiye Özel Fen Lisesi'nden mezun oldum ve şu anda Akdeniz Üniversitesi'nde Bilgisayar Programcılığı birinci sınıf öğrencisiyim.", en: "Hi, I'm Mehmet Ali Gül. I graduated from Şevkiye Private Science High School in 2026 and I'm now a first-year Computer Programming student at Akdeniz University." })}</p>
            <p>{t({ tr: "Kod yazmayı, tasarım yapmayı ve aklımdaki bir fikri ekranda hayata geçirmeyi seviyorum. Programlamadan grafik tasarıma kadar öğrendiğim her yeni konuyu bir oyunun yeni bölümü gibi görüyorum: keşfediyor, deniyor ve her seferinde bir seviye atlamaya çalışıyorum.", en: "I love writing code, designing, and bringing an idea to life on screen. From programming to graphic design, I treat every new topic like a new level in a game: I explore it, try things out and aim to level up every time." })}</p>
            <p>{t({ tr: "Bu site, Web Tasarımının Temelleri dersi için hazırladığım ve kendimi, projelerimi ve öğrendiklerimi paylaştığım kişisel alanım. Gezdiğin için teşekkürler, iyi eğlenceler!", en: "This site is my personal space, made for the Fundamentals of Web Design course, where I share myself, my projects and what I learn. Thanks for visiting, enjoy!" })}</p>
          </div>
        </div>
      </section>

      {/* ÖZGEÇMİŞ */}
      <section id="cv" className="relative bg-gradient-to-b from-[#1a0b33] to-[#2a0f5c] px-6 py-24 md:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="reveal"><SectionTag color="#3ff2ff">{t({ tr: "ÖZGEÇMİŞ", en: "CV" })}</SectionTag></div>
          <h2 className="reveal mt-4 font-display text-5xl text-white md:text-7xl">{t({ tr: "YOLCULUK", en: "THE JOURNEY" })}</h2>
          <div className="relative mt-12 pl-10 md:pl-14">
            <div className="tl-line absolute bottom-0 left-3 top-0 w-1 rounded bg-gradient-to-b from-[#3ff2ff] via-[#ff4fd8] to-[#ffe066] shadow-[0_0_14px_#ff4fd8] md:left-5" />
            <h3 className="tl-item mb-6 font-display text-2xl tracking-[.15em] text-[#3ff2ff]">{t({ tr: "EĞİTİM", en: "EDUCATION" })}</h3>
            {[
              { when: { tr: "2026 – devam ediyor", en: "2026 – present" }, what: { tr: "Akdeniz Üniversitesi", en: "Akdeniz University" }, detail: { tr: "Bilgisayar Programcılığı, Önlisans · 1. sınıf", en: "Computer Programming, Associate degree · 1st year" }, c: "#ff4fd8" },
              { when: { tr: "2022 – 2026", en: "2022 – 2026" }, what: { tr: "Şevkiye Özel Fen Lisesi", en: "Şevkiye Private Science High School" }, detail: { tr: "Lise · Mezun", en: "High school · Graduated" }, c: "#3ff2ff" },
            ].map((it) => (
              <div key={it.what.tr} data-tilt className="tl-item relative mb-8 rounded-xl border border-white/10 bg-[#140828]/70 p-5 backdrop-blur">
                <span className="absolute -left-[37px] top-6 size-5 rounded-full border-4 border-[#1a0b33] md:-left-[45px]" style={{ background: it.c, boxShadow: `0 0 16px ${it.c}` }} />
                <span className="font-display text-sm tracking-[.2em]" style={{ color: it.c }}>{t(it.when)}</span>
                <h4 className="mt-1 text-xl font-bold text-white">{t(it.what)}</h4>
                <p className="text-white/75">{t(it.detail)}</p>
              </div>
            ))}
            <h3 className="tl-item mb-6 mt-12 font-display text-2xl tracking-[.15em] text-[#ffe066]">{t({ tr: "PROJELER VE ÇALIŞMALAR", en: "PROJECTS AND WORK" })}</h3>
            {[
              { when: "2026", what: { tr: "Grafik Animasyon I: Photoshop Projeleri", en: "Graphic Animation I: Photoshop Projects" }, detail: { tr: "Akdeniz Üniversitesi Grafik Animasyon I dersi kapsamında Adobe Photoshop ile 6 proje hazırladım: History Brush, ürün tanıtımı, karakalem renklendirme, Smart Object, Image Stack ve web arayüzü tasarımı.", en: "Six Adobe Photoshop projects for the Graphic Animation I course at Akdeniz University: History Brush, a product ad, sketch colouring, Smart Object, Image Stack and a web UI design." }, c: "#ff8a3d" },
              { when: "2026", what: { tr: "Kişisel Web Sitesi", en: "Personal Website" }, detail: { tr: "Web Tasarımının Temelleri dersi için GTA temalı, animasyonlu ve iki dilli (Türkçe/İngilizce) bu kişisel web sitesini tasarladım. React, GSAP ve Three.js kullandım.", en: "For the Fundamentals of Web Design course I designed this GTA-themed, animated, bilingual (Turkish/English) personal website using React, GSAP and Three.js." }, c: "#ffe066" },
            ].map((it) => (
              <div key={it.what.tr} data-tilt className="tl-item relative mb-8 rounded-xl border border-white/10 bg-[#140828]/70 p-5 backdrop-blur">
                <span className="absolute -left-[37px] top-6 size-5 rounded-full border-4 border-[#1a0b33] md:-left-[45px]" style={{ background: it.c, boxShadow: `0 0 16px ${it.c}` }} />
                <span className="font-display text-sm tracking-[.2em]" style={{ color: it.c }}>{it.when}</span>
                <h4 className="mt-1 text-xl font-bold text-white">{t(it.what)}</h4>
                <p className="text-white/75">{t(it.detail)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={["HTML", "CSS", "PHOTOSHOP", "PYTHON", "SQL", "JAVASCRIPT"]} color="#3ff2ff" tilt={2} />
      {/* YETENEKLER */}
      <section className="relative bg-[#2a0f5c] px-6 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="reveal"><SectionTag color="#5cffa1">{t({ tr: "İSTATİSTİKLER", en: "STATS" })}</SectionTag></div>
          <h2 className="reveal mt-4 font-display text-5xl text-white md:text-7xl">{t({ tr: "YETENEKLER", en: "SKILLS" })}</h2>
          <div className="mt-10 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {SKILLS.map((s) => (
              <div key={s.name.tr} className="skill" data-v={s.v}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-white">
                    {s.abbr ? <><abbr title="HyperText Markup Language">HTML</abbr> &amp; <abbr title="Cascading Style Sheets">CSS</abbr></> : t(s.name)}
                  </span>
                  <span className="skill-num font-display text-xl tracking-wider" style={{ color: s.c }}>%{s.v}</span>
                </div>
                <div className="flex gap-1" role="meter" aria-valuenow={s.v} aria-valuemin={0} aria-valuemax={100} aria-label={t(s.name)}>
                  <div className="relative h-4 flex-1 -skew-x-12 overflow-hidden bg-white/10">
                    <div className="skill-fill absolute inset-0" style={{ background: `linear-gradient(90deg, ${s.c}99, ${s.c})`, boxShadow: `0 0 16px ${s.c}`, transform: `scaleX(${s.v / 100})`, transformOrigin: "0 50%" }} />
                    <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), #2a0f5c calc(10% - 2px) 10%)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İLGİ ALANLARI + HEDEFLER */}
      <section className="relative bg-gradient-to-b from-[#2a0f5c] to-[#3a1470] px-6 py-24 md:px-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div data-tilt className="reveal rounded-2xl border-2 border-[#ff4fd8]/70 bg-[#140828]/70 p-7 shadow-[0_0_30px_rgba(255,79,216,.2)]">
            <h2 className="font-display text-3xl tracking-wider text-[#ff4fd8]">{t({ tr: "İLGİ ALANLARIM", en: "MY INTERESTS" })}</h2>
            <ul className="mt-5 space-y-3 text-white/90">
              {INTERESTS.map((i) => <li key={i.tr} className="flex gap-3"><span className="mt-2 size-2.5 shrink-0 rotate-45 bg-[#ff4fd8] shadow-[0_0_8px_#ff4fd8]" />{t(i)}</li>)}
            </ul>
          </div>
          <div data-tilt className="reveal rounded-2xl border-2 border-[#ffe066]/70 bg-[#140828]/70 p-7 shadow-[0_0_30px_rgba(255,224,102,.15)]">
            <h2 className="font-display text-3xl tracking-wider text-[#ffe066]">{t({ tr: "HEDEFLERİM", en: "MY GOALS" })}</h2>
            <ol className="mt-5 space-y-3 text-white/90">
              {GOALS.map((g, i) => (
                <li key={g.tr} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded bg-[#ffe066] font-display text-sm text-[#1a0d2e]">{i + 1}</span>{t(g)}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ALINTI + KOD */}
      <section className="relative bg-[#3a1470] px-6 py-24 md:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <figure className="reveal">
            <blockquote className="relative pl-2 text-2xl font-semibold leading-snug text-white md:text-3xl"
              cite="https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/full-text/book/book-Z-H-7.html">
              <span aria-hidden="true" className="absolute -left-4 -top-10 font-display text-8xl leading-none text-[#ff4fd8]/60">“</span>
              {t({ tr: "Programlar insanların okuması için yazılmalı; makinelerin çalıştırması ise sadece bir tesadüftür.", en: "Programs must be written for people to read, and only incidentally for machines to execute." })}
            </blockquote>
            <figcaption className="mt-4 font-display tracking-[.2em] text-[#ffe066]">— HAROLD ABELSON</figcaption>
          </figure>
          <div data-tilt className="terminal reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b0618] shadow-[0_20px_60px_rgba(0,0,0,.5),0_0_30px_rgba(63,242,255,.15)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-white/50">ogrenci.<abbr title="JavaScript">js</abbr></span>
            </div>
            <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-[#e7cdf5] md:text-sm"><code>{CODE.split("\n").map((l, i) => <span key={i} className="code-line block whitespace-pre">{l || " "}</span>)}</code></pre>
            <div className="border-t border-white/10 px-5 py-3 font-mono text-[13px] text-[#5cffa1]">&gt; Merhaba, ben Mehmet Ali Gül!</div>
          </div>
        </div>
      </section>

      {/* DERS PROGRAMI (telefon) */}
      <section id="schedule" className="relative overflow-hidden bg-gradient-to-b from-[#3a1470] via-[#8a2a8f] to-[#ff6f91] px-6 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="reveal"><SectionTag color="#ffe066">{t({ tr: "TAKVİM", en: "CALENDAR" })}</SectionTag></div>
          <h2 className="reveal mt-4 font-display text-5xl text-white md:text-7xl">{t({ tr: "DERS PROGRAMI", en: "CLASS SCHEDULE" })}</h2>
          <p className="reveal mt-4 max-w-md text-lg text-white/90">{t({ tr: "Haftalık ders programım telefonumda. Telefonu aç, Ders Programı uygulamasına dokun; bugünün dersleri otomatik olarak vurgulanır.", en: "My weekly schedule lives on my phone. Open the phone and tap the Schedule app; today's classes are highlighted automatically." })}</p>
          {(
            <button type="button" onClick={openPhone} className="reveal mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#ffe066] bg-[#140828]/60 px-5 py-3 font-display tracking-[.2em] text-[#ffe066] transition hover:scale-105">
              <CalendarDays className="size-5" /> {t({ tr: "TELEFONU AÇ", en: "OPEN THE PHONE" })}
            </button>
          )}
        </div>
        <div className="mx-auto mt-16 flex max-w-5xl flex-wrap gap-4">
          <TravelButton to="projects">{t({ tr: "PROJELERİME GİT", en: "SEE MY PROJECTS" })}</TravelButton>
          <TravelButton to="contact" variant="ghost">{t({ tr: "İLETİŞİM", en: "CONTACT" })}</TravelButton>
        </div>
      </section>
      <Footer />
    </div>
  )
}
