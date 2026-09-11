import sharp from 'sharp'

const LOCAL = 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people'
const COMMONS = 'https://commons.wikimedia.org/wiki/Special:FilePath'

const SOURCES = {
  ajong: {
    urls: [`${LOCAL}/ajong.jpg`],
    initials: 'อจ', position: 'north',
  },
  virul: {
    urls: [`${LOCAL}/virul.jpg`],
    initials: 'วส', position: 'north',
  },
  prawase: {
    urls: [`${LOCAL}/prawase.jpg`],
    initials: 'ปว', position: 'north',
  },
  rawi: {
    urls: [`${LOCAL}/rawi.jpg`],
    initials: 'รภ', position: 'centre',
  },
  einstein: {
    urls: [`${COMMONS}/Albert%20Einstein%20Head.jpg?width=1000`],
    initials: 'AE', position: 'north',
  },
  asimov: {
    urls: [
      `${COMMONS}/Isaac.Asimov01.jpg?width=1000`,
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Isaac.Asimov01.jpg?width=1000',
    ],
    initials: 'IA', position: 'north',
  },
  armstrong: {
    urls: [
      `${COMMONS}/Neil%20Armstrong%20official.jpg?width=1000`,
      `${COMMONS}/Portrait%20of%20Neil%20Armstrong.jpg?width=1000`,
    ],
    initials: 'NA', position: 'north',
  },
  linus: {
    urls: [
      `${COMMONS}/LinuxCon%20Europe%20Linus%20Torvalds%2003%20%28cropped%29.jpg?width=1000`,
      `${COMMONS}/Linus%20Torvalds%20-%20Linuxcon2011.jpg?width=1000`,
    ],
    initials: 'LT', position: 'north',
  },
  beeple: {
    urls: [`${LOCAL}/beeple.jpg`],
    initials: 'BW', position: 'north',
  },
  nolan: {
    urls: [`${COMMONS}/Christopher%20Nolan%20Cannes%202018.jpg?width=1000`],
    initials: 'CN', position: 'north',
  },
  zuckerberg: {
    urls: [`${COMMONS}/Mark%20Zuckerberg%202019%20%28cropped%29.jpg?width=1000`],
    initials: 'MZ', position: 'north',
  },
  knuth: {
    urls: [`${LOCAL}/knuth.jpg`],
    initials: 'DK', position: 'north',
  },
}

function fallbackSvg(initials = '??') {
  const safe = String(initials).replace(/[<>&]/g, '')
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
    <defs>
      <radialGradient id="a" cx="28%" cy="20%" r="78%">
        <stop offset="0" stop-color="#154665"/>
        <stop offset="0.5" stop-color="#0b2036"/>
        <stop offset="1" stop-color="#040914"/>
      </radialGradient>
      <linearGradient id="b" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="#68e5ff"/>
        <stop offset="1" stop-color="#9a7dff"/>
      </linearGradient>
    </defs>
    <rect width="720" height="960" fill="url(#a)"/>
    <circle cx="360" cy="430" r="148" fill="none" stroke="url(#b)" stroke-width="2" opacity=".38"/>
    <circle cx="360" cy="430" r="205" fill="none" stroke="#76dfff" stroke-width="1" opacity=".11"/>
    <text x="360" y="475" text-anchor="middle" font-family="Arial,sans-serif" font-size="138" font-weight="700" fill="#eafaff">${safe}</text>
    <text x="360" y="690" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" letter-spacing="6" fill="#7da4c6">PORTRAIT CACHE</text>
  </svg>`
}

async function fetchPortrait(urls) {
  let lastError

  for (const url of urls) {
    try {
      const upstream = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(9000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PeopleWhoShapedTheFuture/1.0; +https://the-people-who-shaped-the-future.vercel.app)',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      })

      if (!upstream.ok) throw new Error(`upstream ${upstream.status}`)

      const contentType = upstream.headers.get('content-type') || ''
      if (!contentType.startsWith('image/')) throw new Error(`unexpected content-type ${contentType}`)

      const input = Buffer.from(await upstream.arrayBuffer())
      if (!input.length) throw new Error('empty upstream image')
      return input
    } catch (error) {
      lastError = error
      console.warn('portrait-source-failed', url, error?.message || error)
    }
  }

  throw lastError || new Error('all portrait sources failed')
}

export default async function handler(req, res) {
  const id = String(req.query?.id || '').toLowerCase()
  const source = SOURCES[id]

  if (!source) {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600')
    return res.status(404).send(fallbackSvg('??'))
  }

  try {
    const input = await fetchPortrait(source.urls)
    const image = await sharp(input)
      .rotate()
      .resize(720, 960, {
        fit: 'cover',
        position: source.position,
        withoutEnlargement: false,
      })
      .jpeg({ quality: 86, progressive: true, mozjpeg: true })
      .toBuffer()

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, stale-while-revalidate=86400')
    return res.status(200).send(image)
  } catch (error) {
    console.error('portrait-cache', id, error?.message || error)
    // Last-resort browser fallback: redirect to the source image instead of showing initials.
    // This keeps the exhibit usable even when server-side Wikimedia fetching is rate-limited.
    res.setHeader('Cache-Control', 'no-store')
    return res.redirect(307, source.urls[0])
  }
}
