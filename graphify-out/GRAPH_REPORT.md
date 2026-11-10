# Graph Report - Theaterbuehne-Biberbach  (2026-11-10)

## Corpus Check
- 23 files · ~13,696 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 251 nodes · 509 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06c8a44a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- compilerOptions
- admin.ts
- stueck.ts
- images.ts
- .oxlintrc.json
- qs
- Theaterbühne Biberbach – Webseite
- tsconfig.json
- startStage
- store.ts
- QUELLEN.md

## God Nodes (most connected - your core abstractions)
1. `qs()` - 26 edges
2. `el()` - 23 edges
3. `compilerOptions` - 17 edges
4. `loadData()` - 16 edges
5. `startStage()` - 15 edges
6. `compilerOptions` - 15 edges
7. `prefersReducedMotion()` - 14 edges
8. `renderMembers()` - 14 edges
9. `renderPlays()` - 13 edges
10. `render()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Aufbau` --references--> `cast()`  [INFERRED]
  CLAUDE.md → src/data/demo-plays.ts
- `Regeln` --references--> `el()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts
- `Skills für diese Webseite` --references--> `run()`  [INFERRED]
  CLAUDE.md → src/data/images.ts
- `Aufbau` --references--> `crew()`  [INFERRED]
  CLAUDE.md → src/data/demo-plays.ts
- `Aufbau` --references--> `el()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.09
Nodes (24): dependencies, @fontsource-variable/montserrat@^5.3.0, gsap@^3.15.1, lenis@^1.3.27, devDependencies, oxlint@^1.89.0, @types/node@^24.19.2, typescript@~7.0.2 (+16 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 2 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "admin.ts"
Cohesion: 0.07
Nodes (29): resetData(), saveData(), drawResized(), fileToResizedBlob(), fileToResizedDataUrl(), creditRows, dashView, data (+21 more)

### Community 4 - "stueck.ts"
Cohesion: 0.10
Nodes (34): gsap, getLenis(), initReveal(), initSmoothScroll(), findPlay(), onDataChange(), playsByYear(), playUrl() (+26 more)

### Community 5 - "images.ts"
Cohesion: 0.12
Nodes (21): Aufbau, Effekte (Stand), ⚠️ Pflicht zuerst: graphify statt Code durchlesen, Regeln, Skills für diese Webseite, Stack, Webseite Theaterbühne Biberbach, crew() (+13 more)

### Community 7 - "qs"
Cohesion: 0.17
Nodes (27): byLastName(), lastName(), Member, el(), initials(), isEmail(), isImageDataUrl(), qs() (+19 more)

### Community 8 - "Theaterbühne Biberbach – Webseite"
Cohesion: 0.40
Nodes (4): Admin-Bereich – wichtig, Entwicklung, Technik, Theaterbühne Biberbach – Webseite

### Community 10 - "startStage"
Cohesion: 0.16
Nodes (20): Actor, LINES, Options, pick(), rand(), Spot, startStage(), createActors() (+12 more)

### Community 11 - "store.ts"
Cohesion: 0.16
Nodes (22): cast(), DEMO_PLAYS, demoPhotos(), DemoPlay, BOARD, CHANGE_EVENT, Credit, defaultData() (+14 more)

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `gsap` connect `stueck.ts` to `package.json`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `el()` (e.g. with `Aufbau` and `Regeln`) actually correct?**
  _`el()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0873015873015873 - nodes in this community are weakly interconnected._
- **Why does `startStage()` connect `startStage` to `stueck.ts`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `qs()` connect `qs` to `admin.ts`, `stueck.ts`, `images.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._