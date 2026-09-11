import sharp from 'sharp'

const SOURCES = {
  ajong: {
    url: 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people/ajong.jpg',
    initials: 'อจ', position: 'north',
  },
  virul: {
    url: 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people/virul.jpg',
    initials: 'วส', position: 'north',
  },
  prawase: {
    url: 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people/prawase.jpg',
    initials: 'ปว', position: 'north',
  },
  rawi: {
    url: 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people/rawi.jpg',
    initials: 'รภ', position: 'centre',
  },
  einstein: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Albert%20Einstein%20Head.jpg',
    initials: 'AE', position: 'north',
  },
  asimov: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Isaac.Asimov01.jpg',
    initials: 'IA', position: 'north',
  },
  armstrong: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Neil%20Armstrong%20pose.jpg',
    initials: 'NA', position: 'centre',
  },
  linus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/LinuxCon%20Europe%20Linus%20Torvalds%2003.jpg',
    initials: 'LT', position: 'centre',
  },
  beeple: {
    url: 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people/beeple.jpg',
    initials: 'BW', position: 'north',
  },
  nolan: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Christopher%20Nolan%20Cannes%202018.jpg',
    initials: 'CN', position: 'north',
  },
  elon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Elon%20Musk%20Royal%20Society%20(crop1).jpg',
    initials: 'EM', position: 'north',
  },
  knuth: {
    url: 'https://raw.githubusercontent.com/dev-am4/THE-PEOPLE-WHO-SHAPED-THE-FUTURE/main/public/people/knuth.jpg',
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

export default async function handler(req, res) {
  const id = String(req.query?.id || '').toLowerCase()
  const source = SOURCES[id]

  if (!source) {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600')
    return res.status(404).send(fallbackSvg('??'))
  }

  try {
    const upstream = await fetch(source.url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeopleWhoShapedTheFuture/1.0)',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    })

    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`)

    const input = Buffer.from(await upstream.arrayBuffer())
    const image = await sharp(input)
      .rotate()
      .resize(720, 960, {
        fit: 'cover',
        position: source.position,
        withoutEnlargement: false,
      })
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toBuffer()

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, stale-while-revalidate=86400')
    return res.status(200).send(image)
  } catch (error) {
    console.error('portrait-cache', id, error?.message || error)
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
    return res.status(200).send(fallbackSvg(source.initials))
  }
}
