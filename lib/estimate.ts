// Indicative factory pricing (unchanged from the previous site's calculator).

export const PANEL_TYPES = {
  plc: { label: 'PLC + HMI', base: 38000, perHp: 650 },
  vfd: { label: 'VFD drive', base: 22000, perHp: 1100 },
  stardelta: { label: 'Star-delta', base: 15000, perHp: 850 },
  flameproof: { label: 'Flameproof', base: 48000, perHp: 950 },
  servo: { label: 'Servo / stepper', base: 65000, perHp: 500 },
} as const

export const BRANDS = {
  delta: { label: 'Delta', price: 4000 },
  siemens: { label: 'Siemens', price: 14000 },
  schneider: { label: 'Schneider', price: 11000 },
  relay: { label: 'Relay logic', price: 0 },
} as const

export const ENCLOSURES = {
  ip55: { label: 'IP55 CRCA', price: 0 },
  ip65: { label: 'IP65 gasketed', price: 6000 },
  ss304: { label: 'SS304 steel', price: 18000 },
} as const

export const ADDONS = {
  sensors: { label: 'Sensor package', note: 'M18 proximity + laser limit pack', price: 8500 },
  scada: { label: 'SCADA telemetry', note: 'Remote MQTT / SQL historian logging', price: 22000 },
} as const

export type EstimateInput = {
  type: keyof typeof PANEL_TYPES
  hp: number
  brand: keyof typeof BRANDS
  enclosure: keyof typeof ENCLOSURES
  addons: (keyof typeof ADDONS)[]
}

export function estimate({ type, hp, brand, enclosure, addons }: EstimateInput) {
  const panel = PANEL_TYPES[type]
  const lines = [
    { label: `${panel.label} panel · ${hp} HP`, amount: panel.base + hp * panel.perHp },
    { label: `${BRANDS[brand].label} controller`, amount: BRANDS[brand].price },
    { label: ENCLOSURES[enclosure].label, amount: ENCLOSURES[enclosure].price },
    ...addons.map((a) => ({ label: ADDONS[a].label, amount: ADDONS[a].price })),
  ]
  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) }
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
