import { getSiteContent } from '@/lib/data'
import { faqItems, hoursLabel } from '@/lib/content'
import { BUSINESS_NAME, SITE_URL } from '@/lib/site'

// Plain-text company summary for AI assistants (llmstxt.org). Always reflects the owner's latest content.
export const dynamic = 'force-dynamic'

export async function GET() {
  const { settings: s, products, projects } = await getSiteContent()
  const text = [
    `# ${BUSINESS_NAME}`,
    '',
    `> Industrial control panel manufacturer and automation company in MIDC Bhosari, Pune, India. Designs, fabricates, wires, programs and tests PLC-HMI panels, VFD drive panels, star-delta motor starters and flameproof (Ex-d) panels using genuine Siemens, L&T, Schneider Electric, ABB and Delta switchgear. Rated ${s.statRating} on Google (${s.statReviews} reviews). ${s.statPanels} panels delivered.`,
    '',
    '## Contact',
    `- Phone / WhatsApp: ${s.phone}`,
    `- Email: ${s.email}`,
    `- Address: ${s.address}`,
    `- Hours: ${hoursLabel(s)} (India time)`,
    `- Website: ${SITE_URL}`,
    '',
    '## Products',
    ...products.map((p) => `- [${p.name}](${SITE_URL}/products/${p.slug}): ${p.category}${p.price ? `, ${p.price}` : ''}. ${p.summary}`),
    '',
    '## Services',
    '- Control panel design, fabrication and wiring',
    '- PLC programming (ladder logic) and HMI / SCADA screens',
    '- VFD and motion drive integration',
    '- Sensors and field instrumentation',
    '- Installation, commissioning and troubleshooting support',
    ...(projects.length
      ? ['', '## Recent projects', ...projects.map((p) => `- [${p.title}](${SITE_URL}/work/${p.slug})${p.location ? ` — ${p.location}` : ''}${p.year ? ` (${p.year})` : ''}`)]
      : []),
    '',
    '## FAQ',
    ...faqItems(s).flatMap((f) => [`### ${f.q}`, f.a, '']),
  ].join('\n')

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
