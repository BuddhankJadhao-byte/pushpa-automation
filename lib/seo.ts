// schema.org structured data. Google shows it as rich results (price, FAQ, breadcrumbs,
// business details), and AI answer engines use it to describe the business accurately.
import { faqItems, telLink, type Product, type Project, type Settings } from './content.ts'
import { BUSINESS_NAME, SITE_URL, absoluteUrl } from './site.ts'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const BUSINESS_ID = `${SITE_URL}/#business`

/** "₹4,00,000" → 400000. Null for "On request" or anything without a number. */
export function priceValue(price: string) {
  const match = /\d[\d,]*(\.\d+)?/.exec(price)
  const value = match ? Number(match[0].replace(/,/g, '')) : NaN
  return Number.isFinite(value) && value > 0 ? value : null
}

export function businessLd(s: Settings, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Manufacturer'],
    '@id': BUSINESS_ID,
    name: BUSINESS_NAME,
    alternateName: 'PA & RI',
    slogan: 'Born to fly',
    description:
      'Industrial automation company and control panel manufacturer in MIDC Bhosari, Pune: PLC-HMI panels, VFD drive panels, star-delta starters, flameproof (Ex-d) panels, sensors, PLC programming and commissioning.',
    url: SITE_URL,
    logo: absoluteUrl('/icon.svg'),
    image: absoluteUrl('/images/plc_hmi_panel.jpg'),
    telephone: telLink(s.phone).slice(4),
    email: s.email,
    priceRange: '₹6,500 – ₹4,00,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      addressLocality: 'Pimpri-Chinchwad, Pune',
      addressRegion: 'Maharashtra',
      postalCode: '411026',
      addressCountry: 'IN',
    },
    areaServed: [{ '@type': 'City', name: 'Pune' }, { '@type': 'State', name: 'Maharashtra' }, { '@type': 'Country', name: 'India' }],
    openingHoursSpecification: s.openDays.length
      ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: s.openDays.map((d) => DAY_NAMES[d]), opens: s.opensAt, closes: s.closesAt }]
      : undefined,
    sameAs: [s.mapsUrl, s.youtubeUrl].filter(Boolean),
    knowsAbout: ['PLC programming', 'HMI', 'SCADA', 'Variable frequency drives', 'Star-delta starters', 'Flameproof enclosures', 'Industrial sensors'],
    aggregateRating:
      /^\d+(\.\d+)?$/.test(s.statRating) && /^\d+\+?$/.test(s.statReviews)
        ? { '@type': 'AggregateRating', ratingValue: s.statRating, reviewCount: s.statReviews.replace('+', ''), bestRating: '5' }
        : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Control panels and automation products',
      itemListElement: products.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: p.name, url: absoluteUrl(`/products/${p.slug}`) } })),
    },
  }
}

export function faqLd(s: Settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems(s).map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
}

export function productLd(p: Product) {
  const price = priceValue(p.price)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.summary || undefined,
    image: p.image ? absoluteUrl(p.image) : undefined,
    category: p.category,
    brand: p.oem ? { '@type': 'Brand', name: p.oem } : undefined,
    manufacturer: { '@id': BUSINESS_ID },
    url: absoluteUrl(`/products/${p.slug}`),
    additionalProperty: p.specs.map((spec) => {
      const [name, ...rest] = spec.split(':')
      return rest.length ? { '@type': 'PropertyValue', name: name.trim(), value: rest.join(':').trim() } : { '@type': 'PropertyValue', name: 'Specification', value: spec }
    }),
    offers: price
      ? { '@type': 'Offer', price, priceCurrency: 'INR', availability: 'https://schema.org/InStock', seller: { '@id': BUSINESS_ID }, url: absoluteUrl(`/products/${p.slug}`) }
      : undefined,
  }
}

export function projectLd(p: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    about: p.client || undefined,
    description: p.summary || undefined,
    image: p.image ? absoluteUrl(p.image) : undefined,
    locationCreated: p.location ? { '@type': 'Place', name: p.location } : undefined,
    dateCreated: /^\d{4}$/.test(p.year) ? p.year : undefined,
    creator: { '@id': BUSINESS_ID },
    url: absoluteUrl(`/work/${p.slug}`),
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  }
}
