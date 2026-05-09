# Manim Animation Integration Guide

This guide explains how to create and integrate animated math equations into your presentation using Manim.

## Setup

The Manim virtual environment is already created at `/manim_env/`. To use it:

```bash
source manim_env/bin/activate
```

## Creating a New Equation Animation

### 1. Write the Manim Script

Create a Python script in `assets/chapter-3-math-pillars/` (e.g., `animate_equation.py`):

```python
from manim import *

class YourEquationAnimation(Scene):
    def construct(self):
        # Set background to transparent or match your theme
        self.camera.background_color = "#f4f1ea"  # Light theme
        
        # Create equation
        eq = MathTex(r"your equation here", font_size=48, color="#1a1815")
        eq.to_edge(UP, buff=1.5)
        
        # Animate
        self.play(Write(eq), run_time=1.5)
        self.wait(1)
```

### 2. Render to MP4

```bash
source manim_env/bin/activate
cd assets/chapter-3-math-pillars
manim -pql animate_equation.py YourEquationAnimation
```

This outputs to `media/videos/animate_equation/480p15/YourEquationAnimation.mp4`

### 3. Copy to Assets

```bash
cp media/videos/animate_equation/480p15/YourEquationAnimation.mp4 your-animation.mp4
```

### 4. Integrate into HTML

Add to your slide HTML (example from `linear-multi-var.html`):

```html
<div class="eq-video-wrap">
  <video
    id="eqVideo"
    class="eq-video"
    autoplay
    muted
    playsinline
    style="display: block; width: 100%; max-width: 400px;">
    <source src="your-animation.mp4" type="video/mp4">
    <div class="eq-pill">Fallback static equation</div>
  </video>
</div>
```

### 5. Add CSS Styling

```css
.eq-video-wrap {
  margin-top: 12px;
  padding: 0;
  opacity: 0;
  transform: translateY(10px);
}

.eq-video {
  border-radius: 12px;
  background: color-mix(in srgb, var(--fg) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--fg) 8%, transparent);
  padding: 0;
}
```

### 6. Add GSAP Animation

In your `startEntrance()` function:

```javascript
gsap.set(".eq-video-wrap", { opacity: 0, y: 10 });
// ... then in timeline:
tl.to(".eq-video-wrap", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
```

### 7. Handle Video Reset

In your `startEntrance()` function:

```javascript
const video = document.getElementById('eqVideo');
if (video) {
  video.currentTime = 0;
  video.play().catch(() => {});
}
```

## Theme Colors

Use these colors to match your presentation themes:

### Light Themes
- **Warm Linen**: bg: `#f4f1ea`, fg: `#1a1815`, c1: `#0e7490`, c2: `#e27b5e`, c3: `#6d28d9`
- **Green Linen**: bg: `#f4f1ea`, fg: `#1a1815`, c1: `#15803d`, c2: `#15803d`, c3: `#6d28d9`
- **Mint**: bg: `#f0f7f4`, fg: `#0f2820`, c1: `#0e7490`, c2: `#166534`, c3: `#6d28d9`

### Dark Themes
- **Midnight**: bg: `#000000`, fg: `#f0ece4`, c1: `#5fe8ec`, c2: `#4ee0a0`, c3: `#a78bfa`
- **Deep Navy**: bg: `#0a1428`, fg: `#eef2f8`, c1: `#5fe8ec`, c2: `#4ee0a0`, c3: `#a78bfa`

## Current Animations

- **bivariate-equation.mp4**: y = w₁x₁ + w₂x₂ + b equation animation
  - Location: `assets/chapter-3-math-pillars/bivariate-equation.mp4`
  - Integrated in: `linear-multi-var.html`

## Tips

1. **Quality**: Use `-pql` flags for high quality output (480p, 15fps)
2. **Theme Awareness**: Set background color in Manim to match the selected theme
3. **Performance**: Keep videos under 200KB for smooth playback
4. **Accessibility**: Always provide a fallback static equation in the `<video>` tag
5. **Sync**: Use GSAP timelines to sync video playback with other animations

## Common Manim Animations

- `Write()`: Write text character by character
- `TransformMatchingShapes()`: Smoothly transform one equation to another
- `Circumscribe()`: Draw a circle around elements
- `FadeIn()` / `FadeOut()`: Fade elements in/out
- `Highlight()`: Highlight specific parts of equations
- `Create()`: Draw animations (line, curve, shape creation)

For more: [Manim Documentation](https://docs.manim.community/)
