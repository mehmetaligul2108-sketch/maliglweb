// Basit iki dilli (TR/EN) sistem. Seçim localStorage'da saklanır, sayfalar arasında korunur.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { PAGES, type Bi, type Lang, type PageId } from "./site"

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (b: Bi) => string
}

const Ctx = createContext<LangCtx | null>(null)

function readLang(): Lang {
  try {
    const v = localStorage.getItem("mag-lang")
    if (v === "tr" || v === "en") return v
  } catch { /* depolama kapalı olabilir */ }
  return "tr"
}

export function LangProvider({ page, children }: { page: PageId; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem("mag-lang", l) } catch { /* yok say */ }
  }, [])

  useEffect(() => {
    const p = PAGES[page]
    document.documentElement.lang = lang
    document.title = p.title[lang]
    document.querySelector('meta[name="description"]')?.setAttribute("content", p.meta[lang])
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", p.title[lang])
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", p.meta[lang])
  }, [lang, page])

  const t = useCallback((b: Bi) => b[lang], [lang])
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useLang() {
  const c = useContext(Ctx)
  if (!c) throw new Error("useLang must be used inside LangProvider")
  return c
}
