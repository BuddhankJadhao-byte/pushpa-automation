import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteContent } from '@/lib/data'
import { breadcrumbLd, productLd } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { SiteChrome } from '@/components/site/chrome'
import { ProductPage } from '@/components/site/detail-pages'

type Props = { params: Promise<{ slug: string }> }

async function find(slug: string) {
  const content = await getSiteContent()
  return { content, product: content.products.find((p) => p.slug === slug) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await find((await params).slug)
  if (!product) return { title: 'Panel not found' }
  const description =
    product.summary ||
    `${product.name}${product.price ? ` — ${product.price}` : ''}. Built in MIDC Bhosari, Pune by Pushpa Automation & Robotics Industries.`
  return {
    title: `${product.name}${product.price ? ` — ${product.price}` : ''}`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      ...(product.image ? { images: [{ url: product.image, alt: product.name }] } : {}),
    },
  }
}

export default async function Page({ params }: Props) {
  const { content, product } = await find((await params).slug)
  if (!product) notFound()
  const sameCategory = content.products.filter((p) => p.id !== product.id && p.category === product.category)
  const related = [...sameCategory, ...content.products.filter((p) => p.id !== product.id && p.category !== product.category)].slice(0, 3)

  return (
    <>
      <SiteChrome content={content}>
        <ProductPage product={product} related={related} settings={content.settings} />
      </SiteChrome>
      <JsonLd
        data={[
          productLd(product),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Panels', path: '/#products' },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
    </>
  )
}
