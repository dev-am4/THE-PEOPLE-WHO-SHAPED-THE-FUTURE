const { app, BrowserWindow, session, shell } = require('electron')
const http = require('http')
const fs = require('fs')
const path = require('path')

const HOST = '127.0.0.1'
const FALLBACK_INITIALS = {
  ajong: 'อจ', virul: 'วส', prawase: 'ปว', rawi: 'รภ', einstein: 'AE', asimov: 'IA',
  armstrong: 'NA', linus: 'LT', beeple: 'MW', nolan: 'CN', musk: 'EM', knuth: 'DK',
}

let server
let baseUrl
let mainWindow

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.ico': 'image/x-icon',
  }[ext] || 'application/octet-stream'
}

function fallbackSvg(id) {
  const initials = String(FALLBACK_INITIALS[id] || '??').replace(/[<>&]/g, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
    <defs><radialGradient id="a" cx="28%" cy="20%" r="78%"><stop offset="0" stop-color="#154665"/><stop offset=".5" stop-color="#0b2036"/><stop offset="1" stop-color="#040914"/></radialGradient></defs>
    <rect width="720" height="960" fill="url(#a)"/><circle cx="360" cy="430" r="150" fill="none" stroke="#68e5ff" stroke-width="2" opacity=".35"/>
    <text x="360" y="475" text-anchor="middle" font-family="Arial,sans-serif" font-size="138" font-weight="700" fill="#eafaff">${initials}</text>
    <text x="360" y="690" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" letter-spacing="6" fill="#7da4c6">OFFLINE PORTRAIT</text>
  </svg>`
}

function serveFile(res, filePath, cache = true) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }
    res.writeHead(200, {
      'Content-Type': mimeType(filePath),
      'Cache-Control': cache ? 'public, max-age=31536000, immutable' : 'no-store',
    })
    res.end(data)
  })
}

function servePortrait(res, distRoot, id) {
  const safeId = String(id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '')
  const candidates = [
    path.join(distRoot, 'offline-people', `${safeId}.jpg`),
    path.join(distRoot, 'people', `${safeId}.jpg`),
    path.join(distRoot, 'people', `${safeId}.jpeg`),
    path.join(distRoot, 'people', `${safeId}.png`),
    path.join(distRoot, 'people', `${safeId}.webp`),
  ]
  const portrait = candidates.find(candidate => fs.existsSync(candidate))
  if (portrait) return serveFile(res, portrait)

  res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(fallbackSvg(safeId))
}

function startLocalServer() {
  const distRoot = path.join(app.getAppPath(), 'dist')
  server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${HOST}`)

    if (url.pathname === '/api/portrait') {
      servePortrait(res, distRoot, url.searchParams.get('id'))
      return
    }

    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/' || pathname === '/admin' || pathname.startsWith('/admin/')) pathname = '/index.html'
    const safeRelative = pathname.replace(/^\/+/, '')
    let filePath = path.resolve(distRoot, safeRelative)

    if (!filePath.startsWith(path.resolve(distRoot))) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(distRoot, 'index.html')
    serveFile(res, filePath, path.basename(filePath) !== 'index.html')
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, HOST, () => {
      const address = server.address()
      baseUrl = `http://${HOST}:${address.port}`
      resolve(baseUrl)
    })
  })
}

function isShortcut(input, key) {
  return input.type === 'keyDown' && input.control && input.shift && String(input.key || '').toLowerCase() === key.toLowerCase()
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#050816',
    autoHideMenuBar: true,
    show: false,
    kiosk: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  mainWindow.setMenuBarVisibility(false)

  // The public exhibit never exposes an admin button. Staff use keyboard shortcuts instead.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (isShortcut(input, 'a')) {
      event.preventDefault()
      mainWindow.setKiosk(false)
      mainWindow.maximize()
      mainWindow.loadURL(`${baseUrl}/admin`)
      return
    }
    if (isShortcut(input, 'h')) {
      event.preventDefault()
      mainWindow.loadURL(`${baseUrl}/`)
      mainWindow.setKiosk(true)
      return
    }
    if (isShortcut(input, 'f')) {
      event.preventDefault()
      mainWindow.setKiosk(!mainWindow.isKiosk())
      return
    }
    if (isShortcut(input, 'q')) {
      event.preventDefault()
      app.quit()
      return
    }
    if (input.type === 'keyDown' && (input.key === 'F12' || (input.control && input.shift && String(input.key || '').toLowerCase() === 'i'))) {
      event.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(baseUrl)) {
      mainWindow.loadURL(url)
      return { action: 'deny' }
    }
    shell.openExternal(url).catch(() => {})
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(baseUrl)) {
      event.preventDefault()
      shell.openExternal(url).catch(() => {})
    }
  })

  // One current profile uses a direct remote image. Redirect it to the bundled offline portrait in Desktop mode.
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['https://commons.wikimedia.org/*'] }, (details, callback) => {
    if (details.url.includes('Elon%20Musk%20Royal%20Society%20crop')) {
      callback({ redirectURL: `${baseUrl}/api/portrait?id=musk` })
      return
    }
    callback({})
  })

  await mainWindow.loadURL(`${baseUrl}/`)
  mainWindow.show()
}

app.whenReady().then(async () => {
  await startLocalServer()
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(error => {
  console.error(error)
  app.quit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (server) server.close()
})
