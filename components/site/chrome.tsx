import type { SiteContent } from '@/lib/content'
import { Effects } from './effects'
import { Header } from './header'
import { FloatingActions, Footer } from './footer'

/** Header, footer, cursor effects and floating buttons shared by every public page. */
export function SiteChrome({ content, children }: { content: SiteContent; children: React.ReactNode }) {
  const { settings, products, projects } = content
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <Effects />
      {settings.announcement && (
        <p className="relative z-[51] bg-accent px-4 py-2 text-center text-sm font-medium text-canvas">{settings.announcement}</p>
      )}
      <Header settings={settings} hasProjects={projects.length > 0} />
      <main id="main" className="relative z-10">
        {children}
      </main>
      <Footer settings={settings} categories={[...new Set(products.map((p) => p.category))]} />
      <FloatingActions whatsapp={settings.whatsapp} />
    </>
  )
}
