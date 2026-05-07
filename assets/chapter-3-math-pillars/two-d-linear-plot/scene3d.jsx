// scene3d.jsx
// 3D projection helpers + scene composition for the linear equation plot.
//
// Coordinate convention (math-y, not screen-y):
//   x1 → "right-ish" axis     (red-ish hue)
//   x2 → "back" axis          (green-ish hue)
//   y  → "up" axis            (vertical)
//
// We project 3D points → 2D canvas pixels using a yaw (around y) + pitch (around x).

const PROJ = {
  // Camera
  scale: 154,   // px per world unit (reduced 30%: 220 → 154)
  cx: 960,      // canvas center x
  cy: 600,      // canvas center y (a bit below middle to leave room for equation)
  // The scene lives in positive (x1, x2, y) only. We shift the world center
  // so the positive box renders in the middle of the canvas.
  ox1: 1.5,
  ox2: 1.5,
  oy:  1.2,
};

// Project a 3D point {x1, x2, y} into 2D screen coords given yaw/pitch (radians).
function project3D(p, yaw, pitch) {
  // Translate so origin sits center-ish in canvas
  const px1 = p.x1 - PROJ.ox1;
  const px2 = p.x2 - PROJ.ox2;
  const py  = p.y  - PROJ.oy;
  // Rotate around Y axis (yaw): mixes x1 and x2
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x = px1 * cy - px2 * sy;
  const z = px1 * sy + px2 * cy;
  // Now rotate around X axis (pitch): mixes y and z
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const yRot = py * cp - z * sp;
  const zRot = py * sp + z * cp;
  // Orthographic projection (no perspective foreshortening)
  return {
    sx: PROJ.cx + x * PROJ.scale,
    sy: PROJ.cy - yRot * PROJ.scale, // screen y is inverted
    depth: zRot, // bigger = closer to viewer
  };
}

// Update axes to match reference: thinner, charcoal gray, smaller arrowheads
function Axis({ from, to, yaw, pitch, color, label, labelColor, progress = 1, dashed = false }) {
  const t = clamp(progress, 0, 1);
  const tip = {
    x1: from.x1 + (to.x1 - from.x1) * t,
    x2: from.x2 + (to.x2 - from.x2) * t,
    y:  from.y  + (to.y  - from.y)  * t,
  };

  const a = project3D(from, yaw, pitch);
  const b = project3D(tip, yaw, pitch);

  const angle = Math.atan2(b.sy - a.sy, b.sx - a.sx);
  const ahLen = 11;
  const ahWid = 5;
  const ax1 = b.sx - ahLen * Math.cos(angle) + ahWid * Math.sin(angle);
  const ay1 = b.sy - ahLen * Math.sin(angle) - ahWid * Math.cos(angle);
  const ax2 = b.sx - ahLen * Math.cos(angle) - ahWid * Math.sin(angle);
  const ay2 = b.sy - ahLen * Math.sin(angle) + ahWid * Math.cos(angle);

  const labelOffset = 26;
  const lx = b.sx + labelOffset * Math.cos(angle);
  const ly = b.sy + labelOffset * Math.sin(angle);

  return (
    <g opacity={t > 0.01 ? 1 : 0}>
      <line
        x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
        stroke={color}
        strokeWidth={1.6}
        strokeDasharray={dashed ? '6 6' : 'none'}
        strokeLinecap="round"
      />
      {t > 0.95 && (
        <>
          <polygon
            points={`${b.sx},${b.sy} ${ax1},${ay1} ${ax2},${ay2}`}
            fill={color}
          />
          <text
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize={26}
            fontStyle="italic"
            fontWeight={500}
            fill={labelColor || color}
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

// ── Plane (quadrilateral with grid lines) ───────────────────────────────────
// Plane equation: y = w1*x1 + w2*x2 + b
// We sample a grid in (x1, x2) over [-2, 2] × [-2, 2]
function Plane({ w1, w2, b, yaw, pitch, opacity = 1, color = 'oklch(64% 0.15 30)', range = 2.2 }) {
  const planeY = (x1, x2) => w1 * x1 + w2 * x2 + b;
  // Plane lives in positive (x1, x2) only: [0, range] × [0, range]
  const lo = 0;
  const hi = range;

  // Outer corners (counter-clockwise)
  const corners = [
    { x1: lo, x2: lo },
    { x1: hi, x2: lo },
    { x1: hi, x2: hi },
    { x1: lo, x2: hi },
  ].map(c => project3D({ ...c, y: planeY(c.x1, c.x2) }, yaw, pitch));

  const polyPts = corners.map(c => `${c.sx},${c.sy}`).join(' ');

  return (
    <g opacity={opacity}>
      <polygon
        points={polyPts}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </g>
  );
}

// ── Ground grid (the x1-x2 plane at y=0) ────────────────────────────────────
function GroundGrid({ yaw, pitch, opacity = 0.5, color = '#9b958a', size = 2.5, N = 8 }) {
  const lo = 0;
  const hi = size;
  const lines = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const v = lo + (hi - lo) * t;
    const a = project3D({ x1: lo, x2: v, y: 0 }, yaw, pitch);
    const z = project3D({ x1: hi, x2: v, y: 0 }, yaw, pitch);
    lines.push(
      <line key={`g1-${i}`}
        x1={a.sx} y1={a.sy} x2={z.sx} y2={z.sy}
        stroke={color}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
    );
    const a2 = project3D({ x1: v, x2: lo, y: 0 }, yaw, pitch);
    const z2 = project3D({ x1: v, x2: hi, y: 0 }, yaw, pitch);
    lines.push(
      <line key={`g2-${i}`}
        x1={a2.sx} y1={a2.sy} x2={z2.sx} y2={z2.sy}
        stroke={color}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
    );
  }
  return <g opacity={opacity}>{lines}</g>;
}

// ── Open-box walls: the three faces OPPOSITE the axes. ─────────────────────
// Axes sit along x1=0, x2=0, y=0 edges (front/bottom). Walls go on the far sides:
//   • far x1-y wall at x2 = size       (opposite the x2 axis)
//   • far x2-y wall at x1 = size       (opposite the x1 axis)
//   • top x1-x2 wall at y  = height    (opposite the y axis / floor)
function Walls({ yaw, pitch, opacity = 0.5, color = '#9b958a', size = 2.5, height = 2.5, N = 8 }) {
  const lines = [];

  // Wall A: far x1-y wall at x2 = size
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x1v = t * size;
    const a = project3D({ x1: x1v, x2: size, y: 0 }, yaw, pitch);
    const z = project3D({ x1: x1v, x2: size, y: height }, yaw, pitch);
    lines.push(
      <line key={`wA-v${i}`}
        x1={a.sx} y1={a.sy} x2={z.sx} y2={z.sy}
        stroke={color} strokeOpacity={0.5} strokeWidth={1}
      />
    );
    const yv = t * height;
    const a2 = project3D({ x1: 0,    x2: size, y: yv }, yaw, pitch);
    const z2 = project3D({ x1: size, x2: size, y: yv }, yaw, pitch);
    lines.push(
      <line key={`wA-h${i}`}
        x1={a2.sx} y1={a2.sy} x2={z2.sx} y2={z2.sy}
        stroke={color} strokeOpacity={0.5} strokeWidth={1}
      />
    );
  }

  // Wall B: far x2-y wall at x1 = size
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x2v = t * size;
    const a = project3D({ x1: size, x2: x2v, y: 0 }, yaw, pitch);
    const z = project3D({ x1: size, x2: x2v, y: height }, yaw, pitch);
    lines.push(
      <line key={`wB-v${i}`}
        x1={a.sx} y1={a.sy} x2={z.sx} y2={z.sy}
        stroke={color} strokeOpacity={0.5} strokeWidth={1}
      />
    );
    const yv = t * height;
    const a2 = project3D({ x1: size, x2: 0,    y: yv }, yaw, pitch);
    const z2 = project3D({ x1: size, x2: size, y: yv }, yaw, pitch);
    lines.push(
      <line key={`wB-h${i}`}
        x1={a2.sx} y1={a2.sy} x2={z2.sx} y2={z2.sy}
        stroke={color} strokeOpacity={0.5} strokeWidth={1}
      />
    );
  }

  // Wall C: top x1-x2 wall at y = height
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const v = t * size;
    // lines along x1 (constant x2)
    const a = project3D({ x1: 0,    x2: v, y: height }, yaw, pitch);
    const z = project3D({ x1: size, x2: v, y: height }, yaw, pitch);
    lines.push(
      <line key={`wC-1-${i}`}
        x1={a.sx} y1={a.sy} x2={z.sx} y2={z.sy}
        stroke={color} strokeOpacity={0.5} strokeWidth={1}
      />
    );
    // lines along x2 (constant x1)
    const a2 = project3D({ x1: v, x2: 0,    y: height }, yaw, pitch);
    const z2 = project3D({ x1: v, x2: size, y: height }, yaw, pitch);
    lines.push(
      <line key={`wC-2-${i}`}
        x1={a2.sx} y1={a2.sy} x2={z2.sx} y2={z2.sy}
        stroke={color} strokeOpacity={0.5} strokeWidth={1}
      />
    );
  }

  return <g opacity={opacity}>{lines}</g>;
}

// ── Data points (scatter that snaps onto the plane) ─────────────────────────
// Each point has a "true" location (x1, x2, yTrue) and a "noisy" yObs.
// As `snap` goes 0→1, the rendered y interpolates from yObs to yTrue.
const DATA_POINTS = [
  { x1: 0.30, x2: 1.90, noise:  0.45 },
  { x1: 1.40, x2: 0.60, noise: -0.32 },
  { x1: 0.50, x2: 0.70, noise:  0.30 },
  { x1: 1.70, x2: 1.10, noise: -0.40 },
  { x1: 0.85, x2: 1.20, noise:  0.25 },
  { x1: 1.30, x2: 1.85, noise:  0.36 },
  { x1: 2.00, x2: 0.55, noise: -0.28 },
  { x1: 0.45, x2: 2.05, noise: -0.22 },
  { x1: 0.20, x2: 0.25, noise:  0.32 },
  { x1: 2.05, x2: 0.20, noise: -0.24 },
  { x1: 1.55, x2: 1.95, noise:  0.26 },
  { x1: 0.70, x2: 1.50, noise: -0.36 },
];

function DataPoints({ w1, w2, b, yaw, pitch, appear = 1, snap = 0, showResiduals = false }) {
  const planeY = (x1, x2) => w1 * x1 + w2 * x2 + b;
  const TEAL = 'oklch(50% 0.10 220)';
  return (
    <g>
      {DATA_POINTS.map((p, i) => {
        const localAppear = clamp(appear * DATA_POINTS.length - i, 0, 1);
        if (localAppear <= 0) return null;
        const yTrue = planeY(p.x1, p.x2);
        const yObs = yTrue + p.noise;
        const yShown = yObs + (yTrue - yObs) * snap;

        const proj = project3D({ x1: p.x1, x2: p.x2, y: yShown }, yaw, pitch);
        const groundProj = project3D({ x1: p.x1, x2: p.x2, y: 0 }, yaw, pitch);

        const r = 9 * Easing.easeOutBack(localAppear);
        return (
          <g key={i} opacity={localAppear}>
            {/* Dashed drop-line down to the ground */}
            <line
              x1={proj.sx} y1={proj.sy}
              x2={groundProj.sx} y2={groundProj.sy}
              stroke={TEAL}
              strokeWidth={1.4}
              strokeDasharray="5 4"
              opacity={0.7}
            />
            <circle
              cx={proj.sx} cy={proj.sy} r={r}
              fill={TEAL}
              stroke="var(--bg, #f6f4ef)"
              strokeWidth={2}
            />
          </g>
        );
      })}
    </g>
  );
}

// ── Vertical "b" indicator: a dashed line from origin up to (0,0,b) ─────────
function BiasIndicator({ b, yaw, pitch, opacity = 1 }) {
  const a = project3D({ x1: 0, x2: 0, y: 0 }, yaw, pitch);
  const z = project3D({ x1: 0, x2: 0, y: b }, yaw, pitch);
  return (
    <g opacity={opacity}>
      <line
        x1={a.sx} y1={a.sy} x2={z.sx} y2={z.sy}
        stroke="oklch(58% 0.16 30)"
        strokeWidth={2.5}
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <circle cx={z.sx} cy={z.sy} r={5} fill="oklch(58% 0.16 30)"/>
      <text
        x={z.sx + 14} y={z.sy - 6}
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize={22}
        fontWeight={600}
        fill="oklch(58% 0.16 30)"
      >
        b
      </text>
    </g>
  );
}

Object.assign(window, {
  project3D, Axis, Plane, GroundGrid, Walls, DataPoints, BiasIndicator, PROJ, DATA_POINTS,
});
