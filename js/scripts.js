      /* ── A. CORE CANVAS ENGINE & BRAIN ANIMATION ── */
      let isLightMode = false; // used by drawBrain canvas — managed by setMode()
      let soundEnabled = true; // managed by toggleSound()

      const bc = document.getElementById("brain");
      const bx = bc ? bc.getContext("2d") : null;
      let BW, BH;
      function resizeBrain() {
        if (!bc || !bx) return;
        const r = window.devicePixelRatio || 1;
        BW = window.innerWidth;
        BH = window.innerHeight;
        bc.width = BW * r;
        bc.height = BH * r;
        bx.setTransform(r, 0, 0, r, 0, 0);

        // Reset all background initializations to force recalculation of positions
        dualInited = false;
        synapseNodes = []; nexusNodes = []; streamParticles = [];
        stormNodes = []; ballNodes = []; annNodes = [];

        buildBrain();
      }
      setTimeout(resizeBrain, 50);

      let nodes = [],
        edges = [];
      let mouse = { x: -1000, y: -1000 };

      window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener("mouseleave", () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });

      function buildBrain() {
        if (!bc || !bx) return;
        nodes = [];
        edges = [];
        // Much simpler, elegant amount of nodes
        const numNodes = Math.min(
          100,
          Math.max(40, Math.floor((BW * BH) / 15000))
        );
        const margin = BW * 0.1; // 10% safe zone to prevent clipping on left/right
        for (let i = 0; i < numNodes; i++) {
          nodes.push({
            x: margin + Math.random() * (BW - margin * 2),
            y: Math.random() * BH,
            vx: (Math.random() - 0.5) * 0.3, 
            vy: (Math.random() - 0.5) * 0.3,
            r: 1.5 + Math.random() * 2,
            phase: Math.random() * Math.PI * 2,
            hueD: Math.random() > 0.5 ? "0,255,163" : "0,200,255", 
            hueL: Math.random() > 0.5 ? "0,180,120" : "0,120,200",
            activation: 0,
          });
        }
      }

      window.addEventListener("resize", () => {
        resizeBrain();
        buildBrain();
      });

      // signal pulses (slower, less chaotic)
      const pulses = [];
      function spawnP() {
        if (!edges.length) return;
        const e = edges[(Math.random() * edges.length) | 0];
        pulses.push({
          f: e[0],
          t: e[1],
          p: 0,
          sp: 0.006 + Math.random() * 0.008,
        }); // slower pulse speed
      }
      setInterval(spawnP, 300); // reduced frequency

      // random node activation
      setInterval(() => {
        if (!nodes.length) return;
        const n = nodes[(Math.random() * nodes.length) | 0];
        n.activation = 0.8;
      }, 1000);

      // ── B. BACKGROUND MANAGER ─────────────────────────────────────────────
      let heroBg = 'dual';
      // Show divider on initial load (dual is default)
      document.addEventListener('DOMContentLoaded', () => {
        const divEl = document.querySelector('.hero-divider');
        if (divEl) divEl.classList.add('visible');
      });
      function setHeroBg(mode) {
        heroBg = mode;
        synapseNodes = []; synapseParticles2 = [];
        nexusNodes = []; streamParticles = []; stormNodes = []; ballNodes = []; annNodes = []; annPulses = []; annParticles = []; dualInited = false;
        if (bx) bx.clearRect(0, 0, BW, BH);
        // Toggle left-align class and divider for Dual mode
        const uiEl = document.querySelector('#slideOne .ui');
        if (uiEl) uiEl.classList.toggle('ui-left', mode === 'dual');
        const divEl = document.querySelector('.hero-divider');
        if (divEl) divEl.classList.toggle('visible', mode === 'dual');
        document.querySelectorAll('.bg-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.bg === mode));
      }

      // ── SYNAPSE (elastic bezier network) ─────────────────────────────────
      let synapseNodes = [], synapseParticles2 = [];
      function initSynapse() {
        synapseNodes = Array.from({ length: 38 }, () => ({
          x: BW * 0.1 + Math.random() * BW * 0.8,
          y: BH * 0.1 + Math.random() * BH * 0.8,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: 4 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.55 ? '34,211,238' : '52,211,153',
        }));
        synapseParticles2 = [];
      }
      function drawSynapse() {
        if (!synapseNodes.length) initSynapse();
        const maxD = 230;
        // Update nodes
        synapseNodes.forEach(n => {
          n.x += n.vx + Math.sin(bt * 0.009 + n.phase) * 0.28;
          n.y += n.vy + Math.cos(bt * 0.011 + n.phase) * 0.28;
          const mg = 60;
          if (n.x < mg) { n.x = mg; n.vx = Math.abs(n.vx); }
          if (n.x > BW - mg) { n.x = BW - mg; n.vx = -Math.abs(n.vx); }
          if (n.y < mg) { n.y = mg; n.vy = Math.abs(n.vy); }
          if (n.y > BH - mg) { n.y = BH - mg; n.vy = -Math.abs(n.vy); }
        });
        // Draw bezier connections
        for (let i = 0; i < synapseNodes.length; i++) {
          for (let j = i + 1; j < synapseNodes.length; j++) {
            const a = synapseNodes[i], b = synapseNodes[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxD) continue;
            const t = 1 - dist / maxD;
            const alpha = t * t * (isLightMode ? 0.35 : 0.45);
            // Oscillating control point — gives the organic stretch/curve feel
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const nx2 = -dy / dist, ny2 = dx / dist;
            const wave = Math.sin(bt * 0.012 + i * 0.7 + j * 0.4) * (dist * 0.22);
            const cpx = mx + nx2 * wave, cpy = my + ny2 * wave;
            const grad = bx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, isLightMode ? `rgba(3,105,161,${alpha})` : `rgba(${a.hue},${alpha})`);
            grad.addColorStop(1, isLightMode ? `rgba(16,185,129,${alpha})` : `rgba(${b.hue},${alpha})`);
            bx.beginPath();
            bx.moveTo(a.x, a.y);
            bx.quadraticCurveTo(cpx, cpy, b.x, b.y);
            bx.strokeStyle = grad;
            bx.lineWidth = t * 2.5 + 0.3;
            bx.stroke();
            // Spawn particles along connection
            if (Math.random() < 0.004 * t)
              synapseParticles2.push({ ai: i, bi: j, t: 0, spd: 0.007 + Math.random() * 0.01, cpx, cpy });
          }
        }
        // Draw particles traveling along bezier paths
        synapseParticles2 = synapseParticles2.filter(p => {
          p.t += p.spd;
          if (p.t > 1) return false;
          const a = synapseNodes[p.ai], b = synapseNodes[p.bi];
          if (!a || !b) return false;
          const u = p.t, v = 1 - u;
          const px = v*v*a.x + 2*v*u*p.cpx + u*u*b.x;
          const py = v*v*a.y + 2*v*u*p.cpy + u*u*b.y;
          const al = Math.sin(u * Math.PI);
          bx.beginPath();
          bx.arc(px, py, 2.5, 0, Math.PI * 2);
          bx.fillStyle = isLightMode ? `rgba(3,105,161,${al * 0.85})` : `rgba(255,255,255,${al * 0.75})`;
          if (!isLightMode) { bx.shadowColor = 'rgba(34,211,238,0.7)'; bx.shadowBlur = 7; }
          bx.fill();
          bx.shadowBlur = 0;
          return true;
        });
        // Draw nodes
        synapseNodes.forEach(n => {
          const pulse = 1 + Math.sin(bt * 0.045 + n.phase) * 0.18;
          const r = n.r * pulse;
          if (!isLightMode) { bx.shadowColor = `rgba(${n.hue},0.6)`; bx.shadowBlur = r * 2.5; }
          bx.beginPath();
          bx.arc(n.x, n.y, r, 0, Math.PI * 2);
          bx.fillStyle = isLightMode ? 'rgba(3,105,161,0.8)' : `rgba(${n.hue},0.85)`;
          bx.fill();
          bx.shadowBlur = 0;
          bx.beginPath();
          bx.arc(n.x, n.y, r * 0.38, 0, Math.PI * 2);
          bx.fillStyle = `rgba(255,255,255,${isLightMode ? 0.55 : 0.4})`;
          bx.fill();
        });
      }

      /* ── D. NEURAL NEXUS (Space Constellation Logic) ───────────────────────── */
      let nexusNodes = [];
      function initNexus() {
        // Deep space constellation logic
        nexusNodes = Array.from({ length: 65 }, () => ({
          x: Math.random() * BW,
          y: Math.random() * BH,
          z: Math.random() * 1000, // depth
          v: 0.2 + Math.random() * 0.4,
          r: 1 + Math.random() * 2,
          activation: 0,
          phase: Math.random() * Math.PI * 2
        }));
      }
      function drawNexus() {
        if (!nexusNodes.length) initNexus();
        bx.lineCap = 'round';
        
        // Depth-parallax movement
        nexusNodes.forEach(n => {
          n.z -= n.v * 2;
          if (n.z < 1) n.z = 1000;
          if (Math.random() < 0.002) n.activation = 1;
          n.activation *= 0.96;
        });

        const project = (n) => {
          const scale = 500 / n.z;
          return {
            x: BW / 2 + (n.x - BW / 2) * scale,
            y: BH / 2 + (n.y - BH / 2) * scale,
            r: n.r * scale,
            op: Math.min(1, scale * 1.5)
          };
        };

        // Draw connections (Nexus logic: only connect if close in 3D-ish space)
        for (let i = 0; i < nexusNodes.length; i++) {
          const p1 = project(nexusNodes[i]);
          if (p1.op < 0.1) continue;
          
          for (let j = i + 1; j < nexusNodes.length; j++) {
            const b = nexusNodes[j];
            const distZ = Math.abs(nexusNodes[i].z - b.z);
            if (distZ > 150) continue;
            
            const p2 = project(b);
            const dx = p1.x - p2.x, dy = p1.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const maxD = 180 * p1.op;
            if (dist > maxD) continue;

            const alpha = (1 - dist / maxD) * p1.op * (isLightMode ? 0.3 : 0.5);
            bx.beginPath();
            bx.moveTo(p1.x, p1.y);
            bx.lineTo(p2.x, p2.y);
            bx.strokeStyle = isLightMode ? `rgba(3,105,161,${alpha * 0.5})` : `rgba(34,211,238,${alpha * 0.6})`;
            bx.lineWidth = 0.5 * p1.op;
            bx.stroke();
          }
        }

        // Draw stars/neurons
        nexusNodes.forEach(n => {
          const p = project(n);
          if (p.op < 0.05) return;
          
          const glow = n.activation * 15 * p.op;
          const r = p.r + (n.activation * 4);
          
          if (!isLightMode && glow > 0.1) {
            bx.shadowColor = 'rgba(34,211,238,' + p.op + ')';
            bx.shadowBlur = glow;
          }
          
          bx.beginPath();
          bx.arc(p.x, p.y, r, 0, Math.PI * 2);
          const baseOp = p.op * (0.4 + Math.sin(bt * 0.05 + n.phase) * 0.2);
          bx.fillStyle = isLightMode ? `rgba(3,105,161,${baseOp + n.activation})` : `rgba(255,255,255,${baseOp + n.activation})`;
          bx.fill();
          bx.shadowBlur = 0;
        });
      }

      /* ── F. NEURAL STREAM (Fluid Flow Data) ───────────────────────────────── */
      let streamParticles = [];
      function initStream() {
        // Particles move along a vector field (flow field)
        streamParticles = Array.from({ length: 120 }, () => ({
          x: Math.random() * BW,
          y: Math.random() * BH,
          v: 0.8 + Math.random() * 1.5,
          hue: Math.random() > 0.5 ? '34,211,238' : '52,211,153',
          path: [],
          maxLen: 15 + Math.random() * 20
        }));
      }
      function drawStream() {
        if (!streamParticles.length) initStream();
        streamParticles.forEach(p => {
          // Perlin-style noise field (approx)
          const angle = (Math.sin(p.x * 0.003) + Math.cos(p.y * 0.003)) * Math.PI * 2 + (bt * 0.01);
          p.x += Math.cos(angle) * p.v;
          p.y += Math.sin(angle) * p.v;
          p.path.push({ x: p.x, y: p.y });
          if (p.path.length > p.maxLen) p.path.shift();
          
          if (p.x < -50 || p.x > BW + 50 || p.y < -50 || p.y > BH + 50) {
            p.x = Math.random() * BW; p.y = Math.random() * BH; p.path = [];
          }
          
          if (p.path.length < 2) return;
          bx.beginPath();
          bx.moveTo(p.path[0].x, p.path[0].y);
          for (let i = 1; i < p.path.length; i++) bx.lineTo(p.path[i].x, p.path[i].y);
          const alpha = isLightMode ? 0.35 : 0.6;
          bx.strokeStyle = `rgba(${p.hue},${alpha})`;
          bx.lineWidth = isLightMode ? 1.5 : 1;
          bx.stroke();
          
          // Head glow
          bx.beginPath();
          bx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          bx.fillStyle = isLightMode ? `rgba(3,105,161,0.8)` : `rgba(255,255,255,0.9)`;
          bx.fill();
        });
        // Scattered neural nodes that act as "attractors" or "gateways"
        if (bt % 120 === 0) {
          bx.shadowColor = isLightMode ? 'rgba(3,105,161,0.3)' : 'rgba(34,211,238,0.5)';
          bx.shadowBlur = 20;
        }
      }

      /* ── H. CEREBRAL STORM (Synaptic Lightning) ─────────────────────────── */
      let stormNodes = [];
      function initStorm() {
        stormNodes = Array.from({ length: 45 }, () => ({
          x: Math.random() * BW,
          y: Math.random() * BH,
          r: 2 + Math.random() * 3,
          fire: 0
        }));
      }
      function drawStorm() {
        if (!stormNodes.length) initStorm();
        stormNodes.forEach(n => {
          n.fire *= 0.9;
          if (Math.random() < 0.003) {
            n.fire = 1;
            // Lightning strike to a random neighbor
            const targets = stormNodes.filter(t => t !== n && Math.hypot(t.x-n.x, t.y-n.y) < 300);
            if (targets.length) {
              const t = targets[Math.floor(Math.random() * targets.length)];
              drawLightning(n.x, n.y, t.x, t.y);
            }
          }
          bx.beginPath();
          bx.arc(n.x, n.y, n.r + n.fire * 5, 0, Math.PI * 2);
          bx.fillStyle = isLightMode ? `rgba(3,105,161,${0.3 + n.fire})` : `rgba(255,255,255,${0.2 + n.fire})`;
          bx.fill();
        });
      }
      function drawLightning(x1, y1, x2, y2) {
        let x = x1, y = y1;
        bx.beginPath();
        bx.moveTo(x1, y1);
        const segments = 8;
        for (let i = 0; i < segments; i++) {
          x += (x2 - x1) / segments + (Math.random() - 0.5) * 40;
          y += (y2 - y1) / segments + (Math.random() - 0.5) * 40;
          bx.lineTo(x, y);
        }
        bx.lineTo(x2, y2);
        bx.strokeStyle = isLightMode ? `rgba(3,105,161,0.6)` : `cyan`;
        bx.lineWidth = 1.5;
        bx.stroke();
      }

      /* ── I. NEURAL BALL (3D Spherical Cluster) ───────────────────────────── */
      let ballNodes = [];
      function initBall() {
        // High-density spherical cluster
        ballNodes = Array.from({ length: 180 }, () => {
          const phi = Math.acos(-1 + (Math.random() * 2));
          const theta = Math.random() * Math.PI * 2;
          return {
            phi, theta,
            phase: Math.random() * Math.PI * 2,
            r: 1.5 + Math.random() * 2
          };
        });
      }
      function drawBall() {
        if (!ballNodes.length) initBall();
        const cx = BW / 2, cy = BH * 0.45; // Centered slightly higher behind text
        const rotX = bt * 0.0018, rotY = bt * 0.0025; // Much slower rotation
        
        // Subtler, more organic breathing logic
        const baseRadius = Math.min(BW, BH) * 0.34;
        const pulse = 0.92 + Math.sin(bt * 0.006) * 0.08; // Subtle 8% breath
        const radius = baseRadius * pulse;
        
        const projected = ballNodes.map(n => {
          // Spherical to 3D Cartesian
          let x3 = Math.sin(n.phi) * Math.cos(n.theta) * radius;
          let y3 = Math.sin(n.phi) * Math.sin(n.theta) * radius;
          let z3 = Math.cos(n.phi) * radius;
          
          // Apply rotation
          let y3r = y3 * Math.cos(rotX) - z3 * Math.sin(rotX);
          let z3r = y3 * Math.sin(rotX) + z3 * Math.cos(rotX);
          let x3r = x3 * Math.cos(rotY) + z3r * Math.sin(rotY);
          let z3f = -x3 * Math.sin(rotY) + z3r * Math.cos(rotY);
          
          const scale = 500 / (500 + z3f);
          return {
            x: cx + x3r * scale,
            y: cy + y3r * scale,
            z: z3f,
            scale
          };
        });

        // Depth sort for lines (simplified: only draw if dist is small)
        bx.lineWidth = 0.6;
        for (let i = 0; i < projected.length; i++) {
          const p1 = projected[i];
          if (p1.z > radius * 0.2) continue; // Skip far back
          
          for (let j = i + 1; j < projected.length; j += 4) {
            const p2 = projected[j];
            const distSq = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
            if (distSq > (9000 * p1.scale)) continue;
            
            const alpha = (1 - distSq / (9000 * p1.scale)) * 0.4;
            bx.beginPath();
            bx.moveTo(p1.x, p1.y);
            bx.lineTo(p2.x, p2.y);
            bx.strokeStyle = isLightMode ? `rgba(3,105,161,${alpha * 0.32})` : `rgba(34,211,238,${alpha * 0.45})`;
            bx.stroke();
          }
        }

        // Draw nodes
        projected.forEach(p => {
          const opacity = Math.max(0.1, (radius + p.z) / (radius * 2));
          bx.beginPath();
          bx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
          bx.fillStyle = isLightMode ? `rgba(3,105,161,${opacity * 0.8})` : `rgba(255,255,255,${opacity * 0.7})`;
          bx.fill();
        });
      }

      /* ── M. DUAL — Ball + Architect Side-by-Side ───────────────────────── */
      let dualInited = false;
      let dualBallNodes = [];
      let dualAnnNodes = [], dualAnnPulses = [], dualAnnLayerCount = 0;

      function initDual() {
        dualInited = true;
        // ── Ball nodes (left side) ──
        dualBallNodes = Array.from({ length: 150 }, () => {
          const phi = Math.acos(-1 + (Math.random() * 2));
          const theta = Math.random() * Math.PI * 2;
          return { phi, theta, phase: Math.random() * Math.PI * 2, r: 1.5 + Math.random() * 2 };
        });

        // ── ANN nodes (right side, compressed) ──
        // ── ANN nodes (Right aligned) ──
        dualAnnNodes = []; dualAnnPulses = [];
        const isMobile = BW < 768;
        const layers = isMobile ? [3, 4, 3] : [3, 5, 5, 3];
        dualAnnLayerCount = layers.length;
        
        const centerX = BW * 0.75;
        const annSpread = isMobile ? BW * 0.30 : Math.min(BW * 0.35, 500);
        const annLeft = centerX - annSpread / 2;
        const totalW = annSpread;
        const spacingX = totalW / (layers.length - 1);
        const nodeSpacingY = isMobile ? 42 : Math.min(54, BH * 0.06);

        layers.forEach((count, li) => {
          const totalH = (count - 1) * nodeSpacingY;
          const startY = (BH - totalH) / 2;
          for (let j = 0; j < count; j++) {
            dualAnnNodes.push({
              x: annLeft + li * spacingX,
              y: startY + j * nodeSpacingY,
              layer: li,
              idx: j,
              r: isMobile ? 6 : 8,
              offset: Math.random() * Math.PI * 2,
              baseX: annLeft + li * spacingX,
              baseY: startY + j * nodeSpacingY,
              activation: 0,
            });
          }
        });
      }

      function drawDual() {
        if (!dualInited) initDual();
        const time = Date.now() * 0.001;
        const isDark = !isLightMode;
        const palette = isDark ? annLayerColors.dark : annLayerColors.light;

        // ═══════════════════════════════════════
        //  3D Ball (Right Side, behind ANN)
        // ═══════════════════════════════════════
        const isMob = BW < 768;
        const annSpreadDraw = isMob ? BW * 0.30 : Math.min(BW * 0.35, 500);
        const ballCx = BW * 0.75, ballCy = BH * 0.5;
        const rotX = bt * 0.0018, rotY = bt * 0.0025;
        const baseRadius = annSpreadDraw * 0.45;
        const bPulse = 0.92 + Math.sin(bt * 0.006) * 0.08;
        const bRadius = baseRadius * bPulse;

        const projected = dualBallNodes.map(n => {
          let x3 = Math.sin(n.phi) * Math.cos(n.theta) * bRadius;
          let y3 = Math.sin(n.phi) * Math.sin(n.theta) * bRadius;
          let z3 = Math.cos(n.phi) * bRadius;
          let y3r = y3 * Math.cos(rotX) - z3 * Math.sin(rotX);
          let z3r = y3 * Math.sin(rotX) + z3 * Math.cos(rotX);
          let x3r = x3 * Math.cos(rotY) + z3r * Math.sin(rotY);
          let z3f = -x3 * Math.sin(rotY) + z3r * Math.cos(rotY);
          const scale = 500 / (500 + z3f);
          return { x: ballCx + x3r * scale, y: ballCy + y3r * scale, z: z3f, scale };
        });

        // Ball connections
        bx.lineWidth = 0.6;
        for (let i = 0; i < projected.length; i++) {
          const p1 = projected[i];
          if (p1.z > bRadius * 0.2) continue;
          for (let j = i + 1; j < projected.length; j += 4) {
            const p2 = projected[j];
            const distSq = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
            if (distSq > (9000 * p1.scale)) continue;
            const alpha = (1 - distSq / (9000 * p1.scale)) * 0.4;
            bx.beginPath(); bx.moveTo(p1.x, p1.y); bx.lineTo(p2.x, p2.y);
            bx.strokeStyle = isDark ? `rgba(34,211,238,${alpha * 0.45})` : `rgba(3,105,161,${alpha * 0.32})`;
            bx.stroke();
          }
        }
        // Ball nodes
        projected.forEach(p => {
          const opacity = Math.max(0.1, (bRadius + p.z) / (bRadius * 2));
          bx.beginPath();
          bx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
          bx.fillStyle = isDark ? `rgba(255,255,255,${opacity * 0.7})` : `rgba(3,105,161,${opacity * 0.8})`;
          bx.fill();
        });

        // ═══════════════════════════════════════
        //  RIGHT SIDE: Architect ANN
        // ═══════════════════════════════════════

        // Float nodes
        dualAnnNodes.forEach(n => {
          n.y = n.baseY + Math.sin(time * 0.9 + n.offset) * 3;
          n.x = n.baseX + Math.cos(time * 0.7 + n.offset * 1.3) * 1.5;
          const dxM = mouse.x - n.x, dyM = mouse.y - n.y;
          const mDist = Math.sqrt(dxM * dxM + dyM * dyM);
          if (mDist < 140) n.activation = Math.min(1, n.activation + 0.05);
          n.activation *= 0.965;
        });

        // Spawn ANN pulses
        if (Math.random() < 0.08 && dualAnnPulses.length < 10) {
          const l0 = dualAnnNodes.filter(n => n.layer === 0);
          if (l0.length) {
            const sn = l0[Math.floor(Math.random() * l0.length)];
            const l1 = dualAnnNodes.filter(n => n.layer === 1);
            if (l1.length) {
              const en = l1[Math.floor(Math.random() * l1.length)];
              dualAnnPulses.push({
                from: sn, to: en, progress: 0,
                speed: 0.01 + Math.random() * 0.008,
                trail: [],
                color: palette[Math.floor(Math.random() * palette.length)],
              });
              sn.activation = 1;
            }
          }
        }

        // ANN connections
        dualAnnNodes.forEach(n1 => {
          dualAnnNodes.forEach(n2 => {
            if (n2.layer !== n1.layer + 1) return;
            const distY = Math.abs(n1.baseY - n2.baseY);
            const alphaFalloff = Math.max(0, 1 - distY / 400);
            if (alphaFalloff <= 0) return;
            const actBoost = Math.max(n1.activation, n2.activation);
            const alpha = (0.12 + actBoost * 0.25) * alphaFalloff;
            bx.lineWidth = 0.8 + actBoost * 1.5;
            const c1 = palette[n1.layer % palette.length];
            const c2 = palette[n2.layer % palette.length];
            const grad = bx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
            grad.addColorStop(0, hexToRgba(c1, alpha));
            grad.addColorStop(1, hexToRgba(c2, alpha));
            bx.strokeStyle = grad;
            bx.beginPath(); bx.moveTo(n1.x, n1.y); bx.lineTo(n2.x, n2.y); bx.stroke();
          });
        });

        // ANN pulses
        for (let i = dualAnnPulses.length - 1; i >= 0; i--) {
          const p = dualAnnPulses[i];
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.to.activation = Math.min(1, p.to.activation + 0.7);
            const next = dualAnnNodes.filter(n => n.layer === p.to.layer + 1);
            if (next.length) { p.from = p.to; p.to = next[Math.floor(Math.random() * next.length)]; p.progress = 0; }
            else { dualAnnPulses.splice(i, 1); continue; }
          }
          const t = p.progress;
          const px = p.from.x + (p.to.x - p.from.x) * t;
          const py = p.from.y + (p.to.y - p.from.y) * t;
          p.trail.push({x: px, y: py}); if (p.trail.length > 10) p.trail.shift();
          if (p.trail.length > 1) {
            for (let ti = 1; ti < p.trail.length; ti++) {
              bx.beginPath();
              bx.moveTo(p.trail[ti-1].x, p.trail[ti-1].y);
              bx.lineTo(p.trail[ti].x, p.trail[ti].y);
              bx.strokeStyle = hexToRgba(p.color, (ti / p.trail.length) * 0.6);
              bx.lineWidth = (ti / p.trail.length) * 2.5;
              bx.stroke();
            }
          }
          bx.beginPath(); bx.arc(px, py, isDark ? 4 : 3, 0, Math.PI * 2);
          bx.fillStyle = p.color;
          if (isDark) { bx.shadowBlur = 18; bx.shadowColor = p.color; }
          bx.fill();
          bx.beginPath(); bx.arc(px, py, 1.5, 0, Math.PI * 2);
          bx.fillStyle = 'rgba(255,255,255,0.9)'; bx.fill();
          bx.shadowBlur = 0;
        }

        // ANN nodes
        dualAnnNodes.forEach(n => {
          const pulse = (Math.sin(time * 2.5 + n.offset) + 1) / 2;
          const act = n.activation;
          const nodeR = n.r + act * 2;
          const lc = palette[n.layer % palette.length];

          // Glow
          if (isDark) {
            const glowR = nodeR + 10 + act * 12;
            const glow = bx.createRadialGradient(n.x, n.y, nodeR * 0.5, n.x, n.y, glowR);
            glow.addColorStop(0, hexToRgba(lc, 0.08 + act * 0.15));
            glow.addColorStop(1, hexToRgba(lc, 0));
            bx.beginPath(); bx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
            bx.fillStyle = glow; bx.fill();
          }

          // Body
          bx.beginPath(); bx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
          if (isDark) {
            const gFill = bx.createRadialGradient(n.x - nodeR * 0.3, n.y - nodeR * 0.3, 0, n.x, n.y, nodeR);
            gFill.addColorStop(0, hexToRgba(lc, 0.20 + act * 0.25));
            gFill.addColorStop(1, 'rgba(8,12,24,0.92)');
            bx.fillStyle = gFill; bx.fill();
            bx.lineWidth = 1.5 + act * 1.2;
            bx.strokeStyle = hexToRgba(lc, 0.55 + act * 0.4 + pulse * 0.05);
            if (act > 0.15) { bx.shadowBlur = 10 + act * 15; bx.shadowColor = lc; }
            bx.stroke(); bx.shadowBlur = 0;
          } else {
            bx.fillStyle = '#fff'; bx.fill();
            bx.lineWidth = 2 + act * 1.2;
            bx.strokeStyle = hexToRgba(lc, 0.7 + act * 0.3); bx.stroke();
          }

          // Core dot
          const coreR = nodeR * 0.28 + pulse * 1.2 + act * 1.5;
          bx.beginPath(); bx.arc(n.x, n.y, coreR, 0, Math.PI * 2);
          bx.fillStyle = isDark
            ? `rgba(255,255,255,${0.55 + act * 0.35 + pulse * 0.1})`
            : hexToRgba(lc, 0.75 + act * 0.25);
          bx.fill();
        });

        // ANN layer labels
        const labels = dualAnnLayerCount === 5
          ? ['INPUT', 'HIDDEN', 'HIDDEN', 'HIDDEN', 'OUTPUT']
          : ['INPUT', 'HIDDEN', 'HIDDEN', 'OUTPUT'];
        const lxs = {};
        dualAnnNodes.forEach(n => { lxs[n.layer] = n.baseX; });
        bx.font = `600 ${BW < 768 ? 7 : 9}px "Exo 2", system-ui, sans-serif`;
        bx.textAlign = 'center';
        const ly = dualAnnNodes.reduce((m, n) => Math.max(m, n.baseY), 0) + 45;
        Object.keys(lxs).forEach((l, idx) => {
          bx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.22)';
          bx.fillText(labels[idx] || '', lxs[l], ly);
        });
      }
      
      /* ── L. ARCHITECT — Professional ANN Visualization ─────────────────── */
      let annNodes = [], annPulses = [], annParticles = [], annLayerCount = 0;
      const annLayerColors = {
        dark:  ['#a78bfa','#60a5fa','#22d3ee','#34d399','#818cf8'],
        light: ['#7c3aed','#3b82f6','#0891b2','#059669','#4f46e5'],
      };

      function initAnn() {
        annNodes = []; annPulses = []; annParticles = [];
        const isMobile = BW < 768;
        const layers = isMobile ? [3, 4, 3] : [3, 5, 7, 5, 3];
        annLayerCount = layers.length;
        const totalW = isMobile ? BW * 0.70 : BW * 0.48;
        const spacingX = totalW / (layers.length - 1);
        const startX = isMobile ? (BW - totalW)/2 : (BW * 0.68 - totalW/2); // Center on right half
        const nodeSpacingY = isMobile ? 48 : 64;
        
        layers.forEach((count, li) => {
          const totalH = (count - 1) * nodeSpacingY;
          const startY = (BH - totalH) / 2;
          for (let j = 0; j < count; j++) {
            annNodes.push({
              x: startX + li * spacingX,
              y: startY + j * nodeSpacingY,
              layer: li,
              idx: j,
              r: isMobile ? 8 : 11,
              offset: Math.random() * Math.PI * 2,
              baseX: startX + li * spacingX,
              baseY: startY + j * nodeSpacingY,
              activation: 0,
            });
          }
        });
      }

      function drawAnn() {
        if (!annNodes.length) initAnn();
        const time = Date.now() * 0.001;
        const isDark = !isLightMode;
        const palette = isDark ? annLayerColors.dark : annLayerColors.light;

        // ── 1. Subtle node floating ──
        annNodes.forEach(n => {
          n.y = n.baseY + Math.sin(time * 0.9 + n.offset) * 3.5;
          n.x = n.baseX + Math.cos(time * 0.7 + n.offset * 1.3) * 2;
          const dxM = mouse.x - n.x, dyM = mouse.y - n.y;
          const mDist = Math.sqrt(dxM * dxM + dyM * dyM);
          if (mDist < 150) n.activation = Math.min(1, n.activation + 0.05);
          n.activation *= 0.965;
        });

        // ── 2. Spawn pulses ──
        if (Math.random() < 0.08 && annPulses.length < 12) {
          const layer0 = annNodes.filter(n => n.layer === 0);
          if (layer0.length) {
            const sn = layer0[Math.floor(Math.random() * layer0.length)];
            const layer1 = annNodes.filter(n => n.layer === 1);
            if (layer1.length) {
              const en = layer1[Math.floor(Math.random() * layer1.length)];
              const pc = palette[Math.floor(Math.random() * palette.length)];
              annPulses.push({
                from: sn, to: en,
                progress: 0,
                speed: 0.01 + Math.random() * 0.008,
                trail: [],
                color: pc,
              });
              sn.activation = 1;
            }
          }
        }

        // ── 3. Draw connections ──
        annNodes.forEach(n1 => {
          annNodes.forEach(n2 => {
            if (n2.layer !== n1.layer + 1) return;
            const distY = Math.abs(n1.baseY - n2.baseY);
            const maxReach = annLayerCount > 4 ? 340 : 380;
            const alphaFalloff = Math.max(0, 1 - distY / maxReach);
            if (alphaFalloff <= 0) return;

            const actBoost = Math.max(n1.activation, n2.activation);
            const baseAlpha = isDark ? 0.12 : 0.10;
            const alpha = (baseAlpha + actBoost * 0.25) * alphaFalloff;
            bx.lineWidth = 0.8 + actBoost * 1.5;

            const c1 = palette[n1.layer % palette.length];
            const c2 = palette[n2.layer % palette.length];
            const grad = bx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
            grad.addColorStop(0, hexToRgba(c1, alpha));
            grad.addColorStop(1, hexToRgba(c2, alpha));
            bx.strokeStyle = grad;

            bx.beginPath();
            bx.moveTo(n1.x, n1.y);
            bx.lineTo(n2.x, n2.y);
            bx.stroke();
          });
        });

        // ── 4. Update and draw pulses ──
        for (let i = annPulses.length - 1; i >= 0; i--) {
          const p = annPulses[i];
          p.progress += p.speed;

          if (p.progress >= 1) {
            p.to.activation = Math.min(1, p.to.activation + 0.7);
            const nextLayer = annNodes.filter(n => n.layer === p.to.layer + 1);
            if (nextLayer.length) {
              p.from = p.to;
              p.to = nextLayer[Math.floor(Math.random() * nextLayer.length)];
              p.progress = 0;
            } else {
              annPulses.splice(i, 1);
              continue;
            }
          }

          const n1 = p.from, n2 = p.to;
          const t = p.progress;
          const px = n1.x + (n2.x - n1.x) * t;
          const py = n1.y + (n2.y - n1.y) * t;

          // Trail
          p.trail.push({x: px, y: py});
          if (p.trail.length > 10) p.trail.shift();

          if (p.trail.length > 1) {
            for (let ti = 1; ti < p.trail.length; ti++) {
              const trailAlpha = (ti / p.trail.length) * 0.6;
              const width = (ti / p.trail.length) * 2.5;
              bx.beginPath();
              bx.moveTo(p.trail[ti-1].x, p.trail[ti-1].y);
              bx.lineTo(p.trail[ti].x, p.trail[ti].y);
              bx.strokeStyle = hexToRgba(p.color, trailAlpha);
              bx.lineWidth = width;
              bx.stroke();
            }
          }

          // Pulse head with glow
          bx.beginPath();
          bx.arc(px, py, isDark ? 4 : 3, 0, Math.PI * 2);
          bx.fillStyle = p.color;
          if (isDark) {
            bx.shadowBlur = 18;
            bx.shadowColor = p.color;
          }
          bx.fill();
          // Bright core
          bx.beginPath();
          bx.arc(px, py, 1.5, 0, Math.PI * 2);
          bx.fillStyle = 'rgba(255,255,255,0.9)';
          bx.fill();
          bx.shadowBlur = 0;
        }

        // ── 5. Draw nodes ──
        annNodes.forEach(n => {
          const pulse = (Math.sin(time * 2.5 + n.offset) + 1) / 2;
          const act = n.activation;
          const nodeR = n.r + act * 2;
          const layerColor = palette[n.layer % palette.length];

          // Outer glow
          if (isDark) {
            const glowR = nodeR + 10 + act * 12;
            const glow = bx.createRadialGradient(n.x, n.y, nodeR * 0.5, n.x, n.y, glowR);
            glow.addColorStop(0, hexToRgba(layerColor, 0.08 + act * 0.15));
            glow.addColorStop(1, hexToRgba(layerColor, 0));
            bx.beginPath();
            bx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
            bx.fillStyle = glow;
            bx.fill();
          }

          // Main node body with radial gradient
          bx.beginPath();
          bx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);

          if (isDark) {
            const gFill = bx.createRadialGradient(n.x - nodeR * 0.3, n.y - nodeR * 0.3, 0, n.x, n.y, nodeR);
            gFill.addColorStop(0, hexToRgba(layerColor, 0.20 + act * 0.25));
            gFill.addColorStop(1, 'rgba(8,12,24,0.92)');
            bx.fillStyle = gFill;
            bx.fill();

            bx.lineWidth = 1.5 + act * 1.2;
            bx.strokeStyle = hexToRgba(layerColor, 0.55 + act * 0.4 + pulse * 0.05);
            if (act > 0.15) {
              bx.shadowBlur = 10 + act * 15;
              bx.shadowColor = layerColor;
            }
            bx.stroke();
            bx.shadowBlur = 0;
          } else {
            bx.fillStyle = '#fff';
            bx.fill();
            bx.lineWidth = 2 + act * 1.2;
            bx.strokeStyle = hexToRgba(layerColor, 0.7 + act * 0.3);
            bx.stroke();
          }

          // Inner bright core
          const coreR = nodeR * 0.28 + pulse * 1.2 + act * 1.5;
          bx.beginPath();
          bx.arc(n.x, n.y, coreR, 0, Math.PI * 2);
          bx.fillStyle = isDark
            ? `rgba(255,255,255,${0.55 + act * 0.35 + pulse * 0.1})`
            : hexToRgba(layerColor, 0.75 + act * 0.25);
          bx.fill();
        });

        // ── 6. Layer labels ──
        const labelNames = annLayerCount === 5
          ? ['INPUT', 'HIDDEN', 'HIDDEN', 'HIDDEN', 'OUTPUT']
          : ['INPUT', 'HIDDEN', 'HIDDEN', 'OUTPUT'];
        const layerXs = {};
        annNodes.forEach(n => { layerXs[n.layer] = n.baseX; });

        bx.font = `600 ${BW < 768 ? 7 : 9}px "Exo 2", system-ui, sans-serif`;
        bx.textAlign = 'center';
        const labelY = annNodes.reduce((max, n) => Math.max(max, n.baseY), 0) + 45;
        Object.keys(layerXs).forEach((l, idx) => {
          const lx = layerXs[l];
          const label = labelNames[idx] || '';
          bx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.22)';
          bx.fillText(label, lx, labelY);
        });
      }

      // Utility: hex color to rgba string
      function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }

      /* ── K. NEURAL (original logic, extracted) ─────────────────────────────── */

      function drawNeural() {
        nodes.forEach((n) => {
          n.x += n.vx; n.y += n.vy;
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          if (dx * dx + dy * dy < 25000) n.activation = Math.min(1, n.activation + 0.05);
          const margin = BW * 0.05;
          if (n.x < margin)      { n.x = margin;      n.vx *= -1; }
          if (n.x > BW - margin) { n.x = BW - margin; n.vx *= -1; }
          if (n.y < 0)  { n.y = 0;  n.vy *= -1; }
          if (n.y > BH) { n.y = BH; n.vy *= -1; }
          n.activation *= 0.92;
        });
        edges = [];
        const maxD = Math.min(BW, BH) > 600 ? 160 : 100;
        const maxDSq = maxD * maxD;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < maxDSq) {
              const dist = Math.sqrt(distSq);
              edges.push([i, j, dist]);
              const boost = Math.max(a.activation, b.activation) * 0.25;
              const alpha = (1 - dist / maxD) * 0.4 + boost;
              bx.beginPath(); bx.moveTo(a.x, a.y); bx.lineTo(b.x, b.y);
              bx.strokeStyle = isLightMode
                ? `rgba(0,100,200,${Math.max(0.02, alpha)})`
                : `rgba(0,170,255,${Math.max(0.02, alpha)})`;
              bx.lineWidth = isLightMode ? 0.8 + boost * 3 : 0.5 + boost * 4;
              bx.stroke();
            }
          }
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i]; p.p += p.sp;
          if (p.p > 1) { nodes[p.t].activation = Math.min(1.5, nodes[p.t].activation + 0.8); pulses.splice(i, 1); continue; }
          const a = nodes[p.f], b = nodes[p.t];
          const px = a.x + (b.x - a.x) * p.p, py = a.y + (b.y - a.y) * p.p;
          const al = Math.sin(p.p * Math.PI);
          bx.beginPath(); bx.arc(px, py, isLightMode ? 3 : 2.5, 0, Math.PI * 2);
          bx.fillStyle = isLightMode ? `rgba(0,150,255,${al})` : `rgba(0,240,200,${al * 0.9})`;
          if (!isLightMode) { bx.shadowColor = "rgba(0,240,200,.6)"; bx.shadowBlur = 10; }
          bx.fill(); bx.shadowBlur = 0;
        }
        nodes.forEach((n) => {
          const br = n.r + Math.sin(bt * 0.03 + n.phase) * 0.4;
          const act = n.activation;
          const hue = isLightMode ? n.hueL : n.hueD;
          const glowR = br * (isLightMode ? 2.5 + act * 5 : 3.5 + act * 7);
          if (!isLightMode || act > 0.1) {
            const g = bx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
            g.addColorStop(0, `rgba(${hue},${isLightMode ? 0.15 + act * 0.4 : 0.25 + act * 0.5})`);
            g.addColorStop(1, `rgba(${hue},0)`);
            bx.beginPath(); bx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
            bx.fillStyle = g; bx.fill();
          }
          bx.beginPath(); bx.arc(n.x, n.y, br + act * (isLightMode ? 1.5 : 2), 0, Math.PI * 2);
          bx.fillStyle = `rgba(${hue},${isLightMode ? 0.8 + act * 0.2 : 0.7 + act * 0.3})`;
          if (!isLightMode) { bx.shadowColor = `rgba(${hue},${0.4 + act * 0.6})`; bx.shadowBlur = 5 + act * 15; }
          bx.fill(); bx.shadowBlur = 0;
          bx.beginPath(); bx.arc(n.x, n.y, br * 0.4, 0, Math.PI * 2);
          bx.fillStyle = `rgba(255,255,255,${isLightMode ? 0.5 + act * 0.5 : 0.3 + act * 0.4})`;
          bx.fill();
        });
      }

      /* ── D. MAIN RENDER LOOP ── */
      let bt = 0;
      function drawBrain() {
        if (!bc || !bx) return;
        if (!BW || !BH) {
          requestAnimationFrame(drawBrain);
          return;
        }
        bt++;
        bx.clearRect(0, 0, BW, BH);
        if      (heroBg === 'neural')  drawNeural();
        else if (heroBg === 'synapse') drawSynapse();
        else if (heroBg === 'nexus')   drawNexus();
        else if (heroBg === 'stream')  drawStream();
        else if (heroBg === 'storm')   drawStorm();
        else if (heroBg === 'ball')    drawBall();
        else if (heroBg === 'ann')     drawAnn();
        else if (heroBg === 'dual')    drawDual();
        requestAnimationFrame(drawBrain);
      }
      drawBrain();

      // Intersection Observer for Slide 2 Anims
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            } else {
              entry.target.classList.remove("in-view");
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(document.getElementById("slideTwo"));
      observer.observe(document.getElementById("slideThree"));

      // Photo gallery functions
      const pioneersData = {
        mccarthy: {
          name: "John McCarthy",
          img: "assets/mccarthy.png",
          years: "1927 – 2011",
          role: "Computer Scientist · Stanford University",
          intro:
            'Coined the term "Artificial Intelligence" and organized the Dartmouth Conference. Inventor of LISP — the language that defined early AI research for decades.',
          facts: [
            'Named the field "Artificial Intelligence" at Dartmouth (1956)',
            "Invented the LISP programming language (1958)",
            "Founded the Stanford Artificial Intelligence Laboratory (1962)",
            "Received the ACM Turing Award (1971)",
            "Developed the concept of time-sharing computing systems",
          ],
        },
        minsky: {
          name: "Marvin Minsky",
          img: "assets/minsky.png",
          years: "1927 – 2016",
          role: "Cognitive Scientist · MIT",
          intro:
            "Co-founder of the MIT AI Lab and a foundational thinker in both artificial intelligence and cognitive science. Built SNARC — one of the world's first neural network simulators.",
          facts: [
            "Built SNARC, the first neural network simulator (1951)",
            "Co-founded MIT's Artificial Intelligence Laboratory (1959)",
            'Authored "Society of Mind" — a landmark theory of human cognition',
            "Won the ACM Turing Award (1969)",
            "Pioneered the concept of frames in knowledge representation",
          ],
        },
        shannon: {
          name: "Claude Shannon",
          img: "assets/shannon.png",
          years: "1916 – 2001",
          role: "Mathematician · Bell Labs",
          intro:
            "Father of information theory. Shannon's 1948 paper single-handedly created the mathematical framework for all digital communication — and indirectly, for modern machine learning.",
          facts: [
            'Invented information theory with "A Mathematical Theory of Communication" (1948)',
            'Defined the "bit" as the fundamental unit of information',
            "Pioneered digital circuit design in his MIT master's thesis (1937)",
            "Built early chess-playing and maze-solving machines at Bell Labs",
            "His entropy concept directly underpins neural network loss functions today",
          ],
        },
        solomonoff: {
          name: "Ray Solomonoff",
          img: "assets/solomonoff.png",
          years: "1926 – 2009",
          role: "Mathematician · AI Researcher",
          intro:
            "Founder of algorithmic probability. Solomonoff was the first to formalize a universal theory of inductive inference — the mathematical bedrock of machine learning.",
          facts: [
            "Created the first complete theory of algorithmic probability (1960)",
            "Formalised Solomonoff induction — the foundation of universal ML theory",
            "Attended the original Dartmouth Conference (1956)",
            "Directly inspired Kolmogorov complexity and Minimum Description Length",
            "His framework provides theoretical justification for Occam's Razor in AI",
          ],
        },
        hinton: {
          name: "Geoffrey Hinton",
          img: "assets/hinton.jpg",
          years: "1947 – present",
          role: "Computer Scientist · University of Toronto / Google Brain",
          intro:
            "The Godfather of Deep Learning. Hinton spent decades championing neural networks when the entire field had abandoned them — and ultimately transformed AI into the defining technology of the 21st century.",
          facts: [
            "Co-popularised the Backpropagation algorithm (1986)",
            "Led AlexNet — won ImageNet 2012 by a record-breaking margin",
            "ACM Turing Award shared with LeCun & Bengio (2018)",
            "Nobel Prize in Physics (2024) shared with John Hopfield",
          ],
        },
      };

      function showPioneer(id) {
        const data = pioneersData[id];
        document.getElementById("modalImg").src = data.img;
        document.getElementById("modalName").innerText = data.name;
        document.getElementById("modalMeta").innerText =
          data.years + " · " + data.role;
        document.getElementById("modalIntro").innerText = data.intro;
        const factsList = document.getElementById("modalFacts");
        factsList.innerHTML = data.facts.map((f) => `<li>${f}</li>`).join("");
        document.getElementById("pioneerModal").classList.add("active");
      }

      const s3CardData = [
        {
          year: "1986",
          title: "Backpropagation",
          body: "<p>Learning is about adjustment. When a neural network makes an error, it doesn't restart; it <strong>learns</strong>. If its output is incorrect, the system calculates exactly how much each internal connection contributed to that mistake.</p><p>Backpropagation is the mathematical process that works <strong>backwards through the network</strong> to nudge every connection in a better direction. By repeating this process millions of times, a network that initially knew nothing eventually develops sophisticated pattern recognition. <em>This remains the fundamental engine of all modern AI.</em></p>"
        },
        {
          year: "2012",
          title: "AlexNet Triumph",
          body: "<p>AlexNet was a pioneering deep neural network that is widely credited with starting the modern AI boom. It was the first model to prove that deep learning could outperform all other methods in visual recognition at a massive scale.</p><p>The ImageNet competition was the ultimate test for computer vision, challenging AI to identify objects across 1.2 million images. For years, progress was stagnant, with most systems failing to identify 1 in 4 images correctly.</p><p>In 2012, AlexNet shattered expectations. By utilizing a deep neural network, it <strong>halved the error rate overnight</strong>. This gap was so significant that it proved deep learning wasn't just another theory—it was the future of computing.</p><div class='historic-event-section'><span class='historic-event-label'>Historical Impact</span><strong class='historic-event-title'>A Strategic Industry Shift</strong>Recognizing the massive potential, Hinton incorporated <strong>DNNresearch Inc.</strong> with his two students. This sparked a secret, high-stakes bidding war in a Toronto hotel room. Tech giants including <strong>Baidu</strong> and <strong>Microsoft</strong>, alongside the then-independent startup <strong>DeepMind</strong>, competed fiercely—but <strong>Google</strong> ultimately won with a <strong>$44 million</strong> bid, marking the exact moment deep learning became a global industrial standard.</div>"
        },
        {
          year: "2018",
          title: "Turing Award",
          body: "<p>The ACM Turing Award is the highest honor in computer science—the equivalent of a Nobel Prize. In 2018, it was awarded jointly to <strong>Geoffrey Hinton</strong>, <strong>Yoshua Bengio</strong>, and <strong>Yann LeCun</strong>.</p><p>The three researchers had spent decades championing neural networks while the rest of the field considered them a technological dead end. They faced rejected papers and dried-up funding, but their stubborn persistence eventually paid off.</p><p>The award recognized the breakthroughs that turned deep neural networks into the backbone of the modern world, vindicating thirty years of conviction.</p>"
        },
        {
          year: "2024",
          title: "Nobel Prize in Physics",
          body: "<p>In 2024, the Nobel Committee broke tradition by awarding the <strong>Nobel Prize in Physics</strong> for work on artificial neural networks.</p><p>Hinton shared the prize with <strong>John Hopfield</strong>. The citation acknowledged their <em>\"foundational discoveries that enable machine learning with artificial neural networks.\"</em></p><p>This win signaled that neural networks are more than just software; they reveal profound truths about how information, memory, and learning operate at a fundamental level—placing AI research alongside the greatest discoveries in scientific history.</p>"
        }
      ];

      function openS3CardPopup(index) {
        closePillPopup(); // Close any currently open popup first
        const data = s3CardData[index];
        const popup = document.getElementById("pillPopupGodfather");
        const titleEl = popup.querySelector(".s3-pp-title");
        const bodyEl = popup.querySelector(".s3-pp-body");
        const eyebrowEl = popup.querySelector(".s3-pp-eyebrow");

        eyebrowEl.innerText = data.year;
        titleEl.innerText = data.title;
        bodyEl.innerHTML = data.body;

        // Reset and center for card usage
        popup.style.left = "50%";
        popup.style.top = "50%";
        popup.style.bottom = "auto";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.width = "clamp(340px, 52vw, 640px)";

        // Hide stats for these cards
        const stats = popup.querySelector(".s3-pp-stat-row");
        if (stats) stats.style.display = "none";

        const overlay = document.getElementById("pillPopupOverlay");
        overlay.classList.add("open");
        
        // Force a brief delay to ensure the browser registers the removal and 
        // addition of the class for CSS animations to trigger
        setTimeout(() => {
          popup.classList.add("open");
          _activePillPopup = popup;
        }, 10);
      }

      function openPillPopup(key, event) {
        event.stopPropagation();
        closePillPopup();

        const popup   = document.getElementById(PILL_POPUPS[key]);
        const overlay = document.getElementById('pillPopupOverlay');
        if (!popup) return;

        // Position popup near the pill that was clicked
        const pill = event.currentTarget;
        const pr   = pill.getBoundingClientRect();
        const vw   = window.innerWidth;
        const vh   = window.innerHeight;

        // Try to place it above the pill, centered
        const popupW = Math.min(460, vw * 0.36, vw - 40);
        let left = pr.left + pr.width / 2 - popupW / 2;
        left = Math.max(16, Math.min(left, vw - popupW - 16));

        let top = pr.top - 12; // will open upward
        popup.style.width  = popupW + 'px';
        popup.style.left   = left + 'px';
        popup.style.bottom = (vh - top) + 'px';
        popup.style.top    = 'auto';
        popup.style.transform = ''; // Clear card-centered transform
        
        // Ensure stats row is visible for pills
        const stats = popup.querySelector(".s3-pp-stat-row");
        if (stats) stats.style.display = "flex";

        overlay.classList.add('open');
        setTimeout(() => {
          popup.classList.add('open');
          _activePillPopup = popup;
        }, 10);
      }

      function switchS4Tab(index) {
        const tabs = document.querySelectorAll(".s4-tab");
        tabs.forEach((tab, i) => {
          if (i === index) tab.classList.add("active");
          else tab.classList.remove("active");
        });

        const details = document.querySelectorAll(".s4-detail-content");
        details.forEach((detail, i) => {
          if (i === index) detail.classList.add("active");
          else detail.classList.remove("active");
        });
      }

      function closeModal() {
        document.getElementById("pioneerModal").classList.remove("active");
      }

      function openImagePopup(src, showDartmouthCaption = false, isSmall = false) {
        const overlay = document.getElementById('imagePopupOverlay');
        const img = document.getElementById('imagePopupImg');
        img.src = src;
        
        if (isSmall) img.classList.add('popup-small');
        else img.classList.remove('popup-small');
        
        const caption = document.getElementById('imagePopupCaption');
        if (caption) caption.style.display = showDartmouthCaption ? 'block' : 'none';
        
        overlay.style.display = 'flex';
        // Delay adding visible class slightly so the transition works
        setTimeout(() => overlay.classList.add('visible'), 10);
      }

      function closeImagePopup(e) {
        // Prevent closing if clicking the image or the reference link
        if (e && (e.target.tagName === 'IMG' || e.target.tagName === 'A')) return; 
        const overlay = document.getElementById('imagePopupOverlay');
        overlay.classList.remove('visible');
        setTimeout(() => overlay.style.display = 'none', 300);
      }

      // Close modal when clicking outside
      document
        .getElementById("pioneerModal")
        .addEventListener("click", function (e) {
          if (e.target === this) {
            closeModal();
          }
        });

      /* --- GPU Demo Logic (Upgraded from components) --- */
      const TOTAL_DATA = 100,
        CPU_CORES_QTY = 4,
        GPU_CORES_QTY = 100,
        CPU_TICK_RATE = 60,
        GPU_CYCLE_RATE = 800;
      let cpuDoneCount = 0,
        gpuDoneCount = 0,
        cpuCycleCount = 0,
        gpuCycleCount = 0;
      let cpuInterval = null,
        gpuInterval = null,
        cpuIsRunning = false,
        gpuIsRunning = false;
      let cpuBlinkInterval = null,
        cpuBlinkIdx = 0;

      function openGpuDemo() {
        document.getElementById("cgdOverlay").classList.add("active");
        document.body.style.overflow = "hidden";
        initGpuDemo();
      }

      function closeGpuDemo() {
        document.getElementById("cgdOverlay").classList.remove("active");
        document.body.style.overflow = "";
        resetGpuDemo();
      }

      // Close on overlay click
      document
        .getElementById("cgdOverlay")
        .addEventListener("click", function (e) {
          if (e.target === this) closeGpuDemo();
        });

      // Close on Escape
      document.addEventListener("keydown", function (e) {
        if (
          e.key === "Escape" &&
          document.getElementById("cgdOverlay").classList.contains("active")
        ) {
          closeGpuDemo();
        }
      });

      function initGpuDemo() {
        const chips = { cpu: document.getElementById("cpuChip"), gpu: document.getElementById("gpuChip") };
        const pinsL = { cpu: document.getElementById("cpuPinsL"), gpu: document.getElementById("gpuPinsL") };
        const queues = { cpu: document.getElementById("cpuQueue"), gpu: document.getElementById("gpuQueue") };
        const supplies = { cpu: document.getElementById("cpuSupply"), gpu: document.getElementById("gpuSupply") };

        ['cpu','gpu'].forEach(s => {
          const qty = s === 'cpu' ? CPU_CORES_QTY : GPU_CORES_QTY;
          if (chips[s].children.length === 0) {
            for (let i = 0; i < qty; i++) {
              const d = document.createElement("div");
              d.className = `core ${s}-core`;
              if(s==='cpu') d.textContent = `C${i}`;
              chips[s].appendChild(d);
              
              const p = document.createElement("div");
              p.className = `pin ${s}-pin`;
              pinsL[s].appendChild(p);
            }
          }
          if (queues[s].children.length === 0) {
            for (let i = 0; i < TOTAL_DATA; i++) {
              const b = document.createElement("div");
              b.className = "data-block";
              queues[s].appendChild(b);
              
              const sb = document.createElement("div");
              sb.className = "data-block";
              supplies[s].appendChild(sb);
            }
          }
        });
      }

      function setGpuStatus(s, state) {
        const el = document.getElementById(`${s}Status`);
        if (!el) return;
        el.className = "status-tag";
        if (state === "running") {
          el.classList.add(`running-${s}`);
          el.textContent = "EXECUTING";
        } else if (state === "done") {
          el.classList.add("done");
          el.textContent = "COMPLETE";
        } else el.textContent = "IDLE";
      }

      function updateGpuStats(s, countOverride) {
        const done = countOverride !== undefined ? countOverride : (s === "cpu" ? cpuDoneCount : gpuDoneCount);
        const pct = Math.round((done / TOTAL_DATA) * 100);
        document.getElementById(`${s}Progress`).style.width = pct + "%";
        document.getElementById(`${s}Pct`).textContent = pct + "%";
        document.getElementById(
          `${s}Count`
        ).textContent = `${done}/${TOTAL_DATA}`;
      }

      function lightGpuCores(s, idx, on) {
        const c = document.querySelectorAll(`.${s}-core`);
        idx.forEach((i) => {
          if (c[i]) c[i].classList.toggle("active", on);
        });
      }

      function markGpuBlocks(s, start, count) {
        const b = document.querySelectorAll(`#${s}Queue .data-block`);
        for (let i = start; i < start + count && i < TOTAL_DATA; i++)
          b[i].classList.add("done");
      }

      function stopCpuBlink() {
        if (cpuBlinkInterval) {
          clearInterval(cpuBlinkInterval);
          cpuBlinkInterval = null;
        }
        document
          .querySelectorAll(".cpu-core")
          .forEach((c) => c.classList.remove("active"));
        document.getElementById("cpuFinishBtn").style.display = "none";
      }

      /**
       * Animate one batch cycle: dots glide smoothly from left → through chip edge → into core → process.
       * Single continuous motion eliminates jarring phase transitions.
       * Calls onComplete when the full cycle (including processing time) is done.
       */
      function spawnPackets(s, count, onComplete) {
        const sideEl = document.querySelector(`.cgd-side.${s}`);
        const pins = sideEl.querySelectorAll(`.${s}-pin`);
        const cores = sideEl.querySelectorAll(`.${s}-core`);

        const sideRect = sideEl.getBoundingClientRect();
        const isCpu = s === 'cpu';
        const batchIndices = isCpu ? [0,1,2,3] : Array.from({length:count}, (_,i)=>i);

        // Timing constants (seconds)
        const TRAVEL_DIST  = isCpu ? 130 : 110;   // px: how far left dots spawn from chip edge
        const PHASE1_DUR   = isCpu ? 0.45 : 0.5;  // horizontal travel: spawn → pin center (all in sync)
        const PHASE2_DUR   = isCpu ? 0.35 : 0.4;  // travel: pin center → core center
        const PROCESS_DUR  = isCpu ? 0.7 : 0.5;   // core stays lit while processing
        const FADE_DUR     = 0.2;                  // dot fade-out inside core

        let completedCores = 0;
        const activeIndices = batchIndices.filter(i => pins[i]);
        const totalCores = activeIndices.length;
        let borderFlashed = false;

        activeIndices.forEach((chipIdx) => {
          const pRect = pins[chipIdx].getBoundingClientRect();
          const pinLocalX = pRect.left + pRect.width/2 - sideRect.left;
          const pinLocalY = pRect.top + pRect.height/2 - sideRect.top;

          // Core center position
          let coreLocalX = pinLocalX + 30;
          let coreLocalY = pinLocalY;
          if (cores[chipIdx]) {
            const cRect = cores[chipIdx].getBoundingClientRect();
            coreLocalX = cRect.left + cRect.width/2 - sideRect.left;
            coreLocalY = cRect.top + cRect.height/2 - sideRect.top;
          }

          // Create the data dot
          const p = document.createElement('div');
          p.className = `data-packet ${s}-packet`;
          sideEl.appendChild(p);

          // Centering correction for 6x6px dots
          const startX = pinLocalX - TRAVEL_DIST;
          const correction = -3;

          gsap.set(p, {
            x: startX + correction,
            y: pinLocalY + correction,   // Start at pin's Y so phase 1 is purely horizontal
            opacity: 0.85,
            scale: isCpu ? 1.2 : 0.9
          });

          const tl = gsap.timeline();

          // Phase 1: Horizontal travel from start to pin center (same X distance for all dots → in sync)
          tl.to(p, {
            x: pinLocalX + correction,
            y: pinLocalY + correction,   // Y stays constant → dot passes exactly through pin
            scale: isCpu ? 1.0 : 0.8,
            duration: PHASE1_DUR,
            ease: 'sine.in',
            onComplete: () => {
              // Flash the pin at the exact moment the dot passes through it
              if (isCpu) {
                if (!pins[chipIdx].classList.contains('active')) {
                  pins[chipIdx].classList.add('active');
                  setTimeout(() => pins[chipIdx].classList.remove('active'), 250);
                }
              } else if (!borderFlashed) {
                borderFlashed = true;
                const pkg = sideEl.querySelector('.chip-package');
                if (pkg) {
                  pkg.style.borderLeftColor = 'rgba(34, 211, 238, 0.9)';
                  pkg.style.boxShadow = 'inset 4px 0 12px rgba(34, 211, 238, 0.3)';
                  setTimeout(() => {
                    pkg.style.borderLeftColor = '';
                    pkg.style.boxShadow = '';
                  }, 400);
                }
              }
            }
          });

          // Phase 2: From pin center to core center (dots fan out to their respective cores)
          tl.to(p, {
            x: coreLocalX + correction,
            y: coreLocalY + correction,
            scale: isCpu ? 0.9 : 0.7,
            duration: PHASE2_DUR,
            ease: 'sine.out',
            onComplete: () => {
              if (cores[chipIdx]) cores[chipIdx].classList.add("active");
            }
          });

          tl.to(p, {
            scale: isCpu ? 1.2 : 0.85,
            opacity: 0.95,
            duration: PROCESS_DUR * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: 1
          });

          tl.to(p, {
            opacity: 0,
            scale: 0,
            duration: FADE_DUR,
            ease: 'sine.in',
            onComplete: () => {
              p.remove();
              if (cores[chipIdx]) cores[chipIdx].classList.remove("active");
              completedCores++;
              if (completedCores >= totalCores && onComplete) onComplete();
            }
          });
        });
      }


      function cpuTickOperation() {
        if (cpuDoneCount >= TOTAL_DATA) {
          document.getElementById("cpuTimeVal").textContent = cpuCycleCount;
          cpuIsRunning = false;
          setGpuStatus("cpu", "done");
          document.getElementById("cpuFinishBtn").style.display = "none";
          tryShowGpuSpeedup();
          return;
        }

        const batch = Math.min(CPU_CORES_QTY, TOTAL_DATA - cpuDoneCount);
        const currentStart = cpuDoneCount;

        // Sync visual data update with animation completion
        const onBatchDone = () => {
          cpuDoneCount += batch;
          cpuCycleCount++;
          markGpuBlocks("cpu", currentStart, batch);
          updateGpuStats("cpu", cpuDoneCount);
          cpuInterval = setTimeout(cpuTickOperation, 100);
        };

        spawnPackets('cpu', batch, onBatchDone);
      }


      function gpuCycleOperation() {
        if (gpuDoneCount >= TOTAL_DATA) {
          lightGpuCores(
            "gpu",
            Array.from({ length: GPU_CORES_QTY }, (_, i) => i),
            false
          );
          document.getElementById("gpuTimeVal").textContent = gpuCycleCount;
          gpuIsRunning = false;
          setGpuStatus("gpu", "done");
          tryShowGpuSpeedup();
          return;
        }

        const batch = Math.min(GPU_CORES_QTY, TOTAL_DATA - gpuDoneCount);
        const currentStart = gpuDoneCount;

        gpuDoneCount += batch;
        gpuCycleCount++;

        // Animate: dots → pins → cores → process → THEN next batch
        spawnPackets('gpu', batch, () => {
          markGpuBlocks("gpu", currentStart, batch);
          updateGpuStats("gpu", currentStart + batch);
          // Small pause between batches
          gpuInterval = setTimeout(gpuCycleOperation, 80);
        });
      }

      function tryShowGpuSpeedup() {
        const c = document.getElementById("cpuTimeVal").textContent,
          g = document.getElementById("gpuTimeVal").textContent;
        if (c !== "—" && g !== "—")
          document.getElementById("speedupVal").textContent =
            Math.round(parseInt(c) / parseInt(g)) + "×";
      }

      function resetSideDemo(s) {
        if (s === "cpu") {
          clearTimeout(cpuInterval);
          stopCpuBlink();
          cpuDoneCount = 0;
          cpuCycleCount = 0;
          cpuIsRunning = false;
        } else {
          clearTimeout(gpuInterval);
          gpuDoneCount = 0;
          gpuCycleCount = 0;
          gpuIsRunning = false;
        }
        document
          .querySelectorAll(`.${s}-core`)
          .forEach((c) => c.classList.remove("active"));
        // Remove any in-flight data packets
        document
          .querySelectorAll(`.${s}-packet`)
          .forEach((p) => { gsap.killTweensOf(p); p.remove(); });
        document
          .querySelectorAll(`#${s}Queue .data-block`)
          .forEach((b) => b.classList.remove("done"));
        document.getElementById(`${s}Progress`).style.width = "0%";
        document.getElementById(`${s}Pct`).textContent = "0%";
        document.getElementById(`${s}Count`).textContent = `0/${TOTAL_DATA}`;
        document.getElementById(`${s}TimeVal`).textContent = "—";
        setGpuStatus(s, "idle");
      }

      function finishCPU() {
        if (!cpuIsRunning) return;
        clearTimeout(cpuInterval);
        cpuDoneCount = TOTAL_DATA;
        cpuCycleCount = Math.ceil(TOTAL_DATA / CPU_CORES_QTY);
        
        markGpuBlocks("cpu", 0, TOTAL_DATA);
        updateGpuStats("cpu", TOTAL_DATA);
        document.getElementById("cpuTimeVal").textContent = cpuCycleCount;
        cpuIsRunning = false;
        setGpuStatus("cpu", "done");
        tryShowGpuSpeedup();
        stopCpuBlink();
        
        // Hide finish button
        document.getElementById("cpuFinishBtn").style.display = "none";
        
        // Remove in-flight packets
        document.querySelectorAll(".cpu-packet").forEach(p => { 
          gsap.killTweensOf(p); 
          p.remove(); 
        });
      }

      function startCPU() {
        if (cpuIsRunning) {
          resetSideDemo("cpu");
          return;
        }
        resetSideDemo("cpu");
        cpuIsRunning = true;
        setGpuStatus("cpu", "running");
        document.getElementById("speedupVal").textContent = "—";
        document.getElementById("cpuFinishBtn").style.display = "inline-block";
        cpuTickOperation();
      }

      function startGPU() {
        if (gpuIsRunning) {
          resetSideDemo("gpu");
          return;
        }
        resetSideDemo("gpu");
        gpuIsRunning = true;
        setGpuStatus("gpu", "running");
        document.getElementById("speedupVal").textContent = "—";
        gpuCycleOperation();
      }

      function startBoth() {
        resetGpuDemo();
        startCPU();
        startGPU();
      }

      function resetGpuDemo() {
        resetSideDemo("cpu");
        resetSideDemo("gpu");
        document.getElementById("speedupVal").textContent = "—";
      }

      function openCpuGpuComparison() {
        document.getElementById('cpuGpuComparisonOverlay').style.display = 'flex';
      }
      function closeCpuGpuComparison() {
        document.getElementById('cpuGpuComparisonOverlay').style.display = 'none';
      }
      /* ── E. PRESENTATION & NAVIGATION LOGIC ── */
      // --- Keynote-style Magic Move Scrolling ---
      gsap.registerPlugin(ScrollToPlugin);

      const presentationSections = document.querySelectorAll(
        "#sliderContainer > section"
      );
      let currentSlideIdx = 0;
      let isSlideAnimating = false;
      let activeSlideTimeline = null;

      // --- Dynamic Slide Management ---
      // Map: slide id → group label shown above it (only the FIRST slide of a group gets a label)
      const NAV_GROUPS = {
        'slideTwo':          'History',
        'slideFive':         'Biology',
        'slideSeven':        'Neural Networks',
        'slideEight':        'Training',
      };

      const SLIDE_METADATA = {
        'slideOne': 'Neural Intro',
        'slideMesh': 'The Complexity',
        'slideWhyML': 'Why Machine Learning?',
        'slideTwo': 'Historical Context',
        'slideThree': 'Pioneer: Hinton',
        'slideNine': 'The Journey',
        'slideFive': 'Bio-Inspiration',
        'slideSingleNeuron': 'Single Neuron',
        'slideSeven': 'ANN Architecture',
        'slideEight': 'Training Analogy',
        'slideRobotFootball': 'Training Demo',
        'slideFour': 'The Convergence'
      };

      const DEFAULT_SLIDE_STATE = [
        { id: 'slideOne', enabled: true },
        { id: 'slideMesh', enabled: true },
        { id: 'slideWhyML', enabled: true },
        { id: 'slideTwo', enabled: true },
        { id: 'slideThree', enabled: true },
        { id: 'slideNine', enabled: true },
        { id: 'slideFive', enabled: true },
        { id: 'slideSingleNeuron', enabled: true },
        { id: 'slideSeven', enabled: true },
        { id: 'slideEight', enabled: true },
        { id: 'slideRobotFootball', enabled: true },
        { id: 'slideFour', enabled: false }
      ];

      let slideState = JSON.parse(localStorage.getItem('ann_slide_state')) || DEFAULT_SLIDE_STATE;
      let hideInactive = JSON.parse(localStorage.getItem('ann_hide_inactive'));
      if (hideInactive === null) hideInactive = true;

      // Merge new slides from default state if they are missing in localStorage
      DEFAULT_SLIDE_STATE.forEach((def, defIdx) => {
        if (!slideState.find(s => s.id === def.id)) {
          slideState.splice(defIdx, 0, { ...def });
        }
      });

      // Ensure slideState only contains slides present in metadata (cleans up potential stale localStorage)
      slideState = slideState.filter(s => SLIDE_METADATA[s.id]);

      // Activate default slide (slideOne) on load
      {
        const activeSlides = getActiveSlides();
        const idx = activeSlides.findIndex(el => el.id === 'slideOne');
        currentSlideIdx = idx >= 0 ? idx : 0;
        const el = activeSlides[currentSlideIdx];
        if (el) {
          el.classList.add("active-slide");
          el.style.opacity = "1";
          el.style.visibility = "visible";
          el.style.transform = "scale(1)";
        }
      }

      function saveSlideState() {
        const activeBefore = getActiveSlides();
        const currentId = activeBefore[currentSlideIdx]?.id;
        
        localStorage.setItem('ann_slide_state', JSON.stringify(slideState));
        renderQuickNav();

        const activeAfter = getActiveSlides();
        const newIdx = activeAfter.findIndex(s => s.id === currentId);
        if (newIdx !== -1) {
          currentSlideIdx = newIdx;
        } else {
          // If current slide was hidden, stay at same index if possible
          currentSlideIdx = Math.max(0, Math.min(currentSlideIdx, activeAfter.length - 1));
        }
        updateNavigationButtons();
      }

      function resetSlideState() {
        localStorage.removeItem('ann_slide_state');
        location.reload();
      }

      function toggleSlideVisibility(id, e) {
        if (e) e.stopPropagation();
        const slide = slideState.find(s => s.id === id);
        if (slide) {
          // Prevent disabling all slides
          const enabledCount = slideState.filter(s => s.enabled).length;
          if (slide.enabled && enabledCount <= 1) return;
          
          slide.enabled = !slide.enabled;
          saveSlideState();
        }
      }

      // Track which groups are expanded (default: all collapsed)
      const navGroupExpanded = {};

      function renderQuickNav() {
        const container = document.getElementById('dynamicNavItems');
        if (!container) return;

        const masterToggle = document.getElementById('hideInactiveToggle');
        if (masterToggle) masterToggle.checked = hideInactive;

        const savedScroll = container.scrollTop;
        container.innerHTML = '';

        const activeSlides = getActiveSlides();
        const currentId = activeSlides[currentSlideIdx]?.id;

        const eyeOpen = `<svg width="13" height="9" viewBox="0 0 20 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z"/><circle cx="10" cy="6" r="3"/></svg>`;
        const eyeClosed = `<svg width="13" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 10 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 10 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="19" y2="19"/></svg>`;
        const chevron = `<svg class="nav-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

        // Map each slide to its group's start ID
        const groupOf = {};
        let currentGroup = null;
        slideState.forEach(item => {
          if (NAV_GROUPS[item.id]) currentGroup = item.id;
          if (currentGroup) groupOf[item.id] = currentGroup;
        });

        const renderedGroups = new Set();

        slideState.forEach((item, index) => {
          if (hideInactive && !item.enabled) return;

          const inGroup = groupOf[item.id];

          if (inGroup) {
            // Render group header once
            if (!renderedGroups.has(inGroup)) {
              renderedGroups.add(inGroup);

              const isExpanded = !!navGroupExpanded[inGroup];
              const hasActive = slideState.some(s => groupOf[s.id] === inGroup && s.id === currentId);

              const header = document.createElement('div');
              header.className = `nav-section-header ${isExpanded ? 'expanded' : ''} ${hasActive ? 'has-active' : ''}`;
              header.dataset.group = inGroup;
              header.innerHTML = `
                <span class="nav-section-chevron">${chevron}</span>
                <span class="nav-section-label">${NAV_GROUPS[inGroup]}</span>
                ${isExpanded ? `<button type="button" class="nav-section-close" title="Collapse">✕</button>` : ''}
              `;
              header.addEventListener('click', (e) => {
                if (e.target.closest('.nav-section-close')) {
                  navGroupExpanded[inGroup] = false;
                } else {
                  navGroupExpanded[inGroup] = !navGroupExpanded[inGroup];
                }
                renderQuickNav();
              });
              container.appendChild(header);

              // Children container
              const children = document.createElement('div');
              children.className = `nav-section-children ${isExpanded ? 'expanded' : ''}`;
              children.dataset.groupChildren = inGroup;
              container.appendChild(children);
            }

            // Append slide into its group's children container
            const children = container.querySelector(`[data-group-children="${inGroup}"]`);
            if (children) {
              const div = makeNavItem(item, index, currentId, eyeOpen, eyeClosed, container);
              div.classList.add('nav-child');
              children.appendChild(div);
            }
          } else {
            // Ungrouped — render directly
            const div = makeNavItem(item, index, currentId, eyeOpen, eyeClosed, container);
            container.appendChild(div);
          }
        });

        container.scrollTop = savedScroll;
      }

      function makeNavItem(item, index, currentId, eyeOpen, eyeClosed, container) {
        const div = document.createElement('div');
        div.className = `nav-item ${!item.enabled ? 'disabled' : ''} ${item.id === currentId ? 'active' : ''}`;
        div.dataset.id = item.id;
        div.dataset.index = index;
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');

        div.innerHTML = `
          <span class="nav-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="nav-label">${SLIDE_METADATA[item.id]}</span>
          <button type="button" class="nav-visibility" title="${item.enabled ? 'Hide' : 'Show'}" aria-pressed="${item.enabled}">
            ${item.enabled ? eyeOpen : eyeClosed}
          </button>
        `;

        div.addEventListener('click', (e) => {
          if (e.target.closest('.nav-visibility')) {
            toggleSlideVisibility(item.id, e);
            return;
          }
          if (!item.enabled) return;
          const newIndex = getActiveSlides().findIndex(s => s.id === item.id);
          goToSlide(newIndex);
        });

        div.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!item.enabled) return;
            const newIndex = getActiveSlides().findIndex(s => s.id === item.id);
            goToSlide(newIndex);
          }
        });

        return div;
      }

      function reorderSlides(draggedId, targetId, isAbove) {
        const draggedIdx = slideState.findIndex(s => s.id === draggedId);
        const draggedItem = slideState.splice(draggedIdx, 1)[0];
        
        let newIdx = slideState.findIndex(s => s.id === targetId);
        if (!isAbove) newIdx++;
        
        slideState.splice(newIdx, 0, draggedItem);
        saveSlideState();
      }

      function toggleHideInactive() {
        hideInactive = document.getElementById('hideInactiveToggle').checked;
        localStorage.setItem('ann_hide_inactive', JSON.stringify(hideInactive));
        renderQuickNav();
      }



      function getActiveSlides() {
        const orderMap = slideState.reduce((acc, s, i) => { acc[s.id] = i; return acc; }, {});
        return slideState
          .filter(s => s.enabled)
          .map(s => document.getElementById(s.id))
          .filter(el => el);
      }

      function goToSlide(index) {
        const activeSlides = getActiveSlides();
        const nav = document.getElementById("sideNav");
        const settings = document.getElementById("settingsSide");
        const toggle = document.getElementById("menuToggle");
        if (nav) nav.classList.remove("open");
        if (settings) settings.classList.remove("open");
        if (toggle) toggle.classList.remove("open");

        if (index < 0 || index >= activeSlides.length) return;
        
        if (isSlideAnimating && activeSlideTimeline) {
          activeSlideTimeline.progress(1).kill();
        }

        if (index === currentSlideIdx && activeSlides[index].classList.contains('active-slide')) {
           isSlideAnimating = false;
           return;
        }
        
        isSlideAnimating = true;
        const outgoing = document.querySelector('.active-slide');
        const incoming = activeSlides[index];
        const direction = index > currentSlideIdx ? 1 : -1;

        currentSlideIdx = index;

        if (typeof syncSlider === "function") syncSlider(index);

        activeSlideTimeline = gsap.timeline({
          onComplete: () => {
            if (outgoing) outgoing.classList.remove("active-slide");
            if (outgoing) gsap.set(outgoing, { visibility: "hidden", zIndex: 0 });
            isSlideAnimating = false;
            activeSlideTimeline = null;
            updateNavigationButtons();
          },
        });
        const tl = activeSlideTimeline;

        incoming.classList.add("active-slide");
        gsap.set(incoming, {
          visibility: "visible",
          opacity: 0,
          scale: direction > 0 ? 1.08 : 0.92,
          zIndex: 3,
        });
        if (outgoing) gsap.set(outgoing, { zIndex: 2 });

        if (outgoing) {
          tl.to(outgoing, {
            opacity: 0,
            scale: direction > 0 ? 0.92 : 1.08,
            duration: 0.8,
            ease: "power2.inOut",
            force3D: true,
          }, 0);
        }

        tl.to(incoming, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.inOut",
          force3D: true,
        }, 0.1);

        incoming.classList.add("in-view");

        // Re-trigger slideOne title animation when navigating to it
        if (incoming.id === 'slideOne') {
          setTimeout(() => animateSlideOneTitle(), 400);
        }

        // Trigger slide 8 staggered entrance
        if (incoming.id === 'slideEight') {
          setTimeout(() => animateSlideEight(), 400);
        }

        if (incoming.id === 'slideSingleNeuron' || incoming.id === 'slideMesh' || incoming.id === 'slideWhyML') {
          const frame = incoming.querySelector('iframe');
          if (frame) {
            if (incoming.id === 'slideMesh' && frame.contentWindow) {
               frame.contentWindow.postMessage({ type: 'RESTART_ANIMATION' }, '*');
            } else if (incoming.id === 'slideWhyML' && frame.contentWindow) {
               frame.contentWindow.postMessage({ type: 'RESTART_ANIMATION' }, '*');
            } else {
               const currentSrc = frame.src;
               frame.src = '';
               setTimeout(() => { frame.src = currentSrc; }, 0);
            }
          }
        }

        // Update UI
        const progress = ((index + 1) / activeSlides.length) * 100;
        document.getElementById("slideCounter").innerText = `${index + 1} / ${activeSlides.length}`;

        updateNavigationButtons();
      }


      // Scroll listener returned with debounce protection
      // REMOVED slide-change-on-scroll to allow vertical scrolling within slides
      // as per user request "Do not let mouse scroll lead to page change"




      // --- GSAP Hero Animations ---
      function splitText(selector) {
        const el = document.querySelector(selector);
        if (!el) return;
        const text = el.innerText;
        el.innerHTML = "";
        text.split("").forEach((char) => {
          let span = document.createElement("span");
          span.innerText = char === " " ? "\u00A0" : char;
          span.style.display = "inline-block";

          // For .t2 (gradient text), we need to re-apply the gradient to each inline-block span
          // because webkit-background-clip: text requires background on the element holding the text.
          if (selector === ".t2") {
            span.style.background = "var(--text-gradient)";
            span.style.webkitBackgroundClip = "text";
            span.style.webkitTextFillColor = "transparent";
          }

          el.appendChild(span);
        });
      }

      // Prepare the text
      splitText(".t1");
      splitText(".t2");

      // Keep side-nav in sync
      function syncSlider(index) {
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach((item, i) => {
          item.classList.toggle("active", i === index);
        });
      }


      // SlideOne title entrance animation — callable on demand
      function animateSlideOneTitle() {
        // Reset all elements to invisible first
        gsap.set(".hero-eyebrow", { opacity: 0, y: -14 });
        gsap.set(".t1 span", { opacity: 0, y: 55 });
        gsap.set(".t2 span", { opacity: 0, y: 55 });
        gsap.set(".hero-tagline", { opacity: 0, y: 18, filter: "blur(6px)" });
        gsap.set(".hero-meta", { opacity: 0, y: 12 });

        // Eyebrow badge slide down
        gsap.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.05 });

        // Animate "NEURAL"
        gsap.to(".t1 span", {
          duration: 1.1, y: 0, opacity: 1,
          ease: "power4.out", stagger: 0.045, delay: 0.2,
        });

        // Animate "NETWORKS"
        gsap.to(".t2 span", {
          duration: 1.1, y: 0, opacity: 1,
          ease: "power4.out", stagger: 0.045, delay: 0.38,
        });

        // Tagline fade-in
        gsap.to(".hero-tagline", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power3.out", delay: 1.0 });

        // Meta row + python badge
        gsap.to(".hero-meta", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: 1.3 });
      }

      // Fire title animation if slideOne is the starting slide, otherwise leave visible
      if (document.getElementById('slideOne')?.classList.contains('active-slide')) {
        setTimeout(() => animateSlideOneTitle(), 400);
      }

      // Divider fade in (dual mode only)
      if (document.querySelector('.hero-divider.visible')) {
        gsap.fromTo(
          ".hero-divider",
          { opacity: 0 },
          { opacity: 1, duration: 1.2, ease: "power2.out", delay: 1.5 }
        );
      }

      // Turing Quote trigger fade-in (the pill button)
      gsap.fromTo(
        "#quoteTrigger",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.0, ease: "power3.out", delay: 1.6 }
      );


      // Theme Controls Drop-in
      gsap.fromTo(
        ".theme-ctrl-btn",
        { y: -60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "back.out(1.5)",
          delay: 2,
          stagger: 0.1,
        }
      );

      // (Toggle logic removed as content is now direct)

      /* ── F. THEME & CUSTOMIZATION ENGINE ── */
      // ── THEME CUSTOMIZER ────────────────────────────────────────────────────────

      // Accent color presets
      const accentPresets = {
        cyan: {
          dark: "#06b6d4",
          darkRgb: "6, 182, 212",
          light: "#0369a1",
          lightRgb: "3, 105, 161",
          gradient: "linear-gradient(90deg, #0369a1, #0ea5e9, #06b6d4)",
        },
        gold: {
          dark: "#cba855",
          darkRgb: "203, 168, 85",
          light: "#b38600",
          lightRgb: "179, 134, 0",
          gradient: "linear-gradient(135deg, #e8d5a3, #cba855)",
        },
        violet: {
          dark: "#7c3aed",
          darkRgb: "124, 58, 237",
          light: "#5b21b6",
          lightRgb: "91, 33, 182",
          gradient: "linear-gradient(90deg, #4f46e5, #7c3aed, #a855f7)",
        },
        rose: {
          dark: "#f43f5e",
          darkRgb: "244, 63, 94",
          light: "#be123c",
          lightRgb: "190, 18, 60",
          gradient: "linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)",
        },
        emerald: {
          dark: "#10b981",
          darkRgb: "16, 185, 129",
          light: "#065f46",
          lightRgb: "6, 95, 70",
          gradient: "linear-gradient(90deg, #059669, #10b981, #34d399)",
        },
        orange: {
          dark: "#f97316",
          darkRgb: "249, 115, 22",
          light: "#c2410c",
          lightRgb: "194, 65, 12",
          gradient: "linear-gradient(90deg, #ea580c, #f97316, #fb923c)",
        },
      };

      // Style presets — which body classes to add
      const styleClasses = [
        "theme-classic",
        "theme-linear",
        "theme-vercel",
        "theme-stripe",
        "theme-apple",
      ];
      const stylePresets = {
        modern: { cls: "", defaultAccent: "gold" },
        classic: { cls: "theme-classic", defaultAccent: "gold" },
        linear: { cls: "theme-linear", defaultAccent: "violet" },
        vercel: { cls: "theme-vercel", defaultAccent: "cyan" },
        stripe: { cls: "theme-stripe", defaultAccent: "violet" },
        apple: { cls: "theme-apple", defaultAccent: "cyan" },
      };

      let currentAccent = "gold";
      let currentStyle = "modern";

      function applyAccentVars() {
        const a = accentPresets[currentAccent];
        // Set on body (inline style) so it beats .light-mode / .theme-* class rules
        const el = document.body;
        const col = isLightMode ? a.light : a.dark;
        const rgb = isLightMode ? a.lightRgb : a.darkRgb;
        const dim = `rgba(${rgb}, 0.15)`;
        el.style.setProperty("--accent-main", col);
        el.style.setProperty("--accent-dim", dim);
        el.style.setProperty("--hero-gradient", a.gradient);
        el.style.setProperty("--s2-gold", col);
        el.style.setProperty("--s2-gold-rgb", rgb);
        el.style.setProperty("--s2-gold-dim", dim);
      }

      function setAccent(accent) {
        currentAccent = accent;
        applyAccentVars();
        document.querySelectorAll(".settings-swatch, .accent-swatch").forEach((b) =>
          b.classList.toggle("active", b.dataset.accent === accent)
        );
      }

      function setStyle(style) {
        styleClasses.forEach((c) => document.body.classList.remove(c));
        const preset = stylePresets[style];
        if (preset && preset.cls) document.body.classList.add(preset.cls);
        currentStyle = style;
        document.querySelectorAll(".theme-card").forEach((b) =>
          b.classList.toggle("active", b.dataset.style === style)
        );
        document.querySelectorAll(".settings-btn").forEach((b) => {
          if (b.classList.contains(`style-btn-${style}`)) b.classList.add("active");
          else if ([...b.classList].some((c) => c.startsWith("style-btn-")))
            b.classList.remove("active");
        });
        if (preset) setAccent(preset.defaultAccent);
      }

      function setMode(mode) {
        if (typeof isLightMode !== "undefined") isLightMode = (mode === "light" || mode === "custom");
        else window.isLightMode = (mode === "light" || mode === "custom");

        document.body.classList.remove("light-mode", "custom-mode");
        if (mode === "light") document.body.classList.add("light-mode");
        if (mode === "custom") document.body.classList.add("custom-mode");

        document.querySelectorAll(".settings-btn").forEach((b) =>
          b.classList.toggle("active", b.classList.contains(`mode-btn-${mode}`))
        );
        applyAccentVars();

        // Sync theme into all child iframes
        document.querySelectorAll(".s7-iframe, .premium-iframe").forEach(frame => {
          if (frame.contentWindow) {
            frame.contentWindow.postMessage({ type: "SET_THEME", mode }, "*");
          }
        });
      }

      // Push current theme to iframes once they load
      (function () {
        document.querySelectorAll(".s7-iframe, .premium-iframe").forEach(frame => {
          frame.addEventListener("load", () => {
            const mode = document.body.classList.contains("light-mode") ? "light" : "dark";
            frame.contentWindow.postMessage({ type: "SET_THEME", mode }, "*");
          });
        });
      })();

      function toggleMode() {
        const currentMode = document.body.classList.contains("light-mode") ? "light" : "dark";
        setMode(currentMode === "light" ? "dark" : "light");
      }

      // ─── Color Palette System ────────────────────────────────────────────
      const PALETTES = {
        "warm-linen":  { light: true,  cls: "palette-warm-linen",  iframeName: "Warm Linen"  },
        "paper-white": { light: true,  cls: "palette-paper-white", iframeName: "Paper White" },
        "midnight":    { light: false, cls: "palette-midnight",    iframeName: "Midnight"    },
        "mint":        { light: true,  cls: "palette-mint",        iframeName: "Mint"        },
        "plum":        { light: true,  cls: "palette-plum",        iframeName: "Plum"        },
        "dark":        { light: false, cls: null,                  iframeName: "Midnight"    },
      };

      function setPalette(name) {
        const p = PALETTES[name];
        if (!p) return;
        const body = document.body;

        // Remove all palette classes + legacy light/custom mode classes
        Object.values(PALETTES).forEach(pal => { if (pal.cls) body.classList.remove(pal.cls); });
        body.classList.remove("light-mode", "custom-mode");

        // Apply new palette
        if (p.cls) body.classList.add(p.cls);
        if (p.light) body.classList.add("light-mode");

        // Sync the canvas-rendering flag so brain visuals match
        if (typeof isLightMode !== "undefined") isLightMode = p.light;
        else window.isLightMode = p.light;

        // Persist and reflect in UI
        try { localStorage.setItem("ann_palette", name); } catch (e) {}
        document.querySelectorAll(".palette-row").forEach(r =>
          r.classList.toggle("active", r.dataset.palette === name)
        );

        // Refresh accent-dependent CSS vars / iframes
        if (typeof applyAccentVars === "function") applyAccentVars();
        document.querySelectorAll(".s7-iframe, .premium-iframe").forEach(frame => {
          if (frame.contentWindow) {
            frame.contentWindow.postMessage({
              type: "SET_THEME",
              mode: p.light ? "light" : "dark",
              palette: p.iframeName,
            }, "*");
          }
        });
      }

      // Back-compat shim: old setMode calls route to the nearest palette
      const _origSetMode = typeof setMode === "function" ? setMode : null;
      window.setMode = function (mode) {
        if (mode === "light" || mode === "custom") setPalette("warm-linen");
        else setPalette("midnight");
      };

      // Force Warm Linen palette on load
      (function () {
        setPalette("warm-linen");
      })();

      function toggleSettings(e) {
        if (e) e.stopPropagation();
        const side = document.getElementById("settingsSide");
        const toggle = document.getElementById("menuToggle");
        const sideNav = document.getElementById("sideNav");
        
        if (!side || !toggle) return;
        const isOpening = !side.classList.contains("open");
        
        if (isOpening && sideNav) sideNav.classList.remove("open");
        
        side.classList.toggle("open", isOpening);
        toggle.classList.toggle("open", isOpening);
      }

      // Attach listener to menu toggle
      document.getElementById("menuToggle").addEventListener("click", toggleSettings);





      function toggleSound() {
        const toggle = document.getElementById('soundToggle');
        if (!toggle) return;
        soundEnabled = toggle.checked;
        const vid = document.getElementById('neuronVideo');
        if (vid) {
          vid.muted = !soundEnabled;
        }
        localStorage.setItem('ann_sound_enabled', soundEnabled);
      }
      
      // Initialize sound state from localStorage
      document.addEventListener('DOMContentLoaded', () => {
        const savedSound = localStorage.getItem('ann_sound_enabled');
        const toggle = document.getElementById('soundToggle');
        if (savedSound !== null && toggle) {
          const isEnabled = savedSound === 'true';
          toggle.checked = isEnabled;
          soundEnabled = isEnabled;
          const vid = document.getElementById('neuronVideo');
          if (vid) vid.muted = !isEnabled;
        }
      });

      function toggleNeuronVideo(e) {
        if (e) e.stopPropagation();
        const vid = document.getElementById('neuronVideo');
        const btn = document.getElementById('neuronPlayBtn');
        if (vid.paused) {
          vid.muted = !soundEnabled; // Respect global sound setting
          vid.play();
          btn.textContent = '⏸';
        } else {
          vid.pause();
          btn.textContent = '▶';
        }
      }

      // ── Stat pill pop-highlight & static sound on click ──
      document.querySelectorAll('.s5-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          // Deactivate any other pill first
          document.querySelectorAll('.s5-pill.s5-pill-pop').forEach(p => p.classList.remove('s5-pill-pop'));
          void pill.offsetWidth;
          pill.classList.add('s5-pill-pop');
          
          // Play the user-provided WAV asset
          if (soundEnabled) {
            const clickAudio = new Audio('assets/click_sound.wav');
            clickAudio.volume = 0.8;
            clickAudio.play().catch(e => console.warn('Pill click audio failed:', e));
          }

          setTimeout(() => pill.classList.remove('s5-pill-pop'), 1800);
        });
      });

      function toggleSideNav(e) {
        if (e) e.stopPropagation();
        const nav = document.getElementById("sideNav");
        const settingsSide = document.getElementById("settingsSide");
        const menuToggle = document.getElementById("menuToggle");
        
        if (!nav) return;
        const isOpening = !nav.classList.contains("open");
        
        if (isOpening) {
          if (settingsSide) settingsSide.classList.remove("open");
          if (menuToggle) menuToggle.classList.remove("open");
        }
        
        nav.classList.toggle("open", isOpening);
      }

      // Attach listener to nav ribbon
      const navRibbon = document.getElementById("navRibbon");
      if (navRibbon) navRibbon.addEventListener("click", toggleSideNav);

      // ─── COURSE CONTENT ACCORDION LOGIC ───
      function toggleAccordion(header, event) {
        if (event) event.stopPropagation();
        const item = header.parentElement;
        item.classList.toggle('open');
      }

      function openGenAIModalDirectly() {
        // Find the index of slideMesh
        const activeSlides = getActiveSlides();
        const meshIdx = activeSlides.findIndex(s => s.id === 'slideMesh');
        if (meshIdx !== -1) {
          goToSlide(meshIdx);
          // Wait for slide transition to finish before opening modal
          setTimeout(() => {
            const frame = document.querySelector('#slideMesh iframe');
            if (frame && frame.contentWindow) {
              frame.contentWindow.postMessage({ type: 'OPEN_GENAI_MODAL' }, '*');
            }
          }, 850);
        }
      }

      // Keep both quick nav systems in sync
      function syncSlider(index) {
        // New Course Accordion Nav
        const lessons = document.querySelectorAll(".course-lesson");
        lessons.forEach(lesson => {
          lesson.classList.remove("active");
          // Extract slide index from onclick attribute
          const onclickStr = lesson.getAttribute('onclick');
          if (onclickStr && onclickStr.includes(`goToSlide(${index})`)) {
            lesson.classList.add("active");
            // Auto-expand parent section
            const parentSection = lesson.closest('.accordion-item');
            if (parentSection && !parentSection.classList.contains('open')) {
              parentSection.classList.add('open');
            }
          }
        });
      }

      // Global click listener to close menus when clicking outside
      document.addEventListener("click", (e) => {
        const settingsSide = document.getElementById("settingsSide");
        const menuToggle = document.getElementById("menuToggle");
        const sideNav = document.getElementById("sideNav");

        // Close settings if open and click is outside
        if (settingsSide && settingsSide.classList.contains("open")) {
          if (!settingsSide.contains(e.target) && !menuToggle.contains(e.target)) {
            settingsSide.classList.remove("open");
            menuToggle.classList.remove("open");
          }
        }

        // Close sideNav if open and click is outside
        if (sideNav && sideNav.classList.contains("open")) {
          // Check if clicking inside sideNav (including accordion)
          if (!sideNav.contains(e.target)) {
            // Note: toggleMenu is used in index.html for close button
            // If toggleMenu is not defined, we'll use toggleSideNav logic
            sideNav.classList.remove("open");
          }
        }
      });
      
      // Alias toggleMenu to toggleSideNav for buttons in index.html
      function toggleMenu() { 
        toggleSideNav(); 
      }

      // Slide 3 Card Spotlight Effect
      document.querySelectorAll('.s3-glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });


      // Initialise theme/accent on load
      setMode(isLightMode ? 'light' : 'dark');
      setStyle(currentStyle);
      setAccent(currentAccent);
      
      // Initial progress bar logic removed per user request

      // ── Pill popups (Godfather of AI / Nobel Prize 2024) ─────────────────────
      const PILL_POPUPS = {
        godfather: 'pillPopupGodfather',
        nobel:     'pillPopupNobel',
      };
      let _activePillPopup = null;


      function closePillPopup() {
        if (_activePillPopup) {
          _activePillPopup.classList.remove('open');
          _activePillPopup = null;
        }
        document.getElementById('pillPopupOverlay').classList.remove('open');
      }

      document.addEventListener('keydown', (e) => {
        // Close popups/modals
        if (e.key === 'Escape') {
          closePillPopup();
          if (typeof closeModal === 'function') closeModal();
          if (typeof closeGpuDemo === 'function') closeGpuDemo();
          if (typeof closeCpuGpuComparison === 'function') closeCpuGpuComparison();
        }

        // Navigation keys: Right, Down, PageDown, Space -> Next
        if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            goToSlide(currentSlideIdx + 1);
          }
        } 
        // Navigation keys: Left, Up, PageUp -> Previous
        else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            goToSlide(currentSlideIdx - 1);
          }
        }
      });

      // ── Slide 8: Football Robot staggered entrance ──
      function animateSlideEight() {
        const els = document.querySelectorAll('#slideEight [data-s8-delay]');
        els.forEach(el => {
          el.classList.remove('s8-visible');
        });
        els.forEach(el => {
          const delay = parseInt(el.getAttribute('data-s8-delay')) || 0;
          setTimeout(() => el.classList.add('s8-visible'), delay);
        });
      }

      function updateNavigationButtons() {
        const activeSlides = getActiveSlides();
        document.getElementById("prevBtn").disabled = currentSlideIdx === 0;
        document.getElementById("nextBtn").disabled = currentSlideIdx === activeSlides.length - 1;
      }

      document.getElementById("prevBtn").addEventListener("click", () => goToSlide(currentSlideIdx - 1));
      document.getElementById("nextBtn").addEventListener("click", () => goToSlide(currentSlideIdx + 1));

      // Init dynamic nav components
      updateNavigationButtons();
      
      // Mark first lesson active on load
      syncSlider(0);
