export type Locale = 'en' | 'ar'

export type Product = {
  slug: string
  nameEn: string
  nameAr: string
  category: string
  options: {
    colors?: string[]
    sizes?: string[]
  }
  compatibleLids?: string[]
  image: string
  gallery?: string[]         // additional product images (shown in carousel after primary)
  // Key attributes — fill in as real data becomes available
  artCode?: string          // e.g. 'art-70-200' (art-neck-volume)
  material?: string         // e.g. 'PP' | 'PS'
  capacity?: string         // e.g. '250ml' | '750g'
  piecesPerBox?: number
  dimensions?: string       // e.g. 'φ70 × H85 mm' or '120×80×55 mm'
  cbm?: string              // e.g. '0.048' (cubic metres per full carton)
  pairingImages?: Record<string, string> // partnerSlug → combined product photo URL
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
  firstName: string
  lastName: string
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
