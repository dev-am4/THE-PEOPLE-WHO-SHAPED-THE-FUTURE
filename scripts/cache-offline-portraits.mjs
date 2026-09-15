import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { people } from '../src/people-reference.js'

const ROOT = process.cwd()
const OUTPUT = path.join(ROOT, 'public', 'offline-people')
const PROD = 'https://the-people-who-shaped-the-future.vercel.app'

await fs.mkdir(OUTPUT, { recursive: true })

for (const person of people) {
  const target = path.join(OUTPUT, `${person.id}.jpg`)

  try {
    let input
    const portrait = String(person.portrait || '')

    if (portrait.startsWith('/api/portrait')) {
      const response = await fetch(`${PROD}${portrait}`, {
        redirect: 'follow',
        headers: { 'User-Agent': 'TPWSF-Offline-Packager/1.0' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      input = Buffer.from(await response.arrayBuffer())
    } else if (/^https?:\/\//i.test(portrait)) {
      const response = await fetch(portrait, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 TPWSF-Offline-Packager/1.0' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      input = Buffer.from(await response.arrayBuffer())
    } else if (portrait.startsWith('/')) {
      input = await fs.readFile(path.join(ROOT, 'public', portrait.slice(1)))
    } else {
      throw new Error('No portrait source')
    }

    await sharp(input)
      .rotate()
      .resize(720, 960, { fit: 'cover', position: 'attention', withoutEnlargement: false })
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(target)

    console.log(`offline portrait: ${person.id}`)
  } catch (error) {
    console.warn(`offline portrait skipped: ${person.id}: ${error.message || error}`)
  }
}
