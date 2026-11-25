// Three.js: synthwave neon zemin ızgarası + gün batımı güneşi. Izgara sürekli kameraya doğru akar.
import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Grid() {
  const ref = useRef<THREE.Group>(null)
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(200, 80, "#ff4fd8", "#ff4fd8")
    const m = g.material as THREE.LineBasicMaterial
    m.transparent = true; m.opacity = 0.75
    return g
  }, [])
  useFrame((_, d) => {
    if (!ref.current) return
    ref.current.position.z = (ref.current.position.z + d * 6) % 2.5
  })
  return <group ref={ref}><primitive object={grid} /></group>
}

function Sun() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        vec2 c = vUv - 0.5; float d = length(c);
        if (d > 0.5) discard;
        vec3 col = mix(vec3(1.0,0.31,0.85), vec3(1.0,0.88,0.4), vUv.y);
        float stripes = step(0.5, fract((vUv.y + uTime*0.05) * 14.0));
        float cut = vUv.y < 0.45 ? stripes : 1.0;
        gl_FragColor = vec4(col, cut);
      }`,
  }), [])
  useFrame((s) => { mat.uniforms.uTime.value = s.clock.elapsedTime })
  return <mesh position={[0, 7, -60]} material={mat}><planeGeometry args={[38, 38]} /></mesh>
}

export function SynthGrid() {
  const box = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(true)
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches)
  useEffect(() => {
    if (!box.current) return
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting))
    io.observe(box.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={box} className="h-full w-full">
    <Canvas frameloop={vis ? "always" : "never"} camera={{ position: [0, 2.2, 10], fov: 60 }} dpr={coarse ? 1 : [1, 1.6]} gl={{ antialias: !coarse, alpha: true, powerPreference: "high-performance" }}>
      <fog attach="fog" args={["#140626", 12, 70]} />
      <Sun />
      <Grid />
    </Canvas>
    </div>
  )
}
