import { NormalizingIndicator as NormalizingIndicator_ebf9c5842a33e7e6dab1600a4d034876 } from '@/components/payload/NormalizingIndicator'
import { UrlCell as UrlCell_ed2828d53eb0092c74e96289c4b97fab } from '@/components/payload/UrlCell'
import { FileSizeCell as FileSizeCell_c816670353bd67c7fafe5c222443570b } from '@/components/payload/FileSizeCell'
import { LowercaseText as LowercaseText_0889b483c4555e77039b3dc2be1fe0b6 } from '@/components/payload/LowercaseText'
import { CategoryLidSync as CategoryLidSync_753a7c062c5a663ddd14176a32acc322 } from '@/components/payload/CategoryLidSync'
import { ClientImageCompressorProvider as ClientImageCompressorProvider_f27d5cb7fa8597af0f6621c0fd3100d8 } from '@/components/payload/ClientImageCompressor'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

/** @type import('payload').ImportMap */
export const importMap = {
  "@/components/payload/NormalizingIndicator#NormalizingIndicator": NormalizingIndicator_ebf9c5842a33e7e6dab1600a4d034876,
  "@/components/payload/UrlCell#UrlCell": UrlCell_ed2828d53eb0092c74e96289c4b97fab,
  "@/components/payload/FileSizeCell#FileSizeCell": FileSizeCell_c816670353bd67c7fafe5c222443570b,
  "@/components/payload/LowercaseText#LowercaseText": LowercaseText_0889b483c4555e77039b3dc2be1fe0b6,
  "@/components/payload/CategoryLidSync#CategoryLidSync": CategoryLidSync_753a7c062c5a663ddd14176a32acc322,
  "@/components/payload/ClientImageCompressor#ClientImageCompressorProvider": ClientImageCompressorProvider_f27d5cb7fa8597af0f6621c0fd3100d8,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1
}
