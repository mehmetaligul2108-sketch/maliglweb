// Her sayfada: sağ altta telefon butonu + oyundaki gibi "Gelen arama" bildirimi + telefonun kendisi.
// Telefon kendiliğinden açılmaz; ziyaretçi butona ya da bildirimdeki "Aç"a basar.
import { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Phone as PhoneIcon, PhoneOff } from "lucide-react"
import { Phone } from "./Phone"
import { useLang } from "@/lib/i18n"
import { sfx } from "@/lib/sound"
import type { Bi } from "@/lib/site"

const OPEN = "mag:phone-open"
const RING = "mag:phone-ring"
export const openPhone = () => window.dispatchEvent(new Event(OPEN))
export const ringPhone = (sub: Bi) => window.dispatchEvent(new CustomEvent(RING, { detail: sub }))

export function PhoneHost() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [ring, setRing] = useState<Bi | null>(null)
  const [badge, setBadge] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const toast = useRef<HTMLDivElement>(null)
  const openRef = useRef(false)
  openRef.current = open

  const doOpen = useCallback(() => { setRing(null); setBadge(false); setOpen(true) }, [])
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onOpen = () => doOpen()
    const onRing = (e: Event) => {
      if (openRef.current) return
      setRing((e as CustomEvent<Bi>).detail)
      setBadge(true)
    }
    window.addEventListener(OPEN, onOpen)
    window.addEventListener(RING, onRing)
    return () => { window.removeEventListener(OPEN, onOpen); window.removeEventListener(RING, onRing) }
  }, [doOpen])

  // Çalarken: buton titrer, kısık zil sesi birkaç kez çalar, bildirim kayarak gelir.
  useEffect(() => {
    if (!ring) return
    const shake = gsap.timeline({ repeat: -1, repeatDelay: 0.9 })
    shake.to(btn.current, { rotate: 14, duration: 0.05, yoyo: true, repeat: 9, ease: "none" }).set(btn.current, { rotate: 0 })
    gsap.fromTo(toast.current, { x: 60, y: 20, opacity: 0, scale: 0.9 }, { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" })
    let n = 0
    sfx("phone")
    const id = window.setInterval(() => { if (++n < 4) sfx("phone"); else window.clearInterval(id) }, 1900)
    return () => { shake.kill(); gsap.set(btn.current, { rotate: 0 }); window.clearInterval(id) }
  }, [ring])

  const decline = () => {
    sfx("tap")
    gsap.to(toast.current, { x: 60, opacity: 0, duration: 0.3, onComplete: () => setRing(null) })
  }

  return (
    <>
      {ring && !open && (
        <div ref={toast} role="alertdialog" aria-label={t({ tr: "Gelen arama", en: "Incoming call" })}
          className="fixed right-4 top-20 z-[66] w-[min(92vw,330px)] rounded-2xl border border-[#5cffa1]/60 bg-[#0f1a1a]/95 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,.6),0_0_30px_rgba(92,255,161,.3)] backdrop-blur md:bottom-28 md:right-7 md:top-auto">
          <div className="flex items-center gap-3">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-[#ff4fd8] font-display text-sm text-[#120822]">
              MAG
              <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#5cffa1]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] tracking-[.25em] text-[#5cffa1]">{t({ tr: "GELEN ARAMA", en: "INCOMING CALL" })}</p>
              <p className="font-bold">Mehmet Ali Gül</p>
              <p className="text-xs text-white/70">{t(ring)}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={decline} className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ff3b5c] text-sm font-bold transition hover:scale-105">
              <PhoneOff className="size-4" /> {t({ tr: "Reddet", en: "Decline" })}
            </button>
            <button type="button" onClick={doOpen} className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#18b66a] text-sm font-bold transition hover:scale-105">
              <PhoneIcon className="size-4" /> {t({ tr: "Aç", en: "Answer" })}
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button ref={btn} type="button" onClick={() => { sfx("tap"); doOpen() }}
          aria-label={t({ tr: "Telefonu aç", en: "Open the phone" })}
          className="hud-phone fixed bottom-6 right-3 z-[65] grid size-12 place-items-center rounded-2xl border-2 border-[#5cffa1] bg-[#0f1a1a]/85 text-[#5cffa1] shadow-[0_0_24px_rgba(92,255,161,.45)] backdrop-blur transition hover:scale-110 md:bottom-8 md:right-8 md:size-16">
          <PhoneIcon className="size-7" />
          {badge && <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#ff3b5c] text-[11px] font-bold text-white">1</span>}
          <span className="absolute -bottom-6 whitespace-nowrap font-display text-[11px] tracking-[.2em] text-white [text-shadow:0_1px_6px_#000]">{t({ tr: "TELEFON", en: "PHONE" })}</span>
        </button>
      )}

      <Phone open={open} onClose={close} />
    </>
  )
}
