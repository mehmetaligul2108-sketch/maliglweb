import { useRef } from "react"
import gsap from "gsap"
import { Map as MapIcon } from "lucide-react"
import { useLang } from "@/lib/i18n"
import { openMap } from "@/components/map/MapOverlay"
import { sfx } from "@/lib/sound"
import type { Lang } from "@/lib/site"

export function TopBar() {
  const { lang, setLang, t } = useLang()
  const sign = useRef<HTMLButtonElement>(null)

  const switchLang = () => {
    const next: Lang = lang === "tr" ? "en" : "tr"
    sfx("glitch")
    // Neon arızası: tabela titreyerek yanar, sayfa yazıları solup yeni dile geçer.
    const tl = gsap.timeline()
    tl.to(sign.current, { opacity: 0.2, duration: 0.05, repeat: 5, yoyo: true })
      .to("main", { opacity: 0, duration: 0.18 }, 0)
      .add(() => setLang(next))
      .to("main", { opacity: 1, duration: 0.35 })
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-4 py-3 md:px-10 md:py-5">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[84px] md:hidden hud-fade" style={{ background: "linear-gradient(180deg, #0b0618 0%, rgba(11,6,24,.85) 55%, rgba(11,6,24,0) 100%)" }} />
      <a href="index.html" className="pointer-events-auto font-neon text-2xl tracking-[.15em] text-white md:text-3xl"
        style={{ textShadow: "0 0 12px #ff4fd8, 0 0 28px #ff4fd8" }} aria-label={t({ tr: "Anasayfa", en: "Home" })}>
        MAG
      </a>
      <div className="pointer-events-auto flex items-center gap-3">
        <button ref={sign} type="button" onClick={switchLang}
          aria-label={t({ tr: "Dili İngilizce yap", en: "Switch language to Turkish" })}
          className="flex h-11 items-center gap-2 rounded-lg border-2 border-[#ff4fd8] bg-[#140828]/70 px-3 font-display text-base tracking-[.2em] shadow-[0_0_14px_rgba(255,79,216,.6),inset_0_0_10px_rgba(255,79,216,.35)] backdrop-blur transition hover:scale-105">
          <span className={lang === "tr" ? "text-[#ffe066] [text-shadow:0_0_10px_#ffe066]" : "text-white/35"}>TR</span>
          <span className="text-[#ff4fd8]">|</span>
          <span className={lang === "en" ? "text-[#ffe066] [text-shadow:0_0_10px_#ffe066]" : "text-white/35"}>EN</span>
        </button>
        <button type="button" onClick={() => { sfx("tap"); openMap() }} aria-label={t({ tr: "Haritayı aç", en: "Open map" })}
          className="grid size-11 place-items-center rounded-lg border-2 border-white/80 bg-[#140828]/70 text-white backdrop-blur transition hover:scale-110 hover:border-[#ffe066] hover:text-[#ffe066]">
          <MapIcon className="size-5" />
        </button>
      </div>
    </header>
  )
}
