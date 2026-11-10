/**
 * Bild-Speicher für die Galerien der Theaterstücke (IndexedDB).
 *
 * localStorage fasst nur ~5 MB – zu wenig für mehrere Fotos pro Stück.
 * IndexedDB bietet deutlich mehr Platz. Wie localStorage gilt auch dieser
 * Speicher nur für den eigenen Browser auf dem eigenen Gerät.
 */
import { uid } from './store'

const DB_NAME = 'tbb-images'
const STORE = 'images'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('Bilder können in diesem Browser nicht gespeichert werden.'))
        return
      }
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(new Error('Der Bild-Speicher konnte nicht geöffnet werden.'))
    })
    dbPromise.catch(() => {
      dbPromise = null
    })
  }
  return dbPromise
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        tx.oncomplete = () => resolve(req ? req.result : (undefined as T))
        tx.onerror = () => {
          const full = tx.error?.name === 'QuotaExceededError'
          reject(new Error(full ? 'Der Bild-Speicher ist voll.' : 'Bild-Speicher: Vorgang fehlgeschlagen.'))
        }
        tx.onabort = tx.onerror
      }),
  )
}

export async function putImage(blob: Blob, id: string = uid()): Promise<string> {
  await run('readwrite', (s) => s.put(blob, id))
  return id
}

export async function getImage(id: string): Promise<Blob | undefined> {
  try {
    return await run<Blob | undefined>('readonly', (s) => s.get(id))
  } catch {
    return undefined
  }
}

export async function deleteImages(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await run('readwrite', (s) => {
    for (const id of ids) s.delete(id)
  })
}

export async function allImageIds(): Promise<string[]> {
  try {
    return (await run<IDBValidKey[]>('readonly', (s) => s.getAllKeys())).map(String)
  } catch {
    return []
  }
}

export async function clearImages(): Promise<void> {
  try {
    await run('readwrite', (s) => s.clear())
  } catch {
    // nichts zu löschen
  }
}

/** Löscht alle Bilder, die von keinem Stück mehr verwendet werden. */
export async function removeUnusedImages(usedIds: Iterable<string>): Promise<void> {
  const used = new Set(usedIds)
  const unused = (await allImageIds()).filter((id) => !used.has(id))
  await deleteImages(unused)
}

// --- Hilfen für Export/Import -----------------------------------------------------
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Bild konnte nicht gelesen werden.'))
    reader.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob()
}

/** Objekt-URL für ein gespeichertes Bild (oder null, wenn es fehlt). */
export async function imageUrl(id: string): Promise<string | null> {
  const blob = await getImage(id)
  return blob ? URL.createObjectURL(blob) : null
}
