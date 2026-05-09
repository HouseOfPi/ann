#!/usr/bin/env python3
"""Render bivariate equation animation for light and dark themes."""

from manim import *

config.pixel_width = 640
config.pixel_height = 100
config.frame_width = 8
config.frame_height = 1.25

class Eq_light(Scene):
    def construct(self):
        self.camera.background_color = "#edeae3"
        fg, c1, c2, c3 = "#1a1815", "#0e7490", "#e27b5e", "#6d28d9"

        univariate = MathTex(r"y = w_1 x_1 + b", font_size=36, color=fg)
        univariate.to_edge(LEFT, buff=0.4)
        self.play(Write(univariate), run_time=1.2)
        self.wait(0.4)

        bivariate = MathTex(r"y = w_1 x_1 + w_2 x_2 + b", font_size=36, color=fg)
        bivariate.to_edge(LEFT, buff=0.4)
        self.play(TransformMatchingShapes(univariate, bivariate), run_time=1.2)
        self.wait(0.6)

        colored_eq = MathTex(r"y = ", r"w_1 x_1", r" + ", r"w_2 x_2", r" + ", r"b", font_size=36, color=fg)
        colored_eq.to_edge(LEFT, buff=0.4)
        colored_eq[1].set_color(c1)
        colored_eq[3].set_color(c2)
        colored_eq[5].set_color(c3)
        self.play(TransformMatchingShapes(bivariate, colored_eq), run_time=1.0)
        self.wait(1.5)


class Eq_dark(Scene):
    def construct(self):
        self.camera.background_color = "#000000"
        fg, c1, c2, c3 = "#eef2f8", "#5fe8ec", "#4ee0a0", "#a78bfa"

        univariate = MathTex(r"y = w_1 x_1 + b", font_size=36, color=fg)
        univariate.to_edge(LEFT, buff=0.4)
        self.play(Write(univariate), run_time=1.2)
        self.wait(0.4)

        bivariate = MathTex(r"y = w_1 x_1 + w_2 x_2 + b", font_size=36, color=fg)
        bivariate.to_edge(LEFT, buff=0.4)
        self.play(TransformMatchingShapes(univariate, bivariate), run_time=1.2)
        self.wait(0.6)

        colored_eq = MathTex(r"y = ", r"w_1 x_1", r" + ", r"w_2 x_2", r" + ", r"b", font_size=36, color=fg)
        colored_eq.to_edge(LEFT, buff=0.4)
        colored_eq[1].set_color(c1)
        colored_eq[3].set_color(c2)
        colored_eq[5].set_color(c3)
        self.play(TransformMatchingShapes(bivariate, colored_eq), run_time=1.0)
        self.wait(1.5)
