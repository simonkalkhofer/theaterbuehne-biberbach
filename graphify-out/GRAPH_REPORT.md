# Graph Report - Theaterbuehne-Biberbach  (2026-11-04)

## Corpus Check
- 18 files · ~6,105 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 169 nodes · 296 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16d0aba2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- compilerOptions
- admin.ts
- mitglieder.ts
- Webseite Theaterbühne Biberbach
- .oxlintrc.json
- store.ts
- Theaterbühne Biberbach – Webseite
- tsconfig.json
- startParticles

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `qs()` - 15 edges
3. `compilerOptions` - 15 edges
4. `el()` - 14 edges
5. `loadData()` - 12 edges
6. `renderMembers()` - 12 edges
7. `renderPlays()` - 12 edges
8. `isImageDataUrl()` - 9 edges
9. `render()` - 8 edges
10. `playsByYear()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Aufbau` --references--> `el()`  [INFERRED]
  CLAUDE.md → src/lib/dom.ts
- `initSmoothScroll()` --calls--> `prefersReducedMotion()`  [EXTRACTED]
  src/common.ts → src/lib/dom.ts
- `renderAll()` --calls--> `loadData()`  [EXTRACTED]
  src/pages/admin.ts → src/data/store.ts
- `render()` --calls--> `loadData()`  [EXTRACTED]
  src/pages/archiv.ts → src/data/store.ts
- `render()` --calls--> `loadData()`  [EXTRACTED]
  src/pages/mitglieder.ts → src/data/store.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.09
Nodes (25): dependencies, @fontsource-variable/montserrat@^5.3.0, gsap@^3.15.1, lenis@^1.3.27, devDependencies, oxlint@^1.89.0, @types/node@^24.19.2, typescript@~7.0.2 (+17 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 2 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "admin.ts"
Cohesion: 0.10
Nodes (31): saveData(), qs(), fileToResizedDataUrl(), dashView, data, editMember(), editPlay(), listActions() (+23 more)

### Community 4 - "mitglieder.ts"
Cohesion: 0.23
Nodes (14): initReveal(), initSmoothScroll(), el(), initials(), isEmail(), isImageDataUrl(), prefersReducedMotion(), item() (+6 more)

### Community 5 - "Webseite Theaterbühne Biberbach"
Cohesion: 0.29
Nodes (6): Aufbau, Code-Navigation: ZUERST den Graphen benutzen, Regeln, Skills für dieses Projekt, Stack, Webseite Theaterbühne Biberbach

### Community 7 - "store.ts"
Cohesion: 0.17
Nodes (18): CHANGE_EVENT, defaultData(), isSiteData(), loadData(), Member, member(), normalize(), onDataChange() (+10 more)

### Community 8 - "Theaterbühne Biberbach – Webseite"
Cohesion: 0.40
Nodes (4): Admin-Bereich – wichtig, Entwicklung, Technik, Theaterbühne Biberbach – Webseite

### Community 10 - "startParticles"
Cohesion: 0.36
Nodes (7): Node, Options, startParticles(), draw(), loop(), resize(), step()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `gsap` connect `package.json` to `mitglieder.ts`, `store.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08620689655172414 - nodes in this community are weakly interconnected._
- **Why does `el()` connect `mitglieder.ts` to `admin.ts`, `Webseite Theaterbühne Biberbach`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `Aufbau` connect `Webseite Theaterbühne Biberbach` to `mitglieder.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09747899159663866 - nodes in this community are weakly interconnected._