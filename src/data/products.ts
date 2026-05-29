import type { Product } from '@/types'

export const products: Product[] = [

  // ─── CUPS ───────────────────────────────────────────────────────────────────

  {
    slug: 'cup-1-5',
    nameEn: 'Cup 1/5',
    nameAr: 'كوب 1/5',
    descriptionEn:
      'Small 1/5 disposable cup available in white, green, black, and clear. Suitable for espresso, short beverages, and sauce portions. Sold in cartons of 500–1,000 units.',
    descriptionAr:
      'كوب بلاستيكي صغير حجم 1/5 متوفر بألوان أبيض وأخضر وأسود وشفاف. مناسب للإسبريسو والمشروبات القصيرة وأجزاء الصلصة. يُباع في كراتين من 500 إلى 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Green', 'Black', 'Clear'] },
    image: 'https://picsum.photos/seed/cup-1-5/600/400',
  },
  {
    slug: 'cup-1-3',
    nameEn: 'Cup 1/3',
    nameAr: 'كوب 1/3',
    descriptionEn:
      'Medium 1/3 disposable cup in white and black. A versatile size for tea, coffee, and cold beverages in cafes and offices. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي متوسط حجم 1/3 باللون الأبيض والأسود. حجم متعدد الاستخدامات للشاي والقهوة والمشروبات الباردة في المقاهي والمكاتب. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/cup-1-3/600/400',
  },
  {
    slug: 'cup-1-2',
    nameEn: 'Cup 1/2',
    nameAr: 'كوب 1/2',
    descriptionEn:
      'Large 1/2 disposable cup in white and clear. Popular for cold drinks, juices, and smoothies. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي كبير حجم 1/2 باللون الأبيض والشفاف. شائع للمشروبات الباردة والعصائر. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/cup-1-2/600/400',
  },
  {
    slug: 'cup-22g',
    nameEn: '22g Cup',
    nameAr: 'كوب 22 غم',
    descriptionEn:
      'Lightweight 22g disposable cup in red and black. An economical choice for high-volume catering, events, and institutional food service. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي خفيف 22 غم باللون الأحمر والأسود. خيار اقتصادي للتموين بكميات كبيرة والفعاليات والخدمات المؤسسية. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Red', 'Black'] },
    image: 'https://picsum.photos/seed/cup-22g/600/400',
  },
  {
    slug: 'cup-33g',
    nameEn: '33g Cup',
    nameAr: 'كوب 33 غم',
    descriptionEn:
      'Standard 33g disposable cup in white, black, and red. A reliable everyday cup for offices, cafeterias, and general beverage service. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي قياسي 33 غم بألوان أبيض وأسود وأحمر. كوب يومي موثوق للمكاتب والكافيتيريات وخدمات المشروبات العامة. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Black', 'Red'] },
    image: 'https://picsum.photos/seed/cup-33g/600/400',
  },
  {
    slug: 'cup-33g-k',
    nameEn: '33g K-Series Cup',
    nameAr: 'كوب 33 غم فئة K',
    descriptionEn:
      'K-series 33g cup with improved wall structure for better durability. Available in white and red. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب 33 غم من فئة K بهيكل جدار محسّن لمتانة أفضل. متوفر باللون الأبيض والأحمر. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Red'] },
    image: 'https://picsum.photos/seed/cup-33g-k/600/400',
  },
  {
    slug: 'cup-44g',
    nameEn: '44g Cup',
    nameAr: 'كوب 44 غم',
    descriptionEn:
      'Heavy-duty 44g black cup. The higher material weight provides a sturdy feel for premium beverage service and corporate catering. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي ثقيل 44 غم أسود. الوزن الأعلى يمنح شعوراً بالمتانة لخدمة المشروبات الراقية وتموين الشركات. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-44g/600/400',
  },
  {
    slug: 'cup-32g',
    nameEn: '32g Cup',
    nameAr: 'كوب 32 غم',
    descriptionEn:
      'Mid-weight 32g black cup balancing cost and durability for everyday beverage service. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي متوسط الوزن 32 غم أسود يوازن بين التكلفة والمتانة للاستخدام اليومي. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-32g/600/400',
  },
  {
    slug: 'cup-330ml',
    nameEn: '330ml Cup',
    nameAr: 'كوب 330 مل',
    descriptionEn:
      'Black 330ml disposable cup, matching the standard beverage-can size. Widely used for soft drinks, juices, and cold beverages. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي أسود 330 مل يعادل الحجم القياسي لعلب المشروبات. شائع للمشروبات الغازية والعصائر. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-330ml/600/400',
  },
  {
    slug: 'cup-talin',
    nameEn: 'Talin Cup',
    nameAr: 'كوب تالين',
    descriptionEn:
      'Talin-model black disposable cup with an elegant slender profile. Popular in cafes and premium beverage service. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب تالين أسود بتصميم أنيق ورشيق. شائع في المقاهي وخدمات المشروبات الراقية. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-talin/600/400',
  },
  {
    slug: 'cup-talin-2',
    nameEn: 'Talin 2 Cup',
    nameAr: 'كوب تالين 2',
    descriptionEn:
      'Second-generation Talin cup in black with a wider base for better stability and a smooth drinking rim. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب تالين الجيل الثاني أسود بقاعدة أوسع للاستقرار وحافة شرب ناعمة. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-talin-2/600/400',
  },
  {
    slug: 'cup-talin-3',
    nameEn: 'Talin 3 Cup',
    nameAr: 'كوب تالين 3',
    descriptionEn:
      'Third-generation Talin cup with refined design and improved grip. A premium disposable option for modern cafes. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب تالين الجيل الثالث بتصميم محسّن وإمساك أفضل. خيار راقٍ للمقاهي الحديثة. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/cup-talin-3/600/400',
  },
  {
    slug: 'cup-9oz',
    nameEn: '9oz Cup',
    nameAr: 'كوب 9 أونص',
    descriptionEn:
      'Black 9oz (≈270ml) disposable cup. Popular for cold drinks, water cups, and food stalls. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بلاستيكي أسود 9 أونص (حوالي 270 مل). شائع للمشروبات الباردة وأكواب المياه. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-9oz/600/400',
  },
  {
    slug: 'cup-16oz',
    nameEn: '16oz Cup',
    nameAr: 'كوب 16 أونص',
    descriptionEn:
      'Large 16oz (≈475ml) cup in black and white. Ideal for smoothies, iced drinks, and large cold beverages in cafes and juice bars. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب كبير 16 أونص (حوالي 475 مل) باللون الأسود والأبيض. مثالي للعصائر والمشروبات المثلجة في المقاهي وبارات العصير. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black', 'White'] },
    image: 'https://picsum.photos/seed/cup-16oz/600/400',
  },
  {
    slug: 'cup-118ml',
    nameEn: '118ml Cup',
    nameAr: 'كوب 118 مل',
    descriptionEn:
      'Compact 118ml cup ideal for espresso, sauce portions, and small sample servings. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب صغير 118 مل مثالي للإسبريسو وأجزاء الصلصة وعينات التذوق الصغيرة. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/cup-118ml/600/400',
  },
  {
    slug: 'cup-cocktail',
    nameEn: 'Cocktail Cup',
    nameAr: 'كوب كوكتيل',
    descriptionEn:
      'Black cocktail-style cup with an elegant tapered design. Suitable for beverage bars, parties, and premium food service. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب كوكتيل أسود بتصميم مخروطي أنيق. مناسب لبارات المشروبات والحفلات وخدمات الطعام الراقية. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['Black'] },
    image: 'https://picsum.photos/seed/cup-cocktail/600/400',
  },
  {
    slug: 'cup-plain',
    nameEn: 'Plain Cup',
    nameAr: 'كوب ساده',
    descriptionEn:
      'Plain smooth-wall cup available in white, orange, brown, and cream. Clean finish suitable for branded printing and a range of beverage service settings. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب ساده بجدران ناعمة متوفر بألوان أبيض وبرتقالي وبني وكريمي. تشطيب نظيف يناسب الطباعة وبيئات خدمة المشروبات المتنوعة. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Orange', 'Brown', 'Cream'] },
    image: 'https://picsum.photos/seed/cup-plain/600/400',
  },
  {
    slug: 'cup-ps-200ml',
    nameEn: 'PS Cup 200ml',
    nameAr: 'كوب PS 200 مل',
    descriptionEn:
      'Polystyrene 200ml cup in white and blue. Standard cafe size for espresso drinks, tea, and hot beverages. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بولي ستايرين PS حجم 200 مل باللون الأبيض والأزرق. الحجم القياسي لمقاهي الإسبريسو والشاي والمشروبات الساخنة. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White', 'Blue'] },
    image: 'https://picsum.photos/seed/cup-ps-200ml/600/400',
  },
  {
    slug: 'cup-ps-120ml',
    nameEn: 'PS Cup 120ml',
    nameAr: 'كوب PS 120 مل',
    descriptionEn:
      'Small 120ml polystyrene cup in white. Ideal for espresso, water cooler cups, and sample servings. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بولي ستايرين صغير 120 مل أبيض. مثالي للإسبريسو وأكواب برادات المياه وعينات التذوق. يُباع في كراتين من 1000 حبة.',
    category: 'cups',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/cup-ps-120ml/600/400',
  },
  {
    slug: 'cup-250ml',
    nameEn: 'Cup 250ml',
    nameAr: 'كوب 250 مل',
    descriptionEn:
      'Clear 250ml cup. The transparent body shows the beverage, making it popular for juices, iced coffee, and colourful cold drinks. Sold in cartons of 1,500 units.',
    descriptionAr:
      'كوب شفاف 250 مل. الجسم الشفاف يُظهر المشروب مما يجعله شائعاً للعصائر والقهوة المثلجة والمشروبات الملوّنة. يُباع في كراتين من 1500 حبة.',
    category: 'cups',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/cup-250ml/600/400',
  },

  // ─── CONTAINERS ─────────────────────────────────────────────────────────────

  {
    slug: 'spice-jar',
    nameEn: 'Spice Jar',
    nameAr: 'علبة تتبيلة',
    descriptionEn:
      'Plastic spice/condiment jar available in small, 25g, and 75g sizes. Suitable for restaurants, food-service, and retail packaging of dry spices and condiments. Sold in cartons of 1,000–4,000 units depending on size.',
    descriptionAr:
      'علبة بلاستيكية للتوابل والتتبيلة متوفرة بأحجام صغير و25 غم و75 غم. مناسبة للمطاعم وخدمات الطعام وتغليف التجزئة للتوابل الجافة. تُباع في كراتين من 1000 إلى 4000 حبة حسب الحجم.',
    category: 'containers',
    options: { sizes: ['Small', '25g', '75g'], colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/spice-jar/600/400',
  },
  {
    slug: 'bucket-ps',
    nameEn: 'PS Bucket',
    nameAr: 'سطل PS',
    descriptionEn:
      'Food-grade polystyrene bucket with lid. Suitable for storing dips, sauces, and bulk condiments. Lightweight and stackable for efficient storage. Sold in cartons of 1,000 units.',
    descriptionAr:
      'سطل بولي ستايرين معتمد للاستخدام الغذائي مع غطاء. مناسب لتخزين الغموس والصلصات والتوابل بالجملة. خفيف وقابل للتكديس. يُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/bucket-ps/600/400',
  },
  {
    slug: 'bucket',
    nameEn: 'Storage Bucket',
    nameAr: 'سطل تخزين',
    descriptionEn:
      'Food-grade plastic storage bucket available in 2L and 3L. Ideal for sauces, labneh, ice cream, and bulk condiment storage. Sold in cartons of 1,000 units.',
    descriptionAr:
      'سطل بلاستيكي معتمد للاستخدام الغذائي بسعتي 2 لتر و3 لتر. مثالي لتخزين الصلصات واللبنة والبوظة والتوابل. يُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { sizes: ['2L', '3L'] },
    image: 'https://picsum.photos/seed/bucket-storage/600/400',
  },
  {
    slug: 'ice-cream-cup',
    nameEn: 'Ice Cream Cup 125g',
    nameAr: 'كوب بوظة 125 غم',
    descriptionEn:
      'PET ice cream cup, 125g capacity. PET material ensures excellent clarity and maintains structural integrity when frozen. Suitable for gelato shops and retail. Sold in cartons of 1,000 units.',
    descriptionAr:
      'كوب بوظة PET بسعة 125 غم. مادة PET تضمن شفافية ممتازة وتحافظ على المتانة عند التجميد. مناسب لمحلات الجيلاتو والتجزئة. يُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/ice-cream-cup/600/400',
  },
  {
    slug: 'container-hummus',
    nameEn: 'Hummus Container',
    nameAr: 'علبة حمص',
    descriptionEn:
      'Standard food-grade hummus container with secure snap-on lid. Designed for portion-packed hummus, labneh, and dips. Suitable for supermarket retail and wholesale. Sold in cartons of 1,000 units.',
    descriptionAr:
      'علبة حمص بلاستيكية معتمدة غذائياً مع غطاء محكم. مصممة لتعبئة الحمص واللبنة والغموس. مناسبة لبيع التجزئة والجملة. تُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-hummus/600/400',
  },
  {
    slug: 'container-hummus-abu-samir',
    nameEn: 'Hummus Container — Abu Samir',
    nameAr: 'علبة حمص أبو سمير',
    descriptionEn:
      'Abu Samir–specification hummus container manufactured to precise dimensions for food-producer packaging lines. Sold in cartons of 450 units.',
    descriptionAr:
      'علبة حمص بمواصفات أبو سمير مصنوعة بأبعاد دقيقة لخطوط تغليف المنتجين. تُباع في كراتين من 450 حبة.',
    category: 'containers',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/container-hummus-abusamir/600/400',
  },
  {
    slug: 'container-hummus-al-aysar',
    nameEn: 'Hummus Container — Al-Aysar',
    nameAr: 'علبة حمص الأيسر',
    descriptionEn:
      'Al-Aysar–specification hummus container with unique dimensional requirements for specific food brands. Sold in cartons of 450 units.',
    descriptionAr:
      'علبة حمص بمواصفات الأيسر بأبعاد خاصة لعلامات غذائية محددة. تُباع في كراتين من 450 حبة.',
    category: 'containers',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/container-hummus-alaysar/600/400',
  },
  {
    slug: 'container-fatteh-domed-450',
    nameEn: 'Fatteh Container 450g — Domed',
    nameAr: 'علبة فتة 450 غم قبة',
    descriptionEn:
      '450g fatteh container with a domed lid for extra headroom on garnished dishes. Suitable for take-away and retail. Sold in cartons of 300 units.',
    descriptionAr:
      'علبة فتة 450 غم مع غطاء قبة لمساحة إضافية على الأطباق المزينة. مناسبة للوجبات الجاهزة والتجزئة. تُباع في كراتين من 300 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-fatteh-domed/600/400',
  },
  {
    slug: 'container-fatteh-flat',
    nameEn: 'Fatteh Container — Flat',
    nameAr: 'علبة فتة فلات',
    descriptionEn:
      'Fatteh container with a flat lid for space-efficient stacking and display. Suitable for take-away and food-service packaging. Sold in cartons of 300 units.',
    descriptionAr:
      'علبة فتة مع غطاء مسطح لتكديس وعرض فعّال. مناسبة للوجبات الجاهزة وخدمات الطعام. تُباع في كراتين من 300 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-fatteh-flat/600/400',
  },
  {
    slug: 'container-fatteh-750',
    nameEn: 'Fatteh Container 750g',
    nameAr: 'علبة فتة 750 غم',
    descriptionEn:
      'Large 750g fatteh container available in white and black. Ideal for full-portion take-away and deli packaging. Pairs with matching fatteh lids. Sold in cartons of 150 units (container + lid).',
    descriptionAr:
      'علبة فتة كبيرة 750 غم متوفرة باللون الأبيض والأسود. مثالية لوجبات التوصيل الكاملة وتغليف الدلي. تُباع في كراتين من 150 (علبة + غطاء).',
    category: 'containers',
    options: { colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/container-fatteh-750/600/400',
  },
  {
    slug: 'container-fatteh-1000',
    nameEn: 'Fatteh Container 1000g',
    nameAr: 'علبة فتة 1000 غم',
    descriptionEn:
      'Large-format 1,000g fatteh container for family-portion packaging, deli counters, and bulk food-service supply. Sold in cartons of 150 units (container + lid).',
    descriptionAr:
      'علبة فتة 1000 غم للتغليف العائلي وعدادات الدلي والتوريد الغذائي بالجملة. تُباع في كراتين من 150 (علبة + غطاء).',
    category: 'containers',
    options: { colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/container-fatteh-1000/600/400',
  },
  {
    slug: 'lid-fatteh-750',
    nameEn: 'Fatteh Container Lid 750g',
    nameAr: 'غطاء علبة فتة 750 غم',
    descriptionEn:
      'White replacement lid for 750g fatteh containers. Secure snap-on fit. Available for separate purchase for high-volume operations. Sold in cartons of 300 units.',
    descriptionAr:
      'غطاء بديل أبيض لعلب الفتة 750 غم. تركيب محكم. متاح للشراء المنفصل للعمليات ذات الطلبيات الكبيرة. يُباع في كراتين من 300 حبة.',
    category: 'containers',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/lid-fatteh-750/600/400',
  },
  {
    slug: 'lid-fatteh-flat-2',
    nameEn: 'Fatteh Container Lid — Flat 2',
    nameAr: 'غطاء فتة فلات 2',
    descriptionEn:
      'Second-type flat lid for fatteh containers. Available in white. Sold in cartons of 300 units.',
    descriptionAr:
      'غطاء مسطح من النوع الثاني لعلب الفتة. متوفر باللون الأبيض. يُباع في كراتين من 300 حبة.',
    category: 'containers',
    options: { colors: ['White'] },
    image: 'https://picsum.photos/seed/lid-fatteh-flat2/600/400',
  },
  {
    slug: 'lid-rice-flat',
    nameEn: 'Rice Container Lid — Flat',
    nameAr: 'غطاء وعاء رز فلات',
    descriptionEn:
      'Flat lid for rice containers used in portion-packed rice and grain products. Sold in cartons of 450 units.',
    descriptionAr:
      'غطاء مسطح لأوعية الرز المستخدمة في تعبئة الرز والحبوب. يُباع في كراتين من 450 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/lid-rice-flat/600/400',
  },
  {
    slug: 'lid-rice-high-dome',
    nameEn: 'Rice Container Lid — High Dome',
    nameAr: 'غطاء وعاء رز قبة عالي',
    descriptionEn:
      'High-dome lid for rice containers. The raised dome provides extra space for garnished rice dishes and mounded servings. Sold in cartons of 450 units.',
    descriptionAr:
      'غطاء قبة عالٍ لأوعية الرز. يوفر مساحة إضافية لأطباق الرز المزينة والحصص المكوّمة. يُباع في كراتين من 450 حبة.',
    category: 'containers',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/lid-rice-dome/600/400',
  },
  {
    slug: 'container-h1-set',
    nameEn: 'H1 Container with Lid',
    nameAr: 'علبة H1 مع غطاء',
    descriptionEn:
      'H1-series container sold complete with matching lid. Food-grade and stackable for deli, take-away, and food-service packaging. Sold in cartons of 1,000 units.',
    descriptionAr:
      'علبة من الفئة H1 تُباع مع الغطاء المطابق. معتمدة غذائياً وقابلة للتكديس. تُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-h1-set/600/400',
  },
  {
    slug: 'container-h1',
    nameEn: 'H1 Container',
    nameAr: 'علبة H1',
    descriptionEn:
      'H1-series container without lid. For operations that source lids separately or already hold existing lid stock. Sold in cartons of 1,500 units.',
    descriptionAr:
      'علبة من الفئة H1 بدون غطاء. للعمليات التي تشتري الأغطية بشكل منفصل. تُباع في كراتين من 1500 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-h1/600/400',
  },
  {
    slug: 'lid-h1',
    nameEn: 'H1 Lid',
    nameAr: 'غطاء H1',
    descriptionEn:
      'Replacement or separate-purchase lid for H1-series containers. Snap-on fit. Sold in cartons of 3,000 units.',
    descriptionAr:
      'غطاء بديل أو للشراء المنفصل لعلب الفئة H1. تركيب محكم. يُباع في كراتين من 3000 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/lid-h1/600/400',
  },
  {
    slug: 'container-h3',
    nameEn: 'H3 Container',
    nameAr: 'علبة H3',
    descriptionEn:
      'H3-series container for mid-size food portions. Suitable for dips, salads, and take-away sides. Compatible with H3 flat and dome lids. Sold in cartons of 1,000 units.',
    descriptionAr:
      'علبة من الفئة H3 للحصص الغذائية المتوسطة. مناسبة للغموس والسلطات ومرفقات الوجبات. تُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-h3/600/400',
  },
  {
    slug: 'lid-h3',
    nameEn: 'H3 Domed Lid',
    nameAr: 'غطاء H3 قبة',
    descriptionEn:
      'Domed lid for H3-series containers. Extra headroom for garnished dishes and mounded food. Sold in cartons of 1,000 units.',
    descriptionAr:
      'غطاء قبة لعلب الفئة H3. مساحة إضافية للأطباق المزينة والطعام المكوّم. يُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { colors: ['Clear'] },
    image: 'https://picsum.photos/seed/lid-h3/600/400',
  },
  {
    slug: 'container-h4',
    nameEn: 'H4 Container with Lid',
    nameAr: 'علبة H4 مع غطاء',
    descriptionEn:
      'H4-series rectangular container with lid, available in 200ml, 250ml, and 350ml. Suitable for sauces, sides, salads, and meal-prep packaging. Sold in cartons of 1,000 units.',
    descriptionAr:
      'علبة مستطيلة من الفئة H4 مع غطاء، بسعات 200 مل و250 مل و350 مل. مناسبة للصلصات والمرفقات والسلطات. تُباع في كراتين من 1000 حبة.',
    category: 'containers',
    options: { sizes: ['200ml', '250ml', '350ml'], colors: ['White', 'Clear'] },
    image: 'https://picsum.photos/seed/container-h4/600/400',
  },

  // ─── SPECIALTY ───────────────────────────────────────────────────────────────

  {
    slug: 'plate-shawarma',
    nameEn: 'Divided Shawarma Plate',
    nameAr: 'صحن شاورما مقسم',
    descriptionEn:
      'Divided plastic plate designed for shawarma and mixed-grill servings. Multiple compartments keep sides and sauces separated. Suitable for fast-food outlets and catering. Sold in cartons of 300 units.',
    descriptionAr:
      'صحن بلاستيكي مقسم مصمم للشاورما والمشاوي المختلطة. أقسام متعددة تفصل المرفقات والصلصات. مناسب لمطاعم الوجبات السريعة والتموين. يُباع في كراتين من 300 حبة.',
    category: 'specialty',
    options: { colors: ['White', 'Black'] },
    image: 'https://picsum.photos/seed/plate-shawarma/600/400',
  },
  {
    slug: 'carton-yasmine',
    nameEn: 'Yasmine Printed Carton',
    nameAr: 'كرتون مطبوع الياسمين',
    descriptionEn:
      'Small carton printed with the Yasmine Plastics brand. Used for product packaging and retail distribution. Contact us for bulk pricing and availability.',
    descriptionAr:
      'كرتون صغير مطبوع بعلامة الياسمين للبلاستيك. يُستخدم لتغليف المنتجات والتوزيع بالتجزئة. تواصل معنا للأسعار بالجملة.',
    category: 'specialty',
    options: {},
    image: 'https://picsum.photos/seed/carton-yasmine/600/400',
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}
