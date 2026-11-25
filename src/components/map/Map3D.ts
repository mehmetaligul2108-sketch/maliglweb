// 3D Antalya haritası (Three.js). 2D haritayla aynı 1440x900 koordinatları kullanır:
// kıyı, yollar ve sayfa noktaları birebir aynı yerdedir. Kamera, rota, bulut, deniz efektleri burada.
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import gsap from "gsap"
import { PAGES, PAGE_ORDER, type Lang, type PageId } from "@/lib/site"
import { LITE } from "@/lib/perf"

const W = 1440, H = 900, LAND_H = 16
const X = (x: number) => x - W / 2
const Z = (y: number) => y - H / 2

const COAST = "M0 842 C40 820 100 795 160 760 C262 700 360 640 440 600 C520 560 600 528 690 560 C722 572 752 560 785 578 C830 602 885 572 955 582 C1030 592 1110 604 1190 622 C1280 642 1360 600 1440 612"
const ROADS = [
  "M360 585 C 430 520 520 470 560 420 C 640 380 720 460 770 545",
  "M770 545 C 840 500 880 470 930 450 C 960 380 980 300 1000 250",
  "M930 450 C 1030 500 1150 540 1240 560",
  "M560 420 C 600 300 700 200 880 150 C 960 140 990 200 1000 250",
]
const DISTRICTS: [string, number, number][] = [["KONYAALTI", 330, 520], ["MURATPAŞA", 1060, 478], ["LARA", 1200, 488], ["KEPEZ", 760, 222], ["BEYDAĞLARI", 200, 245]]

export function supportsWebGL() {
  try {
    const c = document.createElement("canvas")
    return !!(c.getContext("webgl2") || c.getContext("webgl"))
  } catch { return false }
}

function isLowPower() {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return window.matchMedia("(pointer: coarse)").matches || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
}

// SVG yolunu DOM ile örnekle (eğriler 2D haritayla birebir aynı kalsın)
function sample(d: string, n: number): [number, number][] {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path")
  p.setAttribute("d", d); svg.appendChild(p)
  svg.style.cssText = "position:absolute;width:0;height:0;visibility:hidden"
  document.body.appendChild(svg)
  const L = p.getTotalLength(), pts: [number, number][] = []
  for (let i = 0; i <= n; i++) { const q = p.getPointAtLength((L * i) / n); pts.push([q.x, q.y]) }
  svg.remove()
  return pts
}

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

interface Opts { lang: Lang; current: PageId; onSelect?: (id: PageId) => void; onHover?: (id: PageId | null) => void; passive?: boolean }
interface PinObj { id: PageId; group: THREE.Group; ring: THREE.Mesh; gem: THREE.Mesh; beam: THREE.Mesh; halo: THREE.Sprite; drop: { y: number } }
interface Cloud { g: THREE.Group; shadow: THREE.Mesh; speed: number; puffs: THREE.Mesh[]; scattered: boolean }

export class Map3D {
  private el: HTMLElement
  private opts: Opts
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private labelScene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private composer: EffectComposer | null = null
  private low: boolean
  private raf = 0
  private running = true
  private t0 = performance.now()
  private frameTimes: number[] = []
  private lastFrame = performance.now()
  private quality = 2
  private coastPts: [number, number][]
  private coastMesh!: THREE.Mesh
  private roadMeshes: THREE.Mesh[] = []
  private cars: THREE.Mesh[] = []
  private waves: THREE.Line[] = []
  private pins: PinObj[] = []
  private labels: THREE.Sprite[] = []
  private hereLabel: THREE.Sprite | null = null
  private clouds: Cloud[] = []
  private glints: THREE.Points | null = null
  private route: THREE.Mesh | null = null
  private routeMat: THREE.ShaderMaterial | null = null
  private raycaster = new THREE.Raycaster()
  private seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  private lastRipple = { x: 0, z: 0, t: 0 }
  private ripples: THREE.Mesh[] = []
  private hovered: PageId | null = null
  private hereFade = { v: 1 }
  private lastKey = 0
  private frame = 0
  private ro: ResizeObserver
  // Kamera durumu: hedef (harita koordinatı), uzaklık çarpanı, eğim (derece; 0 = tam tepeden)
  cam = { tx: W / 2, ty: H / 2 + 40, zoom: 1, tilt: 62 }
  current: PageId
  selected: PageId | null = null
  interactive = true

  constructor(el: HTMLElement, opts: Opts) {
    this.el = el; this.opts = opts; this.current = opts.current
    this.low = isLowPower() || LITE
    seed = 7
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.low, powerPreference: "high-performance" })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, LITE ? 1 : this.low ? 1.25 : 1.6))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.domElement.style.cssText = opts.passive ? "display:block;width:100%;height:100%;pointer-events:none" : "display:block;width:100%;height:100%;touch-action:none"
    el.appendChild(this.renderer.domElement)
    this.camera = new THREE.PerspectiveCamera(38, 1, 1, 6000)
    this.scene.background = new THREE.Color("#0b0618")
    this.scene.fog = new THREE.Fog("#0b0618", 1500, 3600)
    this.coastPts = sample(COAST, 300)
    this.build()
    this.resize()
    this.buildLabels(opts.lang)
    if (!this.low) this.setupBloom()
    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(el)
    if (!opts.passive) this.bindPointer()
    document.addEventListener("visibilitychange", this.onVis)
    this.loop()
  }

  private coastY(x: number) {
    const p = this.coastPts
    const i = Math.max(0, Math.min(p.length - 1, Math.round((x / W) * (p.length - 1))))
    // kıyı noktaları x'e göre neredeyse eşit aralıklı; en yakın komşuyu düzelt
    let best = p[i]
    for (let k = Math.max(0, i - 6); k <= Math.min(p.length - 1, i + 6); k++) if (Math.abs(p[k][0] - x) < Math.abs(best[0] - x)) best = p[k]
    return best[1]
  }

  private build() {
    const s = this.scene, low = this.low
    s.add(new THREE.HemisphereLight("#8a6cff", "#0a0f33", 1.1))
    const sun = new THREE.DirectionalLight("#ffd2f4", 2.2); sun.position.set(-500, 700, 300); s.add(sun)

    // Deniz
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(W * 4, H * 5), new THREE.MeshStandardMaterial({ color: "#101a52", roughness: 0.35, metalness: 0.6 }))
    sea.rotation.x = -Math.PI / 2; sea.position.y = -2; s.add(sea)
    const waveMat = new THREE.LineBasicMaterial({ color: "#3a56c8", transparent: true, opacity: 0.55 })
    for (let k = 0; k < (LITE ? 6 : 10); k++) {
      const y0 = 650 + k * 36, pts: THREE.Vector3[] = []
      for (let x = -500; x <= W + 500; x += 10) pts.push(new THREE.Vector3(X(x), 0.5, Z(y0 + Math.sin(x / 40 + k) * 5)))
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), waveMat); l.userData.k = k
      this.waves.push(l); s.add(l)
    }
    // Deniz parıltıları (yanıp sönen ışıklar)
    {
      const n = LITE ? 24 : low ? 40 : 70, pos: number[] = [], ph: number[] = []
      for (let i = 0; i < n; i++) {
        const x = rnd() * W, y = this.coastY(x) + 30 + rnd() * 260
        pos.push(X(x), 1.5, Z(y)); ph.push(rnd() * 20)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("phase", new THREE.Float32BufferAttribute(ph, 1))
      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPx: { value: this.renderer.getPixelRatio() } },
        vertexShader: "attribute float phase; uniform float uTime; uniform float uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vA = pow(max(0.0, sin(uTime*(1.2+fract(phase)*1.5)+phase)), 6.0); gl_PointSize = uPx*900.0/-mv.z*(0.6+vA); gl_Position = projectionMatrix*mv; }",
        fragmentShader: "varying float vA; void main(){ vec2 c = gl_PointCoord-0.5; float d = length(c*vec2(0.35,1.6)); float a = smoothstep(0.5,0.0,d)*vA; gl_FragColor = vec4(0.75,0.92,1.0,a); }",
      })
      this.glints = new THREE.Points(g, m); s.add(this.glints)
    }

    // Kara
    const shape = new THREE.Shape()
    shape.moveTo(X(-900), -Z(-1600)); shape.lineTo(X(W + 900), -Z(-1600)); shape.lineTo(X(W + 900), -Z(612))
    for (let i = this.coastPts.length - 1; i >= 0; i--) shape.lineTo(X(this.coastPts[i][0]), -Z(this.coastPts[i][1]))
    shape.lineTo(X(-900), -Z(1100))
    const landGeo = new THREE.ExtrudeGeometry(shape, { depth: LAND_H, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 2 })
    const land = new THREE.Mesh(landGeo, new THREE.MeshStandardMaterial({ color: "#3a1a58", roughness: 0.85, metalness: 0.1 }))
    land.rotation.x = -Math.PI / 2; s.add(land)

    // Kıyı neon şeridi (açılışta çizilir)
    const coastCurve = new THREE.CatmullRomCurve3(this.coastPts.map(([x, y]) => new THREE.Vector3(X(x), LAND_H + 1, Z(y))))
    this.coastMesh = new THREE.Mesh(new THREE.TubeGeometry(coastCurve, LITE ? 160 : 300, 2.6, 6), new THREE.MeshBasicMaterial({ color: "#3ff2ff" }))
    s.add(this.coastMesh)

    // Dağlar
    const mtnMat = new THREE.MeshStandardMaterial({ color: "#2a1244", roughness: 0.9, flatShading: true })
    const snowMat = new THREE.MeshStandardMaterial({ color: "#e9d4ff", roughness: 0.6, flatShading: true, emissive: "#4b2670", emissiveIntensity: 0.4 })
    const mountain = (x: number, y: number, h: number, r: number) => {
      const g = new THREE.ConeGeometry(r, h, 7, 3), pa = g.attributes.position
      for (let i = 0; i < pa.count; i++) { const yy = pa.getY(i); if (yy > -h / 2 && yy < h / 2) { pa.setX(i, pa.getX(i) * (0.85 + rnd() * 0.3)); pa.setZ(i, pa.getZ(i) * (0.85 + rnd() * 0.3)) } }
      g.computeVertexNormals()
      const m = new THREE.Mesh(g, mtnMat); m.position.set(X(x), LAND_H + h / 2, Z(y)); m.rotation.y = rnd() * 3; s.add(m)
      if (h > 110) { const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.28, h * 0.28, 7), snowMat); cap.position.set(X(x), LAND_H + h * 0.86, Z(y)); s.add(cap) }
    }
    for (let i = 0; i < 34; i++) { const x = 10 + rnd() * 420, y = 140 + rnd() * 380; if (y > this.coastY(x) - 70) continue; mountain(x, y, 60 + rnd() * 120 * (1 - y / 700), 45 + rnd() * 40) }
    for (let i = 0; i < (LITE ? 22 : low ? 40 : 70); i++) { const x = -500 + rnd() * 2400, y = -800 + rnd() * 860; mountain(x, y, 50 + rnd() * 90, 50 + rnd() * 40) }
    for (let i = 0; i < 14; i++) { const x = -500 + rnd() * 480, y = 200 + rnd() * 500; if (y > this.coastY(Math.max(0, x)) - 60) continue; mountain(x, y, 60 + rnd() * 80, 50 + rnd() * 40) }

    // Şehir blokları
    const bGeo = new THREE.BoxGeometry(1, 1, 1); bGeo.translate(0, 0.5, 0)
    const cols = ["#ff4fd8", "#3ff2ff", "#ffe066", "#b07bff"]
    // Her şehir kümesi bir sayfa noktasını ortalar (nokta binaların tam ortasında)
    const centers = [[770, 535, 150], [930, 445, 140], [1240, 548, 130], [560, 420, 115], [370, 570, 95], [1000, 255, 120]]
    const N = LITE ? 380 : low ? 550 : 1100
    const bm = new THREE.InstancedMesh(bGeo, new THREE.MeshLambertMaterial({ color: "#ffffff" }), N)
    const tmp = new THREE.Object3D(), col = new THREE.Color(), tops: number[] = [], topCols: number[] = []
    let n = 0
    for (let t = 0; t < 30000 && n < N; t++) {
      const c = centers[Math.floor(rnd() * centers.length)]
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * c[2]
      const x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r * 0.7
      if (y > this.coastY(x) - 12) continue
      if (PAGE_ORDER.some((id) => Math.hypot(PAGES[id].x - x, PAGES[id].y - y) < 28)) continue
      const near = 1 - r / c[2], h = 6 + rnd() * 18 + near * near * 55
      tmp.position.set(X(x), LAND_H, Z(y)); tmp.scale.set(7 + rnd() * 7, h, 7 + rnd() * 7); tmp.updateMatrix()
      bm.setMatrixAt(n, tmp.matrix)
      col.set(rnd() < 0.6 ? "#6a3fa0" : cols[Math.floor(rnd() * 4)]).multiplyScalar(rnd() < 0.5 ? 1 : 0.6)
      bm.setColorAt(n, col)
      tops.push(X(x), LAND_H + h + 1.5, Z(y)); col.set(cols[n % 4]); topCols.push(col.r, col.g, col.b)
      n++
    }
    bm.count = n; s.add(bm)
    const tg = new THREE.BufferGeometry()
    tg.setAttribute("position", new THREE.Float32BufferAttribute(tops, 3)); tg.setAttribute("color", new THREE.Float32BufferAttribute(topCols, 3))
    s.add(new THREE.Points(tg, new THREE.PointsMaterial({ size: 3.2, vertexColors: true })))

    // Yollar + trafik
    ROADS.forEach((d, ri) => {
      const c = new THREE.CatmullRomCurve3(sample(d, 100).map(([x, y]) => new THREE.Vector3(X(x), LAND_H + 2.6, Z(y))))
      const m = new THREE.Mesh(new THREE.TubeGeometry(c, 160, 2.2, 5), new THREE.MeshBasicMaterial({ color: "#ff4fd8", transparent: true, opacity: 0.9 }))
      this.roadMeshes.push(m); s.add(m)
      for (let k = 0; k < (LITE ? 3 : low ? 4 : 7); k++) {
        const car = new THREE.Mesh(new THREE.SphereGeometry(2.6, 6, 6), new THREE.MeshBasicMaterial({ color: k % 2 ? "#ff3b5c" : "#fff3c4" }))
        car.userData = { c, t: (k / 7 + ri * 0.13) % 1, s: (k % 2 ? -1 : 1) * (0.03 + 0.01 * (k % 3)) }
        this.cars.push(car); s.add(car)
      }
    })

    // Sayfa noktaları
    const haloTex = (() => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 128
      const g = cv.getContext("2d")!, gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)")
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
      return new THREE.CanvasTexture(cv)
    })()
    PAGE_ORDER.forEach((id) => {
      const p = PAGES[id], c = p.color
      const g = new THREE.Group(); g.position.set(X(p.x), LAND_H, Z(p.y))
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(3, 7, 150, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }))
      beam.position.y = 75; g.add(beam)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 6, 24), new THREE.MeshBasicMaterial({ color: c })); base.position.y = 3; g.add(base)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(26, 1.8, 6, 40), new THREE.MeshBasicMaterial({ color: c, transparent: true })); ring.rotation.x = Math.PI / 2; ring.position.y = 2; g.add(ring)
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(11), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4, flatShading: true })); gem.position.y = 58; g.add(gem)
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: c, transparent: true, opacity: this.low ? 0.9 : 0.45, depthWrite: false, blending: THREE.AdditiveBlending }))
      halo.scale.set(90, 90, 1); halo.position.y = 10; g.add(halo)
      // Tıklama alanı (görünmez, geniş)
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 170, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 80; hit.userData.pin = id; g.add(hit)
      this.pins.push({ id, group: g, ring, gem, beam, halo, drop: { y: 0 } }); s.add(g)
    })

    // Bulutlar (dağların üstünde süzülür, gölgesi yere düşer)
    const cloudMat = new THREE.MeshLambertMaterial({ color: "#f3e1ff", emissive: "#5a3a7a", transparent: true, opacity: 0.78, flatShading: true })
    const shadowMat = new THREE.MeshBasicMaterial({ color: "#0b0618", transparent: true, opacity: 0.22, depthWrite: false })
    const puffGeo = new THREE.IcosahedronGeometry(1, 1)
    const defs: [number, number, number, number][] = [[60, 230, 1.25, 9], [260, 360, 0.9, 7], [-160, 150, 1.05, 6], [640, 110, 0.85, 5.5], [1100, 200, 1, 6.5]]
    ;(LITE ? defs.slice(0, 3) : defs).forEach(([x, y, sc, sp]) => {
      const g = new THREE.Group(), puffs: THREE.Mesh[] = []
      const blobs = [[0, 0, 46], [44, -14, 38], [84, 4, 42], [40, 18, 40], [-34, 14, 30], [118, 18, 28]].slice(0, LITE ? 4 : 6)
      blobs.forEach(([bx, bz, r]) => {
        const m = new THREE.Mesh(puffGeo, cloudMat); m.scale.set(r, r * 0.62, r); m.position.set(bx, 0, bz); m.userData.home = m.position.clone()
        g.add(m); puffs.push(m)
      })
      g.scale.setScalar(sc); g.position.set(X(x), 175 + rnd() * 40, Z(y))
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 24), shadowMat)
      shadow.rotation.x = -Math.PI / 2; shadow.scale.set(110 * sc, 50 * sc, 1); shadow.position.set(g.position.x + 60, LAND_H + 1.2, g.position.z + 40)
      s.add(g); s.add(shadow)
      this.clouds.push({ g, shadow, speed: sp, puffs, scattered: false })
    })
  }

  private labelTex(text: string, color: string, size: number, bg: boolean) {
    const cv = document.createElement("canvas"), ctx = cv.getContext("2d")!
    const font = `${size * 2}px Anton, Impact, sans-serif`
    ctx.font = font
    const w = Math.ceil(ctx.measureText(text).width + size * 2), h = Math.ceil(size * 3.2)
    cv.width = w; cv.height = h; ctx.font = font
    if (bg) { ctx.fillStyle = "rgba(11,6,24,.88)"; ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(3, 3, w - 6, h - 6, 14); ctx.fill(); ctx.stroke() }
    ctx.fillStyle = bg ? "#fff" : color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, w / 2, h / 2 + 2)
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
    return { tex, w, h }
  }

  private label(text: string, color: string, size = 26, bg = true) {
    const { tex, w, h } = this.labelTex(text, color, size, bg)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false }))
    const k = this.portrait() ? 2.1 : 3.2
    sp.scale.set(w / k, h / k, 1); sp.renderOrder = 10
    return sp
  }

  private portrait() { return this.camera.aspect < 1 }
  private lang: Lang = "tr"

  buildLabels(lang: Lang) {
    this.lang = lang
    this.labels.forEach((l) => { l.material.map?.dispose(); l.material.dispose(); this.labelScene.remove(l) })
    this.labels = []
    const up = (s: string) => s.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US")
    this.pins.forEach((p) => {
      const pg = PAGES[p.id]
      const l = this.label(up(pg.name[lang]), pg.color)
      l.userData = { pin: p.id, baseY: LAND_H + 112 }
      l.position.set(X(pg.x), LAND_H + 112, Z(pg.y)); this.labels.push(l); this.labelScene.add(l)
    })
    DISTRICTS.forEach(([t, x, y]) => { const l = this.label(t, "#c79bf0", 18); l.position.set(X(x), LAND_H + 30, Z(y)); this.labels.push(l); this.labelScene.add(l) })
    const sea = this.label(lang === "tr" ? "AKDENİZ" : "MEDITERRANEAN", "#4a68e0", 46, false); sea.position.set(X(720), 30, Z(790)); this.labels.push(sea); this.labelScene.add(sea)
    const cur = PAGES[this.current]
    this.hereLabel = this.label(lang === "tr" ? "▲ BURADASIN" : "▲ YOU ARE HERE", "#ffe066", 20)
    this.hereLabel.position.set(X(cur.x), LAND_H + 4, Z(cur.y) + 48); this.labels.push(this.hereLabel); this.labelScene.add(this.hereLabel)
  }

  private setupBloom() {
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.45, 0.8))
    this.composer.addPass(new OutputPass())
    this.pins.forEach((p) => { (p.halo.material as THREE.SpriteMaterial).opacity = 0.45 })
  }

  private dropBloom() {
    if (!this.composer) return
    this.composer.dispose(); this.composer = null
    this.pins.forEach((p) => { (p.halo.material as THREE.SpriteMaterial).opacity = 0.9 })
  }

  resize() {
    const w = this.el.clientWidth || window.innerWidth, h = this.el.clientHeight || window.innerHeight
    this.renderer.setSize(w, h, false)
    this.composer?.setSize(w, h)
    const wasPortrait = this.camera.aspect < 1
    this.camera.aspect = w / h
    // Dikey ekranda harita üst kısımda dursun (alttaki kart haritayı örtmesin)
    if (w < h) this.camera.setViewOffset(w, h, 0, h * 0.14, w, h)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
    if (wasPortrait !== (w < h) && this.labels.length) this.buildLabels(this.lang)
    this.clampCam()
  }

  // Ekrana sığacak taban uzaklık: yatayda haritanın tamamı, dikey ekranda yaklaşık 620 birim
  private baseDist() {
    const a = this.camera.aspect, f = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const wantW = a >= 1 ? 1340 : 560, wantH = a >= 1 ? 760 : 900
    return Math.max(wantW / (2 * f * a), a >= 1 ? wantH / (2 * f) : 0)
  }

  visibleHalfW() {
    const f = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    return (this.baseDist() / this.cam.zoom) * f * this.camera.aspect
  }

  clampCam() {
    const c = this.cam, hw = Math.min(this.visibleHalfW(), W / 2)
    c.tx = Math.min(Math.max(c.tx, hw - 40), W - hw + 40)
    c.ty = Math.min(Math.max(c.ty, 120), this.portrait() ? 560 : 760)
  }

  private applyCam() {
    const c = this.cam
    const d = this.baseDist() / c.zoom
    const th = THREE.MathUtils.degToRad(Math.max(4, 18 + c.tilt * 0.72))
    const target = new THREE.Vector3(X(c.tx), 0, Z(c.ty))
    this.camera.position.set(target.x, d * Math.cos(th), target.z + d * Math.sin(th))
    this.camera.lookAt(target)
  }

  // Ekrandaki bir noktanın haritadaki karşılığı (deniz düzlemi)
  private toMap(cx: number, cy: number) {
    const r = this.el.getBoundingClientRect()
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
    this.raycaster.setFromCamera(ndc, this.camera)
    const hit = new THREE.Vector3()
    if (!this.raycaster.ray.intersectPlane(this.seaPlane, hit)) return null
    return { x: hit.x + W / 2, y: hit.z + H / 2, ndc }
  }

  private pickPin(cx: number, cy: number): PageId | null {
    const r = this.el.getBoundingClientRect()
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
    this.raycaster.setFromCamera(ndc, this.camera)
    const lab = this.raycaster.intersectObjects(this.labels.filter((l) => l.userData.pin), false)
    if (lab.length) return lab[0].object.userData.pin as PageId
    const hits = this.raycaster.intersectObjects(this.pins.map((p) => p.group), true)
    const h = hits.find((x) => x.object.userData.pin)
    return h ? (h.object.userData.pin as PageId) : null
  }

  private drag: { x: number; y: number; moved: boolean; id: number } | null = null
  private bindPointer() {
    const c = this.renderer.domElement
    c.addEventListener("pointerdown", this.onDown)
    c.addEventListener("pointermove", this.onMove)
    c.addEventListener("pointerup", this.onUp)
    c.addEventListener("pointercancel", this.onCancel)
    c.addEventListener("pointerleave", this.onLeave)
  }
  private onDown = (e: PointerEvent) => { this.drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId } }
  private onMove = (e: PointerEvent) => {
    if (!this.interactive) return
    const d = this.drag
    if (d) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y
      if (d.moved || Math.hypot(dx, dy) > 7) {
        if (!d.moved) { d.moved = true; try { this.renderer.domElement.setPointerCapture(d.id) } catch { /* yok say */ } }
        d.x = e.clientX; d.y = e.clientY
        const k = (this.baseDist() / this.cam.zoom) / (this.el.clientHeight * 0.85)
        this.cam.tx -= dx * k; this.cam.ty -= dy * k * 1.3
        this.clampCam()
        return
      }
    }
    if (e.pointerType === "mouse") {
      const id = this.pickPin(e.clientX, e.clientY)
      if (id !== this.hovered) { this.hovered = id; this.renderer.domElement.style.cursor = id ? "pointer" : "grab"; this.opts.onHover?.(id) }
      this.seaFx(e.clientX, e.clientY)
    }
  }
  private onUp = (e: PointerEvent) => {
    const d = this.drag; this.drag = null
    if (!d || d.moved || !this.interactive) return
    const id = this.pickPin(e.clientX, e.clientY)
    if (id) this.opts.onSelect?.(id)
    else this.seaFx(e.clientX, e.clientY, true)
  }
  private onCancel = () => { this.drag = null }
  private onLeave = (e: PointerEvent) => { if (e.pointerType === "mouse") this.drag = null }

  // İmleç denizde: halkalar açılır; bulutun altında: bulut dağılır
  private seaFx(cx: number, cy: number, force = false) {
    const m = this.toMap(cx, cy)
    if (!m) return
    // Bulut dağılması
    this.raycaster.setFromCamera(m.ndc, this.camera)
    for (const cl of this.clouds) {
      if (cl.scattered) continue
      if (this.raycaster.intersectObjects(cl.puffs, false).length) this.scatter(cl)
    }
    const onSea = m.y > this.coastY(Math.min(W, Math.max(0, m.x))) + 6
    const L = this.lastRipple, now = performance.now()
    if (!onSea || (!force && (Math.hypot(m.x - L.x, m.y - L.z) < 70 || now - L.t < 320))) return
    L.x = m.x; L.z = m.y; L.t = now
    for (let k = 0; k < 2; k++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: k ? "#3ff2ff" : "#bfe9ff", transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }))
      ring.rotation.x = -Math.PI / 2; ring.position.set(X(m.x), 1.2, Z(m.y)); ring.scale.set(4, 4, 1)
      this.scene.add(ring); this.ripples.push(ring)
      const mat = ring.material as THREE.MeshBasicMaterial
      gsap.to(ring.scale, { x: k ? 140 : 95, y: k ? 140 : 95, duration: k ? 3.4 : 2.6, delay: k * 0.35, ease: "sine.out" })
      gsap.to(mat, { opacity: 0, duration: k ? 3.4 : 2.6, delay: k * 0.35, ease: "sine.out", onComplete: () => { this.scene.remove(ring); ring.geometry.dispose(); mat.dispose(); this.ripples = this.ripples.filter((r) => r !== ring) } })
    }
  }

  private scatter(cl: Cloud) {
    cl.scattered = true
    cl.puffs.forEach((p, i) => {
      gsap.to(p.position, { x: p.userData.home.x + (i % 2 ? 1 : -1) * (60 + rnd() * 80), z: p.userData.home.z + (rnd() - 0.5) * 120, y: (rnd() - 0.3) * 60, duration: 0.9, ease: "power3.out" })
      gsap.to(p.position, { x: p.userData.home.x, y: 0, z: p.userData.home.z, duration: 2.2, delay: 2.6, ease: "power2.inOut" })
    })
    gsap.to(cl.shadow.material as THREE.MeshBasicMaterial, { opacity: 0, duration: 0.6, yoyo: true, repeat: 1, repeatDelay: 2.6 })
    gsap.delayedCall(5, () => { cl.scattered = false })
  }

  // Açılış: eğik harita düzleşir, kıyı çizilir, yollar belirir, işaretler düşer.
  intro(tl: gsap.core.Timeline) {
    const coastGeo = this.coastMesh.geometry as THREE.TubeGeometry
    const total = coastGeo.index ? coastGeo.index.count : 0
    const prog = { v: 0 }
    coastGeo.setDrawRange(0, 0)
    this.roadMeshes.forEach((m) => { (m.material as THREE.MeshBasicMaterial).opacity = 0 })
    this.pins.forEach((p) => { p.drop.y = 260; p.group.scale.setScalar(0.001) })
    this.labels.forEach((l) => { l.material.opacity = 0 })
    tl.to(this.cam, { tilt: 0, zoom: 1, duration: 1.8, ease: "power3.out", onUpdate: () => this.clampCam() }, 0)
      .to(prog, { v: 1, duration: 1.6, ease: "power2.inOut", onUpdate: () => coastGeo.setDrawRange(0, Math.floor((total * prog.v) / 6) * 6) }, 0.2)
      .to(this.roadMeshes.map((m) => m.material), { opacity: 0.9, duration: 0.6, stagger: 0.12 }, 0.6)
    this.pins.forEach((p, i) => {
      tl.to(p.group.scale, { x: 1, y: 1, z: 1, duration: 0.12, ease: "none" }, 0.7 + i * 0.09)
        .to(p.drop, { y: 0, duration: 0.7, ease: "bounce.out" }, 0.7 + i * 0.09)
    })
    this.hereFade.v = 0
    tl.to(this.labels.filter((l) => l !== this.hereLabel).map((l) => l.material), { opacity: 1, duration: 0.5, stagger: 0.04 }, 1.0)
      .to(this.hereFade, { v: 1, duration: 0.3 }, 1.5)
  }

  // Hedef seçimi: rota yay şeklinde çizilir, işaret zıplar
  select(id: PageId | null) {
    this.selected = id
    if (this.route) { this.scene.remove(this.route); this.route.geometry.dispose(); this.routeMat?.dispose(); this.route = null }
    if (!id) return
    const pin = this.pins.find((p) => p.id === id)
    if (pin) gsap.fromTo(pin.drop, { y: 0 }, { y: 24, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" })
    if (id === this.current) return
    const a = PAGES[this.current], b = PAGES[id]
    const A = new THREE.Vector3(X(a.x), LAND_H + 6, Z(a.y)), B = new THREE.Vector3(X(b.x), LAND_H + 6, Z(b.y))
    const M = A.clone().add(B).multiplyScalar(0.5); M.y += 60 + A.distanceTo(B) * 0.25
    const curve = new THREE.QuadraticBezierCurve3(A, M, B)
    this.routeMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, toneMapped: false,
      uniforms: { uProg: { value: 0 }, uTime: { value: 0 }, uFlow: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "varying vec2 vUv; uniform float uProg; uniform float uTime; uniform float uFlow; void main(){ if (vUv.x > uProg) discard; float dash = mix(1.0, step(0.38, fract(vUv.x*26.0 - uTime*1.6)), uFlow); if (dash < 0.5) discard; gl_FragColor = vec4(1.0, 0.88, 0.4, 1.0); }",
    })
    this.route = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 3.2, 6), this.routeMat)
    this.route.renderOrder = 5
    this.scene.add(this.route)
    const u = this.routeMat.uniforms
    gsap.to(u.uProg, { value: 1, duration: 0.9, ease: "power2.inOut", onComplete: () => { gsap.to(u.uFlow, { value: 1, duration: 0.3 }) } })
  }

  // Yolculuk: kamera hedefe süzülür ve yakınlaşır (zaman çizelgesine eklenir)
  flyTo(id: PageId, tl: gsap.core.Timeline, at = 0) {
    const b = PAGES[id]
    this.interactive = false
    tl.to(this.cam, { tx: b.x, ty: b.y, zoom: 2.6, tilt: 30, duration: 1.3, ease: "power2.inOut" }, at)
      .to(this.cam, { zoom: 5.5, tilt: 10, duration: 0.55, ease: "power2.in" }, at + 1.3)
  }

  focusX(x: number, dur = 0.8) {
    gsap.to(this.cam, { tx: x, duration: dur, ease: "power2.inOut", onUpdate: () => this.clampCam() })
  }

  setLang(lang: Lang) { this.buildLabels(lang) }

  // Bölüm ekranda değilken çizimi durdur
  private active = true
  setActive(on: boolean) {
    if (on === this.active) return
    this.active = on
    if (!on) { this.running = false; cancelAnimationFrame(this.raf) }
    else if (!document.hidden) { this.running = true; this.lastFrame = performance.now(); this.loop() }
  }

  private onVis = () => {
    if (document.hidden) { this.running = false; cancelAnimationFrame(this.raf) }
    else if (!this.running && this.active) { this.running = true; this.lastFrame = performance.now(); this.loop() }
  }

  // Kare süresi uzarsa kaliteyi kendiliğinden düşür (kasmayı önler)
  private adapt(dt: number) {
    if (this.quality === 0) return
    this.frameTimes.push(dt)
    if (this.frameTimes.length < 50) return
    const s = [...this.frameTimes].sort((a, b) => a - b), med = s[s.length >> 1]
    this.frameTimes = []
    if (med > 22) {
      if (this.composer) this.dropBloom()
      else if (this.renderer.getPixelRatio() > 1) { this.renderer.setPixelRatio(1); this.resize() }
      else this.quality = 0
      this.quality = Math.max(0, this.quality - 1)
    } else if (med < 17.5 && this.quality === 2) this.quality = 0 // akıcı: ölçümü bırak
  }

  private loop = () => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now(), dt = now - this.lastFrame
    this.lastFrame = now
    this.adapt(dt)
    const t = (now - this.t0) / 1000, k = Math.min(dt, 50) / 16.67
    this.cars.forEach((m) => { const u = m.userData; u.t = (u.t + u.s * 0.016 * k + 1) % 1; m.position.copy(u.c.getPointAt(u.t)); m.position.y += 1 })
    this.pins.forEach((p, i) => {
      p.group.position.y = LAND_H + p.drop.y
      p.gem.rotation.y = t * 1.5 + i
      p.gem.position.y = 58 + Math.sin(t * 2 + i) * 5
      const sel = p.id === this.selected || p.id === this.hovered
      const ph = (t * 0.6 + i * 0.2) % 1, s = 1 + ph * 0.8
      p.ring.scale.set(s, s, s); (p.ring.material as THREE.MeshBasicMaterial).opacity = sel ? 1 : 1 - ph * 0.7
      p.beam.scale.x = p.beam.scale.z = sel ? 1.8 : 1
    })
    this.labels.forEach((l) => { if (l.userData.pin) { const p = this.pins.find((x) => x.id === l.userData.pin)!; l.position.y = l.userData.baseY + p.drop.y } })
    if (this.hereLabel) this.hereLabel.material.opacity = this.hereFade.v * (0.55 + 0.45 * Math.abs(Math.sin(t * 2)))
    this.waves.forEach((l) => { l.position.x = ((t * 14 + l.userData.k * 9) % 40) - 20; l.position.z = Math.sin(t * 0.8 + l.userData.k) * 3 })
    if (this.glints) (this.glints.material as THREE.ShaderMaterial).uniforms.uTime.value = t
    if (this.routeMat) this.routeMat.uniforms.uTime.value = t
    this.clouds.forEach((cl) => {
      cl.g.position.x += cl.speed * 0.016 * k
      if (cl.g.position.x > X(W + 500)) cl.g.position.x = X(-500)
      cl.shadow.position.x = cl.g.position.x + 60
    })
    // Mobilde kamera duruyorken saniyede 30 kare yeter (pil ve akıcılık); kamera hareket ederken her kare çizilir
    const c = this.cam, key = c.tx * 7 + c.ty * 13 + c.zoom * 1e4 + c.tilt * 31
    const moving = key !== this.lastKey
    this.lastKey = key
    this.frame++
    if (LITE && !moving && this.frame % 2) return
    this.applyCam()
    if (this.composer) this.composer.render()
    else this.renderer.render(this.scene, this.camera)
    this.renderer.autoClear = false
    this.renderer.clearDepth()
    this.renderer.render(this.labelScene, this.camera)
    this.renderer.autoClear = true
  }

  dispose() {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    document.removeEventListener("visibilitychange", this.onVis)
    gsap.killTweensOf(this.cam)
    const c = this.renderer.domElement
    c.removeEventListener("pointerdown", this.onDown); c.removeEventListener("pointermove", this.onMove)
    c.removeEventListener("pointerup", this.onUp); c.removeEventListener("pointercancel", this.onCancel); c.removeEventListener("pointerleave", this.onLeave)
    const free = (o: THREE.Object3D) => o.traverse((x) => {
      const m = x as THREE.Mesh
      m.geometry?.dispose?.()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      mats.forEach((mm: THREE.Material & { map?: THREE.Texture | null }) => { mm.map?.dispose(); mm.dispose() })
    })
    free(this.scene); free(this.labelScene)
    this.composer?.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    c.remove()
  }
}
