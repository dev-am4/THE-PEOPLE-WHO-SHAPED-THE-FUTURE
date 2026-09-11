import http from 'node:http'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const distRoot = path.join(root, 'offline', 'dist')
const mediaRoot = path.join(root, 'offline', 'media')
const contentRoot = path.join(root, 'offline', 'content')
const port = Number(process.env.PORT || 4173)
const host = '127.0.0.1'

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function safeJoin(base, requestPath) {
  const target = path.resolve(base, '.' + requestPath)
  if (!target.startsWith(path.resolve(base))) return null
  return target
}

async function sendFile(res, file, cache = 'no-store') {
  try {
    const stat = await fs.stat(file)
    if (!stat.isFile()) return false
    const ext = path.extname(file).toLowerCase()
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': cache,
    })
    fsSync.createReadStream(file).pipe(res)
    return true
  } catch {
    return false
  }
}

async function sendIndex(res) {
  const indexPath = path.join(distRoot, 'index.html')
  try {
    let html = await fs.readFile(indexPath, 'utf8')
    html = html
      .replace('</head>', '  <link rel="stylesheet" href="/content/custom.css">\n</head>')
      .replace('</body>', '  <script defer src="/content/custom.js"></script>\n</body>')
    const body = Buffer.from(html)
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
    })
    res.end(body)
  } catch {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Offline build not found. Run offline\\BUILD-OFFLINE.bat first.')
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${host}:${port}`)
  const pathname = decodeURIComponent(url.pathname)

  if (pathname === '/__health') {
    const peopleDir = path.join(mediaRoot, 'people')
    let portraits = []
    try { portraits = (await fs.readdir(peopleDir)).filter(x => /\.jpe?g$/i.test(x)) } catch {}
    const body = JSON.stringify({ ok: true, mode: 'offline-kiosk', portraits: portraits.length, port }, null, 2)
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    return res.end(body)
  }

  if (pathname === '/api/portrait') {
    const id = String(url.searchParams.get('id') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!id) {
      res.writeHead(400); return res.end('missing id')
    }
    const file = path.join(mediaRoot, 'people', `${id}.jpg`)
    if (await sendFile(res, file, 'no-store')) return
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end(`Offline portrait missing: ${id}.jpg`)
  }

  if (pathname.startsWith('/media/')) {
    const file = safeJoin(mediaRoot, pathname.slice('/media'.length))
    if (file && await sendFile(res, file, 'no-store')) return
    res.writeHead(404); return res.end('media not found')
  }

  if (pathname.startsWith('/content/')) {
    const file = safeJoin(contentRoot, pathname.slice('/content'.length))
    if (file && await sendFile(res, file, 'no-store')) return
    res.writeHead(404); return res.end('content not found')
  }

  const distFile = safeJoin(distRoot, pathname)
  if (distFile && await sendFile(res, distFile, 'public, max-age=31536000, immutable')) return

  return sendIndex(res)
})

server.listen(port, host, async () => {
  await fs.writeFile(path.join(here, '.server.pid'), String(process.pid), 'utf8')
  console.log(`Offline exhibition server: http://${host}:${port}`)
})

async function shutdown() {
  try { await fs.unlink(path.join(here, '.server.pid')) } catch {}
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
