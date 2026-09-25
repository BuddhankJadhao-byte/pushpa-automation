import { headers } from 'next/headers'
import { getSiteContent } from '@/lib/data'
import { telLink } from '@/lib/content'
import { Effects } from '@/components/site/effects'
import { Intro } from '@/components/site/intro'
import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Marquee } from '@/components/site/marquee'
import { Capabilities } from '@/components/site/capabilities'
import { Products } from '@/components/site/products'
import { Anatomy } from '@/components/site/anatomy'
import { Projects } from '@/components/site/projects'
import { Process } from '@/components/site/process'
import { Estimator } from '@/components/site/estimator'
import { Reviews } from '@/components/site/reviews'
import { Faq } from '@/components/site/faq'
import { Contact } from '@/components/site/contact'
import { FloatingActions, Footer } from '@/components/site/footer'

export default async function Home() {
  const [{ settings, products, projects, reviews }, nonce] = await Promise.all([
    getSiteContent(),
    headers().then((h) => h.get('x-nonce') ?? undefined),
  ])
  const categories = [...new Set(products.map((p) => p.category))]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Pushpa Automation & Robotics Industries',
    description: 'Industrial control panel manufacturer: PLC-HMI, VFD, star-delta and flameproof panels.',
    telephone: telLink(settings.phone).slice(4),
    email: settings.email,
    address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: 'Pune', addressRegion: 'Maharashtra', postalCode: '411026', addressCountry: 'IN' },
    aggregateRating: settings.statRating && /^\d+\+?$/.test(settings.statReviews)
      ? { '@type': 'AggregateRating', ratingValue: settings.statRating, reviewCount: settings.statReviews.replace('+', '') }
      : undefined,
  }

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-canvas">
        Skip to content
      </a>
      <Intro />
      <Effects />
      {settings.announcement && (
        <p className="relative z-[51] bg-accent px-4 py-2 text-center text-sm font-medium text-canvas">{settings.announcement}</p>
      )}
      <Header settings={settings} hasProjects={projects.length > 0} />
      <main id="main" className="relative z-10">
        <Hero settings={settings} />
        <Marquee />
        <Capabilities />
        <Products products={products} settings={settings} />
        <Anatomy />
        {projects.length > 0 && <Projects projects={projects} />}
        <Process />
        <Estimator settings={settings} />
        <Reviews reviews={reviews} settings={settings} />
        <Faq settings={settings} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} categories={categories} />
      <FloatingActions whatsapp={settings.whatsapp} />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
