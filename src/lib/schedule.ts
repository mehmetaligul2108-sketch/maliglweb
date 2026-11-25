// 2026 Güz dönemi ders programı (Akdeniz Üniversitesi, Bilgisayar Programcılığı 1. sınıf).
import type { Bi } from "./site"

export interface Lesson { day: number; start: string; end: string; code: string; name: Bi; online?: boolean }

// day: 1 = Pazartesi ... 5 = Cuma (Date.getDay() ile aynı)
export const SCHEDULE: Lesson[] = [
  { day: 1, start: "13:30", end: "17:20", code: "MBIL 101", name: { tr: "Programlamanın Temelleri", en: "Fundamentals of Programming" } },
  { day: 2, start: "08:30", end: "10:20", code: "TDB 101", name: { tr: "Türk Dili I", en: "Turkish Language I" }, online: true },
  { day: 2, start: "13:30", end: "15:20", code: "ATA 101", name: { tr: "Atatürk İlkeleri ve İnkılap Tarihi I", en: "Atatürk's Principles and History of Reforms I" }, online: true },
  { day: 2, start: "15:30", end: "17:20", code: "YBD 121", name: { tr: "İngilizce I", en: "English I" }, online: true },
  { day: 3, start: "08:30", end: "10:20", code: "MYO 123", name: { tr: "Fizik I", en: "Physics I" } },
  { day: 3, start: "10:30", end: "12:20", code: "MYO 131", name: { tr: "Temel Matematik", en: "Basic Mathematics" } },
  { day: 3, start: "13:30", end: "17:20", code: "MBIL 103", name: { tr: "Veri Tabanı I", en: "Databases I" } },
  { day: 4, start: "08:30", end: "12:20", code: "MBIL 105", name: { tr: "Grafik Animasyon I", en: "Graphic Animation I" } },
  { day: 4, start: "13:30", end: "15:20", code: "MBIL 113", name: { tr: "Web Tasarımının Temelleri", en: "Fundamentals of Web Design" } },
  { day: 5, start: "13:30", end: "15:20", code: "MBIL 111", name: { tr: "Ofis Yazılımları", en: "Office Software" } },
]

export const DAY_NAMES: Record<number, Bi> = {
  1: { tr: "Pazartesi", en: "Monday" },
  2: { tr: "Salı", en: "Tuesday" },
  3: { tr: "Çarşamba", en: "Wednesday" },
  4: { tr: "Perşembe", en: "Thursday" },
  5: { tr: "Cuma", en: "Friday" },
}
