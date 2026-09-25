import { getSiteContent } from '@/lib/data'
import { businessLd, faqLd } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { SiteChrome } from '@/components/site/chrome'
import { Intro } from '@/components/site/intro'
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

export default async function Home() {
  const content = await getSiteContent()
  const { settings, products, projects, reviews } = content

  return (
    <>
      <Intro />
      <SiteChrome content={content}>
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
      </SiteChrome>
      <JsonLd data={[businessLd(settings, products), faqLd(settings)]} />
    </>
  )
}
