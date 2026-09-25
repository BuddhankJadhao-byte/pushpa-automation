// Runs the site against the local mock Supabase:
//   node tests/dev-with-mock.mjs          → next dev on :3001
//   node tests/dev-with-mock.mjs start    → next build + next start on :3001 (production mode)
import { spawn } from 'node:child_process'
import { ANON_KEY } from './mock-supabase.mjs'

const env = { ...process.env, SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_ANON_KEY: ANON_KEY }
const next = (...args) =>
  new Promise((resolve) => spawn(process.execPath, ['node_modules/next/dist/bin/next', ...args], { stdio: 'inherit', env }).on('exit', resolve))

if (process.argv[2] === 'start') {
  const code = await next('build')
  if (code !== 0) process.exit(code ?? 1)
  process.exit((await next('start', '-p', '3001')) ?? 0)
}
process.exit((await next('dev', '-p', '3001')) ?? 0)
