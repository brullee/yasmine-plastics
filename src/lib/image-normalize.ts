import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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

async function normalizeBuffer(input: Buffer): Promise<Buffer> {
  const subjectMax = Math.round(TARGET_SIZE * FILL_PERCENT)

  const meta = await sharp(input).metadata()
  const hasAlpha = (meta.channels ?? 3) === 4

  // For BG-removed RGBA images: flatten transparent → white so trim works
  // (BiRefNet stores original colour in masked pixels; comparing raw RGBA would fail)
  const forTrimming = hasAlpha
    ? await sharp(input).flatten({ background: { r: 255, g: 255, b: 255 } }).toBuffer()
    : input

  const trimmed = await sharp(forTrimming)
    .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 35 })
    .toBuffer()

  const { width = 1, height = 1 } = await sharp(trimmed).metadata()

  const scale = Math.min(subjectMax / width, subjectMax / height)
  const newW  = Math.round(width  * scale)
  const newH  = Math.round(height * scale)

  const resized = await sharp(trimmed).resize(newW, newH).toBuffer()

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
) {
  const log = (msg: string) => console.log(`[image-normalize] ${msg}`)
  log(`START ${filename}`)

  const s3     = s3Client()
  const bucket = process.env.R2_BUCKET ?? ''

  log('Downloading from R2...')
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: filename }))
  const chunks: Buffer[] = []
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk))
  }
  let imageBuffer: Buffer = Buffer.concat(chunks)
  log(`Downloaded ${(imageBuffer.length / 1024).toFixed(0)} KB`)

  const imageUrl = `${process.env.R2_PUBLIC_URL ?? ''}/${filename}`
  const modalUrl = process.env.MODAL_BG_REMOVE_URL
  log(`MODAL_BG_REMOVE_URL = ${modalUrl ?? '(not set)'}`)

  const t0 = Date.now()
  const bgRemoved = await removeBackground(imageUrl)
  if (bgRemoved) {
    log(`BG removed in ${Date.now() - t0}ms (${(bgRemoved.length / 1024).toFixed(0)} KB)`)
    imageBuffer = bgRemoved
  } else {
    log('BG removal skipped or failed, normalizing original')
  }

  log('Detecting alpha channel...')
  const meta = await sharp(imageBuffer).metadata()
  log(`Input: ${meta.width}x${meta.height} channels=${meta.channels} format=${meta.format}`)

  log('Flattening / trimming...')
  const t1 = Date.now()
  const normalized = await normalizeBuffer(imageBuffer)
  const normMeta = await sharp(normalized).metadata()
  log(`Normalized in ${Date.now() - t1}ms → ${normMeta.width}x${normMeta.height} (${(normalized.length / 1024).toFixed(0)} KB)`)

  // Rename to .jpg so the URL changes, forcing browsers to fetch the new file instead of serving a cached copy
  const normalizedFilename = filename.replace(/\.[^.]+$/, '.jpg')

  log('Uploading to R2...')
  await s3.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         normalizedFilename,
    Body:        normalized,
    ContentType: 'image/jpeg',
  }))

  if (normalizedFilename !== filename) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: filename }))
  }
  log('Uploaded')

  await payload.update({
    collection: 'media',
    id:         docId,
    data:       { filename: normalizedFilename, width: normMeta.width, height: normMeta.height, filesize: normalized.length, mimeType: 'image/jpeg' },
  })
  log('DONE')
}
