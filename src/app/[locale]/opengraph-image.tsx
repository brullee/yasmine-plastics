import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Yasmine Plastics - Custom Plastic Manufacturing'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a2240 0%, #0d3562 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -2,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          Yasmine Plastics
        </div>
        <div
          style={{
            color: '#93c5fd',
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: 1,
            textAlign: 'center',
          }}
        >
          Custom Plastic Manufacturing · Jordan
        </div>
      </div>
    ),
    { ...size }
  )
}
