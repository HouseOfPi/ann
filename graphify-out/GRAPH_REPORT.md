# Graph Report - .  (2026-04-25)

## Corpus Check
- 21 files · ~434,755 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 297 nodes · 463 edges · 14 communities detected
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Slide Animation Engine|Slide Animation Engine]]
- [[_COMMUNITY_Sprite & Playback Framework|Sprite & Playback Framework]]
- [[_COMMUNITY_AI History Timeline|AI History Timeline]]
- [[_COMMUNITY_Emergency & Passenger Vehicles|Emergency & Passenger Vehicles]]
- [[_COMMUNITY_AI Concept Mesh & Perceptron|AI Concept Mesh & Perceptron]]
- [[_COMMUNITY_Hinton & Deep Learning|Hinton & Deep Learning]]
- [[_COMMUNITY_Solomonoff & Algorithmic Inference|Solomonoff & Algorithmic Inference]]
- [[_COMMUNITY_Minsky & Early Neural Nets|Minsky & Early Neural Nets]]
- [[_COMMUNITY_Shannon & Information Theory|Shannon & Information Theory]]
- [[_COMMUNITY_Dartmouth Workshop 1956|Dartmouth Workshop 1956]]
- [[_COMMUNITY_McCarthy & Symbolic AI|McCarthy & Symbolic AI]]
- [[_COMMUNITY_Brain-ANN Biological Analogy|Brain-ANN Biological Analogy]]
- [[_COMMUNITY_Two-Wheeled Vehicles|Two-Wheeled Vehicles]]
- [[_COMMUNITY_Bus & Truck Category|Bus & Truck Category]]

## God Nodes (most connected - your core abstractions)
1. `useTime()` - 22 edges
2. `clamp()` - 15 edges
3. `animate()` - 15 edges
4. `AI Explained — Neural Network and Deep Learning (Index)` - 11 edges
5. `Geoffrey Hinton` - 11 edges
6. `drawBrain()` - 9 edges
7. `Geoffrey Hinton` - 8 edges
8. `Dartmouth Summer Research Project on AI (1956)` - 8 edges
9. `Ambulance` - 8 edges
10. `Car (sedan)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Biological Neuron (86B neurons, 7000 connections)` --semantically_similar_to--> `NeuronBody component`  [INFERRED] [semantically similar]
  index.html → assets/ann animation/index.html
- `Action -> Feedback -> Adjustment Loop` --semantically_similar_to--> `Reinforcement Learning (trial-and-error)`  [INFERRED] [semantically similar]
  index.html → assets/robot-football.html
- `Slide: AI/ML/DL/GenAI Tangled Mesh` --references--> `AI Mesh: Tangled Web of AI/ML/DL/GenAI`  [EXTRACTED]
  index.html → assets/ai_mesh.html
- `Slide 6: Single Neuron Interactive` --references--> `One Neuron — Animated`  [EXTRACTED]
  index.html → assets/ann animation/index.html
- `Backpropagation (1986)` --rationale_for--> `Neural Network — Vehicle/Digit Classifier`  [INFERRED]
  index.html → assets/ann_network.html

## Hyperedges (group relationships)
- **Three Pillars enabling modern AI** —  [EXTRACTED 1.00]
- **Single-neuron computation flow (inputs, weights, bias, sum, output)** —  [EXTRACTED 1.00]
- **AI taxonomy nesting (AI ⊃ ML ⊃ DL ⊃ GenAI)** —  [EXTRACTED 1.00]
- **Vehicle Classification Examples** — ambulance_vehicle, suv_vehicle, motorcycle_vehicle, car_vehicle [INFERRED 0.85]
- **Vehicle Classification Examples (Set 2)** — bicycle_road_bike, bus_city_bus, truck_pickup, scooter_vespa [INFERRED 0.85]

## Communities

### Community 0 - "Slide Animation Engine"
Cohesion: 0.05
Nodes (55): applyAccentVars(), buildBrain(), closeGpuDemo(), closePillPopup(), cpuTickOperation(), drawAnn(), drawBall(), drawBrain() (+47 more)

### Community 1 - "Sprite & Playback Framework"
Cohesion: 0.1
Nodes (44): animate(), clamp(), IconButton(), ImageSprite(), interpolate(), PlaybackBar(), RectSprite(), Sprite() (+36 more)

### Community 2 - "AI History Timeline"
Cohesion: 0.06
Nodes (40): AI Winters, Alan Turing (1951 quote), AlexNet (2012), BERT, Boltzmann Machines, Claude Shannon, CPU vs GPU Animation Modal, NVIDIA CUDA (2007) (+32 more)

### Community 3 - "Emergency & Passenger Vehicles"
Cohesion: 0.08
Nodes (26): Van Body (white, tall), Emergency Vehicle, Four-Wheeler, Emergency Lights (red/blue), Red Cross / EMS Markings, Ambulance, Four Wheels, Sedan Body (blue, low profile) (+18 more)

### Community 4 - "AI Concept Mesh & Perceptron"
Cohesion: 0.12
Nodes (21): Artificial Intelligence (mesh node), Big Picture Modal: From Rules to Creation, Deep Learning (mesh node, multi-layer NN), Generative AI (mesh node), AI Mesh: Tangled Web of AI/ML/DL/GenAI, Machine Learning (mesh node), BiasNode (+b, dashed connection), InputNodes (4 inputs, weights w_i) (+13 more)

### Community 5 - "Hinton & Deep Learning"
Cohesion: 0.22
Nodes (13): AlexNet (2012), Backpropagation Algorithm, Boltzmann Machines, Capsule Networks, Deep Learning, Dropout Regularization, Geoffrey Hinton, Godfather of Deep Learning (+5 more)

### Community 6 - "Solomonoff & Algorithmic Inference"
Cohesion: 0.2
Nodes (11): AIXI (Hutter), Algorithmic Information Theory, Algorithmic Probability, Bayesian Inference, Dartmouth Workshop 1956, Early AI Era (1950s-1960s), Inductive Inference, Kolmogorov Complexity (+3 more)

### Community 7 - "Minsky & Early Neural Nets"
Cohesion: 0.22
Nodes (11): First AI Winter, Frames (knowledge representation), MIT AI Laboratory, Seymour Papert, Perceptron / ANN, Perceptrons (1969 book), Marvin Minsky, SNARC (1951 neural net machine) (+3 more)

### Community 8 - "Shannon & Information Theory"
Cohesion: 0.28
Nodes (9): Foundations of ANN / Machine Learning, Bell Labs, Bit (unit of information), Claude Shannon, Boolean Algebra in Digital Circuits, Shannon Entropy, Information Theory, A Mathematical Theory of Communication (1948) (+1 more)

### Community 9 - "Dartmouth Workshop 1956"
Cohesion: 0.25
Nodes (9): Birthplace of AI as a Field, Claude Shannon, Dartmouth Summer Research Project on AI (1956), Dartmouth College, Hanover, New Hampshire, John McCarthy, Marvin Minsky, Nathaniel Rochester, Term 'Artificial Intelligence' Coined (+1 more)

### Community 10 - "McCarthy & Symbolic AI"
Cohesion: 0.32
Nodes (8): Artificial Intelligence, Coined 'Artificial Intelligence', Dartmouth Workshop (1956), AI Pioneer Era (1950s-60s), LISP Programming Language, John McCarthy, Symbolic AI, Turing Award (1971)

### Community 11 - "Brain-ANN Biological Analogy"
Cohesion: 0.36
Nodes (8): Artificial Neural Network Analogy, Axon-Dendrite Network, Biological Inspiration for ANNs, Human Brain (3D Illuminated), Glowing Neural Connections, Biological Neuron Cells with Dendrites, Split View: Brain vs Neuron Closeup, Synaptic Firing / Activation Points

### Community 12 - "Two-Wheeled Vehicles"
Cohesion: 0.25
Nodes (8): Drop Handlebars (cyan bar tape), Human-Powered Vehicle Category, Cervelo Road Bicycle (black/cyan carbon frame), Two Thin Wheels with Disc Brakes, Motorized Two-Wheeler Category, Small Wheels and Round Headlight, Step-Through Frame with Floorboard, Purple Vespa Scooter

### Community 13 - "Bus & Truck Category"
Cohesion: 0.25
Nodes (8): Pink Citylink Electric City Bus, Long Rectangular Body with Multiple Windows, Multiple Passenger Doors, Public Transport / Mass Transit Category, Open Cargo Bed at Rear, Large Off-Road Tires and Raised Suspension, Yellow Ford Ranger Raptor Pickup Truck, Light-Duty Utility Vehicle Category

## Knowledge Gaps
- **87 isolated node(s):** `John McCarthy`, `Marvin Minsky`, `Claude Shannon`, `Ray Solomonoff`, `Alan Turing (1951 quote)` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AI Explained — Neural Network and Deep Learning (Index)` connect `AI History Timeline` to `AI Concept Mesh & Perceptron`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `useTime()` (e.g. with `NeuronBody()` and `InputNodes()`) actually correct?**
  _`useTime()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `clamp()` (e.g. with `NeuronBody()` and `OutputLine()`) actually correct?**
  _`clamp()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `animate()` (e.g. with `NeuronBody()` and `OutputLine()`) actually correct?**
  _`animate()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `Geoffrey Hinton` (e.g. with `Godfather of Deep Learning` and `Backpropagation Algorithm`) actually correct?**
  _`Geoffrey Hinton` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `John McCarthy`, `Marvin Minsky`, `Claude Shannon` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Slide Animation Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._