# Webseite Theaterbühne Biberbach

Sprache: Deutsch (Code-Bezeichner englisch, Seiteninhalte deutsch).

## ⚠️ Pflicht zuerst: graphify statt Code durchlesen

Dieses Projekt hat einen Code-Wissensgraphen (`graphify-out/`). **Bei jeder Aufgabe zuerst den Graphen
benutzen, nicht den ganzen Code lesen.** Skill: `graphify`. CLI liegt im geprüften venv (nicht auf PATH):

```powershell
$g = "G:\Claude\Tools\graphify-venv\Scripts\graphify.exe"
```

| Schritt | Befehl / Datei |
|---|---|
| 1. Graph aktuell? (`Built from commit` mit `git rev-parse HEAD` vergleichen) | `& $g update .` – nur AST, kein LLM, Sekunden |
| 2. Überblick: Module, zentrale Funktionen („God Nodes“), Communities | `graphify-out/GRAPH_REPORT.md` |
| 3. „Wo/wie passiert X?“ | `& $g query "<Frage>" --budget 1500` |
| 4. Was hängt an Funktion/Datei Y? | `& $g explain "<Name>()"` |
| 5. Wie hängen A und B zusammen? | `& $g path "<A>" "<B>"` |
| 6. Erst jetzt: **nur** die genannten Dateien/Zeilen öffnen (`Read` mit offset/limit) | – |

- Grep/Glob nur als Rückfall, wenn der Graph nichts liefert.
- **Vor jedem Commit:** `& $g update .` (nach Löschen/Umbenennen: `update . --force`) und `graphify-out/` mitcommitten.
- Keine graphify-Hooks, kein `graphify install`, nichts von PyPI (siehe `G:\Claude\CLAUDE.md`).

## Skills für diese Webseite

| Aufgabe | Skill | Hinweis |
|---|---|---|
| Code finden, Zusammenhänge, Auswirkungen einer Änderung | **`graphify`** | **immer zuerst** (siehe oben) |
| Tweens, Easing, Stagger, `gsap.matchMedia()` | `gsap-core` | |
| Abläufe/Sequenzen (z. B. Hero-Intro) | `gsap-timeline` | |
| Scroll-Animationen, Parallax, Pinning, `scrub` | `gsap-scrolltrigger` | mit Lenis gekoppelt in `src/common.ts` |
| SplitText, Flip, ScrollTo, DrawSVG, MorphSVG … | `gsap-plugins` | alle Plugins kostenlos im npm-Paket `gsap` |
| Helfer (`clamp`, `mapRange`, `toArray`, `snap`) | `gsap-utils` | |
| Ruckeln, FPS, Akku | `gsap-performance` | nur `transform`/`opacity` animieren |
| Smooth Scroll, Anker, Scroll stoppen (Modals) | `lenis` | `getLenis()?.stop()/start()` |
| Seite starten und im Browser prüfen | `run` / eingebauter Browser | Dev-Server: `npm.cmd run dev` |
| Diagramme/Charts für Doku | `dataviz` | nur bei Bedarf |

**Nicht verwenden:** `react-bits`, `gsap-react`, `gsap-frameworks` – die Seite nutzt kein React/Vue/Svelte.
Neue Skills nur nach SkillSpector-Prüfung laut `G:\Claude\CLAUDE.md`.

## Stack

- **Multi-Page-Website** (keine SPA, kein Framework): Vite + Vanilla-TypeScript.
  `npm.cmd run dev` (PowerShell) bzw. `npm run dev`, `npm run build` → statische Seiten in `dist/`, `npm run lint`
- **Server (`server/`, Node 24, läuft .ts direkt):** liefert `dist/` aus + API unter `/api/…`;
  Hosting auf **Railway** mit Volume (siehe `DEPLOY.md`). Lokal: `npm.cmd run dev:server` (Port 3000,
  Daten in `.devdata/`, Passwort `theater123`) + `npm.cmd run dev` (Vite leitet `/api` weiter).
- GSAP 3 (+ ScrollTrigger, SplitText), Lenis
- Schrift: Montserrat (selbst gehostet über `@fontsource-variable/montserrat`, kein Google-CDN wegen DSGVO)
- Farben (Tokens in `src/styles/main.css`): Schwarz, 40 %-Grau `#999`, Akzent-Rot `#e62b34`

## Aufbau

- `index.html`, `mitglieder.html`, `archiv.html`, `stueck.html`, `admin.html` – je eine echte Seite im Projektordner.
  Kopf-/Fußzeile und das Inline-Skript für den Vorhang stehen in **jeder** HTML-Datei → Änderungen in allen fünf machen!
- `stueck.html?id=<Stück-ID>` – Detailseite: Text + Bildergalerie + Lightbox (erst hier geladen, nicht in der Übersicht)
- `src/pages/<seite>.ts` – Skript je Seite; `src/common.ts` – gemeinsam (Lenis, Navigation, Reveal, Effekte)
- `src/lib/effects.ts` – Vorhang-Seitenübergang + SplitText-Überschriften (`data-split` am `<h1>/<h2>`)
- `src/lib/stage.ts` – Miniatur-Theater im Hero (Canvas); Vorhang über `curtain.open` (0–1) per GSAP steuerbar
- `src/data/store.ts` – Datenmodell; `initData()` lädt vom Server, `loadData()` liefert den Cache, `saveData()` speichert (async)
- `src/data/api.ts` – Server-Aufrufe (Login, Speichern, Bild-Upload), `imageSrc()` für Bild-URLs
- `Play.credits` – Rollen & Team je Stück (Detailseite „Besetzung & Team“, im Admin pflegbar)
- `server/` – `index.ts` (Routen + statische Auslieferung), `auth.ts` (Login, signiertes Cookie, CSRF, Sperre),
  `storage.ts` (site.json + Backups + Bilder im `DATA_DIR`), `validate.ts` (bereinigt Daten serverseitig)
  Export/Import packt die Bilder als Data-URLs in die JSON-Datei.
- `src/lib/image.ts` – Foto-Verkleinerung; `src/lib/dom.ts` – `el()`, `qs()`, `prefersReducedMotion()`
- Logo-Varianten: `src/assets/logos/logo-mark-light.png` (nur Zeichen, ohne Schrift – in allen Headern und im Hero),
  `logo-light.png` (mit Schrift, weiß – Footer), `logo-dark.png`, Original-JPG
- Admin: Passwort prüft der **Server** (`ADMIN_PASSWORD`); Änderungen sind nach „Speichern“ sofort für alle sichtbar.
  Bilder werden vor dem Upload im Browser verkleinert und auf dem Server nur mit zufälligem Namen abgelegt.

## Effekte (Stand)

| Wo | Effekt | Code |
|---|---|---|
| Startseite | Bühnenvorhang öffnet sich, Logo/Slogan (SplitText-Wörter) erscheinen | `home.ts` Timeline |
| Startseite | Header = oberer Bühnenvorhang (Lambrequin, fixiert); Logo-Zeichen + Menü erscheinen beim Scrollen | `index.html` `.site-header--valance`, `home.ts` |
| Startseite | Bühnenfiguren im Stil der Logo-Figuren (schwebender Kopf, Rock-Körper unten geschlossen mit Fenster, Maße aus dem Logo) | `stage.ts` `drawActor()` |
| Startseite | Hero-Text schwebt beim Scrollen weg; Jahreszahl-Parallax; Zahlen zählen hoch | `home.ts` |
| Alle Seiten | Theatervorhang schließt/öffnet beim Seitenwechsel (Sicherheits-Timeouts!) | `effects.ts` |
| Alle Seiten | `[data-reveal]` blendet ein, `[data-split]`-Überschriften gleiten zeilenweise herein | `common.ts`, `effects.ts` |
| Archiv | rote Fortschrittslinie der Timeline (scrub) | `archiv.ts` |

## Regeln

- `prefers-reduced-motion` respektieren: jeder neue Effekt braucht eine ruhige Variante.
- Effekte dürfen Inhalte nie dauerhaft verdecken (Fallback-Timeout wie in `effects.ts`).
- Nutzerdaten immer über `textContent`/`el()` ausgeben, nie `innerHTML` (XSS).
- Mobile first, barrierearm (Alt-Texte, Kontraste, semantisches HTML).
- GitHub: https://github.com/simonkalkhofer/theaterbuehne-biberbach (privat, Branch `main`).
  Push über Git Credential Manager (`git push`); die gh CLI ist installiert, aber nicht angemeldet.
- Git: kleine Commits auf Deutsch, vorher Graph aktualisieren (siehe oben).
