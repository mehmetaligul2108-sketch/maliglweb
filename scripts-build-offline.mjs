// Çift tıklayınca (file://) açılabilen teslim sürümü: her sayfa tek, modül olmayan bir betikle derlenir.
import { build } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import fs from "node:fs"
import path from "node:path"

const OUT = "teslim-site"
const PAGES = ["index", "hakkimda", "projeler", "blog", "galeri", "iletisim"]
fs.rmSync(OUT, { recursive: true, force: true })

for (const name of PAGES) {
  await build({
    configFile: false,
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve("src") } },
    logLevel: "warn",
    build: {
      outDir: OUT,
      emptyOutDir: false,
      modulePreload: false,
      cssCodeSplit: false,
      rollupOptions: {
        input: { [name]: path.resolve(`${name}.html`) },
        output: {
          format: "iife",
          codeSplitting: false,
          entryFileNames: `assets/${name}.js`,
          assetFileNames: (a) => (a.names?.[0]?.endsWith(".css") ? `assets/${name}.css` : "assets/[name]-[hash][extname]"),
        },
      },
    },
  })
  const file = path.join(OUT, `${name}.html`)
  let html = fs.readFileSync(file, "utf8")
  html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, "")
  html = html.replace(/<link rel="stylesheet" crossorigin href=/g, "<link rel=\"stylesheet\" href=")
  html = html.replace("</body>", `  <script src="./assets/${name}.js"></script>\n  </body>`)
  fs.writeFileSync(file, html)
  console.log("✓", name)
}
