import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, localeUrl, brandName } from '@/lib/seo'
import type { Locale } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('termsTitle')
  const description = t('termsDescription')
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/terms'),
    openGraph: {
      title,
      description,
      url: localeUrl(locale, '/terms'),
      type: 'website',
      siteName: brandName(locale),
    },
  }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const isAr = locale === 'ar'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy dark:text-white mb-4">
          {isAr ? 'شروط الخدمة' : 'Terms of Service'}
        </h1>
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
          {isAr ? 'آخر تحديث: يوليو 2026' : 'Last updated: July 2026'}
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/10">
        {isAr ? (
          <>
            <section className="pb-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">الغرض من هذا الموقع</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">يُشغّل هذا الموقع شركة ياسمين للمنتجات البلاستيكية، وهي شركة تصنيع مقرها عمّان، الأردن. الموقع مخصص للاستفسارات التجارية فقط. يوفر معلومات عن منتجاتنا ويتيح للعملاء المحتملين إرسال طلبات التواصل وعروض الأسعار.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">الملكية الفكرية</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">جميع محتويات هذا الموقع، بما تشمل النصوص وأوصاف المنتجات والصور والعلامات التجارية، ملك لشركة ياسمين للمنتجات البلاستيكية. لا يُسمح بإعادة إنتاجها أو استخدامها دون إذن كتابي.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">دقة المعلومات</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">نسعى إلى أن تكون معلومات المنتجات والمواصفات والتوافر الواردة في هذا الموقع دقيقة وحديثة، غير أنها قد تتغير دون إشعار مسبق. لا ينبغي الاعتماد عليها وحدها لاتخاذ قرارات الشراء. تواصل معنا دائمًا للتأكد من التفاصيل قبل الطلب.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">القانون المطبق</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">تخضع هذه الشروط لقوانين المملكة الأردنية الهاشمية، وتختص المحاكم الأردنية بالنظر في أي نزاعات تنشأ عنها.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">التعديلات</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">يحق لنا تحديث هذه الشروط في أي وقت. استمرار استخدامك للموقع بعد نشر التعديلات يُعدّ قبولًا للشروط المُحدَّثة.</p>
            </section>

            <section className="pt-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">تواصل معنا</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                هل لديك أسئلة؟ راسلنا على{' '}
                <a href="mailto:contact@yasmineplastics.com" className="text-brand-navy dark:text-blue-400 hover:underline" dir="ltr">
                  contact@yasmineplastics.com
                </a>.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="pb-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Purpose of this site</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">This site is operated by Yasmine Co. for Plastic Products, a manufacturer based in Amman, Jordan. It is intended for business inquiries only. It provides information about our products and enables prospective customers to submit contact and quote requests.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Intellectual property</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">All content on this site, including text, product descriptions, images, and branding, is owned by Yasmine Co. for Plastic Products. Reproduction or use without written permission is not permitted.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Accuracy</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">We aim to keep product information, specifications, and availability on this site current, but details may change without notice. Do not rely on this site alone when making purchasing decisions. Always confirm the details with us before placing an order.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Governing law</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">These terms are governed by the laws of the Hashemite Kingdom of Jordan. Any disputes arising from them fall under the jurisdiction of Jordanian courts.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Changes</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">We may update these terms at any time. Continued use of the site after changes are posted constitutes your acceptance of the updated terms.</p>
            </section>

            <section className="pt-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Contact</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Questions? Email us at{' '}
                <a href="mailto:contact@yasmineplastics.com" className="text-brand-navy dark:text-blue-400 hover:underline">
                  contact@yasmineplastics.com
                </a>.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
