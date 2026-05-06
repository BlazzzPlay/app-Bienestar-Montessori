import sharp from "sharp"
import fs from "fs"
import path from "path"

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

const PUBLIC_DIR = path.resolve(process.cwd(), "public")
const ICONS_DIR = path.join(PUBLIC_DIR, "icons")
const SCREENSHOTS_DIR = path.join(PUBLIC_DIR, "screenshots")

async function generateIcons() {
  console.log("Generando iconos PWA...")

  // Asegurar directorios
  if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true })
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  const iconSourcePath = path.join(PUBLIC_DIR, "icon-source.svg")
  const screenshotSourcePath = path.join(PUBLIC_DIR, "screenshot-source.svg")

  if (!fs.existsSync(iconSourcePath)) {
    throw new Error(`No se encontró ${iconSourcePath}`)
  }

  const iconBuffer = fs.readFileSync(iconSourcePath)

  // Generar iconos estándar
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`)
    await sharp(iconBuffer, { density: 300 })
      .resize(size, size, { fit: "contain", background: { r: 11, g: 37, b: 69, alpha: 1 } })
      .png()
      .toFile(outputPath)
    console.log(`  Creado: ${outputPath}`)
  }

  // Generar iconos maskable (con padding extra para zona segura)
  for (const size of MASKABLE_SIZES) {
    const outputPath = path.join(ICONS_DIR, `maskable-${size}x${size}.png`)
    // Safe zone: 80% del tamaño (padding 10% en cada lado)
    const safeZoneSize = Math.round(size * 0.8)
    const padding = Math.round((size - safeZoneSize) / 2)

    await sharp(iconBuffer, { density: 300 })
      .resize(safeZoneSize, safeZoneSize, {
        fit: "contain",
        background: { r: 11, g: 37, b: 69, alpha: 0 },
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 11, g: 37, b: 69, alpha: 1 },
      })
      .png()
      .toFile(outputPath)
    console.log(`  Creado: ${outputPath}`)
  }

  // Generar screenshots si existe el source
  if (fs.existsSync(screenshotSourcePath)) {
    const screenshotBuffer = fs.readFileSync(screenshotSourcePath)

    // Screenshot wide (desktop)
    const widePath = path.join(SCREENSHOTS_DIR, "screenshot-wide.png")
    await sharp(screenshotBuffer, { density: 150 })
      .resize(1280, 720, { fit: "contain", background: { r: 11, g: 37, b: 69, alpha: 1 } })
      .png()
      .toFile(widePath)
    console.log(`  Creado: ${widePath}`)

    // Screenshot narrow (mobile)
    const narrowPath = path.join(SCREENSHOTS_DIR, "screenshot-narrow.png")
    await sharp(screenshotBuffer, { density: 150 })
      .resize(750, 1334, { fit: "contain", background: { r: 11, g: 37, b: 69, alpha: 1 } })
      .png()
      .toFile(narrowPath)
    console.log(`  Creado: ${narrowPath}`)
  } else {
    console.log("  No se encontró screenshot-source.svg, omitiendo screenshots")
  }

  console.log("\n¡Generación de iconos completada!")
}

generateIcons().catch((err) => {
  console.error("Error generando iconos:", err)
  process.exit(1)
})
