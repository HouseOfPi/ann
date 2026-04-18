// network_scene.jsx — Multi-layer network scene

const NET_LAYER_SIZES = [3, 5, 4, 2];
const NET_LAYER_LABELS = ['Input', 'Hidden', 'Hidden', 'Output'];
const NET_LAYER_X = [320, 760, 1200, 1640];
const NET_NODE_R = 38;

const netLayerPositions = NET_LAYER_SIZES.map((n, li) => {
  const spacing = 130;
  const y0 = (1080 - spacing * (n - 1)) / 2;
  return Array.from({ length: n }, (_, i) => ({ x: NET_LAYER_X[li], y: y0 + i * spacing }));
});

function netHashedWeight(li, i, j) {
  const seed = (li * 991 + i * 97 + j * 31) % 100;
  return (seed - 50) / 50;
}

function NetTitle() {
  const t = useTime();
  const appear = animate({ from:0, to:1, start:0.2, end:1.0, ease:Easing.easeOutCubic })(t);
  const fade = animate({ from:0, to:1, start:2.5, end:3.2, ease:Easing.easeInCubic })(t);
  const op = clamp(appear - fade, 0, 1);
  if (op === 0) return null;
  return (
    <div style={{ position:'absolute', left:0, right:0, top:80, textAlign:'center', opacity:op, fontFamily:FONT_SANS }}>
      <div style={{ fontSize:18, letterSpacing:'0.28em', textTransform:'uppercase', color:COLORS.dim, fontWeight:500 }}>A Neural Network</div>
      <div style={{ fontSize:56, fontWeight:600, color:COLORS.ink, letterSpacing:'-0.02em', marginTop:10 }}>Many Neurons, In Layers</div>
    </div>
  );
}

function NetLayerLabels() {
  const t = useTime();
  const op = animate({ from:0, to:1, start:1.5, end:2.2 })(t);
  return (
    <>
      {NET_LAYER_LABELS.map((label, i) => (
        <div key={i} style={{
          position:'absolute', left: NET_LAYER_X[i] - 100, top: 140,
          width:200, textAlign:'center',
          fontSize:18, letterSpacing:'0.22em', textTransform:'uppercase',
          color: i === NET_LAYER_SIZES.length - 1 ? COLORS.accent2 : (i === 0 ? COLORS.ink : COLORS.dim),
          fontFamily:FONT_SANS, fontWeight:500, opacity:op,
        }}>
          Layer {i+1}<br/>
          <span style={{ fontSize:13, letterSpacing:'0.1em', opacity:0.7 }}>{label} · {NET_LAYER_SIZES[i]} nodes</span>
        </div>
      ))}
    </>
  );
}

function NetConnections() {
  const t = useTime();
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 1920 1080">
      {netLayerPositions.slice(0, -1).map((srcLayer, li) => {
        const dstLayer = netLayerPositions[li + 1];
        const drawStart = 2.0 + li * 0.6;
        return srcLayer.flatMap((src, i) =>
          dstLayer.map((dst, j) => {
            const dx = dst.x - src.x, dy = dst.y - src.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const sx = src.x + (dx/dist) * NET_NODE_R, sy = src.y + (dy/dist) * NET_NODE_R;
            const ex = dst.x - (dx/dist) * NET_NODE_R, ey = dst.y - (dy/dist) * NET_NODE_R;
            const w = netHashedWeight(li, i, j);
            const segLen = Math.sqrt((ex-sx)**2 + (ey-sy)**2);
            const prog = clamp(animate({ from:0, to:1, start:drawStart, end:drawStart+1.0 })(t), 0, 1);
            return (
              <line key={`${li}-${i}-${j}`} x1={sx} y1={sy} x2={ex} y2={ey}
                stroke={COLORS.line} strokeOpacity={0.4 + Math.abs(w) * 0.4}
                strokeWidth={0.8 + Math.abs(w) * 2}
                strokeLinecap="round"
                strokeDasharray={segLen}
                strokeDashoffset={segLen * (1 - prog)}
              />
            );
          })
        );
      })}
    </svg>
  );
}

function NetNodes() {
  const t = useTime();
  return (
    <>
      {netLayerPositions.flatMap((layer, li) => layer.map((p, i) => {
        const delay = 0.4 + li * 0.4 + i * 0.05;
        const appear = animate({ from:0, to:1, start:delay, end:delay+0.5, ease:Easing.easeOutBack })(t);
        if (appear === 0) return null;
        const fireTime = 5 + li * 1.4;
        const fireOp = animate({ from:0, to:1, start:fireTime, end:fireTime+0.4 })(t)
                     - animate({ from:0, to:1, start:fireTime+1.2, end:fireTime+2.0 })(t);
        const glow = clamp(fireOp, 0, 1);
        const strength = 0.3 + ((li * 13 + i * 7) % 100) / 140;
        const isInput = li === 0;
        const isOutput = li === NET_LAYER_SIZES.length - 1;
        return (
          <div key={`${li}-${i}`} style={{
            position:'absolute',
            left: p.x - NET_NODE_R, top: p.y - NET_NODE_R,
            width: NET_NODE_R*2, height: NET_NODE_R*2,
            transform:`scale(${appear})`,
          }}>
            {glow > 0.05 && (
              <div style={{
                position:'absolute', inset:-18,
                borderRadius:'50%',
                background:`radial-gradient(circle, ${isOutput ? COLORS.accent2 : COLORS.accent} 0%, transparent 65%)`,
                opacity: glow * 0.55 * strength,
                filter:'blur(8px)',
              }}/>
            )}
            <div style={{
              position:'absolute', inset:0,
              borderRadius:'50%',
              background: COLORS.neuronFill,
              border:`2px solid ${isInput ? COLORS.ink : isOutput ? COLORS.accent2 : COLORS.neuron}`,
              overflow:'hidden',
            }}>
              <div style={{
                position:'absolute', left:0, right:0, bottom:0,
                height: `${glow * strength * 100}%`,
                background: isOutput ? COLORS.accent2 : COLORS.accent,
                opacity: 0.8,
                transition: 'height 0.15s',
              }}/>
            </div>
          </div>
        );
      }))}
    </>
  );
}

const NET_INPUT_VALUES = [0.8, 0.4, 0.9];
const NET_OUTPUT_VALUES = [0.92, 0.08];
const NET_OUTPUT_LABELS = ['Cat', 'Dog'];

function NetInputValues() {
  const t = useTime();
  const op = animate({ from:0, to:1, start:1.0, end:1.6 })(t);
  return (
    <>
      {netLayerPositions[0].map((p, i) => (
        <div key={i} style={{
          position:'absolute',
          left: p.x - 170, top: p.y - 16,
          width:110, textAlign:'right',
          fontFamily:FONT_MONO, fontSize:22, color:COLORS.dim, opacity:op,
        }}>
          {NET_INPUT_VALUES[i].toFixed(1)}
        </div>
      ))}
    </>
  );
}

function NetOutputValues() {
  const t = useTime();
  const op = animate({ from:0, to:1, start:9.0, end:9.8 })(t);
  if (op === 0) return null;
  return (
    <>
      {netLayerPositions[NET_LAYER_SIZES.length-1].map((p, i) => (
        <div key={i} style={{
          position:'absolute',
          left: p.x + 60, top: p.y - 30,
          width:220, opacity:op,
          fontFamily:FONT_MONO,
        }}>
          <div style={{ fontSize:14, letterSpacing:'0.16em', textTransform:'uppercase', color:COLORS.dim, fontWeight:500 }}>
            {NET_OUTPUT_LABELS[i]}
          </div>
          <div style={{ fontSize:30, color: i === 0 ? COLORS.accent2 : COLORS.dim, fontWeight:600, marginTop:2 }}>
            {(NET_OUTPUT_VALUES[i] * 100).toFixed(0)}%
          </div>
        </div>
      ))}
    </>
  );
}

function NetPulses() {
  const t = useTime();
  const pulses = [];
  for (let li = 0; li < NET_LAYER_SIZES.length - 1; li++) {
    const launch = 5 + li * 1.4;
    const travel = 1.2;
    const src = netLayerPositions[li];
    const dst = netLayerPositions[li + 1];
    for (let i = 0; i < src.length; i++) {
      for (let j = 0; j < dst.length; j++) {
        const w = netHashedWeight(li, i, j);
        if (Math.abs(w) < 0.25) continue;
        const prog = clamp(animate({ from:0, to:1, start:launch, end:launch+travel, ease:Easing.easeInOutCubic })(t), 0, 1);
        if (prog === 0 || prog === 1) continue;
        const dx = dst[j].x - src[i].x, dy = dst[j].y - src[i].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const sx = src[i].x + (dx/dist) * NET_NODE_R, sy = src[i].y + (dy/dist) * NET_NODE_R;
        const ex = dst[j].x - (dx/dist) * NET_NODE_R, ey = dst[j].y - (dy/dist) * NET_NODE_R;
        const cx = sx + (ex-sx) * prog, cy = sy + (ey-sy) * prog;
        const size = 8 + Math.abs(w) * 10;
        const color = w >= 0 ? COLORS.accent : COLORS.accent2;
        pulses.push(
          <div key={`${li}-${i}-${j}`} style={{
            position:'absolute', left: cx - size/2, top: cy - size/2,
            width:size, height:size, borderRadius:'50%',
            background: color, boxShadow:`0 0 14px ${color}`,
            opacity: 0.7,
          }}/>
        );
      }
    }
  }
  return <>{pulses}</>;
}

function NetCaption() {
  const t = useTime();
  const captions = [
    { start: 4.0, end: 5.2, text: 'Inputs enter the network' },
    { start: 5.2, end: 7.5, text: 'Each neuron computes its weighted sum' },
    { start: 7.5, end: 9.0, text: 'Activations flow forward, layer by layer' },
    { start: 9.0, end: 13.0, text: 'The final layer produces a prediction' },
    { start: 13.5, end: 15.5, text: 'One forward pass · Σ wᵢxᵢ + b, applied everywhere' },
  ];
  for (const c of captions) {
    if (t >= c.start && t < c.end) {
      const localT = t - c.start;
      const dur = c.end - c.start;
      let op = 1;
      if (localT < 0.3) op = localT / 0.3;
      else if (localT > dur - 0.3) op = (dur - localT) / 0.3;
      return (
        <div style={{
          position:'absolute', left:0, right:0, bottom:80, textAlign:'center',
          fontFamily:FONT_SANS, fontSize:26, fontWeight:500, color:COLORS.ink,
          opacity: clamp(op, 0, 1),
        }}>{c.text}</div>
      );
    }
  }
  return null;
}

function NetworkScene() {
  usePaletteVersion();
  return (
    <div style={{ position:'absolute', inset:0, background:COLORS.bg }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${COLORS.line} 1px, transparent 1px)`, backgroundSize:'48px 48px', opacity:0.2 }}/>
      <NetTitle/>
      <NetLayerLabels/>
      <NetConnections/>
      <NetNodes/>
      <NetPulses/>
      <NetInputValues/>
      <NetOutputValues/>
      <NetCaption/>
    </div>
  );
}
