// Galeri fotoğrafları. Fotoğraf eklemek için: görseli src/assets/galeri klasörüne koy,
// aşağıya import edip listeye { src, caption } olarak ekle. src boşsa yer tutucu gösterilir.
import type { Bi } from "./site"
import kedi from "@/assets/galeri/kedi.webp"
import migros from "@/assets/galeri/migros.webp"
import kocfest from "@/assets/galeri/kocfest.webp"
import kaleici from "@/assets/galeri/kaleici.webp"
import konyaalti from "@/assets/galeri/konyaalti.webp"
import selfie from "@/assets/galeri/selfie.webp"
import koy from "@/assets/galeri/koy.webp"
import korsan from "@/assets/galeri/korsan.webp"
import yavruKedi from "@/assets/galeri/yavru-kedi.webp"
import otobus from "@/assets/galeri/otobus.webp"

export interface Photo { src?: string; caption: Bi; color: string }

export const GALLERY: Photo[] = [
  { src: kaleici, caption: { tr: "Kaleiçi · Hadrian Kapısı, gece", en: "Kaleiçi · Hadrian's Gate at night" }, color: "#ffe066" },
  { src: kocfest, caption: { tr: "Koç Fest · Akdeniz Üniversitesi konseri", en: "Koç Fest · Akdeniz University concert" }, color: "#ff4fd8" },
  { src: konyaalti, caption: { tr: "Konyaaltı Sahili · bulutlu bir akşam", en: "Konyaaltı Beach · a cloudy evening" }, color: "#5cffa1" },
  { src: selfie, caption: { tr: "Asansör selfiesi · yara bandı edition", en: "Elevator selfie · band-aid edition" }, color: "#b07bff" },
  { src: migros, caption: { tr: "Antalya · Migros AVM önü, üst geçitten", en: "Antalya · Migros mall, from the footbridge" }, color: "#3ff2ff" },
  { src: korsan, caption: { tr: "Korsan kaptanla poz · tayfaya katıldım", en: "Posing with the pirate captain · joined the crew" }, color: "#3ff2ff" },
  { src: koy, caption: { tr: "Akdeniz kıyısı · kayalıklar ve masmavi deniz", en: "Mediterranean coast · rocks and deep blue sea" }, color: "#b07bff" },
  { src: otobus, caption: { tr: "Şoför koltuğunda · direksiyon bende", en: "In the driver's seat · I've got the wheel" }, color: "#ffe066" },
  { src: yavruKedi, caption: { tr: "Yavru kedi · oyun zamanı", en: "Kitten · playtime" }, color: "#ff4fd8" },
  { src: kedi, caption: { tr: "Uykucu kedi · günün en mutlu anı", en: "Sleepy cat · the best moment of the day" }, color: "#ff8a3d" },
]
