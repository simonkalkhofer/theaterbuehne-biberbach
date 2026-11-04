# Theaterbühne Biberbach – Webseite

Vereinswebseite der Theaterbühne Biberbach. Multi-Page-Website (vier echte HTML-Seiten).

| Seite | Inhalt |
|---|---|
| `index.html` | Startseite mit animiertem Netzwerk-Hintergrund, Header blendet beim Scrollen ein |
| `mitglieder.html` | Vorstand (Foto, Name, Funktion, Kontakt) und Mitglieder (Foto, Name) |
| `archiv.html` | Timeline aller Theaterstücke |
| `admin.html` | Passwortgeschützte Verwaltung (Link nur im Footer) |

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver (PowerShell: npm.cmd run dev)
npm run build    # fertige Webseite nach dist/ – diesen Ordner auf den Webserver laden
npm run lint
```

## Admin-Bereich – wichtig

- Daten (Mitglieder, Stücke, Fotos) werden im **localStorage des Browsers** gespeichert.
  Änderungen sieht nur, wer denselben Browser auf demselben Gerät benutzt – **nicht** die Besucher.
- Der Passwortschutz läuft im Browser und ist **kein echter Zugriffsschutz**.
- „Daten exportieren/importieren“ sichert bzw. überträgt den Stand als JSON-Datei.

## Technik

- Vite, TypeScript (ohne Framework), GSAP + ScrollTrigger, Lenis
- Schrift Montserrat, selbst gehostet
- `graphify-out/`: Code-Wissensgraph (graphify), Überblick in `graphify-out/GRAPH_REPORT.md`
