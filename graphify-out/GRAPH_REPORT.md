# Graph Report - .  (2026-04-21)

## Corpus Check
- Large corpus: 67 files · ~633,357 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 162 nodes · 307 edges · 11 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_ANN Network Animation|ANN Network Animation]]
- [[_COMMUNITY_Slide Embeds & Themes|Slide Embeds & Themes]]
- [[_COMMUNITY_Slide Animations (GSAP)|Slide Animations (GSAP)]]
- [[_COMMUNITY_CPU vs GPU Demo|CPU vs GPU Demo]]
- [[_COMMUNITY_Animation Primitives|Animation Primitives]]
- [[_COMMUNITY_Neuron Canvas Drawing|Neuron Canvas Drawing]]
- [[_COMMUNITY_Slide Navigation|Slide Navigation]]
- [[_COMMUNITY_Palette & Mode Controls|Palette & Mode Controls]]
- [[_COMMUNITY_Standalone Neuron Page|Standalone Neuron Page]]
- [[_COMMUNITY_ANN Init & Rendering|ANN Init & Rendering]]
- [[_COMMUNITY_Popup Controls|Popup Controls]]

## God Nodes (most connected - your core abstractions)
1. `useTime()` - 22 edges
2. `clamp()` - 15 edges
3. `animate()` - 15 edges
4. `AI Explained Presentation (index)` - 13 edges
5. `drawBrain()` - 9 edges
6. `Palette System (Warm Linen / Paper White / Midnight / Mint / Plum / Deep Navy)` - 8 edges
7. `setGpuStatus()` - 7 edges
8. `gpuCycleOperation()` - 6 edges
9. `resetSideDemo()` - 6 edges
10. `finishCPU()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `GSAP 3.12.2 (cdnjs)` --semantically_similar_to--> `GSAP 3.12.5 (ann_network)`  [INFERRED] [semantically similar]
  index.html → assets/ann_network.html
- `GSAP 3.12.2 (cdnjs)` --semantically_similar_to--> `GSAP 3.12.2 (training-combined)`  [INFERRED] [semantically similar]
  index.html → assets/training-combined.html
- `applyTheme(mode, palette) handler` --conceptually_related_to--> `Palette System (Warm Linen / Paper White / Midnight / Mint / Plum / Deep Navy)`  [INFERRED]
  assets/ann_network.html → index.html
- `Midnight theme handler (postMessage)` --conceptually_related_to--> `Midnight palette (default)`  [INFERRED]
  assets/robot-football.html → index.html
- `Embedded iframe: ann_network` --references--> `Neural Network — Vehicle Classifier`  [EXTRACTED]
  index.html → assets/ann_network.html

## Hyperedges (group relationships)
- **All embedded animation iframes in index.html** —  [EXTRACTED 1.00]
- **Palette system variants** —  [EXTRACTED 1.00]
- **ANN animation assets** —  [INFERRED 0.85]

## Communities

### Community 0 - "ANN Network Animation"
Cohesion: 0.12
Nodes (33): animate(), useTime(), NetCaption(), NetConnections(), netHashedWeight(), NetInputValues(), NetLayerLabels(), NetNodes() (+25 more)

### Community 1 - "Slide Embeds & Themes"
Cohesion: 0.08
Nodes (31): ANN Animation index (embedded in slide), applyTheme(mode, palette) handler, GSAP 3.12.5 (ann_network), GSAP MotionPathPlugin 3.12.5, Neural Network — Vehicle Classifier, CPU vs GPU visualization, GSAP 3.12.2 (cdnjs), Hero slide: AI Explained (+23 more)

### Community 2 - "Slide Animations (GSAP)"
Cohesion: 0.09
Nodes (4): buildBrain(), initGpuDemo(), openGpuDemo(), resizeBrain()

### Community 3 - "CPU vs GPU Demo"
Cohesion: 0.21
Nodes (16): closeGpuDemo(), cpuTickOperation(), finishCPU(), gpuCycleOperation(), lightGpuCores(), markGpuBlocks(), resetGpuDemo(), resetSideDemo() (+8 more)

### Community 4 - "Animation Primitives"
Cohesion: 0.38
Nodes (11): clamp(), IconButton(), ImageSprite(), interpolate(), PlaybackBar(), RectSprite(), Sprite(), Stage() (+3 more)

### Community 5 - "Neuron Canvas Drawing"
Cohesion: 0.17
Nodes (12): drawBall(), drawBrain(), drawNeural(), drawNexus(), drawStorm(), drawStream(), drawSynapse(), initBall() (+4 more)

### Community 6 - "Slide Navigation"
Cohesion: 0.33
Nodes (9): getActiveSlides(), goToSlide(), renderQuickNav(), reorderSlides(), saveSlideState(), syncSlider(), toggleHideInactive(), toggleSlideVisibility() (+1 more)

### Community 7 - "Palette & Mode Controls"
Cohesion: 0.33
Nodes (6): applyAccentVars(), setAccent(), setMode(), setPalette(), setStyle(), toggleMode()

### Community 8 - "Standalone Neuron Page"
Cohesion: 0.33
Nodes (6): One Neuron — Animated (Standalone), Babel Standalone 7.29.0, Google Fonts: Inter + JetBrains Mono, One Neuron — Original Animation, React 18.3.1 UMD, ReactDOM 18.3.1 UMD

### Community 9 - "ANN Init & Rendering"
Cohesion: 0.4
Nodes (5): drawAnn(), drawDual(), hexToRgba(), initAnn(), initDual()

### Community 10 - "Popup Controls"
Cohesion: 0.67
Nodes (3): closePillPopup(), openPillPopup(), openS3CardPopup()

## Knowledge Gaps
- **20 isolated node(s):** `css/styles.css stylesheet`, `js/scripts.js`, `GSAP ScrollToPlugin 3.12.2`, `Warm Linen palette`, `Paper White palette` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTime()` connect `ANN Network Animation` to `Animation Primitives`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `useTime()` (e.g. with `NeuronBody()` and `InputNodes()`) actually correct?**
  _`useTime()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `clamp()` (e.g. with `NeuronBody()` and `OutputLine()`) actually correct?**
  _`clamp()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `animate()` (e.g. with `NeuronBody()` and `OutputLine()`) actually correct?**
  _`animate()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `css/styles.css stylesheet`, `js/scripts.js`, `GSAP ScrollToPlugin 3.12.2` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ANN Network Animation` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Slide Embeds & Themes` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._