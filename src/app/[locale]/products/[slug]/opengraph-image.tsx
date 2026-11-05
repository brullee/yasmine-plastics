import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getProductBySlug } from '@/lib/payload-data'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Yasmine Plastics Product'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

async function logoDataUri() {
  const svgBuffer = readFileSync(path.join(process.cwd(), 'public', 'YasmineLogo.svg'))
  const logoW = 780
  const logoH = Math.round(logoW * (130.67 / 755.59))
  const pngBuffer = await sharp(svgBuffer).resize(logoW * 2, logoH * 2).png().toBuffer()
  return { src: `data:image/png;base64,${pngBuffer.toString('base64')}`, w: logoW, h: logoH }
}

// The OG renderer can't decode WebP, which is how product images are stored.
async function productImageDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer())).jpeg({ quality: 90 }).toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  } catch {
    return null
  }
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  let imageUrl = product?.image

  // Relative paths only appear in dev (local Payload storage). Make them absolute.
  if (imageUrl?.startsWith('/')) {
    const base = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    imageUrl = `${base}${imageUrl}`
  }

  const imageSrc = imageUrl ? await productImageDataUri(imageUrl) : null

  if (!imageSrc) {
    const logo = await logoDataUri()
    return new ImageResponse(
      (
        <div style={{ background: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo.src} width={logo.w} height={logo.h} alt="Yasmine Plastics" />
        </div>
      ),
      { ...size }
    )
  }

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
        <img src={imageSrc} width={630} height={630} alt="" />
      </div>
    ),
    { ...size }
  )
}
