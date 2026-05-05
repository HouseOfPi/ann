// Scene 4: The ML approach. 18 - 30s
// Stacks of labeled emails (spam + not-spam) flow into a Model box.
// The Model "learns" (animation), then classifies new emails.

function SceneML({ start = 18, end = 30 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = localTime;
        const fadeIn  = Easing.easeOutCubic(clamp(t / 0.5, 0, 1));
        const fadeOut = 1 - clamp((t - (duration - 0.5)) / 0.5, 0, 1);
        const opacity = fadeIn * fadeOut;

        // Header
        const headerOp = clamp((t - 0.0) / 0.5, 0, 1);

        // Phase 1: 0.5 - 4.0  Stacks of labeled emails appear on left
        // Phase 2: 2.5 - 6.5  Emails stream into Model
        // Phase 3: 5.0 - 8.0  Model "learning" animation (pulses)
        // Phase 4: 7.5 - 11.5 New emails arrive on right, get classified

        return (
          <div style={{
            position: 'absolute', inset: 0,
            background: COLORS.bg, opacity,
            fontFamily: FONTS.sans,
          }}>
            {/* Header */}
            <div style={{
              position: 'absolute',
              top: 50, left: 80,
              opacity: headerOp,
              transform: `translateY(${(1 - headerOp) * 8}px)`,
            }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 12, letterSpacing: '0.24em',
                color: COLORS.accent,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                The ML way
              </div>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 52,
                fontWeight: 400,
                color: COLORS.ink,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}>
                Feed it labeled examples. It learns the pattern.
              </div>
            </div>

            {/* Three stages: Training data (left) -> Model (center) -> Predictions (right) */}
            <TrainingData t={t} />
            <ModelBox t={t} />
            <Predictions t={t} />

            {/* Stage labels */}
            <StageLabel x={300}  y={760} t={t} appear={0.3}  text="LABELED EXAMPLES" />
            <StageLabel x={960}  y={760} t={t} appear={4.5}  text="MODEL LEARNS" />
            <StageLabel x={1620} y={760} t={t} appear={7.8}  text="NEW EMAILS · CLASSIFIED" />

            {/* Bottom caption that changes */}
            <MLCaption t={t} duration={duration} />
          </div>
        );
      }}
    </Sprite>
  );
}

// ── Training data: stacks of labeled mini-envelopes ──────────────────────────

function TrainingData({ t }) {
  // 8 emails: 4 spam, 4 ham. They appear staggered, then "stream" toward model.
  const items = [
    { type: 'spam', subject: 'WIN $1,000,000 NOW',    yOffset: -180 },
    { type: 'ham',  subject: 'Lunch tomorrow?',        yOffset: -120 },
    { type: 'spam', subject: 'Cheap meds online',      yOffset: -60  },
    { type: 'ham',  subject: 'Q3 review draft',        yOffset: 0    },
    { type: 'spam', subject: 'Click for free iPhone',  yOffset: 60   },
    { type: 'ham',  subject: 'Dinner Friday',          yOffset: 120  },
    { type: 'spam', subject: 'Verify your account!!!', yOffset: 180  },
    { type: 'ham',  subject: 'Project status update',  yOffset: 240  },
  ];

  return (
    <>
      {items.map((it, i) => {
        const appearAt  = 0.5 + i * 0.18;
        const streamAt  = 2.6 + i * 0.18;
        const arriveAt  = streamAt + 1.2;

        const appear = Easing.easeOutBack(clamp((t - appearAt) / 0.5, 0, 1));
        const stream = Easing.easeInOutCubic(clamp((t - streamAt) / 1.2, 0, 1));

        const startX = 300;
        const endX   = 960;       // model center
        const startY = 410 + it.yOffset;
        const endY   = 470;       // model center y

        const x = startX + (endX - startX) * stream;
        const y = startY + (endY - startY) * stream;

        // Fade out as it reaches the model
        const swallow = clamp((t - arriveAt) / 0.3, 0, 1);
        const op = appear * (1 - swallow);
        const scale = appear * (1 - 0.4 * stream);

        return (
          <MiniEnvelope
            key={i}
            x={x} y={y}
            type={it.type}
            subject={it.subject}
            opacity={op}
            scale={scale}
          />
        );
      })}
    </>
  );
}

function MiniEnvelope({ x, y, type, subject, opacity, scale = 1 }) {
  const labelColor = type === 'spam' ? COLORS.spam : COLORS.ham;
  const labelText  = type === 'spam' ? 'SPAM' : 'NOT SPAM';
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: 240, height: 76,
      transform: `translate(-50%, -50%) scale(${scale})`,
      transformOrigin: 'center',
      opacity,
      background: COLORS.paper,
      border: `1px solid ${COLORS.rule}`,
      borderRadius: 5,
      boxShadow: '0 4px 12px rgba(40,30,15,0.10)',
      padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
      fontFamily: FONTS.sans,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: COLORS.ink,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {subject}
      </div>
      <div style={{
        alignSelf: 'flex-start',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
        padding: '2px 7px',
        background: labelColor,
        color: COLORS.paper,
        borderRadius: 2,
      }}>
        {labelText}
      </div>
    </div>
  );
}

// ── Model box ────────────────────────────────────────────────────────────────

function ModelBox({ t }) {
  // Box appears around t=1.0
  const appear = Easing.easeOutCubic(clamp((t - 1.0) / 0.6, 0, 1));

  // "Active learning" pulses while emails stream in (t 2.5 – 7.5)
  const learning = clamp((t - 2.5) / 0.4, 0, 1) * (1 - clamp((t - 7.5) / 0.5, 0, 1));

  // After training (t > 7.5), it becomes "trained" — solid accent
  const trained = clamp((t - 7.5) / 0.6, 0, 1);

  // Pulse: subtle scale oscillation while learning
  const pulse = learning > 0.01
    ? 1 + Math.sin(t * 6) * 0.015 * learning
    : 1;

  const cx = 960, cy = 470;
  const w = 360, h = 240;

  return (
    <div style={{
      position: 'absolute',
      left: cx, top: cy,
      width: w, height: h,
      transform: `translate(-50%, -50%) scale(${appear * pulse})`,
      transformOrigin: 'center',
      opacity: appear,
    }}>
      {/* Outer card */}
      <div style={{
        position: 'absolute', inset: 0,
        background: COLORS.paper,
        border: `2px solid ${trained > 0.5 ? COLORS.accent : COLORS.rule}`,
        borderRadius: 12,
        boxShadow: '0 16px 40px rgba(40,30,15,0.14)',
        transition: 'border-color 200ms',
      }}/>

      {/* Glow when learning */}
      <div style={{
        position: 'absolute', inset: -8,
        borderRadius: 18,
        background: `radial-gradient(circle at center, ${COLORS.accent}, transparent 70%)`,
        opacity: learning * 0.25,
        filter: 'blur(20px)',
        zIndex: -1,
      }}/>

      {/* Neural-net-ish dots inside */}
      <NeuralNet t={t} learning={learning} trained={trained} />

      {/* Label */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 14,
        textAlign: 'center',
        fontFamily: FONTS.mono,
        fontSize: 11, letterSpacing: '0.18em',
        color: trained > 0.5 ? COLORS.accent : COLORS.inkMuted,
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        {trained > 0.5 ? 'Trained Model' : (learning > 0.1 ? 'Learning…' : 'Model')}
      </div>
    </div>
  );
}

function NeuralNet({ t, learning, trained }) {
  // 3 layers: 3 -> 4 -> 2 nodes
  const layers = [
    [{ x: 60, y: 60 }, { x: 60, y: 110 }, { x: 60, y: 160 }],
    [{ x: 175, y: 45 }, { x: 175, y: 90 }, { x: 175, y: 135 }, { x: 175, y: 180 }],
    [{ x: 290, y: 80 }, { x: 290, y: 145 }],
  ];

  // Build edges
  const edges = [];
  for (let i = 0; i < layers.length - 1; i++) {
    for (const a of layers[i]) {
      for (const b of layers[i + 1]) {
        edges.push({ a, b });
      }
    }
  }

  return (
    <svg width="360" height="220" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      {edges.map((e, i) => {
        // Phase modulation creates the "signal flowing" feeling
        const phase = (t * 1.2 + i * 0.15) % 1;
        const intensity = learning * (0.4 + 0.6 * Math.sin(phase * Math.PI * 2));
        const baseOp = 0.25 + trained * 0.35;
        return (
          <line
            key={i}
            x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y}
            stroke={COLORS.accent}
            strokeWidth={1 + intensity * 1.2}
            opacity={baseOp + intensity * 0.5}
          />
        );
      })}
      {layers.flat().map((n, i) => (
        <circle
          key={i}
          cx={n.x} cy={n.y} r={6}
          fill={trained > 0.5 ? COLORS.accent : COLORS.paper}
          stroke={COLORS.accent}
          strokeWidth={1.6}
        />
      ))}
    </svg>
  );
}

// ── Predictions ──────────────────────────────────────────────────────────────

function Predictions({ t }) {
  // 3 new emails arrive after training (t > 7.8). Each gets classified.
  const items = [
    { subject: '🎁 Free Rolex! Click NOW',  text: 'Limited time only — claim your...', type: 'spam', delay: 0.0 },
    { subject: 'Re: Q3 review draft',         text: 'Thanks — I left a few comments on...', type: 'ham',  delay: 0.9 },
    { subject: 'CRYPTO 1000x guarantee',      text: 'Send 1 BTC, get 1000 back...',     type: 'spam', delay: 1.8 },
  ];

  return (
    <>
      {items.map((it, i) => {
        const arriveAt = 7.8 + it.delay;
        const labelAt  = arriveAt + 0.7;

        const arrive = Easing.easeOutCubic(clamp((t - arriveAt) / 0.6, 0, 1));
        const labelOp = Easing.easeOutBack(clamp((t - labelAt) / 0.4, 0, 1));

        const startX = 1200, endX = 1620;
        const x = startX + (endX - startX) * arrive;
        const y = 320 + i * 130;

        return (
          <PredictionCard
            key={i}
            x={x} y={y}
            subject={it.subject}
            text={it.text}
            type={it.type}
            cardOp={arrive}
            labelOp={labelOp}
          />
        );
      })}
    </>
  );
}

function PredictionCard({ x, y, subject, text, type, cardOp, labelOp }) {
  const labelColor = type === 'spam' ? COLORS.spam : COLORS.ham;
  const labelText  = type === 'spam' ? 'SPAM' : 'NOT SPAM';
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: 320, height: 100,
      transform: `translate(-50%, -50%)`,
      opacity: cardOp,
      background: COLORS.paper,
      border: `1px solid ${COLORS.rule}`,
      borderRadius: 6,
      boxShadow: '0 6px 18px rgba(40,30,15,0.10)',
      padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
      fontFamily: FONTS.sans,
    }}>
      <div style={{
        fontSize: 14, fontWeight: 600, color: COLORS.ink,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {subject}
      </div>
      <div style={{
        fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.35,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {text}
      </div>
      {/* Predicted label slides in from right */}
      <div style={{
        position: 'absolute',
        right: 14, top: '50%',
        transform: `translateY(-50%) translateX(${(1 - labelOp) * 20}px)`,
        opacity: labelOp,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        padding: '5px 10px',
        background: labelColor,
        color: COLORS.paper,
        borderRadius: 2,
      }}>
        {labelText}
      </div>
    </div>
  );
}

function StageLabel({ x, y, t, appear, text }) {
  const op = clamp((t - appear) / 0.5, 0, 1);
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(-50%, 0) translateY(${(1 - op) * 6}px)`,
      opacity: op,
      fontFamily: FONTS.mono,
      fontSize: 13, letterSpacing: '0.22em',
      color: COLORS.inkMuted,
      fontWeight: 600,
      textTransform: 'uppercase',
      textAlign: 'center',
    }}>
      {text}
    </div>
  );
}

function MLCaption({ t, duration }) {
  const caps = [
    { text: 'Show the model thousands of emails — each labeled spam or not spam.', start: 0.6, end: 4.5 },
    { text: 'It finds patterns no human could write down by hand.',                  start: 4.6, end: 7.6 },
    { text: 'Now it can label new emails on its own — even ones it has never seen.', start: 7.7, end: duration },
  ];
  return (
    <>
      {caps.map((c, i) => {
        const fadeIn = clamp((t - c.start) / 0.4, 0, 1);
        const fadeOut = 1 - clamp((t - (c.end - 0.4)) / 0.4, 0, 1);
        const op = Easing.easeOutCubic(fadeIn) * fadeOut;
        if (op <= 0.001) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', bottom: 50,
            transform: `translateX(-50%) translateY(${(1 - fadeIn) * 8}px)`,
            opacity: op,
            fontFamily: FONTS.sans,
            fontSize: 22, fontWeight: 500,
            color: COLORS.inkSoft,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            maxWidth: 1100,
          }}>
            {c.text}
          </div>
        );
      })}
    </>
  );
}

Object.assign(window, { SceneML });
