// Oyundaki gibi ele alınan telefon. İki uygulama: Ders Programı ve İletişim.
// Saat ve tarih gerçek zamanlıdır (ziyaretçinin kendi saati).
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react"
import gsap from "gsap"
import { ChevronDown, ChevronLeft, Send } from "lucide-react"
import { useLang } from "@/lib/i18n"
import { DAY_NAMES, SCHEDULE } from "@/lib/schedule"
import { PERSON } from "@/lib/site"
import { sfx } from "@/lib/sound"

export type PhoneApp = "schedule" | "contact"

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const pad = (n: number) => String(n).padStart(2, "0")

interface Props { open: boolean; onClose: () => void }

// Telefon açılınca ana ekran gelir; ziyaretçi uygulamaya kendisi dokunarak girer.
export function Phone({ open, onClose }: Props) {
  const { lang, t } = useLang()
  const now = useNow()
  const locale = lang === "tr" ? "tr-TR" : "en-US"
  const root = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<PhoneApp | null>(null)
  const shown = useRef(false)

  // Açılış: telefon ele alınmış gibi sallanarak yükselir. Kapanış: aşağı iner.
  useEffect(() => {
    const el = root.current
    if (!el) return
    gsap.killTweensOf(el)
    if (open) {
      shown.current = true
      setView(null)
      sfx("phone")
      gsap.timeline()
        .set(el, { display: "block" })
        .fromTo(el, { yPercent: 120, rotate: -9 }, { yPercent: 0, rotate: -2, duration: 0.8, ease: "back.out(1.4)" })
        .to(el, { rotate: 1, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" })
    } else if (shown.current) {
      gsap.timeline()
        .to(el, { yPercent: 125, rotate: 8, duration: 0.6, ease: "power3.in" })
        .set(el, { display: "none" })
        .add(() => setView(null))
    }
  }, [open])

  // Uygulama ikondan büyüyerek açılır
  useLayoutEffect(() => {
    if (!view || !root.current) return
    const appEl = root.current.querySelector(".ph-app")
    gsap.fromTo(appEl, { scale: 0.2, opacity: 0, transformOrigin: view === "schedule" ? "33% 42%" : "67% 42%" }, { scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" })
  }, [view])

  const openApp = (a: PhoneApp) => {
    sfx("tap")
    const ripple = root.current?.querySelector(`.ph-tap-${a}`)
    if (ripple) gsap.fromTo(ripple, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.7, duration: 0.45, ease: "power2.out" })
    window.setTimeout(() => setView(a), 160)
  }
  const goHome = () => {
    sfx("tap")
    const appEl = root.current?.querySelector(".ph-app")
    gsap.to(appEl ?? {}, { scale: 0.2, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => setView(null) })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  const colon = now.getSeconds() % 2 === 0
  const dateLine = now.toLocaleDateString(locale, { day: "numeric", month: "long", weekday: "long" })
  const weekdayShort = now.toLocaleDateString(locale, { weekday: "short" }).toLocaleUpperCase(locale)

  return (
    <div ref={root} className="fixed bottom-0 left-1/2 z-[70] hidden -translate-x-1/2 pb-3 md:pb-6" style={{ transformOrigin: "50% 100%" }}
      role="dialog" aria-label={t({ tr: "Telefon", en: "Phone" })}>
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-[min(82dvh,700px)] w-[min(92vw,350px)] rounded-[48px] bg-[#0d0718] p-3 shadow-[0_30px_90px_rgba(0,0,0,.7),0_0_0_2px_#3a2257,0_0_40px_rgba(255,79,216,.25)]">
          <div className="relative h-full w-full overflow-hidden rounded-[38px]" style={{ background: "linear-gradient(180deg, #3a1470 0%, #b03a8c 55%, #ff9a6b 100%)" }}>
            {/* durum çubuğu */}
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-7 pt-3 text-[13px] font-semibold text-white">
              <span>{pad(now.getHours())}<span style={{ opacity: colon ? 1 : 0.2 }}>:</span>{pad(now.getMinutes())}</span>
              <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <span>5G ▮▮▮</span>
            </div>
            {/* ana ekran */}
            <div className="absolute inset-0 flex flex-col items-center pt-16 text-white">
              <div className="font-display text-7xl leading-none tracking-wide [text-shadow:0_4px_20px_rgba(0,0,0,.3)]">{time}</div>
              <div className="mt-2 text-sm font-medium capitalize">{dateLine}</div>
              <div className="mt-14 flex justify-center gap-10">
                <button type="button" onClick={() => openApp("schedule")} disabled={!!view} className="group relative flex flex-col items-center gap-2">
                  <span className="flex size-[88px] flex-col items-center justify-center rounded-[22px] bg-white shadow-[0_10px_30px_rgba(0,0,0,.35)] transition group-hover:scale-105 group-active:scale-95">
                    <span className="text-[12px] font-bold tracking-wide text-[#e0245e]">{weekdayShort}</span>
                    <span className="text-[40px] font-bold leading-none text-[#1a1a1a]">{now.getDate()}</span>
                  </span>
                  <span className="text-[14px] font-semibold">{t({ tr: "Ders Programı", en: "Schedule" })}</span>
                  <span className="ph-tap-schedule pointer-events-none absolute left-1/2 top-11 -ml-6 -mt-6 size-12 rounded-full bg-white opacity-0" />
                </button>
                <button type="button" onClick={() => openApp("contact")} disabled={!!view} className="group relative flex flex-col items-center gap-2">
                  <span className="flex size-[88px] items-center justify-center rounded-[22px] bg-gradient-to-b from-[#5cffa1] to-[#18b66a] shadow-[0_10px_30px_rgba(0,0,0,.35)] transition group-hover:scale-105 group-active:scale-95">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.5 6.1L4.6 21l4.2-2.3c1 .2 2.1.3 3.2.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z" /></svg>
                  </span>
                  <span className="text-[14px] font-semibold">{t({ tr: "İletişim", en: "Contact" })}</span>
                  <span className="ph-tap-contact pointer-events-none absolute left-1/2 top-11 -ml-6 -mt-6 size-12 rounded-full bg-white opacity-0" />
                </button>
              </div>
              <p className="mt-8 text-xs text-white/75">{t({ tr: "Bir uygulamaya dokun", en: "Tap an app" })}</p>
              <svg className="pointer-events-none absolute bottom-0 left-0 w-2/5 opacity-70" viewBox="-70 -20 200 330" aria-hidden="true">
                <path d="M0 300 C 4 200 10 120 24 60 L 31 60 C 20 130 16 210 14 300 Z M27 58 C -8 34 -44 40 -66 62 C -32 50 0 52 26 66 Z M27 58 C 56 28 96 26 122 42 C 88 38 58 46 30 66 Z M27 58 C 24 18 -2 -6 -30 -12 C 2 4 18 30 25 66 Z" fill="#2a0f3c" />
              </svg>
            </div>
            {/* uygulama */}
            {view && (
              <div className="ph-app absolute inset-0 z-10">
                {view === "schedule" ? <ScheduleApp now={now} onBack={goHome} /> : <ContactApp now={now} onSent={onClose} onBack={goHome} />}
              </div>
            )}
            {/* ana ekran çubuğu = kapat */}
            <button type="button" onClick={onClose} aria-label={t({ tr: "Telefonu kapat", en: "Put the phone away" })}
              className="group absolute bottom-0 left-1/2 z-30 flex h-9 w-40 -translate-x-1/2 items-center justify-center">
              <span className="breathe h-[6px] w-32 rounded-full bg-[#ff4fd8] shadow-[0_0_14px_#ff4fd8] transition group-hover:h-2 group-hover:w-36 group-hover:bg-[#ffb3ec]" />
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-1 font-display text-base tracking-[.25em] text-white [text-shadow:0_2px_8px_#000] transition hover:text-[#ffb3ec]">
          <ChevronDown className="size-5" /> {t({ tr: "KAPAT", en: "CLOSE" })}
        </button>
      </div>
    </div>
  )
}

function AppHeader({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  const { t } = useLang()
  return (
    <div className="px-5 pb-3 pt-12">
      <button type="button" onClick={onBack} className="-ml-1 flex items-center py-1 text-[13px] font-semibold text-[#ff6ad5] hover:text-white"><ChevronLeft className="size-4" />{t({ tr: "Geri", en: "Back" })}</button>
      <h3 className="mt-1 font-display text-[28px] leading-tight tracking-wide text-white">{title}</h3>
      <p className="text-xs text-[#c9a6e0]">{sub}</p>
    </div>
  )
}

function ScheduleApp({ now, onBack }: { now: Date; onBack: () => void }) {
  const { lang, t } = useLang()
  const today = now.getDay()
  const days = [1, 2, 3, 4, 5]
  return (
    <div className="flex h-full flex-col bg-[#140a26] text-white" data-lenis-prevent>
      <AppHeader title={t({ tr: "DERS PROGRAMI", en: "CLASS SCHEDULE" })}
        sub={t({ tr: "2026 Güz · Bilgisayar Programcılığı 1. sınıf", en: "Fall 2026 · Computer Programming, 1st year" })} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pb-12">
        <table className="w-full border-collapse text-[12.5px]">
          <caption className="sr-only">{t({ tr: "Haftalık ders programı", en: "Weekly class schedule" })}</caption>
          <thead>
            <tr className="text-left text-[11px] tracking-wider text-[#ffe066]">
              <th scope="col" className="px-2 py-2">{t({ tr: "Gün", en: "Day" })}</th>
              <th scope="col" className="px-2 py-2">{t({ tr: "Saat", en: "Time" })}</th>
              <th scope="col" className="px-2 py-2">{t({ tr: "Ders", en: "Course" })}</th>
            </tr>
          </thead>
          <tbody>
            {days.flatMap((d) => SCHEDULE.filter((l) => l.day === d).map((l, i, arr) => {
              const isToday = d === today
              return (
                <tr key={l.code} className={`border-b border-white/[.07] align-top ${isToday ? "bg-[#ff4fd8]/15" : ""}`}>
                  {i === 0 && (
                    <th scope="row" rowSpan={arr.length} className={`px-2 py-2 text-left font-semibold ${isToday ? "text-[#ff6ad5]" : "text-white/85"}`}>
                      {DAY_NAMES[d][lang].slice(0, 3)}{isToday && <span className="mt-0.5 block text-[10px] tracking-wider text-[#ffe066]">{t({ tr: "BUGÜN", en: "TODAY" })}</span>}
                    </th>
                  )}
                  <td className="whitespace-nowrap px-2 py-2 text-white/80">{l.start}<br />{l.end}</td>
                  <td className="px-2 py-2">
                    <span className="block font-medium">{t(l.name)}</span>
                    <abbr title={t(l.name)} className="text-[11px] text-[#c9a6e0] no-underline">{l.code}</abbr>
                    {l.online && <span className="ml-1.5 text-[11px] text-[#3ff2ff]">· {t({ tr: "uzaktan", en: "online" })}</span>}
                  </td>
                </tr>
              )
            }))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContactApp({ now, onSent, onBack }: { now: Date; onSent: () => void; onBack: () => void }) {
  const { t } = useLang()
  const [sent, setSent] = useState<{ text: string; time: string; ok: boolean } | null>(null)
  const [sending, setSending] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const text = String(fd.get("mesaj") ?? "")
    setSending(true)
    sfx("send")
    let ok = false
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${PERSON.email}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: fd.get("ad"), email: fd.get("eposta"), message: text, _subject: "mehmetaligul web sitesi: yeni mesaj" }),
      })
      ok = r.ok
    } catch { ok = false }
    setSending(false)
    setSent({ text, time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, ok })
    if (ok) window.setTimeout(onSent, 2200)
  }

  return (
    <form onSubmit={submit} className="flex h-full flex-col bg-[#0f1a1a] text-white" data-lenis-prevent>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-12">
        <button type="button" onClick={onBack} aria-label={t({ tr: "Geri", en: "Back" })} className="grid size-8 place-items-center rounded-full text-[#5cffa1] hover:bg-white/10"><ChevronLeft className="size-5" /></button>
        <span className="grid size-10 place-items-center rounded-full bg-[#ff4fd8] font-display text-sm text-[#120822]">MAG</span>
        <div><div className="text-[15px] font-bold">Mehmet Ali Gül</div><div className="text-xs text-[#5cffa1]">{t({ tr: "çevrimiçi", en: "online" })}</div></div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-4">
        <div className="max-w-[82%] self-start rounded-2xl rounded-bl-sm bg-[#23303a] px-3.5 py-2.5 text-sm">{t({ tr: "Selam! Bana buradan yazabilirsin.", en: "Hi! You can message me here." })}</div>
        {sent && (
          <div className="max-w-[82%] self-end rounded-2xl rounded-br-sm bg-[#18b66a] px-3.5 py-2.5 text-sm">
            {sent.text}
            <div className="mt-1 text-right text-[11px] opacity-85">{sent.time} · {sent.ok ? `${t({ tr: "İletildi", en: "Delivered" })} ✓✓` : t({ tr: "Gönderilemedi", en: "Not sent" })}</div>
          </div>
        )}
        {sent && !sent.ok && (
          <div className="max-w-[82%] self-start rounded-2xl rounded-bl-sm bg-[#23303a] px-3.5 py-2.5 text-sm">
            {t({ tr: "Mesajın şu an gönderilemedi. Bana e-postayla yazabilirsin:", en: "Your message couldn't be sent right now. You can e-mail me at:" })}{" "}
            <a href={`mailto:${PERSON.email}`} className="break-all font-semibold text-[#5cffa1] underline">{PERSON.email}</a>
          </div>
        )}
      </div>
      <fieldset disabled={!!sent || sending} className="flex flex-col gap-2 bg-[#121f22] px-3.5 pb-10 pt-3">
        <legend className="sr-only">{t({ tr: "İletişim formu", en: "Contact form" })}</legend>
        <label className="text-[11px] text-[#9fd8bd]">{t({ tr: "Adın", en: "Your name" })}
          <input name="ad" required autoComplete="name" className="mt-1 block h-9 w-full rounded-full bg-[#23303a] px-3.5 text-[13px] text-white outline-none focus:ring-2 focus:ring-[#5cffa1]" />
        </label>
        <label className="text-[11px] text-[#9fd8bd]">{t({ tr: "E-posta", en: "E-mail" })}
          <input name="eposta" type="email" required autoComplete="email" className="mt-1 block h-9 w-full rounded-full bg-[#23303a] px-3.5 text-[13px] text-white outline-none focus:ring-2 focus:ring-[#5cffa1]" />
        </label>
        <div className="flex items-end gap-2">
          <label className="flex-1 text-[11px] text-[#9fd8bd]">{t({ tr: "Mesajın", en: "Your message" })}
            <input name="mesaj" required className="mt-1 block h-9 w-full rounded-full bg-[#23303a] px-3.5 text-[13px] text-white outline-none focus:ring-2 focus:ring-[#5cffa1]" />
          </label>
          <button type="submit" aria-label={t({ tr: "Gönder", en: "Send" })} className="grid size-11 shrink-0 place-items-center rounded-full bg-[#5cffa1] text-[#0f1a1a] transition hover:scale-110">
            <Send className="size-5" />
          </button>
        </div>
      </fieldset>
    </form>
  )
}
