/** @type {import('next').Metadata} */
import './globals.css'
import { Inter } from 'next/font/inter'
import { motion } from 'framer-motion'
import { ScrollBar } from '@react-three/drei'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pushpa Automation & Robotics Industries',
  description: 'Premier industrial automation & control panel manufacturer with interactive 3D SCADA visualization',
  keywords: ['industrial automation', 'PLC', 'VFD', 'SCADA', 'control panels', 'Pune', 'MIDC'],
  authors: [{ name: 'Pushpa Automation' }],
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased bg-pushpa-dark text-pushca-foreground">
      <body className={`${inter.className} relative min-h-screen overflow-x-hidden bg-pushpa-dark text-text-body antialiased`}>
        {/* Scroll area overlay for custom scrollbar */}
        <div className="fixed inset-0 pointer-events-none">
          <style>{`
            html {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            body::-webkit-scrollbar {
              width: 6px;
            }
            body::-webkit-scrollbar-track {
              background: oklch(12% 0.03 300);
            }
            body::-webkit-scrollbar-thumb {
              background-color: oklch(40% 0.04 300);
              border-radius: 3px;
            }
          `}</style>
        </div>

        {/* Floating decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Floating cyan spheres */}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute w-12 h-12 rounded-full bg-cyan-500 opacity-10 blur-[100px] animate-float float-delayed"></div>
            <div className="absolute w-20 h-20 rounded-full bg-cyan-500 opacity-5 blur-[150px] animate-float float" style="animation-delay: 1s;"></div>
            <div className="absolute w-8 h-8 rounded-full bg-cyan-500 opacity-15 blur-[50px] animate-float float" style="animation-delay: 3s;"></div>
          </div>

          {/* Floating amber spheres */}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute w-16 h-16 rounded-full bg-amber-500 opacity-5 blur-[200px] animate-float float-reverse" style="animation-delay: 2s;"></div>
            <div className="absolute w-12 h-12 rounded-full bg-amber-500 opacity-8 blur-[120px] animate-float float-reverse" style="animation-delay: 4s;"></div>
          </div>

          {/* Geometric pattern background */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-pushpa-dark via-pushpa-titanium-50 to-transparent" />
          </div>
        </div>

        {/* Global motion preferences */}
        <motion.styles
          attribute="data-reduce-motion"
          custom="reduce-reduce"
          default="no-reduce"
          whileInViewport={{ transition: { duration: 0.5 } }}
        />

        {/* Header with auto-appear */}
        <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-pushpa-dark/90 to-transparent pointer-events-none">
          <div className="container mx-auto h-20 w-full max-w-7xl">
            <div className="flex items-center justify-between h-full w-full">
              {/* Logo */}
              <motion.a
                href="/"
                className="flex items-center gap-3"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l2.293-2.293m0 0l-2.293-2.293m2.986 2.986l2.197 2.197m0 0l-2.197-2.197m6.32-6.32l2.197-2.197m0 0l-2.197 2.197m6.32 6.32L19.172 19.172m0 0-6.32 6.32" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-pushca-foreground">Pushpa Automation</h1>
              </motion-a>

              {/* Navigation */}
              <nav className="hidden md:block">
                <ul className="flex gap-8 text-pushca-foreground/70">
                  <li><a href="#hero" className="relative hover:text-pushca-cyan transition-colors">Overview</a></li>
                  <li><a href="#lab" className="relative hover:text-pushca-cyan transition-colors">Sensor Lab</a></li>
                  <li><a href="#walkthrough" className="relative hover:text-pushca-cyan transition-colors">Facility Tour</a></li>
                  <li><a href="#products" className="relative hover:text-pushca-cyan transition-colors">Control Panels</a></li>
                  <li><a href="#calculator" className="relative hover:text-pushca-cyan transition-colors">Cost Calculator</a></li>
                  <li><a href="#reviews" className="relative hover:text-pushca-cyan transition-colors">Reviews</a></li>
                  <li><a href="#contact" className="relative hover:text-pushca-cyan transition-colors">Contact</a></li>
                </ul>
              </nav>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4">
                <a href="#calculator"
                   className="relative inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-glow-cyan transition-all"
                   title="Calculate Panel Cost"
                >
                  Configure Panel & Quote
                </a>
                <a href="tel:+917972741546"
                   className="relative inline-flex items-center px-6 py-3 rounded-full border border-pushca-amber/30 text-pushca-amber font-medium hover:bg-pushca-amber/10 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-4h3m2 4a2 2 0 012 4v.5m1.5 1.5a2 2 0 012 4h6m-6 12h6m2-9v6m-2-9V5m3.5 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                  </svg>
                  Call Plant: 079727 41546
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pt-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-pushca-titanium-500/10 py-20 mt-auto">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* About */}
              <div>
                <h4 className="font-bold text-pushca-cyan mb-4">Pushpa Automation & Robotics</h4>
                <p className="text-pushca-muted/60 text-sm leading-relaxed">
                  Premier industrial automation & control panel manufacturer in MIDC Bhosari, Pune.
                  Specializing in PLC HMI panels, VFD drives, and custom automation solutions.
                </p>
                <div className="mt-4 flex gap-3">
                  <a href="tel:+917972741546" className="flex items-center gap-2 text-pushca-amber/70 hover:text-pushca-amber transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-4h3m2 4a2 2 0 012 4v.5m1.5 1.5a2 2 0 012 4h6m-6 12h6m2-9v6m-2-9V5m3.5 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                    </span>
                    079727 41546
                  </a>
                  <a href="https://wa.me/917972741546" className="flex items-center gap-2 text-pushca-amber/70 hover:text-pushca-amber transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.5 9.25l6.5 2.5 6.5-2.5L3.5 9.25ZM3 12l6 6v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5Z" />
                    </path>
                  </a>
                </div>
              </div>

              {/* Navigation links */}
              <div>
                <h5 className="font-semibold text-pushca-cyan mb-3">Navigation</h5>
                <ul className="space-y-2 text-pushca-foreground/70">
                  <li><a href="#hero" className="hover:text-pushca-cyan transition-colors">Overview ↗</a></li>
                  <li><a href="#lab" className="hover:text-pushca-cyan transition-colors">Sensor Lab ↗</a></li>
                  <li><a href="#walkthrough" className="hover:text-pushca-cyan transition-colors">Facility Tour ↗</a></li>
                  <li><a href="#products" className="hover:text-pushca-cyan transition-colors">Control Panels ↗</a></li>
                  <li><a href="#calculator" className="hover:text-pushca-cyan transition-colors">Cost Calculator ↗</a></li>
                  <li><a href="#reviews" className="hover:text-pushca-cyan transition-colors">Reviews ↗</a></li>
                  <li><a href="#contact" className="hover:text-pushca-cyan transition-colors">Contact ↗</a></li>
                </ul>
              </div>

              {/* Products */}
              <div>
                <h5 className="font-semibold text-pushca-cyan mb-3">Products</h5>
                <ul className="space-y-2 text-pushca-foreground/70">
                  <li><a href="#products" className="hover:text-pushca-cyan transition-colors">PLC HMI Panels ↗</a></li>
                  <li><a href="#products" className="hover:text-pushca-cyan transition-colors">VFD Drives ↗</a></li>
                  <li><a href="#products" className="hover:text-pushca-cyan transition-colors">Star Delta ↗</a></li>
                  <li><a href="#products" className="hover:text-pushca-cyan transition-colors">Flameproof ↗</a></li>
                  <li><a href="#products" className="hover:text-pushca-cyan transition-colors">Sensors ↗</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h5 className="font-semibold text-pushca-cyan mb-3">Contact</h5>
                <ul className="space-y-2 text-pushca-foreground/70">
                  <li><a href="mailto:pariindia91@gmail.com" className="hover:text-pushca-cyan transition-colors">pariindia91@gmail.com ↗</a></li>
                  <li><a href="https://maps.google.com/?q=Pushpa+Automation+MIDC+Bhosari" className="hover:text-pushca-cyan transition-colors">MIDC Bhosari ↗</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom footer */}
            <div className="pt-8 border-t border-pushca-titanium-500/10 flex flex-col md:flex-row justify-between items-center gap-4 text-pushca-muted/50 text-xs">
              <p>© 2026 Pushpa Automation & Robotics Industries. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="https://www.google.com/search?q=pushpa+automation+and+robotics+industries" className="hover:text-pushca-cyan transition-colors" targetName="_blank" relName="noopener noreferrer">Google Reviews</a>
                <a href="tel:+917972741546" className="hover:text-pushca-cyan transition-colors">Call Now</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}