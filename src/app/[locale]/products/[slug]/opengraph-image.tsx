import { ImageResponse } from 'next/og'
import { getProductBySlug } from '@/lib/payload-data'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Yasmine Plastics Product'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  let imageUrl = product?.image
  if (!imageUrl) {
    return new ImageResponse(
      <div style={{ background: 'white', width: '100%', height: '100%', display: 'flex' }} />,
      { ...size }
    )
  }

  // Relative paths only appear in dev (local Payload storage). Make them absolute.
  if (imageUrl.startsWith('/')) {
    const base = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    imageUrl = `${base}${imageUrl}`
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
        <img src={imageUrl} width={630} height={630} alt="" />
      </div>
    ),
    { ...size }
  )
}
