// Harita "kamerası": 1440x900'lük haritayı ekranda bir noktaya ortalayıp yakınlaştırır.
import { MAP_H, MAP_W } from "./AntalyaMap"

export interface Cam { cx: number; cy: number; z: number; tilt: number }

export function baseZoom() {
  return Math.max(window.innerWidth / MAP_W, window.innerHeight / MAP_H)
}

// Kamerayı harita dışına taşırmadan sınırla (yakınlaşma >= baseZoom iken).
// Nesneyi yerinde günceller (GSAP aynı nesneyi canlandırmaya devam edebilsin diye).
export function clampCam(c: Cam): Cam {
  const vw = window.innerWidth, vh = window.innerHeight
  const halfW = vw / 2 / c.z, halfH = vh / 2 / c.z
  c.cx = MAP_W <= halfW * 2 ? MAP_W / 2 : Math.min(Math.max(c.cx, halfW), MAP_W - halfW)
  c.cy = MAP_H <= halfH * 2 ? MAP_H / 2 : Math.min(Math.max(c.cy, halfH), MAP_H - halfH)
  return c
}

export function applyCam(stage: HTMLElement, tiltLayer: HTMLElement | null, c: Cam) {
  const vw = window.innerWidth, vh = window.innerHeight
  const tx = vw / 2 - c.cx * c.z
  const ty = vh / 2 - c.cy * c.z
  stage.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${c.z})`
  if (tiltLayer) tiltLayer.style.transform = `rotateX(${c.tilt}deg)`
}

export function quadPoint(ax: number, ay: number, qx: number, qy: number, bx: number, by: number, t: number) {
  const u = 1 - t
  return { x: u * u * ax + 2 * u * t * qx + t * t * bx, y: u * u * ay + 2 * u * t * qy + t * t * by }
}
