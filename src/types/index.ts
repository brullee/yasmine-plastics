export type Locale = 'en' | 'ar'

export type Product = {
  slug: string
  nameEn: string
  nameAr: string
  internalName?: string     // factory/internal name - admin-only, not shown on consumer UI
  category: string
  categoryNameEn: string
  categoryNameAr: string
  options: {
    colors?: { en: string; ar: string }[]
    sizes?: string[]
    sizeUnit?: string
    colorImageMap?: Record<string, string>  // color.nameEn → first gallery image URL tagged with that color
    sizeImageMap?: Record<string, string>   // size.label → first gallery image URL tagged with that size
  }
  compatibleLids?: string[]
  image: string
  gallery?: string[]         // additional product images (shown in carousel after primary)
  // Key attributes - fill in as real data becomes available
  artCode?: string          // e.g. 'art-70-200' (art-neck-volume)
  material?: string
  capacityAutoGenerate?: boolean
  capacity?: string         // e.g. '250ml' | '750g' — used only when capacityAutoGenerate is false
  piecesPerBox?: number
  shapeType?: 'circular' | 'rectangular'
  diameterTop?: number     // mm - circular; sole diameter when not tapered
  tapered?: boolean
  diameterBottom?: number  // mm - circular, tapered only
  width?: number      // mm - rectangular only
  length?: number     // mm - rectangular only
  height?: number     // mm
  pairingImages?: Record<string, string[]> // partnerSlug → combined product photo URLs
}

export type Category = {
  slug: string
  nameEn: string
  nameAr: string
  image: string
}

export type CompanyInfo = {
  phone: string
  phone2: string
  whatsapp: string
  email: string
  addressEn: string
  addressAr: string
  hoursEn: string
  hoursAr: string
  mapEmbedUrl: string
  mapEmbedUrlEn: string
  mapShareUrl: string
}

export type ContactFormFields = {
  fullName: string
  email: string
  phone: string
  message: string
  honeypot: string
}

export type QuoteFormFields = {
  fullName: string
  company: string
  email: string
  phone: string
  product: string
  color: string
  size: string
  lid: string
  delivery: string
  details: string
  honeypot: string
}
