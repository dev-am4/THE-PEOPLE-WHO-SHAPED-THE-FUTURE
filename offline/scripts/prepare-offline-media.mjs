import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { people } from '../../src/people-reference.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const mediaDir = path.join(root, 'offline', 'media', 'people')
const publicPeopleDir = path.join(root, 'public', 'people')
const productionOrigin = 'https://the-people-who-shaped-the-future.vercel.app'
const force = process.argv.includes('--force')

await fs.mkdir(mediaDir, { recursive: true })

async function exists(file) {
  try { await fs.access(file); return true } catch { return false }
}

async function fetchBytes(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; OfflineExhibitionPack/1.0)',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type') || ''
  if (!type.startsWith('image/')) throw new Error(`Not an image: ${type}`)
  return Buffer.from(await response.arrayBuffer())
}

async function getSource(person) {
  const local = path.join(publicPeopleDir, `${person.id}.jpg`)
  if (await exists(local)) return fs.readFile(local)

  if (person.portrait?.startsWith('/')) {
    return fetchBytes(`${productionOrigin}${person.portrait}`)
  }

  if (/^https?:\/\//i.test(person.portrait || '')) {
    return fetchBytes(person.portrait)
  }

  throw new Error(`No usable portrait source for ${person.id}`)
}

const results = []

for (const person of people) {
  const dest = path.join(mediaDir, `${person.id}.jpg`)

  if (!force && await exists(dest)) {
    console.log(`SKIP  ${person.id} (already local)`)
    results.push({ id: person.id, status: 'existing', file: `media/people/${person.id}.jpg` })
    continue
  }

  try {
    const input = await getSource(person)
    const output = await sharp(input)
      .rotate()
      .resize(720, 960, { fit: 'cover', position: 'north' })
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toBuffer()

    await fs.writeFile(dest, output)
    console.log(`OK    ${person.id}`)
    results.push({ id: person.id, status: 'downloaded', file: `media/people/${person.id}.jpg` })
  } catch (error) {
    console.error(`FAIL  ${person.id}: ${error.message}`)
    results.push({ id: person.id, status: 'failed', error: error.message })
  }
}

await fs.writeFile(
  path.join(root, 'offline', 'content', 'portrait-manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), people: results }, null, 2),
  'utf8',
)

const failed = results.filter(item => item.status === 'failed')
console.log(`\nPortraits ready: ${results.length - failed.length}/${results.length}`)
if (failed.length) {
  console.error('Some portraits could not be prepared. Run again while connected to the internet, or place JPG files manually in offline/media/people/.')
  process.exitCode = 1
}
