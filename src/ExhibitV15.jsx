import { useEffect, useRef } from 'react'
import ExhibitV14 from './ExhibitV14.jsx'

function enhanceStoryFirst(root) {
  const detail = root.querySelector('.v15-open-detail')
  const flow = root.querySelector('.v15-detail-flow')
  const career = root.querySelector('.v15-career-section')
  const qr = root.querySelector('.v13-visual-column > .v13-qr') || root.querySelector('.v15-career-section > .v13-qr.v16-qr-large')

  if (detail) detail.classList.add('v16-story-first-detail')
  if (flow) flow.classList.add('v16-story-first-flow')

  if (!career || !qr) return

  // Move the real QR node instead of cloning it. This keeps the current person's
  // actual QR code and lets the enlarged layout control its dimensions reliably.
  qr.classList.add('v16-qr-large')
  if (qr.parentElement !== career) career.appendChild(qr)
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
