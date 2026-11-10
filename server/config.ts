/**
 * Einstellungen des Servers – alles über Umgebungsvariablen (auf Railway: „Variables“).
 *
 *   PORT            Port (setzt Railway automatisch)
 *   DATA_DIR        Speicherort für Daten + Bilder. Auf Railway: Pfad des Volumes, z. B. /data
 *                   (ohne Volume gehen Daten bei jedem Neustart verloren!)
 *   ADMIN_PASSWORD  Passwort für den Admin-Bereich (Pflicht im Betrieb)
 *   SESSION_SECRET  Langer Zufallswert zum Signieren der Login-Cookies (Pflicht im Betrieb)
 *   NODE_ENV        „production“ auf Railway
 */
import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'

const env = process.env

export const isProduction = env.NODE_ENV === 'production' || Boolean(env.RAILWAY_ENVIRONMENT)

export const PORT = Number(env.PORT) || 3000

/** Lokal: Projekt/.devdata – auf Railway: das Volume (DATA_DIR) */
export const DATA_DIR = resolve(env.DATA_DIR || '.devdata')

/** Fertig gebaute Webseite (npm run build) */
export const DIST_DIR = resolve('dist')

/**
 * Admin-Passwort. Lokal zum Testen „theater123“, im Betrieb NUR über ADMIN_PASSWORD –
 * fehlt es dort, ist der Login gesperrt (sicherer Standard).
 */
export const ADMIN_PASSWORD: string | null = env.ADMIN_PASSWORD || (isProduction ? null : 'theater123')

/** Ohne SESSION_SECRET: zufällig pro Start (Admin muss sich nach Neustart neu anmelden). */
export const SESSION_SECRET = env.SESSION_SECRET || randomBytes(32).toString('hex')

export const SESSION_HOURS = 8
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const MAX_JSON_BYTES = 2 * 1024 * 1024
export const MAX_BACKUPS = 30
export const MAX_LOGIN_ATTEMPTS = 5
export const LOGIN_LOCK_MINUTES = 15
