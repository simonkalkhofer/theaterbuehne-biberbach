# Veröffentlichen auf Railway

Die Webseite läuft als **ein** Railway-Service: Ein kleiner Node-Server (`server/`) liefert die
Seiten aus und speichert alles, was im Admin-Bereich geändert wird – für alle Besucher sichtbar.

## Einmalig einrichten

1. **Projekt anlegen:** Railway → *New Project* → *Deploy from GitHub repo* →
   `simonkalkhofer/theaterbuehne-biberbach` auswählen. Railway erkennt Node.js automatisch und nutzt
   `railway.json` (Build: `npm run build`, Start: `npm start`).

2. **Volume anlegen (wichtig!)** – ohne Volume gehen Daten und Bilder bei jedem Update verloren:
   Service → *Settings* bzw. Rechtsklick → *Attach Volume* → **Mount Path: `/data`**.

3. **Variablen setzen:** Service → *Variables*:

   | Variable | Wert |
   |---|---|
   | `DATA_DIR` | `/data` |
   | `ADMIN_PASSWORD` | ein **neues, sicheres** Passwort (nicht `theater123`) |
   | `SESSION_SECRET` | langer Zufallswert, z. B. von *Generate* in Railway oder 64 beliebige Zeichen |

   Ohne `ADMIN_PASSWORD` ist der Admin-Login gesperrt (sicherer Standard).

4. **Domain:** Service → *Settings* → *Networking* → *Generate Domain* (oder eigene Domain verbinden).
   Railway stellt automatisch HTTPS bereit.

## Danach

- **Inhalte pflegen:** `https://<domain>/admin.html` (Link „Admin“ unten in der Fußzeile).
  „Speichern“ wirkt sofort für alle Besucher.
- **Neue Version der Webseite:** Code auf GitHub pushen → Railway baut und startet automatisch neu.
  Inhalte und Bilder im Volume bleiben erhalten.
- **Sicherungen:** Bei jedem Speichern legt der Server eine Kopie in `/data/backups/` an (die letzten 30).
  Zusätzlich im Admin „Daten exportieren“ für eine Kopie auf dem eigenen Computer.
  Railway bietet außerdem Volume-Backups an (Volume → *Backups*).

## Was liegt wo (im Volume `/data`)

| Pfad | Inhalt |
|---|---|
| `site.json` | alle Inhalte (Mitglieder, Stücke, Texte, Rollen) |
| `backups/` | Sicherungskopien |
| `bilder/` | hochgeladene Fotos (zufällige Dateinamen) |

## Lokal testen

```bash
npm install
npm run dev:server   # API + Speicher (Daten in .devdata/, Passwort: theater123)
npm run dev          # Webseite mit Live-Neuladen, leitet /api an den Server weiter
```

In PowerShell `npm.cmd` statt `npm` verwenden. Fertigen Stand wie auf Railway testen:
`npm run build` und dann `npm start` → http://localhost:3000
