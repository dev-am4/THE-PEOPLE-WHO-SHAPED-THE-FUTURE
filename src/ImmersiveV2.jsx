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
  Network,
  Orbit,
  Palette,
  Rocket,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { categories, constellationLinks, constellationPositions, defaultSkillStories, people } from './people.js'

const PROJECT_NAME = 'นิทรรศการดาราศาสตร์และอวกาศ'
const PROJECT_PLACE = 'ศูนย์วิทยาศาสตร์เพื่อการศึกษานครสวรรค์'
const RESET_MS = 90000
const REVEAL_MS = 1250

const categoryIcons = {
  sparkles: Sparkles,
  atom: Atom,
  rocket: Rocket,
  code: Code2,
  palette: Palette,
}

function ProjectIdentity() {
  return (
    <div className="project-id">
      <div className="project-mark"><Orbit size={24}/></div>
      <div><strong>{PROJECT_NAME}</strong><span>{PROJECT_PLACE}</span></div>
    </div>
  )
}

function FullscreenButton() {
  const [full, setFull] = useState(Boolean(document.fullscreenElement))
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch (_) {}
  }
  return <button className="round-btn fullscreen-btn" onClick={toggle} aria-label="เต็มจอ"><Expand size={21}/><span>{full ? 'ออกเต็มจอ' : 'เต็มจอ'}</span></button>
}

function SpaceBackground({ accent = '#63e2ff' }) {
  return (
    <div className="space-bg" aria-hidden="true" style={{ '--scene-accent': accent }}>
      <div className="aurora aurora-a"/><div className="aurora aurora-b"/>
      <div className="starfield starfield-a"/><div className="starfield starfield-b"/>
      <div className="grid-plane"/><div className="scanline"/>
      <div className="orbit-line orbit-a"/><div className="orbit-line orbit-b"/>
    </div>
  )
}

function Portrait({ person, large = false, bare = false }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [person.id])
  return (
    <div className={`portrait ${large ? 'portrait-large' : ''} ${bare ? 'portrait-bare' : ''}`} style={{ '--accent': person.color }}>
      {person.portrait && !failed
        ? <img src={person.portrait} alt={person.name} onError={() => setFailed(true)} draggable="false"/>
        : <div className="portrait-fallback"><span>{person.initials}</span></div>}
      {!bare && <><div className="portrait-shade"/><div className="portrait-scan"/></>}
    </div>
  )
}

function TouchFeedback() {
  const [ripples, setRipples] = useState([])
  useEffect(() => {
    function onPointer(event) {
      const id = `${Date.now()}-${Math.random()}`
      setRipples(prev => [...prev.slice(-5), { id, x: event.clientX, y: event.clientY }])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 760)
    }
    window.addEventListener('pointerdown', onPointer, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [])
  return <div className="touch-feedback" aria-hidden="true">{ripples.map(r => <i key={r.id} style={{ left:r.x, top:r.y }}/>)}</div>
}

function ConstellationLines({ activeIds = null, reveal = false }) {
  const active = activeIds ? new Set(activeIds) : null
  return (
    <svg className={`constellation-lines ${reveal ? 'reveal-lines' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {constellationLinks.map(([a,b], i) => {
        const [x1,y1] = constellationPositions[a]
        const [x2,y2] = constellationPositions[b]
        const on = !active || (active.has(people[a].id) && active.has(people[b].id))
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={on ? 'line-on' : 'line-off'} style={{ '--line-delay': `${i*35}ms` }}/>
      })}
    </svg>
  )
}

function Attract({ onExplore, onSelect }) {
  return (
    <main className="screen attract-screen" onClick={onExplore}>
      <SpaceBackground/>
      <ConstellationLines reveal/>
      <header className="attract-header"><ProjectIdentity/><FullscreenButton/></header>

      <div className="attract-nodes" aria-label="เลือกบุคคลโดยตรง">
        {people.map((person,index) => {
          const [x,y] = constellationPositions[index]
          return (
            <button key={person.id} className="attract-node" style={{ '--x':`${x}%`, '--y':`${y}%`, '--accent':person.color, '--i':index }} onClick={(e) => { e.stopPropagation(); onSelect(person.id) }}>
              <Portrait person={person} bare/>
              <span>{person.en.split(' ').slice(-1)[0]}</span>
            </button>
          )
        })}
      </div>

      <section className="attract-center">
        <p className="eyebrow">FUTURE CAREERS ZONE · INTERACTIVE EXPERIENCE</p>
        <div className="count-kicker"><b>12</b><span>PEOPLE</span><i/><b>12</b><span>IDEAS</span><i/><b>1</b><span>FUTURE</span></div>
        <h1>THE PEOPLE<br/><span>WHO SHAPED</span><br/>THE FUTURE</h1>
        <p className="attract-thai">คนหนึ่งคน เปลี่ยนอนาคตของโลกได้อย่างไร?</p>
        <button className="start-btn" onClick={(e) => { e.stopPropagation(); onExplore() }}><span>TOUCH A MIND</span><ArrowRight size={28}/></button>
        <p className="microcopy">แตะบุคคลรอบจอได้ทันที · หรือแตะปุ่มเพื่อสำรวจทั้งหมด</p>
      </section>
      <div className="attract-pulse" aria-hidden="true"><i/><i/><i/></div>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome, onFinale }) {
  const visible = useMemo(() => filter === 'all' ? people : people.filter(p => p.category.includes(filter)), [filter])
  const visibleIds = visible.map(p => p.id)
  return (
    <main className="screen gallery-screen">
      <SpaceBackground/>
      <header className="gallery-header">
        <button className="round-btn" onClick={onHome}><Home size={21}/><span>หน้าแรก</span></button>
        <div className="gallery-title"><p>FUTURE CONSTELLATION</p><h1>แตะหนึ่งความคิด แล้วดูว่าโลกเชื่อมต่อกันอย่างไร</h1></div>
        <div className="header-actions"><button className="round-btn finale-shortcut" onClick={onFinale}><Zap size={20}/><span>YOU ARE NEXT</span></button><FullscreenButton/></div>
      </header>
      <nav className="filters" aria-label="เลือกหมวดหมู่">
        {categories.map(cat => {
          const Icon = categoryIcons[cat.icon] || Sparkles
          return <button key={cat.id} className={filter === cat.id ? 'active' : ''} onClick={() => setFilter(cat.id)}><Icon size={19}/><span>{cat.label}</span></button>
        })}
      </nav>

      <section className="constellation-map">
        <ConstellationLines activeIds={visibleIds}/>
        <div className="future-core"><Network size={25}/><strong>IDEAS<br/>CONNECT</strong><span>{visible.length} MINDS</span></div>
        {people.map((person,index) => {
          const [x,y] = constellationPositions[index]
          const enabled = visibleIds.includes(person.id)
          return (
            <button key={person.id} disabled={!enabled} className={`mind-node ${enabled ? 'node-active':'node-muted'}`} style={{ '--x':`${x}%`, '--y':`${y}%`, '--accent':person.color, '--i':index }} onClick={() => onSelect(person.id)}>
              <div className="mind-halo"><Portrait person={person} bare/><i/></div>
              <div className="mind-label"><small>{String(index+1).padStart(2,'0')} · {person.years}</small><strong>{person.name}</strong><span>{person.hook}</span></div>
            </button>
          )
        })}
      </section>
      <footer className="gallery-footer"><span><i className="live-dot"/> แตะภาพบุคคลเพื่อเปิดเรื่องราว</span><b>SCIENCE × SPACE × TECHNOLOGY × CREATIVITY</b></footer>
    </main>
  )
}

function Reveal({ person, onDone }) {
  const doneRef = useRef(false)
  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }
  useEffect(() => {
    doneRef.current = false
    const timer = setTimeout(finish, REVEAL_MS)
    return () => clearTimeout(timer)
  }, [person.id])
  const words = person.hook.split(' ')
  return (
    <main className="screen reveal-screen" style={{ '--accent':person.color }} onClick={finish}>
      <SpaceBackground accent={person.color}/>
      <div className="reveal-blueprint" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="reveal-portrait"><Portrait person={person} large bare/></div>
      <div className="reveal-giant-name">{person.en}</div>
      <section className="reveal-copy">
        <p>A MIND THAT CHANGED THE FUTURE</p>
        <h1>{person.name}</h1>
        <div className="reveal-hook">{words.map((word,i) => <span key={`${word}-${i}`} style={{ '--word-delay':`${300+i*75}ms` }}>{word} </span>)}</div>
      </section>
      <div className="reveal-meter"><i/><span>LOADING STORY</span></div>
      <small className="skip-hint">แตะเพื่อข้าม</small>
    </main>
  )
}

function AnimatedNumber({ value, active }) {
  const [shown, setShown] = useState(active ? 0 : value)
  useEffect(() => {
    if (!active) { setShown(value); return }
    let start = 0
    const duration = 780
    let raf
    const tick = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t-start)/duration)
      const eased = 1 - Math.pow(1-p, 3)
      setShown(Math.round(value*eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, active])
  return <>{shown}</>
}

function RadarChart({ person }) {
  const [skillIndex, setSkillIndex] = useState(0)
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    setSkillIndex(0)
    setAnimated(false)
    const timer = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(timer)
  }, [person.id])

  const size = 360
  const center = size/2
  const radius = 118
  const point = (i, factor=1) => {
    const a = -Math.PI/2 + i*(Math.PI*2/person.skills.length)
    return [center + Math.cos(a)*radius*factor, center + Math.sin(a)*radius*factor]
  }
  const polygon = (values) => values.map((v,i) => point(i,v).join(',')).join(' ')
  const activeStory = person.skillStories?.[skillIndex] || defaultSkillStories[person.skillLabels[skillIndex]] || 'ทักษะนี้เป็นหนึ่งในองค์ประกอบที่ช่วยเปลี่ยนแนวคิดให้กลายเป็นผลลัพธ์จริง'

  return (
    <div className={`dna-layout ${animated ? 'dna-animated' : ''}`}>
      <div className="radar-stage">
        <div className="radar-core"><Sparkles size={18}/><span>DNA</span></div>
        <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="แผนผังทักษะ">
          {[.25,.5,.75,1].map(level => <polygon key={level} points={polygon(person.skills.map(()=>level))} className="radar-ring"/>)}
          {person.skills.map((_,i) => { const [x,y]=point(i); return <line key={i} x1={center} y1={center} x2={x} y2={y} className="radar-axis" style={{ '--axis-delay':`${i*70}ms` }}/> })}
          <polygon points={polygon(person.skills.map(v=>v/100))} className="radar-fill" style={{ '--accent':person.color }}/>
          {person.skills.map((v,i) => { const [x,y]=point(i,v/100); return <circle key={i} cx={x} cy={y} r="6" className={`radar-dot ${skillIndex===i?'selected':''}`} style={{ '--accent':person.color, '--dot-delay':`${450+i*70}ms` }}/> })}
        </svg>
      </div>
      <div className="dna-controls">
        <div className="dna-heading"><span>DNA OF GREATNESS</span><strong>แตะทักษะเพื่อถอดรหัสวิธีคิด</strong></div>
        <div className="skill-list">
          {person.skillLabels.map((label,i) => (
            <button key={label} className={skillIndex===i?'active':''} onClick={() => setSkillIndex(i)}>
              <span>{String(i+1).padStart(2,'0')}</span><strong>{label}</strong><b><AnimatedNumber value={person.skills[i]} active={animated}/>%</b>
              <i><em style={{ width:`${animated?person.skills[i]:0}%` }}/></i>
            </button>
          ))}
        </div>
        <div className="skill-insight" key={`${person.id}-${skillIndex}`}><Zap size={23}/><div><small>WHY IT MATTERS</small><p>{activeStory}</p></div></div>
        <small className="dna-note">Skill Map เพื่อการเรียนรู้ · เป็นการตีความทักษะจากเรื่องราวและผลงาน ไม่ใช่คะแนนประเมินบุคคลจริง</small>
      </div>
    </div>
  )
}

function Detail({ person, onClose, onNext, onPrev, onHome }) {
  const [tab, setTab] = useState('story')
  useEffect(() => setTab('story'), [person.id])
  return (
    <main className="screen detail-screen" style={{ '--accent':person.color }}>
      <SpaceBackground accent={person.color}/>
      <header className="detail-header">
        <button className="round-btn" onClick={onClose}><X size={21}/><span>CONSTELLATION</span></button>
        <div className="detail-position">{String(people.indexOf(person)+1).padStart(2,'0')} <span>/ {String(people.length).padStart(2,'0')}</span></div>
        <div className="detail-header-actions"><button className="round-btn icon-only" onClick={onHome}><Home size={21}/></button><FullscreenButton/></div>
      </header>
      <section className="detail-layout">
        <div className="detail-portrait-col">
          <div className="portrait-tech-ring"><i/><i/><i/></div>
          <Portrait person={person} large/>
          <div className="portrait-caption"><span>{person.years}</span><b>{person.en}</b></div>
          <div className="portrait-code">MIND-{String(people.indexOf(person)+1).padStart(2,'0')} · FUTURE ARCHIVE</div>
        </div>
        <div className="detail-content-col">
          <p className="eyebrow">A PERSON WHO SHAPED THE FUTURE</p>
          <h1>{person.name}</h1>
          <blockquote>“{person.hook}”</blockquote>
          <div className="detail-tabs">
            <button className={tab==='story'?'active':''} onClick={() => setTab('story')}>01 · เรื่องราว</button>
            <button className={tab==='skills'?'active':''} onClick={() => setTab('skills')}>02 · DNA OF GREATNESS</button>
            <button className={tab==='career'?'active':''} onClick={() => setTab('career')}>03 · อาชีพที่เชื่อมโยง</button>
          </div>
          <div className="tab-panel" key={`${person.id}-${tab}`}>
            {tab==='story' && <div className="story-panel">
              <div className="story-lead"><span>01</span><div><small>WHO</small><p>{person.intro}</p></div></div>
              <div className="story-lead"><span>02</span><div><small>IMPACT</small><p>{person.impact}</p></div></div>
              <div className="impact-quote"><Sparkles size={22}/><div><small>THE IDEA TO REMEMBER</small><p>{person.moment}</p></div></div>
            </div>}
            {tab==='skills' && <RadarChart person={person}/>} 
            {tab==='career' && <div className="career-panel">
              <p className="career-intro">ถ้าเรื่องราวของคนนี้ทำให้คุณสนใจ ลองสำรวจเส้นทางอาชีพที่ใช้ทักษะใกล้เคียงกัน</p>
              <div className="career-grid">{person.careers.map((career,i)=><div key={career}><span>0{i+1}</span><strong>{career}</strong><ArrowRight size={20}/></div>)}</div>
              <div className="next-station"><BrainCircuit size={33}/><div><small>NEXT EXPERIENCE</small><b>ไปต่อที่ Career Radar Chart</b><p>ค้นหาว่าทักษะของคุณเชื่อมโยงกับอาชีพในอนาคตแบบไหน</p></div></div>
            </div>}
          </div>
        </div>
      </section>
      <footer className="detail-nav">
        <button onClick={onPrev}><ChevronLeft size={27}/><span>PREVIOUS MIND</span></button>
        <div className="detail-dots">{people.map(p=><i key={p.id} className={p.id===person.id?'active':''}/>)}</div>
        <button onClick={onNext}><span>NEXT MIND</span><ChevronRight size={27}/></button>
      </footer>
    </main>
  )
}

function Finale({ onExplore }) {
  return (
    <main className="screen finale-screen">
      <SpaceBackground accent="#ffcf67"/>
      <ConstellationLines reveal/>
      <section className="finale-content">
        <p className="eyebrow">THE FUTURE IS NOT FINISHED</p>
        <div className="future-ring"><span>?</span><i/><i/></div>
        <h1>THE NEXT NAME<br/><span>COULD BE YOURS.</span></h1>
        <p>ทุกคนที่คุณเพิ่งรู้จัก เริ่มจากการตั้งคำถาม ทดลอง ล้มเหลว เรียนรู้ และสร้างสิ่งที่ยังไม่เคยมีมาก่อน</p>
        <h2>แล้วคุณล่ะ...อยากสร้างอนาคตแบบไหน?</h2>
        <button className="start-btn" onClick={onExplore}><ArrowLeft size={25}/><span>กลับไปสำรวจ</span></button>
      </section>
    </main>
  )
}

export default function ImmersiveV2() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const timerRef = useRef(null)
  const selected = people.find(p => p.id === selectedId)

  function goHome() {
    setSelectedId(null)
    setFilter('all')
    setScreen('attract')
  }

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timerRef.current)
      if (screen !== 'attract') timerRef.current = setTimeout(goHome, RESET_MS)
    }
    const events = ['pointerdown','pointermove','keydown','touchstart']
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive:true }))
    resetTimer()
    return () => {
      clearTimeout(timerRef.current)
      events.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [screen])

  function selectPerson(id) {
    setSelectedId(id)
    setScreen('reveal')
  }

  function move(delta) {
    const index = people.findIndex(p => p.id === selectedId)
    const nextIndex = (index + delta + people.length) % people.length
    setSelectedId(people[nextIndex].id)
    setScreen('reveal')
  }

  let view
  if (screen === 'attract') view = <Attract onExplore={() => setScreen('gallery')} onSelect={selectPerson}/>
  else if (screen === 'finale') view = <Finale onExplore={() => setScreen('gallery')}/>
  else if (screen === 'reveal' && selected) view = <Reveal person={selected} onDone={() => setScreen('detail')}/>
  else if (screen === 'detail' && selected) view = <Detail person={selected} onClose={() => setScreen('gallery')} onHome={goHome} onNext={() => move(1)} onPrev={() => move(-1)}/>
  else view = <Gallery filter={filter} setFilter={setFilter} onSelect={selectPerson} onHome={goHome} onFinale={() => setScreen('finale')}/>

  return <>{view}<TouchFeedback/></>
}
