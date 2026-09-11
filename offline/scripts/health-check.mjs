import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { people } from '../../src/people-reference.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')

async function exists(file) {
  try { await fs.access(file); return true } catch { return false }
}

const checks = []
const add = (name, ok, note = '') => checks.push({ name, ok, note })

add('Node.js', Number(process.versions.node.split('.')[0]) >= 18, process.version)
add('Offline build', await exists(path.join(root, 'offline', 'dist', 'index.html')), 'offline/dist/index.html')

let portraitCount = 0
for (const person of people) {
  const file = path.join(root, 'offline', 'media', 'people', `${person.id}.jpg`)
  if (await exists(file)) portraitCount += 1
}
add('Portraits', portraitCount === people.length, `${portraitCount}/${people.length}`)

const configFile = path.join(root, 'offline', 'content', 'display.json')
add('Runtime config', await exists(configFile), 'offline/content/display.json')

if (await exists(configFile)) {
  try {
    const cfg = JSON.parse(await fs.readFile(configFile, 'utf8'))
    const bg = cfg?.background
    if (bg?.enabled && bg?.src?.startsWith('/media/')) {
      const bgPath = path.join(root, 'offline', bg.src.replace(/^\//, ''))
      add('Configured background media', await exists(bgPath), bg.src)
    }
  } catch (error) {
    add('Runtime config JSON', false, error.message)
  }
}

console.log('\nTHE PEOPLE WHO SHAPED THE FUTURE — OFFLINE CHECK\n')
for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.note ? ` — ${item.note}` : ''}`)
}

const failures = checks.filter(item => !item.ok)
console.log(`\n${failures.length ? 'NOT READY' : 'SYSTEM READY'}\n`)
if (failures.length) process.exitCode = 1
