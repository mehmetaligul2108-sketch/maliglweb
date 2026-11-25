import type { PageId } from "@/lib/site"

export const OPEN_MAP_EVENT = "mag:open-map"
// target verilirse harita açılır, rota çizilir ve otomatik olarak yolculuğa çıkılır.
export const openMap = (target?: PageId) => window.dispatchEvent(new CustomEvent(OPEN_MAP_EVENT, { detail: { target } }))
