import { StrictMode, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import "@/index.css"
import { Shell } from "@/components/shell/Shell"
import type { PageId } from "@/lib/site"

document.documentElement.classList.add("dark")

export function mount(page: PageId, node: ReactNode) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Shell page={page}>{node}</Shell>
    </StrictMode>,
  )
}
