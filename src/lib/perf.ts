// Telefon / tablet için "hafif mod": dokunmatik ekran ya da dar ekran.
// Masaüstü görünümü değişmez; yalnızca mobilde ağır efektler sadeleşir.
export const LITE: boolean = (() => {
  try { return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768 } catch { return false }
})()
