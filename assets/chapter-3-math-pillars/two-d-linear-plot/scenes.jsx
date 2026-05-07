// scenes.jsx
// The full timeline of the linear equation 3D plot animation.

const ACCENT = 'oklch(64% 0.15 30)';   // coral red — the plane
const ACCENT_DIM = 'oklch(64% 0.15 30 / 0.45)';
const RED = 'oklch(64% 0.15 30)';      // emphasis color (matches plane)
const GREEN = 'oklch(50% 0.10 220)';   // teal — used for data points & w2 highlight
const AXIS_GRAY = '#3a3a3a';           // axes are uniform gray, like reference
const INK = '#1a1a1a';
const INK_DIM = '#6b6458';
const BG = '#f6f4ef';

const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
const SANS = 'Inter, system-ui, sans-serif';

// ── Timeline keyframes ──────────────────────────────────────────────────────
// (seconds)
const T = {
  EQ_IN:        0.4,   // equation appears
  EQ_BUILT:     2.5,
  AXES_IN:      3.0,   // axes start growing
  AXES_BUILT:   5.0,
  BIAS_IN:      5.5,   // flat plane (only b) appears
  BIAS_BUILT:   7.5,
  W1_IN:        8.5,   // tilt along x1
  W1_BUILT:    10.5,
  W2_IN:       11.5,   // tilt along x2
  W2_BUILT:    13.5,
  DATA_IN:     14.5,   // data points appear (noisy)
  DATA_SNAP:   17.0,   // they snap toward the plane (residuals)
  ORBIT_END:   22.0,   // continuous camera orbit through it all
};

const DURATION = 23;

// Final weights (to display on the plane)
const FINAL_W1 = 0.45;
const FINAL_W2 = 0.35;
const FINAL_B  = 0.4;

// ── Equation overlay ────────────────────────────────────────────────────────
// Reveals term-by-term, and highlights individual terms as they're introduced.
function EquationOverlay() {
  const t = useTime();

  // Build progress for each term
  const showY  = t > T.EQ_IN + 0.0;
  const showW1 = t > T.EQ_IN + 0.4;
  const showW2 = t > T.EQ_IN + 0.9;
  const showB  = t > T.EQ_IN + 1.4;

  // Highlight states
  const hlB  = t >= T.BIAS_IN  - 0.3 && t < T.W1_IN;
  const hlW1 = t >= T.W1_IN    - 0.3 && t < T.W2_IN;
  const hlW2 = t >= T.W2_IN    - 0.3 && t < T.DATA_IN;

  const dim = (active) => active ? INK : 'rgba(26,26,26,0.30)';
  const anyHl = hlB || hlW1 || hlW2;
  const baseColor = anyHl ? 'rgba(26,26,26,0.30)' : INK;

  const Term = ({ children, show, highlight, color }) => {
    const a = animate({ from: 0, to: 1, start: 0, end: 0.4, ease: Easing.easeOutCubic });
    const localT = show ? 1 : 0;
    const opacity = localT;
    return (
      <span style={{
        opacity,
        color: highlight ? color : baseColor,
        transition: 'color 250ms ease',
        fontWeight: highlight ? 700 : 500,
      }}>
        {children}
      </span>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: 70, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: MONO,
        fontSize: 72,
        fontWeight: 500,
        color: INK,
        letterSpacing: '-0.01em',
        display: 'flex', alignItems: 'baseline', gap: 14,
        whiteSpace: 'pre',
      }}>
        <span style={{
          opacity: showY ? 1 : 0,
          transform: showY ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease',
          color: anyHl ? 'rgba(26,26,26,0.30)' : INK,
        }}>y =</span>

        <span style={{
          opacity: showW1 ? 1 : 0,
          transform: showW1 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease, color 250ms ease',
          color: hlW1 ? RED : (anyHl ? 'rgba(26,26,26,0.30)' : INK),
          fontWeight: hlW1 ? 700 : 500,
        }}>w₁x₁</span>

        <span style={{
          opacity: showW2 ? 1 : 0,
          transform: showW2 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease, color 250ms ease',
          color: anyHl ? 'rgba(26,26,26,0.30)' : INK,
        }}>+</span>

        <span style={{
          opacity: showW2 ? 1 : 0,
          transform: showW2 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease, color 250ms ease',
          color: hlW2 ? GREEN : (anyHl ? 'rgba(26,26,26,0.30)' : INK),
          fontWeight: hlW2 ? 700 : 500,
        }}>w₂x₂</span>

        <span style={{
          opacity: showB ? 1 : 0,
          transform: showB ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease, color 250ms ease',
          color: anyHl ? 'rgba(26,26,26,0.30)' : INK,
        }}>+</span>

        <span style={{
          opacity: showB ? 1 : 0,
          transform: showB ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease, color 250ms ease',
          color: hlB ? RED : (anyHl ? 'rgba(26,26,26,0.30)' : INK),
          fontWeight: hlB ? 700 : 500,
        }}>b</span>
      </div>
    </div>
  );
}

// ── Bottom caption that explains current step ──────────────────────────────
function Caption() {
  const t = useTime();

  const captions = [
    { start: T.AXES_IN,   end: T.BIAS_IN,   text: 'A 3D space: two inputs (x₁, x₂) and one output (y).' },
    { start: T.BIAS_IN,   end: T.W1_IN,     text: 'The bias b lifts the plane off the ground — a constant offset.' },
    { start: T.W1_IN,     end: T.W2_IN,     text: 'w₁ tilts the plane along x₁ — how strongly y depends on x₁.' },
    { start: T.W2_IN,     end: T.DATA_IN,   text: 'w₂ tilts it along x₂ — how strongly y depends on x₂.' },
    { start: T.DATA_IN,   end: T.DATA_SNAP, text: 'Each point is an observation: (x₁, x₂, y).' },
    { start: T.DATA_SNAP, end: T.ORBIT_END, text: 'The plane is the model — distance to it is the prediction error.' },
  ];

  const active = captions.find(c => t >= c.start && t < c.end);
  if (!active) return null;

  // Fade in/out within the window
  const fadeIn = 0.35;
  const fadeOut = 0.35;
  const local = t - active.start;
  const remaining = active.end - t;
  let opacity = 1;
  if (local < fadeIn) opacity = local / fadeIn;
  else if (remaining < fadeOut) opacity = remaining / fadeOut;

  return (
    <div style={{
      position: 'absolute',
      bottom: 80, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: SANS,
        fontSize: 26,
        color: INK_DIM,
        letterSpacing: '-0.005em',
        opacity,
        transition: 'opacity 200ms ease',
        textAlign: 'center',
        maxWidth: 1200,
      }}>
        {active.text}
      </div>
    </div>
  );
}

// ── The 3D scene (SVG) ──────────────────────────────────────────────────────
function Scene3D() {
  const t = useTime();

  // Camera: fixed position (no orbit)
  const yaw = -0.55;
  const pitch = 0.55;

  // Axes are now fixed (always fully visible)
  const axisP = 1;

  // Plane weights animate over time
  // Phase 1: bias only — flat plane at y=b
  // Phase 2: add w1
  // Phase 3: add w2
  const bAnim = animate({
    from: 0, to: FINAL_B,
    start: T.BIAS_IN, end: T.BIAS_BUILT,
    ease: Easing.easeOutCubic,
  })(t);
  const w1Anim = animate({
    from: 0, to: FINAL_W1,
    start: T.W1_IN, end: T.W1_BUILT,
    ease: Easing.easeInOutCubic,
  })(t);
  const w2Anim = animate({
    from: 0, to: FINAL_W2,
    start: T.W2_IN, end: T.W2_BUILT,
    ease: Easing.easeInOutCubic,
  })(t);

  // Plane opacity (only show once bias starts)
  const planeOpacity = animate({
    from: 0, to: 1,
    start: T.BIAS_IN - 0.2, end: T.BIAS_IN + 0.5,
    ease: Easing.easeOutCubic,
  })(t);

  // Bias indicator: appears with bias, fades when w1 starts
  const biasIndOpacity = interpolate(
    [T.BIAS_IN - 0.1, T.BIAS_IN + 0.4, T.W1_IN, T.W1_IN + 0.6],
    [0, 1, 1, 0],
    Easing.easeInOutCubic
  )(t);

  // Data points
  const dataAppear = animate({
    from: 0, to: 1,
    start: T.DATA_IN, end: T.DATA_IN + 1.6,
    ease: Easing.linear,
  })(t);
  const dataSnap = animate({
    from: 0, to: 1,
    start: T.DATA_SNAP, end: T.DATA_SNAP + 1.4,
    ease: Easing.easeInOutCubic,
  })(t);

  // Origin
  const O = { x1: 0, x2: 0, y: 0 };

  // Axis endpoints (length = 2.4 in world units)
  const AXIS_LEN = 2.7;
  const xAxisEnd  = { x1: AXIS_LEN, x2: 0,        y: 0 };
  const zAxisEnd  = { x1: 0,        x2: AXIS_LEN, y: 0 };
  const yAxisEnd  = { x1: 0,        x2: 0,        y: AXIS_LEN };

  // Update video root data-screen-label with timestamp
  React.useEffect(() => {
    const root = document.querySelector('[data-video-root]');
    if (root) root.setAttribute('data-screen-label', `t=${t.toFixed(1)}s`);
  }, [Math.floor(t)]);

  return (
    <svg
      width="1920" height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Walls removed per request */}

      {/* Axes */}
      <Axis from={O} to={xAxisEnd} yaw={yaw} pitch={pitch}
            color={AXIS_GRAY} label="x₁" progress={axisP} />
      <Axis from={O} to={zAxisEnd} yaw={yaw} pitch={pitch}
            color={AXIS_GRAY} label="x₂" progress={axisP} />
      <Axis from={O} to={yAxisEnd} yaw={yaw} pitch={pitch}
            color={AXIS_GRAY} label="y" progress={axisP} />

      {/* Plane (drawn before data points so points sit on top) */}
      {planeOpacity > 0.01 && (
        <Plane
          w1={w1Anim} w2={w2Anim} b={bAnim}
          yaw={yaw} pitch={pitch}
          opacity={planeOpacity}
          color={ACCENT}
        />
      )}

      {/* Bias dashed indicator */}
      {biasIndOpacity > 0.01 && (
        <BiasIndicator b={bAnim} yaw={yaw} pitch={pitch} opacity={biasIndOpacity} />
      )}

      {/* Data points */}
      {dataAppear > 0 && (
        <DataPoints
          w1={w1Anim} w2={w2Anim} b={bAnim}
          yaw={yaw} pitch={pitch}
          appear={dataAppear}
          snap={dataSnap}
          showResiduals={t > T.DATA_SNAP - 0.3 && t < T.DATA_SNAP + 2.5}
        />
      )}
    </svg>
  );
}

// ── Final shot: little annotations showing weight values ────────────────────
function WeightReadout() {
  const t = useTime();
  if (t < T.W2_BUILT + 0.5) return null;

  const opacity = animate({
    from: 0, to: 1,
    start: T.W2_BUILT + 0.5, end: T.W2_BUILT + 1.3,
    ease: Easing.easeOutCubic,
  })(t);

  const items = [
    { k: 'w₁', v: FINAL_W1.toFixed(2), color: RED },
    { k: 'w₂', v: FINAL_W2.toFixed(2), color: GREEN },
    { k: 'b',  v: FINAL_B.toFixed(2),  color: RED },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 240, right: 90,
      display: 'flex', flexDirection: 'column', gap: 10,
      opacity,
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: SANS,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: INK_DIM,
        marginBottom: 4,
      }}>
        Fitted weights
      </div>
      {items.map(it => (
        <div key={it.k} style={{
          display: 'flex', alignItems: 'baseline', gap: 14,
          fontFamily: MONO,
          fontSize: 32,
          color: INK,
        }}>
          <span style={{ color: it.color, fontWeight: 700, width: 36 }}>{it.k}</span>
          <span style={{ color: INK_DIM }}>=</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{it.v}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tiny corner timestamp/label (for comment context) ───────────────────────
function CornerLabel() {
  const t = useTime();
  return (
    <div style={{
      position: 'absolute',
      bottom: 24, left: 28,
      fontFamily: MONO,
      fontSize: 14,
      color: 'rgba(26,26,26,0.4)',
      letterSpacing: '0.04em',
    }}>
      LINEAR PLANE · t={t.toFixed(1)}s
    </div>
  );
}

// ── Root composition ────────────────────────────────────────────────────────
function LinearEquationVideo() {
  return (
    <div data-video-root="true" data-screen-label="t=0.0s" style={{ position: 'absolute', inset: 0 }}>
      <Scene3D />
      <EquationOverlay />
      <Caption />
      <WeightReadout />
      <CornerLabel />
    </div>
  );
}

Object.assign(window, {
  LinearEquationVideo, ACCENT, RED, GREEN, INK, BG, T, DURATION,
});
