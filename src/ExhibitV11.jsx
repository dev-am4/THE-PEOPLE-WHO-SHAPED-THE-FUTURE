import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Home,
  Orbit,
  Search,
  Sparkles,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { categories, people } from './people-v3.js'

const RESET_MS = 90000
const FADE_MS = 1200

function Portrait({ person, className = '' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`v11-portrait ${className}`}>
      {person.portrait && !failed ? (
        <img
          src={person.portrait}
          alt={person.name}
          draggable="false"
          onError={() => setFailed(true)}
          style={{ objectPosition: person.focus || '50% 25%' }}
        />
      ) : (
        <div className="v11-fallback">{person.initials}</div>
      )}
    </div>
  )
}

function SpaceBackdrop() {
  return (
    <div className="v11-space" aria-hidden="true">
      <div className="v11-stars" />
      <div className="v11-grid" />
      <div className="v11-orbit v11-orbit-a" />
      <div className="v11-orbit v11-orbit-b" />
      <div className="v11-glow" />
    </div>
  )
}

function Brand() {
  return (
    <div className="v11-brand">
      <span className="v11-brand-mark"><Orbit size={20} /></span>
      <div>
        <strong>บุคคลผู้เปลี่ยนโลก</strong>
        <span>THE PEOPLE WHO SHAPED THE FUTURE</span>
      </div>
    </div>
  )
}

function Attract({ onExplore, onSelect }) {
  return (
    <main className="v11-screen v11-attract">
      <SpaceBackdrop />
      <header className="v11-attract-header"><Brand /></header>

      <section className="v11-attract-layout">
        <div className="v11-attract-copy">
          <span className="v11-kicker">FUTURE THINKERS ARCHIVE · INTERACTIVE</span>
          <h1>คนที่กล้าคิด<br /><em>ก่อนโลกจะเชื่อ</em></h1>
          <p>สำรวจเรื่องราว วิธีคิด และเส้นทางอาชีพของคนที่เปลี่ยนวิธีมองโลกของมนุษย์</p>
          <div className="v11-attract-question">
            <small>START WITH A QUESTION</small>
            <strong>ถ้าเป็นคุณ… จะเริ่มเปลี่ยนอนาคตจากคำถามอะไร?</strong>
          </div>
          <button className="v11-primary" onClick={onExplore}>
            <span>แตะเพื่อเลือกบุคคล</span><ArrowRight size={24} />
          </button>
        </div>

        <div className="v11-attract-wall" aria-label="เลือกบุคคลสำคัญ">
          {people.slice(0, 8).map((person, index) => (
            <button
              key={person.id}
              className="v11-attract-person"
              onClick={() => onSelect(person.id)}
              style={{ '--accent': person.color }}
            >
              <Portrait person={person} />
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{person.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <footer className="v11-attract-footer">
        <span>SCIENCE</span><i /><span>SPACE</span><i /><span>TECHNOLOGY</span><i /><span>CREATIVITY</span>
      </footer>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome }) {
  const visible = useMemo(
    () => filter === 'all' ? people : people.filter(person => person.category.includes(filter)),
    [filter],
  )

  return (
    <main className="v11-screen v11-gallery">
      <SpaceBackdrop />
      <header className="v11-gallery-header">
        <button className="v11-utility" onClick={onHome}><Home size={20} /><span>หน้าแรก</span></button>
        <div className="v11-gallery-heading">
          <span>12 เรื่องราว · 12 วิธีคิด</span>
          <h1>เลือกคนที่คุณอยากเรียนรู้จากเขา</h1>
        </div>
        <div className="v11-header-index">ARCHIVE / 12</div>
      </header>

      <nav className="v11-filter" aria-label="เลือกหมวดหมู่">
        {categories.map(category => (
          <button
            key={category.id}
            className={filter === category.id ? 'active' : ''}
            onClick={() => setFilter(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <section className="v11-gallery-grid">
        {visible.map(person => {
          const index = people.indexOf(person) + 1
          return (
            <button
              key={person.id}
              className="v11-person-card"
              onClick={() => onSelect(person.id)}
              style={{ '--accent': person.color }}
            >
              <Portrait person={person} />
              <span className="v11-person-number">{String(index).padStart(2, '0')}</span>
              <div className="v11-person-copy">
                <small>{person.years}</small>
                <h2>{person.name}</h2>
                <p>{person.hook}</p>
              </div>
              <span className="v11-person-open"><ArrowRight size={19} /></span>
            </button>
          )
        })}
      </section>

      <footer className="v11-gallery-footer">
        <span>แตะการ์ดเพื่อเปิดแฟ้มบุคคล</span>
        <span>{String(visible.length).padStart(2, '0')} / {String(people.length).padStart(2, '0')}</span>
      </footer>
    </main>
  )
}

function StoryPanel({ person }) {
  const cards = [
    { no: '01', label: 'เขาคือใคร', text: person.intro },
    { no: '02', label: 'สิ่งที่เขาเปลี่ยน', text: person.impact },
    { no: '03', label: 'สิ่งที่เราเรียนรู้ได้', text: person.moment, featured: true },
  ]

  return (
    <div className="v11-story-grid">
      {cards.map(card => (
        <section key={card.no} className={card.featured ? 'featured' : ''}>
          <div className="v11-card-head"><span>{card.no}</span><strong>{card.label}</strong></div>
          <p>{card.text}</p>
          {card.featured && <Sparkles size={18} />}
        </section>
      ))}
    </div>
  )
}

function Radar({ person }) {
  const size = 320
  const center = 160
  const radius = 108
  const points = values => values.map((value, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / values.length
    return `${center + Math.cos(angle) * radius * value},${center + Math.sin(angle) * radius * value}`
  }).join(' ')

  const scorePoints = points(person.skills.map(value => value / 100))

  return (
    <div className="v11-skills-layout">
      <div className="v11-radar-panel">
        <div className="v11-panel-label">THINKING DNA</div>
        <svg className="v11-radar" viewBox={`0 0 ${size} ${size}`} aria-label="แผนผังทักษะ">
          {[0.25, 0.5, 0.75, 1].map(level => (
            <polygon key={level} points={points(person.skills.map(() => level))} className="v11-radar-ring" />
          ))}
          {person.skills.map((_, index) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / person.skills.length
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={center + Math.cos(angle) * radius}
                y2={center + Math.sin(angle) * radius}
                className="v11-radar-axis"
              />
            )
          })}
          <polygon points={scorePoints} className="v11-radar-score" />
          {person.skills.map((value, index) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / person.skills.length
            const rr = radius * value / 100
            return <circle key={index} cx={center + Math.cos(angle) * rr} cy={center + Math.sin(angle) * rr} r="5" className="v11-radar-dot" />
          })}
        </svg>
        <small>แผนภาพนี้ใช้เพื่อการเรียนรู้ ไม่ใช่คะแนนประเมินบุคคลจริง</small>
      </div>

      <div className="v11-skill-list">
        {person.skillLabels.map((label, index) => (
          <section key={label}>
            <div><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong><b>{person.skills[index]}</b></div>
            <i><em style={{ width: `${person.skills[index]}%` }} /></i>
            <p>{person.skillStories?.[index] || `ทักษะ “${label}” เป็นส่วนสำคัญที่เรื่องราวของ ${person.name} สะท้อนให้เห็น`}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

function CareerPanel({ person }) {
  return (
    <div className="v11-career-wrap">
      <div className="v11-career-intro">
        <BrainCircuit size={28} />
        <div>
          <small>FROM INSPIRATION TO FUTURE CAREER</small>
          <strong>เรื่องราวนี้ต่อยอดไปสู่อาชีพอะไรได้บ้าง?</strong>
        </div>
      </div>
      <div className="v11-career-grid">
        {person.careers.map((career, index) => (
          <section key={career}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{career}</strong>
            <ArrowRight size={19} />
          </section>
        ))}
      </div>
      <div className="v11-next-stop">
        <span>NEXT EXPERIENCE</span>
        <strong>ไปต่อที่ Career Radar Chart</strong>
        <p>สำรวจว่าทักษะและความสนใจของคุณเชื่อมโยงกับอาชีพในอนาคตแบบไหน</p>
      </div>
    </div>
  )
}

function PersonQR({ person }) {
  const query = encodeURIComponent(`${person.name} ${person.en}`)
  const googleUrl = `https://www.google.com/search?q=${query}`

  return (
    <aside className="v11-qr" aria-label={`QR Code ค้นหา ${person.name} บน Google`}>
      <div className="v11-qr-box">
        <QRCodeSVG value={googleUrl} size={104} level="M" bgColor="#ffffff" fgColor="#07111f" marginSize={2} />
      </div>
      <div className="v11-qr-copy">
        <div><Search size={17} /><small>KEEP EXPLORING</small></div>
        <strong>สแกนเพื่อค้นหาเพิ่มเติม</strong>
        <span>ค้นหาชื่อบุคคลนี้บน Google ด้วยมือถือของคุณ</span>
      </div>
    </aside>
  )
}

function Detail({ person, onBack, onHome, onMove }) {
  const [tab, setTab] = useState('story')
  const startX = useRef(null)
  const personIndex = people.indexOf(person)
  const progress = ((personIndex + 1) / people.length) * 100

  useEffect(() => setTab('story'), [person.id])

  const onPointerDown = event => {
    if (event.target.closest('button')) return
    startX.current = event.clientX
  }

  const onPointerUp = event => {
    if (startX.current == null) return
    const dx = event.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 100) onMove(dx < 0 ? 1 : -1)
  }

  return (
    <main
      className="v11-screen v11-detail"
      style={{ '--accent': person.color }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <SpaceBackdrop />

      <header className="v11-detail-header">
        <button className="v11-utility v11-back" onClick={onBack}><ArrowLeft size={20} /><span>บุคคลทั้งหมด</span></button>
        <div className="v11-progress-head">
          <div><strong>{String(personIndex + 1).padStart(2, '0')}</strong><span>/ {String(people.length).padStart(2, '0')}</span></div>
          <i><em style={{ width: `${progress}%` }} /></i>
        </div>
        <button className="v11-utility" onClick={onHome}><Home size={20} /><span>หน้าแรก</span></button>
      </header>

      <section className="v11-detail-shell">
        <div className="v11-dossier">
          <div className="v11-identity">
            <div className="v11-identity-kicker"><span>MISSION PROFILE</span><i /> <b>{String(personIndex + 1).padStart(2, '0')}</b></div>
            <h1>{person.name}</h1>
            <p className="v11-en">{person.en} <span>·</span> {person.years}</p>
            <blockquote>{person.hook}</blockquote>
          </div>

          <nav className="v11-tabs" aria-label="เลือกเนื้อหา">
            <button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}><span>01</span><strong>เรื่องราว</strong></button>
            <button className={tab === 'skills' ? 'active' : ''} onClick={() => setTab('skills')}><span>02</span><strong>วิธีคิด</strong></button>
            <button className={tab === 'career' ? 'active' : ''} onClick={() => setTab('career')}><span>03</span><strong>อาชีพที่เกี่ยวข้อง</strong></button>
          </nav>

          <div className="v11-panel" key={`${person.id}-${tab}`}>
            {tab === 'story' && <StoryPanel person={person} />}
            {tab === 'skills' && <Radar person={person} />}
            {tab === 'career' && <CareerPanel person={person} />}
          </div>
        </div>

        <aside className="v11-visual-column">
          <div className="v11-photo-frame">
            <div className="v11-photo-meta"><span>HUMAN ARCHIVE</span><b>{String(personIndex + 1).padStart(2, '0')}</b></div>
            <Portrait person={person} className="v11-detail-portrait" />
            <div className="v11-photo-scan" />
            <div className="v11-photo-caption">
              <span>{person.years}</span>
              <strong>{person.en}</strong>
            </div>
          </div>
          <PersonQR person={person} />
        </aside>
      </section>

      <footer className="v11-detail-nav">
        <button onClick={() => onMove(-1)}><ChevronLeft size={26} /><span><small>PREVIOUS</small>คนก่อนหน้า</span></button>
        <div className="v11-dots">
          {people.map(item => <i key={item.id} className={item.id === person.id ? 'active' : ''} />)}
        </div>
        <div className="v11-swipe-hint">ปัดซ้าย–ขวาบนพื้นที่ว่างเพื่อเปลี่ยนบุคคล</div>
        <button onClick={() => onMove(1)}><span><small>NEXT</small>คนถัดไป</span><ChevronRight size={26} /></button>
      </footer>
    </main>
  )
}

function TouchRipple({ ripple }) {
  return ripple ? <span className="v11-ripple" key={ripple.id} style={{ left: ripple.x, top: ripple.y }} /> : null
}

export default function ExhibitV11() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [idleFading, setIdleFading] = useState(false)
  const [ripple, setRipple] = useState(null)
  const idleRef = useRef(null)
  const fadeRef = useRef(null)

  const selected = people.find(person => person.id === selectedId)

  const goHome = () => {
    setScreen('attract')
    setSelectedId(null)
    setFilter('all')
  }

  useEffect(() => {
    const clearIdle = () => {
      clearTimeout(idleRef.current)
      clearTimeout(fadeRef.current)
    }

    const reset = () => {
      clearIdle()
      setIdleFading(false)
      if (screen !== 'attract') {
        idleRef.current = setTimeout(() => {
          setIdleFading(true)
          fadeRef.current = setTimeout(() => {
            goHome()
            setIdleFading(false)
          }, FADE_MS)
        }, RESET_MS)
      }
    }

    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach(eventName => window.addEventListener(eventName, reset, { passive: true }))
    reset()

    return () => {
      clearIdle()
      events.forEach(eventName => window.removeEventListener(eventName, reset))
    }
  }, [screen])

  useEffect(() => {
    const showRipple = event => {
      setRipple({ id: Date.now(), x: event.clientX, y: event.clientY })
      window.setTimeout(() => setRipple(null), 420)
    }
    window.addEventListener('pointerdown', showRipple, { passive: true })
    return () => window.removeEventListener('pointerdown', showRipple)
  }, [])

  const selectPerson = id => {
    setSelectedId(id)
    setScreen('detail')
  }

  const move = delta => {
    const currentIndex = people.findIndex(person => person.id === selectedId)
    const nextIndex = (currentIndex + delta + people.length) % people.length
    setSelectedId(people[nextIndex].id)
  }

  let content
  if (screen === 'attract') {
    content = <Attract onExplore={() => setScreen('gallery')} onSelect={selectPerson} />
  } else if (screen === 'gallery') {
    content = <Gallery filter={filter} setFilter={setFilter} onSelect={selectPerson} onHome={goHome} />
  } else if (selected) {
    content = <Detail person={selected} onBack={() => setScreen('gallery')} onHome={goHome} onMove={move} />
  } else {
    content = <Attract onExplore={() => setScreen('gallery')} onSelect={selectPerson} />
  }

  return (
    <div className={`v11-root ${idleFading ? 'is-idle-fading' : ''}`}>
      <TouchRipple ripple={ripple} />
      {content}
      <div className="v11-idle-veil" aria-hidden="true" />
    </div>
  )
}
