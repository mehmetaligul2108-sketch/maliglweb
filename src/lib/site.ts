// Sitenin sayfa kaydı: harita konumları, renkler, iki dilli adlar ve SEO bilgileri.
export type Lang = "tr" | "en"
export type Bi = { tr: string; en: string }
export type PageId = "home" | "about" | "projects" | "blog" | "gallery" | "contact"

export interface PageInfo {
  id: PageId
  file: string
  x: number
  y: number
  color: string
  key: Bi
  name: Bi
  place: Bi
  desc: Bi
  title: Bi
  meta: Bi
}

export const PAGES: Record<PageId, PageInfo> = {
  home: {
    id: "home", file: "index.html", x: 770, y: 545, color: "#ffe066",
    key: { tr: "A", en: "H" },
    name: { tr: "Anasayfa", en: "Home" },
    place: { tr: "Kaleiçi", en: "Kaleiçi" },
    desc: { tr: "Tarihi liman. Sitenin başladığı yer.", en: "The old harbour, where the site begins." },
    title: { tr: "Mehmet Ali Gül | Kişisel Web Sitesi", en: "Mehmet Ali Gül | Personal Website" },
    meta: {
      tr: "Akdeniz Üniversitesi Bilgisayar Programcılığı öğrencisi Mehmet Ali Gül'ün GTA temalı, animasyonlu kişisel web sitesi: hakkımda, projeler, blog, galeri ve iletişim.",
      en: "Personal website of Mehmet Ali Gül, a Computer Programming student at Akdeniz University: about, projects, blog, gallery and contact.",
    },
  },
  about: {
    id: "about", file: "hakkimda.html", x: 560, y: 420, color: "#ff4fd8",
    key: { tr: "H", en: "A" },
    name: { tr: "Hakkımda", en: "About" },
    place: { tr: "Akdeniz Üniversitesi", en: "Akdeniz University" },
    desc: { tr: "Kim olduğum, özgeçmişim, yeteneklerim ve ders programım.", en: "Who I am, my CV, my skills and my class schedule." },
    title: { tr: "Hakkımda | Mehmet Ali Gül", en: "About | Mehmet Ali Gül" },
    meta: {
      tr: "Mehmet Ali Gül hakkında: özgeçmiş, eğitim, yetenekler, ilgi alanları ve Akdeniz Üniversitesi Bilgisayar Programcılığı ders programı.",
      en: "About Mehmet Ali Gül: CV, education, skills, interests and the Akdeniz University Computer Programming class schedule.",
    },
  },
  projects: {
    id: "projects", file: "projeler.html", x: 930, y: 450, color: "#ff8a3d",
    key: { tr: "P", en: "P" },
    name: { tr: "Projeler", en: "Projects" },
    place: { tr: "Muratpaşa", en: "Muratpaşa" },
    desc: { tr: "Grafik Animasyon I dersinde yaptığım Photoshop çalışmaları.", en: "My Photoshop work from the Graphic Animation I course." },
    title: { tr: "Projeler | Mehmet Ali Gül", en: "Projects | Mehmet Ali Gül" },
    meta: {
      tr: "Grafik Animasyon I dersi Photoshop projeleri: History Brush, ürün tanıtımı, karakalem renklendirme, Smart Object, Image Stack ve web arayüzü.",
      en: "Photoshop projects from Graphic Animation I: History Brush, product ad, sketch colouring, Smart Object, Image Stack and web UI.",
    },
  },
  blog: {
    id: "blog", file: "blog.html", x: 1000, y: 250, color: "#3ff2ff",
    key: { tr: "B", en: "B" },
    name: { tr: "Blog", en: "Blog" },
    place: { tr: "Düden Şelalesi", en: "Düden Waterfalls" },
    desc: { tr: "Bilişim üzerine yazılarım ve ekran görüntüleri.", en: "My posts on IT, with screenshots." },
    title: { tr: "Blog | Mehmet Ali Gül", en: "Blog | Mehmet Ali Gül" },
    meta: {
      tr: "Mehmet Ali Gül'ün bilişim blogu: Photoshop Smart Object, React ve Vite ile site kurulumu, GSAP ve Lenis ile kaydırma animasyonları.",
      en: "Mehmet Ali Gül's IT blog: Photoshop Smart Objects, building a site with React and Vite, scroll animations with GSAP and Lenis.",
    },
  },
  gallery: {
    id: "gallery", file: "galeri.html", x: 1240, y: 560, color: "#b07bff",
    key: { tr: "G", en: "G" },
    name: { tr: "Galeri", en: "Gallery" },
    place: { tr: "Lara Sahili", en: "Lara Beach" },
    desc: { tr: "Beni en iyi anlatan fotoğraflar.", en: "The photos that describe me best." },
    title: { tr: "Galeri | Mehmet Ali Gül", en: "Gallery | Mehmet Ali Gül" },
    meta: {
      tr: "Mehmet Ali Gül'ü anlatan fotoğraflar ve kısa açıklamaları.",
      en: "Photos that describe Mehmet Ali Gül, with short captions.",
    },
  },
  contact: {
    id: "contact", file: "iletisim.html", x: 360, y: 585, color: "#5cffa1",
    key: { tr: "İ", en: "C" },
    name: { tr: "İletişim", en: "Contact" },
    place: { tr: "Konyaaltı Sahili", en: "Konyaaltı Beach" },
    desc: { tr: "Adres, telefon ve bana mesaj gönderebileceğin form.", en: "Address, phone and a form to message me." },
    title: { tr: "İletişim | Mehmet Ali Gül", en: "Contact | Mehmet Ali Gül" },
    meta: {
      tr: "Mehmet Ali Gül ile iletişim: adres, telefon, e-posta, Instagram ve iletişim formu.",
      en: "Contact Mehmet Ali Gül: address, phone, e-mail, Instagram and a contact form.",
    },
  },
}

export const PAGE_ORDER: PageId[] = ["home", "about", "projects", "blog", "gallery", "contact"]

export const PERSON = {
  name: "Mehmet Ali Gül",
  phone: "0505 067 64 66",
  phoneHref: "tel:+905050676466",
  email: "mehmetaligul2108@gmail.com",
  instagram: "maligl",
  address: { tr: "Şehzade Korkut KYK Yurdu, Antalya", en: "Şehzade Korkut KYK Dormitory, Antalya" },
  studentNo: "20261129021",
}
