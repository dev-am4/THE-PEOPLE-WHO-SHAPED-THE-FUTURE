import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Home, Orbit, Search } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { people } from './people-reference.js'
import './exhibit-v18-detail-fix.css'

const RESET_MS = 90000
const FADE_MS = 900
const PORTRAIT_VERSION = '18'

function Backdrop() {
  return (
    <div className="v17-bg" aria-hidden="true">
      <div className="v17-stars" />
      <div className="v17-orbit v17-orbit-a" />
      <div className="v17-orbit v17-orbit-b" />
      <div className="v17-glow v17-glow-a" />
      <div className="v17-glow v17-glow-b" />
    </div>
  )
}

function Portrait({ person, className = '' }) {
  const [failed, setFailed] = useState(false)
  const src = person.portrait?.startsWith('/api/portrait')
    ? `${person.portrait}${person.portrait.includes('?') ? '&' : '?'}v=${PORTRAIT_VERSION}`
    : person.portrait

  useEffect(() => {
    setFailed(false)
  }, [person.id, src])

  return (
    <div className={`v17-portrait ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={person.name}
          draggable="false"
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="v17-portrait-fallback">{person.name?.slice(0, 2)}</div>
      )}
    </div>
  )
}

function Brand() {
  return (
    <div className="v17-brand">
      <span><Orbit size={18} /></span>
      <div>
        <strong>บุคคลผู้เปลี่ยนโลก</strong>
        <small>THE PEOPLE WHO SHAPED THE FUTURE</small>
      </div>
    </div>
  )
}

function HomeScreen({ onExplore, onSelect }) {
  return (
    <main className="v17-screen v17-home-screen">
      <Backdrop />
      <header className="v17-home-head">
        <Brand />
        <div className="v17-zone-note">FUTURE CAREERS ZONE · INSPIRATION ARCHIVE</div>
      </header>

      <section className="v17-home-main">
        <div className="v17-home-copy">
          <div className="v17-eyebrow"><span /> STORIES THAT SHAPED THE FUTURE</div>
          <h1>12 เรื่องราว<br /><em>ของคนที่เปลี่ยนโลก</em></h1>
          <p>เรียนรู้จากบุคคลสำคัญ ผ่านเรื่องราว ชีวิต และผลงานที่ผลักขอบเขตของวิทยาศาสตร์ อวกาศ เทคโนโลยี และความคิดสร้างสรรค์ไปข้างหน้า</p>
          <button className="v17-primary" onClick={onExplore}>
            <span><small>TOUCH TO BEGIN</small>เลือกบุคคลเพื่อเริ่มสำรวจ</span>
            <ArrowRight size={28} />
          </button>
          <div className="v17-home-caption">เชื่อมโยงความรู้กับโอกาสในอนาคต · สร้างแรงบันดาลใจ</div>
        </div>

        <div className="v17-home-portraits" aria-label="บุคคลสำคัญ 12 คน">
          {people.map((person, index) => (
            <button key={person.id} className="v17-mini-person" onClick={() => onSelect(person.id)}>
              <Portrait person={person} />
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{person.name}</strong>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function Gallery({ onHome, onSelect }) {
  return (
    <main className="v17-screen v17-gallery-screen">
      <Backdrop />
      <header className="v17-toolbar">
        <button className="v17-nav-pill" onClick={onHome}><Home size={18} /> หน้าแรก</button>
        <div className="v17-gallery-title">
          <small>PEOPLE ARCHIVE · 12 STORIES</small>
          <h1>เลือกคนที่คุณอยากรู้จัก</h1>
        </div>
        <div className="v17-counter">12 <small>/ 12</small></div>
      </header>

      <section className="v17-gallery-grid">
        {people.map((person, index) => (
          <button key={person.id} className="v17-person-card" style={{ '--accent': person.accent }} onClick={() => onSelect(person.id)}>
            <Portrait person={person} />
            <div className="v17-person-no">{String(index + 1).padStart(2, '0')}</div>
            <div className="v17-person-info">
              <small>{person.role}</small>
              <strong>{person.name}</strong>
              <span>{person.en}</span>
            </div>
            <i><ArrowRight size={18} /></i>
          </button>
        ))}
      </section>
    </main>
  )
}

function Works({ person }) {
  return (
    <section className="v17-works">
      <header className="v17-section-title">
        <span>02</span>
        <div><small>KEY WORKS / CONTRIBUTIONS</small><h2>{person.worksTitle}</h2></div>
      </header>

      <div className="v17-works-layout">
        <div className="v17-work-list">
          {person.works.map((work, index) => (
            <article key={`${person.id}-${index}`}>
              <b>{index + 1}</b>
              <p>{work}</p>
            </article>
          ))}
        </div>

        <aside className="v17-works-qr" aria-label={`QR Code สำหรับ ${person.name}`}>
          <ExploreQR person={person} />
        </aside>
      </div>
    </section>
  )
}

function ExploreQR({ person }) {
  const query = encodeURIComponent(`${person.name} ${person.en}`)
  const url = `https://www.google.com/search?q=${query}`
  return (
    <div className="v17-qr-block">
      <div className="v17-qr-code">
        <QRCodeSVG value={url} level="M" size={230} bgColor="#ffffff" fgColor="#06101c" marginSize={2} />
      </div>
      <div className="v17-qr-text">
        <div><Search size={18} /><small>KEEP EXPLORING</small></div>
        <strong>สแกนเพื่ออ่านต่อ</strong>
        <span>ค้นหา {person.name} บน Google</span>
      </div>
    </div>
  )
}

function Detail({ person, onAll, onHome, onMove }) {
  const index = people.findIndex(p => p.id === person.id)
  const startX = useRef(null)

  const pointerDown = (event) => {
    if (event.target.closest('button')) return
    startX.current = event.clientX
  }
  const pointerUp = (event) => {
    if (startX.current == null) return
    const dx = event.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 90) onMove(dx < 0 ? 1 : -1)
  }

  return (
    <main className="v17-screen v17-detail-screen" style={{ '--accent': person.accent }} onPointerDown={pointerDown} onPointerUp={pointerUp}>
      <Backdrop />
      <header className="v17-toolbar v17-detail-toolbar">
        <button className="v17-nav-pill" onClick={onAll}><ArrowLeft size={18} /> บุคคลทั้งหมด</button>
        <div className="v17-profile-count"><b>{String(index + 1).padStart(2, '0')}</b><small>/ 12</small></div>
        <button className="v17-nav-pill" onClick={onHome}><Home size={18} /> หน้าแรก</button>
      </header>

      <section className="v17-detail-layout">
        <article className="v17-story-column">
          <header className="v17-identity">
            <small>HUMAN ARCHIVE · PROFILE {String(index + 1).padStart(2, '0')}</small>
            <h1>{person.name}</h1>
            <p>{person.en} · {person.role}</p>
            {person.quote && <blockquote>{person.quote}</blockquote>}
          </header>

          <section className="v17-bio">
            <header className="v17-section-title">
              <span>01</span>
              <div><small>THE STORY</small><h2>เรื่องราวของเขา</h2></div>
            </header>
            <p>{person.intro}</p>
          </section>

          <Works person={person} />
        </article>

        <aside className="v17-side-column">
          <div className="v17-side-label"><span>MISSION PORTRAIT</span><b>{String(index + 1).padStart(2, '0')}</b></div>
          <Portrait person={person} className="v17-detail-portrait" />
        </aside>
      </section>

      <footer className="v17-person-nav">
        <button onClick={() => onMove(-1)}><ChevronLeft size={22} /><span><small>PREVIOUS</small>คนก่อนหน้า</span></button>
        <div className="v17-dots">{people.map(p => <i key={p.id} className={p.id === person.id ? 'active' : ''} />)}</div>
        <button onClick={() => onMove(1)}><span><small>NEXT</small>คนถัดไป</span><ChevronRight size={22} /></button>
      </footer>
    </main>
  )
}

export default function ExhibitV17() {
  const [screen, setScreen] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [fading, setFading] = useState(false)
  const idle = useRef(null)
  const fade = useRef(null)

  const selected = useMemo(() => people.find(p => p.id === selectedId), [selectedId])

  const goHome = () => {
    setScreen('home')
    setSelectedId(null)
  }

  const selectPerson = (id) => {
    setSelectedId(id)
    setScreen('detail')
  }

  const move = (delta) => {
    const current = people.findIndex(p => p.id === selectedId)
    const next = (current + delta + people.length) % people.length
    setSelectedId(people[next].id)
  }

  useEffect(() => {
    const clear = () => {
      clearTimeout(idle.current)
      clearTimeout(fade.current)
    }
    const reset = () => {
      clear()
      setFading(false)
      if (screen !== 'home') {
        idle.current = setTimeout(() => {
          setFading(true)
          fade.current = setTimeout(() => {
            goHome()
            setFading(false)
          }, FADE_MS)
        }, RESET_MS)
      }
    }
    const events = ['pointerdown', 'touchstart', 'keydown']
    events.forEach(event => window.addEventListener(event, reset, { passive: true }))
    reset()
    return () => {
      clear()
      events.forEach(event => window.removeEventListener(event, reset))
    }
  }, [screen])

  return (
    <div className={`v17-root ${fading ? 'is-fading' : ''}`}>
      {screen === 'home' && <HomeScreen onExplore={() => setScreen('gallery')} onSelect={selectPerson} />}
      {screen === 'gallery' && <Gallery onHome={goHome} onSelect={selectPerson} />}
      {screen === 'detail' && selected && <Detail person={selected} onAll={() => setScreen('gallery')} onHome={goHome} onMove={move} />}
      <div className="v17-fade" />
    </div>
  )
}
