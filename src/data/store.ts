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
  description: string
  photo: string
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

const member = (name: string, board = false, role = '', email = ''): Member => ({
  id: uid(),
  name,
  photo: '',
  board,
  role,
  email,
})

const play = (year: number, title: string): Play => ({
  id: uid(),
  year,
  title,
  description: '',
  photo: '',
})

/** Standarddaten – Platzhalter für Vorstand/Mitglieder, echte Stücke fürs Archiv. */
export function defaultData(): SiteData {
  return {
    version: 1,
    members: [
      member('Name folgt', true, '1. Vorstand'),
      member('Name folgt', true, '2. Vorstand'),
      member('Name folgt', true, 'Kassier/in'),
      member('Name folgt', true, 'Schriftführer/in'),
      member('Mitglied 1'),
      member('Mitglied 2'),
      member('Mitglied 3'),
      member('Mitglied 4'),
      member('Mitglied 5'),
      member('Mitglied 6'),
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
      photo: typeof p.photo === 'string' ? p.photo : '',
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

export function parseImport(text: string): SiteData {
  const parsed: unknown = JSON.parse(text)
  if (!isSiteData(parsed)) throw new Error('Die Datei enthält keine gültigen Webseiten-Daten.')
  return normalize(parsed)
}

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
