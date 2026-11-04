# Graph Report - Theaterbuehne-Biberbach  (2026-11-04)

## Corpus Check
- 20 files · ~10,179 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 220 nodes · 430 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c42841e`
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

## God Nodes (most connected - your core abstractions)
1. `qs()` - 22 edges
2. `el()` - 19 edges
3. `compilerOptions` - 17 edges
4. `startStage()` - 15 edges
5. `compilerOptions` - 15 edges
6. `loadData()` - 14 edges
7. `renderPlays()` - 13 edges
8. `renderMembers()` - 12 edges
9. `prefersReducedMotion()` - 10 edges
10. `playUrl()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Aufbau` --references--> `el()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts
- `Skills für dieses Projekt` --references--> `run()`  [INFERRED]
  CLAUDE.md → src/data/images.ts
- `renderGalleryEdit()` --indirect_call--> `imageUrl()`  [INFERRED]
  src/pages/admin.ts → src/data/images.ts
- `renderGallery()` --indirect_call--> `imageUrl()`  [INFERRED]
  src/pages/stueck.ts → src/data/images.ts
- `initSmoothScroll()` --calls--> `prefersReducedMotion()`  [EXTRACTED]
  src/common.ts → src/lib/dom.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.09
Nodes (23): dependencies, @fontsource-variable/montserrat@^5.3.0, lenis@^1.3.27, devDependencies, oxlint@^1.89.0, @types/node@^24.19.2, typescript@~7.0.2, vite@^8.3.5 (+15 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 2 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "admin.ts"
Cohesion: 0.07
Nodes (39): CHANGE_EVENT, defaultData(), ExportFile, isSiteData(), Member, member(), normalize(), parseImport() (+31 more)

### Community 4 - "stueck.ts"
Cohesion: 0.12
Nodes (29): gsap@^3.15.1, gsap, getLenis(), initReveal(), initSmoothScroll(), findPlay(), loadData(), onDataChange() (+21 more)

### Community 5 - "images.ts"
Cohesion: 0.14
Nodes (18): Aufbau, Code-Navigation: ZUERST den Graphen benutzen, Regeln, Skills für dieses Projekt, Stack, Webseite Theaterbühne Biberbach, allImageIds(), blobToDataUrl() (+10 more)

### Community 7 - "qs"
Cohesion: 0.23
Nodes (21): el(), initials(), isEmail(), isImageDataUrl(), qs(), editMember(), editPlay(), listActions() (+13 more)

### Community 8 - "Theaterbühne Biberbach – Webseite"
Cohesion: 0.40
Nodes (4): Admin-Bereich – wichtig, Entwicklung, Technik, Theaterbühne Biberbach – Webseite

### Community 10 - "startStage"
Cohesion: 0.16
Nodes (20): Actor, LINES, Options, pick(), rand(), Spot, startStage(), createActors() (+12 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `gsap` connect `stueck.ts` to `package.json`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09116809116809117 - nodes in this community are weakly interconnected._
- **Why does `startStage()` connect `startStage` to `stueck.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `el()` connect `qs` to `admin.ts`, `stueck.ts`, `images.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06765327695560254 - nodes in this community are weakly interconnected._