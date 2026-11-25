// Sitede tekrar kullanılan küçük parçalar.
import type { ReactNode } from "react"
import { ArrowRight, Camera } from "lucide-react"
import { openMap } from "@/components/map/MapOverlay"
import { PAGES, type PageId } from "@/lib/site"
import { useLang } from "@/lib/i18n"
import { sfx } from "@/lib/sound"

// Başka sayfaya giden buton: haritayı açar, rotayı çizer ve yolculuğa çıkar.
export function TravelButton({ to, children, variant = "solid", className = "" }: { to: PageId; children: ReactNode; variant?: "solid" | "ghost"; className?: string }) {
  const c = PAGES[to].color
  return (
    <a href={PAGES[to].file} data-magnetic
      onClick={(e) => { e.preventDefault(); sfx("tap"); openMap(to) }}
      className={`group inline-flex h-13 items-center gap-3 rounded-xl px-6 font-display text-lg tracking-[.18em] transition hover:scale-[1.04] ${variant === "solid" ? "text-[#1a0d2e]" : "border-2 text-white backdrop-blur"} ${className}`}
      style={variant === "solid" ? { background: c, boxShadow: `0 0 26px ${c}66` } : { borderColor: c, background: "rgba(20,8,40,.55)" }}>
      {children}
      <ArrowRight className="size-5 transition group-hover:translate-x-1" />
    </a>
  )
}

export function SectionTag({ children, color = "#ffe066" }: { children: ReactNode; color?: string }) {
  return (
    <span className="inline-block -skew-x-12 px-3 py-1 font-display text-sm tracking-[.3em] text-[#1a0d2e] md:text-base" style={{ background: color }}>
      <span className="inline-block skew-x-12">{children}</span>
    </span>
  )
}

export function PhotoPlaceholder({ color, label }: { color: string; label: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden" style={{ background: `linear-gradient(160deg, #2a0f5c, ${color}aa 75%, #ffb36b)` }}>
      <svg className="absolute bottom-0 left-0 w-1/2 opacity-60" viewBox="-70 -20 200 330" aria-hidden="true">
        <path d="M0 300 C 4 200 10 120 24 60 L 31 60 C 20 130 16 210 14 300 Z M27 58 C -8 34 -44 40 -66 62 C -32 50 0 52 26 66 Z M27 58 C 56 28 96 26 122 42 C 88 38 58 46 30 66 Z M27 58 C 24 18 -2 -6 -30 -12 C 2 4 18 30 25 66 Z" fill="#1d0a30" />
      </svg>
      <div className="relative flex flex-col items-center gap-2 text-white/90">
        <Camera className="size-9" />
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </div>
    </div>
  )
}

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#07030f] px-6 pb-36 pt-10 text-center text-sm text-white/60 md:pb-12">
      <p>© 2026 Mehmet Ali Gül · {t({ tr: "Web Tasarımının Temelleri vize projesi", en: "Fundamentals of Web Design midterm project" })}</p>
      <p className="mt-1">{t({ tr: "Akdeniz Üniversitesi · Bilgisayar Programcılığı", en: "Akdeniz University · Computer Programming" })}</p>
    </footer>
  )
}
