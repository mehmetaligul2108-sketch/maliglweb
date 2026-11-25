// Her sayfanın ortak kabuğu: dil, yumuşak kaydırma, yükleme ekranı, varış efekti, üst menü, radar, harita, radyo.
import { useCallback, useState, type ReactNode } from "react"
import { LangProvider } from "@/lib/i18n"
import { useSmoothScroll } from "@/lib/smooth-scroll"
import type { PageId } from "@/lib/site"
import { TopBar } from "./TopBar"
import { Radar } from "./Radar"
import { RadioWidget } from "./RadioWidget"
import { LoadingScreen, shouldShowLoading } from "./LoadingScreen"
import { Arrival, takeArrival } from "./Arrival"
import { MapOverlay } from "@/components/map/MapOverlay"
import { PhoneHost } from "@/components/phone/PhoneHost"
import { GlobalFx } from "./GlobalFx"

function Inner({ page, children }: { page: PageId; children: ReactNode }) {
  useSmoothScroll()
  const [loading, setLoading] = useState(shouldShowLoading)
  const [arriving, setArriving] = useState(() => takeArrival(page))
  const doneLoading = useCallback(() => setLoading(false), [])
  const doneArrival = useCallback(() => setArriving(false), [])
  return (
    <>
      <TopBar />
      <main id="main" className="relative">{children}</main>
      <Radar current={page} />
      <RadioWidget />
      <GlobalFx ready={!loading} />
      <PhoneHost />
      <MapOverlay current={page} />
      {arriving && !loading && <Arrival current={page} onDone={doneArrival} />}
      {loading && <LoadingScreen onDone={doneLoading} />}
    </>
  )
}

export function Shell({ page, children }: { page: PageId; children: ReactNode }) {
  return (
    <LangProvider page={page}>
      <Inner page={page}>{children}</Inner>
    </LangProvider>
  )
}
