// scenes.jsx — Neural network thumbnail animation
// Reads from globals provided by animations.jsx

const { useMemo, useRef, useEffect, useState } = React;

// ── Palettes ────────────────────────────────────────────────────────────────
const PALETTES = {
  "Warm Linen": {
    bg: "#f4ede0",
    bgGlow: "#fbf6ec",
    bgEdge: "#e8dfcc",
    ink: "#1a1714",
    inkDim: "rgba(26,23,20,0.55)",
    accent: "#3a6df0",
    accent2: "#e87a5d",
    accent3: "#1a1714",
    rule: "rgba(26,23,20,0.16)",
    light: true
  },
  "Paper White": {
    bg: "#ffffff",
    bgGlow: "#f6f6f6",
    bgEdge: "#ececec",
    ink: "#0a0a0a",
    inkDim: "rgba(10,10,10,0.55)",
    accent: "#1f3df0",
    accent2: "#d9285a",
    accent3: "#0a0a0a",
    rule: "rgba(10,10,10,0.14)",
    light: true
  },
  "Midnight": {
    bg: "#070b16",
    bgGlow: "#0f1830",
    bgEdge: "#02040a",
    ink: "#f4f1ea",
    inkDim: "rgba(244,241,234,0.55)",
    accent: "#5fd2f5",
    accent2: "#f5a623",
    accent3: "#9b7af0",
    rule: "rgba(244,241,234,0.16)",
    light: false
  },
  "Mint": {
    bg: "#0d2620",
    bgGlow: "#143a2f",
    bgEdge: "#06140f",
    ink: "#eef6f1",
    inkDim: "rgba(238,246,241,0.55)",
    accent: "#7adcae",
    accent2: "#e87a5d",
    accent3: "#3aa37a",
    rule: "rgba(238,246,241,0.16)",
    light: false
  },
  "Plum": {
    bg: "#1a0d1f",
    bgGlow: "#2a1530",
    bgEdge: "#0c0512",
    ink: "#f4ecf4",
    inkDim: "rgba(244,236,244,0.55)",
    accent: "#c78ee0",
    accent2: "#e08a1f",
    accent3: "#f0d4f5",
    rule: "rgba(244,236,244,0.16)",
    light: false
  },
  "Deep Navy": {
    bg: "#0a1428",
    bgGlow: "#142340",
    bgEdge: "#04081a",
    ink: "#eef2f8",
    inkDim: "rgba(238,242,248,0.55)",
    accent: "#5fe8ec",
    accent2: "#4ee0a0",
    accent3: "#9ad0ff",
    rule: "rgba(238,242,248,0.16)",
    light: false
  }
};

const PaletteContext = React.createContext(PALETTES["Midnight"]);
const usePAL = () => React.useContext(PaletteContext);

// ── Helpers ─────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, t) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const rand = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// ── Network topology ────────────────────────────────────────────────────────
const LAYERS = [5, 7, 7, 4];
const NETWORK = (() => {
  const cx = 960,cy = 540,layerGap = 220;
  const totalW = (LAYERS.length - 1) * layerGap;
  const startX = cx - totalW / 2;
  const nodes = [];
  LAYERS.forEach((count, li) => {
    const colH = (count - 1) * 80;
    const startY = cy - colH / 2;
    for (let i = 0; i < count; i++) {
      nodes.push({ id: `${li}-${i}`, layer: li, idx: i, x: startX + li * layerGap, y: startY + i * 80 });
    }
  });
  const edges = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a = nodes.filter((n) => n.layer === li);
    const b = nodes.filter((n) => n.layer === li + 1);
    a.forEach((p) => b.forEach((q) => edges.push({ id: `${p.id}->${q.id}`, from: p, to: q })));
  }
  return { nodes, edges };
})();

// ── Backdrop ────────────────────────────────────────────────────────────────
function Backdrop() {
  const PAL = usePAL();
  const t = useTime();
  const stars = useMemo(
    () => Array.from({ length: 90 }, (_, i) => ({
      x: rand(i * 1.13) * 1920,
      y: rand(i * 2.71) * 1080,
      r: 0.4 + rand(i * 3.7) * 1.4,
      s: 0.3 + rand(i * 5.1) * 0.7,
      phase: rand(i * 7.3) * Math.PI * 2
    })), []
  );
  return (
    <g>
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={PAL.bgGlow} />
          <stop offset="60%" stopColor={PAL.bg} />
          <stop offset="100%" stopColor={PAL.bgEdge} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#bgGrad)" />
      {stars.map((s, i) => {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.6 + s.phase);
        return (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={PAL.ink}
            opacity={(PAL.light ? 0.08 : 0.15) + (PAL.light ? 0.25 : 0.55) * tw * s.s} />);


      })}
    </g>);

}

// ── Converging particles ────────────────────────────────────────────────────
function ConvergingParticles() {
  const PAL = usePAL();
  const t = useTime();
  const particles = useMemo(() =>
  NETWORK.nodes.flatMap((n, ni) =>
  Array.from({ length: 3 }, (_, k) => {
    const seed = ni * 7 + k;
    return {
      target: n,
      startX: 960 + (rand(seed * 1.3) - 0.5) * 2400,
      startY: 540 + (rand(seed * 2.7) - 0.5) * 1400,
      delay: rand(seed * 3.1) * 0.4,
      key: `${n.id}-${k}`
    };
  })
  ), []
  );
  return (
    <g>
      {particles.map((p) => {
        const local = (t - p.delay) / 1.4;
        if (local < 0 || local > 1.6) return null;
        const e = smoothstep(0, 1, Math.min(1, local));
        const x = lerp(p.startX, p.target.x, e);
        const y = lerp(p.startY, p.target.y, e);
        const alpha = local < 1 ? local : Math.max(0, 1.6 - local) / 0.6;
        return <circle key={p.key} cx={x} cy={y} r={2.5} fill={PAL.accent} opacity={alpha * 0.9} />;
      })}
    </g>);

}

// ── Edges + traveling pulses ────────────────────────────────────────────────
function Edges() {
  const PAL = usePAL();
  const t = useTime();
  const edgeAlpha = smoothstep(1.6, 2.6, t) * (PAL.light ? 0.45 : 0.55);

  const pulse = (li) => {
    const base = 3.0 + li * 0.35;
    const period = 2.6;
    const localT = t - base;
    if (localT < 0) return null;
    return localT % period / period;
  };

  return (
    <g>
      {NETWORK.edges.map((e, i) => {
        const dim = 0.55 + 0.45 * rand(i * 1.7);
        return (
          <line
            key={e.id}
            x1={e.from.x} y1={e.from.y}
            x2={e.to.x} y2={e.to.y}
            stroke={PAL.accent}
            strokeWidth={0.8}
            opacity={edgeAlpha * dim} />);


      })}
      {t > 3 && NETWORK.edges.map((e, i) => {
        const phase = pulse(e.from.layer);
        if (phase === null) return null;
        const stagger = rand(i * 2.1) * 0.15;
        const p = (phase - stagger + 1) % 1;
        if (p > 0.45) return null;
        const k = p / 0.45;
        const x = lerp(e.from.x, e.to.x, k);
        const y = lerp(e.from.y, e.to.y, k);
        return (
          <circle
            key={`pulse-${e.id}`}
            cx={x} cy={y} r={2.4}
            fill={PAL.accent2}
            opacity={(1 - k) * 0.95} />);


      })}
    </g>);

}

// ── Nodes ───────────────────────────────────────────────────────────────────
function Nodes() {
  const PAL = usePAL();
  const t = useTime();
  return (
    <g>
      {NETWORK.nodes.map((n, i) => {
        const appear = smoothstep(1.4 + i * 0.02, 1.9 + i * 0.02, t);
        if (appear === 0) return null;
        const layerStart = 3.0 + n.layer * 0.35;
        const period = 2.6;
        let activation = 0;
        if (t > layerStart) {
          const phase = (t - layerStart) % period / period;
          activation = Math.max(0, 1 - Math.abs(phase - 0.12) / 0.18);
          activation *= 0.5 + 0.5 * rand(i * 3.7);
        }
        const r = 8 + activation * 5;
        const glow = activation;
        return (
          <g key={n.id} opacity={appear}>
            <circle cx={n.x} cy={n.y} r={r + 14} fill={PAL.accent} opacity={(PAL.light ? 0.04 : 0.06) + glow * 0.28} />
            <circle cx={n.x} cy={n.y} r={r + 6} fill={PAL.accent} opacity={(PAL.light ? 0.08 : 0.12) + glow * 0.35} />
            <circle cx={n.x} cy={n.y} r={r} fill={PAL.bg} stroke={PAL.accent} strokeWidth={1.6} />
            <circle cx={n.x} cy={n.y} r={r - 3} fill={PAL.accent} opacity={0.4 + glow * 0.6} />
          </g>);

      })}
    </g>);

}

// ── Floating data tokens ────────────────────────────────────────────────────
function DataTokens() {
  const PAL = usePAL();
  const t = useTime();
  const tokens = useMemo(() =>
  Array.from({ length: 22 }, (_, i) => ({
    x: rand(i * 1.91) * 1920,
    y: rand(i * 4.13) * 1080,
    char: ["0", "1", "0", "1", "{", "}", "<", ">", "·"][Math.floor(rand(i * 6.7) * 9)],
    speed: 8 + rand(i * 2.3) * 18,
    size: 12 + rand(i * 5.3) * 8,
    phase: rand(i * 7.7) * Math.PI * 2
  })), []
  );
  const alpha = smoothstep(2.2, 3.4, t);
  return (
    <g opacity={alpha}>
      {tokens.map((tk, i) => {
        const y = (tk.y + t * tk.speed) % 1140 - 30;
        const op = (PAL.light ? 0.12 : 0.18) + 0.18 * Math.sin(t * 1.3 + tk.phase);
        return (
          <text key={i} x={tk.x} y={y} fill={PAL.accent}
          fontFamily="ui-monospace, 'JetBrains Mono', monospace"
          fontSize={tk.size} opacity={op}>
            {tk.char}
          </text>);

      })}
    </g>);

}

// ── Title ───────────────────────────────────────────────────────────────────
function Title() {
  const PAL = usePAL();
  const tRaw = useTime();
  const t = Math.min(tRaw, 6.0); // freeze title state after intro completes
  const wEy = smoothstep(2.4, 3.0, t);
  const w1 = smoothstep(2.9, 3.6, t); // line 1
  const w2 = smoothstep(3.5, 4.2, t); // line 2 (ML / NN)
  const wRule = smoothstep(4.2, 4.8, t);
  const w3 = smoothstep(4.6, 5.4, t); // tagline
  // Subtle continuous "breathing" stays alive after intro
  const breathe = 1 + 0.005 * Math.sin(tRaw * 1.2);

  const wordStyle = (alpha) => ({
    display: "block",
    opacity: alpha,
    transform: `translateY(${(1 - alpha) * 26}px)`,
    filter: `blur(${(1 - alpha) * 8}px)`
  });

  const explainedInk = PAL.light ?
  `color-mix(in oklab, ${PAL.ink} 78%, ${PAL.accent} 22%)` :
  `color-mix(in oklab, ${PAL.ink} 70%, ${PAL.accent} 30%)`;

  return (
    <foreignObject x={100} y={80} width={820} height={780}>
      <div xmlns="http://www.w3.org/1999/xhtml"
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: PAL.ink,
        transform: `scale(${breathe})`, transformOrigin: "left center",
        textAlign: "left", padding: "0px"
      }}>
        <div style={{
          opacity: wEy,
          transform: `translateY(${(1 - wEy) * 10}px)`,
          display: "flex", alignItems: "center", gap: "16px",
          fontSize: "15px",
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          fontWeight: 500,
          color: PAL.inkDim,
          marginBottom: "34px"
        }}>
          <span style={{ width: "56px", height: "1px", background: PAL.rule }}></span>
          <span>The Series</span>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: PAL.accent,
            boxShadow: `0 0 10px ${PAL.accent}`
          }}></span>
          <span>Vol. 01</span>
        </div>

        <h1 style={{
          margin: 0,
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
          color: explainedInk,
          textWrap: "balance",
          lineHeight: 0.9
        }}>
          <span style={{
            ...wordStyle(w1),
            fontSize: "118px",
            fontWeight: 800,
            letterSpacing: "-0.045em",
            whiteSpace: "nowrap"
          }}>AI Explained</span>
        </h1>

        <div style={{
          marginTop: "36px",
          width: `${wRule * 200}px`,
          height: "1.5px",
          background: PAL.accent,
          opacity: wRule * 0.85
        }}></div>

        <div style={{
          ...wordStyle(w2),
          marginTop: "32px",
          fontSize: "44px",
          fontWeight: 500,
          letterSpacing: "-0.012em",
          lineHeight: 1.15,
          color: PAL.ink
        }}>
          Machine Learning
          <span style={{
            display: "inline-block",
            margin: "0 18px",
            width: "8px", height: "8px",
            borderRadius: "50%",
            background: PAL.accent,
            boxShadow: `0 0 12px ${PAL.accent}`,
            verticalAlign: "middle"
          }}></span>
          Neural Networks
        </div>
      </div>
    </foreignObject>);

}

// ── Camera (subtle ken-burns) ───────────────────────────────────────────────
// Brain corner badge — pseudo-3D rotating point cloud
const BRAIN_POINTS = (() => {
  const pts = [];
  for (let i = 0; i < 70; i++) {
    const u = rand(i * 1.13),v = rand(i * 2.71),w = rand(i * 4.07);
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const rj = 0.86 + w * 0.16;
    const x = 1.0 * rj * Math.sin(phi) * Math.cos(theta);
    let y = 0.78 * rj * Math.cos(phi);
    const z = 0.85 * rj * Math.sin(phi) * Math.sin(theta);
    const groove = Math.exp(-(x * x / 0.03 + (y - 0.6) ** 2 / 0.05));
    y -= groove * 0.06;
    pts.push({ x, y, z, seed: i });
  }
  return pts;
})();

const BRAIN_EDGES = (() => {
  const edges = [];
  for (let i = 0; i < BRAIN_POINTS.length; i++) {
    const a = BRAIN_POINTS[i];
    const dists = [];
    for (let j = 0; j < BRAIN_POINTS.length; j++) {
      if (i === j) continue;
      const b = BRAIN_POINTS[j];
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      dists.push({ j, d });
    }
    dists.sort((p, q) => p.d - q.d);
    for (let k = 0; k < 3; k++) {
      const j = dists[k].j;
      const lo = Math.min(i, j),hi = Math.max(i, j);
      edges.push({ a: lo, b: hi, key: `${lo}-${hi}` });
    }
  }
  const seen = new Set();
  return edges.filter((e) => seen.has(e.key) ? false : (seen.add(e.key), true));
})();

function BrainBadge() {
  const PAL = usePAL();
  const t = useTime();
  const enter = smoothstep(0.6, 1.6, t);
  if (enter === 0) return null;

  const cx = 1750,cy = 145,R = 88;
  const yaw = t * 0.7;
  const pitch = Math.sin(t * 0.35) * 0.18;
  const cosY = Math.cos(yaw),sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch),sinP = Math.sin(pitch);

  const project = (p) => {
    let x = p.x * cosY + p.z * sinY;
    let z = -p.x * sinY + p.z * cosY;
    const y2 = p.y * cosP - z * sinP;
    z = p.y * sinP + z * cosP;
    const persp = 1 / (1 + z * 0.35);
    return { sx: cx + x * R * persp, sy: cy + y2 * R * persp, depth: z, persp };
  };

  const proj = BRAIN_POINTS.map(project);

  const firings = [];
  for (let k = 0; k < 4; k++) {
    const seedT = Math.floor(t * 1.5 + k * 9);
    const ei = Math.floor(rand(seedT * 7.13 + k * 3) * BRAIN_EDGES.length);
    const e = BRAIN_EDGES[ei];
    const phase = (t * 1.5 + k * 0.37) % 1;
    firings.push({ e, phase });
  }

  return (
    <g opacity={enter}>
      <circle cx={cx} cy={cy} r={R + 20} fill="none" stroke={PAL.rule} strokeWidth={1} opacity={0.6} />
      <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke={PAL.accent} strokeWidth={0.6} opacity={0.35} />
      <circle cx={cx} cy={cy} r={R - 10} fill={PAL.accent} opacity={PAL.light ? 0.05 : 0.08} />

      {BRAIN_EDGES.
      map((e) => {
        const a = proj[e.a],b = proj[e.b];
        const meanZ = (a.depth + b.depth) / 2;
        return { e, a, b, meanZ };
      }).
      sort((p, q) => q.meanZ - p.meanZ).
      map(({ e, a, b, meanZ }) => {
        const depthAlpha = 0.22 + (1 - (meanZ + 1) / 2) * 0.5;
        return (
          <line key={e.key} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
          stroke={PAL.accent} strokeWidth={0.7} opacity={depthAlpha * 0.7} />);

      })}

      {proj.
      map((p, i) => ({ p, i })).
      sort((a, b) => b.p.depth - a.p.depth).
      map(({ p, i }) => {
        const depthAlpha = 0.4 + (1 - (p.depth + 1) / 2) * 0.6;
        const tw = 0.85 + 0.15 * Math.sin(t * 2 + i * 0.7);
        const r = 1.6 + p.persp * 0.8;
        return (
          <g key={i}>
              <circle cx={p.sx} cy={p.sy} r={r + 2} fill={PAL.accent} opacity={depthAlpha * 0.18} />
              <circle cx={p.sx} cy={p.sy} r={r} fill={PAL.accent} opacity={depthAlpha * tw} />
            </g>);

      })}

      {firings.map(({ e, phase }, k) => {
        const a = proj[e.a],b = proj[e.b];
        const x = lerp(a.sx, b.sx, phase);
        const y = lerp(a.sy, b.sy, phase);
        const fade = Math.sin(phase * Math.PI);
        return (
          <g key={`fire-${k}`}>
            <circle cx={x} cy={y} r={5} fill={PAL.accent2} opacity={fade * 0.35} />
            <circle cx={x} cy={y} r={2.4} fill={PAL.accent2} opacity={fade} />
          </g>);

      })}

      <text x={cx} y={cy + R + 44}
      fill={PAL.inkDim} fontFamily="'Inter', sans-serif"
      fontSize={11} fontWeight={500} letterSpacing={3} textAnchor="middle">
        LIVE · NEURAL ACTIVITY
      </text>
    </g>);

}

function Camera({ children }) {
  const t = useTime();
  const zoom = 0.82 + smoothstep(0, 8, t) * 0.05;
  const px = Math.sin(t * 0.25) * 6;
  const py = Math.cos(t * 0.2) * 5;
  // Shift the network into the right half (pane center ≈ x=1380, y=560)
  const shiftX = 420;
  const shiftY = 20;
  return (
    <g style={{
      transformOrigin: "960px 540px",
      transform: `translate(${shiftX + px}px, ${shiftY + py}px) scale(${zoom})`
    }}>
      {children}
    </g>);

}

function TimestampLabel() {
  const t = useTime();
  const sec = Math.floor(t);
  useEffect(() => {
    const root = document.querySelector("[data-video-root]");
    if (root) root.setAttribute("data-screen-label", `t=${sec}s`);
  }, [sec]);
  return null;
}

// ── TitleSpotlight: radial vignette to focus the eye on the title ──────────
function TitleSpotlight() {
  const PAL = usePAL();
  const tRaw = useTime();
  const enter = smoothstep(2.0, 3.4, tRaw);
  if (enter === 0) return null;

  const hexToRgb = (h) => {
    const m = h.replace("#", "");
    const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
    const n = parseInt(v, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [br, bgg, bb] = hexToRgb(PAL.bg);
  const stop = (a) => `rgba(${br},${bgg},${bb},${a})`;

  return (
    <g style={{ pointerEvents: "none" }}>
      <defs>
        <radialGradient id="titleHalo" cx="50%" cy="46%" r="38%">
          <stop offset="0%"   stopColor={stop(0.92 * enter)} />
          <stop offset="55%"  stopColor={stop(0.55 * enter)} />
          <stop offset="100%" stopColor={stop(0)} />
        </radialGradient>
        <radialGradient id="titleAccent" cx="50%" cy="46%" r="34%">
          <stop offset="0%"   stopColor={PAL.accent} stopOpacity={PAL.light ? 0.06 * enter : 0.10 * enter} />
          <stop offset="60%"  stopColor={PAL.accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={960} cy={500} rx={1100} ry={420} fill="url(#titleHalo)" />
      <ellipse cx={960} cy={500} rx={900} ry={340} fill="url(#titleAccent)" />
    </g>
  );
}

// ── Vertical divider between text pane and animation pane ─────────────────
function Divider() {
  const PAL = usePAL();
  const t = useTime();
  const grow = smoothstep(1.6, 3.2, t);
  if (grow === 0) return null;
  const cx = 950;
  const top = 140 + (1 - grow) * 200;
  const bot = 940 - (1 - grow) * 200;
  return (
    <g style={{ pointerEvents: "none" }}>
      <line x1={cx} y1={top} x2={cx} y2={bot}
        stroke={PAL.rule} strokeWidth="1" />
      {/* Accent dot on the divider */}
      <circle cx={cx} cy={540} r={3.5}
        fill={PAL.accent}
        opacity={grow}
        style={{ filter: `drop-shadow(0 0 8px ${PAL.accent})` }} />
    </g>
  );
}

// ── Main scene ──────────────────────────────────────────────────────────────
function ThumbnailScene({ paletteName = "Midnight" }) {
  const PAL = PALETTES[paletteName] || PALETTES["Midnight"];
  return (
    <PaletteContext.Provider value={PAL}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
      style={{ display: "block", background: PAL.bg }}>
        <Backdrop />
        <Camera>
          <ConvergingParticles />
          <Edges />
          <Nodes />
        </Camera>
        <DataTokens />
        <Title />
        <Pillars />
        <BrainBadge />
        <TimestampLabel />
      </svg>
    </PaletteContext.Provider>);

}

// ── Three Pillars (bottom row) ──────────────────────────────────────────────
// Custom outline icons that "draw in" via stroke-dashoffset, with subtle
// continuous animations after intro completes.

// ── Particle helper for pillar icons ───────────────────────────────────────
// Each particle has a random origin and a target (x,y). `draw` 0→1 controls
// flight; once landed it can pulse/orbit subtly via per-particle phase.
function makeParticles(targets, seedBase) {
  return targets.map((tgt, i) => {
    const a = rand(seedBase + i * 1.31) * Math.PI * 2;
    const dist = 80 + rand(seedBase + i * 2.07) * 80;
    return {
      ...tgt,
      ox: 60 + Math.cos(a) * dist,
      oy: 60 + Math.sin(a) * dist,
      delay: rand(seedBase + i * 3.11) * 0.35,
      phase: rand(seedBase + i * 4.91) * Math.PI * 2,
    };
  });
}

// ── Badge frame: glowing ring + halo around a centered symbol ──────────────
// Used by all three pillar icons so they read as a coherent set.
function BadgeFrame({ hue, draw, t, children }) {
  const halo = smoothstep(0, 0.25, draw);
  const ringOuter = smoothstep(0.1, 0.45, draw);
  const ringInner = smoothstep(0.25, 0.6, draw);
  const symbol = smoothstep(0.45, 1.0, draw);
  const breathe = 1 + 0.04 * Math.sin(t * 1.4);
  const sweep = (t * 60) % 360;
  const C = 2 * Math.PI * 62;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <radialGradient id={`halo-${hue.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={hue.glow} stopOpacity="0.55" />
          <stop offset="55%" stopColor={hue.glow} stopOpacity="0.18" />
          <stop offset="100%" stopColor={hue.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo */}
      <circle cx={80} cy={80} r={78} fill={`url(#halo-${hue.id})`} opacity={halo} />

      {/* Outer ring (full) */}
      <g style={{ transformOrigin: "80px 80px", transform: `scale(${breathe})` }}>
        <circle cx={80} cy={80} r={62}
          stroke={hue.mid} strokeWidth="2.2"
          opacity={ringOuter * 0.85} fill="none"
          strokeDasharray={C}
          strokeDashoffset={(1 - ringOuter) * C}
          style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }} />
        {/* Bright animated arc that travels around the ring */}
        <circle cx={80} cy={80} r={62}
          stroke={hue.bright} strokeWidth="2.6"
          opacity={ringOuter * 0.9} fill="none"
          strokeDasharray="40 350"
          style={{
            transform: `rotate(${sweep}deg)`,
            transformOrigin: "80px 80px",
            filter: `drop-shadow(0 0 6px ${hue.bright})`
          }} />
      </g>

      {/* Inner ring */}
      <circle cx={80} cy={80} r={52}
        stroke={hue.mid} strokeWidth="1"
        opacity={ringInner * 0.5} fill="none" />

      {/* Inner core tint */}
      <circle cx={80} cy={80} r={50}
        fill={hue.bright} opacity={ringInner * 0.04} />

      {/* Tick marks at NSEW (matches reference images) */}
      {[0, 90, 180, 270].map((ang) => {
        const a = (ang * Math.PI) / 180;
        return (
          <line key={ang}
            x1={80 + Math.cos(a) * 64} y1={80 + Math.sin(a) * 64}
            x2={80 + Math.cos(a) * 70} y2={80 + Math.sin(a) * 70}
            stroke={hue.mid} strokeWidth="1.4" strokeLinecap="round"
            opacity={ringOuter * 0.7} />
        );
      })}

      {/* Symbol payload */}
      <g opacity={symbol} style={{
        transformOrigin: "80px 80px",
        transform: `scale(${0.85 + symbol * 0.15})`
      }}>
        {children({ hue, t, reveal: symbol })}
      </g>
    </svg>
  );
}

// ── Symbol: Brain (Understand the Concepts) ────────────────────────────────
function BrainSymbol({ hue, t, reveal }) {
  const len = 1100;
  const dashOff = (1 - reveal) * len;
  const c = hue.bright;
  const dots = [
    { x: 68, y: 72, ph: 0 },
    { x: 92, y: 78, ph: 1.1 },
    { x: 78, y: 92, ph: 2.2 },
    { x: 96, y: 90, ph: 3.3 }
  ];
  return (
    <g>
      {/* Left hemisphere */}
      <path
        d="M78 52 C62 52 52 62 52 74 C46 76 42 82 42 90 C42 98 46 104 52 106 C52 116 60 122 72 122 L78 122 Z"
        stroke={c} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
        fill="none"
        strokeDasharray={len} strokeDashoffset={dashOff}
        style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
      {/* Right hemisphere */}
      <path
        d="M82 52 C98 52 108 62 108 74 C114 76 118 82 118 90 C118 98 114 104 108 106 C108 116 100 122 88 122 L82 122 Z"
        stroke={c} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
        fill="none"
        strokeDasharray={len} strokeDashoffset={dashOff}
        style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
      {/* Central seam */}
      <line x1={80} y1={52} x2={80} y2={122}
        stroke={c} strokeWidth="1.6"
        opacity={reveal * 0.55}
        strokeDasharray="2 4" />
      {/* Inner folds */}
      <path d="M62 70 C58 76 62 82 68 82 C66 88 70 94 76 92"
        stroke={c} strokeWidth="1.6" opacity={reveal * 0.7} fill="none" strokeLinecap="round" />
      <path d="M98 70 C102 76 98 82 92 82 C94 88 90 94 84 92"
        stroke={c} strokeWidth="1.6" opacity={reveal * 0.7} fill="none" strokeLinecap="round" />
      <path d="M58 102 C64 98 76 98 80 102"
        stroke={c} strokeWidth="1.6" opacity={reveal * 0.7} fill="none" strokeLinecap="round" />
      <path d="M102 102 C96 98 84 98 80 102"
        stroke={c} strokeWidth="1.6" opacity={reveal * 0.7} fill="none" strokeLinecap="round" />
      {/* Pulsing neural dots */}
      {dots.map((d, i) => {
        const p = 0.6 + 0.4 * Math.sin(t * 2.5 + d.ph);
        return (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r={3 + p * 0.6} fill={c} opacity={reveal * 0.25} />
            <circle cx={d.x} cy={d.y} r={1.6} fill={c} opacity={reveal * p} />
          </g>
        );
      })}
    </g>
  );
}

// ── Symbol: Network (Explore the Models) ───────────────────────────────────
function NetworkSymbol({ hue, t, reveal }) {
  const layers = [3, 4, 3];
  const xs = [54, 80, 106];
  const nodes = [];
  layers.forEach((n, li) => {
    const colH = (n - 1) * 22;
    const startY = 80 - colH / 2;
    for (let i = 0; i < n; i++) {
      nodes.push({ id: `${li}-${i}`, x: xs[li], y: startY + i * 22, layer: li });
    }
  });
  const edges = [];
  for (let li = 0; li < layers.length - 1; li++) {
    const a = nodes.filter(n => n.layer === li);
    const b = nodes.filter(n => n.layer === li + 1);
    a.forEach(p => b.forEach(q => edges.push({ from: p, to: q })));
  }
  const c = hue.bright;
  return (
    <g>
      {edges.map((e, i) => {
        const elen = Math.hypot(e.to.x - e.from.x, e.to.y - e.from.y);
        return (
          <line key={i}
            x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
            stroke={c} strokeWidth="1"
            opacity={reveal * 0.45}
            strokeDasharray={elen}
            strokeDashoffset={(1 - reveal) * elen} />
        );
      })}
      {edges.map((e, i) => {
        if (i % 2 !== 0) return null;
        const phase = ((t * 0.7 + i * 0.11) % 1);
        const x = lerp(e.from.x, e.to.x, phase);
        const y = lerp(e.from.y, e.to.y, phase);
        const fade = Math.sin(phase * Math.PI);
        return (
          <g key={`p${i}`}>
            <circle cx={x} cy={y} r={2.6} fill={c} opacity={fade * reveal * 0.5} />
            <circle cx={x} cy={y} r={1.4} fill={c} opacity={fade * reveal} />
          </g>
        );
      })}
      {nodes.map((n, i) => {
        const isCenter = n.layer === 1;
        const pulse = 0.8 + 0.2 * Math.sin(t * 2 + i);
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={isCenter ? 6 : 5}
              fill={c} opacity={reveal * 0.18} />
            <circle cx={n.x} cy={n.y} r={isCenter ? 3.6 : 3}
              fill={c}
              opacity={reveal * pulse}
              style={{ filter: `drop-shadow(0 0 3px ${c})` }} />
          </g>
        );
      })}
    </g>
  );
}

// ── Symbol: AI Chip (Build Real Skills) ────────────────────────────────────
function ChipSymbol({ hue, t, reveal }) {
  const len = 320;
  const dashOff = (1 - reveal) * len;
  const c = hue.bright;
  const cx = 80, cy = 80;
  const pins = [];
  for (let side = 0; side < 4; side++) {
    for (let k = 0; k < 6; k++) {
      const ofs = -25 + k * 10;
      const plen = (k === 2 || k === 3) ? 9 : 7;
      let x1, y1, x2, y2;
      if (side === 0) { x1 = cx + ofs; y1 = cy - 30; x2 = cx + ofs; y2 = cy - 30 - plen; }
      if (side === 1) { x1 = cx + ofs; y1 = cy + 30; x2 = cx + ofs; y2 = cy + 30 + plen; }
      if (side === 2) { x1 = cx - 30; y1 = cy + ofs; x2 = cx - 30 - plen; y2 = cy + ofs; }
      if (side === 3) { x1 = cx + 30; y1 = cy + ofs; x2 = cx + 30 + plen; y2 = cy + ofs; }
      pins.push({ side, k, x1, y1, x2, y2 });
    }
  }
  return (
    <g>
      {pins.map((p, i) => (
        <line key={i}
          x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}
          stroke={c} strokeWidth="2.2" strokeLinecap="round"
          opacity={reveal * (0.7 + 0.3 * Math.sin(t * 2 + p.side + p.k * 0.3))} />
      ))}
      {/* Outer chip body */}
      <rect x={cx - 30} y={cy - 30} width={60} height={60} rx={6}
        stroke={c} strokeWidth="2.6"
        strokeDasharray={len} strokeDashoffset={dashOff}
        fill="none"
        style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
      {/* Inner core */}
      <rect x={cx - 18} y={cy - 18} width={36} height={36} rx={3}
        stroke={c} strokeWidth="1.4"
        opacity={reveal * 0.65}
        fill="none" />
      {/* AI text */}
      <text x={cx} y={cy + 8} textAnchor="middle"
        fill={c}
        fontFamily="'Inter', 'Helvetica Neue', sans-serif"
        fontWeight={800} fontSize={20} letterSpacing="-0.02em"
        opacity={reveal * (0.9 + 0.1 * Math.sin(t * 2.5))}
        style={{ filter: `drop-shadow(0 0 4px ${c})` }}>
        AI
      </text>
      {/* Pin status dots */}
      {[
        { x: cx + 35, y: cy - 5, ph: 0 },
        { x: cx - 5, y: cy + 35, ph: 1.2 }
      ].map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={1.6}
          fill={c}
          opacity={reveal * (0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + d.ph)))} />
      ))}
    </g>
  );
}

// ── Per-icon hues (cyan brain + amber chip per references; accent for net) ─
const HUE_CYAN = { id: "cyan", bright: "#5fd2f5", mid: "#3aa7c8", glow: "#5fd2f5" };
const HUE_AMBER = { id: "amber", bright: "#f5a623", mid: "#c87f1a", glow: "#f5a623" };
function makeAccentHue(accent) {
  return { id: "acc", bright: accent, mid: accent, glow: accent };
}

// ── Pillar icon wrappers ───────────────────────────────────────────────────
function PillarIconAtom({ color, accent, draw, t }) {
  return (
    <BadgeFrame hue={HUE_CYAN} draw={draw} t={t}>
      {(p) => <BrainSymbol {...p} />}
    </BadgeFrame>
  );
}

function PillarIconConstellation({ color, accent, draw, t }) {
  return (
    <BadgeFrame hue={makeAccentHue(accent)} draw={draw} t={t}>
      {(p) => <NetworkSymbol {...p} />}
    </BadgeFrame>
  );
}

function PillarIconTower({ color, accent, draw, t }) {
  return (
    <BadgeFrame hue={HUE_AMBER} draw={draw} t={t}>
      {(p) => <ChipSymbol {...p} />}
    </BadgeFrame>
  );
}

function Pillars() {
  const PAL = usePAL();
  const tRaw = useTime();
  // Pillars enter staggered after the title settles, then stay forever
  const baseEnter = smoothstep(5.4, 6.2, tRaw);
  const enters = [
  smoothstep(5.4, 6.2, tRaw),
  smoothstep(5.7, 6.5, tRaw),
  smoothstep(6.0, 6.8, tRaw)];

  // Icon "draw" — finishes by 8.6s and stays at 1; gives particles time to fly in
  const draws = [
  Math.min(1, smoothstep(5.6, 7.8, tRaw) * 1),
  Math.min(1, smoothstep(5.9, 8.2, tRaw) * 1),
  Math.min(1, smoothstep(6.2, 8.6, tRaw) * 1)];


  if (baseEnter === 0) return null;

  const items = [
  { label1: "Understand", label2: "the Concepts", Icon: PillarIconAtom },
  { label1: "Explore", label2: "the Models", Icon: PillarIconConstellation },
  { label1: "Build", label2: "Real Skills", Icon: PillarIconTower }];


  return (
    <foreignObject x={120} y={800} width={1680} height={250}>
      <div xmlns="http://www.w3.org/1999/xhtml"
      style={{
        width: "100%", height: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "120px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif"
      }}>
        {items.map(({ label1, label2, Icon }, i) => {
          const enter = enters[i];
          const draw = draws[i];
          // Subtle continuous bob to keep it alive
          const bob = Math.sin(tRaw * 1.2 + i * 1.8) * 3;
          return (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
              opacity: enter,
              transform: `translateY(${(1 - enter) * 24 + bob}px)`,
              minWidth: "220px"
            }}>
              {/* Icon container — BadgeFrame draws its own halo/ring */}
              <div style={{
                position: "relative",
                width: "170px",
                height: "170px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Icon color={PAL.ink} accent={PAL.accent} draw={draw} t={tRaw} />
              </div>
              {/* Label */}
              <div style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: PAL.ink,
                lineHeight: 1.35
              }}>
                {label1}<br />{label2}
              </div>
            </div>);

        })}
      </div>
    </foreignObject>);

}

window.ThumbnailScene = ThumbnailScene;
window.PALETTES = PALETTES;

// ── LoopStage: continuous, no controls, no pause. Provides TimelineContext. ─
function LoopStage({ width = 1920, height = 1080, background = "#000", children }) {
  const [time, setTime] = React.useState(0);
  const stageRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);

  // RAF loop — never stops
  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      setTime((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fit-to-viewport scaling
  React.useEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth,h = el.clientHeight;
      setScale(Math.min(w / width, h / height));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width, height]);

  const ctxValue = React.useMemo(
    () => ({ time, duration: Infinity, playing: true }),
    [time]
  );

  return (
    <div ref={wrapRef} style={{
      position: "fixed", inset: 0, background,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden"
    }}>
      <div ref={stageRef} style={{
        width, height,
        transform: `scale(${scale})`, transformOrigin: "center center"
      }}>
        <TimelineContext.Provider value={ctxValue}>
          {children}
        </TimelineContext.Provider>
      </div>
    </div>);

}

window.LoopStage = LoopStage;