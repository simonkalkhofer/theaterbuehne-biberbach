# Theaterbühne Biberbach – Webseite

Vereinswebseite der Theaterbühne Biberbach. Multi-Page-Website (fünf echte HTML-Seiten).

| Seite | Inhalt |
|---|---|
| `index.html` | Startseite mit animiertem Miniatur-Theater im Hintergrund, Header blendet beim Scrollen ein |
| `mitglieder.html` | Vorstand (Foto, Name, Funktion, Kontakt) und Mitglieder (Foto, Name) |
| `archiv.html` | Timeline aller Theaterstücke (Übersicht: nur Jahr + Titel) |
| `stueck.html?id=…` | Detailseite eines Stücks: Text, Besetzung & Team, Bildergalerie mit Großansicht |
| `admin.html` | Passwortgeschützte Verwaltung (Link nur im Footer) |

## Entwicklung

```bash
npm install
npm run dev:server   # API-Server (Daten in .devdata/, Passwort theater123)
npm run dev          # Entwicklungsserver (PowerShell: npm.cmd run dev)
npm run build    # fertige Webseite nach dist/ – diesen Ordner auf den Webserver laden
npm run lint
```

## Admin-Bereich

- Link „Admin“ unten in der Fußzeile. Passwort wird auf dem Server geprüft (`ADMIN_PASSWORD`).
- „Speichern“ überträgt Änderungen auf den Server – sofort für alle Besucher sichtbar.
- Bei jedem Speichern entsteht automatisch eine Sicherungskopie auf dem Server.
- Veröffentlichen auf Railway: siehe [DEPLOY.md](DEPLOY.md).

## Technik

- Vite, TypeScript (ohne Framework), GSAP + ScrollTrigger, Lenis
- Schrift Montserrat, selbst gehostet
- `graphify-out/`: Code-Wissensgraph (graphify), Überblick in `graphify-out/GRAPH_REPORT.md`
