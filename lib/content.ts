// Shapes of everything the owner can edit, plus the starter content the site
// shows until the backend is connected (and can import with one click).

export type Product = {
  id: string
  name: string
  category: string
  price: string
  summary: string
  specs: string[]
  tags: string[]
  oem: string
  image: string | null
}

export type Project = {
  id: string
  title: string
  client: string
  location: string
  year: string
  summary: string
  tags: string[]
  image: string | null
}

export type Review = {
  id: string
  author: string
  role: string
  rating: number
  body: string
}

export type Settings = {
  phone: string
  whatsapp: string
  email: string
  address: string
  opensAt: string
  closesAt: string
  openDays: number[]
  mapsUrl: string
  youtubeUrl: string
  statPanels: string
  statRating: string
  statReviews: string
  statDispatch: string
  announcement: string
}

export type SiteContent = {
  settings: Settings
  products: Product[]
  projects: Project[]
  reviews: Review[]
}

export const DEFAULT_SETTINGS: Settings = {
  phone: '+91 79727 41546',
  whatsapp: '917972741546',
  email: 'pariindia91@gmail.com',
  address: 'Rajdhani Industrial Complex, F1, EL Block, MIDC Bhosari, Pimpri-Chinchwad, Maharashtra 411026',
  opensAt: '09:00',
  closesAt: '18:00',
  openDays: [1, 2, 3, 4, 5, 6],
  mapsUrl: 'https://maps.google.com/?q=Pushpa+Automation+and+Robotics+Industries+MIDC+Bhosari+Pune',
  youtubeUrl: 'https://www.youtube.com/channel/UCRYrQLNKqdKEMk4ek9edy9w',
  statPanels: '1,500+',
  statRating: '5.0',
  statReviews: '106+',
  statDispatch: '48–72 h',
  announcement: '',
}

export const STARTER_PRODUCTS: Product[] = [
  {
    id: 'starter-plc-hmi',
    name: 'PLC HMI Automated Control Panel',
    category: 'PLC & HMI',
    price: '₹45,000',
    summary:
      'Delta or Siemens 32-bit CPU paired with a 7-inch colour touchscreen HMI, optically isolated I/O and pre-programmed ladder logic.',
    specs: [
      'CPU: Delta AS Series 32-bit SoC or Siemens S7-1200',
      'HMI: 7.0" TFT colour touchscreen, IP65 front bezel',
      'Digital I/O: 16 optocoupler-isolated inputs / 16 relay outputs',
      'Analog: 4 channels 4–20 mA / 0–10 V DC for RTD and pressure sensors',
      'Enclosure: 14-gauge CRCA steel, RAL 7035 powder coat, PU gasket',
      'Protection: Siemens / L&T thermal-magnetic breakers + 24 V PSU',
    ],
    tags: ['IP65 CRCA', '415 V 3-phase', 'Ready in 48–72 h'],
    oem: 'Delta / Siemens',
    image: '/images/plc_hmi_panel.jpg',
  },
  {
    id: 'starter-vfd-heavy',
    name: 'Heavy Duty VFD Motion Panel',
    category: 'VFD Drives',
    price: '₹45,000',
    summary:
      'Variable frequency drive panel for high-torque industrial motors, with dynamic braking resistor and thermal safety interlocks.',
    specs: [
      'Motor range: 15 HP to 30 HP AC induction motors',
      'Drive: Delta MS300 / C2000 Plus or Schneider Altivar 320',
      'Braking: aluminium-cased braking resistor with overheat protection',
      'Cooling: dual ball-bearing high-CFM fans with louvred filters',
      'Controls: door-mounted speed potentiometer, FWD/REV selector, E-STOP',
    ],
    tags: ['IP55 dual fan', '415 V 3-phase', 'In stock'],
    oem: 'Delta MS300 / Schneider',
    image: '/images/vfd_heavy_panel.jpg',
  },
  {
    id: 'starter-vfd-compact',
    name: 'Compact VFD Speed Panel',
    category: 'VFD Drives',
    price: '₹25,000',
    summary:
      'Compact motor speed regulation panel with digital frequency readout, line choke and emergency trip contactor.',
    specs: [
      'Motor range: 0.5 HP to 7.5 HP, 3-phase 415 V AC',
      'Readout: 4-digit LED frequency / RPM display',
      'Switchgear: MCB + magnetic contactor + overload relay',
      'Enclosure: wall-mount powder-coated CRCA with rubber cable glands',
    ],
    tags: ['IP54 compact', '415 V 3-phase', 'Ready in 24–48 h'],
    oem: 'Delta / ABB',
    image: '/images/vfd_heavy_panel.jpg',
  },
  {
    id: 'starter-star-delta-50',
    name: '50 HP Heavy Star Delta Starter Panel',
    category: 'Star-Delta',
    price: '₹4,00,000',
    summary:
      'High-capacity motor starter panel built with L&T / Siemens air-break contactors and electrolytic copper busbars.',
    specs: [
      'Starting capacity: 50 HP (37 kW) continuous heavy-duty inrush',
      'Switchgear: 3× L&T ML series contactors + electronic star-delta timer',
      'Busbars: electrolytic-grade tinned copper',
      'Metering: digital multifunction meter (V, A, PF, kW, kWh)',
      'Protection: single-phase preventer, phase reversal, under/over voltage',
    ],
    tags: ['IP55 CRCA', '415 V 50 Hz', 'In stock'],
    oem: 'L&T / Siemens',
    image: '/images/star_delta_panel.jpg',
  },
  {
    id: 'starter-star-delta-std',
    name: 'Standard Star Delta Motor Starter',
    category: 'Star-Delta',
    price: '₹18,000',
    summary:
      'Automatic star-delta panel for smooth starting torque, reduced grid surge and reliable pump and compressor duty.',
    specs: [
      'Motor rating: 7.5 HP to 15 HP, 3-phase induction motors',
      'Contactors: heavy-duty 3-pole with silver-alloy contacts',
      'Timer: adjustable solid-state transition timer (0.5–30 s)',
      'Enclosure: IP54 wall-mount sheet metal, hinged door',
    ],
    tags: ['IP54 steel', '415 V 50 Hz', 'Ready in 24 h'],
    oem: 'L&T / Schneider',
    image: '/images/star_delta_panel.jpg',
  },
  {
    id: 'starter-flameproof',
    name: 'Flame Proof Industrial Panel (Ex-d)',
    category: 'Flameproof',
    price: '₹55,000',
    summary:
      'Explosion-proof control enclosure for hazardous chemical plants, refineries and paint booth zones.',
    specs: [
      'Hazardous area: Zone 1 & Zone 2, gas groups IIA, IIB, IIC',
      'Body: cast aluminium LM6 alloy or SS316 stainless steel',
      'Hardware: flameproof push buttons, neoprene O-ring seal (IP66)',
      'Standards: IS/IEC 60079-0 and 60079-1',
    ],
    tags: ['IP66 cast alloy', '415 V / 230 V', 'Custom build'],
    oem: 'CIMFR / PESO certified',
    image: '/images/flameproof_panel.jpg',
  },
  {
    id: 'starter-delta-as',
    name: 'Delta AS Series Compact PLC',
    category: 'PLCs & Sensors',
    price: '₹16,500',
    summary:
      '32-bit modular controller with built-in CANopen, Modbus RTU/TCP and EtherNet/IP.',
    specs: [
      'Speed: 40k steps executed within a 1.0 ms scan',
      'Memory: 128k steps ladder logic / structured text',
      'Expansion: up to 32 modules (1,024 I/O points)',
      'Comms: dual Ethernet + RS-485 + mini USB programming',
    ],
    tags: ['DIN rail', '24 V DC', 'In stock'],
    oem: 'Delta Electronics',
    image: '/images/delta_as_plc.jpg',
  },
  {
    id: 'starter-sensor-pack',
    name: 'CNC Machine Sensors Pack',
    category: 'PLCs & Sensors',
    price: '₹6,500',
    summary:
      'Sensor bundle with M18 shielded inductive proximity switches and optical diffuse laser limit sensors.',
    specs: [
      'Inductive: 4× M18 PNP NO, 8.0 mm sensing, nickel-plated brass',
      'Optical: 2× diffuse laser sensors, 300 mm adjustable range',
      'Protection: IP67 oil, coolant and vibration resistant',
      'Cabling: 2 m oil-proof PVC sheathed leads',
    ],
    tags: ['IP67 sealed', '10–30 V DC', 'In stock'],
    oem: 'Omron / Autonics compatible',
    image: '/images/industrial_sensors_pack.jpg',
  },
]

export const STARTER_REVIEWS: Review[] = [
  {
    id: 'starter-review-1',
    author: 'Pravin N.',
    role: 'Local Guide · Verified customer',
    rating: 5,
    body: 'Great experience, hands-on practicals are done well and the staff is supportive. The control panels supplied for our Bhosari plant are working flawlessly.',
  },
  {
    id: 'starter-review-2',
    author: 'Pradeep Das',
    role: 'Industrial plant client',
    rating: 5,
    body: 'It is a good company — good behaviour, great product, awesome work. Top-notch VFD and PLC wiring quality in Pune.',
  },
  {
    id: 'starter-review-3',
    author: 'Dr. Kamalkishor Ingole',
    role: 'Technical consultant',
    rating: 5,
    body: 'Good service and quality product. Timely delivery and prompt technical troubleshooting support whenever required.',
  },
]

export const STARTER_CONTENT: SiteContent = {
  settings: DEFAULT_SETTINGS,
  products: STARTER_PRODUCTS,
  projects: [],
  reviews: STARTER_REVIEWS,
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function to12h(time: string) {
  const [h, m] = time.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

/** "Mon–Sat · 9:00 AM – 6:00 PM" from the structured opening hours. */
export function hoursLabel(s: Pick<Settings, 'openDays' | 'opensAt' | 'closesAt'>) {
  const days = [...s.openDays].sort((a, b) => a - b)
  const contiguous = days.every((d, i) => i === 0 || d === days[i - 1] + 1)
  const dayText =
    days.length === 0 ? 'Closed' : contiguous && days.length > 2 ? `${DAY[days[0]]}–${DAY[days.at(-1)!]}` : days.map((d) => DAY[d]).join(', ')
  return `${dayText} · ${to12h(s.opensAt)} – ${to12h(s.closesAt)}`
}

/** Open right now? Evaluated in India Standard Time regardless of the visitor's timezone. */
export function isOpenNow(s: Pick<Settings, 'openDays' | 'opensAt' | 'closesAt'>, now = new Date()) {
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000)
  const minutes = ist.getHours() * 60 + ist.getMinutes()
  const [oh, om] = s.opensAt.split(':').map(Number)
  const [ch, cm] = s.closesAt.split(':').map(Number)
  return s.openDays.includes(ist.getDay()) && minutes >= oh * 60 + om && minutes < ch * 60 + cm
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
