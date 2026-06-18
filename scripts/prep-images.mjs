import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'fs'
import { join, extname, basename } from 'path'

const INPUT  = './scripts/images-raw'
const OUTPUT = './scripts/images-out'
const SIZE   = 1400
const INNER  = 1150 // product fills this many px; the rest becomes background padding

mkdirSync(OUTPUT, { recursive: true })

const files = readdirSync(INPUT).filter(f =>
  ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase())
)

async function sampleBackground(src) {
  const { width, height } = await sharp(src).metadata()
  // Sample 20×20 patches slightly inset from each corner to avoid edge shadows
  const inset = Math.round(Math.min(width, height) * 0.04)
  const patch = 20
  const corners = [
    { left: inset,             top: inset              },
    { left: width - inset - patch, top: inset              },
    { left: inset,             top: height - inset - patch },
    { left: width - inset - patch, top: height - inset - patch },
  ]
  let r = 0, g = 0, b = 0, count = 0
  for (const region of corners) {
    const { data, info } = await sharp(src)
      .extract({ ...region, width: patch, height: patch })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const ch = info.channels
    for (let i = 0; i < data.length; i += ch) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
    }
  }
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }
}

for (const file of files) {
  const src  = join(INPUT, file)
  const name = basename(file, extname(file))
  const dest = join(OUTPUT, `${name}.png`)

  const bg = await sampleBackground(src)

  const pad = Math.round((SIZE - INNER) / 2)
  await sharp(src)
    .resize(INNER, INNER, { fit: 'contain', background: { ...bg, alpha: 1 } })
    .flatten({ background: bg })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg })
    // .jpeg({ quality: 88, mozjpeg: true })
    .png()
    .toFile(dest)

  console.log(`✓ ${file} → ${name}.png  (bg: rgb(${bg.r},${bg.g},${bg.b}))`)
}

console.log(`\nDone — ${files.length} image(s) written to ${OUTPUT}`)
