import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Code2,
  Expand,
  Home,
  Orbit,
  Palette,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react'
import { categories, people } from './people-v3.js'

const PROJECT_NAME = 'นิทรรศการดาราศาสตร์และอวกาศ'
const PROJECT_PLACE = 'ศูนย์วิทยาศาสตร์เพื่อการศึกษานครสวรรค์'
const RESET_MS = 90000

const iconMap = {
  sparkles: Sparkles,
  atom: Atom,
  rocket: Rocket,
  code: Code2,
  palette: Palette,
}

function SpaceBackground() {
  return (
    <div className="space-bg" aria-hidden="true">
      <div className="nebula nebula-one" />
      <div className="nebula nebula-two" />
      <div className="starfield" />
      <div className="space-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
    </div>
  )
}

function ProjectIdentity({ compact = false }) {
  return (
    <div className={`project-id ${compact ? 'compact' : ''}`}>
      <div className="project-symbol"><Orbit size={compact ? 18 : 22} strokeWidth={1.8} /></div>
      <div className="project-id-copy">
        <strong>{PROJECT_NAME}</strong>
        <span>{PROJECT_PLACE}</span>
      </div>
    </div>
  )
}

function FullscreenButton() {
  const [isFull, setIsFull] = useState(Boolean(document.fullscreenElement))

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch (_) {
      // Fullscreen can be blocked by browser kiosk policy; the exhibit remains usable.
    }
  }

  return (
    <button className="utility-btn" onClick={toggle} aria-label="สลับโหมดเต็มจอ">
      <Expand size={19} />
      <span>{isFull ? 'ออกเต็มจอ' : 'เต็มจอ'}</span>
    </button>
  )
}

function Portrait({ person, className = '' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`portrait-frame ${className}`} style={{ '--accent': person.color }}>
      {person.portrait && !failed ? (
        <img
          src={person.portrait}
          alt={person.name}
          draggable="false"
          loading="eager"
          onError={() => setFailed(true)}
          style={{ objectPosition: person.focus || '50% 25%' }}
        />
      ) : (
        <div className="portrait-fallback"><span>{person.initials}</span></div>
      )}
      <div className="portrait-vignette" />
    </div>
  )
}

function Attract({ onExplore, onSelect }) {
  return (
    <main className="screen attract-screen">
      <SpaceBackground />
      <header className="screen-header attract-header">
        <ProjectIdentity />
        <FullscreenButton />
      </header>

      <section className="attract-layout">
        <div className="attract-copy">
          <div className="english-kicker">THE PEOPLE WHO SHAPED THE FUTURE</div>
          <h1>
            บุคคลผู้เปลี่ยนโลก
            <span>และสร้างอนาคต</span>
          </h1>
          <p className="attract-lead">
            เรียนรู้จากคนที่ <b>กล้าคิด</b> <b>กล้าถาม</b> และ <b>ลงมือสร้าง</b><br />
            สิ่งที่ครั้งหนึ่งเคยดูเหมือนเป็นไปไม่ได้
          </p>

          <div className="learning-steps" aria-label="แนวคิดการเรียนรู้">
            <div><span>01</span><strong>ถามให้ลึก</strong><small>เริ่มจากความสงสัย</small></div>
            <div><span>02</span><strong>คิดให้ไกล</strong><small>เชื่อมโยงความรู้</small></div>
            <div><span>03</span><strong>สร้างให้จริง</strong><small>เปลี่ยนแนวคิดเป็นผลงาน</small></div>
          </div>

          <button className="primary-action attract-action" onClick={onExplore}>
            <span>แตะเพื่อเริ่มเรียนรู้</span>
            <ArrowRight size={28} />
          </button>
          <p className="learning-prompt">ทุกความเปลี่ยนแปลง เริ่มจากคำถามหนึ่งข้อ</p>
        </div>

        <div className="portrait-wall-wrap">
          <div className="portrait-wall-heading">
            <span>12 เรื่องราว · 12 วิธีคิด</span>
            <strong>คุณอยากเรียนรู้จากใคร?</strong>
          </div>
          <div className="portrait-wall">
            {people.map((person, index) => (
              <button
                key={person.id}
                className="portrait-tile"
                style={{ '--accent': person.color, '--delay': `${index * 55}ms` }}
                onClick={() => onSelect(person.id)}
                aria-label={`เรียนรู้เรื่อง ${person.name}`}
              >
                <Portrait person={person} />
                <div className="portrait-tile-copy">
                  <strong>{person.name}</strong>
                  <span>{person.years}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome, onFinale }) {
  const visible = useMemo(
    () => filter === 'all' ? people : people.filter((person) => person.category.includes(filter)),
    [filter],
  )

  return (
    <main className="screen gallery-screen">
      <SpaceBackground />
      <header className="screen-header gallery-header">
        <button className="utility-btn" onClick={onHome}><Home size={19} /><span>หน้าแรก</span></button>
        <div className="gallery-heading">
          <span>เลือกหนึ่งเรื่องราว เพื่อค้นพบหนึ่งวิธีคิด</span>
          <h1>ใครเปลี่ยนโลก... และเขาคิดต่างอย่างไร?</h1>
        </div>
        <FullscreenButton />
      </header>

      <nav className="category-bar" aria-label="เลือกหมวดหมู่บุคคล">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Sparkles
          return (
            <button
              key={category.id}
              className={filter === category.id ? 'active' : ''}
              onClick={() => setFilter(category.id)}
            >
              <Icon size={19} />
              <span>{category.label}</span>
            </button>
          )
        })}
        <button className="future-btn" onClick={onFinale}><Sparkles size={19} /><span>คนต่อไปอาจเป็นคุณ</span></button>
      </nav>

      <section className="people-grid-safe" aria-live="polite">
        {visible.map((person, index) => (
          <button
            className="person-card-safe"
            key={person.id}
            onClick={() => onSelect(person.id)}
            style={{ '--accent': person.color, '--delay': `${index * 35}ms` }}
          >
            <Portrait person={person} className="card-portrait" />
            <div className="card-content">
              <div className="card-meta"><span>{String(people.indexOf(person) + 1).padStart(2, '0')}</span><small>{person.years}</small></div>
              <h2>{person.name}</h2>
              <p>{person.en}</p>
              <strong className="card-hook">“{person.hook}”</strong>
              <div className="card-touch">แตะเพื่อเรียนรู้ <ArrowRight size={17} /></div>
            </div>
          </button>
        ))}
      </section>

      <footer className="gallery-footer">
        <span>สังเกตวิธีคิดของแต่ละคน แล้วลองถามตัวเองว่า “ฉันจะนำไปใช้กับอนาคตของฉันได้อย่างไร?”</span>
      </footer>
    </main>
  )
}

function Reveal({ person }) {
  return (
    <main className="screen reveal-screen" style={{ '--accent': person.color }}>
      <SpaceBackground />
      <div className="reveal-orbit" aria-hidden="true" />
      <section className="reveal-content">
        <div className="reveal-number">{String(people.indexOf(person) + 1).padStart(2, '0')}</div>
        <Portrait person={person} className="reveal-portrait" />
        <div className="reveal-copy">
          <small>เรียนรู้จากผู้เปลี่ยนโลก</small>
          <h1>{person.name}</h1>
          <p>“{person.hook}”</p>
        </div>
      </section>
    </main>
  )
}

function RadarChart({ person }) {
  const [progress, setProgress] = useState(0)
  const [selectedSkill, setSelectedSkill] = useState(0)

  useEffect(() => {
    setProgress(0)
    setSelectedSkill(0)
    let frame
    const start = performance.now()
    const duration = 850
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [person.id])

  const size = 320
  const center = 160
  const radius = 104
  const pointString = (values) => values.map((value, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / values.length
    const distance = radius * value
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`
  }).join(' ')

  const animatedValues = person.skills.map((value) => value / 100 * progress)
  const skill = person.skillLabels[selectedSkill]
  const value = Math.round(person.skills[selectedSkill] * progress)
  const story = person.skillStories?.[selectedSkill]
    || `ทักษะ “${skill}” เป็นหนึ่งในองค์ประกอบสำคัญที่เรื่องราวและผลงานของ ${person.name} สะท้อนให้เห็น`

  return (
    <div className="dna-layout">
      <div className="radar-card">
        <div className="radar-title"><span>DNA OF GREATNESS</span><strong>แผนที่ทักษะจากเรื่องราวของเขา</strong></div>
        <svg className="radar-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`แผนที่ทักษะของ ${person.name}`}>
          {[0.25, 0.5, 0.75, 1].map((level) => (
            <polygon key={level} points={pointString(person.skills.map(() => level))} className="radar-ring" />
          ))}
          {person.skills.map((_, index) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / person.skills.length
            return <line key={index} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} className="radar-axis" />
          })}
          <polygon points={pointString(animatedValues)} className="radar-fill" style={{ '--accent': person.color }} />
          {animatedValues.map((valuePoint, index) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / animatedValues.length
            const distance = radius * valuePoint
            return <circle key={index} cx={center + Math.cos(angle) * distance} cy={center + Math.sin(angle) * distance} r="5" className="radar-dot" style={{ '--accent': person.color }} />
          })}
        </svg>
        <small className="radar-note">แผนภาพเพื่อการเรียนรู้ ไม่ใช่คะแนนประเมินบุคคลจริง</small>
      </div>

      <div className="skill-panel">
        <div className="skill-buttons">
          {person.skillLabels.map((label, index) => (
            <button key={label} className={selectedSkill === index ? 'active' : ''} onClick={() => setSelectedSkill(index)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{label}</strong>
              <b>{Math.round(person.skills[index] * progress)}</b>
            </button>
          ))}
        </div>
        <div className="skill-explainer" style={{ '--accent': person.color }}>
          <small>แตะทักษะเพื่อเรียนรู้</small>
          <div className="skill-value"><strong>{skill}</strong><b>{value}</b></div>
          <p>{story}</p>
        </div>
      </div>
    </div>
  )
}

function Detail({ person, onBack, onHome, onMove }) {
  const [tab, setTab] = useState('story')

  useEffect(() => setTab('story'), [person.id])

  return (
    <main className="screen detail-screen" style={{ '--accent': person.color }}>
      <SpaceBackground />
      <header className="screen-header detail-header">
        <button className="utility-btn" onClick={onBack}><X size={19} /><span>รายชื่อทั้งหมด</span></button>
        <div className="detail-index">{String(people.indexOf(person) + 1).padStart(2, '0')} <span>/ {String(people.length).padStart(2, '0')}</span></div>
        <div className="header-actions">
          <button className="utility-btn icon-only" onClick={onHome} aria-label="หน้าแรก"><Home size={19} /></button>
          <FullscreenButton />
        </div>
      </header>

      <section className="detail-layout-safe">
        <aside className="detail-visual">
          <Portrait person={person} className="detail-portrait" />
          <div className="detail-person-meta">
            <span>{person.years}</span>
            <strong>{person.en}</strong>
          </div>
          <div className="person-nav">
            <button onClick={() => onMove(-1)}><ChevronLeft size={22} /><span>ก่อนหน้า</span></button>
            <button onClick={() => onMove(1)}><span>ถัดไป</span><ChevronRight size={22} /></button>
          </div>
        </aside>

        <div className="detail-copy">
          <div className="detail-title-block">
            <small>เรียนรู้จากคนที่เปลี่ยนอนาคต</small>
            <h1>{person.name}</h1>
            <blockquote>“{person.hook}”</blockquote>
          </div>

          <nav className="detail-tabs" aria-label="หัวข้อเรื่องราว">
            <button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}>เรื่องราว</button>
            <button className={tab === 'skills' ? 'active' : ''} onClick={() => setTab('skills')}>DNA แห่งความสำเร็จ</button>
            <button className={tab === 'career' ? 'active' : ''} onClick={() => setTab('career')}>อาชีพที่เชื่อมโยง</button>
          </nav>

          <div className="detail-panel" key={`${person.id}-${tab}`}>
            {tab === 'story' && (
              <div className="story-layout">
                <article><span>01</span><div><small>เขาคือใคร</small><p>{person.intro}</p></div></article>
                <article><span>02</span><div><small>เขาเปลี่ยนอะไร</small><p>{person.impact}</p></div></article>
                <div className="learning-callout"><Sparkles size={24} /><div><small>บทเรียนที่นำไปใช้ได้</small><p>{person.moment}</p></div></div>
                <button className="next-learning" onClick={() => setTab('skills')}>ดูทักษะเบื้องหลังความสำเร็จ <ArrowRight size={20} /></button>
              </div>
            )}
            {tab === 'skills' && <RadarChart person={person} />}
            {tab === 'career' && (
              <div className="career-layout">
                <div className="career-intro"><BrainCircuit size={28} /><div><small>จากแรงบันดาลใจ สู่อาชีพในอนาคต</small><p>ถ้าเรื่องราวนี้ทำให้คุณสนใจ ลองสำรวจเส้นทางอาชีพเหล่านี้ต่อ</p></div></div>
                <div className="career-grid-safe">
                  {person.careers.map((career, index) => (
                    <div key={career}><span>{String(index + 1).padStart(2, '0')}</span><strong>{career}</strong></div>
                  ))}
                </div>
                <div className="career-next"><small>NEXT EXPERIENCE</small><strong>ไปต่อที่ Career Radar Chart</strong><p>ค้นหาว่าทักษะของคุณเชื่อมโยงกับอาชีพในอนาคตแบบไหน</p></div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function Finale({ onExplore }) {
  return (
    <main className="screen finale-screen">
      <SpaceBackground />
      <section className="finale-layout">
        <div className="finale-mark"><span>?</span></div>
        <small>THE FUTURE IS NOT FINISHED</small>
        <h1>คนต่อไปที่เปลี่ยนอนาคต<br /><span>อาจเป็นคุณ</span></h1>
        <p>ทุกคนที่คุณเพิ่งรู้จัก เริ่มจากความสงสัย การทดลอง การเรียนรู้ และการลงมือทำ</p>
        <strong className="finale-question">วันนี้คุณอยากเริ่มต้นด้วยคำถามอะไร?</strong>
        <button className="primary-action" onClick={onExplore}><ArrowLeft size={24} /><span>กลับไปเลือกบุคคล</span></button>
      </section>
    </main>
  )
}

function TouchRipple({ ripple }) {
  if (!ripple) return null
  return <span className="touch-ripple" key={ripple.id} style={{ left: ripple.x, top: ripple.y }} aria-hidden="true" />
}

export default function ExhibitV3() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [revealId, setRevealId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [ripple, setRipple] = useState(null)
  const idleRef = useRef(null)
  const revealRef = useRef(null)

  const selected = people.find((person) => person.id === selectedId)
  const revealing = people.find((person) => person.id === revealId)

  const goHome = () => {
    clearTimeout(revealRef.current)
    setSelectedId(null)
    setRevealId(null)
    setFilter('all')
    setScreen('attract')
  }

  useEffect(() => {
    const resetIdle = () => {
      clearTimeout(idleRef.current)
      if (screen !== 'attract') idleRef.current = setTimeout(goHome, RESET_MS)
    }
    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach((event) => window.addEventListener(event, resetIdle, { passive: true }))
    resetIdle()
    return () => {
      clearTimeout(idleRef.current)
      events.forEach((event) => window.removeEventListener(event, resetIdle))
    }
  }, [screen])

  useEffect(() => {
    const onPointer = (event) => {
      setRipple({ id: Date.now(), x: event.clientX, y: event.clientY })
      window.setTimeout(() => setRipple(null), 520)
    }
    window.addEventListener('pointerdown', onPointer, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [])

  const selectPerson = (id) => {
    clearTimeout(revealRef.current)
    setRevealId(id)
    setScreen('reveal')
    revealRef.current = setTimeout(() => {
      setSelectedId(id)
      setRevealId(null)
      setScreen('detail')
    }, 850)
  }

  const movePerson = (delta) => {
    const index = people.findIndex((person) => person.id === selectedId)
    const next = (index + delta + people.length) % people.length
    selectPerson(people[next].id)
  }

  let content
  if (screen === 'attract') content = <Attract onExplore={() => setScreen('gallery')} onSelect={selectPerson} />
  else if (screen === 'gallery') content = <Gallery filter={filter} setFilter={setFilter} onSelect={selectPerson} onHome={goHome} onFinale={() => setScreen('finale')} />
  else if (screen === 'reveal' && revealing) content = <Reveal person={revealing} />
  else if (screen === 'detail' && selected) content = <Detail person={selected} onBack={() => setScreen('gallery')} onHome={goHome} onMove={movePerson} />
  else if (screen === 'finale') content = <Finale onExplore={() => setScreen('gallery')} />
  else content = <Attract onExplore={() => setScreen('gallery')} onSelect={selectPerson} />

  return <div className="exhibit-root"><TouchRipple ripple={ripple} />{content}</div>
}
