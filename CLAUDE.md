# Webseite Theaterbühne Biberbach

Sprache: Deutsch (Code-Bezeichner englisch, Seiteninhalte deutsch).

## Stack

- **Multi-Page-Website** (keine SPA, kein React): Vite + Vanilla-TypeScript.
  `npm run dev` (in PowerShell: `npm.cmd run dev`), `npm run build` → statische Seiten in `dist/`, `npm run lint`
- Animation: GSAP + ScrollTrigger, Smooth Scroll: Lenis (in `src/common.ts` gekoppelt)
- Schrift: Montserrat (selbst gehostet über `@fontsource-variable/montserrat`, kein Google-CDN wegen DSGVO)
- Farben (Tokens in `src/styles/main.css`): Schwarz, 40 %-Grau `#999`, Akzent-Rot `#e62b34`

## Aufbau

- `index.html`, `mitglieder.html`, `archiv.html`, `admin.html` – je eine echte Seite im Projektordner
  (Kopf- und Fußzeile stehen in jeder HTML-Datei; Änderungen daran in allen vier Dateien machen!)
- `src/pages/<seite>.ts` – Skript je Seite; `src/common.ts` – gemeinsam (Lenis, Navigation, Reveal)
- `src/data/store.ts` – Datenmodell + localStorage (Schlüssel `tbb-data-v1`) + Standarddaten
- `src/lib/stage.ts` – Miniatur-Theater (Bühne, Vorhang, laufende Figuren) im Hero; `src/lib/image.ts` – Foto-Verkleinerung
- Logo-Varianten: `src/assets/logos/logo-light.png` (weiß, transparent), `logo-dark.png`, Original-JPG
- Admin: Passwortschutz nur clientseitig (SHA-256-Hash in `src/pages/admin.ts`) – **kein echter Schutz**;
  Daten liegen nur im Browser des Admins. Für echte, für alle sichtbare Pflege wird ein Backend/CMS nötig.
- Nutzerdaten immer über `textContent`/`el()` ausgeben, nie `innerHTML` (XSS).

## Code-Navigation: ZUERST den Graphen benutzen

Für dieses Projekt gibt es einen graphify-Wissensgraphen in `graphify-out/`.
Nicht den ganzen Code durchsuchen, sondern so vorgehen:

1. Überblick: `graphify-out/GRAPH_REPORT.md` lesen (Module, Communities, zentrale Knoten).
2. Gezielte Fragen über den Graphen beantworten (Skill `graphify`):
   ```powershell
   & "G:\Claude\Tools\graphify-venv\Scripts\graphify.exe" query "<Frage>"
   & "G:\Claude\Tools\graphify-venv\Scripts\graphify.exe" explain "<Komponente>"
   & "G:\Claude\Tools\graphify-venv\Scripts\graphify.exe" path "<A>" "<B>"
   ```
3. Erst danach gezielt nur die Dateien öffnen, die der Graph nennt. Grep/Glob nur als Rückfall,
   wenn der Graph keine Antwort liefert.

**Graph aktuell halten:** Nach jeder Code-Änderung (spätestens vor jedem Commit) aktualisieren –
reine AST-Analyse, kein LLM, dauert Sekunden:
```powershell
& "G:\Claude\Tools\graphify-venv\Scripts\graphify.exe" update .
```
Nach dem Löschen/Umbenennen vieler Dateien: `update . --force`.
Keine graphify-Hooks installieren und nichts von PyPI nachinstallieren (siehe `G:\Claude\CLAUDE.md`).

## Skills für dieses Projekt

| Aufgabe | Skill |
|---|---|
| Code-Struktur, Abhängigkeiten, „wo ist X?“ | `graphify` |
| Animationen allgemein | `gsap-core`, `gsap-timeline`, `gsap-utils` |
| Animationen in React-Komponenten | `gsap-react` (immer `useGSAP` + Scope/Cleanup) |
| Scroll-Animationen, Pinning, Parallax | `gsap-scrolltrigger` (+ `lenis` für Smooth Scroll) |
| Plugins (SplitText, Flip, ScrollTo …) | `gsap-plugins` |
| Ruckeln / Performance | `gsap-performance` |
| Smooth Scrolling, Anker, Modals | `lenis` |
| Seite im Browser prüfen | `run` / eingebauter Browser |

Neue Skills nur nach Prüfung laut `G:\Claude\CLAUDE.md` (SkillSpector) hinzufügen.

## Regeln

- `prefers-reduced-motion` respektieren (`gsap.matchMedia()`).
- Mobile first, barrierearm (Alt-Texte, Kontraste, semantisches HTML).
- GitHub: https://github.com/simonkalkhofer/theaterbuehne-biberbach (privat, Branch `main`).
  Push über Git Credential Manager (`git push`); die gh CLI ist installiert, aber nicht angemeldet.
- Git: kleine Commits auf Deutsch, `graphify-out/` vor dem Commit aktualisieren und mitcommitten.
