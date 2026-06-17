import type { Product } from '@/types'

const categoryPrefix: Record<string, string> = {
  cups: 'cup',
  containers: 'container',
  buckets: 'bucket',
  lids: 'lid',
  'papercup-lids': 'papercup-lid',
}

type RawProduct = Omit<Product, 'slug'>

function withSlug(p: RawProduct): Product {
  const prefix = categoryPrefix[p.category] ?? p.category
  return { ...p, slug: `${prefix}-${p.artCode}` }
}

const rawProducts: RawProduct[] = [

  // ─── CUPS ────────────────────────────────────────────────────────────────────

  {
    nameEn: 'Small Cup 120ml',
    nameAr: 'كوب صغير 120مل',
    internalName: 'كاسة 73 · 120مل',
    category: 'cups',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/cup-73-120/600/600',
    artCode: '73-120',
    material: 'PP',
    capacity: '120ml',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Cup 200ml',
    nameAr: 'كوب 200مل',
    internalName: 'كاسة 73 · 200مل',
    category: 'cups',
    options: { colors: ['White', 'Blue'] },
    image: 'https://picsum.photos/seed/cup-73-200/600/600',
    artCode: '73-200',
    material: 'PP',
    capacity: '200ml',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Clear Cup 250ml',
    nameAr: 'كوب شفاف 250مل',
    internalName: 'كاسة 75 · 250مل',
    category: 'cups',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/cup-75-250/600/600',
    artCode: '75-250',
    material: '',
    capacity: '250ml',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Arabic Coffee Cup',
    nameAr: 'فنجان قهوة',
    internalName: 'فنجان سادة',
    category: 'cups',
    options: { colors: ['Brown'] },
    image: 'https://picsum.photos/seed/finjan-plain/600/600',
    artCode: '000',
    material: 'PP',
    capacity: '',
    piecesPerBox: undefined,
  },

  // ─── CONTAINERS ──────────────────────────────────────────────────────────────

  {
    nameEn: 'Sauce & Dip Cup',
    nameAr: 'كوب صلصة وتغميس',
    internalName: 'علبة 116 · 1/5',
    category: 'containers',
    options: { colors: ['Clear', 'Green', 'Black'] },
    compatibleLids: ['lid-116-fifth-g'],
    image: 'https://picsum.photos/seed/container-116-fifth/600/600',
    artCode: '116-fifth',
    material: 'PP',
    capacity: '',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Round Side Container',
    nameAr: 'علبة دائرية للأطباق الجانبية',
    internalName: 'علبة 116 · 1/3',
    category: 'containers',
    options: { colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/container-116-third/600/600',
    artCode: '116-third',
    material: 'PP',
    capacity: '',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Ribbed Serving Bowl',
    nameAr: 'طبق تقديم مضلع',
    internalName: 'همبة 116 h4',
    category: 'containers',
    options: { sizes: ['200ml', '300ml', '400ml'], colors: ['Clear'] },
    image: 'https://picsum.photos/seed/container-116-h4/600/600',
    artCode: '116-h4',
    material: 'PP',
    capacity: '200–400ml',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Round Bowl – Small',
    nameAr: 'طبق دائري – صغير',
    internalName: 'همبة h1',
    category: 'containers',
    options: { colors: ['Clear'] },
    compatibleLids: ['lid-116-h1'],
    image: 'https://picsum.photos/seed/bowl-h1/600/600',
    artCode: '116-h1',
    material: 'PP',
    capacity: '',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Round Bowl – Medium',
    nameAr: 'طبق دائري – وسط',
    internalName: 'همبة h3',
    category: 'containers',
    options: { colors: ['Clear'] },
    compatibleLids: ['lid-116-h3'],
    image: 'https://picsum.photos/seed/bowl-h3/600/600',
    artCode: '116-h3',
    material: 'PP',
    capacity: '',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Spice & Marinade Cup 75g',
    nameAr: 'كوب تتبيلة وبهارات 75غ',
    internalName: 'علبة تتبيلة 73 · 75غ',
    category: 'containers',
    options: { colors: ['Black'] },
    compatibleLids: ['lid-73-flat'],
    image: 'https://picsum.photos/seed/spice-73-75g/600/600',
    artCode: '73-75',
    material: 'PP',
    capacity: '75g',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Large Serving Bowl 750g',
    nameAr: 'طبق تقديم كبير 750غ',
    internalName: 'علبة فتة 190 · 750غ',
    category: 'containers',
    options: { colors: ['White'] },
    compatibleLids: ['lid-190-dome'],
    image: 'https://picsum.photos/seed/container-190-fatteh-750/600/600',
    artCode: '190-750',
    material: 'PP',
    capacity: '750g',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Large Serving Bowl 1000g',
    nameAr: 'طبق تقديم كبير 1000غ',
    internalName: 'علبة فتة 190 · 1000غ',
    category: 'containers',
    options: { colors: ['White'] },
    compatibleLids: ['lid-190-dome'],
    image: 'https://picsum.photos/seed/container-190-fatteh-1000/600/600',
    artCode: '190-1000',
    material: 'PP',
    capacity: '1000g',
    piecesPerBox: undefined,
  },

  // ─── BUCKETS ─────────────────────────────────────────────────────────────────

  {
    nameEn: 'Food Storage Bucket 2L',
    nameAr: 'سطل تخزين غذائي 2 لتر',
    internalName: 'سطل 190 · 2 لتر',
    category: 'buckets',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/bucket-190-2l/600/600',
    artCode: '190-2000',
    material: 'PP',
    capacity: '2000ml',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Food Storage Bucket 3L',
    nameAr: 'سطل تخزين غذائي 3 لتر',
    internalName: 'سطل 190 · 3 لتر',
    category: 'buckets',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/bucket-190-3l/600/600',
    artCode: '190-3000',
    material: 'PP',
    capacity: '3000ml',
    piecesPerBox: undefined,
  },

  // ─── LIDS ────────────────────────────────────────────────────────────────────

  {
    nameEn: 'Lid for Round Bowl – Small',
    nameAr: 'غطاء للطبق الدائري – صغير',
    internalName: 'غطاء همبة h1',
    category: 'lids',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/lid-bowl-h1/600/600',
    artCode: '116-h1',
    material: 'PP',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Lid for Round Bowl – Medium',
    nameAr: 'غطاء للطبق الدائري – وسط',
    internalName: 'غطاء همبة h3',
    category: 'lids',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/lid-bowl-h3/600/600',
    artCode: '116-h3',
    material: 'PP',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Lid for Spice & Marinade Cup',
    nameAr: 'غطاء كوب التتبيلة والبهارات',
    internalName: 'غطاء تتبيلة',
    category: 'lids',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/lid-spice-73/600/600',
    artCode: '73-flat',
    material: 'PP',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Snap-Grip Lid for Sauce Cup',
    nameAr: 'غطاء بمسكة لكوب الصلصة',
    internalName: 'غطاء 116 خُمس + مسكة',
    category: 'lids',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/lid-116-fifth-g/600/600',
    artCode: '116-fifth-g',
    material: 'PP',
    piecesPerBox: undefined,
  },
  {
    nameEn: 'Dome Lid for Large Serving Bowl',
    nameAr: 'غطاء قبة للطبق الكبير',
    internalName: 'غطاء فتة 190 · قبة',
    category: 'lids',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/lid-190-dome/600/600',
    artCode: '190-dome',
    material: 'PP',
    piecesPerBox: undefined,
  },

  // ─── PAPER CUP LIDS ──────────────────────────────────────────────────────────

  {
    nameEn: 'Paper Cup Lid',
    nameAr: 'غطاء كوب ورقي',
    category: 'papercup-lids',
    options: {},
    image: 'https://picsum.photos/seed/lid-papercup/600/600',
    artCode: '000',
    material: '',
    piecesPerBox: undefined,
  },

]

export const products: Product[] = rawProducts.map(withSlug)

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}
