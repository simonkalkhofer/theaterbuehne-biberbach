/**
 * Prüft und bereinigt Inhalte, bevor sie gespeichert werden (Server-seitig,
 * damit auch manipulierte Anfragen nur saubere Daten ablegen können).
 */
import { IMAGE_NAME } from './storage.ts'

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const id = (v: unknown, fallback: string) => {
  const s = str(v, 64)
  return /^[A-Za-z0-9_-]+$/.test(s) ? s : fallback
}
const image = (v: unknown) => (typeof v === 'string' && IMAGE_NAME.test(v) ? v : '')
const list = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : [])
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

export interface CleanSite {
  version: 1
  members: {
    id: string
    name: string
    photo: string
    board: boolean
    role: string
    email: string
  }[]
  plays: {
    id: string
    year: number
    title: string
    description: string
    photos: string[]
    credits: { role: string; name: string; group: 'cast' | 'crew' }[]
  }[]
}

export function cleanSite(input: unknown): CleanSite | null {
  const data = obj(input)
  if (!Array.isArray(data.members) || !Array.isArray(data.plays)) return null

  return {
    version: 1,
    members: list(data.members, 500).map((raw, i) => {
      const m = obj(raw)
      return {
        id: id(m.id, `m${i}`),
        name: str(m.name, 80),
        photo: image(m.photo),
        board: m.board === true,
        role: str(m.role, 60),
        email: str(m.email, 120),
      }
    }),
    plays: list(data.plays, 500).map((raw, i) => {
      const p = obj(raw)
      const year = Number(p.year)
      return {
        id: id(p.id, `p${i}`),
        year: Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : new Date().getFullYear(),
        title: str(p.title, 120),
        description: str(p.description, 8000),
        photos: list(p.photos, 60).map(image).filter(Boolean),
        credits: list(p.credits, 100)
          .map((c) => {
            const o = obj(c)
            return {
              role: str(o.role, 80),
              name: str(o.name, 80),
              group: o.group === 'crew' ? ('crew' as const) : ('cast' as const),
            }
          })
          .filter((c) => c.role || c.name),
      }
    }),
  }
}

/** Alle in den Inhalten verwendeten Bilddateien */
export function usedImages(site: CleanSite): Set<string> {
  const used = new Set<string>()
  for (const m of site.members) if (m.photo) used.add(m.photo)
  for (const p of site.plays) for (const f of p.photos) used.add(f)
  return used
}

/** Bildtyp anhand der ersten Bytes (nicht nur anhand des Headers) erkennen */
export function detectImage(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'png'
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}
