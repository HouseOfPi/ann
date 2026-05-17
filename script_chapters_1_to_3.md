# Neural Networks, From Scratch — Voiceover Script

**Chapters 1–3** · Target runtime: 17–20 minutes
Style: Educator-friendly (intuition first, formulas second).
Cues: `[ON-SCREEN]` = what's visible. `[VO]` = read this aloud. `[ACTION]` = click / animate.

---

## 🟢 OPENING — Chapter 1: Origins (≈ 6 min)

---

### SLIDE 1 — Hero Intro (`slideOne`)

**[ON-SCREEN]** Animated neural-network hero with the title forming on screen.
**[ACTION]** Hold on the animated title for 2 seconds before speaking.

**[VO]**
AI is transforming the world around us — but how does it actually work? In this series, we’ll break down the fundamentals of AI step by step. We’ll start with machine learning, move into neural networks, and eventually explore generative AI and how these models are trained.
Using simple Python examples, we’ll focus on understanding the core ideas without getting lost in unnecessary complexity.
By the end of this series, you’ll have a solid foundation in how modern AI really works.

---

### SLIDE 2 — AI Is Transforming the World (`slideAITransforming`)

**[ON-SCREEN]** Three editorial cards fade in: Software Engineering, Healthcare, Transportation. Statistics: 30–45% of code by AI, 20–40% diagnostic improvement, $1.3T transport value.
**[ACTION]** Let the cards animate in (~3 sec) before the next line.

**[VO]**
But before we build, let's be honest about _why_ this matters right now.
Look around. In software, roughly a third to nearly half of new code is being written _with_ AI — not by hand. In hospitals, AI is reading X-rays and genetic sequences with a level of accuracy that didn't exist five years ago. And on the road, the same math is teaching cars to see, predict, and choose a path through chaos.
This isn't science fiction. This isn't 2035. This is happening — in this quarter, in this hospital, in this car.
And every one of those breakthroughs… runs on the _same_ underlying machine. The neural network.
So the question isn't whether to learn this. The question is — _how does it actually work?_

---

### SLIDE 3 — The Future, Already Arriving (`slideFuture`)

**[ON-SCREEN]** Cinematic video player cycling through 4 clips: Mars rover, DNA helix, hazardous fire, kids in care. Caption fades in on each.
**[ACTION]** Let the first video play for ~3 seconds before speaking; speak over the rest.

**[VO]**
And it's not just the obvious places.
_[as Mars clip plays]_ It's on Mars, deciding which rock is worth a closer look — without waiting for a signal from Earth.
_[DNA]_ It's inside our own DNA, spotting the patterns that predict disease.
_[fire]_ It's stepping into rooms that are too hot, too radioactive, too dangerous for us.
_[kids]_ And it's quietly helping the people who care for our children and our elderly.
The future people kept promising you? It already started. We just stopped calling it the future.

---

### SLIDE 4 — The Complexity Mesh (`slideMesh`)

**[ON-SCREEN]** AI / ML / Deep Learning / Generative AI shown as overlapping rings or a mesh.
**[ACTION]** Click to start the animation, then narrate as terms appear.

**[VO]**
Okay, but before we go any further — we need to clear up a mess.
You've heard four words thrown around like they mean the same thing. They don't.
**Artificial Intelligence** is the _big_ idea — any machine that does something we'd call intelligent. That's the outer ring.
Inside it sits **Machine Learning** — a specific _way_ of getting there. Instead of telling the machine the rules, we show it examples, and let it figure the rules out.
Inside _that_ sits **Deep Learning** — machine learning done with deep neural networks. Many layers, stacked.
And the newest ring — **Generative AI** — is what happens when those deep networks learn to _create_ things. Text, images, video, code.
So when someone says "AI did this" — pause. Ask which ring they actually mean. Because that's the difference between a chatbot and a chess engine, between Midjourney and your spam filter.

---

### SLIDE 5 — The Dartmouth Dream (`slideTwo`)

**[ON-SCREEN]** Historical timeline / 1956 Dartmouth conference visuals. Gold accent tones, vintage typography.

**[VO]**
The dream itself is older than you'd think.
Summer of 1956. A small college in New Hampshire. A young mathematician named **John McCarthy** invites a handful of people to spend two months trying to make machines think. He coins a phrase for it: _artificial intelligence._
Their proposal is almost charmingly naive. They wrote — and I'm quoting — that a _"significant advance can be made in one or more of these problems if a carefully selected group of scientists work on it together for a summer."_
One summer. To crack thinking.
They didn't crack it, of course. But they planted the seed. Every neural network running today — every model that writes your emails or recognises your face — traces back to that two-month meeting in 1956.

---

### SLIDE 6 — Historical Pioneers (`slideThree`)

**[ON-SCREEN]** Portraits / cards of pioneers like McCulloch, Pitts, Rosenblatt, Hinton. Names and dates.

**[VO]**
And the story isn't one person. It's a relay.
**McCulloch and Pitts**, in 1943, wrote down the first mathematical model of a neuron — before there were even computers to run it on.
**Frank Rosenblatt**, in 1958, built the _Perceptron_ — the first machine that could _learn_ from examples. The New York Times called it the beginning of computers that would "walk, talk, see, write, reproduce themselves."
Then — winter. For nearly twenty years, neural networks were declared a dead end.
And then, in the 1980s, a quiet British researcher named **Geoffrey Hinton** refused to let the idea die. He kept working. Through the cold. Through the funding cuts. Through the laughter.
In 2024, he won the Nobel Prize.
So when we sit down to build a neural network today — we're not starting from scratch. We're standing on eighty years of stubborn people who refused to give up on a beautiful idea.

---

## 🟢 BRIDGE — Chapter 2: Machine Learning (≈ 4 min)

---

### SLIDE 7 — Why Machine Learning? (`slideWhyML`)

**[ON-SCREEN]** Side-by-side comparison: "Traditional Programming" (rules → answers) vs "Machine Learning" (examples → rules). Arrows animate between them.

**[VO]**
So — let's get to the heart of it.
For seventy years, programming meant the same thing. _You_ — the human — wrote the rules. You said, _if_ the email contains the word "viagra", flag it as spam. _If_ the temperature is above 30, turn the fan on. Rules in. Answers out.
And that worked beautifully — until we tried to do something _hard_.
Try writing a rule for "is this picture a cat?"
Go on. Try.
Fur? Cats are hairless sometimes. Whiskers? Hidden in the photo. Pointy ears? So do dogs. Every rule you write — there's an exception. Photograph reality is too messy for _if-this-then-that_.
So machine learning flips the whole thing on its head.
Instead of _you_ writing rules, you give the machine **examples**. Thousands. Millions. "Here's a cat. Here's a cat. Here's a cat. Here's a not-cat." And the machine _figures the rules out for itself._
That flip — examples in, rules out — is what changed everything.

---

### SLIDE 8 — The ML Process (`slideMLProcess`)

**[ON-SCREEN]** Pipeline diagram: Data → Model → Training → Prediction. Steps highlight one at a time.

**[VO]**
And the process for doing it is shockingly simple. Four steps. Always the same four steps.
**Step one — data.** You collect the examples. Lots of them. The more, the better.
**Step two — model.** You set up a mathematical structure with a bunch of _adjustable knobs_ — we call them parameters. Modern models have billions of these.
**Step three — training.** You show the model an example, ask it to guess, measure how wrong it was, and nudge the knobs _just slightly_ in the direction that would have made it less wrong.
**Step four — prediction.** Once the knobs are tuned, you show the model something it's never seen before — and ask it to guess.
That's it. That's the whole game. **Data, model, training, prediction.**
Every neural network — from the one that recommends you a YouTube video, to the one that powers ChatGPT — is doing exactly these four steps. Just at unimaginable scale.
And here's the thing nobody tells you when you start learning this stuff. The hardest part isn't the math. The hardest part is _understanding which knobs to turn, and by how much._
Which means — to really understand neural networks — we have to talk about the math underneath. Don't worry. It's gentler than you think.

---

## 🟢 FOUNDATION — Chapter 3: Mathematical Pillars (≈ 8 min)

---

### SLIDE 9 — Math Foundations (`slideMathPillars`)

**[ON-SCREEN]** Four pillars: Linear Algebra, Calculus, Probability, Optimization. Each pillar lights up.

**[VO]**
A neural network rests on four mathematical pillars.
**Linear algebra** — the language of _combining_ numbers in bulk.
**Calculus** — the language of _change_. How does a tiny nudge here change something over there?
**Probability** — the language of _uncertainty_. The model never really _knows_ — it estimates.
**Optimization** — the language of _getting better_. How do you find the best setting for a billion knobs?
You don't need to be a mathematician to understand neural networks. But you do need to be friends with these four ideas.
And of the four, the one we lean on the most — the one that's quietly doing the heavy lifting _every single time_ a model makes a prediction — is the first one. Linear algebra.
So let's start there. And let's start with the simplest possible version of it.

---

### SLIDE 10 — Linear: Single Variable (`slideLinearSingleVar`)

**[ON-SCREEN]** A 2D plot with axes. Equation **y = m·x + b** appears. A slope dialer for **m** sits beside the graph. Clicking draws the line. Arrows animate Δx and Δy along the axes.
**[ACTION]** Click to draw the line. Then turn the slope dial slowly while narrating.

**[VO]**
A single line. **y equals m times x, plus b.**
Two knobs. That's it. Just two.
**m** is the **slope** — how steeply the line tilts. _[turn the dial up]_ Steeper. _[turn it down]_ Shallower.
**b** is the **intercept** — where the line crosses the vertical axis. It just shifts the whole thing up or down.
Now, watch what happens. As I crank up **m**, the change in y for every step of x — that ratio, _delta-y over delta-x_ — grows. That ratio _is_ the slope. That's what **m** literally means.
And here's the part I want you to _feel_ before we move on.
This — _this_ — is the simplest possible neural network. A single neuron. One input, **x**. One output, **y**. One weight, **m**. One bias, **b**.
Everything we build from here is just… this. Repeated. Stacked. Scaled.
The whole skyscraper rests on this one line.

---

### SLIDE 11 — Linear: Multiple Variables (`slideLinearMultiVar`)

**[ON-SCREEN]** 3D plane plot embedded in a phone frame. Two sliders below: **w₁** and **w₂**. Equation **y = w₁·x₁ + w₂·x₂ + b**. Adjusting sliders tilts the plane live.
**[ACTION]** Move w₁ and w₂ sliders while narrating to show the plane tilt.

**[VO]**
Now — the real world isn't one number.
If you're predicting house prices, the input isn't just _square footage_. It's square footage **and** number of bedrooms **and** age of the building **and** distance from a school. Multiple inputs.
So our line becomes a _plane_.
Two inputs — **x₁** and **x₂**. Two weights — **w₁** and **w₂**. One bias.
Watch the plane as I move these sliders. _[move w₁]_ This tilts it along one axis. _[move w₂]_ This tilts it along the other.
And here's the moment of truth — **what used to be the slope, m, is now a whole list of weights, one per input.** Same idea. More dimensions.
A single neuron in a real neural network doesn't have one weight. It has _thousands._ One for every input it sees. And every one of those weights is just… a slope. In its own little direction.

---

### SLIDE 12 — Linear: n Variables (`slideLinearNVar`)

**[ON-SCREEN]** Equation morphs from expanded sum **w₁x₁ + w₂x₂ + … + wₙxₙ + b** down into the compact dot product **w · x + b**. Manim animation runs in panel.
**[ACTION]** Trigger the equation morph animation.

**[VO]**
Now — pictures stop helping at three dimensions. Our brains can't see four.
But the math doesn't care. The math just keeps going.
With **n** inputs, the equation expands into a long sum. **w₁ x₁ plus w₂ x₂ plus w₃ x₃** … all the way to **w-n x-n** … plus a bias.
That's a lot to write. So mathematicians did what mathematicians always do — they invented a shorthand.
_[watch the equation collapse on screen]_
They stacked all the weights into a single object called a **vector**. They stacked all the inputs into another vector. And they invented an operation called the **dot product**, written with a little dot — **w dot x**.
And just like that — a billion-term sum collapses to four characters: **w·x + b.**
That's not a trick. That's not notation for show. That compactness is the _only reason_ we can describe a model with 175 billion parameters in a single line of math.
This is the moment linear algebra earns its keep.

---

### SLIDE 13 — Linear Algebra (`slideLinearAlgebra`)

**[ON-SCREEN]** Matrix multiplication visual: a matrix W times a vector x. Highlights one row dot-product at a time, then expands to whole-matrix operation.

**[VO]**
But a neural network doesn't have _one_ neuron. It has thousands. Tens of thousands. Side by side, all looking at the same input, all computing their own little weighted sum at the same time.
And here's where the magic of linear algebra really lands.
If one neuron is a _vector_ of weights — then a whole _layer_ of neurons is a **matrix.** Every row of that matrix is one neuron. Every column lines up with one input.
Multiply that matrix by the input vector — _one_ operation — and you've computed _every neuron in the layer at once._
That's not a metaphor. That's literally what your GPU is doing, billions of times a second, when you ask ChatGPT a question. Matrix-times-vector. Over and over.
The reason neural networks took off in the last fifteen years isn't _just_ better algorithms. It's that we finally built hardware — GPUs — that can multiply giant matrices ridiculously fast.
The math was ready in 1958. The hardware finally caught up.

---

## 🟢 CLOSE — End of Chapter 3

**[ON-SCREEN]** Hold on the final Linear Algebra slide. Soft fade.

**[VO]**
So — pause for a second. Look at what we've actually got.
We started with the idea that machines can learn from examples instead of rules. We saw that this idea is already running the world — in our cars, our clinics, our code editors. We met the eighty-year relay of stubborn people who got us here.
And then we cracked open the engine. And inside it — at the bottom of every modern neural network — we found _a line._ **y = m x + b.** A line that grew into a plane. A plane that grew into n dimensions. And n dimensions that collapsed back down, beautifully, into **W times x plus b.**
That equation — that one, simple, almost-boring equation — is what a neural network _is_, repeated millions of times.
In the next chapter, we'll take that single line and twist it. We'll bend it. We'll stack it. And we'll watch it turn into something that can _recognise_, _reason_, and _create._
That's where the real magic starts.
I'll see you there.

---

### TIMING ESTIMATE

| Section                     | Slides        | Approx         |
| --------------------------- | ------------- | -------------- |
| Ch 1 — Origins              | 1–6           | ~6 min         |
| Ch 2 — Machine Learning     | 7–8           | ~4 min         |
| Ch 3 — Mathematical Pillars | 9–13          | ~8 min         |
| **Total**                   | **13 slides** | **~17–18 min** |

### RECORDING TIPS

- Average pace: ~150 words per minute. Most slide VO blocks are 100–250 words.
- Pauses are part of the script — let visuals breathe before speaking.
- Italics in `[ACTION]` cues = when to click / animate.
- For dramatic lines ("That's where the real magic starts"), drop your pace and lower your tone slightly.
