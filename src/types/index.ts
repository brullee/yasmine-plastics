export type Locale = 'en' | 'ar'

export type Product = {
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  category: string
  options: {
    colors?: string[]
    sizes?: string[]
  }
  image: string
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
  clientName: string
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
  delivery: string
  details: string
  honeypot: string
}
