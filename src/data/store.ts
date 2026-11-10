/**
 * Datenspeicher der Webseite.
 *
 * Inhalte liegen auf dem Server (server/, auf Railway im Volume) und sind für alle
 * Besucher gleich. Jede Seite ruft beim Laden `await initData()` auf; danach liefert
 * `loadData()` die Inhalte. Hat der Admin noch nie gespeichert oder ist der Server
 * nicht erreichbar, werden die Standarddaten unten verwendet.
 */
import { isImageName, saveSite, fetchSite } from './api'

export interface Member {
  id: string
  name: string
  /** Dateiname des Fotos auf dem Server (siehe imageSrc) oder leer */
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
  /** Dateinamen der Galerie-Bilder auf dem Server, in Anzeigereihenfolge */
  photos: string[]
  /** Rollen im Stück (cast) und Team hinter der Bühne (crew), z. B. Regie */
  credits: Credit[]
}

export interface Credit {
  /** Rolle im Stück („Opa Willi“) oder Aufgabe („Regie“) */
  role: string
  name: string
  group: 'cast' | 'crew'
}

export interface SiteData {
  version: 1
  members: Member[]
  plays: Play[]
}

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
  credits: [],
})

/** Feste ID aus dem Namen, z. B. „Sonja Soxberger“ → „sonja-soxberger“. */
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Vorstand in Reihenfolge der Funktionen (Anzeige: Vorname Nachname). */
const BOARD: [name: string, role: string][] = [
  ['Sonja Soxberger', 'Obfrau'],
  ['Thomas Teufel', 'Obfraustellvertreter'],
  ['Silvia Kalkhofer', 'Kassier'],
  ['Barbara Gassner', 'Kassierstellvertreter'],
  ['Petra Jesch', 'Schriftführer'],
  ['Helga Peschek', 'Schriftführerstellvertreter'],
]

const MEMBERS = [
  'Gertrude Aigner',
  'Thomas Bühringer',
  'Markus Edermayr',
  'Ernst Fehringer',
  'Rudolf Jesch',
  'Viktoria Kalkhofer',
  'Anton Kammerhofer',
  'Michaela Kammerhofer',
  'Robert Kößl',
  'Josef Leutgeb',
  'Anton Ördög',
  'Hilda Ördög',
  'Simon Peschek',
  'Manuela Raaber',
  'Günther Reisigner',
  'Franz Schörghuber',
  'Fabian Soxberger',
]

/** Standarddaten – Vorstand, Mitglieder und Stücke fürs Archiv. */
export function defaultData(): SiteData {
  return {
    version: 1,
    members: [
      ...BOARD.map(([name, role]) => member(slug(name), name, true, role)),
      ...MEMBERS.map((name) => member(slug(name), name)),
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
      photo: typeof m.photo === 'string' && isImageName(m.photo) ? m.photo : '',
      board: Boolean(m.board),
      role: String(m.role ?? '').trim(),
      email: String(m.email ?? '').trim(),
    })),
    plays: value.plays.map((p) => ({
      id: String(p.id || uid()),
      year: Number(p.year) || new Date().getFullYear(),
      title: String(p.title ?? '').trim(),
      description: String(p.description ?? '').trim(),
      photos: Array.isArray(p.photos)
        ? p.photos.filter((x): x is string => typeof x === 'string' && isImageName(x))
        : [],
      credits: Array.isArray(p.credits)
        ? p.credits
            .map((c) => ({
              role: String(c?.role ?? '').trim(),
              name: String(c?.name ?? '').trim(),
              group: c?.group === 'crew' ? ('crew' as const) : ('cast' as const),
            }))
            .filter((c) => c.role || c.name)
        : [],
    })),
  }
}

let current: SiteData | null = null

/** Inhalte vom Server laden (einmal pro Seitenaufruf). */
export async function initData(): Promise<SiteData> {
  try {
    const remote = await fetchSite()
    current = isSiteData(remote) ? upgradePlaceholderMembers(normalize(remote)) : defaultData()
  } catch {
    // Server nicht erreichbar (z. B. lokal nur „npm run dev“ ohne Server) → Standarddaten
    current = defaultData()
  }
  return current
}

/** Aktuelle Inhalte (nach initData). */
export function loadData(): SiteData {
  return current ?? defaultData()
}

/**
 * Wurden im Browser schon Daten gespeichert, als es nur Platzhalter-Mitglieder gab
 * („Name folgt“, „Mitglied 1“ …), werden diese durch die echten Mitglieder ersetzt.
 * Stücke, Texte und Bilder bleiben unverändert.
 */
function upgradePlaceholderMembers(data: SiteData): SiteData {
  const onlyPlaceholders =
    data.members.length > 0 && data.members.every((m) => /^(name folgt|mitglied \d+)$/i.test(m.name))
  return onlyPlaceholders ? { ...data, members: defaultData().members } : data
}

/** Nachname = letztes Wort des Namens (für alphabetische Sortierung). */
export const lastName = (name: string): string => name.trim().split(/\s+/).pop() ?? name

/** Sortiert nach Nachname, dann Vorname. */
export const byLastName = (a: { name: string }, b: { name: string }): number =>
  lastName(a.name).localeCompare(lastName(b.name), 'de') || a.name.localeCompare(b.name, 'de')

/**
 * Speichert die Inhalte auf dem Server (nur angemeldet möglich).
 * Danach sehen alle Besucher die neuen Inhalte. Wirft bei Fehlern.
 */
export async function saveData(data: SiteData): Promise<SiteData> {
  const saved = await saveSite(data)
  current = isSiteData(saved) ? normalize(saved) : data
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  return current
}

export function parseImport(text: string): SiteData {
  const parsed: unknown = JSON.parse(text)
  if (!isSiteData(parsed)) throw new Error('Die Datei enthält keine gültigen Webseiten-Daten.')
  return normalize(parsed)
}

export const findPlay = (data: SiteData, id: string | null): Play | undefined =>
  id ? data.plays.find((p) => p.id === id) : undefined

export const playUrl = (p: Play): string => `stueck.html?id=${encodeURIComponent(p.id)}`

/** Ruft `render` auf, wenn sich die Daten auf dieser Seite ändern. */
export function onDataChange(render: () => void): void {
  window.addEventListener(CHANGE_EVENT, render)
}

/** Stücke absteigend nach Jahr (neuestes zuerst). */
export const playsByYear = (plays: Play[], dir: 'asc' | 'desc' = 'desc'): Play[] =>
  [...plays].sort((a, b) => (dir === 'desc' ? b.year - a.year : a.year - b.year))
