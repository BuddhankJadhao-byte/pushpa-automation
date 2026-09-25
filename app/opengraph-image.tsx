import { ImageResponse } from 'next/og'

// Branded preview shown when the site is shared on WhatsApp, LinkedIn, Facebook, X…
export const alt = 'Pushpa Automation & Robotics Industries — control panels built in MIDC Bhosari, Pune'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'radial-gradient(circle at 80% 10%, rgba(245,165,36,0.25), transparent 50%), #0a0a0b',
          color: '#f4f4f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '6px solid #f4f4f5',
              borderBottomColor: 'transparent',
              padding: '10px 26px',
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            PA &amp; RI
          </div>
          <div style={{ fontSize: 22, letterSpacing: 8, color: '#f5a524' }}>BORN TO FLY</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Control panels built to</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: '#f5a524' }}>keep your plant running.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: '#a1a1aa' }}>
            PLC-HMI · VFD · Star-delta · Flameproof — Pushpa Automation &amp; Robotics Industries
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#a1a1aa' }}>
          <span>MIDC Bhosari, Pune · +91 79727 41546</span>
          <span style={{ color: '#f5a524' }}>Rated 5.0 on Google</span>
        </div>
      </div>
    ),
    size,
  )
}
