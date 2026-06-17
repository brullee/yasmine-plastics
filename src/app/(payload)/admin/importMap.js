import { LowercaseText as LowercaseText_0889b483c4555e77039b3dc2be1fe0b6 } from '@/components/payload/LowercaseText'
import { CategoryLidSync as CategoryLidSync_753a7c062c5a663ddd14176a32acc322 } from '@/components/payload/CategoryLidSync'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

/** @type import('payload').ImportMap */
export const importMap = {
  "@/components/payload/LowercaseText#LowercaseText": LowercaseText_0889b483c4555e77039b3dc2be1fe0b6,
  "@/components/payload/CategoryLidSync#CategoryLidSync": CategoryLidSync_753a7c062c5a663ddd14176a32acc322,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1
}
