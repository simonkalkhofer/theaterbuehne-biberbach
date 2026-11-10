/**
 * Dauerhafte Ablage im Datenordner (auf Railway: Volume).
 *
 *   site.json      alle Inhalte (Mitglieder, Stücke)
 *   backups/       Sicherungskopie bei jedem Speichern (die letzten MAX_BACKUPS)
 *   bilder/        hochgeladene Bilder (zufällige Dateinamen)
 *
 * Wer später eine Datenbank (z. B. Postgres) will, ersetzt nur diese Datei.
 */
import { randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DATA_DIR, MAX_BACKUPS } from './config.ts'

const SITE = join(DATA_DIR, 'site.json')
const BACKUPS = join(DATA_DIR, 'backups')
export const IMAGES = join(DATA_DIR, 'bilder')

export async function initStorage(): Promise<void> {
  await mkdir(BACKUPS, { recursive: true })
  await mkdir(IMAGES, { recursive: true })
}

export async function readSite(): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(SITE, 'utf8'))
  } catch {
    return null
  }
}

async function writeAtomic(path: string, content: string | Buffer): Promise<void> {
  const tmp = `${path}.tmp-${randomBytes(4).toString('hex')}`
  await writeFile(tmp, content)
  await rename(tmp, path)
}

export async function writeSite(data: unknown): Promise<string> {
  const json = JSON.stringify(data, null, 1)
  await writeAtomic(SITE, json)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await writeFile(join(BACKUPS, `site-${stamp}.json`), json)
  await pruneBackups()
  return new Date().toISOString()
}

async function pruneBackups(): Promise<void> {
  const files = (await readdir(BACKUPS)).filter((f) => f.startsWith('site-')).sort()
  await Promise.all(files.slice(0, Math.max(0, files.length - MAX_BACKUPS)).map((f) => unlink(join(BACKUPS, f))))
}

// --- Bilder ---------------------------------------------------------------------------
export const IMAGE_NAME = /^[a-f0-9]{32}\.(jpg|png|webp)$/

export async function saveImage(buffer: Buffer, ext: 'jpg' | 'png' | 'webp'): Promise<string> {
  const name = `${randomBytes(16).toString('hex')}.${ext}`
  await writeAtomic(join(IMAGES, name), buffer)
  return name
}

export async function imageExists(name: string): Promise<boolean> {
  if (!IMAGE_NAME.test(name)) return false
  try {
    return (await stat(join(IMAGES, name))).isFile()
  } catch {
    return false
  }
}

/**
 * Löscht Bilder, die in keinem gespeicherten Inhalt mehr vorkommen.
 * Ganz frische Uploads (< 1 Stunde) bleiben verschont – sie gehören evtl. zu
 * einem Formular, das gerade noch bearbeitet und erst gleich gespeichert wird.
 */
export async function removeUnusedImages(used: Set<string>): Promise<number> {
  const now = Date.now()
  let removed = 0
  for (const name of await readdir(IMAGES)) {
    if (!IMAGE_NAME.test(name) || used.has(name)) continue
    const info = await stat(join(IMAGES, name))
    if (now - info.mtimeMs < 3600_000) continue
    await unlink(join(IMAGES, name))
    removed++
  }
  return removed
}
