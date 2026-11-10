/**
 * Verbindung zum Server (server/index.ts): Inhalte laden/speichern, Login, Bilder.
 * Alle Adressen relativ, damit die Seite in jedem Ordner funktioniert.
 */

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let csrf: string | null = null

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (csrf && init.method && init.method !== 'GET') headers.set('X-CSRF-Token', csrf)
  let res: Response
  try {
    res = await fetch(`api/${path}`, { ...init, headers, credentials: 'same-origin', cache: 'no-store' })
  } catch {
    throw new ApiError('Server nicht erreichbar. Bitte Internetverbindung prüfen.', 0)
  }
  let body: { ok?: boolean; error?: string } & Record<string, unknown> = {}
  try {
    body = await res.json()
  } catch {
    // keine JSON-Antwort (z. B. Server läuft nicht) → Fehler unten
  }
  if (!res.ok || body.ok === false) {
    if (res.status === 401) csrf = null
    throw new ApiError(body.error || `Serverfehler (${res.status})`, res.status)
  }
  return body as T
}

// --- Inhalte ------------------------------------------------------------------------
/** Gespeicherte Inhalte vom Server – null, wenn noch nie gespeichert wurde. */
export async function fetchSite(): Promise<unknown | null> {
  const body = await request<{ data: unknown | null }>('data')
  return body.data
}

export async function saveSite(data: unknown): Promise<unknown> {
  const body = await request<{ data: unknown }>('data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return body.data
}

// --- Login --------------------------------------------------------------------------
export async function getSession(): Promise<{ loggedIn: boolean; configured: boolean }> {
  const body = await request<{ loggedIn: boolean; csrf: string | null; configured: boolean }>('session')
  csrf = body.csrf
  return { loggedIn: body.loggedIn, configured: body.configured }
}

export async function login(password: string): Promise<void> {
  const body = await request<{ csrf: string }>('login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  csrf = body.csrf
}

export async function logout(): Promise<void> {
  await request('logout', { method: 'POST' })
  csrf = null
}

// --- Bilder -------------------------------------------------------------------------
/** Lädt ein (bereits verkleinertes) Bild hoch und gibt den Dateinamen auf dem Server zurück. */
export async function uploadImage(blob: Blob): Promise<string> {
  const body = await request<{ name: string }>('images', {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'application/octet-stream' },
    body: blob,
  })
  return body.name
}

/** Vom Server vergebene Bildnamen, z. B. „3f2a…e1.jpg“ */
export const isImageName = (value: string): boolean => /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(value)

/** Adresse eines hochgeladenen Bildes */
export const imageSrc = (name: string): string => `api/images/${encodeURIComponent(name)}`
