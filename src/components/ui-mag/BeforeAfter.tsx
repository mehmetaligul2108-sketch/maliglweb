// Önce/sonra kaydırıcısı: ortadaki çizgi sürüklendikçe orijinal ve düzenlenmiş görsel arasında geçiş.
import { useState } from "react"
import { MoveHorizontal } from "lucide-react"
import { useLang } from "@/lib/i18n"

export function BeforeAfter({ before, after, alt, color = "#ff4fd8" }: { before: string; after: string; alt: string; color?: string }) {
  const { t } = useLang()
  const [v, setV] = useState(50)
  return (
    <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl border-2 bg-black" style={{ borderColor: color }}>
      <img src={after} alt={`${alt} – ${t({ tr: "sonrası", en: "after" })}`} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
        <img src={before} alt={`${alt} – ${t({ tr: "öncesi", en: "before" })}`} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2" style={{ left: `${v}%`, background: color, boxShadow: `0 0 14px ${color}` }}>
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[#120822]" style={{ background: color }}>
          <MoveHorizontal className="size-5" />
        </span>
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/70 px-2 py-1 font-display text-xs tracking-[.2em] text-white">{t({ tr: "ÖNCESİ", en: "BEFORE" })}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded px-2 py-1 font-display text-xs tracking-[.2em] text-[#120822]" style={{ background: color }}>{t({ tr: "SONRASI", en: "AFTER" })}</span>
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))}
        aria-label={t({ tr: "Önce/sonra karşılaştırma kaydırıcısı", en: "Before/after comparison slider" })}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  )
}
