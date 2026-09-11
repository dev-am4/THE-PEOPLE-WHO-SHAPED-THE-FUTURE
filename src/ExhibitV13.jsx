import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
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
const FADE_MS = 1100

const PEOPLE = (people || []).map((person, index) => ({
  ...person,
  id: person.id || `person-${index + 1}`,
  name: person.name || 'ไม่ระบุชื่อ',
  en: person.en || '',
  years: person.years || '',
  hook: person.hook || '',
  intro: person.intro || '',
  impact: person.impact || '',
  moment: person.moment || '',
  careers: Array.isArray(person.careers) ? person.careers : [],
  category: Array.isArray(person.category) ? person.category : [],
  skills: Array.isArray(person.skills) ? person.skills : [80, 80, 80, 80, 80],
  skillLabels: Array.isArray(person.skillLabels)
    ? person.skillLabels
    : ['คิดวิเคราะห์', 'แก้ปัญหา', 'วิทยาศาสตร์', 'สร้างสรรค์', 'ทำงานเป็นทีม'],
  color: person.color || '#70dcff',
  initials: person.initials || person.name?.slice(0, 2) || '??',
  focus: person.focus || '50% 26%',
}))

function transitionTo(update) {
  if (typeof document !== 'undefined' && document.startViewTransition) {
    document.startViewTransition(update)
  } else {
    update()
  }
}

function Portrait({ person, className = '', transitionName }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [person.id, person.portrait])

  return (
    <div
      className={`v13-portrait ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''} ${className}`}
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
    >
      {person.portrait && !failed ? (
        <img
          src={person.portrait}
          alt={person.name}
          draggable="false"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ objectPosition: person.focus }}
        />
      ) : (
        <div className="v13-fallback" aria-label={`ไม่มีภาพ ${person.name}`}>
          <span>{person.initials}</span>
          <small>PORTRAIT UNAVAILABLE</small>
        </div>
      )}
      {!loaded && !failed && <div className="v13-photo-skeleton" />}
      <span className="v13-portrait-shade" />
      <span className="v13-portrait-refraction" />
    </div>
  )
}

function Backdrop() {
  return (
    <div className="v13-backdrop" aria-hidden="true">
      <div className="v13-stars" />
      <div className="v13-grid" />
      <span className="v13-aurora aurora-a" />
      <span className="v13-aurora aurora-b" />
      <span className="v13-aurora aurora-c" />
      <span className="v13-orbit orbit-a" />
      <span className="v13-orbit orbit-b" />
      <span className="v13-horizon" />
    </div>
  )
}

function Brand() {
  return (
    <div className="v13-brand v13-glass-pill">
      <span className="v13-brand-mark"><Orbit size={20} /></span>
      <div>
        <strong>บุคคลผู้เปลี่ยนโลก</strong>
        <small>THE PEOPLE WHO SHAPED THE FUTURE</small>
      </div>
    </div>
  )
}

function Attract({ onExplore, onSelect }) {
  return (
    <main className="v13-screen v13-attract v13-view-enter">
      <Backdrop />

      <header className="v13-topbar">
        <Brand />
        <div className="v13-top-note v13-glass-pill">
          <span className="v13-live-dot" /> INTERACTIVE SPACE ARCHIVE · {String(PEOPLE.length).padStart(2, '0')} STORIES
        </div>
      </header>

      <section className="v13-hero v13-glass-panel">
        <div className="v13-hero-copy">
          <div className="v13-kicker"><span /> FUTURE THINKERS ARCHIVE</div>
          <h1>คนที่กล้าคิด<em>ก่อนโลกจะเชื่อ</em></h1>
          <p>
            สำรวจ {PEOPLE.length} บุคคลสำคัญ ผ่านเรื่องราว วิธีคิด และเส้นทางอาชีพ
            ที่เชื่อมอดีตกับโลกอนาคต
          </p>

          <div className="v13-question v13-glass-soft">
            <small>START WITH A QUESTION</small>
            <strong>ถ้าเป็นคุณ… จะเริ่มเปลี่ยนอนาคตจากคำถามอะไร?</strong>
          </div>

          <button className="v13-primary v13-touch" onClick={onExplore}>
            <span><small>EXPLORE THE ARCHIVE</small>เริ่มสำรวจทั้ง {PEOPLE.length} คน</span>
            <i><ArrowRight size={25} /></i>
          </button>

          <div className="v13-stats" aria-label="ข้อมูลนิทรรศการ">
            <span><b>{String(PEOPLE.length).padStart(2, '0')}</b><small>บุคคล</small></span>
            <span><b>{String(categories.length - 1).padStart(2, '0')}</b><small>หมวด</small></span>
            <span><b>03</b><small>มุมมองต่อคน</small></span>
          </div>
        </div>

        <div className="v13-constellation v13-glass-soft">
          <div className="v13-constellation-head">
            <div>
              <small>HUMAN CONSTELLATION</small>
              <strong>แตะภาพเพื่อเปิดเรื่องราวได้ทันที</strong>
            </div>
            <span>{String(PEOPLE.length).padStart(2, '0')} / {String(PEOPLE.length).padStart(2, '0')}</span>
          </div>

          <div className="v13-constellation-grid">
            {PEOPLE.map((person, index) => (
              <button
                key={person.id}
                className="v13-constellation-card v13-touch"
                onClick={() => onSelect(person.id)}
                style={{ '--accent': person.color, '--delay': `${index * 28}ms` }}
              >
                <Portrait person={person} transitionName={`portrait-${person.id}`} />
                <span className="v13-card-no">{String(index + 1).padStart(2, '0')}</span>
                <div className="v13-card-copy">
                  <strong>{person.name}</strong>
                  <small>{person.en || person.years}</small>
                </div>
                <span className="v13-card-arrow"><ArrowRight size={15} /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="v13-footerline">
        <span>SCIENCE</span><i /><span>SPACE</span><i /><span>TECHNOLOGY</span><i /><span>CREATIVITY</span>
        <b>แตะภาพบุคคล หรือกด “เริ่มสำรวจ”</b>
      </footer>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome }) {
  const visible = useMemo(
    () => filter === 'all' ? PEOPLE : PEOPLE.filter(person => person.category.includes(filter)),
    [filter],
  )

  return (
    <main className="v13-screen v13-gallery v13-view-enter">
      <Backdrop />

      <header className="v13-gallery-head v13-glass-panel">
        <button className="v13-utility v13-touch" onClick={onHome}><Home size={19} /><span>หน้าแรก</span></button>
        <div className="v13-gallery-title">
          <small>PEOPLE ARCHIVE</small>
          <h1>เลือกคนที่คุณอยากเรียนรู้จากเขา</h1>
        </div>
        <div className="v13-gallery-count"><b>{String(visible.length).padStart(2, '0')}</b><span>/ {String(PEOPLE.length).padStart(2, '0')}</span></div>
      </header>

      <nav className="v13-filter v13-glass-soft" aria-label="เลือกหมวดหมู่">
        {categories.map(category => (
          <button
            key={category.id}
            className={`v13-touch ${filter === category.id ? 'active' : ''}`}
            onClick={() => setFilter(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <section className={`v13-gallery-grid count-${Math.min(visible.length, 12)}`}>
        {visible.map((person, index) => {
          const globalIndex = PEOPLE.findIndex(item => item.id === person.id)
          return (
            <button
              key={person.id}
              className="v13-person-card v13-glass-panel v13-touch"
              onClick={() => onSelect(person.id)}
              style={{ '--accent': person.color, '--delay': `${index * 34}ms` }}
            >
              <Portrait person={person} transitionName={`portrait-${person.id}`} />
              <span className="v13-person-no">{String(globalIndex + 1).padStart(2, '0')}</span>
              <div className="v13-person-copy">
                <small>{person.years}</small>
                <h2>{person.name}</h2>
                <p>{person.hook}</p>
              </div>
              <span className="v13-person-open"><ArrowRight size={18} /></span>
            </button>
          )
        })}
      </section>

      <footer className="v13-gallery-footer">
        <span>แตะการ์ดเพื่อเปิดแฟ้มบุคคล</span>
        <span>{filter === 'all' ? 'ALL PEOPLE' : `FILTER · ${categories.find(item => item.id === filter)?.label || ''}`}</span>
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
    <div className="v13-story-grid v13-tab-enter">
      {cards.map(card => (
        <section key={card.no} className={`v13-glass-soft ${card.featured ? 'featured' : ''}`}>
          <div className="v13-card-head"><span>{card.no}</span><strong>{card.label}</strong></div>
          <p>{card.text}</p>
          {card.featured && <Sparkles size={18} />}
        </section>
      ))}
    </div>
  )
}

function SkillsPanel({ person }) {
  return (
    <div className="v13-skills-grid v13-tab-enter">
      {person.skillLabels.map((label, index) => {
        const score = Number(person.skills[index] ?? 80)
        return (
          <section key={`${label}-${index}`} className="v13-glass-soft">
            <div className="v13-skill-head">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{label}</strong>
              <b>{score}</b>
            </div>
            <i className="v13-skill-bar"><em style={{ width: `${Math.max(0, Math.min(100, score))}%` }} /></i>
            <p>ทักษะ “{label}” คือหนึ่งในวิธีคิดที่เรื่องราวของ {person.name} สะท้อนให้เห็น</p>
          </section>
        )
      })}
      <div className="v13-skills-note">แผนทักษะนี้ใช้เพื่อการเรียนรู้และเชื่อมโยงแนวคิด ไม่ใช่คะแนนประเมินบุคคลจริง</div>
    </div>
  )
}

function CareerPanel({ person }) {
  return (
    <div className="v13-career-wrap v13-tab-enter">
      <div className="v13-career-grid">
        {person.careers.map((career, index) => (
          <section key={`${career}-${index}`} className="v13-glass-soft">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{career}</strong>
            <ArrowRight size={18} />
          </section>
        ))}
      </div>
      <div className="v13-next v13-glass-soft">
        <small>NEXT EXPERIENCE</small>
        <strong>ไปต่อที่ Career Radar Chart</strong>
        <p>สำรวจว่าความสนใจและทักษะของคุณเชื่อมโยงกับอาชีพในอนาคตแบบไหน</p>
      </div>
    </div>
  )
}

function PersonQR({ person }) {
  const query = encodeURIComponent(`${person.name} ${person.en}`)
  const googleUrl = `https://www.google.com/search?q=${query}`

  return (
    <aside className="v13-qr v13-glass-soft" aria-label={`QR Code ค้นหา ${person.name} บน Google`}>
      <div className="v13-qr-box">
        <QRCodeSVG value={googleUrl} size={92} level="M" bgColor="#ffffff" fgColor="#07111f" marginSize={2} />
      </div>
      <div className="v13-qr-copy">
        <div><Search size={16} /><small>KEEP EXPLORING</small></div>
        <strong>สแกนเพื่อค้นหาเพิ่มเติม</strong>
        <span>เปิด Google Search บนมือถือของคุณ</span>
      </div>
    </aside>
  )
}

function Detail({ person, onBack, onHome, onMove }) {
  const [tab, setTab] = useState('story')
  const startX = useRef(null)
  const personIndex = PEOPLE.findIndex(item => item.id === person.id)

  useEffect(() => setTab('story'), [person.id])

  const onPointerDown = event => {
    if (event.target.closest('button')) return
    startX.current = event.clientX
  }

  const onPointerUp = event => {
    if (startX.current == null) return
    const dx = event.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 90) onMove(dx < 0 ? 1 : -1)
  }

  return (
    <main className="v13-screen v13-detail v13-view-enter" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <Backdrop />

      <header className="v13-detail-head">
        <button className="v13-utility v13-touch" onClick={onBack}><ArrowLeft size={19} /><span>บุคคลทั้งหมด</span></button>
        <div className="v13-detail-index v13-glass-pill"><b>{String(personIndex + 1).padStart(2, '0')}</b><span>/ {String(PEOPLE.length).padStart(2, '0')}</span></div>
        <button className="v13-utility v13-touch" onClick={onHome}><Home size={19} /><span>หน้าแรก</span></button>
      </header>

      <section className="v13-detail-shell" key={person.id}>
        <div className="v13-dossier v13-glass-panel">
          <div className="v13-identity">
            <small>HUMAN ARCHIVE · PROFILE {String(personIndex + 1).padStart(2, '0')}</small>
            <h1>{person.name}</h1>
            <p>{person.en} <span>·</span> {person.years}</p>
            <blockquote style={{ '--accent': person.color }}>{person.hook}</blockquote>
          </div>

          <nav className="v13-tabs v13-glass-soft" aria-label="เลือกเนื้อหา">
            <button className={`v13-touch ${tab === 'story' ? 'active' : ''}`} onClick={() => setTab('story')}><span>01</span><strong>เรื่องราว</strong></button>
            <button className={`v13-touch ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}><span>02</span><strong>วิธีคิด</strong></button>
            <button className={`v13-touch ${tab === 'career' ? 'active' : ''}`} onClick={() => setTab('career')}><span>03</span><strong>อาชีพที่เกี่ยวข้อง</strong></button>
          </nav>

          <div className="v13-panel" key={`${person.id}-${tab}`}>
            {tab === 'story' && <StoryPanel person={person} />}
            {tab === 'skills' && <SkillsPanel person={person} />}
            {tab === 'career' && <CareerPanel person={person} />}
          </div>
        </div>

        <aside className="v13-visual-column">
          <div className="v13-photo-frame v13-glass-panel">
            <div className="v13-photo-meta"><small>MISSION PORTRAIT</small><b>{String(personIndex + 1).padStart(2, '0')}</b></div>
            <Portrait person={person} className="v13-detail-portrait" transitionName={`portrait-${person.id}`} />
            <div className="v13-photo-caption"><small>{person.years}</small><strong>{person.en}</strong></div>
          </div>
          <PersonQR person={person} />
        </aside>
      </section>

      <footer className="v13-detail-nav v13-glass-panel">
        <button className="v13-nav-button v13-touch" onClick={() => onMove(-1)}><ChevronLeft size={23} /><span><small>PREVIOUS</small>คนก่อนหน้า</span></button>
        <div className="v13-dots" aria-hidden="true">
          {PEOPLE.map(item => <i key={item.id} className={item.id === person.id ? 'active' : ''} />)}
        </div>
        <span className="v13-swipe-hint">ปัดซ้าย–ขวาบนพื้นที่ว่างเพื่อเปลี่ยนบุคคล</span>
        <button className="v13-nav-button v13-touch" onClick={() => onMove(1)}><span><small>NEXT</small>คนถัดไป</span><ChevronRight size={23} /></button>
      </footer>
    </main>
  )
}

function TouchPulse({ pulse }) {
  if (!pulse) return null
  return <span className="v13-touch-pulse" key={pulse.id} style={{ left: pulse.x, top: pulse.y }} />
}

export default function ExhibitV13() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [idleFading, setIdleFading] = useState(false)
  const [pulse, setPulse] = useState(null)
  const idleRef = useRef(null)
  const fadeRef = useRef(null)

  const selected = PEOPLE.find(person => person.id === selectedId)

  const goHome = () => transitionTo(() => {
    setScreen('attract')
    setSelectedId(null)
    setFilter('all')
  })

  const goGallery = () => transitionTo(() => setScreen('gallery'))

  const selectPerson = id => transitionTo(() => {
    setSelectedId(id)
    setScreen('detail')
  })

  const backToGallery = () => transitionTo(() => setScreen('gallery'))

  const move = delta => transitionTo(() => {
    const currentIndex = PEOPLE.findIndex(person => person.id === selectedId)
    const safeIndex = currentIndex < 0 ? 0 : currentIndex
    const nextIndex = (safeIndex + delta + PEOPLE.length) % PEOPLE.length
    setSelectedId(PEOPLE[nextIndex].id)
  })

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
            setScreen('attract')
            setSelectedId(null)
            setFilter('all')
            setIdleFading(false)
          }, FADE_MS)
        }, RESET_MS)
      }
    }

    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach(name => window.addEventListener(name, reset, { passive: true }))
    reset()

    return () => {
      clearIdle()
      events.forEach(name => window.removeEventListener(name, reset))
    }
  }, [screen])

  useEffect(() => {
    const showPulse = event => {
      setPulse({ id: Date.now(), x: event.clientX, y: event.clientY })
      window.setTimeout(() => setPulse(null), 520)
    }
    window.addEventListener('pointerdown', showPulse, { passive: true })
    return () => window.removeEventListener('pointerdown', showPulse)
  }, [])

  let content
  if (screen === 'attract') {
    content = <Attract onExplore={goGallery} onSelect={selectPerson} />
  } else if (screen === 'gallery') {
    content = <Gallery filter={filter} setFilter={setFilter} onSelect={selectPerson} onHome={goHome} />
  } else if (selected) {
    content = <Detail person={selected} onBack={backToGallery} onHome={goHome} onMove={move} />
  } else {
    content = <Attract onExplore={goGallery} onSelect={selectPerson} />
  }

  return (
    <div className={`v13-root ${idleFading ? 'is-idle-fading' : ''}`}>
      <TouchPulse pulse={pulse} />
      {content}
      <div className="v13-idle-veil" aria-hidden="true" />
    </div>
  )
}
