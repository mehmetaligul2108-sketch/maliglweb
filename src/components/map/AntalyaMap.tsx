// Stilize Antalya haritası (SVG, 1440x900 koordinat sistemi).
// Hem tam ekran harita menüsünde hem de radarda kullanılır.
import { useEffect, useRef } from "react"
import { PAGES, PAGE_ORDER, type Lang, type PageId } from "@/lib/site"

export const MAP_W = 1440
export const MAP_H = 900

const LAND =
  "M0 0 H1440 V612 C1360 600 1280 642 1190 622 C1110 604 1030 592 955 582 C885 572 830 602 785 578 C752 560 722 572 690 560 C600 528 520 560 440 600 C360 640 262 700 160 760 C100 795 40 820 0 842 Z"
const COAST =
  "M0 842 C40 820 100 795 160 760 C262 700 360 640 440 600 C520 560 600 528 690 560 C722 572 752 560 785 578 C830 602 885 572 955 582 C1030 592 1110 604 1190 622 C1280 642 1360 600 1440 612"
const ROADS = [
  "M360 585 C 430 520 520 470 560 420 C 640 380 720 460 770 545",
  "M770 545 C 840 500 880 470 930 450 C 960 380 980 300 1000 250",
  "M930 450 C 1030 500 1150 540 1240 560",
  "M560 420 C 600 300 700 200 880 150 C 960 140 990 200 1000 250",
]

export function routePath(from: PageId, to: PageId) {
  const a = PAGES[from], b = PAGES[to]
  const mx = (a.x + b.x) / 2
  const my = Math.min(a.y, b.y) - 120 - Math.abs(a.x - b.x) * 0.08
  return `M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`
}

interface Props {
  lang: Lang
  current: PageId
  selected?: PageId | null
  onSelect?: (id: PageId) => void
  pins?: boolean
  labels?: boolean
  compact?: boolean
  animated?: boolean
}

// Bulut: birkaç yuvarlağın birleşimi (filtre yok → hafif)
function Cloud({ x, y, s = 1, dur, delay = 0 }: { x: number; y: number; s?: number; dur: number; delay?: number }) {
  const blobs = [[0, 0, 46], [44, -14, 38], [84, 4, 42], [40, 18, 40], [-34, 14, 30], [118, 18, 28]]
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`${-260 - x} 0; ${1700 - x} 0`} dur={`${dur}s`} begin={`${-delay}s`} repeatCount="indefinite" />
      <g className="map-cloud">
        <g transform={`translate(${x + 40} ${y + 70}) scale(${s})`} fill="#0b0618" opacity=".18">{blobs.map(([bx, by, r], i) => <ellipse key={i} className="cloud-shadow" cx={bx} cy={by} rx={r * 1.1} ry={r * 0.55} />)}</g>
        <g transform={`translate(${x} ${y}) scale(${s})`} fill="#f3e1ff" opacity=".34">{blobs.map(([bx, by, r], i) => <circle key={i} className="cloud-blob" cx={bx} cy={by} r={r} />)}</g>
      </g>
    </g>
  )
}

// Dalgalı deniz: periyodik dalga çizgileri sola akar, aşağı-yukarı salınır
function waveD(y: number, amp: number, len: number) {
  let d = `M -${len * 2} ${y}`
  for (let x = -len * 2; x < 1440 + len * 2; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`
  return d
}

export function AntalyaMap({ lang, current, selected, onSelect, pins = true, labels = true, compact = false, animated = false }: Props) {
  const sw = compact ? 3 : 1
  const ref = useRef<SVGSVGElement>(null)
  // SMIL animasyonları (dalga, trafik, bulut) yalnızca harita ekrandayken çalışsın
  useEffect(() => {
    const svg = ref.current
    if (!animated || !svg) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations()))
    io.observe(svg)
    return () => io.disconnect()
  }, [animated])
  return (
    <svg ref={ref} viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" height="100%" className="block" role="img"
      aria-label={lang === "tr" ? "Stilize Antalya haritası" : "Stylised map of Antalya"}>
      <defs>
        <linearGradient id="mag-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2a6b" /><stop offset="1" stopColor="#0a0f33" />
        </linearGradient>
        <linearGradient id="mag-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b1546" /><stop offset="1" stopColor="#3d1a52" />
        </linearGradient>
        <filter id="mag-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="url(#mag-sea)" />
      <g className="map-waves" stroke="#2b3f8f" strokeWidth={sw} fill="none" opacity=".55">
        <path d="M-200 700 Q 200 650 560 690 T 1240 690 T 1640 690" />
        <path d="M-200 780 Q 220 730 580 770 T 1260 770 T 1660 770" />
        <path d="M-200 860 Q 240 810 600 850 T 1280 850 T 1680 850" />
      </g>
      {animated && (
        <g className="map-sea-anim" aria-hidden="true">
          {[[660, 10, 160, 8, ".55", "#3a56c8"], [705, 12, 200, 11, ".45", "#2f49b0"], [750, 9, 140, 7, ".5", "#4a68e0"], [800, 14, 240, 13, ".35", "#2b3f8f"], [850, 10, 180, 9, ".4", "#3a56c8"], [890, 12, 220, 12, ".3", "#2b3f8f"]].map(([y, amp, len, dur, op, col], i) => (
            <g key={i}>
              <animateTransform attributeName="transform" type="translate" values={`0 0; ${-(len as number)} 0`} dur={`${dur}s`} repeatCount="indefinite" />
              <path d={waveD(y as number, amp as number, len as number)} fill="none" stroke={col as string} strokeWidth="2.5" opacity={op as string}>
                <animate attributeName="opacity" values={`${op};${Number(op) * 0.4};${op}`} dur={`${(dur as number) * 0.7}s`} repeatCount="indefinite" />
              </path>
            </g>
          ))}
          {Array.from({ length: 26 }).map((_, i) => {
            const x = (i * 211) % 1440, y = 640 + ((i * 97) % 250)
            return (
              <rect key={i} x={x} y={y} width={14 + (i % 3) * 8} height="2.5" rx="1.2" fill="#bfe9ff" opacity="0">
                <animate attributeName="opacity" values="0;.85;0" dur={`${2.2 + (i % 5) * 0.6}s`} begin={`${(i * 0.37) % 3}s`} repeatCount="indefinite" />
              </rect>
            )
          })}
        </g>
      )}
      {animated && (
        <g aria-hidden="true">
          <defs>
            <radialGradient id="mag-seaglow"><stop offset="0" stopColor="#9fe8ff" stopOpacity=".55" /><stop offset=".5" stopColor="#3ff2ff" stopOpacity=".18" /><stop offset="1" stopColor="#3ff2ff" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse className="map-seaglow" cx="-500" cy="-500" rx="120" ry="40" fill="url(#mag-seaglow)" opacity="0" />
          <g className="map-ripples" />
        </g>
      )}
      <path className="map-land" d={LAND} fill="url(#mag-land)" />
      <path className="map-coast" d={COAST} fill="none" stroke="#3ff2ff" strokeWidth={3 * sw} filter="url(#mag-glow)" />
      <g fill="#24113a" stroke="#4b2670" strokeWidth={1.5}>
        <path d="M0 330 L70 220 L130 300 L200 170 L280 290 L340 230 L420 360 L0 420 Z" />
        <path d="M0 470 L90 380 L160 450 L250 360 L330 470 L0 540 Z" opacity=".8" />
      </g>
      <g className="map-roads" fill="none" stroke="#ff4fd8" strokeWidth={2 * sw} opacity=".6">
        {ROADS.map((d) => <path key={d} d={d} />)}
      </g>
      {animated && (
        <g aria-hidden="true">
          {/* Trafik: yollarda iki yönde akan farlar */}
          {ROADS.flatMap((d, ri) => [0, 1, 2].map((k) => {
            const rev = k === 1
            const dur = 7 + ri * 1.5 + k * 1.3
            const col = rev ? "#ff3b5c" : "#fff3c4"
            return (
              <circle key={`${ri}-${k}`} r="4" fill={col} opacity=".95">
                <animateMotion dur={`${dur}s`} begin={`${-k * 2.3}s`} repeatCount="indefinite" path={d} keyPoints={rev ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
                <animate attributeName="r" values="3.2;4.6;3.2" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )
          }))}
        </g>
      )}
      <g fill="none" stroke="#7a4bb0" strokeWidth={sw} opacity=".5">
        <path d="M480 520 L 1180 520" /><path d="M640 300 L 980 620" /><path d="M820 160 L 760 560" />
      </g>
      {labels && (
        <g fontFamily="Anton, sans-serif" fontSize="22" letterSpacing="8" fill="#b98ad8" opacity=".55">
          <text x="290" y="520">KONYAALTI</text><text x="985" y="478">MURATPAŞA</text>
          <text x="1170" y="480">LARA</text><text x="730" y="230">KEPEZ</text><text x="110" y="250">BEYDAĞLARI</text>
          <text x="640" y="770" fontSize="40" letterSpacing="24" fill="#3b56b8">{lang === "tr" ? "AKDENİZ" : "MEDITERRANEAN"}</text>
        </g>
      )}
      {animated && (
        <g aria-hidden="true" pointerEvents="none">
          <Cloud x={60} y={210} s={1.2} dur={46} />
          <Cloud x={220} y={330} s={0.9} dur={58} delay={20} />
          <Cloud x={-80} y={150} s={1} dur={64} delay={38} />
          <Cloud x={600} y={120} s={0.8} dur={70} delay={10} />
        </g>
      )}
      {selected && selected !== current && (
        <path className="map-route" d={routePath(current, selected)} fill="none" stroke="#ffe066" strokeWidth="5"
          strokeLinecap="round" filter="url(#mag-glow)" />
      )}
      {pins && PAGE_ORDER.map((id) => {
        const p = PAGES[id]
        const isSel = id === selected
        const r = compact ? 18 : 22
        return (
          <g key={id} className="map-pin" data-id={id} transform={`translate(${p.x} ${p.y})`}
            role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `${p.name[lang]}: ${p.place[lang]}` : undefined}
            onClick={onSelect ? () => onSelect(id) : undefined}
            onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id) } } : undefined}
            style={{ cursor: onSelect ? "pointer" : "default", outline: "none" }}>
            <g className="map-pin-inner">
              {isSel && <circle className="map-pin-ring" r={r} fill="none" stroke={p.color} strokeWidth="3" />}
              <circle r={r} fill={p.color} filter="url(#mag-glow)" />
              <text y="7" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize={compact ? 20 : 20} fill="#120822">{p.key[lang]}</text>
              {!compact && (
                <g transform="translate(0 -46)">
                  <rect x={-p.name[lang].length * 6.5 - 14} y="-16" width={p.name[lang].length * 13 + 28} height="30" rx="6"
                    fill="rgba(11,6,24,.85)" stroke={p.color} />
                  <text y="6" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="15" letterSpacing="2" fill="#fff">
                    {p.name[lang].toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")}
                  </text>
                </g>
              )}
            </g>
          </g>
        )
      })}
      {pins && !compact && (
        <text className="map-here" x={PAGES[current].x} y={PAGES[current].y + 52} textAnchor="middle"
          fontFamily="Anton, sans-serif" fontSize="15" letterSpacing="4" fill="#ffe066">
          ▲ {lang === "tr" ? "BURADASIN" : "YOU ARE HERE"}
        </text>
      )}
    </svg>
  )
}
