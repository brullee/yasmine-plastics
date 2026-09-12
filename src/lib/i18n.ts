interface ArabicNounForms {
  one: string   // 1
  two: string   // 2 (dual)
  few: string   // 3-10
  many: string  // 11-99 (accusative)
  other: string // 100+
}

export function formatArabicCount(n: number, forms: ArabicNounForms): string {
  // Zero pairs with the singular/genitive noun form in Arabic (the same one used for
  // 100+), not the plural "few" form used for 3-10 — e.g. "٠ منتج", not "٠ منتجات".
  // Without this, n <= 10 below would catch 0 and use the plural form instead.
  if (n === 0) return `${n} ${forms.other}`
  if (n === 1) return forms.one
  if (n === 2) return forms.two
  if (n <= 10) return `${n} ${forms.few}`
  if (n < 100) return `${n} ${forms.many}`
  return `${n} ${forms.other}`
}
