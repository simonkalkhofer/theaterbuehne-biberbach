/**
 * Datenspeicher der Webseite.
 *
 * Mitglieder und Theaterstücke werden im localStorage des Browsers gespeichert.
 * Ist dort (noch) nichts gespeichert, werden die Standarddaten unten verwendet.
 * Wichtig: localStorage gilt nur für DIESEN Browser auf DIESEM Gerät.
 */

export interface Member {
  id: string
  name: string
  /** Foto als Data-URL (verkleinertes JPEG) oder leer */
  photo: string
  /** gehört zum Vorstand */
  board: boolean
  /** Funktion im Vorstand, z. B. „1. Vorstand“ */
  role: string
  /** Kontaktadresse (E-Mail) – nur beim Vorstand angezeigt */
  email: string
}

export interface Play {
  id: string
  year: number
  title: string
  /** Text zum Stück – wird erst auf der Detailseite angezeigt */
  description: string
  /** IDs der Galerie-Bilder im Bild-Speicher (IndexedDB), in Anzeigereihenfolge */
  photos: string[]
}

/** Datei-Format für Export/Import: Daten + Galerie-Bilder als Data-URLs */
export interface ExportFile extends SiteData {
  images?: Record<string, string>
}

export interface SiteData {
  version: 1
  members: Member[]
  plays: Play[]
}

const STORAGE_KEY = 'tbb-data-v1'
export const CHANGE_EVENT = 'tbb:data-changed'

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

// Standarddaten haben feste IDs, damit Links (z. B. stueck.html?id=…) stabil bleiben.
const member = (id: string, name: string, board = false, role = '', email = ''): Member => ({
  id,
  name,
  photo: '',
  board,
  role,
  email,
})

const play = (year: number, title: string): Play => ({
  id: `stueck-${year}`,
  year,
  title,
  description: '',
  photos: [],
})

/** Standarddaten – Platzhalter für Vorstand/Mitglieder, echte Stücke fürs Archiv. */
export function defaultData(): SiteData {
  return {
    version: 1,
    members: [
      member('vorstand-1', 'Name folgt', true, '1. Vorstand'),
      member('vorstand-2', 'Name folgt', true, '2. Vorstand'),
      member('vorstand-3', 'Name folgt', true, 'Kassier/in'),
      member('vorstand-4', 'Name folgt', true, 'Schriftführer/in'),
      ...[1, 2, 3, 4, 5, 6].map((n) => member(`mitglied-${n}`, `Mitglied ${n}`)),
    ],
    plays: [
      play(2015, 'Alptraum einer Schwiegermutter'),
      play(2016, 'Alibi Bauernhof'),
      play(2017, 'Männerwirtschaft'),
      play(2018, 'Gedächtnislücke'),
      play(2019, 'Opa rockt das Altersheim'),
      play(2023, 'Natur Pur'),
      play(2025, 'Letzte Rettung - Erste Hilfe'),
    ],
  }
}

function isSiteData(value: unknown): value is SiteData {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<SiteData>
  return Array.isArray(v.members) && Array.isArray(v.plays)
}

/** Normalisiert Daten (z. B. aus einem Import), damit fehlende Felder nicht stören. */
export function normalize(value: SiteData): SiteData {
  return {
    version: 1,
    members: value.members.map((m) => ({
      id: String(m.id || uid()),
      name: String(m.name ?? '').trim(),
      photo: typeof m.photo === 'string' ? m.photo : '',
      board: Boolean(m.board),
      role: String(m.role ?? '').trim(),
      email: String(m.email ?? '').trim(),
    })),
    plays: value.plays.map((p) => ({
      id: String(p.id || uid()),
      year: Number(p.year) || new Date().getFullYear(),
      title: String(p.title ?? '').trim(),
      description: String(p.description ?? '').trim(),
      photos: Array.isArray(p.photos) ? p.photos.filter((x): x is string => typeof x === 'string') : [],
    })),
  }
}

export function loadData(): SiteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isSiteData(parsed)) return normalize(parsed)
    }
  } catch {
    // localStorage nicht verfügbar oder Daten beschädigt → Standarddaten
  }
  return defaultData()
}

/** Speichert die Daten. Wirft einen Fehler, wenn der Speicher voll/nicht verfügbar ist. */
export function saveData(data: SiteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    const full = err instanceof DOMException && err.name === 'QuotaExceededError'
    throw new Error(
      full
        ? 'Der Browser-Speicher ist voll. Bitte kleinere oder weniger Fotos verwenden.'
        : 'Speichern ist in diesem Browser nicht möglich (z. B. privates Fenster).',
      { cause: err },
    )
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function resetData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignorieren
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function parseImport(text: string): { data: SiteData; images: Record<string, string> } {
  const parsed: unknown = JSON.parse(text)
  if (!isSiteData(parsed)) throw new Error('Die Datei enthält keine gültigen Webseiten-Daten.')
  const raw = (parsed as ExportFile).images
  const images: Record<string, string> = {}
  if (raw && typeof raw === 'object') {
    for (const [id, url] of Object.entries(raw)) {
      if (typeof url === 'string' && /^data:image\/(jpeg|png|webp);base64,/i.test(url)) images[id] = url
    }
  }
  return { data: normalize(parsed), images }
}

export const findPlay = (data: SiteData, id: string | null): Play | undefined =>
  id ? data.plays.find((p) => p.id === id) : undefined

export const playUrl = (p: Play): string => `stueck.html?id=${encodeURIComponent(p.id)}`

/** Ruft `render` auf, wenn sich die Daten ändern – auch in anderen Tabs. */
export function onDataChange(render: () => void): void {
  window.addEventListener(CHANGE_EVENT, render)
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === STORAGE_KEY) render()
  })
}

/** Stücke absteigend nach Jahr (neuestes zuerst). */
export const playsByYear = (plays: Play[], dir: 'asc' | 'desc' = 'desc'): Play[] =>
  [...plays].sort((a, b) => (dir === 'desc' ? b.year - a.year : a.year - b.year))
