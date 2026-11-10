/**
 * Login für den Admin-Bereich: Passwortprüfung auf dem Server, signiertes
 * Sitzungs-Cookie (HttpOnly, SameSite=Strict), CSRF-Token und Sperre nach Fehlversuchen.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  ADMIN_PASSWORD,
  isProduction,
  LOGIN_LOCK_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  SESSION_HOURS,
  SESSION_SECRET,
} from './config.ts'

const COOKIE = 'tbb_admin'

const sign = (value: string) => createHmac('sha256', SESSION_SECRET).update(value).digest('base64url')

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkPassword(password: unknown): boolean {
  if (!ADMIN_PASSWORD || typeof password !== 'string') return false
  return safeEqual(password, ADMIN_PASSWORD)
}

// --- Sitzung ---------------------------------------------------------------------
interface Session {
  id: string
  expires: number
}

function readCookie(req: IncomingMessage, name: string): string | null {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export function getSession(req: IncomingMessage): Session | null {
  const raw = readCookie(req, COOKIE)
  if (!raw) return null
  const [id, expires, sig] = raw.split('.')
  if (!id || !expires || !sig) return null
  if (!safeEqual(sig, sign(`${id}.${expires}`))) return null
  const exp = Number(expires)
  if (!Number.isFinite(exp) || exp < Date.now()) return null
  return { id, expires: exp }
}

/** CSRF-Token ist an die Sitzung gebunden – muss bei Änderungen im Header mitkommen. */
export const csrfFor = (session: Session) => sign(`csrf.${session.id}`)

export function startSession(res: ServerResponse): Session {
  const id = randomBytes(18).toString('base64url')
  const expires = Date.now() + SESSION_HOURS * 3600_000
  const value = `${id}.${expires}.${sign(`${id}.${expires}`)}`
  res.setHeader('Set-Cookie', cookie(value, SESSION_HOURS * 3600))
  return { id, expires }
}

export function endSession(res: ServerResponse): void {
  res.setHeader('Set-Cookie', cookie('', 0))
}

function cookie(value: string, maxAge: number): string {
  return [
    `${COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    isProduction ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

/** Angemeldet + passendes CSRF-Token + gleiche Herkunft? */
export function isAuthorizedWrite(req: IncomingMessage): boolean {
  const session = getSession(req)
  if (!session) return false
  const token = req.headers['x-csrf-token']
  if (typeof token !== 'string' || !safeEqual(token, csrfFor(session))) return false
  // Herkunft prüfen (gegen fremde Seiten). Hinter Proxys (Railway, Vite) steht der
  // ursprüngliche Host in X-Forwarded-Host.
  const origin = req.headers.origin
  if (origin) {
    const forwarded = req.headers['x-forwarded-host']
    const hosts = [req.headers.host, ...(typeof forwarded === 'string' ? forwarded.split(',') : [])]
      .filter((h): h is string => Boolean(h))
      .map((h) => h.trim().toLowerCase())
    try {
      if (!hosts.includes(new URL(origin).host.toLowerCase())) return false
    } catch {
      return false
    }
  }
  return true
}

// --- Sperre nach Fehlversuchen (nur im Speicher, gehashte IP) ---------------------------
const attempts = new Map<string, { count: number; until: number }>()

export function clientKey(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : '') || req.socket.remoteAddress || '?'
  return createHash('sha256').update(ip.trim()).digest('hex').slice(0, 16)
}

export function isLocked(key: string): boolean {
  const entry = attempts.get(key)
  return Boolean(entry && entry.count >= MAX_LOGIN_ATTEMPTS && entry.until > Date.now())
}

export function registerFailure(key: string): void {
  const entry = attempts.get(key)
  const until = Date.now() + LOGIN_LOCK_MINUTES * 60_000
  attempts.set(key, { count: (entry && entry.until > Date.now() ? entry.count : 0) + 1, until })
}

export const clearFailures = (key: string) => attempts.delete(key)
