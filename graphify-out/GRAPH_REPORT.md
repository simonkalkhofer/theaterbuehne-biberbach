# Graph Report - Theaterbuehne-Biberbach  (2026-11-10)

## Corpus Check
- 28 files · ~14,728 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 318 nodes · 656 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5068ed6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- compilerOptions
- admin.ts
- stueck.ts
- index.ts
- .oxlintrc.json
- deploy
- Veröffentlichen auf Railway
- tsconfig.json
- startStage

## God Nodes (most connected - your core abstractions)
1. `qs()` - 26 edges
2. `handleApi()` - 23 edges
3. `el()` - 23 edges
4. `compilerOptions` - 17 edges
5. `startStage()` - 15 edges
6. `compilerOptions` - 15 edges
7. `initData()` - 14 edges
8. `prefersReducedMotion()` - 14 edges
9. `renderMembers()` - 14 edges
10. `renderPlays()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Regeln` --references--> `el()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts
- `Aufbau` --references--> `initData()`  [INFERRED]
  CLAUDE.md → src/data/store.ts
- `Aufbau` --references--> `saveData()`  [INFERRED]
  CLAUDE.md → src/data/store.ts
- `Aufbau` --references--> `imageSrc()`  [INFERRED]
  CLAUDE.md → src/data/api.ts
- `Aufbau` --references--> `loadData()`  [INFERRED]
  CLAUDE.md → src/data/store.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.09
Nodes (27): dependencies, @fontsource-variable/montserrat@^5.3.0, lenis@^1.3.27, devDependencies, oxlint@^1.89.0, @types/node@^24.19.2, typescript@~7.0.2, vite@^8.3.5 (+19 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 2 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "admin.ts"
Cohesion: 0.06
Nodes (58): ApiError, fetchSite(), getSession(), isImageName(), login(), logout(), request(), saveSite() (+50 more)

### Community 4 - "stueck.ts"
Cohesion: 0.08
Nodes (55): Aufbau, gsap@^3.15.1, gsap, getLenis(), initReveal(), initSmoothScroll(), imageSrc(), findPlay() (+47 more)

### Community 5 - "index.ts"
Cohesion: 0.07
Nodes (55): attempts, checkPassword(), clearFailures(), clientKey(), cookie(), csrfFor(), endSession(), getSession() (+47 more)

### Community 7 - "deploy"
Cohesion: 0.25
Nodes (7): build, buildCommand, deploy, healthcheckPath, restartPolicyType, startCommand, $schema

### Community 8 - "Veröffentlichen auf Railway"
Cohesion: 0.18
Nodes (9): Danach, Einmalig einrichten, Lokal testen, Veröffentlichen auf Railway, Was liegt wo (im Volume `/data`), Admin-Bereich, Entwicklung, Technik (+1 more)

### Community 10 - "startStage"
Cohesion: 0.11
Nodes (26): Effekte (Stand), ⚠️ Pflicht zuerst: graphify statt Code durchlesen, Regeln, Skills für diese Webseite, Stack, Webseite Theaterbühne Biberbach, Actor, LINES (+18 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vite` connect `package.json` to `index.ts`?**
  _High betweenness centrality (0.262) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `el()` (e.g. with `Aufbau` and `Regeln`) actually correct?**
  _`el()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0873015873015873 - nodes in this community are weakly interconnected._
- **Why does `gsap` connect `stueck.ts` to `package.json`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `startStage()` connect `startStage` to `stueck.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._