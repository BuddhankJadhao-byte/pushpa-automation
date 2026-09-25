// Proves the database security rules in supabase/schema.sql against a real
// Postgres (PGlite), with Supabase's auth/storage pieces stubbed the way
// Supabase defines them. Run: npm test
import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { SUPABASE_STUBS } from './supabase-stubs.mjs'

const OWNER = '11111111-1111-1111-1111-111111111111'
const STRANGER = '22222222-2222-2222-2222-222222222222'
const UNCONFIRMED_OWNER = '33333333-3333-3333-3333-333333333333'

let db


// Runs `sql` as a Supabase API role, optionally signed in as `uid`.
async function as(role, uid, sql, params = []) {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid ?? ''])
    await tx.exec(`set local role ${role}`)
    return tx.query(sql, params)
  })
}

const rejects = (promise, pattern = /row-level security|permission denied/) => assert.rejects(promise, pattern)

before(async () => {
  db = new PGlite()
  await db.exec(SUPABASE_STUBS)
  await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))
  await db.exec(`
    insert into auth.users values
      ('${OWNER}', 'PariIndia91@gmail.com', now()),
      ('${STRANGER}', 'someone@example.com', now()),
      ('${UNCONFIRMED_OWNER}', 'pariindia91@gmail.com', null);
    insert into public.products (name, category, published) values ('Visible panel', 'PLC', true), ('Hidden draft', 'PLC', false);
  `)
})

test('schema is idempotent (safe to run twice)', async () => {
  await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))
})

test('visitors see only published products', async () => {
  const { rows } = await as('anon', null, 'select name from public.products order by name')
  assert.deepEqual(rows.map((r) => r.name), ['Visible panel'])
})

test('visitors and signed-in strangers cannot write content', async () => {
  await rejects(as('anon', null, `insert into public.products (name, category) values ('x1', 'PLC')`))
  await rejects(as('authenticated', STRANGER, `insert into public.products (name, category) values ('x2', 'PLC')`))
  const updated = await as('authenticated', STRANGER, `update public.products set name = 'pwned' returning id`)
  assert.equal(updated.rows.length, 0)
  const deleted = await as('authenticated', STRANGER, `delete from public.products returning id`)
  assert.equal(deleted.rows.length, 0)
})

test('an unconfirmed account using the owner email gets no access', async () => {
  await rejects(as('authenticated', UNCONFIRMED_OWNER, `insert into public.products (name, category) values ('x3', 'PLC')`))
  const { rows } = await as('authenticated', UNCONFIRMED_OWNER, 'select public.is_admin() as ok')
  assert.equal(rows[0].ok, false)
})

test('the confirmed owner can create, see drafts, update and delete', async () => {
  const { rows } = await as('authenticated', OWNER, 'select public.is_admin() as ok')
  assert.equal(rows[0].ok, true)
  const created = await as('authenticated', OWNER, `insert into public.products (name, category) values ('Owner panel', 'VFD') returning id`)
  const id = created.rows[0].id
  const all = await as('authenticated', OWNER, 'select count(*)::int as n from public.products')
  assert.equal(all.rows[0].n, 3)
  const upd = await as('authenticated', OWNER, `update public.products set price = '₹1' where id = $1 returning price`, [id])
  assert.equal(upd.rows[0].price, '₹1')
  const del = await as('authenticated', OWNER, `delete from public.products where id = $1 returning id`, [id])
  assert.equal(del.rows.length, 1)
})

test('database rejects oversized content even from the owner', async () => {
  await assert.rejects(
    as('authenticated', OWNER, `insert into public.products (name, category) values ($1, 'PLC')`, ['x'.repeat(500)]),
    /check constraint/,
  )
})

test('settings: public read, owner-only write', async () => {
  await rejects(as('anon', null, `insert into public.site_settings (id, data) values (1, '{}')`))
  await rejects(as('authenticated', STRANGER, `insert into public.site_settings (id, data) values (1, '{}')`))
  await as('authenticated', OWNER, `insert into public.site_settings (id, data) values (1, '{"phone":"1"}') on conflict (id) do update set data = excluded.data`)
  const { rows } = await as('anon', null, 'select data from public.site_settings')
  assert.equal(rows[0].data.phone, '1')
})

test('enquiries: visitors can submit via the function but never read or insert directly', async () => {
  await as('anon', null, `select public.submit_inquiry('Asha', '+91 90000 00000', '', 'VFD panel', 'Need a 15 HP panel', 'contact')`)
  await rejects(as('anon', null, `insert into public.inquiries (name, phone, topic, message) values ('a', '1234567', 'x', 'hello')`))
  await rejects(as('anon', null, 'select * from public.inquiries'))
  const stranger = await as('authenticated', STRANGER, 'select * from public.inquiries')
  assert.equal(stranger.rows.length, 0)
  const owner = await as('authenticated', OWNER, 'select name from public.inquiries')
  assert.deepEqual(owner.rows.map((r) => r.name), ['Asha'])
})

test('enquiry function still enforces the length rules', async () => {
  await assert.rejects(
    as('anon', null, `select public.submit_inquiry('A', '1', '', 'x', 'hi', 'contact')`),
    /check constraint/,
  )
  await assert.rejects(
    as('anon', null, `select public.submit_inquiry('Asha', '+91 90000 00000', '', 'VFD', 'Hello there', 'admin')`),
    /check constraint/,
  )
})

test('rate limiter allows max hits per window, then blocks', async () => {
  const hit = async () => (await as('anon', null, `select public.rate_limit('test:ip', 3, 60) as ok`)).rows[0].ok
  assert.deepEqual([await hit(), await hit(), await hit(), await hit()], [true, true, true, false])
})

test('internal tables are invisible to the API roles', async () => {
  await rejects(as('anon', null, 'select * from public.admins'))
  await rejects(as('authenticated', OWNER, 'select * from public.admins'))
  await rejects(as('anon', null, 'select * from public.rate_limits'))
  await rejects(as('authenticated', OWNER, `insert into public.admins values ('attacker@example.com')`))
})

test('only the owner can upload to the media bucket', async () => {
  await rejects(as('anon', null, `insert into storage.objects (bucket_id, name) values ('media', 'a.jpg')`))
  await rejects(as('authenticated', STRANGER, `insert into storage.objects (bucket_id, name) values ('media', 'b.jpg')`))
  await as('authenticated', OWNER, `insert into storage.objects (bucket_id, name) values ('media', 'c.jpg')`)
  const { rows } = await db.query(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'media'`)
  assert.equal(rows[0].public, true)
  assert.ok(!rows[0].allowed_mime_types.includes('image/svg+xml'), 'SVG uploads must stay blocked')
})
