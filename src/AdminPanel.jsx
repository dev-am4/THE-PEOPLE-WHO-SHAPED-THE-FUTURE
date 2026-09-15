import { useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Download, Eye, ImagePlus, LockKeyhole, LogOut, Plus, RotateCcw, Save, Search, ShieldCheck, Upload } from 'lucide-react'
import { people as factoryPeople } from './people-reference.js'
import {
  cachePortraitLocally,
  createBackup,
  getPinHash,
  hashPin,
  loadPeople,
  loadSettings,
  resetLocalContent,
  restoreBackup,
  saveMediaFile,
  savePeople,
  saveSettings,
  setPinHash,
} from './local-content.js'
import './admin.css'

const AUTH_KEY = 'tpwsf.admin.auth'

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function PinGate({ onUnlock }) {
  const [existingHash, setExistingHash] = useState(() => getPinHash())
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (pin.length < 4) return setError('PIN ต้องมีอย่างน้อย 4 ตัว')
    const hashed = await hashPin(pin)
    if (!existingHash) {
      if (pin !== confirmPin) return setError('PIN ทั้งสองช่องไม่ตรงกัน')
      setPinHash(hashed)
      setExistingHash(hashed)
    } else if (hashed !== existingHash) {
      return setError('PIN ไม่ถูกต้อง')
    }
    sessionStorage.setItem(AUTH_KEY, '1')
    onUnlock()
  }

  return (
    <main className="admin-gate">
      <div className="admin-gate-card">
        <div className="admin-lock"><LockKeyhole size={32} /></div>
        <small>LOCAL EXHIBITION CONTROL</small>
        <h1>{existingHash ? 'เข้าสู่ระบบแอดมิน' : 'ตั้งค่า PIN ครั้งแรก'}</h1>
        <p>ข้อมูลชุดนี้อยู่เฉพาะในเครื่องและเบราว์เซอร์นี้ ไม่มีปุ่มเข้าสู่ Admin บนหน้าผู้ชม</p>
        <form onSubmit={submit}>
          <label>PIN</label>
          <input autoFocus type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} placeholder="อย่างน้อย 4 ตัว" />
          {!existingHash && <>
            <label>ยืนยัน PIN</label>
            <input type="password" inputMode="numeric" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="กรอกซ้ำอีกครั้ง" />
          </>}
          {error && <div className="admin-error">{error}</div>}
          <button className="admin-primary" type="submit"><ShieldCheck size={18} /> {existingHash ? 'เข้าสู่ Control Center' : 'สร้าง PIN และเริ่มใช้งาน'}</button>
        </form>
        <a href="/">← กลับหน้าจอนิทรรศการ</a>
      </div>
    </main>
  )
}

function emptyPerson() {
  return {
    id: `person-${Date.now()}`,
    name: 'บุคคลใหม่',
    en: '',
    role: '',
    portrait: '',
    accent: '#67dcff',
    quote: '',
    intro: '',
    worksTitle: 'ผลงานสำคัญ',
    works: [],
    qrUrl: '',
    status: 'draft',
  }
}

function PersonEditor({ person, onCancel, onSave, onDelete }) {
  const [draft, setDraft] = useState(() => ({ ...person, works: [...(person.works || [])] }))
  const [imageBusy, setImageBusy] = useState(false)

  const field = (key, value) => setDraft(current => ({ ...current, [key]: value }))
  const uploadPortrait = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageBusy(true)
    try {
      const mediaId = `portrait-${draft.id}-${Date.now()}`
      const portrait = await saveMediaFile(mediaId, file)
      field('portrait', portrait)
    } catch (error) {
      alert(error.message || 'บันทึกรูปไม่สำเร็จ')
    } finally {
      setImageBusy(false)
    }
  }

  return (
    <section className="admin-editor">
      <header className="admin-editor-head">
        <button className="admin-ghost" onClick={onCancel}><ArrowLeft size={18} /> กลับ</button>
        <div><small>CONTENT EDITOR</small><h2>{draft.name}</h2></div>
        <div className="admin-editor-actions">
          <button className="admin-ghost" onClick={() => window.open('/', '_blank')}><Eye size={18} /> Preview</button>
          <button className="admin-primary" onClick={() => onSave(draft)}><Save size={18} /> บันทึก</button>
        </div>
      </header>

      <div className="admin-form-grid">
        <div className="admin-form-card admin-span-2">
          <h3>ข้อมูลบุคคล</h3>
          <div className="admin-two">
            <label>ชื่อภาษาไทย<input value={draft.name || ''} onChange={e => field('name', e.target.value)} /></label>
            <label>ชื่อภาษาอังกฤษ<input value={draft.en || ''} onChange={e => field('en', e.target.value)} /></label>
          </div>
          <label>บทบาท / คำอธิบายสั้น<input value={draft.role || ''} onChange={e => field('role', e.target.value)} /></label>
          <div className="admin-two">
            <label>สถานะ<select value={draft.status || 'published'} onChange={e => field('status', e.target.value)}><option value="published">Published</option><option value="draft">Draft</option><option value="hidden">Hidden</option></select></label>
            <label>Accent color<input type="color" value={draft.accent || '#67dcff'} onChange={e => field('accent', e.target.value)} /></label>
          </div>
        </div>

        <div className="admin-form-card">
          <h3>Portrait</h3>
          <div className="admin-portrait-preview" style={{ '--accent': draft.accent }}>{draft.portrait ? <span>{draft.portrait.startsWith('local-media:') ? 'LOCAL IMAGE ✓' : 'CURRENT IMAGE'}</span> : <span>NO IMAGE</span>}</div>
          <label className="admin-upload"><ImagePlus size={18} /> {imageBusy ? 'กำลังบันทึก...' : 'เลือกรูปจากเครื่อง'}<input hidden type="file" accept="image/*" onChange={uploadPortrait} disabled={imageBusy} /></label>
          <label>หรือ URL / path<input value={draft.portrait || ''} onChange={e => field('portrait', e.target.value)} placeholder="/people/name.jpg" /></label>
        </div>

        <div className="admin-form-card">
          <h3>QR</h3>
          <p>เว้นว่าง = ค้นชื่อบุคคลบน Google อัตโนมัติ</p>
          <label>Custom URL<input value={draft.qrUrl || ''} onChange={e => field('qrUrl', e.target.value)} placeholder="https://..." /></label>
        </div>

        <div className="admin-form-card admin-span-2">
          <h3>เรื่องราว</h3>
          <label>Quote (ถ้ามี)<textarea rows="2" value={draft.quote || ''} onChange={e => field('quote', e.target.value)} /></label>
          <label>Intro<textarea rows="7" value={draft.intro || ''} onChange={e => field('intro', e.target.value)} /></label>
        </div>

        <div className="admin-form-card admin-span-2">
          <h3>ผลงาน</h3>
          <label>หัวข้อ<input value={draft.worksTitle || ''} onChange={e => field('worksTitle', e.target.value)} /></label>
          <label>ผลงาน — 1 บรรทัดต่อ 1 รายการ<textarea rows="9" value={(draft.works || []).join('\n')} onChange={e => field('works', e.target.value.split('\n').filter(Boolean))} /></label>
        </div>
      </div>

      <div className="admin-danger-zone">
        <button onClick={() => onDelete(draft.id)}>ลบบุคคลนี้</button>
      </div>
    </section>
  )
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')
  const [list, setList] = useState(() => loadPeople(factoryPeople))
  const [settings, setSettingsState] = useState(() => loadSettings())
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState('')

  const selected = list.find(person => person.id === selectedId)
  const filtered = useMemo(() => list.filter(person => `${person.name} ${person.en} ${person.role}`.toLowerCase().includes(query.toLowerCase())), [list, query])
  const published = list.filter(person => person.status === 'published').length

  if (!authed) return <PinGate onUnlock={() => setAuthed(true)} />

  const commit = (next) => {
    setList(next)
    savePeople(next)
  }
  const savePerson = (person) => {
    const exists = list.some(item => item.id === person.id)
    const next = exists ? list.map(item => item.id === person.id ? person : item) : [...list, person]
    commit(next)
    setSelectedId(null)
  }
  const removePerson = (id) => {
    if (!confirm('ลบบุคคลนี้ออกจาก Local CMS ใช่หรือไม่?')) return
    commit(list.filter(person => person.id !== id))
    setSelectedId(null)
  }
  const movePerson = (id, delta) => {
    const index = list.findIndex(person => person.id === id)
    const target = index + delta
    if (index < 0 || target < 0 || target >= list.length) return
    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }
  const cacheAll = async () => {
    setBusy('กำลังทำรูปทั้งหมดให้ออฟไลน์...')
    try {
      const next = []
      for (let i = 0; i < list.length; i += 1) {
        setBusy(`กำลังเก็บรูป ${i + 1}/${list.length} · ${list[i].name}`)
        try { next.push(await cachePortraitLocally(list[i])) } catch { next.push(list[i]) }
      }
      commit(next)
      setBusy('เก็บรูปที่โหลดได้ลงเครื่องเรียบร้อย')
      setTimeout(() => setBusy(''), 2500)
    } catch (error) {
      setBusy('')
      alert(error.message || 'Cache รูปไม่สำเร็จ')
    }
  }
  const backup = async () => {
    setBusy('กำลังสร้าง Backup...')
    try {
      const payload = await createBackup(factoryPeople)
      downloadJson(`people-exhibit-backup-${new Date().toISOString().slice(0, 10)}.json`, payload)
    } finally { setBusy('') }
  }
  const restore = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      await restoreBackup(payload)
      setList(loadPeople(factoryPeople))
      setSettingsState(loadSettings())
      alert('Restore สำเร็จ')
    } catch (error) { alert(error.message || 'Restore ไม่สำเร็จ') }
    event.target.value = ''
  }
  const factoryReset = () => {
    if (!confirm('คืนค่าเนื้อหากลับเป็นข้อมูลจากโค้ดเดิม? ข้อมูลที่แก้ใน Local CMS จะถูกล้าง')) return
    resetLocalContent()
    setList(loadPeople(factoryPeople))
    setSettingsState(loadSettings())
  }
  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
  }

  if (selected) return <PersonEditor person={selected} onCancel={() => setSelectedId(null)} onSave={savePerson} onDelete={removePerson} />

  return (
    <main className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand"><b>THE PEOPLE</b><span>LOCAL CONTROL CENTER</span></div>
        <nav><button className="active">Content</button><button onClick={() => window.open('/', '_blank')}>เปิด Exhibit</button></nav>
        <div className="admin-side-foot"><span>OFFLINE-FIRST · LOCAL DATA</span><button onClick={logout}><LogOut size={16} /> ออกจากระบบ</button></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><small>EXHIBITION CMS</small><h1>จัดการเนื้อหา</h1></div>
          <div className="admin-top-actions"><button className="admin-ghost" onClick={cacheAll}><Download size={18} /> ทำรูปทั้งหมดให้ออฟไลน์</button><button className="admin-primary" onClick={() => savePerson(emptyPerson())}><Plus size={18} /> เพิ่มบุคคล</button></div>
        </header>

        {busy && <div className="admin-progress">{busy}</div>}

        <div className="admin-stats">
          <article><small>ทั้งหมด</small><b>{list.length}</b></article>
          <article><small>Published</small><b>{published}</b></article>
          <article><small>Draft / Hidden</small><b>{list.length - published}</b></article>
          <article><small>ที่เก็บข้อมูล</small><b className="admin-local">LOCAL</b></article>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div className="admin-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาบุคคล..." /></div>
            <span>ลากลำดับแบบปลอดภัยด้วยปุ่ม ↑ ↓</span>
          </div>
          <div className="admin-table">
            {filtered.map((person, index) => (
              <div className="admin-row" key={person.id}>
                <b className="admin-index">{String(list.indexOf(person) + 1).padStart(2, '0')}</b>
                <div className="admin-person"><i style={{ background: person.accent || '#67dcff' }} /><div><strong>{person.name}</strong><span>{person.en || person.role}</span></div></div>
                <span className={`admin-status ${person.status || 'published'}`}>{person.status || 'published'}</span>
                <div className="admin-order"><button onClick={() => movePerson(person.id, -1)} disabled={list.indexOf(person) === 0}><ArrowUp size={16} /></button><button onClick={() => movePerson(person.id, 1)} disabled={list.indexOf(person) === list.length - 1}><ArrowDown size={16} /></button></div>
                <button className="admin-edit" onClick={() => setSelectedId(person.id)}>แก้ไข</button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-settings">
          <div><small>SYSTEM</small><h2>ตั้งค่าหน้าจอ</h2></div>
          <label>กลับหน้าแรกเมื่อไม่มีการใช้งาน (วินาที)<input type="number" min="15" max="3600" value={Math.round(settings.resetMs / 1000)} onChange={e => setSettingsState({ ...settings, resetMs: Math.max(15000, Number(e.target.value || 90) * 1000) })} /></label>
          <label className="admin-check"><input type="checkbox" checked={settings.qrEnabled !== false} onChange={e => setSettingsState({ ...settings, qrEnabled: e.target.checked })} /> แสดง QR Code</label>
          <button className="admin-primary" onClick={() => { saveSettings(settings); alert('บันทึก Settings แล้ว') }}><Save size={18} /> บันทึก Settings</button>
        </section>

        <section className="admin-panel admin-tools">
          <div><small>LOCAL BACKUP</small><h2>สำรองและกู้คืน</h2><p>Backup จะรวมเนื้อหา Settings และรูปที่อัปโหลดลงเครื่อง</p></div>
          <button className="admin-ghost" onClick={backup}><Download size={18} /> Export Backup</button>
          <label className="admin-ghost admin-file"><Upload size={18} /> Restore Backup<input hidden type="file" accept="application/json" onChange={restore} /></label>
          <button className="admin-danger" onClick={factoryReset}><RotateCcw size={18} /> Factory Content</button>
        </section>
      </section>
    </main>
  )
}
