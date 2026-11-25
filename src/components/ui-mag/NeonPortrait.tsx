// Vesikalık: tıklayınca silüetin çevresinde gerçek bir neon tüp gibi titreyerek yanan ışık konturu.
import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useLang } from "@/lib/i18n"
import { sfx } from "@/lib/sound"

export function NeonPortrait({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const { t } = useLang()
  const [on, setOn] = useState(false)
  const [used, setUsed] = useState(false)
  const toggle = () => {
    sfx(on ? "tap" : "glitch")
    setOn((v) => !v)
    setUsed(true)
  }
  return (
    <>
      <button type="button" onClick={toggle} aria-pressed={on}
        aria-label={on ? t({ tr: "Neon ışığı söndür", en: "Turn the neon off" }) : t({ tr: "Fotoğrafa neon ışık yak", en: "Light up the photo with neon" })}
        className={`absolute inset-0 cursor-pointer ${className}`}>
        <img src={src} alt={alt} draggable={false}
          className={`absolute bottom-0 left-1/2 h-[90%] w-auto max-w-none -translate-x-1/2 transition-[filter] duration-300 ${on ? "neon-portrait-on" : ""}`} />
        {on && <span className="neon-scan pointer-events-none absolute inset-0" />}
      </button>
      {!used && (
        <span className="pointer-events-none absolute left-1/2 top-4 z-10 flex -translate-x-1/2 animate-bounce items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1a0d2e]/85 px-3 py-1 text-xs font-semibold text-[#ffe066] shadow-[0_0_14px_rgba(255,224,102,.5)]">
          <Sparkles className="size-3.5" /> {t({ tr: "Fotoğrafa tıkla", en: "Click the photo" })}
        </span>
      )}
    </>
  )
}
