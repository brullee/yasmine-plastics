import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import type { BasePayload } from 'payload'

const TARGET_SIZE  = 1400
const FILL_PERCENT = 0.65

function s3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT ?? '',
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID     ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
}

async function removeBackground(imageUrl: string): Promise<Buffer | null> {
  const modalUrl = process.env.MODAL_BG_REMOVE_URL
  if (!modalUrl) return null

  console.log(`[image-normalize] Calling Modal: ${imageUrl}`)
  try {
    const res = await fetch(modalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
      signal: AbortSignal.timeout(180_000),
    })
    console.log(`[image-normalize] Modal responded: ${res.status}`)
    if (!res.ok) {
      console.error(`[image-normalize] Modal error body: ${await res.text()}`)
      return null
    }
    return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    console.error('[image-normalize] Modal fetch error:', err)
    return null
  }
}

async function normalizeBuffer(input: Buffer, gentle = false, fillPercent = FILL_PERCENT): Promise<Buffer> {
  const subjectMax = Math.round(TARGET_SIZE * fillPercent)

  // Auto-rotate based on EXIF orientation, then strip the tag
  input = await sharp(input).rotate().toBuffer()

  const meta = await sharp(input).metadata()
  const hasAlpha = (meta.channels ?? 3) === 4

  let toProcess: Buffer
  if (gentle && hasAlpha) {
    // Trim transparent pixels left by BG removal — preserves light product edges
    // without clipping them the way white-colour threshold trimming would.
    toProcess = await sharp(input).trim({ threshold: 10 }).toBuffer()
  } else {
    // Flatten transparent → white so trim can compare colours uniformly.
    // (BiRefNet stores original colour in masked pixels; raw RGBA comparison fails.)
    const forTrimming = hasAlpha
      ? await sharp(input).flatten({ background: { r: 255, g: 255, b: 255 } }).toBuffer()
      : input
    toProcess = await sharp(forTrimming)
      .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 35 })
      .toBuffer()
  }

  const { width = 1, height = 1 } = await sharp(toProcess).metadata()

  const scale = Math.min(subjectMax / width, subjectMax / height)
  const newW  = Math.round(width  * scale)
  const newH  = Math.round(height * scale)

  const resized = await sharp(toProcess).resize(newW, newH).toBuffer()

  return sharp({
    create: {
      width:      TARGET_SIZE,
      height:     TARGET_SIZE,
      channels:   3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{
      input: resized,
      top:  Math.round((TARGET_SIZE - newH) / 2),
      left: Math.round((TARGET_SIZE - newW) / 2),
    }])
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function normalizeMediaAfterUpload(
  filename: string,
  docId: number | string,
  payload: BasePayload,
  processingMode: 'standard' | 'gentle' = 'standard',
) {
  const gentle = processingMode === 'gentle'
  console.log(`[image-normalize] START ${filename} [${processingMode}]`)

  const s3     = s3Client()
  const bucket = process.env.R2_BUCKET ?? ''

  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: filename }))
  const chunks: Buffer[] = []
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk))
  }
  let imageBuffer: Buffer = Buffer.concat(chunks)

  const imageUrl = `${process.env.R2_PUBLIC_URL ?? ''}/${filename}`
  const t0 = Date.now()
  const bgRemoved = await removeBackground(imageUrl)
  if (bgRemoved) {
    console.log(`[image-normalize] BG removed in ${Date.now() - t0}ms (${(bgRemoved.length / 1024).toFixed(0)} KB)`)
    imageBuffer = bgRemoved
  }

  const t1 = Date.now()
  const normalized = await normalizeBuffer(imageBuffer, gentle)
  const normMeta = await sharp(normalized).metadata()
  console.log(`[image-normalize] Done in ${Date.now() - t1}ms → ${normMeta.width}x${normMeta.height} (${(normalized.length / 1024).toFixed(0)} KB)`)

  await s3.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         filename,
    Body:        normalized,
    ContentType: 'image/jpeg',
  }))

  await payload.update({
    collection: 'media',
    id:         docId,
    data:       { width: normMeta.width, height: normMeta.height, filesize: normalized.length },
  })
  console.log(`[image-normalize] DONE ${filename}`)
}
