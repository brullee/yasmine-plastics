interface ArabicNounForms {
  one: string   // 1
  two: string   // 2 (dual)
  few: string   // 3-10
  many: string  // 11-99 (accusative)
  other: string // 100+
}

export function formatArabicCount(n: number, forms: ArabicNounForms): string {
  if (n === 1) return forms.one
  if (n === 2) return forms.two
  if (n <= 10) return `${n} ${forms.few}`
  if (n < 100) return `${n} ${forms.many}`
  return `${n} ${forms.other}`
}
