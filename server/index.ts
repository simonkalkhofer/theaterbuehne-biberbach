/**
 * Server der Theaterbühne-Webseite (für Railway, läuft auch lokal).
 *
 * - liefert die fertige Webseite aus dist/ aus
 * - /api/…  Inhalte lesen/speichern, Login, Bild-Upload
 *
 * Start:  npm start            (vorher npm run build)
 * Lokal:  npm run dev:server   (zusammen mit npm run dev – Vite leitet /api hierher weiter)
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'
import {
  checkPassword,
  clearFailures,
  clientKey,
  csrfFor,
  endSession,
  getSession,
  isAuthorizedWrite,
  isLocked,
  registerFailure,
  startSession,
} from './auth.ts'
import { ADMIN_PASSWORD, DATA_DIR, DIST_DIR, isProduction, MAX_JSON_BYTES, MAX_UPLOAD_BYTES, PORT } from './config.ts'
import { IMAGE_NAME, IMAGES, initStorage, readSite, removeUnusedImages, saveImage, writeSite } from './storage.ts'
import { cleanSite, detectImage, usedImages } from './validate.ts'

// --- Hilfen ---------------------------------------------------------------------------
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

const fail = (res: ServerResponse, status: number, error: string) => sendJson(res, status, { ok: false, error })

class TooLarge extends Error {}

function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > limit) {
        reject(new TooLarge())
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  return JSON.parse((await readBody(req, MAX_JSON_BYTES)).toString('utf8'))
}

// --- API ------------------------------------------------------------------------------
async function handleApi(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
  const method = req.method ?? 'GET'

  // Inhalte für alle Besucher
  if (path === '/api/data' && method === 'GET') {
    const site = await readSite()
    return sendJson(res, 200, { ok: true, data: site })
  }

  // Inhalte speichern (nur Admin)
  if (path === '/api/data' && method === 'PUT') {
    if (!isAuthorizedWrite(req)) return fail(res, 401, 'Bitte neu anmelden.')
    const clean = cleanSite(await readJson(req))
    if (!clean) return fail(res, 400, 'Ungültige Daten.')
    const savedAt = await writeSite(clean)
    void removeUnusedImages(usedImages(clean)).catch(() => {})
    return sendJson(res, 200, { ok: true, savedAt, data: clean })
  }

  // Login-Status + CSRF-Token
  if (path === '/api/session' && method === 'GET') {
    const session = getSession(req)
    return sendJson(res, 200, {
      ok: true,
      loggedIn: Boolean(session),
      csrf: session ? csrfFor(session) : null,
      configured: Boolean(ADMIN_PASSWORD),
    })
  }

  if (path === '/api/login' && method === 'POST') {
    const key = clientKey(req)
    if (isLocked(key)) return fail(res, 429, 'Zu viele Fehlversuche – bitte in 15 Minuten erneut versuchen.')
    if (!ADMIN_PASSWORD) return fail(res, 503, 'Admin-Passwort ist auf dem Server nicht eingerichtet (ADMIN_PASSWORD).')
    const body = (await readJson(req)) as { password?: unknown }
    if (!checkPassword(body?.password)) {
      registerFailure(key)
      await new Promise((r) => setTimeout(r, 600)) // bremst Durchprobieren
      return fail(res, 401, 'Falsches Passwort.')
    }
    clearFailures(key)
    const session = startSession(res)
    return sendJson(res, 200, { ok: true, csrf: csrfFor(session) })
  }

  if (path === '/api/logout' && method === 'POST') {
    endSession(res)
    return sendJson(res, 200, { ok: true })
  }

  // Bild hochladen (nur Admin): Rohdaten im Body, Typ wird an den Bytes erkannt
  if (path === '/api/images' && method === 'POST') {
    if (!isAuthorizedWrite(req)) return fail(res, 401, 'Bitte neu anmelden.')
    const buf = await readBody(req, MAX_UPLOAD_BYTES)
    const ext = detectImage(buf)
    if (!ext) return fail(res, 415, 'Nur JPG, PNG oder WebP erlaubt.')
    const name = await saveImage(buf, ext)
    return sendJson(res, 201, { ok: true, name })
  }

  // Bild ausliefern
  const img = /^\/api\/images\/([^/]+)$/.exec(path)
  if (img && method === 'GET') {
    const name = img[1] ?? ''
    if (!IMAGE_NAME.test(name)) return fail(res, 404, 'Nicht gefunden.')
    return serveFile(res, join(IMAGES, name), 'public, max-age=31536000, immutable')
  }

  return fail(res, 404, 'Unbekannte Adresse.')
}

// --- Statische Webseite ---------------------------------------------------------------
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

async function serveFile(res: ServerResponse, file: string, cache: string): Promise<void> {
  try {
    const info = await stat(file)
    if (!info.isFile()) throw new Error('kein File')
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': cache,
    })
    createReadStream(file).pipe(res)
  } catch {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Seite nicht gefunden.')
  }
}

async function handleStatic(res: ServerResponse, path: string): Promise<void> {
  let rel = decodeURIComponent(path)
  if (rel === '/' || rel === '') rel = '/index.html'
  const file = normalize(join(DIST_DIR, rel))
  // nichts außerhalb von dist/ ausliefern
  if (!file.startsWith(DIST_DIR + sep)) {
    res.writeHead(400).end()
    return
  }
  const cache = rel.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
  return serveFile(res, file, cache)
}

// --- Start ---------------------------------------------------------------------------
await initStorage()

createServer(async (req, res) => {
  try {
    const path = new URL(req.url ?? '/', 'http://x').pathname
    if (path.startsWith('/api/')) await handleApi(req, res, path)
    else if (req.method === 'GET' || req.method === 'HEAD') await handleStatic(res, path)
    else fail(res, 405, 'Methode nicht erlaubt.')
  } catch (err) {
    if (err instanceof TooLarge) return fail(res, 413, 'Datei oder Daten zu groß.')
    if (err instanceof SyntaxError) return fail(res, 400, 'Ungültige Daten.')
    console.error(err)
    if (!res.headersSent) fail(res, 500, 'Serverfehler.')
  }
}).listen(PORT, () => {
  console.log(`Theaterbühne-Server läuft auf Port ${PORT} (${isProduction ? 'Produktion' : 'lokal'})`)
  console.log(`Daten: ${DATA_DIR}`)
  if (!ADMIN_PASSWORD) console.warn('ACHTUNG: ADMIN_PASSWORD fehlt – Admin-Login ist gesperrt.')
})
