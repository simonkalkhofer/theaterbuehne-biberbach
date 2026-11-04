# Graph Report - Theaterbuehne-Biberbach  (2026-11-04)

## Corpus Check
- 11 files · ~755 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 99 nodes · 107 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a0a40d0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- compilerOptions
- dependencies
- App.tsx
- Webseite Theaterbühne Biberbach
- .oxlintrc.json
- scripts
- Theaterbühne Biberbach – Webseite
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `scripts` - 5 edges
4. `Webseite Theaterbühne Biberbach` - 5 edges
5. `rules` - 3 edges
6. `react` - 3 edges
7. `react-dom` - 3 edges
8. `@vitejs/plugin-react` - 3 edges
9. `vite` - 3 edges
10. `Theaterbühne Biberbach – Webseite` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.13
Nodes (19): devDependencies, oxlint@^1.89.0, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+11 more)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 2 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, gsap@^3.15.1, @gsap/react@^2.1.2, lenis@^1.3.27, react-dom@^19.3.1, gsap, @gsap/react, lenis (+1 more)

### Community 4 - "App.tsx"
Cohesion: 0.29
Nodes (4): react@^19.3.1, react, App(), navItems

### Community 5 - "Webseite Theaterbühne Biberbach"
Cohesion: 0.33
Nodes (5): Code-Navigation: ZUERST den Graphen benutzen, Regeln, Skills für dieses Projekt, Stack, Webseite Theaterbühne Biberbach

### Community 6 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 7 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 8 - "Theaterbühne Biberbach – Webseite"
Cohesion: 0.50
Nodes (3): Entwicklung, Technik, Theaterbühne Biberbach – Webseite

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._