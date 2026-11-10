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
npm run dev      # Entwicklungsserver (PowerShell: npm.cmd run dev)
npm run build    # fertige Webseite nach dist/ – diesen Ordner auf den Webserver laden
npm run lint
```

## Admin-Bereich – wichtig

- Daten (Mitglieder, Stücke) liegen im **localStorage**, Galerie-Bilder in **IndexedDB** des Browsers.
  Änderungen sieht nur, wer denselben Browser auf demselben Gerät benutzt – **nicht** die Besucher.
- Der Passwortschutz läuft im Browser und ist **kein echter Zugriffsschutz**.
- „Daten exportieren/importieren“ sichert bzw. überträgt den Stand als JSON-Datei.

## Technik

- Vite, TypeScript (ohne Framework), GSAP + ScrollTrigger, Lenis
- Schrift Montserrat, selbst gehostet
- `graphify-out/`: Code-Wissensgraph (graphify), Überblick in `graphify-out/GRAPH_REPORT.md`
- `public/demo/`: Platzhalter-Fotos (CC0/Public Domain von Wikimedia Commons, Quellen in `public/demo/QUELLEN.md`)
