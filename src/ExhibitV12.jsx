import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Home, Orbit, Search, Sparkles } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { categories, people } from './people-v3.js'

const RESET_MS = 90000
const FADE_MS = 1200

function Portrait({ person, className = '' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`v12-portrait ${className}`}>
      {person.portrait && !failed ? (
        <img src={person.portrait} alt={person.name} draggable="false" onError={() => setFailed(true)} style={{ objectPosition: person.focus || '50% 24%' }} />
      ) : <div className="v12-fallback">{person.initials}</div>}
      <span className="v12-portrait-glow" />
    </div>
  )
}

function LiquidBackdrop() {
  return (
    <div className="v12-backdrop" aria-hidden="true">
      <div className="v12-stars" />
      <span className="v12-blob blob-a" />
      <span className="v12-blob blob-b" />
      <span className="v12-blob blob-c" />
      <span className="v12-orbit orbit-a" />
      <span className="v12-orbit orbit-b" />
    </div>
  )
}

function Brand() {
  return (
    <div className="v12-brand glass-pill">
      <span className="v12-brand-icon"><Orbit size={20} /></span>
      <div><strong>บุคคลผู้เปลี่ยนโลก</strong><small>THE PEOPLE WHO SHAPED THE FUTURE</small></div>
    </div>
  )
}

function Attract({ onExplore, onSelect }) {
  return (
    <main className="v12-screen v12-attract">
      <LiquidBackdrop />
      <header className="v12-topbar"><Brand /><span className="v12-top-note glass-pill">INTERACTIVE SPACE ARCHIVE · 12 STORIES</span></header>

      <section className="v12-hero glass-panel">
        <div className="v12-hero-copy">
          <div className="v12-kicker"><span /> FUTURE THINKERS ARCHIVE</div>
          <h1>คนที่กล้าคิด<br /><em>ก่อนโลกจะเชื่อ</em></h1>
          <p>สำรวจ 12 บุคคลสำคัญผ่านเรื่องราว วิธีคิด และเส้นทางอาชีพที่เชื่อมโยงกับอนาคต</p>
          <div className="v12-question glass-soft">
            <small>START WITH A QUESTION</small>
            <strong>ถ้าเป็นคุณ… จะเริ่มเปลี่ยนอนาคตจากคำถามอะไร?</strong>
          </div>
          <button className="v12-primary" onClick={onExplore}><span>เริ่มสำรวจทั้ง 12 คน</span><ArrowRight size={24} /></button>
          <div className="v12-mini-stats"><span><b>12</b> บุคคล</span><span><b>04</b> หมวด</span><span><b>03</b> มุมมองต่อคน</span></div>
        </div>

        <div className="v12-portrait-cloud glass-soft" aria-label="เลือกบุคคลจากหน้าแรก">
          <div className="v12-cloud-head"><div><small>HUMAN CONSTELLATION</small><strong>แตะภาพเพื่อเปิดเรื่องราวได้ทันที</strong></div><span>12 / 12</span></div>
          <div className="v12-cloud-grid">
            {people.map((person, index) => (
              <button key={person.id} className="v12-cloud-card" onClick={() => onSelect(person.id)} style={{ '--accent': person.color }}>
                <Portrait person={person} />
                <span className="v12-card-no">{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{person.name}</strong><small>{person.years}</small></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="v12-footerline"><span>SCIENCE</span><i /><span>SPACE</span><i /><span>TECHNOLOGY</span><i /><span>CREATIVITY</span></footer>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome }) {
  const visible = useMemo(() => filter === 'all' ? people : people.filter(person => person.category.includes(filter)), [filter])
  return (
    <main className="v12-screen v12-gallery">
      <LiquidBackdrop />
      <header className="v12-gallery-head glass-panel">
        <button className="v12-utility" onClick={onHome}><Home size={19} /><span>หน้าแรก</span></button>
        <div><small>PEOPLE ARCHIVE</small><h1>เลือกคนที่คุณอยากเรียนรู้จากเขา</h1></div>
        <span className="v12-count">{String(visible.length).padStart(2, '0')} / {String(people.length).padStart(2, '0')}</span>
      </header>
      <nav className="v12-filter glass-soft">
        {categories.map(category => <button key={category.id} className={filter === category.id ? 'active' : ''} onClick={() => setFilter(category.id)}>{category.label}</button>)}
      </nav>
      <section className="v12-gallery-grid">
        {visible.map((person, index) => (
          <button key={person.id} className="v12-person-card glass-panel" onClick={() => onSelect(person.id)} style={{ '--accent': person.color }}>
            <Portrait person={person} />
            <span className="v12-person-no">{String(people.indexOf(person) + 1).padStart(2, '0')}</span>
            <div className="v12-person-copy"><small>{person.years}</small><h2>{person.name}</h2><p>{person.hook}</p></div>
            <span className="v12-open"><ArrowRight size={18} /></span>
          </button>
        ))}
      </section>
    </main>
  )
}

function StoryPanel({ person }) {
  const cards = [
    ['01', 'เขาคือใคร', person.intro],
    ['02', 'สิ่งที่เขาเปลี่ยน', person.impact],
    ['03', 'สิ่งที่เราเรียนรู้ได้', person.moment],
  ]
  return <div className="v12-story-grid">{cards.map(([no, title, text], index) => <section key={no} className={`glass-soft ${index === 2 ? 'featured' : ''}`}><span>{no}</span><div><h3>{title}</h3><p>{text}</p></div>{index === 2 && <Sparkles size={18} />}</section>)}</div>
}

function SkillsPanel({ person }) {
  return (
    <div className="v12-skills-grid">
      {person.skillLabels.map((label, index) => (
        <section key={label} className="glass-soft">
          <div><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong><b>{person.skills[index]}</b></div>
          <i><em style={{ width: `${person.skills[index]}%` }} /></i>
          <p>{person.skillStories?.[index] || `ทักษะ “${label}” เป็นองค์ประกอบสำคัญที่เรื่องราวของ ${person.name} สะท้อนให้เห็น`}</p>
        </section>
      ))}
    </div>
  )
}

function CareerPanel({ person }) {
  return (
    <div className="v12-career-grid">
      {person.careers.map((career, index) => <section className="glass-soft" key={career}><span>{String(index + 1).padStart(2, '0')}</span><strong>{career}</strong><ArrowRight size={18} /></section>)}
      <aside className="glass-soft"><small>NEXT EXPERIENCE</small><strong>ไปต่อที่ Career Radar Chart</strong><p>สำรวจว่าความสนใจและทักษะของคุณเชื่อมโยงกับอาชีพในอนาคตแบบไหน</p></aside>
    </div>
  )
}

function PersonQR({ person }) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(`${person.name} ${person.en}`)}`
  return (
    <aside className="v12-qr glass-soft">
      <div className="v12-qr-box"><QRCodeSVG value={url} size={86} level="M" bgColor="#ffffff" fgColor="#08101b" marginSize={2} /></div>
      <div><span><Search size={15} /> KEEP EXPLORING</span><strong>สแกนเพื่อค้นหาเพิ่มเติม</strong><small>เปิด Google Search บนมือถือ</small></div>
    </aside>
  )
}

function Detail({ person, onBack, onHome, onMove }) {
  const [tab, setTab] = useState('story')
  const startX = useRef(null)
  const index = people.indexOf(person)
  useEffect(() => setTab('story'), [person.id])

  const onPointerDown = e => { if (!e.target.closest('button')) startX.current = e.clientX }
  const onPointerUp = e => { if (startX.current == null) return; const dx = e.clientX - startX.current; startX.current = null; if (Math.abs(dx) > 100) onMove(dx < 0 ? 1 : -1) }

  return (
    <main className="v12-screen v12-detail" style={{ '--accent': person.color }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <LiquidBackdrop />
      <header className="v12-detail-head">
        <button className="v12-utility glass-pill" onClick={onBack}><ArrowLeft size={18} /><span>บุคคลทั้งหมด</span></button>
        <div className="v12-detail-count glass-pill"><strong>{String(index + 1).padStart(2, '0')}</strong><span>/ {String(people.length).padStart(2, '0')}</span></div>
        <button className="v12-utility glass-pill" onClick={onHome}><Home size={18} /><span>หน้าแรก</span></button>
      </header>

      <section className="v12-detail-layout">
        <div className="v12-detail-main glass-panel">
          <div className="v12-identity">
            <span className="v12-kicker">HUMAN ARCHIVE · PROFILE {String(index + 1).padStart(2, '0')}</span>
            <h1>{person.name}</h1>
            <p>{person.en} · {person.years}</p>
            <blockquote>{person.hook}</blockquote>
          </div>
          <nav className="v12-tabs glass-soft">
            <button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}><span>01</span>เรื่องราว</button>
            <button className={tab === 'skills' ? 'active' : ''} onClick={() => setTab('skills')}><span>02</span>วิธีคิด</button>
            <button className={tab === 'career' ? 'active' : ''} onClick={() => setTab('career')}><span>03</span>อาชีพที่เกี่ยวข้อง</button>
          </nav>
          <div className="v12-tab-content" key={`${person.id}-${tab}`}>
            {tab === 'story' && <StoryPanel person={person} />}
            {tab === 'skills' && <SkillsPanel person={person} />}
            {tab === 'career' && <CareerPanel person={person} />}
          </div>
        </div>

        <aside className="v12-detail-side">
          <div className="v12-photo-card glass-panel">
            <div className="v12-photo-top"><span>MISSION PORTRAIT</span><b>{String(index + 1).padStart(2, '0')}</b></div>
            <Portrait person={person} className="v12-detail-portrait" />
            <div className="v12-photo-bottom"><small>{person.years}</small><strong>{person.en}</strong></div>
          </div>
          <PersonQR person={person} />
        </aside>
      </section>

      <footer className="v12-detail-nav glass-panel">
        <button onClick={() => onMove(-1)}><ChevronLeft size={23} /><span>คนก่อนหน้า</span></button>
        <div>{people.map(item => <i key={item.id} className={item.id === person.id ? 'active' : ''} />)}</div>
        <button onClick={() => onMove(1)}><span>คนถัดไป</span><ChevronRight size={23} /></button>
      </footer>
    </main>
  )
}

function TouchRipple({ ripple }) {
  return ripple ? <span className="v12-ripple" key={ripple.id} style={{ left: ripple.x, top: ripple.y }} /> : null
}

export default function ExhibitV12() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [idleFading, setIdleFading] = useState(false)
  const [ripple, setRipple] = useState(null)
  const idleRef = useRef(null)
  const fadeRef = useRef(null)
  const selected = people.find(person => person.id === selectedId)

  const goHome = () => { setScreen('attract'); setSelectedId(null); setFilter('all') }
  useEffect(() => {
    const clearIdle = () => { clearTimeout(idleRef.current); clearTimeout(fadeRef.current) }
    const reset = () => {
      clearIdle(); setIdleFading(false)
      if (screen !== 'attract') idleRef.current = setTimeout(() => { setIdleFading(true); fadeRef.current = setTimeout(() => { goHome(); setIdleFading(false) }, FADE_MS) }, RESET_MS)
    }
    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach(name => window.addEventListener(name, reset, { passive: true })); reset()
    return () => { clearIdle(); events.forEach(name => window.removeEventListener(name, reset)) }
  }, [screen])

  useEffect(() => {
    const show = e => { setRipple({ id: Date.now(), x: e.clientX, y: e.clientY }); window.setTimeout(() => setRipple(null), 420) }
    window.addEventListener('pointerdown', show, { passive: true })
    return () => window.removeEventListener('pointerdown', show)
  }, [])

  const select = id => { setSelectedId(id); setScreen('detail') }
  const move = delta => { const i = people.findIndex(person => person.id === selectedId); setSelectedId(people[(i + delta + people.length) % people.length].id) }

  let content
  if (screen === 'attract') content = <Attract onExplore={() => setScreen('gallery')} onSelect={select} />
  else if (screen === 'gallery') content = <Gallery filter={filter} setFilter={setFilter} onSelect={select} onHome={goHome} />
  else if (selected) content = <Detail person={selected} onBack={() => setScreen('gallery')} onHome={goHome} onMove={move} />
  else content = <Attract onExplore={() => setScreen('gallery')} onSelect={select} />

  return <div className={`v12-root ${idleFading ? 'is-idle-fading' : ''}`}><TouchRipple ripple={ripple} />{content}<div className="v12-idle-veil" /></div>
}
