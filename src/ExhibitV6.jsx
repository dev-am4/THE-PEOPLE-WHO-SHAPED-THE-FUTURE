import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand, Home, Orbit, Sparkles } from 'lucide-react'
import { categories, people } from './people-v3.js'

const RESET_MS = 90000

function FullscreenButton() {
  const [full, setFull] = useState(Boolean(document.fullscreenElement))
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch (_) {}
  }
  return <button className="v6-utility" onClick={toggle}><Expand size={20}/><span>{full ? 'ออกเต็มจอ' : 'เต็มจอ'}</span></button>
}

function Portrait({ person, className = '' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`v6-portrait ${className}`}>
      {person.portrait && !failed ? (
        <img src={person.portrait} alt={person.name} draggable="false" onError={() => setFailed(true)} style={{ objectPosition: person.focus || '50% 25%' }}/>
      ) : <div className="v6-fallback">{person.initials}</div>}
    </div>
  )
}

function Brand() {
  return (
    <div className="v6-brand">
      <Orbit size={22}/>
      <div><strong>บุคคลผู้เปลี่ยนโลก</strong><span>THE PEOPLE WHO SHAPED THE FUTURE</span></div>
    </div>
  )
}

function Attract({ onExplore, onSelect }) {
  return (
    <main className="v6-screen v6-attract">
      <header className="v6-header"><Brand/><FullscreenButton/></header>
      <section className="v6-attract-layout">
        <div className="v6-hero-copy">
          <span className="v6-eyebrow">นิทรรศการดาราศาสตร์และอวกาศ</span>
          <h1>คนที่กล้าคิด<br/>ก่อนโลกจะเชื่อ</h1>
          <p>เรียนรู้จากบุคคลที่เปลี่ยนวิธีคิดของมนุษย์ ผ่านคำถาม ความกล้า การทดลอง และการลงมือทำ</p>
          <div className="v6-hero-rule"/>
          <strong className="v6-question">ถ้าเป็นคุณ… จะเริ่มเปลี่ยนโลกจากคำถามอะไร?</strong>
          <div className="v6-actions">
            <button className="v6-primary" onClick={onExplore}>เลือกบุคคล <ArrowRight size={22}/></button>
            <span>แตะภาพทางขวาเพื่อเริ่มได้ทันที</span>
          </div>
        </div>
        <div className="v6-wall" aria-label="เลือกบุคคลสำคัญ">
          {people.map((person, i) => (
            <button key={person.id} className="v6-wall-item" onClick={() => onSelect(person.id)} style={{'--accent': person.color}}>
              <Portrait person={person}/>
              <span className="v6-wall-index">{String(i + 1).padStart(2,'0')}</span>
              <div className="v6-wall-name"><strong>{person.name}</strong><span>{person.en}</span></div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome }) {
  const visible = useMemo(() => filter === 'all' ? people : people.filter(p => p.category.includes(filter)), [filter])
  return (
    <main className="v6-screen v6-gallery">
      <header className="v6-header">
        <button className="v6-utility" onClick={onHome}><Home size={19}/><span>หน้าแรก</span></button>
        <div className="v6-gallery-title"><span>12 เรื่องราว · 12 วิธีคิด</span><h1>เลือกคนที่คุณอยากเรียนรู้จากเขา</h1></div>
        <FullscreenButton/>
      </header>
      <nav className="v6-filter">
        {categories.map(c => <button key={c.id} className={filter === c.id ? 'active' : ''} onClick={() => setFilter(c.id)}>{c.label}</button>)}
      </nav>
      <section className="v6-gallery-grid">
        {visible.map((person, i) => (
          <button key={person.id} className="v6-person" onClick={() => onSelect(person.id)} style={{'--accent': person.color}}>
            <Portrait person={person}/>
            <span className="v6-person-no">{String(people.indexOf(person)+1).padStart(2,'0')}</span>
            <div className="v6-person-copy"><h2>{person.name}</h2><p>{person.hook}</p></div>
            <ArrowRight className="v6-person-arrow" size={21}/>
          </button>
        ))}
      </section>
    </main>
  )
}

function Radar({ person }) {
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    setProgress(0)
    const start = performance.now(); let frame
    const tick = now => {
      const p = Math.min(1, (now - start) / 720)
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [person.id])
  const size = 290, c = 145, r = 98
  const points = values => values.map((v, i) => {
    const a = -Math.PI/2 + i*Math.PI*2/values.length
    return `${c + Math.cos(a)*r*v},${c + Math.sin(a)*r*v}`
  }).join(' ')
  const values = person.skills.map(v => v/100*progress)
  return (
    <div className="v6-dna">
      <div className="v6-radar-wrap">
        <svg viewBox={`0 0 ${size} ${size}`}>
          {[.25,.5,.75,1].map(l => <polygon key={l} points={points(person.skills.map(()=>l))} className="v6-radar-ring"/>)}
          {person.skills.map((_,i) => { const a=-Math.PI/2+i*Math.PI*2/person.skills.length; return <line key={i} x1={c} y1={c} x2={c+Math.cos(a)*r} y2={c+Math.sin(a)*r} className="v6-radar-axis"/> })}
          <polygon points={points(values)} className="v6-radar-fill" style={{'--accent':person.color}}/>
        </svg>
      </div>
      <div className="v6-skill-list">
        {person.skillLabels.map((label,i) => (
          <button key={label} className={selected===i?'active':''} onClick={() => setSelected(i)}>
            <span>{label}</span><b>{Math.round(person.skills[i]*progress)}</b><i style={{width:`${person.skills[i]}%`}}/>
          </button>
        ))}
        <div className="v6-skill-note"><strong>{person.skillLabels[selected]}</strong><p>{person.skillStories?.[selected] || `ทักษะ “${person.skillLabels[selected]}” เป็นส่วนสำคัญที่เรื่องราวของ ${person.name} สะท้อนให้เห็น`}</p></div>
      </div>
    </div>
  )
}

function Detail({ person, onBack, onHome, onMove }) {
  const [tab, setTab] = useState('story')
  const startX = useRef(null)
  useEffect(() => setTab('story'), [person.id])
  const onPointerDown = e => { startX.current = e.clientX }
  const onPointerUp = e => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 90) onMove(dx < 0 ? 1 : -1)
  }
  return (
    <main className="v6-screen v6-detail" style={{'--accent': person.color}} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <div className="v6-detail-photo"><Portrait person={person}/></div>
      <div className="v6-detail-fade"/>
      <header className="v6-detail-top">
        <button className="v6-text-back" onClick={onBack}><ArrowLeft size={19}/> บุคคลทั้งหมด</button>
        <div className="v6-count">{String(people.indexOf(person)+1).padStart(2,'0')} <span>/ {String(people.length).padStart(2,'0')}</span></div>
        <div className="v6-top-actions"><button className="v6-icon" onClick={onHome}><Home size={20}/></button><FullscreenButton/></div>
      </header>

      <section className="v6-detail-copy">
        <span className="v6-eyebrow">บุคคลผู้เปลี่ยนโลก</span>
        <h1>{person.name}</h1>
        <p className="v6-en">{person.en} · {person.years}</p>
        <blockquote>{person.hook}</blockquote>
        <nav className="v6-tabs">
          <button className={tab==='story'?'active':''} onClick={()=>setTab('story')}>เรื่องราว</button>
          <button className={tab==='skills'?'active':''} onClick={()=>setTab('skills')}>วิธีคิด</button>
          <button className={tab==='career'?'active':''} onClick={()=>setTab('career')}>อาชีพที่เกี่ยวข้อง</button>
        </nav>
        <div className="v6-content">
          {tab === 'story' && (
            <div className="v6-story">
              <section><span>01</span><div><h3>เขาคือใคร</h3><p>{person.intro}</p></div></section>
              <section><span>02</span><div><h3>สิ่งที่เขาเปลี่ยน</h3><p>{person.impact}</p></div></section>
              <aside><Sparkles size={20}/><div><h3>สิ่งที่เราเรียนรู้ได้</h3><p>{person.moment}</p></div></aside>
            </div>
          )}
          {tab === 'skills' && <Radar person={person}/>} 
          {tab === 'career' && (
            <div className="v6-careers">
              <p>ถ้าเรื่องราวของเขาทำให้คุณสนใจ ลองสำรวจเส้นทางอาชีพเหล่านี้ต่อ</p>
              <div>{person.careers.map((career,i)=><section key={career}><span>{String(i+1).padStart(2,'0')}</span><strong>{career}</strong></section>)}</div>
              <small>ต่อยอดการค้นหาตัวเองได้ที่ Career Radar Chart</small>
            </div>
          )}
        </div>
      </section>

      <footer className="v6-detail-bottom">
        <button onClick={()=>onMove(-1)}><ChevronLeft size={22}/><span>คนก่อนหน้า</span></button>
        <div className="v6-dots">{people.map(p => <i key={p.id} className={p.id===person.id?'active':''}/>)}</div>
        <button onClick={()=>onMove(1)}><span>คนถัดไป</span><ChevronRight size={22}/></button>
      </footer>
    </main>
  )
}

function TouchRipple({ ripple }) {
  return ripple ? <span className="v6-ripple" key={ripple.id} style={{left:ripple.x, top:ripple.y}}/> : null
}

export default function ExhibitV6() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [ripple, setRipple] = useState(null)
  const idleRef = useRef(null)
  const selected = people.find(p => p.id === selectedId)
  const goHome = () => { setScreen('attract'); setSelectedId(null); setFilter('all') }
  useEffect(() => {
    const reset = () => { clearTimeout(idleRef.current); if (screen !== 'attract') idleRef.current = setTimeout(goHome, RESET_MS) }
    const events = ['pointerdown','keydown','touchstart']
    events.forEach(e => window.addEventListener(e, reset, {passive:true})); reset()
    return () => { clearTimeout(idleRef.current); events.forEach(e => window.removeEventListener(e, reset)) }
  }, [screen])
  useEffect(() => {
    const fn = e => { setRipple({id:Date.now(),x:e.clientX,y:e.clientY}); setTimeout(()=>setRipple(null),420) }
    window.addEventListener('pointerdown', fn, {passive:true})
    return () => window.removeEventListener('pointerdown', fn)
  }, [])
  const select = id => { setSelectedId(id); setScreen('detail') }
  const move = delta => {
    const i = people.findIndex(p => p.id === selectedId)
    setSelectedId(people[(i + delta + people.length) % people.length].id)
  }
  let content
  if (screen === 'attract') content = <Attract onExplore={()=>setScreen('gallery')} onSelect={select}/>
  else if (screen === 'gallery') content = <Gallery filter={filter} setFilter={setFilter} onSelect={select} onHome={goHome}/>
  else if (selected) content = <Detail person={selected} onBack={()=>setScreen('gallery')} onHome={goHome} onMove={move}/>
  else content = <Attract onExplore={()=>setScreen('gallery')} onSelect={select}/>
  return <div className="v6-root"><TouchRipple ripple={ripple}/>{content}</div>
}
