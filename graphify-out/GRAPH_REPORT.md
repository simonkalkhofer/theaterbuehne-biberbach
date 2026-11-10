# Graph Report - Theaterbuehne-Biberbach  (2026-11-10)

## Corpus Check
- 28 files · ~14,751 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 320 nodes · 659 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1dd61d74`
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
- home.ts

## God Nodes (most connected - your core abstractions)
1. `qs()` - 26 edges
2. `el()` - 23 edges
3. `handleApi()` - 23 edges
4. `compilerOptions` - 17 edges
5. `startStage()` - 15 edges
6. `compilerOptions` - 15 edges
7. `initData()` - 14 edges
8. `renderMembers()` - 14 edges
9. `prefersReducedMotion()` - 14 edges
10. `renderPlays()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Regeln` --references--> `el()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts
- `Aufbau` --references--> `initData()`  [INFERRED]
  CLAUDE.md → src/data/store.ts
- `Aufbau` --references--> `loadData()`  [INFERRED]
  CLAUDE.md → src/data/store.ts
- `Aufbau` --references--> `saveData()`  [INFERRED]
  CLAUDE.md → src/data/store.ts
- `Aufbau` --references--> `prefersReducedMotion()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (30): dependencies, @fontsource/barlow@^5.3.0, @fontsource/barlow-condensed@^5.3.0, gsap@^3.15.1, lenis@^1.3.27, devDependencies, oxlint@^1.89.0, @types/node@^24.19.2 (+22 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 2 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "admin.ts"
Cohesion: 0.06
Nodes (54): ApiError, fetchSite(), getSession(), isImageName(), login(), logout(), request(), saveSite() (+46 more)

### Community 4 - "stueck.ts"
Cohesion: 0.12
Nodes (41): Aufbau, getLenis(), imageSrc(), byLastName(), findPlay(), lastName(), playUrl(), el() (+33 more)

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

### Community 11 - "home.ts"
Cohesion: 0.16
Nodes (17): gsap, initReveal(), initSmoothScroll(), loadData(), playsByYear(), prefersReducedMotion(), buildCurtain(), initPageCurtain() (+9 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `gsap` connect `home.ts` to `package.json`, `stueck.ts`?**
  _High betweenness centrality (0.257) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `el()` (e.g. with `Aufbau` and `Regeln`) actually correct?**
  _`el()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07386363636363637 - nodes in this community are weakly interconnected._
- **Why does `startStage()` connect `startStage` to `home.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05875706214689266 - nodes in this community are weakly interconnected._