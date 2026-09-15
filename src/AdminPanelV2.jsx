import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Download,
  Eye,
  ImagePlus,
  LockKeyhole,
  LogOut,
  Maximize2,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import { people as factoryPeople } from './people-reference.js'
import {
  cachePortraitLocally,
  createBackup,
  getMediaDataUrl,
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
import {
  clearAllDrafts,
  clearPersonDraft,
  loadDraftMap,
  saveDraftMap,
  savePersonDraft,
} from './local-drafts.js'
import './admin-v2.css'

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
    status: 'published',
  }
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
    <main className="admin2-gate">
      <div className="admin2-gate-card">
        <div className="admin2-lock"><LockKeyhole size={32} /></div>
        <small>LOCAL EXHIBITION CONTROL</small>
        <h1>{existingHash ? 'เข้าสู่ระบบแอดมิน' : 'ตั้งค่า PIN ครั้งแรก'}</h1>
        <p>ข้อมูลอยู่เฉพาะในเครื่องและเบราว์เซอร์นี้ หน้า Exhibit ไม่มีปุ่มเข้าสู่ Admin</p>
        <form onSubmit={submit}>
          <label>PIN</label>
          <input autoFocus type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} placeholder="อย่างน้อย 4 ตัว" />
          {!existingHash && <>
            <label>ยืนยัน PIN</label>
            <input type="password" inputMode="numeric" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="กรอกซ้ำอีกครั้ง" />
          </>}
          {error && <div className="admin2-error">{error}</div>}
          <button className="admin2-primary" type="submit"><ShieldCheck size={18} /> {existingHash ? 'เข้าสู่ Control Center' : 'สร้าง PIN และเริ่มใช้งาน'}</button>
        </form>
        <a href="/">← กลับหน้าจอนิทรรศการ</a>
      </div>
    </main>
  )
}

function PreviewPortrait({ person }) {
  const [src, setSrc] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    const resolve = async () => {
      const portrait = String(person?.portrait || '')
      if (portrait.startsWith('local-media:')) {
        try {
          const local = await getMediaDataUrl(portrait.replace('local-media:', ''))
          if (!cancelled) setSrc(local || '')
        } catch {
          if (!cancelled) setSrc('')
        }
        return
      }
      if (!cancelled) setSrc(portrait)
    }
    resolve()
    return () => { cancelled = true }
  }, [person?.id, person?.portrait])

  if (!src || failed) return <div className="admin2-preview-fallback">{person?.name?.slice(0, 2) || '??'}</div>
  return <img src={src} alt={person?.name || ''} onError={() => setFailed(true)} draggable="false" />
}

function LivePreview({ person, mode = 'detail', fullscreen = false }) {
  return (
    <div className={`admin2-live-preview ${fullscreen ? 'is-fullscreen' : ''}`} style={{ '--preview-accent': person.accent || '#67dcff' }}>
      {mode === 'card' ? (
        <div className="admin2-preview-card">
          <div className="admin2-preview-card-img"><PreviewPortrait person={person} /></div>
          <div className="admin2-preview-card-copy">
            <small>{person.role || 'บทบาท / คำอธิบายสั้น'}</small>
            <strong>{person.name || 'ชื่อบุคคล'}</strong>
            <span>{person.en || 'English name'}</span>
          </div>
          <i>→</i>
        </div>
      ) : (
        <div className="admin2-preview-detail">
          <section className="admin2-preview-story">
            <small>HUMAN ARCHIVE · LIVE PREVIEW</small>
            <h2>{person.name || 'ชื่อบุคคล'}</h2>
            <div className="admin2-preview-role">{person.en || 'English name'} · {person.role || 'บทบาท'}</div>
            {person.quote && <blockquote>{person.quote}</blockquote>}
            <div className="admin2-preview-section-label">01 · THE STORY</div>
            <p>{person.intro || 'พิมพ์เนื้อหา Intro แล้วดูตัวอย่างตรงนี้ได้ทันที'}</p>
            <div className="admin2-preview-section-label">02 · {person.worksTitle || 'ผลงานสำคัญ'}</div>
            <ol>{(person.works || []).slice(0, 4).map((work, index) => <li key={`${person.id}-${index}`}>{work}</li>)}</ol>
          </section>
          <aside className="admin2-preview-photo"><PreviewPortrait person={person} /></aside>
        </div>
      )}
    </div>
  )
}

function ConfirmModal({ title, children, confirmLabel, onConfirm, onClose, tone = 'primary' }) {
  return (
    <div className="admin2-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className="admin2-modal">
        <button className="admin2-modal-x" onClick={onClose}><X size={18} /></button>
        <small>CONFIRM ACTION</small>
        <h2>{title}</h2>
        <div className="admin2-modal-body">{children}</div>
        <div className="admin2-modal-actions">
          <button className="admin2-ghost" onClick={onClose}>ยกเลิก</button>
          <button className={tone === 'danger' ? 'admin2-danger' : 'admin2-primary'} onClick={onConfirm}><CheckCircle2 size={18} /> {confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function PersonEditor({ person, publishedPerson, onBack, onSaveDraft, onPublish, onDelete }) {
  const normalized = useMemo(() => ({
    ...person,
    status: person.status === 'hidden' ? 'hidden' : 'published',
    works: [...(person.works || [])],
  }), [person])
  const [draft, setDraft] = useState(normalized)
  const [baseline, setBaseline] = useState(() => JSON.stringify(normalized))
  const [previewMode, setPreviewMode] = useState('detail')
  const [fullPreview, setFullPreview] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const dirty = JSON.stringify(draft) !== baseline

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

  const saveDraft = () => {
    onSaveDraft(draft)
    setBaseline(JSON.stringify(draft))
  }
  const back = () => {
    if (dirty && !confirm('มีการแก้ไขที่ยังไม่ได้บันทึก Draft ต้องการออกโดยไม่บันทึกหรือไม่?')) return
    onBack()
  }
  const publish = () => {
    onPublish(draft)
    setConfirmPublish(false)
  }

  return (
    <main className="admin2-editor-page">
      <header className="admin2-editor-head">
        <button className="admin2-ghost" onClick={back}><ArrowLeft size={18} /> บุคคลทั้งหมด</button>
        <div className="admin2-editor-title">
          <small>CONTENT EDITOR · LIVE STAGING</small>
          <h1>{draft.name}</h1>
          <span>{publishedPerson ? 'กำลังแก้ Draft · หน้า Exhibit ยังใช้เวอร์ชัน Published เดิม' : 'รายการใหม่ · ยังไม่แสดงบน Exhibit'}</span>
        </div>
        <div className="admin2-editor-actions">
          <button className="admin2-ghost" onClick={saveDraft}><Save size={18} /> บันทึก Draft</button>
          <button className="admin2-primary" onClick={() => setConfirmPublish(true)}><CheckCircle2 size={18} /> {draft.status === 'hidden' ? 'ยืนยันและซ่อน' : 'ยืนยันเผยแพร่'}</button>
        </div>
      </header>

      <div className="admin2-editor-grid">
        <section className="admin2-form-column">
          <div className="admin2-form-card">
            <div className="admin2-card-title"><div><small>PROFILE</small><h3>ข้อมูลบุคคล</h3></div>{dirty && <span className="admin2-unsaved">UNSAVED</span>}</div>
            <div className="admin2-two">
              <label>ชื่อภาษาไทย<input value={draft.name || ''} onChange={e => field('name', e.target.value)} /></label>
              <label>ชื่อภาษาอังกฤษ<input value={draft.en || ''} onChange={e => field('en', e.target.value)} /></label>
            </div>
            <label>บทบาท / คำอธิบายสั้น<input value={draft.role || ''} onChange={e => field('role', e.target.value)} /></label>
            <div className="admin2-two">
              <label>สถานะหลังยืนยัน<select value={draft.status} onChange={e => field('status', e.target.value)}><option value="published">Published</option><option value="hidden">Hidden</option></select></label>
              <label>Accent color<input type="color" value={draft.accent || '#67dcff'} onChange={e => field('accent', e.target.value)} /></label>
            </div>
          </div>

          <div className="admin2-form-card">
            <small>MEDIA</small><h3>Portrait</h3>
            <label className="admin2-upload"><ImagePlus size={18} /> {imageBusy ? 'กำลังบันทึก...' : 'เลือกรูปจากเครื่อง'}<input hidden type="file" accept="image/*" onChange={uploadPortrait} disabled={imageBusy} /></label>
            <label>หรือ URL / path<input value={draft.portrait || ''} onChange={e => field('portrait', e.target.value)} placeholder="/people/name.jpg" /></label>
          </div>

          <div className="admin2-form-card">
            <small>STORY</small><h3>เรื่องราว</h3>
            <label>Quote (ถ้ามี)<textarea rows="3" value={draft.quote || ''} onChange={e => field('quote', e.target.value)} /></label>
            <label>Intro<textarea rows="8" value={draft.intro || ''} onChange={e => field('intro', e.target.value)} /></label>
          </div>

          <div className="admin2-form-card">
            <small>WORKS</small><h3>ผลงาน</h3>
            <label>หัวข้อ<input value={draft.worksTitle || ''} onChange={e => field('worksTitle', e.target.value)} /></label>
            <label>ผลงาน — 1 บรรทัดต่อ 1 รายการ<textarea rows="10" value={(draft.works || []).join('\n')} onChange={e => field('works', e.target.value.split('\n').filter(Boolean))} /></label>
          </div>

          <div className="admin2-form-card">
            <small>QR</small><h3>ลิงก์เพิ่มเติม</h3>
            <p className="admin2-help">เว้นว่าง = ค้นชื่อบุคคลบน Google อัตโนมัติ</p>
            <label>Custom URL<input value={draft.qrUrl || ''} onChange={e => field('qrUrl', e.target.value)} placeholder="https://..." /></label>
          </div>

          <div className="admin2-danger-zone"><button onClick={() => onDelete(draft.id)}>ลบบุคคลนี้</button></div>
        </section>

        <aside className="admin2-preview-column">
          <div className="admin2-preview-sticky">
            <div className="admin2-preview-head">
              <div><small>LIVE PREVIEW</small><h3>ตัวอย่างทันที</h3></div>
              <button className="admin2-ghost compact" onClick={() => setFullPreview(true)}><Maximize2 size={16} /> เต็มจอ</button>
            </div>
            <div className="admin2-preview-tabs">
              <button className={previewMode === 'card' ? 'active' : ''} onClick={() => setPreviewMode('card')}>การ์ด</button>
              <button className={previewMode === 'detail' ? 'active' : ''} onClick={() => setPreviewMode('detail')}>รายละเอียด</button>
            </div>
            <LivePreview person={draft} mode={previewMode} />
            <div className="admin2-preview-note"><Eye size={15} /> Preview นี้ใช้ข้อมูลในฟอร์มทันที แต่ยังไม่เปลี่ยนหน้า Exhibit จริง</div>
          </div>
        </aside>
      </div>

      {fullPreview && <div className="admin2-full-preview"><button onClick={() => setFullPreview(false)}><X size={20} /> กลับมาแก้ไข</button><LivePreview person={draft} mode={previewMode} fullscreen /></div>}

      {confirmPublish && (
        <ConfirmModal
          title={draft.status === 'hidden' ? 'ยืนยันซ่อนรายการนี้?' : 'ยืนยันเผยแพร่ข้อมูลนี้?'}
          confirmLabel={draft.status === 'hidden' ? 'ยืนยันและซ่อน' : 'ยืนยันเผยแพร่'}
          onClose={() => setConfirmPublish(false)}
          onConfirm={publish}
        >
          <p>หลังยืนยัน หน้า Exhibit จะเปลี่ยนจากเวอร์ชันเดิมมาใช้ข้อมูลชุดนี้ทันที</p>
          <div className="admin2-confirm-summary"><b>{draft.name}</b><span>{publishedPerson ? 'มี Published เดิมอยู่' : 'รายการใหม่'}</span><span>สถานะใหม่: {draft.status.toUpperCase()}</span></div>
        </ConfirmModal>
      )}
    </main>
  )
}

export default function AdminPanelV2() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')
  const [list, setList] = useState(() => loadPeople(factoryPeople))
  const [drafts, setDrafts] = useState(() => loadDraftMap())
  const [settings, setSettingsState] = useState(() => loadSettings())
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const [showExhibitConfirm, setShowExhibitConfirm] = useState(false)

  const published = list.filter(person => person.status === 'published').length
  const hidden = list.filter(person => person.status === 'hidden').length
  const legacyDrafts = list.filter(person => person.status === 'draft' && !drafts[person.id]).length
  const draftCount = Object.keys(drafts).length + legacyDrafts

  const displayList = useMemo(() => {
    const listIds = new Set(list.map(person => person.id))
    const existing = list.map(person => ({
      ...(drafts[person.id] || person),
      _published: person.status === 'published' || person.status === 'hidden' ? person : null,
      _hasDraft: !!drafts[person.id] || person.status === 'draft',
      _draftOnly: false,
    }))
    const draftOnly = Object.values(drafts)
      .filter(person => !listIds.has(person.id))
      .map(person => ({ ...person, _published: null, _hasDraft: true, _draftOnly: true }))
    return [...existing, ...draftOnly]
  }, [list, drafts])

  const filtered = useMemo(() => displayList.filter(person => `${person.name} ${person.en} ${person.role}`.toLowerCase().includes(query.toLowerCase())), [displayList, query])
  const selected = selectedId ? (drafts[selectedId] || list.find(person => person.id === selectedId)) : null
  const selectedPublished = selectedId ? list.find(person => person.id === selectedId && person.status !== 'draft') : null

  const flash = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }
  const commit = (next) => {
    setList(next)
    savePeople(next)
  }
  const refreshDrafts = () => setDrafts(loadDraftMap())

  if (!authed) return <PinGate onUnlock={() => setAuthed(true)} />

  const saveDraft = (person) => {
    savePersonDraft(person)
    refreshDrafts()
    flash('บันทึก Draft แล้ว · หน้า Exhibit ยังไม่เปลี่ยน')
  }
  const publishPerson = (person) => {
    const record = { ...person, status: person.status === 'hidden' ? 'hidden' : 'published' }
    const exists = list.some(item => item.id === person.id)
    const next = exists ? list.map(item => item.id === person.id ? record : item) : [...list, record]
    commit(next)
    clearPersonDraft(person.id)
    refreshDrafts()
    setSelectedId(null)
    flash(record.status === 'hidden' ? 'ยืนยันแล้ว · รายการถูกซ่อนจาก Exhibit' : 'เผยแพร่เรียบร้อย · หน้า Exhibit อัปเดตแล้ว')
  }
  const addPerson = () => {
    const person = emptyPerson()
    savePersonDraft(person)
    refreshDrafts()
    setSelectedId(person.id)
  }
  const removePerson = (id) => {
    if (!confirm('ลบบุคคลนี้ออกจาก Local CMS ใช่หรือไม่?')) return
    if (list.some(person => person.id === id)) commit(list.filter(person => person.id !== id))
    clearPersonDraft(id)
    refreshDrafts()
    setSelectedId(null)
    flash('ลบรายการแล้ว')
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
    const next = []
    for (let i = 0; i < list.length; i += 1) {
      setBusy(`กำลังเก็บรูป ${i + 1}/${list.length} · ${list[i].name}`)
      try { next.push(await cachePortraitLocally(list[i])) } catch { next.push(list[i]) }
    }
    commit(next)
    setBusy('เก็บรูปที่โหลดได้ลงเครื่องเรียบร้อย')
    window.setTimeout(() => setBusy(''), 2500)
  }
  const backup = async () => {
    setBusy('กำลังสร้าง Backup...')
    try {
      const payload = await createBackup(factoryPeople)
      payload.drafts = loadDraftMap()
      downloadJson(`people-exhibit-backup-${new Date().toISOString().slice(0, 10)}.json`, payload)
    } finally { setBusy('') }
  }
  const restore = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      await restoreBackup(payload)
      saveDraftMap(payload.drafts || {})
      setList(loadPeople(factoryPeople))
      setSettingsState(loadSettings())
      refreshDrafts()
      flash('Restore สำเร็จ')
    } catch (error) { alert(error.message || 'Restore ไม่สำเร็จ') }
    event.target.value = ''
  }
  const factoryReset = () => {
    if (!confirm('คืนค่าเนื้อหากลับเป็นข้อมูลจากโค้ดเดิม? ข้อมูล Local และ Draft จะถูกล้าง')) return
    resetLocalContent()
    clearAllDrafts()
    setList(loadPeople(factoryPeople))
    setSettingsState(loadSettings())
    refreshDrafts()
    flash('คืนค่า Factory Content แล้ว')
  }
  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
  }
  const openExhibit = () => {
    setShowExhibitConfirm(false)
    window.open('/', '_blank', 'noopener')
  }

  if (selected) return (
    <>
      <PersonEditor
        person={selected}
        publishedPerson={selectedPublished}
        onBack={() => setSelectedId(null)}
        onSaveDraft={saveDraft}
        onPublish={publishPerson}
        onDelete={removePerson}
      />
      {toast && <div className="admin2-toast">{toast}</div>}
    </>
  )

  return (
    <main className="admin2-shell">
      <aside className="admin2-sidebar">
        <div className="admin2-brand"><b>THE PEOPLE</b><span>LOCAL CONTROL CENTER</span></div>
        <nav>
          <button className="active">Content</button>
          <button onClick={() => setShowExhibitConfirm(true)}>ตรวจสอบ & เปิด Exhibit</button>
        </nav>
        <div className="admin2-side-foot"><span>OFFLINE-FIRST · LOCAL DATA</span><button onClick={logout}><LogOut size={16} /> ออกจากระบบ</button></div>
      </aside>

      <section className="admin2-main">
        <header className="admin2-topbar">
          <div><small>EXHIBITION CMS</small><h1>จัดการเนื้อหา</h1></div>
          <div className="admin2-top-actions"><button className="admin2-ghost" onClick={cacheAll}><Download size={18} /> ทำรูปทั้งหมดให้ออฟไลน์</button><button className="admin2-primary" onClick={addPerson}><Plus size={18} /> เพิ่มบุคคล</button></div>
        </header>

        {busy && <div className="admin2-progress">{busy}</div>}

        <div className="admin2-stats">
          <article><small>ทั้งหมด</small><b>{displayList.length}</b></article>
          <article><small>Published</small><b>{published}</b></article>
          <article><small>Draft Changes</small><b>{draftCount}</b></article>
          <article><small>Hidden</small><b>{hidden}</b></article>
        </div>

        {draftCount > 0 && <div className="admin2-draft-banner"><span><b>{draftCount}</b> รายการมี Draft ที่ยังไม่เผยแพร่</span><small>หน้า Exhibit ยังใช้ข้อมูล Published เดิมจนกว่าจะกดยืนยัน</small></div>}

        <section className="admin2-panel">
          <div className="admin2-panel-head">
            <div className="admin2-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาบุคคล..." /></div>
            <span>ลำดับ Published ปรับด้วยปุ่ม ↑ ↓</span>
          </div>
          <div className="admin2-table">
            {filtered.map(person => {
              const baseIndex = list.findIndex(item => item.id === person.id)
              const statusLabel = person._hasDraft ? 'DRAFT CHANGES' : (person.status || 'published').toUpperCase()
              return (
                <div className="admin2-row" key={person.id}>
                  <b className="admin2-index">{baseIndex >= 0 ? String(baseIndex + 1).padStart(2, '0') : 'NEW'}</b>
                  <div className="admin2-person"><i style={{ background: person.accent || '#67dcff' }} /><div><strong>{person.name}</strong><span>{person.en || person.role}</span></div></div>
                  <span className={`admin2-status ${person._hasDraft ? 'draft' : (person.status || 'published')}`}>{statusLabel}</span>
                  <div className="admin2-order"><button onClick={() => movePerson(person.id, -1)} disabled={baseIndex <= 0}><ArrowUp size={16} /></button><button onClick={() => movePerson(person.id, 1)} disabled={baseIndex < 0 || baseIndex === list.length - 1}><ArrowDown size={16} /></button></div>
                  <button className="admin2-edit" onClick={() => setSelectedId(person.id)}>แก้ไข</button>
                </div>
              )
            })}
          </div>
        </section>

        <section className="admin2-panel admin2-settings">
          <div><small>SYSTEM</small><h2>ตั้งค่าหน้าจอ</h2></div>
          <label>กลับหน้าแรกเมื่อไม่มีการใช้งาน (วินาที)<input type="number" min="15" max="3600" value={Math.round(settings.resetMs / 1000)} onChange={e => setSettingsState({ ...settings, resetMs: Math.max(15000, Number(e.target.value || 90) * 1000) })} /></label>
          <label className="admin2-check"><input type="checkbox" checked={settings.qrEnabled !== false} onChange={e => setSettingsState({ ...settings, qrEnabled: e.target.checked })} /> แสดง QR Code</label>
          <button className="admin2-primary" onClick={() => { saveSettings(settings); flash('บันทึก Settings แล้ว') }}><Save size={18} /> บันทึก Settings</button>
        </section>

        <section className="admin2-panel admin2-tools">
          <div><small>LOCAL BACKUP</small><h2>สำรองและกู้คืน</h2><p>Backup รวม Published, Draft, Settings และรูปที่อัปโหลดในเครื่อง</p></div>
          <button className="admin2-ghost" onClick={backup}><Download size={18} /> Export Backup</button>
          <label className="admin2-ghost admin2-file"><Upload size={18} /> Restore Backup<input hidden type="file" accept="application/json" onChange={restore} /></label>
          <button className="admin2-danger" onClick={factoryReset}><RotateCcw size={18} /> Factory Content</button>
        </section>
      </section>

      {toast && <div className="admin2-toast">{toast}</div>}

      {showExhibitConfirm && (
        <ConfirmModal title="พร้อมเปิดหน้าจอจัดแสดง?" confirmLabel="ยืนยันและเปิด Exhibit" onClose={() => setShowExhibitConfirm(false)} onConfirm={openExhibit}>
          <div className="admin2-exhibit-check">
            <div><span>Published</span><b>{published}</b></div>
            <div><span>Draft Changes</span><b>{draftCount}</b></div>
            <div><span>Hidden</span><b>{hidden}</b></div>
          </div>
          {draftCount > 0 ? <p className="admin2-warning">มี {draftCount} รายการที่ยังไม่เผยแพร่ หน้า Exhibit จะยังใช้เวอร์ชัน Published เดิมของรายการเหล่านั้น</p> : <p>ไม่มี Draft ค้าง หน้า Exhibit พร้อมใช้งาน</p>}
        </ConfirmModal>
      )}
    </main>
  )
}
