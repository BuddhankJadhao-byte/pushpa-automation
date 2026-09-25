// Pure helpers: opening hours (IST), estimator pricing, upload type sniffing.
// Node 24 runs the TypeScript sources directly (type stripping).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hoursLabel, isOpenNow, DEFAULT_SETTINGS } from '../lib/content.ts'
import { estimate } from '../lib/estimate.ts'

const hours = { openDays: [1, 2, 3, 4, 5, 6], opensAt: '09:00', closesAt: '18:00' }

test('hours label', () => {
  assert.equal(hoursLabel(hours), 'Mon–Sat · 9:00 AM – 6:00 PM')
  assert.equal(hoursLabel({ ...hours, openDays: [0, 3] }), 'Sun, Wed · 9:00 AM – 6:00 PM')
  assert.equal(hoursLabel({ ...hours, openDays: [] }), 'Closed · 9:00 AM – 6:00 PM')
})

test('open/closed is judged in India time, whatever the server timezone', () => {
  // 2026-09-28 is a Monday. 04:00 UTC = 09:30 IST (open); 13:00 UTC = 18:30 IST (closed).
  assert.equal(isOpenNow(hours, new Date('2026-09-28T04:00:00Z')), true)
  assert.equal(isOpenNow(hours, new Date('2026-09-28T13:00:00Z')), false)
  // Sunday 10:00 IST → closed.
  assert.equal(isOpenNow(hours, new Date('2026-09-27T04:30:00Z')), false)
  // Boundary: 09:00 IST exactly opens, 18:00 IST exactly closes.
  assert.equal(isOpenNow(hours, new Date('2026-09-28T03:30:00Z')), true)
  assert.equal(isOpenNow(hours, new Date('2026-09-28T12:30:00Z')), false)
})

test('estimate matches the original calculator formula', () => {
  const r = estimate({ type: 'plc', hp: 15, brand: 'delta', enclosure: 'ip55', addons: ['sensors'] })
  assert.equal(r.total, 38000 + 15 * 650 + 4000 + 8500)
  const max = estimate({ type: 'flameproof', hp: 100, brand: 'siemens', enclosure: 'ss304', addons: ['sensors', 'scada'] })
  assert.equal(max.total, 48000 + 100 * 950 + 14000 + 18000 + 8500 + 22000)
})

test('default contact details are intact', () => {
  assert.equal(DEFAULT_SETTINGS.email, 'pariindia91@gmail.com')
  assert.equal(DEFAULT_SETTINGS.whatsapp, '917972741546')
})
