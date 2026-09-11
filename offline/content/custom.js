;(async function () {
  try {
    const response = await fetch('/content/display.json', { cache: 'no-store' })
    if (!response.ok) return
    const config = await response.json()
    const bg = config?.background
    if (!bg?.enabled || !bg?.src) return

    const host = document.createElement('div')
    host.id = 'offline-ambient-media'
    host.style.opacity = String(Math.max(0, Math.min(1, Number(bg.opacity ?? 0.28))))

    let media
    if (bg.type === 'image') {
      media = document.createElement('img')
      media.alt = ''
      media.src = bg.src
    } else {
      media = document.createElement('video')
      media.src = bg.src
      media.autoplay = true
      media.muted = true
      media.loop = true
      media.playsInline = true
      media.preload = 'auto'
    }

    media.style.objectFit = bg.fit || 'cover'
    host.appendChild(media)
    document.body.prepend(host)

    const root = document.querySelector('.v17-root')
    if (root) root.style.background = 'rgba(2,7,17,.82)'
  } catch (error) {
    console.warn('offline runtime media disabled', error)
  }
})()
