// scenes.jsx — Neuron animation scenes

// Design tokens
const COLORS = {
  bg: '#f4f1ea',
  ink: '#1a1a1a',
  dim: '#8a8378',
  line: '#c9c2b5',
  accent: 'oklch(62% 0.14 255)',     // indigo
  accent2: 'oklch(68% 0.14 35)',     // warm coral
  neuron: '#1a1a1a',
  neuronFill: '#fafaf7',
};

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

// ─── Main scene composition ──────────────────────────────────────────────
function NeuronScene() {
  return (
    <div data-video-root style={{ position: 'absolute', inset: 0 }}>
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
      <InputPulses />
      <OutputNode />
      <OutputPulse />
      <FormulaPanel />
    </div>
  );
}

window.NeuronScene = NeuronScene;
