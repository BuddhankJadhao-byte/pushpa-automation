import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Archivo, Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pushpa Automation & Robotics Industries — Control Panels, MIDC Bhosari, Pune',
    template: '%s · Pushpa Automation & Robotics',
  },
  description:
    'PLC-HMI, VFD, star-delta and flameproof control panels engineered in MIDC Bhosari, Pune. Genuine Siemens, L&T, Schneider, ABB and Delta switchgear, factory tested, 1-year warranty. Rated 5.0 on Google.',
  keywords: [
    'control panel manufacturer Pune',
    'PLC HMI panel',
    'VFD panel',
    'star delta starter panel',
    'flameproof panel',
    'MIDC Bhosari',
    'industrial automation Pune',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Pushpa Automation & Robotics Industries',
    title: 'Pushpa Automation & Robotics Industries',
    description: 'Precision control panels engineered in MIDC Bhosari, Pune. Rated 5.0 on Google.',
    images: [{ url: '/images/plc_hmi_panel.jpg', width: 1200, height: 896, alt: 'PLC HMI control panel' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  colorScheme: 'dark',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `try{sessionStorage.getItem('pa-intro')&&document.documentElement.setAttribute('data-intro','seen')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
