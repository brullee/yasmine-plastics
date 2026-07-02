import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Yasmine Plastics'

export default async function Image() {
  const svgBuffer = readFileSync(path.join(process.cwd(), 'public', 'YasmineLogo.svg'))
  const logoW = 780
  const logoH = Math.round(logoW * (130.67 / 755.59))
  const pngBuffer = await sharp(svgBuffer).resize(logoW * 2, logoH * 2).png().toBuffer()
  const logoSrc = `data:image/png;base64,${pngBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={logoSrc} width={logoW} height={logoH} alt="Yasmine Plastics" />
      </div>
    ),
    { ...size }
  )
}
