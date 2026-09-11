import { useEffect, useRef } from 'react'
import ExhibitV13 from './ExhibitV13.jsx'
import { people } from './people-v14.js'

const byName = new Map(people.map(person => [person.name, person]))

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function polarPoint(cx, cy, radius, index, count) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index / count)
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]
}

function pointsString(values, radius, cx, cy) {
  return values
    .map((value, index) => {
      const [x, y] = polarPoint(cx, cy, radius * value, index, values.length)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function radarMarkup(person) {
  const labels = person.skillLabels || []
  const scores = labels.map((_, index) => Math.max(0, Math.min(100, Number(person.skills?.[index] ?? 80))))
  const count = Math.max(labels.length, 1)
  const cx = 200
  const cy = 150
  const radius = 94
  const id = `radar-${person.id}`

  const grid = [0.2, 0.4, 0.6, 0.8, 1]
    .map(level => `<polygon points="${pointsString(Array(count).fill(level), radius, cx, cy)}" fill="none" stroke="rgba(143,198,228,.14)" stroke-width="1"/>`)
    .join('')

  const axes = labels
    .map((label, index) => {
      const [x, y] = polarPoint(cx, cy, radius, index, count)
      const [lx, ly] = polarPoint(cx, cy, radius + 34, index, count)
      const anchor = lx < cx - 12 ? 'end' : lx > cx + 12 ? 'start' : 'middle'
      const dy = ly < cy - 20 ? -4 : ly > cy + 20 ? 13 : 4
      return `
        <line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(132,201,235,.18)" stroke-width="1"/>
        <text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}" class="v14-radar-label">${escapeXml(label)}</text>
      `
    })
    .join('')

  const scorePoints = pointsString(scores.map(score => score / 100), radius, cx, cy)
  const dots = scores
    .map((score, index) => {
      const [x, y] = polarPoint(cx, cy, radius * score / 100, index, count)
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#e9fbff" stroke="${person.color || '#70dcff'}" stroke-width="2"/>`
    })
    .join('')

  return `
    <div class="v14-radar-head">
      <div><small>SKILL RADAR / วิธีคิด</small><strong>แผนที่ทักษะของเรื่องราวนี้</strong></div>
      <span>05 AXES</span>
    </div>
    <svg class="v14-radar-svg" viewBox="0 0 400 310" role="img" aria-label="แผนภูมิเรดาร์ทักษะของ ${escapeXml(person.name)}">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#67e6ff" stop-opacity=".42"/>
          <stop offset="1" stop-color="#9c7dff" stop-opacity=".28"/>
        </linearGradient>
        <filter id="${id}-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${grid}
      ${axes}
      <polygon points="${scorePoints}" fill="url(#${id})" stroke="${person.color || '#70dcff'}" stroke-width="2.4" filter="url(#${id}-glow)"/>
      ${dots}
      <circle cx="${cx}" cy="${cy}" r="3" fill="#dffaff"/>
    </svg>
    <div class="v14-radar-scale"><span>0</span><i></i><span>100</span></div>
    <p>ใช้เพื่อเชื่อมโยง “วิธีคิด” กับทักษะที่ผู้ชมสามารถพัฒนาต่อได้ ไม่ใช่คะแนนประเมินตัวบุคคลจริง</p>
  `
}

function enhance(root) {
  root.querySelectorAll('.v13-portrait img[alt]').forEach(img => {
    const person = byName.get(img.getAttribute('alt'))
    if (!person) return
    const localSrc = `/api/portrait?id=${encodeURIComponent(person.id)}`
    if (img.getAttribute('src') !== localSrc) img.setAttribute('src', localSrc)
    img.style.objectPosition = '50% 50%'
    img.dataset.v14Portrait = person.id
  })

  const skillsGrid = root.querySelector('.v13-skills-grid')
  const title = root.querySelector('.v13-identity h1')?.textContent?.trim()
  const person = byName.get(title)

  if (skillsGrid && person) {
    let radar = skillsGrid.querySelector('.v14-radar-card')
    if (!radar) {
      radar = document.createElement('section')
      radar.className = 'v14-radar-card v13-glass-soft'
      skillsGrid.prepend(radar)
    }
    if (radar.dataset.personId !== person.id) {
      radar.dataset.personId = person.id
      radar.style.setProperty('--person-accent', person.color || '#70dcff')
      radar.innerHTML = radarMarkup(person)
    }
  }
}

export default function ExhibitV14() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => enhance(root))
    }

    enhance(root)
    const observer = new MutationObserver(run)
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="v14-root" ref={rootRef}>
      <ExhibitV13 />
    </div>
  )
}
