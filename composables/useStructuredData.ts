import type { MaybeRefOrGetter } from 'vue'
import { CATEGORY_INFO, type Product } from '~~/shared/types'
import { photoUrl } from '~~/shared/photos'

/** schema.org Product + Offer, which is what makes price and stock eligible for Google rich results. */
export function useProductJsonLd(product: MaybeRefOrGetter<Product | null | undefined>) {
  const { siteUrl, siteName } = useRuntimeConfig().public
  useJsonLd(() => {
    const p = toValue(product)
    if (!p) return null
    const url = `${siteUrl}/products/${p.slug}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          '@id': `${url}#product`,
          name: p.name,
          description: p.description,
          sku: p.sku,
          image: [photoUrl(p.image, 1200, 1200)],
          material: p.material,
          category: CATEGORY_INFO[p.category].label,
          brand: { '@type': 'Brand', name: siteName },
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'KES',
            price: p.priceKes,
            availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: siteName },
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${siteUrl}/shop` },
            {
              '@type': 'ListItem',
              position: 3,
              name: CATEGORY_INFO[p.category].label,
              item: `${siteUrl}/shop/${p.category}`,
            },
            { '@type': 'ListItem', position: 4, name: p.name, item: url },
          ],
        },
      ],
    }
  })
}

/** schema.org ItemList for listing pages: tells crawlers which product pages the list links to. */
export function useItemListJsonLd(products: MaybeRefOrGetter<Product[]>) {
  const { siteUrl } = useRuntimeConfig().public
  useJsonLd(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: toValue(products).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/products/${p.slug}`,
      name: p.name,
    })),
  }))
}
