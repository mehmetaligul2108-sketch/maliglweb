// Gün batımı sahnesi: gökyüzü, güneş, uzak binalar, yakın binalar ve palmiyeler AYRI katmanlarda.
// Katmanlar ayrı olduğu için ekran kartı her birini bağımsız ve takılmadan hareket ettirebilir.
// drift=true: elde tutulan kamera gibi yavaşça aşağı-yukarı ve sağa-sola salınır (yakın katman daha çok).
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"
import gsap from "gsap"
import { LITE } from "@/lib/perf"

export const PALM = "M0 300 C 4 200 10 120 24 60 L 31 60 C 20 130 16 210 14 300 Z M27 58 C -8 34 -44 40 -66 62 C -32 50 0 52 26 66 Z M27 58 C 56 28 96 26 122 42 C 88 38 58 46 30 66 Z M27 58 C 24 18 -2 -6 -30 -12 C 2 4 18 30 25 66 Z M28 58 C 50 18 84 2 112 2 C 80 12 54 34 31 66 Z M27 60 C 10 40 -16 34 -40 42 C -14 44 6 52 25 66 Z"

export function Palm({ x, y, s = 1, flip = false, color = "#1d0a30", className = "" }: { x: number; y: number; s?: number; flip?: boolean; color?: string; className?: string }) {
  return <path className={className} d={PALM} fill={color} transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} />
}

export function Buildings({ color = "#3a1450", y = 520, lights = 0 }: { color?: string; y?: number; lights?: number }) {
  const b: [number, number, number][] = [[-120, 110, 230], [0, 70, 260], [80, 120, 200], [210, 90, 300], [310, 140, 180], [460, 110, 240], [580, 150, 150], [740, 120, 280], [870, 160, 200], [1040, 110, 260], [1160, 150, 210], [1320, 120, 250], [1450, 130, 220]]
  return (
    <g fill={color}>
      {b.map(([x, w, h]) => (
        <g key={x}>
          <rect x={x} y={y + 300 - h} width={w} height={h + 120} />
          <rect x={x + w * 0.15} y={y + 300 - h - 14} width={w * 0.7} height={16} />
          {Array.from({ length: Math.floor(h / 40) }).map((_, i) => (
            <rect key={i} x={x + 10} y={y + 300 - h + 20 + i * 40} width={w - 20} height={6} fill="#ffb3d9" opacity=".18" />
          ))}
          {Array.from({ length: Math.floor(h / 40) }).map((_, i) => (
            <rect key={"n" + i} className="scene-windows" x={x + 10 + ((i * 37 + Math.abs(x)) % Math.max(1, w - 40))} y={y + 300 - h + 20 + i * 40} width={18} height={6}
              fill={["#ff4fd8", "#3ff2ff", "#ffe066", "#5cffa1"][(i + Math.abs(x)) % 4]} opacity={lights} />
          ))}
        </g>
      ))}
    </g>
  )
}

// Her katman aynı 1440x900 koordinatlı, ekranı kaplayan ayrı bir SVG (kenarlardan taşma payı var).
function Layer({ className, children, style }: { className: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`${className} absolute -inset-x-[4%] -bottom-[3%] top-0 will-change-transform`} style={style}>
      <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">{children}</svg>
    </div>
  )
}

export function SunsetScene({ night = 0, drift = false, className = "", style }: { night?: number; drift?: boolean; className?: string; style?: CSSProperties }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mobilde salınım yok: katmanlar sabit durur (kaydırma akıcı kalır)
    if (!drift || LITE || !root.current) return
    const q = gsap.utils.selector(root)
    // Elde kamera: her katman farklı genlik ve sürede salınır → doğal, organik hareket + derinlik
    const layers: [string, number, number, number, number][] = [
      [".scene-sun", 8, 4, 7.5, 6.1],
      [".scene-far", 16, 6, 6.2, 4.9],
      [".scene-near", 34, 12, 5.4, 4.2],
      [".scene-palms", 58, 18, 4.8, 3.7],
    ]
    const tws = layers.flatMap(([sel, ax, ay, dx, dy]) => [
      gsap.fromTo(q(sel), { x: -ax }, { x: ax, duration: dx, ease: "sine.inOut", repeat: -1, yoyo: true, force3D: true }),
      gsap.fromTo(q(sel), { y: -ay }, { y: ay, duration: dy, ease: "sine.inOut", repeat: -1, yoyo: true, force3D: true }),
    ])
    tws.push(gsap.fromTo(q(".scene-cam"), { rotate: -0.35 }, { rotate: 0.35, duration: 7, ease: "sine.inOut", repeat: -1, yoyo: true }))
    // Ekranda değilken salınımı durdur (boşuna işlemci/ekran kartı harcamasın)
    const io = new IntersectionObserver(([e]) => tws.forEach((t) => (e.isIntersecting ? t.resume() : t.pause())))
    io.observe(root.current)
    return () => { io.disconnect(); tws.forEach((t) => t.kill()) }
  }, [drift])

  return (
    <div ref={root} className={`absolute inset-0 overflow-hidden ${className}`} style={style} aria-hidden="true">
      <div className="scene-cam absolute -inset-[2%]">
        <div className="scene-sky absolute inset-0" style={{ background: "linear-gradient(180deg, #2a0f5c 0%, #6b2484 32%, #c2457f 58%, #ff7a7a 74%, #ffb36b 100%)" }} />
        <div className="scene-night absolute inset-0" style={{ opacity: night, background: "linear-gradient(180deg, #05020f 0%, #120626 45%, #2a0d45 75%, #3d0f4f 100%)" }} />
        <Layer className="scene-sun" style={{ opacity: 1 - night }}>
          <circle cx="720" cy="600" r="190" fill="#ffd28a" opacity=".75" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="500" y={610 + i * 26} width="440" height={6 + i * 2} fill="#ff8a7a" opacity=".55" />)}
        </Layer>
        <Layer className="scene-far" style={{ opacity: 0.7 }}><Buildings color="#4a1a63" y={500} /></Layer>
        <Layer className="scene-near"><Buildings color="#2a0d40" y={560} lights={night} /><rect x="-200" y="855" width="1840" height="120" fill="#1d0a30" /></Layer>
        <Layer className="scene-palms">
          <Palm x={120} y={560} s={1.3} /><Palm x={300} y={620} s={1} flip />
          <Palm x={1180} y={540} s={1.4} flip /><Palm x={1340} y={610} s={1.05} />
          <rect x="-200" y="880" width="1840" height="120" fill="#1d0a30" />
        </Layer>
      </div>
    </div>
  )
}
