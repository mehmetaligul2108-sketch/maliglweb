// MAG FM radyosu (müzik, varsayılan kapalı) ve kısık ses efektleri anahtarı.
import { useEffect, useState } from "react"
import { Radio, Volume2, VolumeX } from "lucide-react"
import { useLang } from "@/lib/i18n"
import { setRadio, setSfxEnabled, sfxEnabled } from "@/lib/sound"

export function RadioWidget() {
  const { t } = useLang()
  const [on, setOn] = useState(false)
  const [fx, setFx] = useState(sfxEnabled)

  // Önceki sayfada radyo açıksa ilk dokunuşta kaldığı yerden açılır (tarayıcılar otomatik sesi engeller).
  useEffect(() => {
    let wanted = false
    try { wanted = sessionStorage.getItem("mag-radio") === "1" } catch { /* yok say */ }
    if (!wanted) return
    const resume = () => { setRadio(true); setOn(true) }
    window.addEventListener("pointerdown", resume, { once: true })
    return () => window.removeEventListener("pointerdown", resume)
  }, [])

  const toggle = () => { const v = !on; setRadio(v); setOn(v) }
  const toggleFx = () => { const v = !fx; setSfxEnabled(v); setFx(v) }

  return (
    <div className="hud-radio fixed bottom-3 left-[100px] z-[55] flex items-end gap-2 md:bottom-12 md:left-[212px]">
      <button type="button" onClick={toggle} aria-pressed={on}
        aria-label={on ? t({ tr: "MAG FM radyosunu kapat", en: "Turn MAG FM radio off" }) : t({ tr: "MAG FM radyosunu aç", en: "Turn MAG FM radio on" })}
        className={`flex h-10 items-center gap-2 rounded-full border-2 px-2.5 md:h-11 md:px-3 backdrop-blur transition hover:scale-105 ${on ? "border-[#ffe066] bg-[#2a1240]/80 text-[#ffe066] shadow-[0_0_18px_rgba(255,224,102,.5)]" : "border-white/60 bg-[#140828]/70 text-white"}`}>
        <Radio className="size-5" />
        {on && (
          <>
            <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <span key={i} className="eq-bar w-[3px] rounded bg-current" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </span>
            <span className="hidden font-display text-sm tracking-[.2em] sm:inline">MAG FM</span>
          </>
        )}
      </button>
      <button type="button" onClick={toggleFx} aria-pressed={fx}
        aria-label={fx ? t({ tr: "Ses efektlerini kapat", en: "Turn sound effects off" }) : t({ tr: "Ses efektlerini aç", en: "Turn sound effects on" })}
        className="grid size-8 place-items-center rounded-full border border-white/40 md:size-9 bg-[#140828]/70 text-white/80 backdrop-blur transition hover:scale-110">
        {fx ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      </button>
    </div>
  )
}
