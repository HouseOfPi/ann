// scenes.jsx — Neuron animation scenes

// ─── Palette presets ─────────────────────────────────────────────────────
const PALETTES = {
  'Warm Linen': {
    bg: '#f4f1ea', ink: '#1a1a1a', dim: '#8a8378', line: '#c9c2b5',
    accent: 'oklch(62% 0.14 255)', accent2: 'oklch(68% 0.14 35)',
    neuron: '#1a1a1a', neuronFill: '#fafaf7',
  },
  'Paper White': {
    bg: '#ffffff', ink: '#111111', dim: '#888888', line: '#d4d4d4',
    accent: 'oklch(55% 0.18 265)', accent2: 'oklch(62% 0.18 20)',
    neuron: '#111111', neuronFill: '#fafafa',
  },
  'Midnight': {
    bg: '#0f1117', ink: '#eaeaea', dim: '#7a8091', line: '#2a2f3a',
    accent: 'oklch(72% 0.15 220)', accent2: 'oklch(75% 0.15 60)',
    neuron: '#eaeaea', neuronFill: '#1a1e28',
  },
  'Mint': {
    bg: '#eef4ee', ink: '#10241a', dim: '#7a8a80', line: '#c2cfc4',
    accent: 'oklch(55% 0.12 160)', accent2: 'oklch(65% 0.15 30)',
    neuron: '#10241a', neuronFill: '#f4faf4',
  },
  'Plum': {
    bg: '#f6f1f5', ink: '#2a1a2a', dim: '#8d7a8c', line: '#cfc2cc',
    accent: 'oklch(58% 0.16 320)', accent2: 'oklch(68% 0.14 60)',
    neuron: '#2a1a2a', neuronFill: '#faf5f9',
  },
};

// Tweak defaults — host rewrites this block on persist
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "Warm Linen"
}/*EDITMODE-END*/;

// Live-updated palette ref. COLORS is a getter proxy so all existing
// references (COLORS.bg, etc.) reflect the current palette.
let CURRENT_PALETTE = TWEAK_DEFAULTS.palette in PALETTES ? TWEAK_DEFAULTS.palette : 'Warm Linen';
const COLORS = new Proxy({}, {
  get(_, key) { return PALETTES[CURRENT_PALETTE][key]; }
});

// Subscribers so components re-render on palette change
const paletteSubs = new Set();
function setPalette(name) {
  if (!PALETTES[name]) return;
  CURRENT_PALETTE = name;
  paletteSubs.forEach(fn => fn());
}
function usePaletteVersion() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    paletteSubs.add(force);
    return () => paletteSubs.delete(force);
  }, []);
  return CURRENT_PALETTE;
}

// View router — 'neuron' or 'network'
let CURRENT_VIEW = (() => { try { return localStorage.getItem('nn-view') || 'neuron'; } catch { return 'neuron'; } })();
const viewSubs = new Set();
function setView(v) {
  CURRENT_VIEW = v;
  try { localStorage.setItem('nn-view', v); } catch {}
  viewSubs.forEach(fn => fn());
}
function useView() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => { viewSubs.add(force); return () => viewSubs.delete(force); }, []);
  return CURRENT_VIEW;
}

const FONT_SANS = 'Inter, system-ui, sans-serif';
const FONT_MONO = 'JetBrains Mono, ui-monospace, monospace';

// Canvas geometry — center of neuron at (960, 540) on 1920×1080
const CX = 960, CY = 540;
const NEURON_R = 120;

// Input geometry — 4 inputs on the left
const N_INPUTS = 4;
const INPUT_X = 340;
const INPUT_SPACING = 160;
const INPUT_Y0 = CY - (INPUT_SPACING * (N_INPUTS - 1)) / 2;
const INPUT_POSITIONS = Array.from({ length: N_INPUTS }, (_, i) => ({
  x: INPUT_X,
  y: INPUT_Y0 + i * INPUT_SPACING,
}));

// Bias node — sits below the inputs, enters line from below-left into neuron
const BIAS_POS = { x: INPUT_X + 80, y: INPUT_Y0 + N_INPUTS * INPUT_SPACING - 20 };

// Output position
const OUTPUT_X = 1600;
const OUTPUT_Y = CY;

// Sample input values and weights (stable across the video)
const INPUT_VALUES = [0.8, 0.3, 0.6, 0.9];
const WEIGHTS = [0.7, -0.4, 0.5, 0.2];
const BIAS = 0.1;
const Z = INPUT_VALUES.reduce((acc, x, i) => acc + x * WEIGHTS[i], 0) + BIAS;
// σ(z)
const OUTPUT_VAL = 1 / (1 + Math.exp(-Z));

// ─── Helpers ─────────────────────────────────────────────────────────────

// Get a point along a straight line from a→b at progress t (0..1)
function lerpPoint(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// ─── Title card ──────────────────────────────────────────────────────────
function TitleCard() {
  return (
    <Sprite start={0} end={3.2}>
      {({ localTime, duration }) => {
        const exitStart = duration - 0.5;
        let opacity = 1;
        if (localTime < 0.6) opacity = Easing.easeOutCubic(localTime / 0.6);
        else if (localTime > exitStart) opacity = 1 - Easing.easeInCubic((localTime - exitStart) / 0.5);
        return (
          <div style={{
            position: 'absolute',
            left: 0, right: 0, top: 380,
            textAlign: 'center',
            opacity,
            fontFamily: FONT_SANS,
          }}>
            <div style={{
              fontSize: 22, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: COLORS.dim, fontWeight: 500, marginBottom: 28,
            }}>
              Artificial Neural Networks
            </div>
            <div style={{
              fontSize: 96, fontWeight: 600, color: COLORS.ink,
              letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              One Neuron
            </div>
            <div style={{
              fontSize: 26, color: COLORS.dim, marginTop: 32,
              fontFamily: FONT_MONO, letterSpacing: '0.02em',
            }}>
              inputs  →  weighted sum  →  activation  →  output
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ─── The neuron circle ───────────────────────────────────────────────────
// Appears at t≈3, stays. Glows when firing (t≈15-17).
function NeuronBody({ appearAt = 3.0 }) {
  const t = useTime();

  // Appearance
  const appear = animate({ from: 0, to: 1, start: appearAt, end: appearAt + 0.7, ease: Easing.easeOutBack })(t);
  // Accumulating fill during summation (t=11-14.5) — represents value building up
  const fillLevel = animate({ from: 0, to: 1, start: 11, end: 14.5, ease: Easing.easeInOutCubic })(t);
  // Firing glow (15-17)
  const fire = animate({ from: 0, to: 1, start: 15, end: 15.8, ease: Easing.easeOutCubic })(t)
             - animate({ from: 0, to: 1, start: 17.5, end: 18.5, ease: Easing.easeInCubic })(t);

  if (appear === 0) return null;

  const scale = appear;
  const glowOpacity = clamp(fire, 0, 1);

  return (
    <div style={{
      position: 'absolute',
      left: CX - NEURON_R, top: CY - NEURON_R,
      width: NEURON_R * 2, height: NEURON_R * 2,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
    }}>
      {/* Outer glow when firing */}
      <div style={{
        position: 'absolute', inset: -40,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 65%)`,
        opacity: glowOpacity * 0.45,
        filter: 'blur(12px)',
      }}/>
      {/* Filling inner color that rises as sum accumulates */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: COLORS.neuronFill,
        border: `2.5px solid ${COLORS.neuron}`,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: `${fillLevel * 100}%`,
          background: `linear-gradient(to top, ${COLORS.accent} 0%, oklch(72% 0.12 255) 100%)`,
          opacity: glowOpacity > 0.1 ? 0.95 : 0.35,
          transition: 'opacity 0.3s',
        }}/>
      </div>
    </div>
  );
}

// ─── Bias node ───────────────────────────────────────────────────────────
function BiasNode({ appearAt = 3.3 }) {
  const t = useTime();
  const delay = appearAt + N_INPUTS * 0.08;
  const appear = animate({ from: 0, to: 1, start: delay, end: delay + 0.5, ease: Easing.easeOutBack })(t);
  if (appear === 0) return null;
  const valOpacity = animate({ from: 0, to: 1, start: delay + 0.3, end: delay + 0.8 })(t);
  // Bias label (+b) appears with weights at t=7
  const bOpacity = animate({ from: 0, to: 1, start: 7 + N_INPUTS * 0.1, end: 7.6 + N_INPUTS * 0.1 })(t);
  return (
    <>
      {/* Bias node — smaller, square-ish with dashed border to differentiate */}
      <div style={{
        position: 'absolute',
        left: BIAS_POS.x - 28, top: BIAS_POS.y - 28,
        width: 56, height: 56,
        borderRadius: '50%',
        background: COLORS.bg,
        border: `2px dashed ${COLORS.dim}`,
        transform: `scale(${appear})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_MONO, fontSize: 20, fontWeight: 500,
        color: COLORS.dim,
      }}>
        b
      </div>
      {/* Value */}
      <div style={{
        position: 'absolute',
        left: BIAS_POS.x - 120, top: BIAS_POS.y - 12,
        width: 80, textAlign: 'right',
        fontFamily: FONT_MONO, fontSize: 18,
        color: COLORS.dim,
        opacity: valOpacity,
      }}>
        {BIAS > 0 ? '+' : ''}{BIAS.toFixed(1)}
      </div>
      {/* "bias" caption underneath */}
      <div style={{
        position: 'absolute',
        left: BIAS_POS.x - 60, top: BIAS_POS.y + 40,
        width: 120, textAlign: 'center',
        fontFamily: FONT_SANS, fontSize: 12,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: COLORS.dim, fontWeight: 500,
        opacity: bOpacity,
      }}>
        bias
      </div>
    </>
  );
}

// ─── Input nodes on the left ─────────────────────────────────────────────
function InputNodes({ appearAt = 3.3 }) {
  const t = useTime();
  return (
    <>
      {INPUT_POSITIONS.map((p, i) => {
        const delay = appearAt + i * 0.08;
        const appear = animate({ from: 0, to: 1, start: delay, end: delay + 0.5, ease: Easing.easeOutBack })(t);
        if (appear === 0) return null;

        // Value label fade-in
        const valOpacity = animate({ from: 0, to: 1, start: delay + 0.3, end: delay + 0.8 })(t);
        // Weight label (w_i) — appears at t=7
        const wDelay = 7 + i * 0.1;
        const wOpacity = animate({ from: 0, to: 1, start: wDelay, end: wDelay + 0.5 })(t);

        return (
          <React.Fragment key={i}>
            {/* Input node */}
            <div style={{
              position: 'absolute',
              left: p.x - 36, top: p.y - 36,
              width: 72, height: 72,
              borderRadius: '50%',
              background: COLORS.bg,
              border: `2px solid ${COLORS.ink}`,
              transform: `scale(${appear})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_MONO, fontSize: 24, fontWeight: 500,
              color: COLORS.ink,
            }}>
              x<sub style={{ fontSize: 14 }}>{i + 1}</sub>
            </div>
            {/* Value */}
            <div style={{
              position: 'absolute',
              left: p.x - 140, top: p.y - 14,
              width: 90, textAlign: 'right',
              fontFamily: FONT_MONO, fontSize: 22,
              color: COLORS.dim,
              opacity: valOpacity,
            }}>
              {INPUT_VALUES[i].toFixed(1)}
            </div>
            {/* Weight label along line */}
            <div style={{
              position: 'absolute',
              left: (p.x + CX) / 2 - 50,
              top: (p.y + CY) / 2 - 40,
              width: 100, textAlign: 'center',
              fontFamily: FONT_MONO, fontSize: 20,
              color: COLORS.accent2,
              opacity: wOpacity,
              fontWeight: 600,
              background: COLORS.bg,
              padding: '2px 6px',
              borderRadius: 4,
              transform: `translateY(${-6 + (i - 1.5) * -4}px)`,
            }}>
              w<sub style={{ fontSize: 12 }}>{i + 1}</sub>={WEIGHTS[i] > 0 ? ' ' : ''}{WEIGHTS[i].toFixed(1)}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}

// ─── Connection lines (drawn with SVG for nice stroke animation) ─────────
function Connections({ drawStart = 4.0, drawDur = 1.2 }) {
  const t = useTime();

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
         viewBox="0 0 1920 1080">
      {INPUT_POSITIONS.map((p, i) => {
        // Connection endpoint on neuron edge — compute along line from input to neuron center
        const dx = CX - p.x, dy = CY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const endX = CX - (dx / dist) * NEURON_R;
        const endY = CY - (dy / dist) * NEURON_R;

        const startX = p.x + (dx / dist) * 36;
        const startY = p.y + (dy / dist) * 36;

        const segLen = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

        const delay = drawStart + i * 0.1;
        const progress = clamp(animate({
          from: 0, to: 1, start: delay, end: delay + drawDur, ease: Easing.easeInOutCubic
        })(t), 0, 1);

        // Line width scales with |weight| for visual interest
        const strokeW = 1.5 + Math.abs(WEIGHTS[i]) * 4;

        return (
          <line key={i}
                x1={startX} y1={startY} x2={endX} y2={endY}
                stroke={COLORS.line}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeDasharray={segLen}
                strokeDashoffset={segLen * (1 - progress)}
          />
        );
      })}
      {/* Bias connection — dashed, thinner */}
      {(() => {
        const dx = CX - BIAS_POS.x, dy = CY - BIAS_POS.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const sx = BIAS_POS.x + (dx/dist) * 28;
        const sy = BIAS_POS.y + (dy/dist) * 28;
        const ex = CX - (dx/dist) * NEURON_R;
        const ey = CY - (dy/dist) * NEURON_R;
        const segLen = Math.sqrt((ex-sx)**2 + (ey-sy)**2);
        const delay = drawStart + N_INPUTS * 0.1;
        const progress = clamp(animate({ from:0, to:1, start:delay, end:delay+drawDur, ease:Easing.easeInOutCubic })(t), 0, 1);
        if (progress === 0) return null;
        // Animate a solid line revealing the dashed pattern by clipping via a second stroke
        const visibleLen = segLen * progress;
        const angle = Math.atan2(ey - sy, ex - sx);
        const cex = sx + Math.cos(angle) * visibleLen;
        const cey = sy + Math.sin(angle) * visibleLen;
        return (
          <line x1={sx} y1={sy} x2={cex} y2={cey}
            stroke={COLORS.dim} strokeWidth={1.5} strokeLinecap="round"
            strokeDasharray="4 6"
            opacity={0.7}
          />
        );
      })()}
      {/* Output line */}
      <OutputLine />
    </svg>
  );
}

function OutputLine() {
  const t = useTime();
  const drawStart = 4.4;
  const segLen = OUTPUT_X - (CX + NEURON_R);
  const progress = clamp(animate({
    from: 0, to: 1, start: drawStart, end: drawStart + 1.0, ease: Easing.easeInOutCubic,
  })(t), 0, 1);

  return (
    <line x1={CX + NEURON_R} y1={CY} x2={OUTPUT_X - 40} y2={CY}
          stroke={COLORS.line} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={segLen}
          strokeDashoffset={segLen * (1 - progress)}
    />
  );
}

// ─── Pulses traveling down the input lines ───────────────────────────────
// Each pulse: leaves input at ~t=8 + i*0.12, arrives at neuron ~1.0s later.
function InputPulses() {
  const t = useTime();

  return (
    <>
      {INPUT_POSITIONS.map((p, i) => {
        const dx = CX - p.x, dy = CY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const startX = p.x + (dx / dist) * 36;
        const startY = p.y + (dy / dist) * 36;
        const endX = CX - (dx / dist) * NEURON_R;
        const endY = CY - (dy / dist) * NEURON_R;

        const launch = 8.5;
        const travel = 1.8;
        const prog = clamp(animate({
          from: 0, to: 1, start: launch, end: launch + travel, ease: Easing.easeInOutCubic,
        })(t), 0, 1);

        if (prog === 0 || prog === 1) return null;

        const cur = lerpPoint({ x: startX, y: startY }, { x: endX, y: endY }, prog);

        // Size reflects weight magnitude
        const size = 18 + Math.abs(WEIGHTS[i]) * 16;
        // Color: positive weight → accent, negative → warm
        const color = WEIGHTS[i] >= 0 ? COLORS.accent : COLORS.accent2;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: cur.x - size / 2, top: cur.y - size / 2,
            width: size, height: size,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 20px ${color}`,
            opacity: 0.85,
          }}/>
        );
      })}
    </>
  );
}

// ─── Bias pulse — travels alongside input pulses ─────────────────────────
function BiasPulse() {
  const t = useTime();
  const dx = CX - BIAS_POS.x, dy = CY - BIAS_POS.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const sx = BIAS_POS.x + (dx/dist) * 28;
  const sy = BIAS_POS.y + (dy/dist) * 28;
  const ex = CX - (dx/dist) * NEURON_R;
  const ey = CY - (dy/dist) * NEURON_R;
  const launch = 8.5;
  const travel = 1.8;
  const prog = clamp(animate({ from:0, to:1, start:launch, end:launch+travel, ease:Easing.easeInOutCubic })(t), 0, 1);
  if (prog === 0 || prog === 1) return null;
  const cur = lerpPoint({ x:sx, y:sy }, { x:ex, y:ey }, prog);
  const size = 14;
  return (
    <div style={{
      position:'absolute',
      left: cur.x - size/2, top: cur.y - size/2,
      width:size, height:size,
      borderRadius:'50%',
      background: COLORS.dim,
      border: `2px solid ${COLORS.bg}`,
      opacity: 0.8,
    }}/>
  );
}

// ─── Formula panel below the neuron ──────────────────────────────────────
function FormulaPanel() {
  const t = useTime();

  // Stage 1: Σ wᵢxᵢ + b appears as inputs arrive (11-14.5s)
  const sumOp = animate({ from: 0, to: 1, start: 11.0, end: 11.6, ease: Easing.easeOutCubic })(t);
  // Stage 2: = z evaluates (13-14s)
  const zOp = animate({ from: 0, to: 1, start: 13.0, end: 13.6 })(t);
  // Stage 3: f(z) = ... output (15.5-17s)
  const fOp = animate({ from: 0, to: 1, start: 15.5, end: 16.1 })(t);
  // Panel exit (19.5-20.5)
  const exit = animate({ from: 0, to: 1, start: 19.5, end: 20.5, ease: Easing.easeInCubic })(t);

  const panelOpacity = clamp(sumOp - exit, 0, 1);
  if (panelOpacity === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      left: CX - 500, top: CY + 220,
      width: 1000,
      opacity: panelOpacity,
      textAlign: 'center',
      fontFamily: FONT_MONO,
    }}>
      <div style={{
        fontSize: 34,
        color: COLORS.ink,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}>
        <span style={{ color: COLORS.dim }}>z</span>
        <span style={{ color: COLORS.dim, margin: '0 14px' }}>=</span>
        <span style={{ opacity: sumOp }}>
          <span style={{ fontSize: 42, color: COLORS.accent, verticalAlign: 'middle' }}>Σ</span>
          <span style={{ color: COLORS.ink, margin: '0 2px' }}>w</span>
          <span style={{ fontSize: 20, color: COLORS.dim, verticalAlign: 'sub' }}>i</span>
          <span style={{ color: COLORS.ink }}>·x</span>
          <span style={{ fontSize: 20, color: COLORS.dim, verticalAlign: 'sub' }}>i</span>
          <span style={{ margin: '0 10px' }}>+</span>
          <span>b</span>
        </span>
        <span style={{ opacity: zOp }}>
          <span style={{ color: COLORS.dim, margin: '0 14px' }}>=</span>
          <span style={{ color: COLORS.accent, fontWeight: 600 }}>{Z.toFixed(2)}</span>
        </span>
      </div>

      <div style={{
        fontSize: 30,
        color: COLORS.ink,
        marginTop: 24,
        opacity: fOp,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ color: COLORS.dim }}>output</span>
        <span style={{ color: COLORS.dim, margin: '0 14px' }}>=</span>
        <span>f(z)</span>
        <span style={{ color: COLORS.dim, margin: '0 14px' }}>=</span>
        <span style={{ color: COLORS.accent2, fontWeight: 600 }}>{OUTPUT_VAL.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Output pulse traveling right ────────────────────────────────────────
function OutputPulse() {
  const t = useTime();
  const launch = 16.2;
  const travel = 1.8;
  const prog = clamp(animate({
    from: 0, to: 1, start: launch, end: launch + travel, ease: Easing.easeOutCubic,
  })(t), 0, 1);

  if (prog === 0) return null;

  const x = (CX + NEURON_R) + (OUTPUT_X - 40 - (CX + NEURON_R)) * prog;
  // Fade near the end
  const opacity = prog < 0.92 ? 1 : (1 - (prog - 0.92) / 0.08);

  return (
    <div style={{
      position: 'absolute',
      left: x - 16, top: CY - 16,
      width: 32, height: 32,
      borderRadius: '50%',
      background: COLORS.accent2,
      boxShadow: `0 0 30px ${COLORS.accent2}`,
      opacity,
    }}/>
  );
}

// ─── Output node on the right ────────────────────────────────────────────
function OutputNode() {
  const t = useTime();
  const appear = animate({ from: 0, to: 1, start: 4.8, end: 5.3, ease: Easing.easeOutBack })(t);
  if (appear === 0) return null;

  // Value appears after pulse arrives (t≈18)
  const valOp = animate({ from: 0, to: 1, start: 17.8, end: 18.4 })(t);
  const label = animate({ from: 0, to: 1, start: 5.0, end: 5.5 })(t);

  return (
    <>
      <div style={{
        position: 'absolute',
        left: OUTPUT_X - 40, top: OUTPUT_Y - 40,
        width: 80, height: 80,
        borderRadius: '50%',
        background: COLORS.bg,
        border: `2.5px solid ${COLORS.ink}`,
        transform: `scale(${appear})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_MONO, fontSize: 26, fontWeight: 500,
        color: COLORS.ink,
      }}>
        y
      </div>
      {/* Label below */}
      <div style={{
        position: 'absolute',
        left: OUTPUT_X - 100, top: OUTPUT_Y + 56,
        width: 200, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 18,
        color: COLORS.dim,
        opacity: label,
      }}>
        output
      </div>
      {/* Value — appears after pulse */}
      <div style={{
        position: 'absolute',
        left: OUTPUT_X - 100, top: OUTPUT_Y + 86,
        width: 200, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 24, fontWeight: 600,
        color: COLORS.accent2,
        opacity: valOp,
      }}>
        {OUTPUT_VAL.toFixed(2)}
      </div>
    </>
  );
}

// ─── Stage labels (inputs, weights, bias, activation) ────────────────────
function StageLabels() {
  const t = useTime();

  // "Inputs" label above input column
  const inputsOp = animate({ from: 0, to: 1, start: 3.6, end: 4.2 })(t)
                 - animate({ from: 0, to: 1, start: 19.5, end: 20.2 })(t);

  // "Weights" label
  const weightsOp = animate({ from: 0, to: 1, start: 7.2, end: 7.8 })(t)
                  - animate({ from: 0, to: 1, start: 19.5, end: 20.2 })(t);

  // Caption under neuron stages
  const stage1 = animate({ from: 0, to: 1, start: 8.0, end: 8.5 })(t)
               - animate({ from: 0, to: 1, start: 11.0, end: 11.5 })(t);
  const stage2 = animate({ from: 0, to: 1, start: 11.0, end: 11.5 })(t)
               - animate({ from: 0, to: 1, start: 15.0, end: 15.5 })(t);
  const stage3 = animate({ from: 0, to: 1, start: 15.0, end: 15.5 })(t)
               - animate({ from: 0, to: 1, start: 19.5, end: 20.2 })(t);

  const captionText = stage3 > 0.3 ? 'apply activation function' :
                      stage2 > 0.3 ? 'sum the weighted inputs' :
                      stage1 > 0.3 ? 'each input × its weight' : '';
  const captionOp = Math.max(stage1, stage2, stage3);

  return (
    <>
      <div style={{
        position: 'absolute',
        left: INPUT_X - 80, top: 220,
        width: 160, textAlign: 'center',
        fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: COLORS.dim,
        opacity: clamp(inputsOp, 0, 1),
      }}>
        Inputs
      </div>

      <div style={{
        position: 'absolute',
        left: CX - 100, top: 220,
        width: 200, textAlign: 'center',
        fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: COLORS.accent2,
        opacity: clamp(weightsOp, 0, 1),
      }}>
        Weights
      </div>

      <div style={{
        position: 'absolute',
        left: OUTPUT_X - 100, top: 220,
        width: 200, textAlign: 'center',
        fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: COLORS.dim,
        opacity: clamp(inputsOp, 0, 1),
      }}>
        Output
      </div>

      {/* Current-stage caption — floats above the neuron */}
      {captionOp > 0.05 && (
        <div style={{
          position: 'absolute',
          left: CX - 300, top: CY - 230,
          width: 600, textAlign: 'center',
          fontFamily: FONT_SANS, fontSize: 28, fontWeight: 500,
          color: COLORS.ink,
          opacity: clamp(captionOp, 0, 1),
          transition: 'opacity 0.2s',
        }}>
          {captionText}
        </div>
      )}
    </>
  );
}

// ─── Timestamp label for commenting ──────────────────────────────────────
function TimestampLabel() {
  const t = useTime();
  const sec = Math.floor(t);
  React.useEffect(() => {
    const root = document.querySelector('[data-video-root]');
    if (root) root.setAttribute('data-screen-label', `t=${sec}s`);
  }, [sec]);
  return null;
}

// ─── Sound system ────────────────────────────────────────────────────────
// Synthesized tones via Web Audio API — no external files needed.
// Cue list tied to the timeline:
//   3.0  — neuron appears (soft low thud)
//   3.3, 3.38, 3.46, 3.54 — input nodes pop in (short clicks)
//   8.5  — pulses launch (swoosh up)
//  10.3  — pulses arrive, summation begins (sustained pad)
//  15.0  — activation fires (bright chord)
//  16.2  — output pulse launches (rising tone)
//  18.0  — output arrives (confirmation beep)

function useSoundEngine(enabled) {
  const ctxRef = React.useRef(null);
  const firedRef = React.useRef(new Set());
  const { time, playing } = useTimeline();
  const lastTimeRef = React.useRef(0);

  // Init/close audio context
  React.useEffect(() => {
    if (enabled && !ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    return () => {};
  }, [enabled]);

  // Reset fired cues when scrubbing backwards
  React.useEffect(() => {
    if (time < lastTimeRef.current - 0.3) {
      firedRef.current = new Set();
    }
    lastTimeRef.current = time;
  }, [time]);

  // Cue table
  const cues = React.useMemo(() => [
    { t: 3.0,   id: 'neuron_appear',  play: playThud },
    { t: 3.30,  id: 'in0',            play: () => playClick(880) },
    { t: 3.38,  id: 'in1',            play: () => playClick(988) },
    { t: 3.46,  id: 'in2',            play: () => playClick(1100) },
    { t: 3.54,  id: 'in3',            play: () => playClick(1320) },
    { t: 7.2,   id: 'weights',        play: () => playClick(660, 0.18) },
    { t: 8.5,   id: 'launch',         play: playSwoosh },
    { t: 10.3,  id: 'arrive',         play: playArrive },
    { t: 11.0,  id: 'sum_formula',    play: () => playClick(523, 0.2) },
    { t: 13.0,  id: 'z_value',        play: () => playClick(659, 0.25) },
    { t: 15.0,  id: 'fire',           play: playFire },
    { t: 16.2,  id: 'output_launch',  play: playRise },
    { t: 18.0,  id: 'output_arrive',  play: playConfirm },
  ], []);

  React.useEffect(() => {
    if (!enabled || !playing || !ctxRef.current) return;
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    for (const cue of cues) {
      if (!firedRef.current.has(cue.id) && time >= cue.t && time < cue.t + 0.3) {
        firedRef.current.add(cue.id);
        try { cue.play(ctx); } catch (e) {}
      }
    }
  }, [time, enabled, playing, cues]);

  // Sound primitives
  function envelope(ctx, osc, gain, startVol, decay, now) {
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(startVol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.start(now);
    osc.stop(now + decay + 0.05);
  }

  function playClick(freq, decay = 0.12) {
    const ctx = ctxRef.current; if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + decay);
    osc.connect(gain).connect(ctx.destination);
    envelope(ctx, osc, gain, 0.12, decay, now);
  }

  function playThud(ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
    osc.connect(gain).connect(ctx.destination);
    envelope(ctx, osc, gain, 0.25, 0.5, now);
  }

  function playSwoosh(ctx) {
    const now = ctx.currentTime;
    // Filtered noise swoosh
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
    filter.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now); src.stop(now + 0.6);
  }

  function playArrive(ctx) {
    const now = ctx.currentTime;
    // Low pad sustain
    const freqs = [220, 277, 330];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain).connect(ctx.destination);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.2);
      gain.gain.setValueAtTime(0.06, now + 2.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
      osc.start(now); osc.stop(now + 4.1);
    });
  }

  function playFire(ctx) {
    const now = ctx.currentTime;
    // Bright triad
    const freqs = [523.25, 659.25, 783.99]; // C-E-G
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      osc.connect(gain).connect(ctx.destination);
      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.start(now + i * 0.04); osc.stop(now + 1.3);
    });
  }

  function playRise(ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
    osc.connect(gain).connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.start(now); osc.stop(now + 1.0);
  }

  function playConfirm(ctx) {
    const now = ctx.currentTime;
    [880, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain).connect(ctx.destination);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.4);
    });
  }
}

function SoundToggle() {
  const [enabled, setEnabled] = React.useState(false);
  useSoundEngine(enabled);

  const toggle = async () => {
    setEnabled(e => !e);
  };

  return (
    <>
      <button
        onClick={toggle}
        style={{
          position: 'absolute',
          top: 32, right: 32,
          width: 56, height: 56,
          borderRadius: '50%',
          border: `1.5px solid ${enabled ? COLORS.accent : COLORS.line}`,
          background: enabled ? COLORS.accent : 'transparent',
          color: enabled ? '#fff' : COLORS.dim,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          fontFamily: FONT_SANS,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
        title={enabled ? 'Mute sound' : 'Enable sound'}
      >
        {enabled ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 10v4h4l5 5V5L7 10H3z" fill="currentColor"/>
            <path d="M15.5 12a4.5 4.5 0 0 0-2.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            <path d="M18 12a7 7 0 0 0-3-5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 10v4h4l5 5V5L7 10H3z" fill="currentColor"/>
            <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      {!enabled && (
        <div style={{
          position: 'absolute',
          top: 44, right: 104,
          color: COLORS.dim,
          fontFamily: FONT_MONO,
          fontSize: 13,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
        }}>
          click to enable sound →
        </div>
      )}
    </>
  );
}

// ─── Nav Links ───────────────────────────────────────────────────────────
function NavLinks() {
  const view = useView();
  const pill = (active) => ({
    padding:'9px 16px', borderRadius:20, fontSize:13, fontWeight:500,
    background: active ? COLORS.ink : 'transparent',
    color: active ? COLORS.bg : COLORS.ink,
    border: `1px solid ${active ? COLORS.ink : COLORS.line}`,
    cursor: active ? 'default' : 'pointer',
    fontFamily: FONT_SANS,
  });
  return (
    <div style={{ position:'absolute', top:32, left:32, display:'flex', gap:10, zIndex:10000 }}>
      <button onClick={() => setView('neuron')} style={pill(view==='neuron')}>One Neuron</button>
      <button onClick={() => setView('network')} style={pill(view==='network')}>Network</button>
    </div>
  );
}

// ─── Tweaks Panel ────────────────────────────────────────────────────────
function TweaksPanel() {
  const [active, setActive] = React.useState(false);
  const current = usePaletteVersion();

  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setActive(true);
      else if (d.type === '__deactivate_edit_mode') setActive(false);
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (!active) return null;

  const pick = (name) => {
    setPalette(name);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { palette: name } }, '*');
    } catch (e) {}
  };

  const panelBg = CURRENT_PALETTE === 'Midnight' ? '#1a1e28' : '#ffffff';
  const panelText = CURRENT_PALETTE === 'Midnight' ? '#eaeaea' : '#111';
  const panelBorder = CURRENT_PALETTE === 'Midnight' ? '#2a2f3a' : '#e0dbd0';

  return (
    <div style={{
      position: 'absolute',
      bottom: 32, right: 32,
      width: 340,
      background: panelBg,
      border: `1px solid ${panelBorder}`,
      borderRadius: 14,
      padding: 22,
      fontFamily: FONT_SANS,
      color: panelText,
      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      zIndex: 10000,
    }}>
      <div style={{
        fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase',
        opacity: 0.6, marginBottom: 4, fontWeight: 500,
      }}>Tweaks</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18, letterSpacing: '-0.01em' }}>
        Color palette
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(PALETTES).map(([name, p]) => {
          const selected = name === current;
          return (
            <button key={name} onClick={() => pick(name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 12px',
                background: selected ? (CURRENT_PALETTE === 'Midnight' ? '#242938' : '#f6f3ec') : 'transparent',
                border: `1.5px solid ${selected ? p.accent : panelBorder}`,
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                color: panelText,
                fontFamily: FONT_SANS,
                transition: 'all 0.15s',
              }}
            >
              {/* swatches */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {[p.bg, p.ink, p.accent, p.accent2].map((c, i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: 5,
                    background: c,
                    border: `1px solid ${panelBorder}`,
                  }}/>
                ))}
              </div>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{name}</div>
              {selected && (
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: p.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: 18, paddingTop: 14,
        borderTop: `1px solid ${panelBorder}`,
        fontSize: 12, opacity: 0.55, lineHeight: 1.5,
      }}>
        Each palette defines the background, ink, and two accent hues used across the neuron, connections, and formulas.
      </div>
    </div>
  );
}

// ─── Main scene composition ──────────────────────────────────────────────
function NeuronScene() {
  usePaletteVersion(); // re-render on palette change
  return (
    <div data-video-root style={{ position: 'absolute', inset: 0, background: COLORS.bg }}>
      <TimestampLabel />

      {/* Background subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${COLORS.line} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.25,
      }}/>

      <TitleCard />
      <StageLabels />
      <Connections />
      <NeuronBody />
      <InputNodes />
      <BiasNode />
      <InputPulses />
      <BiasPulse />
      <OutputNode />
      <OutputPulse />
      <FormulaPanel />
      <SoundToggle />
      <TweaksPanel />
      <NavLinks />
    </div>
  );
}

window.NeuronScene = NeuronScene;
