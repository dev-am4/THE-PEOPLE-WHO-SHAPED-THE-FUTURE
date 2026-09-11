import { useEffect, useRef } from 'react'
import ExhibitV14 from './ExhibitV14.jsx'

function enhanceStoryFirst(root) {
  const detail = root.querySelector('.v15-open-detail')
  const flow = root.querySelector('.v15-detail-flow')
  const career = root.querySelector('.v15-career-section')
  const originalQr = root.querySelector('.v13-visual-column > .v13-qr')
  const personName = root.querySelector('.v13-identity h1')?.textContent?.trim() || ''

  if (detail) detail.classList.add('v16-story-first-detail')
  if (flow) flow.classList.add('v16-story-first-flow')

  if (!career || !originalQr || !personName) return

  originalQr.classList.add('v16-original-qr-hidden')

  let clone = career.querySelector('.v16-qr-copy')
  if (clone?.dataset.personName !== personName) {
    clone?.remove()
    clone = originalQr.cloneNode(true)
    clone.classList.remove('v16-original-qr-hidden')
    clone.classList.add('v16-qr-copy')
    clone.dataset.personName = personName
    clone.setAttribute('aria-label', `QR Code ค้นหา ${personName} เพิ่มเติม`)
    career.appendChild(clone)
  }
}

export default function ExhibitV15() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => enhanceStoryFirst(root))
    }

    enhanceStoryFirst(root)
    const observer = new MutationObserver(run)
    observer.observe(root, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="v16-root" ref={rootRef}>
      <ExhibitV14 />
    </div>
  )
}
