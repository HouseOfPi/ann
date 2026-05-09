#!/usr/bin/env python3
"""
n-variable linear equation: expanded form on top, compact form below.

Sequence:
  1. Expanded form writes in at the top:
       y = w_1 x_1 + w_2 x_2 + w_3 x_3 + ... + w_n x_n + b
  2. Each w_i x_i term pulses (Indicate) in sequence.
  3. A downward arrow + label "compact form" appears below.
  4. The compact dot-product form fades up below: y = w · x + b
     (with vector brackets around w and x).
  5. Hold on the final frame — both equations stay visible.

Two themed scenes are exposed so the slide can swap mp4 sources by theme.

Render commands (run from this directory, with the manim_env active):

    manim -qm animate_n_var_eq.py NVarEq_dark  -o n-var-eq-dark
    manim -qm animate_n_var_eq.py NVarEq_light -o n-var-eq-light

Outputs land in media/videos/animate_n_var_eq/<quality>/. Move into
./equation-animation/ as n-var-eq-dark.mp4 / n-var-eq-light.mp4.
"""

from manim import *


# Render canvas matches the slide's right-stage aspect (4:3) so it sits in
# the card with no letterboxing.
config.pixel_width = 1280
config.pixel_height = 960
config.frame_width = 8
config.frame_height = 6


def _build(scene, fg, c1, c2, c3, bg):
    scene.camera.background_color = bg

    # ---- Stage 1: write the expanded form ---------------------------------
    # Split into substrings so we can colour & highlight individual terms.
    expanded = MathTex(
        r"y = ",                # 0
        r"w_1 x_1",             # 1
        r" + ",                 # 2
        r"w_2 x_2",             # 3
        r" + ",                 # 4
        r"w_3 x_3",             # 5
        r" + \cdots + ",        # 6
        r"w_n x_n",             # 7
        r" + ",                 # 8
        r"b",                   # 9
        font_size=52,
        color=fg,
    )
    # Tint the weight-input terms in c1 (the slide's accent), bias in c3.
    for i in (1, 3, 5, 7):
        expanded[i].set_color(c1)
    expanded[9].set_color(c3)
    # Faux-bold: paint the glyph strokes the same colour as the fill so the
    # rendered text reads thicker without switching fonts.
    for sub in expanded:
        sub.set_stroke(width=1.2, color=sub.get_color(), opacity=1.0,
                       background=True)
    # Pin the expanded form near the top of the frame.
    expanded.to_edge(UP, buff=1.0)
    # Ensure the whole expanded form fits inside the frame with margin.
    max_w = config.frame_width - 1.0
    if expanded.width > max_w:
        expanded.scale(max_w / expanded.width)

    scene.play(Write(expanded), run_time=1.6)
    scene.wait(0.4)

    # ---- Stage 2: pulse each term in sequence -----------------------------
    for i in (1, 3, 5, 7):
        scene.play(
            Indicate(expanded[i], color=c2, scale_factor=1.18),
            run_time=0.45,
        )
    scene.wait(0.3)

    # ---- Stage 3: arrow + label down to the compact form ------------------
    arrow = Arrow(
        start=expanded.get_bottom() + DOWN * 0.15,
        end=expanded.get_bottom() + DOWN * 1.2,
        buff=0.0,
        color=fg,
        stroke_width=3,
        max_tip_length_to_length_ratio=0.18,
    ).set_opacity(0.6)

    label = Tex("compact form", color=fg, font_size=24).set_opacity(0.6)
    label.next_to(arrow, RIGHT, buff=0.25)

    scene.play(GrowArrow(arrow), FadeIn(label, shift=DOWN * 0.1), run_time=0.7)

    # ---- Stage 4: compact dot-product form fades up below -----------------
    # Brackets make the vector nature explicit. Substring layout:
    #   y = [ w ] · [ x ] + b
    compact = MathTex(
        r"y = ",                # 0
        r"\bigl[\,",            # 1  left bracket for w
        r"w",                   # 2  weight vector
        r"\,\bigr]",            # 3  right bracket
        r"\,\cdot\,",           # 4  dot product symbol
        r"\bigl[\,",            # 5  left bracket for x
        r"x",                   # 6  input vector
        r"\,\bigr]",            # 7  right bracket
        r" + ",                 # 8
        r"b",                   # 9
        font_size=72,
        color=fg,
    )
    compact[2].set_color(c1)
    compact[9].set_color(c3)
    for sub in compact:
        sub.set_stroke(width=1.4, color=sub.get_color(), opacity=1.0,
                       background=True)
    compact.next_to(arrow, DOWN, buff=0.6)

    scene.play(
        FadeIn(compact, shift=UP * 0.25),
        run_time=0.9,
    )

    # Subtle settle: a soft scale pulse on the new form.
    scene.play(
        compact.animate.scale(1.04),
        rate_func=there_and_back,
        run_time=0.6,
    )

    # Hold on the final frame so the freeze-on-last-frame strategy in HTML
    # has something restful to land on. Both equations remain visible.
    scene.wait(2.0)


class NVarEq_dark(Scene):
    def construct(self):
        _build(
            self,
            fg="#eef2f8", c1="#5fe8ec", c2="#4ee0a0", c3="#a78bfa",
            bg="#000000",
        )


class NVarEq_light(Scene):
    def construct(self):
        _build(
            self,
            fg="#1a1815", c1="#0e7490", c2="#e27b5e", c3="#6d28d9",
            bg="#edeae3",
        )
