// Local stand-in for a Supabase project, for end-to-end testing the site and the
// owner panel without a cloud account. The database is real Postgres (PGlite)
// running supabase/schema.sql, so every request is still judged by the real
// Row Level Security policies. Auth (email codes) and storage are faked.
//
//   node tests/mock-supabase.mjs            → listens on http://127.0.0.1:54321
//   GET /mock/otp?email=...                 → last login code "emailed" to that address
//
// Only the endpoints this website uses are implemented. Test tooling — never deploy.
import { createServer } from 'node:http'
import { createHmac, randomInt, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { SUPABASE_STUBS } from './supabase-stubs.mjs'

const PORT = Number(process.env.MOCK_PORT ?? 54321)
const SECRET = 'mock-jwt-secret'
const OWNER = { id: '11111111-1111-1111-1111-111111111111', email: 'pariindia91@gmail.com' }

const b64 = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url')
function sign(payload) {
  const head = b64({ alg: 'HS256', typ: 'JWT' })
  const body = b64(payload)
  return `${head}.${body}.${createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')}`
}
function verify(token) {
  const [head, body, sig] = String(token ?? '').split('.')
  if (!sig || createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url') !== sig) return null
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString())
  return claims.exp && claims.exp < Date.now() / 1000 ? null : claims
}

export const ANON_KEY = sign({ role: 'anon', iss: 'mock' })

const db = new PGlite()
await db.exec(SUPABASE_STUBS)
await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))
await db.query(`insert into auth.users values ($1, $2, now())`, [OWNER.id, OWNER.email])

const codes = new Map() // email -> code
const refresh = new Map() // refresh token -> user id
const files = new Map() // storage path -> { type, bytes }

async function userById(id) {
  const { rows } = await db.query('select id, email, email_confirmed_at from auth.users where id = $1', [id])
  return rows[0] ?? null
}
function userJson(u) {
  return { id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, email_confirmed_at: u.email_confirmed_at, app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString() }
}
function session(u) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const refresh_token = randomUUID()
  refresh.set(refresh_token, u.id)
  const access_token = sign({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', exp, session_id: randomUUID(), aal: 'aal1', amr: [{ method: 'otp', timestamp: Date.now() / 1000 }] })
  return { access_token, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token, user: userJson(u) }
}

// Run SQL as the caller's API role, exactly like PostgREST does.
async function asCaller(claims, fn) {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [claims?.sub ?? ''])
    await tx.exec(`set local role ${claims?.role === 'authenticated' ? 'authenticated' : 'anon'}`)
    return fn(tx)
  })
}

const ident = (s) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(s)) throw Object.assign(new Error(`bad identifier ${s}`), { status: 400 })
  return `"${s}"`
}

function where(params, values) {
  const clauses = []
  for (const [key, raw] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) continue
    const [op, ...rest] = raw.split('.')
    if (op !== 'eq') throw Object.assign(new Error(`unsupported filter ${op}`), { status: 400 })
    values.push(rest.join('.'))
    clauses.push(`${ident(key)}::text = $${values.length}`)
  }
  return clauses.length ? ` where ${clauses.join(' and ')}` : ''
}

async function rest(req, res, url, claims, body) {
  const [, , , name, fn] = url.pathname.split('/') // /rest/v1/<table> or /rest/v1/rpc/<fn>
  const params = [...url.searchParams]
  const values = []
  const prefer = req.headers.prefer ?? ''

  if (name === 'rpc') {
    const args = Object.entries(body ?? {})
    const sql = `select public.${ident(fn)}(${args.map(([k], i) => `${ident(k)} => $${i + 1}`).join(', ')}) as result`
    const { rows } = await asCaller(claims, (tx) => tx.query(sql, args.map(([, v]) => v)))
    return send(res, 200, rows[0]?.result ?? null)
  }

  const table = `public.${ident(name)}`
  if (req.method === 'GET' || req.method === 'HEAD') {
    const select = url.searchParams.get('select') ?? '*'
    const cols = select === '*' ? '*' : select.split(',').map((c) => ident(c.trim())).join(', ')
    const order = url.searchParams.get('order')
    const orderSql = order ? ` order by ${order.split(',').map((o) => { const [c, dir] = o.split('.'); return `${ident(c)} ${dir === 'desc' ? 'desc' : 'asc'}` }).join(', ')}` : ''
    const limit = url.searchParams.get('limit')
    const filter = where(params, values)
    const { rows } = await asCaller(claims, (tx) => tx.query(`select ${cols} from ${table}${filter}${orderSql}${limit ? ` limit ${Number(limit)}` : ''}`, values))
    const headers = {}
    if (prefer.includes('count=exact')) {
      const { rows: c } = await asCaller(claims, (tx) => tx.query(`select count(*)::int as n from ${table}${filter}`, values))
      headers['content-range'] = `0-${Math.max(0, rows.length - 1)}/${c[0].n}`
    }
    return send(res, 200, req.method === 'HEAD' ? undefined : rows, headers)
  }

  if (req.method === 'POST') {
    const list = Array.isArray(body) ? body : [body]
    const cols = [...new Set(list.flatMap(Object.keys))]
    const rowsSql = list.map((row) => `(${cols.map((c) => { values.push(row[c] ?? null); return `$${values.length}` }).join(', ')})`)
    const upsert = prefer.includes('resolution=merge-duplicates')
      ? ` on conflict (id) do update set ${cols.map((c) => `${ident(c)} = excluded.${ident(c)}`).join(', ')}`
      : ''
    await asCaller(claims, (tx) => tx.query(`insert into ${table} (${cols.map(ident).join(', ')}) values ${rowsSql.join(', ')}${upsert}`, values))
    return send(res, 201)
  }
  if (req.method === 'PATCH') {
    const sets = Object.entries(body).map(([c, v]) => { values.push(v); return `${ident(c)} = $${values.length}` })
    await asCaller(claims, (tx) => tx.query(`update ${table} set ${sets.join(', ')}${where(params, values)}`, values))
    return send(res, 204)
  }
  if (req.method === 'DELETE') {
    await asCaller(claims, (tx) => tx.query(`delete from ${table}${where(params, values)}`, values))
    return send(res, 204)
  }
}

async function auth(req, res, url, claims, body) {
  const route = url.pathname.replace('/auth/v1', '')
  if (route === '/otp') {
    const { rows } = await db.query('select 1 from auth.users where lower(email) = lower($1)', [body.email])
    if (!rows.length && body.create_user === false) return send(res, 422, { code: 'otp_disabled', msg: 'Signups not allowed for otp' })
    const code = String(randomInt(0, 1e6)).padStart(6, '0')
    codes.set(body.email.toLowerCase(), code)
    console.log(`[mock email] login code for ${body.email}: ${code}`)
    return send(res, 200, {})
  }
  if (route === '/verify') {
    const email = String(body.email ?? '').toLowerCase()
    if (!codes.has(email) || codes.get(email) !== body.token) return send(res, 403, { code: 'otp_expired', msg: 'Token has expired or is invalid' })
    codes.delete(email)
    const { rows } = await db.query('select id from auth.users where lower(email) = $1', [email])
    return send(res, 200, session(await userById(rows[0].id)))
  }
  if (route === '/token' && url.searchParams.get('grant_type') === 'refresh_token') {
    const id = refresh.get(body.refresh_token)
    if (!id) return send(res, 400, { code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' })
    refresh.delete(body.refresh_token)
    return send(res, 200, session(await userById(id)))
  }
  if (route === '/user') {
    if (claims?.role !== 'authenticated') return send(res, 401, { code: 'bad_jwt', msg: 'invalid JWT' })
    return send(res, 200, userJson(await userById(claims.sub)))
  }
  if (route === '/logout') return send(res, 204)
  if (route === '/.well-known/jwks.json') return send(res, 200, { keys: [] })
  return send(res, 404, { msg: `mock: no auth route ${route}` })
}

async function storage(req, res, url, claims, raw) {
  const publicPrefix = '/storage/v1/object/public/media/'
  if (req.method === 'GET' && url.pathname.startsWith(publicPrefix)) {
    const file = files.get(decodeURIComponent(url.pathname.slice(publicPrefix.length)))
    if (!file) return send(res, 404, { message: 'not found' })
    res.writeHead(200, { 'content-type': file.type })
    return res.end(file.bytes)
  }
  if (req.method === 'POST' && url.pathname.startsWith('/storage/v1/object/media/')) {
    const path = decodeURIComponent(url.pathname.slice('/storage/v1/object/media/'.length))
    const type = req.headers['content-type']
    const { rows } = await db.query(`select file_size_limit, allowed_mime_types from storage.buckets where id = 'media'`)
    if (raw.length > rows[0].file_size_limit) return send(res, 413, { statusCode: '413', error: 'Payload too large', message: 'too large' })
    if (!rows[0].allowed_mime_types.includes(type)) return send(res, 415, { statusCode: '415', error: 'invalid_mime_type', message: `mime type ${type} is not supported` })
    await asCaller(claims, (tx) => tx.query(`insert into storage.objects (bucket_id, name) values ('media', $1)`, [path]))
    files.set(path, { type, bytes: raw })
    return send(res, 200, { Key: `media/${path}`, Id: randomUUID() })
  }
  if (req.method === 'DELETE' && url.pathname === '/storage/v1/object/media') {
    const { prefixes } = JSON.parse(raw.toString() || '{}')
    const deleted = await asCaller(claims, (tx) => tx.query(`delete from storage.objects where bucket_id = 'media' and name = any($1) returning name`, [prefixes]))
    deleted.rows.forEach((r) => files.delete(r.name))
    return send(res, 200, deleted.rows)
  }
  return send(res, 404, { message: `mock: no storage route ${url.pathname}` })
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers })
  res.end(body === undefined ? undefined : JSON.stringify(body))
}

createServer(async (req, res) => {
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks)
  const url = new URL(req.url, `http://${req.headers.host}`)
  const claims = verify(req.headers.authorization?.replace(/^Bearer /i, ''))
  try {
    if (url.pathname === '/mock/otp') return send(res, 200, { code: codes.get(url.searchParams.get('email')?.toLowerCase()) ?? null })
    if (url.pathname === '/mock/sql') {
      const { rows } = await db.query(raw.toString()) // test inspection only
      return send(res, 200, rows)
    }
    if (url.pathname.startsWith('/storage/')) return await storage(req, res, url, claims, raw)
    const body = raw.length && req.headers['content-type']?.includes('json') ? JSON.parse(raw.toString()) : null
    if (url.pathname.startsWith('/auth/v1')) return await auth(req, res, url, claims, body)
    if (url.pathname.startsWith('/rest/v1/')) return await rest(req, res, url, claims, body)
    send(res, 404, { message: 'mock: unknown route' })
  } catch (e) {
    const code = e.code ?? ''
    const status = e.status ?? (code === '42501' ? 403 : 400)
    console.log(`[mock] ${req.method} ${url.pathname} → ${status} ${e.message}`)
    send(res, status, { code, message: e.message, details: null, hint: null })
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`mock supabase on http://127.0.0.1:${PORT}`)
  console.log(`SUPABASE_ANON_KEY=${ANON_KEY}`)
})
