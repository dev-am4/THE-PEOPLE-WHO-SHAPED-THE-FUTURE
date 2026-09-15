const DRAFTS_KEY = 'tpwsf.drafts.v1'

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function loadDraftMap() {
  if (!canUseStorage()) return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFTS_KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveDraftMap(map) {
  if (!canUseStorage()) return
  window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(map || {}))
  window.dispatchEvent(new CustomEvent('tpwsf-draft-change'))
}

export function savePersonDraft(person) {
  const map = loadDraftMap()
  map[person.id] = { ...person, draftUpdatedAt: new Date().toISOString() }
  saveDraftMap(map)
  return map
}

export function clearPersonDraft(id) {
  const map = loadDraftMap()
  delete map[id]
  saveDraftMap(map)
  return map
}

export function clearAllDrafts() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(DRAFTS_KEY)
  window.dispatchEvent(new CustomEvent('tpwsf-draft-change'))
}
