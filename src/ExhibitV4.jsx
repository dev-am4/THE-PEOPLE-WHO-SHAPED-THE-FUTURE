import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Atom, BrainCircuit, ChevronLeft, ChevronRight, Code2, Expand, Home, Orbit, Palette, Rocket, Sparkles, X } from 'lucide-react'
import { categories, people } from './people-v3.js'

const RESET_MS = 90000
const iconMap = { sparkles: Sparkles, atom: Atom, rocket: Rocket, code: Code2, palette: Palette }

function SpaceBackground() {
  return <div className="space-bg" aria-hidden="true"><div className="nebula nebula-one"/><div className="nebula nebula-two"/><div className="starfield"/><div className="space-grid"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/></div>
}

function FullscreenButton() {
  const [isFull,setIsFull]=useState(Boolean(document.fullscreenElement))
  useEffect(()=>{const fn=()=>setIsFull(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',fn);return()=>document.removeEventListener('fullscreenchange',fn)},[])
  const toggle=async()=>{try{if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen()}catch(_){}}
  return <button className="utility-btn" onClick={toggle}><Expand size={19}/><span>{isFull?'ออกเต็มจอ':'เต็มจอ'}</span></button>
}

function Portrait({person,className=''}) {
  const [failed,setFailed]=useState(false)
  return <div className={`portrait-frame ${className}`} style={{'--accent':person.color}}>{person.portrait&&!failed?<img src={person.portrait} alt={person.name} draggable="false" loading="eager" onError={()=>setFailed(true)} style={{objectPosition:person.focus||'50% 25%'}}/>:<div className="portrait-fallback"><span>{person.initials}</span></div>}<div className="portrait-vignette"/></div>
}

function Attract({onExplore,onSelect}) {
  return <main className="screen attract-screen"><SpaceBackground/><header className="screen-header attract-header"><div className="project-id"><div className="project-symbol"><Orbit size={22}/></div><div className="project-id-copy"><strong>นิทรรศการดาราศาสตร์และอวกาศ</strong><span>ศูนย์วิทยาศาสตร์เพื่อการศึกษานครสวรรค์</span></div></div><FullscreenButton/></header><section className="attract-layout"><div className="attract-copy"><div className="english-kicker">THE PEOPLE WHO SHAPED THE FUTURE</div><h1>บุคคลผู้เปลี่ยนโลก<span>และสร้างอนาคต</span></h1><p className="attract-lead">เรียนรู้จากคนที่ <b>กล้าคิด</b> <b>กล้าถาม</b> และ <b>ลงมือสร้าง</b><br/>สิ่งที่ครั้งหนึ่งเคยดูเหมือนเป็นไปไม่ได้</p><div className="learning-steps"><div><span>01</span><strong>ถามให้ลึก</strong><small>เริ่มจากความสงสัย</small></div><div><span>02</span><strong>คิดให้ไกล</strong><small>เชื่อมโยงความรู้</small></div><div><span>03</span><strong>สร้างให้จริง</strong><small>เปลี่ยนแนวคิดเป็นผลงาน</small></div></div><button className="primary-action attract-action" onClick={onExplore}><span>แตะเพื่อเริ่มเรียนรู้</span><ArrowRight size={28}/></button></div><div className="portrait-wall-wrap"><div className="portrait-wall-heading"><span>12 เรื่องราว · 12 วิธีคิด</span><strong>คุณอยากเรียนรู้จากใคร?</strong></div><div className="portrait-wall">{people.map((person,index)=><button key={person.id} className="portrait-tile" style={{'--accent':person.color,'--delay':`${index*55}ms`}} onClick={()=>onSelect(person.id)}><Portrait person={person}/><div className="portrait-tile-copy"><strong>{person.name}</strong><span>{person.years}</span></div></button>)}</div></div></section></main>
}

function Gallery({filter,setFilter,onSelect,onHome}) {
  const visible=useMemo(()=>filter==='all'?people:people.filter(p=>p.category.includes(filter)),[filter])
  return <main className="screen gallery-screen"><SpaceBackground/><header className="screen-header gallery-header"><button className="utility-btn" onClick={onHome}><Home size={19}/><span>หน้าแรก</span></button><div className="gallery-heading"><span>เลือกหนึ่งเรื่องราว เพื่อค้นพบหนึ่งวิธีคิด</span><h1>ใครเปลี่ยนโลก... และเขาคิดต่างอย่างไร?</h1></div><FullscreenButton/></header><nav className="category-bar">{categories.map(c=>{const Icon=iconMap[c.icon]||Sparkles;return <button key={c.id} className={filter===c.id?'active':''} onClick={()=>setFilter(c.id)}><Icon size={19}/><span>{c.label}</span></button>})}</nav><section className="people-grid-safe">{visible.map((person,index)=><button className="person-card-safe" key={person.id} onClick={()=>onSelect(person.id)} style={{'--accent':person.color,'--delay':`${index*35}ms`}}><Portrait person={person} className="card-portrait"/><div className="card-content"><div className="card-meta"><span>{String(people.indexOf(person)+1).padStart(2,'0')}</span><small>{person.years}</small></div><h2>{person.name}</h2><p>{person.en}</p><strong className="card-hook">“{person.hook}”</strong><div className="card-touch">แตะเพื่อเรียนรู้ <ArrowRight size={17}/></div></div></button>)}</section></main>
}

function RadarChart({person}) {
  const [progress,setProgress]=useState(0); const [selectedSkill,setSelectedSkill]=useState(0)
  useEffect(()=>{setProgress(0);let frame;const start=performance.now();const tick=now=>{const p=Math.min(1,(now-start)/800);setProgress(1-Math.pow(1-p,3));if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[person.id])
  const size=280,center=140,radius=92; const pts=values=>values.map((v,i)=>{const a=-Math.PI/2+i*Math.PI*2/values.length;return `${center+Math.cos(a)*radius*v},${center+Math.sin(a)*radius*v}`}).join(' ')
  const values=person.skills.map(v=>v/100*progress); const skill=person.skillLabels[selectedSkill]
  return <div className="cinema-dna"><div className="cinema-radar"><svg viewBox={`0 0 ${size} ${size}`}>{[.25,.5,.75,1].map(l=><polygon key={l} points={pts(person.skills.map(()=>l))} className="radar-ring"/>)}{person.skills.map((_,i)=>{const a=-Math.PI/2+i*Math.PI*2/person.skills.length;return <line key={i} x1={center} y1={center} x2={center+Math.cos(a)*radius} y2={center+Math.sin(a)*radius} className="radar-axis"/>})}<polygon points={pts(values)} className="radar-fill" style={{'--accent':person.color}}/></svg></div><div className="cinema-skills">{person.skillLabels.map((label,i)=><button key={label} className={selectedSkill===i?'active':''} onClick={()=>setSelectedSkill(i)}><span>{label}</span><b>{Math.round(person.skills[i]*progress)}</b></button>)}<div className="cinema-skill-story"><small>ทักษะที่เรื่องราวนี้สะท้อน</small><strong>{skill}</strong><p>{person.skillStories?.[selectedSkill]||`ทักษะ “${skill}” เป็นหนึ่งในองค์ประกอบสำคัญที่ผลงานของ ${person.name} สะท้อนให้เห็น`}</p></div></div></div>
}

function Detail({person,onBack,onHome,onMove}) {
  const [tab,setTab]=useState('story')
  useEffect(()=>setTab('story'),[person.id])
  return <main className="screen cinema-detail" style={{'--accent':person.color}}><div className="cinema-photo"><Portrait person={person}/></div><div className="cinema-shade"/><div className="cinema-gridlines"/><header className="cinema-top"><button className="utility-btn" onClick={onBack}><X size={19}/><span>รายชื่อทั้งหมด</span></button><div className="detail-index">{String(people.indexOf(person)+1).padStart(2,'0')} <span>/ {String(people.length).padStart(2,'0')}</span></div><div className="header-actions"><button className="utility-btn icon-only" onClick={onHome}><Home size={19}/></button><FullscreenButton/></div></header><section className="cinema-copy"><small className="cinema-kicker">เรียนรู้จากคนที่เปลี่ยนอนาคต</small><h1>{person.name}</h1><blockquote>“{person.hook}”</blockquote><nav className="cinema-tabs"><button className={tab==='story'?'active':''} onClick={()=>setTab('story')}>เรื่องราว</button><button className={tab==='skills'?'active':''} onClick={()=>setTab('skills')}>DNA แห่งความสำเร็จ</button><button className={tab==='career'?'active':''} onClick={()=>setTab('career')}>อาชีพที่เชื่อมโยง</button></nav><div className="cinema-panel">{tab==='story'&&<div className="cinema-story"><article><small>เขาคือใคร</small><p>{person.intro}</p></article><article><small>เขาเปลี่ยนอะไร</small><p>{person.impact}</p></article><div className="cinema-lesson"><Sparkles size={22}/><div><small>บทเรียนที่นำไปใช้ได้</small><p>{person.moment}</p></div></div></div>}{tab==='skills'&&<RadarChart person={person}/>} {tab==='career'&&<div className="cinema-career"><div className="career-intro"><BrainCircuit size={26}/><div><small>จากแรงบันดาลใจ สู่อาชีพในอนาคต</small><p>ถ้าเรื่องราวนี้ทำให้คุณสนใจ ลองสำรวจเส้นทางเหล่านี้ต่อ</p></div></div><div className="cinema-career-grid">{person.careers.map((career,i)=><div key={career}><span>{String(i+1).padStart(2,'0')}</span><strong>{career}</strong></div>)}</div></div>}</div></section><footer className="cinema-bottom"><button onClick={()=>onMove(-1)}><ChevronLeft size={24}/><span>คนก่อนหน้า</span></button><div><strong>{person.en}</strong><span>{person.years}</span></div><button onClick={()=>onMove(1)}><span>คนถัดไป</span><ChevronRight size={24}/></button></footer></main>
}

function TouchRipple({ripple}) { return ripple?<span className="touch-ripple" key={ripple.id} style={{left:ripple.x,top:ripple.y}}/>:null }

export default function ExhibitV4(){
  const [screen,setScreen]=useState('attract'); const [selectedId,setSelectedId]=useState(null); const [filter,setFilter]=useState('all'); const [ripple,setRipple]=useState(null); const idleRef=useRef(null)
  const selected=people.find(p=>p.id===selectedId)
  const goHome=()=>{setSelectedId(null);setFilter('all');setScreen('attract')}
  useEffect(()=>{const reset=()=>{clearTimeout(idleRef.current);if(screen!=='attract') idleRef.current=setTimeout(goHome,RESET_MS)};['pointerdown','keydown','touchstart'].forEach(e=>window.addEventListener(e,reset,{passive:true}));reset();return()=>{clearTimeout(idleRef.current);['pointerdown','keydown','touchstart'].forEach(e=>window.removeEventListener(e,reset))}},[screen])
  useEffect(()=>{const fn=e=>{setRipple({id:Date.now(),x:e.clientX,y:e.clientY});setTimeout(()=>setRipple(null),520)};window.addEventListener('pointerdown',fn,{passive:true});return()=>window.removeEventListener('pointerdown',fn)},[])
  const select=id=>{setSelectedId(id);setScreen('detail')}
  const move=delta=>{const i=people.findIndex(p=>p.id===selectedId);const n=(i+delta+people.length)%people.length;setSelectedId(people[n].id)}
  let content=screen==='attract'?<Attract onExplore={()=>setScreen('gallery')} onSelect={select}/>:screen==='gallery'?<Gallery filter={filter} setFilter={setFilter} onSelect={select} onHome={goHome}/>:selected?<Detail person={selected} onBack={()=>setScreen('gallery')} onHome={goHome} onMove={move}/>:<Attract onExplore={()=>setScreen('gallery')} onSelect={select}/>
  return <div className="exhibit-root v4"><TouchRipple ripple={ripple}/>{content}</div>
}
