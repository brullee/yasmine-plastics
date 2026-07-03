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
  const title = t('privacyTitle')
  const description = t('privacyDescription')
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/privacy'),
    openGraph: {
      title,
      description,
      url: localeUrl(locale, '/privacy'),
      type: 'website',
      siteName: brandName(locale),
    },
  }
}

export default async function PrivacyPage({
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
          {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
          {isAr ? 'آخر تحديث: يوليو 2026' : 'Last updated: July 2026'}
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/10">
        {isAr ? (
          <>
            <section className="pb-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">المعلومات التي تُقدّمها</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">عند ملء نموذج التواصل أو طلب عرض السعر، نجمع اسمك وعنوان بريدك الإلكتروني ورقم هاتفك والتفاصيل التي تقدّمها. تُرسل هذه المعلومات مباشرةً إلى صندوق بريدنا ولا تُخزَّن في أي قاعدة بيانات.</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">نستخدمها حصرًا للرد على استفسارك أو طلب عرض السعر. لا نبيع معلوماتك أو نشاركها أو نستخدمها لأي غرض آخر.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">كيف يعمل الموقع</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">تتضمن نماذجنا حماية من الروبوتات تعالج بيانات المتصفح للتحقق من أن الإرسال يتم بواسطة إنسان. نجمع إحصاءات مجهولة لمشاهدات الصفحات دون استخدام ملفات تعريف ارتباط للتتبع أو تسجيل أي معلومات شخصية. يُسجَّل عنوان IP الخاص بك مؤقتًا للحد من الإساءة الآلية في استخدام النماذج. في حال حدوث خطأ تقني، قد يُسجَّل برنامج مراقبة الأخطاء لدينا تفاصيل الطلب بما فيها عنوان IP.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">ملفات تعريف الارتباط</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">يستخدم هذا الموقع ملف تعريف ارتباط واحد وظيفيًا لحفظ تفضيل اللغة. لا تُستخدم ملفات تعريف ارتباط للتتبع.</p>
            </section>

            <section className="pt-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">تواصل معنا</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                هل لديك أسئلة حول هذه السياسة؟ راسلنا على{' '}
                <a href="mailto:contact@yasmineplastics.com" className="text-brand-navy dark:text-blue-400 hover:underline" dir="ltr">
                  contact@yasmineplastics.com
                </a>.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="pb-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Information you submit</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">When you fill in a contact or quote form, we collect your name, email address, phone number, and any details you provide. This information is sent directly to our business inbox and is not stored in any database.</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">We use it solely to respond to your inquiry or quote request. We do not sell, share, or use your information for any other purpose.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">How the site works</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Our forms include bot protection that processes browser data to verify human submissions. We collect anonymous page view statistics. No tracking cookies are involved and no personal information is recorded. Your IP address is temporarily logged to limit automated form abuse. If a technical error occurs, our error monitoring software may capture request details including IP address.</p>
            </section>

            <section className="py-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">This site uses one functional cookie to remember your language preference. No tracking cookies are used.</p>
            </section>

            <section className="pt-10">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Contact</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Questions about this policy? Email us at{' '}
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
