const CONTENT_KEY = 'tpwsf.content.v1'
const SETTINGS_KEY = 'tpwsf.settings.v1'
const PIN_KEY = 'tpwsf.admin.pin.v1'
const DB_NAME = 'tpwsf-local-cms'
const DB_VERSION = 1
const MEDIA_STORE = 'media'

export const DEFAULT_SETTINGS = {
  resetMs: 90000,
  qrEnabled: true,
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function normalizePeople(defaultPeople = []) {
  return defaultPeople.map((person, index) => ({
    ...person,
    status: person.status || 'published',
    sortOrder: Number.isFinite(person.sortOrder) ? person.sortOrder : index,
    works: Array.isArray(person.works) ? person.works : [],
  }))
}

export function loadPeople(defaultPeople = []) {
  const fallback = normalizePeople(defaultPeople)
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(CONTENT_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fallback
    return parsed
      .map((person, index) => ({ ...person, sortOrder: Number.isFinite(person.sortOrder) ? person.sortOrder : index }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    return fallback
  }
}

export function savePeople(list) {
  if (!canUseStorage()) return
  const normalized = list.map((person, index) => ({ ...person, sortOrder: index }))
  window.localStorage.setItem(CONTENT_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent('tpwsf-content-change'))
}

export function getPublishedPeople(defaultPeople = []) {
  return loadPeople(defaultPeople).filter(person => person.status === 'published')
}

export function loadSettings() {
  if (!canUseStorage()) return { ...DEFAULT_SETTINGS }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  if (!canUseStorage()) return
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }))
  window.dispatchEvent(new CustomEvent('tpwsf-content-change'))
}

export function getPinHash() {
  return canUseStorage() ? window.localStorage.getItem(PIN_KEY) : null
}

export function setPinHash(hash) {
  if (canUseStorage()) window.localStorage.setItem(PIN_KEY, hash)
}

export async function hashPin(pin) {
  const bytes = new TextEncoder().encode(String(pin))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'))
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function saveMediaFile(id, file) {
  const dataUrl = await readAsDataUrl(file)
  return saveMediaData(id, dataUrl, file.name || id, file.type || '')
}

export async function saveMediaData(id, dataUrl, name = id, type = '') {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).put({ id, dataUrl, name, type, updatedAt: new Date().toISOString() })
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  return `local-media:${id}`
}

export async function getMediaDataUrl(id) {
  const db = await openDb()
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly')
    const request = tx.objectStore(MEDIA_STORE).get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return record?.dataUrl || null
}

export async function exportMedia() {
  const db = await openDb()
  const records = await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly')
    const request = tx.objectStore(MEDIA_STORE).getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
  db.close()
  return records
}

export async function importMedia(records = []) {
  if (!records.length) return
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    const store = tx.objectStore(MEDIA_STORE)
    records.forEach(record => store.put(record))
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function cachePortraitLocally(person) {
  if (!person?.portrait || person.portrait.startsWith('local-media:')) return person
  const response = await fetch(person.portrait, { cache: 'reload' })
  if (!response.ok) throw new Error(`โหลดรูป ${person.name} ไม่สำเร็จ (${response.status})`)
  const blob = await response.blob()
  const dataUrl = await readAsDataUrl(blob)
  const mediaId = `portrait-${person.id}`
  const portrait = await saveMediaData(mediaId, dataUrl, `${person.id}.jpg`, blob.type)
  return { ...person, portrait }
}

export async function createBackup(defaultPeople = []) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    people: loadPeople(defaultPeople),
    settings: loadSettings(),
    media: await exportMedia(),
  }
}

export async function restoreBackup(payload) {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.people)) throw new Error('รูปแบบไฟล์ Backup ไม่ถูกต้อง')
  savePeople(payload.people)
  saveSettings(payload.settings || DEFAULT_SETTINGS)
  await importMedia(Array.isArray(payload.media) ? payload.media : [])
}

export function resetLocalContent() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(CONTENT_KEY)
  window.localStorage.removeItem(SETTINGS_KEY)
  window.dispatchEvent(new CustomEvent('tpwsf-content-change'))
}
