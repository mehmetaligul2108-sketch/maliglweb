// Grafik Animasyon I dersi Photoshop projeleri (görseller: src/assets/projeler).
import p1a from "@/assets/projeler/proje1-oncesi.jpg"
import p1b from "@/assets/projeler/Proje1-sonrasi.jpg"
import p2a from "@/assets/projeler/proje2-oncesi.jpg"
import p2b from "@/assets/projeler/Proje2-sonrasi.jpg"
import p3a from "@/assets/projeler/proje3-oncesi.jpg"
import p3b from "@/assets/projeler/Proje3-sonrasi.jpg"
import p4a from "@/assets/projeler/Proje4-smart-object-oncesi.jpg"
import p4b from "@/assets/projeler/Proje4-smart-object-sonrasi.jpg"
import p4la from "@/assets/projeler/Proje4-smart-object-logo-oncesi.jpg"
import p4lb from "@/assets/projeler/Proje4-smart-object-logo-sonrasi.jpg"
import p5a from "@/assets/projeler/proje5-oncesi.jpg"
import p5b from "@/assets/projeler/Proje5-sonrasi.jpg"
import p6a from "@/assets/projeler/proje6-oncesi.jpg"
import p6b from "@/assets/projeler/Proje6-sonrasi.jpg"
import p6e from "@/assets/projeler/Proje6-eskiz.jpg"
import p6d2 from "@/assets/projeler/Proje6-duzen2.jpg"
import p6d3 from "@/assets/projeler/Proje6-duzen3.jpg"
import type { Bi } from "./site"

export interface Compare { before: string; after: string; label?: Bi }
export interface Project {
  no: number
  slug: string
  title: Bi
  technique: Bi
  desc: Bi
  color: string
  cover: string
  compares: Compare[]
  extra?: { src: string; label: Bi }[]
}

export const PROJECTS: Project[] = [
  {
    no: 1, slug: "history-brush", color: "#ff4fd8", cover: p1b,
    title: { tr: "History Brush", en: "History Brush" },
    technique: { tr: "Geçmiş Fırçası · Seçici renk", en: "History Brush · Selective colour" },
    desc: {
      tr: "Yağmurlu bir gece sokağı fotoğrafını siyah-beyaza çevirdim, ardından Geçmiş Fırçası ile yalnızca kırmızı şemsiyeyi orijinal rengine döndürdüm. Böylece göz doğrudan şemsiyeye odaklanıyor.",
      en: "I turned a rainy night-street photo black and white, then used the History Brush to bring back only the red umbrella's original colour, so the eye goes straight to it.",
    },
    compares: [{ before: p1a, after: p1b }],
  },
  {
    no: 2, slug: "urun-tanitimi", color: "#ffe066", cover: p2b,
    title: { tr: "Ürün Tanıtımı", en: "Product Ad" },
    technique: { tr: "Arka plan · Işık ve yansıma · Tipografi", en: "Background · Light and reflection · Typography" },
    desc: {
      tr: "\"Pulse One\" adında hayali bir akıllı saat için reklam görseli hazırladım: koyu lacivert arka plan, ürünün altında yansıma, arkasında hafif parlama ve \"Zamanını yönet, hayatını hisset.\" sloganı.",
      en: "An ad visual for an imaginary smartwatch called \"Pulse One\": a deep navy background, a reflection under the product, a soft glow behind it and the slogan \"Manage your time, feel your life.\"",
    },
    compares: [{ before: p2a, after: p2b }],
  },
  {
    no: 3, slug: "karakalem-renklendirme", color: "#ff8a3d", cover: p3b,
    title: { tr: "Karakalem Renklendirme", en: "Sketch Colouring" },
    technique: { tr: "Katmanlar · Fırça · Renk dolgusu", en: "Layers · Brush · Colour fill" },
    desc: {
      tr: "Siyah-beyaz karakalem bir karakter çizimini, çizgileri koruyarak ayrı katmanlarda renklendirdim: kızıl saç, lacivert ceket ve sarı-siyah kılıç detayı.",
      en: "I coloured a black-and-white pencil sketch of a character on separate layers while keeping the line art: red hair, a navy jacket and a yellow-black sword.",
    },
    compares: [{ before: p3a, after: p3b }],
  },
  {
    no: 4, slug: "smart-object", color: "#5cffa1", cover: p4b,
    title: { tr: "Smart Object", en: "Smart Object" },
    technique: { tr: "Akıllı Nesne · Mockup", en: "Smart Object · Mockup" },
    desc: {
      tr: "\"Koza Kahve\" logosunu Akıllı Nesne olarak afiş, kupa ve kartvizit mockup'ına yerleştirdim. Logonun rengini tek bir yerden kahverengiden yeşile çevirince üç yerde birden, kalite kaybı olmadan güncellendi.",
      en: "I placed the \"Koza Kahve\" logo as a Smart Object on a poster, mug and business-card mockup. Changing its colour once, from brown to green, updated all three at the same time with no loss of quality.",
    },
    compares: [
      { before: p4la, after: p4lb, label: { tr: "Logo (Akıllı Nesne içeriği)", en: "Logo (Smart Object contents)" } },
      { before: p4a, after: p4b, label: { tr: "Mockup", en: "Mockup" } },
    ],
  },
  {
    no: 5, slug: "image-stack", color: "#3ff2ff", cover: p5b,
    title: { tr: "Image Stack", en: "Image Stack" },
    technique: { tr: "Görüntü yığını · Medyan", en: "Image stack · Median" },
    desc: {
      tr: "Gece, aynı noktadan 20 fotoğraf çektim ve bunları Photoshop'ta yığın olarak birleştirdim. Medyan yöntemiyle geçen araba ve yayalar kayboldu, sahnede yalnızca ben kaldım.",
      en: "I shot 20 photos from the same spot at night and combined them as a stack in Photoshop. With the median method the passing car and people disappeared and only I remained in the scene.",
    },
    compares: [{ before: p5a, after: p5b }],
  },
  {
    no: 6, slug: "web-arayuzu", color: "#b07bff", cover: p6b,
    title: { tr: "Web Arayüzü Hazırlama", en: "Web UI Design" },
    technique: { tr: "Eskiz · Layer Comps · Arayüz", en: "Wireframe · Layer Comps · UI" },
    desc: {
      tr: "teenage engineering sitesinden yola çıkarak bir web arayüzü tasarladım. Önce eskizini (wireframe) çizdim, sonra Layer Comps ile aynı belgede üç farklı düzen hazırladım.",
      en: "Taking the teenage engineering website as a starting point, I designed a web UI. I drew the wireframe first, then used Layer Comps to build three layouts in the same document.",
    },
    compares: [{ before: p6a, after: p6b, label: { tr: "Özgün site → tasarımım", en: "Original site → my design" } }],
    extra: [
      { src: p6e, label: { tr: "Eskiz", en: "Wireframe" } },
      { src: p6d2, label: { tr: "Düzen 2", en: "Layout 2" } },
      { src: p6d3, label: { tr: "Düzen 3", en: "Layout 3" } },
    ],
  },
]
