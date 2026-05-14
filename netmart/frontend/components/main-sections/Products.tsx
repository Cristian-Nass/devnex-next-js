import {ReactNode} from 'react';
import {Ubuntu} from 'next/font/google';
import {cn} from '@/lib/utils';
import ClickToLink from '@/components/main-sections/ClickToLink';
import {ArrowRightIcon} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {ShoppingCart, Pizza, Building, FileText, Code} from 'lucide-react';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const productIds = [
  'shop',
  'restaurant',
  'enterprise',
  'wordPress',
  'easyWithoutDeveloper',
] as const;

const productIcons: Record<(typeof productIds)[number], ReactNode> = {
  shop: <ShoppingCart />,
  restaurant: <Pizza />,
  enterprise: <Building />,
  wordPress: <FileText />,
  easyWithoutDeveloper: <Code />,
};

const products = productIds.map((id) => ({
  id,
  icon: productIcons[id],
}));

type ProductsProps = {
  locale: string;
};

export default async function Products({locale}: ProductsProps) {
  const t = await getTranslations('ProductsSection');
  const readMoreCta = t('readMoreCta');
  const builderUrl =
    process.env.NEXT_PUBLIC_WEB_BUILDER_URL ?? 'https://builder.netmart.se';
  const builderHref = `${builderUrl.replace(/\/$/, '')}/${locale}/builder`;

  return (
    <section
      id="products"
      className="min-h-screen snap-start scroll-mt-14 py-16 md:py-20 lg:py-24 flex items-center bg-blue-100"
      aria-labelledby="products-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2
            id="products-heading"
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4',
              ubuntu.className,
            )}>
            {t('heading')}
          </h2>
          <p
            className={cn(
              'text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4',
              ubuntu.className,
            )}>
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 hover:border-primary transition-all duration-300 hover:-translate-y-2 group cursor-default flex flex-col">
              <div className="mb-4 flex items-center gap-2 justify-left">
                <div className="text-cyan-700">{product.icon}</div>
                <h3
                  className={cn(
                    'text-2xl font-bold text-gray-900',
                    ubuntu.className,
                  )}>
                  {t(`items.${product.id}.title`)}
                </h3>
              </div>
              <div className="flex-1 min-h-0">
                <p className={cn('text-gray-600 mb-4', ubuntu.className)}>
                  {t(`items.${product.id}.description`)}
                </p>
                <ul className="space-y-2 h-[240px] overflow-y-auto">
                  {Array.from({
                    length: t.raw(`items.${product.id}.features`).length,
                  }).map((_, idx) => (
                    <li
                      key={idx}
                      className={cn(
                        'flex items-center text-gray-700',
                        ubuntu.className,
                      )}>
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className={cn('text-gray-700', ubuntu.className)}>
                        {t(`items.${product.id}.features.${idx}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <ClickToLink href={builderHref}>
                  <span className={cn('text-gray-100', ubuntu.className)}>
                    {readMoreCta}
                  </span>
                  <ArrowRightIcon className="w-4 h-4" />
                </ClickToLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
