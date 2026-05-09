#!/usr/bin/env python3
"""
Manim script to animate the bivariate equation:
y = w₁x₁ + w₂x₂ + b

Animation sequence:
1. Show univariate equation: y = w₁x₁ + b
2. Expand to show the additional term: + w₂x₂
3. Complete bivariate equation appears
"""

from manim import *

config.pixel_width = 640
config.pixel_height = 100
config.frame_width = 8
config.frame_height = 1.25

# Colors matching the Midnight theme card
BG    = "#000000"
FG    = "#eef2f8"
C1    = "#5fe8ec"
C2    = "#4ee0a0"
C3    = "#a78bfa"

class BivariateEquationAnimation(Scene):
    def construct(self):
        self.camera.background_color = BLACK

        # Step 1: Univariate equation
        univariate = MathTex(
            r"y = w_1 x_1 + b",
            font_size=36,
            color=FG
        )
        univariate.to_edge(LEFT, buff=0.4)

        self.play(Write(univariate), run_time=1.2)
        self.wait(0.4)

        # Step 2: Expand to bivariate
        bivariate = MathTex(
            r"y = w_1 x_1 + w_2 x_2 + b",
            font_size=36,
            color=FG
        )
        bivariate.to_edge(LEFT, buff=0.4)

        self.play(TransformMatchingShapes(univariate, bivariate), run_time=1.2)
        self.wait(0.6)

        # Step 3: Color-coded version
        colored_eq = MathTex(
            r"y = ",
            r"w_1 x_1",
            r" + ",
            r"w_2 x_2",
            r" + ",
            r"b",
            font_size=36,
            color=FG
        )
        colored_eq.to_edge(LEFT, buff=0.4)
        colored_eq[1].set_color(C1)
        colored_eq[3].set_color(C2)
        colored_eq[5].set_color(C3)

        self.play(TransformMatchingShapes(bivariate, colored_eq), run_time=1.0)
        self.wait(1.5)


if __name__ == "__main__":
    # Render command:
    # manim -pql animate_equation.py BivariateEquationAnimation
    # For web: manim -i -o animate_equation.mp4 animate_equation.py BivariateEquationAnimation
    pass
