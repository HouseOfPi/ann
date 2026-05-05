// Scene 7: Predictive maintenance example. 33 - 48s.
// Show a factory machine with live sensor readings.
// Phase A (33-39s): Rule-based -- if temp>80 OR vibration>5: alert. Misses subtle patterns.
// Phase B (39-48s): ML learns from history: a chart of past sensor logs labeled
//   FAILED/OK; the model learns the multi-variable boundary; correctly predicts
//   the next failure where rules missed it.

function SceneMachine({ start = 33, end = 48 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = localTime;
        const fadeIn  = Easing.easeOutCubic(clamp(t / 0.5, 0, 1));
        const fadeOut = 1 - clamp((t - (duration - 0.5)) / 0.5, 0, 1);
        const opacity = fadeIn * fadeOut;

        // Phase split: rule-based (0-7.5) vs ML (8-end)
        // Rules section opacity
        const rulesOp = clamp((t - 0.3) / 0.5, 0, 1) * (1 - clamp((t - 7.5) / 0.6, 0, 1));
        // ML section opacity
        const mlOp    = clamp((t - 7.9) / 0.6, 0, 1);

        const headerOp = clamp(t / 0.5, 0, 1);

        return (
          <div style={{
            position: 'absolute', inset: 0,
            background: COLORS.bg, opacity,
            fontFamily: FONTS.sans,
          }}>
            {/* Header */}
            <div style={{
              position: 'absolute',
              top: 80, left: 120,
              opacity: headerOp,
              transform: `translateY(${(1 - headerOp) * 8}px)`,
            }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 14, letterSpacing: '0.28em',
                color: COLORS.accent,
                textTransform: 'uppercase',
                marginBottom: 14,
                fontWeight: 600,
              }}>
                Predictive maintenance
              </div>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 64,
                fontWeight: 400,
                color: COLORS.ink,
                letterSpacing: '-0.025em',
                lineHeight: 1.0,
              }}>
                {t < 7.5 ? (
                  <>Sensors say <em style={{ fontStyle: 'italic', color: COLORS.spam }}>everything's fine</em>… until it isn't.</>
                ) : (
                  <>Let the model learn from <em style={{ fontStyle: 'italic', color: COLORS.accent }}>thousands</em> of past runs.</>
                )}
              </div>
            </div>

            {/* Rule-based phase */}
            {rulesOp > 0.01 && <RulePhase t={t} op={rulesOp} />}

            {/* ML phase */}
            {mlOp > 0.01 && <MLPhase t={t} op={mlOp} />}

            <MachineCaption t={t} duration={duration} />
          </div>
        );
      }}
    </Sprite>
  );
}

// ── Rule-based phase ─────────────────────────────────────────────────────────
// Left: stylized industrial machine with 4 live sensor gauges.
// Right: simple rule code. The machine fails despite all sensors looking "ok".

function RulePhase({ t, op }) {
  // Gauge values evolve over rule phase (0-6s):
  //   t=0.5 — boot up, all green, normal
  //   t=2.5 — slow creep, still under thresholds
  //   t=4.5 — failure happens, but no single threshold tripped
  //   t=5.0 — machine "breaks" (red flash, but rules didn't fire)
  const phase = clamp((t - 0.5) / 4.5, 0, 1); // 0..1 over rule window

  // Sensors: temp (°C), vibration (mm/s), pressure (psi), runtime (hrs)
  // Each has thresholds; values stay BELOW thresholds individually.
  const temp      = 62 + phase * 14;        // 62 -> 76  (threshold 80)
  const vibration = 2.4 + phase * 2.1;      // 2.4 -> 4.5 (threshold 5.0)
  const pressure  = 92 + phase * 5;         // 92 -> 97  (threshold 110)
  const runtime   = 4120 + phase * 280;     // 4120 -> 4400 (threshold 5000)

  const failed = t > 4.5;
  const failFlash = clamp((t - 4.5) / 0.2, 0, 1) * (1 - clamp((t - 5.5) / 0.5, 0, 1));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: op,
    }}>
      {/* Machine illustration card */}
      <div style={{
        position: 'absolute',
        left: 120, top: 320,
        width: 720, height: 560,
        background: COLORS.paper,
        border: `1px solid ${COLORS.rule}`,
        borderRadius: 10,
        boxShadow: '0 18px 48px rgba(40,30,15,0.10)',
        padding: 32,
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.rule}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <StatusDot failed={failed} flash={failFlash} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
                Press M-204 · Line 3
              </div>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 11, color: COLORS.inkMuted, letterSpacing: '0.1em',
              }}>
                LIVE · TELEMETRY
              </div>
            </div>
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 12, fontWeight: 600,
            color: failed ? COLORS.spam : COLORS.ham,
            letterSpacing: '0.14em',
          }}>
            {failed ? '✕ OFFLINE' : '● RUNNING'}
          </div>
        </div>

        {/* Machine schematic */}
        <MachineSchematic failed={failed} flash={failFlash} t={t} />

        {/* Sensor gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Gauge label="Temperature"  value={temp}      unit="°C"   threshold={80}   />
          <Gauge label="Vibration"    value={vibration} unit="mm/s" threshold={5.0}  digits={1} />
          <Gauge label="Pressure"     value={pressure}  unit="psi"  threshold={110}  />
          <Gauge label="Runtime"      value={runtime}   unit="hrs"  threshold={5000} digits={0} />
        </div>
      </div>

      {/* Rule code on the right */}
      <RuleCode t={t} failed={failed} />

      {/* Big "FAILED · NO ALERT" badge */}
      {failFlash > 0 && (
        <div style={{
          position: 'absolute',
          left: 120 + 720 - 60, top: 290,
          transform: `scale(${0.7 + failFlash * 0.4}) rotate(-5deg)`,
          opacity: failFlash,
          background: COLORS.spam,
          color: COLORS.paper,
          fontFamily: FONTS.mono,
          fontSize: 14, fontWeight: 700, letterSpacing: '0.12em',
          padding: '12px 18px',
          borderRadius: 4,
          boxShadow: '0 14px 32px rgba(180,60,20,0.36)',
        }}>
          ✕ FAILED · NO ALERT FIRED
        </div>
      )}

      {/* "Why did it fail?" explainer card -- appears after the failure */}
      <WhyItFailed t={t} />
    </div>
  );
}

function WhyItFailed({ t }) {
  // Appears at t≈5.0 (just after failure), holds until end of rule phase (~7.4).
  const op = clamp((t - 5.0) / 0.5, 0, 1) * (1 - clamp((t - 7.3) / 0.4, 0, 1));
  if (op <= 0.001) return null;

  const factors = [
    { label: 'Vibration trending up',  detail: '+0.4 mm/s over 6 hours' },
    { label: 'Oil aged past 35 days',  detail: 'lubrication thinning' },
    { label: 'High load + warm room',  detail: '78% load, 31 °C ambient' },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: 920, top: 760,
      width: 880,
      opacity: op,
      transform: `translateY(${(1 - op) * 12}px)`,
      background: COLORS.paper,
      border: `2px solid ${COLORS.spam}`,
      borderRadius: 10,
      boxShadow: '0 18px 48px rgba(180,60,20,0.16)',
      padding: '22px 26px',
      display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: FONTS.sans,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.22em',
          color: COLORS.spam, textTransform: 'uppercase', fontWeight: 700,
        }}>
          So why did it fail?
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkMuted,
          letterSpacing: '0.1em',
        }}>
          POST-MORTEM
        </div>
      </div>
      <div style={{
        fontFamily: FONTS.serif, fontSize: 24, fontWeight: 400,
        color: COLORS.ink, letterSpacing: '-0.015em', lineHeight: 1.25,
      }}>
        Three small things, <em style={{ fontStyle: 'italic', color: COLORS.spam }}>at the same time</em>.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {factors.map((f, i) => (
          <div key={i} style={{
            padding: '10px 12px',
            background: COLORS.bgAlt,
            borderRadius: 5,
            borderLeft: `3px solid ${COLORS.spam}`,
            opacity: clamp(op * 1.2 - i * 0.08, 0, 1),
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: COLORS.ink,
              letterSpacing: '-0.005em', marginBottom: 3,
            }}>
              {f.label}
            </div>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft,
            }}>
              {f.detail}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        fontSize: 13, color: COLORS.inkSoft, fontStyle: 'italic', lineHeight: 1.4,
      }}>
        No single sensor crossed a line. Their <span style={{ color: COLORS.spam, fontStyle: 'normal', fontWeight: 600 }}>combination</span> did.
      </div>
    </div>
  );
}

function StatusDot({ failed, flash }) {
  const color = failed ? COLORS.spam : COLORS.ham;
  return (
    <div style={{
      width: 14, height: 14, borderRadius: 7,
      background: color,
      boxShadow: `0 0 0 ${4 + flash * 6}px ${color}33`,
    }}/>
  );
}

function MachineSchematic({ failed, flash, t }) {
  // Subtle vibration: sin wave with phase
  const wobble = failed ? (1 - flash) * 2 : Math.sin(t * 8) * 0.6;
  return (
    <div style={{
      flex: 1,
      background: failed
        ? `linear-gradient(${COLORS.bgAlt}, ${COLORS.bgAlt})`
        : `linear-gradient(${COLORS.bgAlt}, ${COLORS.bg})`,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 180,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `translateX(${wobble}px)`,
      transition: 'transform 60ms linear',
    }}>
      {/* Stylized machine: a rectangular body, two gears, a piston */}
      <svg width="380" height="170" viewBox="0 0 380 170" style={{ display: 'block' }}>
        {/* Base */}
        <rect x="20" y="120" width="340" height="14" fill={COLORS.inkMuted} opacity="0.4" rx="2"/>
        {/* Body */}
        <rect x="60" y="40" width="240" height="80" rx="6"
              fill={COLORS.paper}
              stroke={failed ? COLORS.spam : COLORS.ink}
              strokeWidth="2"/>
        {/* Steam/smoke when failed */}
        {failed && (
          <>
            <circle cx={250} cy={30 - flash * 14} r={8 + flash * 4} fill={COLORS.inkMuted} opacity={0.4 * (1 - flash * 0.5)}/>
            <circle cx={262} cy={20 - flash * 18} r={6 + flash * 3} fill={COLORS.inkMuted} opacity={0.3 * (1 - flash * 0.5)}/>
            <circle cx={244} cy={14 - flash * 22} r={5 + flash * 2} fill={COLORS.inkMuted} opacity={0.25 * (1 - flash * 0.5)}/>
          </>
        )}
        {/* Gears */}
        <Gear cx={110} cy={80} r={22} t={t} failed={failed}/>
        <Gear cx={170} cy={80} r={16} t={t * -1.4} failed={failed}/>
        {/* Piston */}
        <rect x="220" y={70 + Math.sin(t * 6) * 4} width="60" height="20"
              fill={failed ? COLORS.spam : COLORS.accent}
              opacity={failed ? 0.5 : 0.8}/>
        {/* Exhaust pipe */}
        <rect x={240} y={28} width={16} height={12} fill={COLORS.inkMuted} opacity="0.5"/>
      </svg>
    </div>
  );
}

function Gear({ cx, cy, r, t, failed }) {
  const angle = (t * 60) % 360; // degrees
  const teeth = 8;
  const teethArr = Array.from({ length: teeth });
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={r} fill="none"
              stroke={failed ? COLORS.spam : COLORS.ink}
              strokeWidth="2"/>
      {teethArr.map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r + 5);
        const y2 = cy + Math.sin(a) * (r + 5);
        return (
          <line key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={failed ? COLORS.spam : COLORS.ink}
                strokeWidth="2"/>
        );
      })}
      <circle cx={cx} cy={cy} r={4} fill={failed ? COLORS.spam : COLORS.ink}/>
    </g>
  );
}

function Gauge({ label, value, unit, threshold, digits = 1 }) {
  const pct = clamp(value / threshold, 0, 1);
  const isHigh = pct > 0.85;
  const fmtVal = digits === 0
    ? Math.round(value).toLocaleString()
    : value.toFixed(digits);
  return (
    <div style={{
      background: COLORS.bgAlt,
      border: `1px solid ${COLORS.rule}`,
      borderRadius: 6,
      padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
          color: COLORS.inkMuted, textTransform: 'uppercase',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 11, color: COLORS.inkMuted,
        }}>
          max {threshold}{unit}
        </div>
      </div>
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 22, fontWeight: 600,
        color: isHigh ? 'oklch(60% 0.13 60)' : COLORS.ink,
        letterSpacing: '-0.01em',
      }}>
        {fmtVal} <span style={{ fontSize: 13, color: COLORS.inkMuted, fontWeight: 500 }}>{unit}</span>
      </div>
      {/* Bar */}
      <div style={{ height: 4, background: COLORS.rule, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          background: isHigh ? 'oklch(60% 0.13 60)' : COLORS.ham,
          transition: 'width 100ms linear',
        }}/>
      </div>
    </div>
  );
}

function RuleCode({ t, failed }) {
  // Lines reveal at 1.0, 1.5, 2.0, 2.5, 3.0
  const reveal = [1.0, 1.5, 2.0, 2.5, 3.0].map(x => clamp((t - x) / 0.3, 0, 1));
  return (
    <div style={{
      position: 'absolute',
      left: 920, top: 320,
      width: 880,
      background: '#1a1815',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(20,15,5,0.30)',
      fontFamily: FONTS.mono,
    }}>
      <div style={{
        height: 32, background: '#262320',
        borderBottom: '1px solid #33302b',
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#5c574e' }}/>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#5c574e' }}/>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#5c574e' }}/>
        <div style={{
          marginLeft: 14,
          color: '#8a8478', fontSize: 12, letterSpacing: '0.08em',
        }}>
          maintenance_rules.py
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <RLine op={reveal[0]} color="#8a8478"># Hand-tuned thresholds</RLine>
        <RLine op={reveal[1]} color="#e6dfce">
          <span style={{ color: '#c79e6b' }}>def</span>{' '}
          <span style={{ color: '#9bbf80' }}>will_fail</span>(s):
        </RLine>
        <RLine op={reveal[2]} indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          s.temp <span style={{ color: '#c79e6b' }}>{'>'}</span> <span style={{ color: '#d68b6b' }}>80</span>:{' '}
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </RLine>
        <RLine op={reveal[2]} indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          s.vibration <span style={{ color: '#c79e6b' }}>{'>'}</span> <span style={{ color: '#d68b6b' }}>5.0</span>:{' '}
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </RLine>
        <RLine op={reveal[3]} indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          s.pressure <span style={{ color: '#c79e6b' }}>{'>'}</span> <span style={{ color: '#d68b6b' }}>110</span>:{' '}
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </RLine>
        <RLine op={reveal[3]} indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          s.runtime <span style={{ color: '#c79e6b' }}>{'>'}</span> <span style={{ color: '#d68b6b' }}>5000</span>:{' '}
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </RLine>
        <RLine op={reveal[4]} indent={1}>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>False</span>
        </RLine>

        {/* Output of will_fail() printed at bottom */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px dashed #33302b',
          opacity: clamp((t - 3.6) / 0.4, 0, 1),
          fontSize: 14,
        }}>
          <div style={{ color: '#8a8478', marginBottom: 6 }}>{'>>>'} will_fail(sensors)</div>
          <div style={{
            color: failed ? '#9bbf80' : '#9bbf80',
            fontSize: 22, fontWeight: 700,
          }}>
            False
          </div>
          <div style={{
            color: COLORS.spam,
            opacity: clamp((t - 4.6) / 0.3, 0, 1),
            marginTop: 12,
            fontSize: 13,
          }}>
            # but the machine just failed.
          </div>
        </div>
      </div>
    </div>
  );
}

function RLine({ children, op = 1, color = '#e6dfce', indent = 0 }) {
  return (
    <div style={{
      fontSize: 16, color, opacity: op,
      paddingLeft: indent * 24,
      lineHeight: 1.7, whiteSpace: 'pre',
      transform: `translateY(${(1 - op) * 4}px)`,
    }}>
      {children}
    </div>
  );
}

// ── ML phase ─────────────────────────────────────────────────────────────────
// A scatter plot of past runs (temp vs vibration). Failures (spam color) and
// OK runs (ham color) are interleaved — no single threshold separates them.
// The model learns a curved decision boundary. Then a NEW point is added in
// the danger zone and the model correctly predicts FAILURE.

function MLPhase({ t, op }) {
  // t inside scene; ML phase localT starts at scene t = 7.9
  const localT = t - 7.9;

  // Phase A: scatter dots appear (0 - 2.5s)
  // Phase B: decision boundary draws (2.5 - 5s)
  // Phase C: new point appears + classified (5.5 - 8.5s)

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: op,
    }}>
      {/* Scatter chart card */}
      <ScatterChart localT={localT} />

      {/* Right column: training examples + prediction */}
      <PredictionPanel localT={localT} />
    </div>
  );
}

function ScatterChart({ localT }) {
  // Past runs: each is { temp, vib, label }
  const runs = React.useMemo(() => {
    const ok = [];
    const fail = [];
    // OK cluster: low-mid temp & vib
    for (let i = 0; i < 22; i++) {
      ok.push({
        x: 60 + Math.random() * 28,        // temp 60-88
        y: 1.5 + Math.random() * 3.0,      // vib 1.5-4.5
      });
    }
    // FAIL cluster: high temp + vib together, BUT also some at moderate temp
    // & high vib, or moderate vib & high temp -- the boundary is a curve.
    for (let i = 0; i < 14; i++) {
      const a = Math.random();
      if (a < 0.5) {
        fail.push({
          x: 75 + Math.random() * 20,      // 75-95
          y: 4.0 + Math.random() * 3.0,    // 4-7
        });
      } else if (a < 0.8) {
        fail.push({
          x: 65 + Math.random() * 12,
          y: 5.2 + Math.random() * 1.8,
        });
      } else {
        fail.push({
          x: 82 + Math.random() * 10,
          y: 3.5 + Math.random() * 1.0,
        });
      }
    }
    return { ok, fail };
  }, []);

  // Plot dimensions
  const W = 640, H = 480;
  const padL = 60, padR = 30, padT = 30, padB = 50;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xMin = 55, xMax = 100;
  const yMin = 1, yMax = 8;
  const sx = (v) => padL + ((v - xMin) / (xMax - xMin)) * chartW;
  const sy = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * chartH;

  // Decision boundary: a curve in (x=temp, y=vib) space. Failures roughly
  // on the upper-right side of: y > 8 - 0.07*x   (i.e. vib + 0.07*temp > 8)
  // Draw the curve over [xMin, xMax].
  const boundaryPoints = [];
  for (let xv = xMin; xv <= xMax; xv += 1) {
    const yv = 8 - 0.07 * xv + Math.sin((xv - xMin) * 0.18) * 0.4;
    boundaryPoints.push([sx(xv), sy(yv)]);
  }
  const boundaryPath = 'M ' + boundaryPoints.map(p => p.join(' ')).join(' L ');

  // Phase progressions (localT = ML scene t)
  const dotsAppear = Easing.easeOutCubic(clamp(localT / 2.0, 0, 1));
  const boundaryDraw = clamp((localT - 2.5) / 2.0, 0, 1);
  const newPointAppear = Easing.easeOutBack(clamp((localT - 5.5) / 0.5, 0, 1));
  const newPointClassify = clamp((localT - 6.4) / 0.4, 0, 1);

  // The new test point: at temp=78, vib=4.6 — moderate on each, BUT crosses
  // the curved boundary => model predicts FAIL.
  const newPt = { x: 78, y: 4.6 };

  return (
    <div style={{
      position: 'absolute',
      left: 120, top: 320,
      width: 720,
      background: COLORS.paper,
      border: `1px solid ${COLORS.rule}`,
      borderRadius: 10,
      boxShadow: '0 18px 48px rgba(40,30,15,0.10)',
      padding: 28,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
          Past runs · 12 months
        </div>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 11, letterSpacing: '0.1em',
          color: COLORS.inkMuted, textTransform: 'uppercase',
        }}>
          n = {runs.ok.length + runs.fail.length}
        </div>
      </div>

      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke={COLORS.rule} strokeWidth="1.5"/>
        <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke={COLORS.rule} strokeWidth="1.5"/>

        {/* Axis labels */}
        <text x={padL + chartW / 2} y={H - 8} textAnchor="middle"
              fill={COLORS.inkMuted}
              style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          TEMPERATURE (°C)
        </text>
        <text x={16} y={padT + chartH / 2} textAnchor="middle"
              fill={COLORS.inkMuted}
              transform={`rotate(-90 16 ${padT + chartH / 2})`}
              style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          VIBRATION (mm/s)
        </text>

        {/* Tick marks */}
        {[60, 70, 80, 90, 100].map(v => (
          <g key={`tx${v}`}>
            <line x1={sx(v)} y1={padT + chartH} x2={sx(v)} y2={padT + chartH + 4}
                  stroke={COLORS.inkMuted} strokeWidth="1"/>
            <text x={sx(v)} y={padT + chartH + 18} textAnchor="middle"
                  fill={COLORS.inkMuted}
                  style={{ fontFamily: FONTS.mono, fontSize: 11 }}>{v}</text>
          </g>
        ))}
        {[2, 4, 6, 8].map(v => (
          <g key={`ty${v}`}>
            <line x1={padL - 4} y1={sy(v)} x2={padL} y2={sy(v)}
                  stroke={COLORS.inkMuted} strokeWidth="1"/>
            <text x={padL - 8} y={sy(v) + 4} textAnchor="end"
                  fill={COLORS.inkMuted}
                  style={{ fontFamily: FONTS.mono, fontSize: 11 }}>{v}</text>
          </g>
        ))}

        {/* Decision boundary — drawn progressively */}
        <path
          d={boundaryPath}
          stroke={COLORS.accent}
          strokeWidth="3"
          fill="none"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - boundaryDraw}
          opacity={boundaryDraw}
        />
        {/* Boundary fill on the FAIL side */}
        {boundaryDraw > 0.95 && (
          <path
            d={boundaryPath + ` L ${sx(xMax)} ${padT} L ${padL} ${padT} Z`}
            fill={COLORS.spam}
            opacity={0.06 * clamp((localT - 4.4) / 0.4, 0, 1)}
          />
        )}

        {/* OK dots */}
        {runs.ok.map((r, i) => {
          const op = clamp(dotsAppear * 1.2 - i * 0.02, 0, 1);
          return (
            <circle key={`ok${i}`}
                    cx={sx(r.x)} cy={sy(r.y)} r={6}
                    fill={COLORS.ham} opacity={op * 0.85}/>
          );
        })}
        {/* FAIL dots */}
        {runs.fail.map((r, i) => {
          const op = clamp(dotsAppear * 1.2 - i * 0.02, 0, 1);
          return (
            <g key={`f${i}`} opacity={op}>
              <line x1={sx(r.x) - 5} y1={sy(r.y) - 5} x2={sx(r.x) + 5} y2={sy(r.y) + 5}
                    stroke={COLORS.spam} strokeWidth="2.5"/>
              <line x1={sx(r.x) - 5} y1={sy(r.y) + 5} x2={sx(r.x) + 5} y2={sy(r.y) - 5}
                    stroke={COLORS.spam} strokeWidth="2.5"/>
            </g>
          );
        })}

        {/* New test point */}
        {newPointAppear > 0.01 && (
          <g opacity={newPointAppear}>
            <circle cx={sx(newPt.x)} cy={sy(newPt.y)} r={10 + (1 - newPointClassify) * 8}
                    fill="none"
                    stroke={newPointClassify > 0 ? COLORS.spam : COLORS.ink}
                    strokeWidth="2"
                    opacity={1 - newPointClassify * 0.4}/>
            <circle cx={sx(newPt.x)} cy={sy(newPt.y)} r={7}
                    fill={newPointClassify > 0.5 ? COLORS.spam : COLORS.ink}/>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 24, marginTop: 4,
        fontFamily: FONTS.mono, fontSize: 12, color: COLORS.inkSoft,
        letterSpacing: '0.06em',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: COLORS.ham }}/>
          OK · ran fine
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 12, height: 12 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(45deg, transparent 45%, ${COLORS.spam} 45%, ${COLORS.spam} 55%, transparent 55%),
                          linear-gradient(-45deg, transparent 45%, ${COLORS.spam} 45%, ${COLORS.spam} 55%, transparent 55%)`,
            }}/>
          </div>
          FAILED
        </div>
        <div style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 8,
          opacity: clamp((localT - 2.5) / 0.5, 0, 1),
        }}>
          <div style={{ width: 18, height: 3, background: COLORS.accent }}/>
          MODEL'S DECISION BOUNDARY
        </div>
      </div>
    </div>
  );
}

function PredictionPanel({ localT }) {
  // Right side: list a few sensor inputs of the new test, then the model's
  // verdict ("WILL FAIL · 94%").
  const newRowOp = clamp((localT - 5.4) / 0.5, 0, 1);
  const verdictOp = clamp((localT - 6.6) / 0.5, 0, 1);

  const features = [
    { label: 'Temperature',  v: '78 °C' },
    { label: 'Vibration',    v: '4.6 mm/s' },
    { label: 'Pressure',     v: '102 psi' },
    { label: 'Runtime',      v: '4,820 hrs' },
    { label: 'Oil age',      v: '38 days' },
    { label: 'Last service', v: '17 days' },
    { label: 'Ambient',      v: '31 °C' },
    { label: 'Load',         v: '78 %' },
  ];

  // Confidence ramps from 0 to 0.94
  const conf = clamp((localT - 6.8) / 1.4, 0, 0.94);

  return (
    <div style={{
      position: 'absolute',
      left: 920, top: 320,
      width: 880,
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* New incoming reading */}
      <div style={{
        background: COLORS.paper,
        border: `1px solid ${COLORS.rule}`,
        borderRadius: 10,
        boxShadow: '0 12px 32px rgba(40,30,15,0.08)',
        padding: 24,
        opacity: newRowOp,
        transform: `translateY(${(1 - newRowOp) * 12}px)`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
            New reading · M-204 · this morning
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 11, color: COLORS.inkMuted, letterSpacing: '0.1em',
          }}>
            8 FEATURES
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 10,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '10px 12px',
              background: COLORS.bgAlt,
              borderRadius: 5,
              opacity: clamp(newRowOp * 1.2 - i * 0.04, 0, 1),
            }}>
              <div style={{
                fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.1em',
                color: COLORS.inkMuted, textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {f.label}
              </div>
              <div style={{
                fontFamily: FONTS.mono, fontSize: 16, fontWeight: 600,
                color: COLORS.ink,
              }}>
                {f.v}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 14,
          fontSize: 13, color: COLORS.inkSoft, fontStyle: 'italic',
        }}>
          No single threshold is tripped. Old rules say <span style={{ color: COLORS.ham, fontStyle: 'normal', fontWeight: 600 }}>OK</span>.
        </div>
      </div>

      {/* Model verdict */}
      <div style={{
        background: COLORS.ink,
        borderRadius: 10,
        boxShadow: '0 18px 48px rgba(20,15,5,0.30)',
        padding: 28,
        opacity: verdictOp,
        transform: `translateY(${(1 - verdictOp) * 16}px)`,
        color: COLORS.bg,
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 12, letterSpacing: '0.22em',
          color: 'oklch(72% 0.10 200)',
          textTransform: 'uppercase',
          marginBottom: 12,
          fontWeight: 600,
        }}>
          Trained model · Verdict
        </div>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 18,
        }}>
          <div style={{
            fontFamily: FONTS.serif,
            fontSize: 56, fontWeight: 400,
            color: COLORS.spam,
            letterSpacing: '-0.025em',
            lineHeight: 1.0,
          }}>
            Will fail soon.
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 32, fontWeight: 700,
            color: COLORS.bg,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {(conf * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{
          marginTop: 14,
          height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            width: `${conf * 100}%`, height: '100%',
            background: COLORS.spam,
            transition: 'width 80ms linear',
          }}/>
        </div>
        <div style={{
          marginTop: 14,
          fontSize: 14, color: 'rgba(246,244,239,0.7)', lineHeight: 1.5,
        }}>
          Schedule maintenance in next 48 h. Top drivers:
          <span style={{ color: COLORS.bg, fontWeight: 600 }}> vibration trend</span>,
          <span style={{ color: COLORS.bg, fontWeight: 600 }}> oil age</span>,
          <span style={{ color: COLORS.bg, fontWeight: 600 }}> runtime since last service</span>.
        </div>
      </div>
    </div>
  );
}

function MachineCaption({ t, duration }) {
  const caps = [
    { text: 'Engineers tune thresholds for each sensor — temperature, vibration, pressure, runtime.', start: 1.2, end: 4.2 },
    { text: "Sensors stay just below every threshold — and the machine fails anyway.",                start: 4.4, end: 5.0 },
    { text: 'It failed because three small things happened together — no rule could catch that.',     start: 5.2, end: 7.4 },
    { text: 'ML reads thousands of past runs and learns what failure actually looks like.',           start: 8.5, end: 12.5 },
    { text: 'Subtle pattern across many features → confident, early warning.',                         start: 12.7, end: duration },
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
            left: '50%', bottom: 40,
            transform: `translateX(-50%) translateY(${(1 - fadeIn) * 8}px)`,
            opacity: op,
            fontFamily: FONTS.sans,
            fontSize: 22, fontWeight: 500,
            color: COLORS.inkSoft,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            maxWidth: 1400,
          }}>
            {c.text}
          </div>
        );
      })}
    </>
  );
}

Object.assign(window, { SceneMachine });
