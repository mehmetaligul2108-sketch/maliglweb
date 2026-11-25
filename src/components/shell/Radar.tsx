// Sol alttaki radar: haritanın silik silueti, sayfanın konumuna ortalı, dönen tarama ışını.
import { AntalyaMap } from "@/components/map/AntalyaMap"
import { openMap } from "@/components/map/MapOverlay"
import { useLang } from "@/lib/i18n"
import { PAGES, type PageId } from "@/lib/site"
import { sfx } from "@/lib/sound"

export function Radar({ current }: { current: PageId }) {
  const { lang, t } = useLang()
  const p = PAGES[current]
  const SIZE = 1440 * 0.34 // haritanın radardaki ölçeği
  return (
    <>
    {/* Telefonda alt panelin arkasında koyu geçiş: yazılar düğmelerle karışmasın */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[54] h-[110px] md:hidden hud-fade" style={{ background: "linear-gradient(0deg, #0b0618 0%, rgba(11,6,24,.8) 50%, rgba(11,6,24,0) 100%)" }} />
    <div className="hud-radar-box fixed bottom-3 left-3 z-[55] flex flex-col items-center gap-1.5 md:bottom-7 md:left-7">
      <button type="button" onClick={() => { sfx("tap"); openMap() }}
        aria-label={t({ tr: "Radar: büyük haritayı aç", en: "Radar: open the big map" })}
        className="relative size-[84px] overflow-hidden rounded-full border-4 border-[#1d0a30] bg-[#0d1230] shadow-[0_0_0_2px_#ff4fd8,0_0_28px_rgba(255,79,216,.55)] transition hover:scale-105 md:size-[170px] hud-radar" style={{ contain: "strict" }}>
        <div className="absolute left-1/2 top-1/2 opacity-50"
          style={{ width: SIZE, height: SIZE * 900 / 1440, transform: `translate(${-p.x * 0.34}px, ${-p.y * 0.34}px) scale(var(--radar-scale, 1))`, transformOrigin: `${p.x * 0.34}px ${p.y * 0.34}px` }}>
          <AntalyaMap lang={lang} current={current} pins labels={false} compact />
        </div>
        <div className="absolute inset-[22%] rounded-full border border-white/10" />
        <div className="radar-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(255,79,216,.35), rgba(255,79,216,0) 70deg, transparent 360deg)" }} />
        <svg className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_6px_#fff]" viewBox="0 0 20 22" aria-hidden="true">
          <path d="M10 0 L20 22 L10 17 L0 22 Z" fill="#fff" />
        </svg>
      </button>
      <span className="hidden max-w-[190px] truncate font-display text-[12px] tracking-[.2em] text-white [text-shadow:0_1px_6px_#000] md:block hud-radar-label">
        {t(p.place).toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")} · {t(p.name).toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")}
      </span>
    </div>
    </>
  )
}
