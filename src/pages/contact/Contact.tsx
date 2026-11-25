// İLETİŞİM: gece + Three.js neon ızgara açılışı, adres (harita işaretli), neon telefon tabelası, telefondaki iletişim formu.
import { lazy, Suspense, useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { AtSign, Mail, MapPin, MessageCircle, Phone as PhoneIcon } from "lucide-react"
import { openPhone, ringPhone } from "@/components/phone/PhoneHost"
import { AntalyaMap } from "@/components/map/AntalyaMap"
import { Footer, SectionTag, TravelButton } from "@/components/ui-mag/bits"
import { useLang } from "@/lib/i18n"
import { PAGES, PERSON } from "@/lib/site"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Marquee } from "@/components/ui-mag/Marquee"

gsap.registerPlugin(ScrollTrigger, useGSAP)
const SynthGrid = lazy(() => import("@/components/scene/SynthGrid").then((m) => ({ default: m.SynthGrid })))

export function Contact() {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  // Sayfaya gelen ziyaretçi telefonu fark etsin: kısa süre sonra telefon çalar.
  useEffect(() => {
    const id = window.setTimeout(() => ringPhone({ tr: "Bana telefondan mesaj gönderebilirsin", en: "You can text me from the phone" }), 2600)
    return () => window.clearTimeout(id)
  }, [])
  const p = PAGES.contact

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q(".ct-word"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.08, delay: 0.3 })
    gsap.fromTo(q(".ct-neon"), { opacity: 0.1 }, { opacity: 1, duration: 0.07, repeat: 8, yoyo: true, delay: 1.2 })
    q(".ct-card").forEach((el, i) => gsap.fromTo(el, { y: 70, opacity: 0, rotateX: 30 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, delay: i * 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }))
    gsap.fromTo(q(".addr-pin"), { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "bounce.out", scrollTrigger: { trigger: q(".addr-map")[0], start: "top 75%" } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  return (
    <div ref={root}>
      <section className="relative h-[90vh] min-h-[560px] overflow-hidden" style={{ background: "linear-gradient(180deg, #05020f 0%, #140626 45%, #3d0f4f 100%)" }}>
        <div className="absolute inset-0"><Suspense fallback={null}><SynthGrid /></Suspense></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0618]" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <SectionTag color="#5cffa1">{t({ tr: "KONYAALTI · GECE", en: "KONYAALTI · NIGHT" })}</SectionTag>
          <h1 aria-label={t({ tr: "İLETİŞİM", en: "CONTACT" })} className="mt-4 overflow-hidden pt-[.12em] font-display text-[19vw] leading-none text-white [text-shadow:0_0_40px_#5cffa1] md:text-[9rem]">
            {t({ tr: "İLETİŞİM", en: "CONTACT" }).split("").map((c, i) => <span key={i} aria-hidden="true" className="ct-word inline-block">{c}</span>)}
          </h1>
          <p className="ct-neon mt-4 font-neon text-2xl text-[#5cffa1] md:text-4xl" style={{ textShadow: "0 0 12px #5cffa1, 0 0 30px #18b66a" }}>
            {t({ tr: "Hat açık", en: "Line open" })}
          </p>
        </div>
      </section>

      <Marquee items={["İLETİŞİM", "0505 067 64 66", "MEHMETALIGUL2108@GMAIL.COM", "@MALIGL", "ANTALYA"]} color="#5cffa1" />
      <section className="relative bg-[#0b0618] px-6 py-20 md:px-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4" style={{ perspective: "1000px" }}>
          <div data-tilt className="ct-card relative overflow-hidden rounded-2xl border-2 border-[#5cffa1]/70 bg-[#0f1a1a] p-6 lg:col-span-2 lg:row-span-2">
            <BorderBeam size={160} duration={7} colorFrom="#5cffa1" colorTo="#3ff2ff" />
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-[.15em] text-[#5cffa1]"><MapPin className="size-6" />{t({ tr: "ADRES", en: "ADDRESS" })}</h2>
            <address className="mt-2 text-lg not-italic text-white">{t(PERSON.address)}</address>
            <div className="addr-map relative mt-5 aspect-[16/10] overflow-hidden rounded-xl border border-white/10">
              <div className="absolute" style={{ width: "260%", aspectRatio: "1440/900", left: `${50 - (p.x / 1440) * 260}%`, top: `${50 - (p.y / 900) * 260}%` }}>
                <AntalyaMap lang={lang} current="contact" pins={false} labels />
              </div>
              <div className="addr-pin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-[#5cffa1] drop-shadow-[0_0_12px_#5cffa1]"><MapPin className="size-12 fill-[#0f1a1a]" /></div>
              <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#5cffa1]" />
            </div>
          </div>
          <a href={PERSON.phoneHref} data-tilt className="ct-card group relative overflow-hidden rounded-2xl border-2 border-[#ff4fd8]/70 bg-[#1a0a24] p-6 transition hover:-translate-y-1">
            <BorderBeam size={90} duration={5} colorFrom="#ff4fd8" colorTo="#ffe066" />
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-[.15em] text-[#ff4fd8]"><PhoneIcon className="size-6" />{t({ tr: "TELEFON", en: "PHONE" })}</h2>
            <p className="mt-3 whitespace-nowrap font-display text-3xl tracking-wider text-white" style={{ textShadow: "0 0 10px #ff4fd8, 0 0 24px #ff4fd8" }}>{PERSON.phone}</p>
          </a>
          <a href={`mailto:${PERSON.email}`} data-tilt className="ct-card group rounded-2xl border-2 border-[#3ff2ff]/70 bg-[#0a1a24] p-6 transition hover:-translate-y-1">
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-[.15em] text-[#3ff2ff]"><Mail className="size-6" />{t({ tr: "E-POSTA", en: "E-MAIL" })}</h2>
            <p className="mt-3 break-all text-base font-semibold text-white">{PERSON.email}</p>
          </a>
          <a href={`https://www.instagram.com/${PERSON.instagram}/`} target="_blank" rel="noopener noreferrer" data-tilt className="ct-card group rounded-2xl border-2 border-[#ffe066]/70 bg-[#1f1a0a] p-6 transition hover:-translate-y-1 lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-[.15em] text-[#ffe066]"><AtSign className="size-6" />INSTAGRAM</h2>
            <p className="mt-3 text-lg font-semibold text-white">@{PERSON.instagram}</p>
          </a>
        </div>
      </section>

      <section id="message" className="relative overflow-hidden px-6 py-20 md:px-16" style={{ background: "linear-gradient(180deg, #0b0618 0%, #1c0838 60%, #3d0f4f 100%)" }}>
        <div className="mx-auto max-w-6xl">
          <SectionTag color="#5cffa1">{t({ tr: "MESAJ", en: "MESSAGE" })}</SectionTag>
          <h2 className="mt-4 font-display text-5xl text-white md:text-7xl">{t({ tr: "BANA YAZ", en: "TEXT ME" })}</h2>
          <p className="mt-3 max-w-md text-lg text-white/85">{t({ tr: "Telefonu aç, İletişim uygulamasına dokun ve bana doğrudan mesaj gönder.", en: "Open the phone, tap the Contact app and message me directly." })}</p>
          {(
            <button type="button" onClick={openPhone} className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#5cffa1] bg-[#0f1a1a]/70 px-5 py-3 font-display tracking-[.2em] text-[#5cffa1] transition hover:scale-105">
              <MessageCircle className="size-5" /> {t({ tr: "MESAJ GÖNDER", en: "SEND A MESSAGE" })}
            </button>
          )}
          <div className="mt-16 flex flex-wrap gap-4">
            <TravelButton to="home">{t({ tr: "ANASAYFAYA DÖN", en: "BACK HOME" })}</TravelButton>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
