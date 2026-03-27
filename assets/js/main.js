/* ============================================================
   KAUSTUBH PANDIT — Portfolio JS
   Animations, Canvas, Nav, Scroll Effects
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════
   NAV SCROLL BEHAVIOR
══════════════════════════════════════════ */
(function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  const backTop = document.querySelector('.back-to-top');

  if (!nav) return;

  // Active link based on current page
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll handler
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', scrolled);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Back to top
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════
   TYPEWRITER EFFECT
══════════════════════════════════════════ */
function typewriter(el, strings, opts = {}) {
  if (!el) return;
  const {
    typeSpeed = 55,
    deleteSpeed = 30,
    pauseEnd = 2000,
    pauseStart = 500
  } = opts;

  let strIndex = 0, charIndex = 0, isDeleting = false;

  function tick() {
    const current = strings[strIndex % strings.length];
    const displayed = isDeleting
      ? current.substring(0, charIndex - 1)
      : current.substring(0, charIndex + 1);

    el.textContent = displayed;
    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === current.length) {
      delay = pauseEnd;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      strIndex++;
      delay = pauseStart;
    }
    setTimeout(tick, delay);
  }
  tick();
}

/* ══════════════════════════════════════════
   HERO CANVAS — OCT / Ultrasound Visualizer
   Simulates B-scan + speckle + wave overlay
══════════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let particles = [];
  let waves = [];
  let scanLines = [];
  let time = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initScene();
  }

  function initScene() {
    particles = [];
    waves = [];
    scanLines = [];

    // ULM-style particles (super-resolved microbubbles)
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.5 ? '#00d4ff' : '#7b2fff',
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Ultrasound wave arcs
    for (let i = 0; i < 5; i++) {
      waves.push({
        x: -50 + Math.random() * (W + 100),
        y: -20,
        radius: Math.random() * 60 + 20,
        maxRadius: H * 1.2,
        speed: 0.6 + Math.random() * 0.4,
        alpha: 0.12 + Math.random() * 0.08,
        color: '#00d4ff'
      });
    }

    // OCT B-scan horizontal lines
    for (let i = 0; i < 8; i++) {
      scanLines.push({
        y: (i / 8) * H + Math.random() * (H / 16),
        alpha: 0.04 + Math.random() * 0.06,
        width: W,
        noise: Array.from({ length: 120 }, () => ({
          x: Math.random() * W,
          brightness: Math.random()
        }))
      });
    }
  }

  function drawBackground() {
    // Deep dark gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#050d1a');
    grad.addColorStop(0.5, '#07101f');
    grad.addColorStop(1, '#050d1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
    vg.addColorStop(0, 'transparent');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawOCTScanLines() {
    scanLines.forEach(sl => {
      // Horizontal faint line
      ctx.beginPath();
      ctx.moveTo(0, sl.y);
      ctx.lineTo(W, sl.y);
      ctx.strokeStyle = `rgba(0, 212, 255, ${sl.alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Speckle noise along line
      sl.noise.forEach(pt => {
        const b = pt.brightness * sl.alpha * 3;
        ctx.fillStyle = `rgba(0, 212, 255, ${b})`;
        ctx.fillRect(pt.x, sl.y - 0.5, 1.5, 1);
      });
    });
  }

  function drawUltrasoundWaves() {
    waves.forEach(w => {
      w.radius += w.speed;
      if (w.radius > w.maxRadius) {
        w.radius = Math.random() * 60 + 20;
        w.x = Math.random() * W;
        w.y = -20;
      }

      const fade = 1 - w.radius / w.maxRadius;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI);
      ctx.strokeStyle = `rgba(0, 212, 255, ${w.alpha * fade})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Echo return arc (photoacoustics)
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius * 0.7, Math.PI * 0.1, Math.PI * 0.9);
      ctx.strokeStyle = `rgba(255, 63, 164, ${w.alpha * fade * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      const r = p.r * (1 + 0.2 * Math.sin(p.pulse));

      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
      grd.addColorStop(0, p.color.replace(')', `, ${a})`).replace('rgb', 'rgba'));
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawConnectionLines() {
    const nearby = particles.slice(0, 60);
    for (let i = 0; i < nearby.length; i++) {
      for (let j = i + 1; j < nearby.length; j++) {
        const dx = nearby[i].x - nearby[j].x;
        const dy = nearby[i].y - nearby[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(nearby[i].x, nearby[i].y);
          ctx.lineTo(nearby[j].x, nearby[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / 80) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawScanBeam() {
    // Vertical OCT scanning beam
    const beamX = ((time * 0.3) % 1) * W;
    const beamGrad = ctx.createLinearGradient(beamX - 20, 0, beamX + 20, 0);
    beamGrad.addColorStop(0, 'transparent');
    beamGrad.addColorStop(0.5, 'rgba(0, 212, 255, 0.04)');
    beamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(beamX - 20, 0, 40, H);

    // Beam line
    ctx.beginPath();
    ctx.moveTo(beamX, 0);
    ctx.lineTo(beamX, H);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawDepthAxis() {
    // Simulated depth scale (OCT/US)
    const x = W - 40;
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, H - 20);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i <= 8; i++) {
      const y = 20 + (i / 8) * (H - 40);
      ctx.beginPath();
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
      ctx.stroke();
    }
  }

  function loop() {
    time++;
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawOCTScanLines();
    drawUltrasoundWaves();
    drawConnectionLines();
    drawParticles();
    drawScanBeam();
    drawDepthAxis();
    animId = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); loop(); });
  loop();
}

/* ══════════════════════════════════════════
   PROJECT CARD MINI-CANVASES
══════════════════════════════════════════ */
function initProjectCanvases() {
  // OCT B-scan
  (function octCanvas() {
    const c = document.getElementById('canvas-oct');
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const W = c.width, H = c.height;

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#000a1a');
      bg.addColorStop(1, '#001a33');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // A-scan lines (columns)
      const cols = 80;
      for (let col = 0; col < cols; col++) {
        const x = (col / cols) * W;
        for (let row = 0; row < H; row += 2) {
          // Simulate layered tissue reflectivity
          const depth = row / H;
          let intensity = 0;
          // Surface layer
          if (depth < 0.08) intensity = 0.8 * Math.exp(-depth * 40);
          // Stratum 1
          const s1 = Math.exp(-Math.pow((depth - 0.2), 2) / 0.003);
          // Stratum 2
          const s2 = 0.6 * Math.exp(-Math.pow((depth - 0.42 + 0.04 * Math.sin(col * 0.3 + t * 0.01)), 2) / 0.005);
          // Stratum 3
          const s3 = 0.4 * Math.exp(-Math.pow((depth - 0.65), 2) / 0.004);
          // Noise/speckle
          const speckle = 0.15 * Math.random();
          intensity = Math.max(0, s1 * 0.9 + s2 + s3 + speckle + intensity - depth * 0.3);

          const alpha = Math.min(1, intensity);
          if (alpha > 0.05) {
            const hue = 185 + intensity * 20;
            ctx.fillStyle = `hsla(${hue}, 100%, ${40 + intensity * 40}%, ${alpha})`;
            ctx.fillRect(x, row, W / cols, 2);
          }
        }
      }

      // Scan cursor
      const scanX = ((t * 0.5) % W);
      const sg = ctx.createLinearGradient(scanX - 8, 0, scanX + 8, 0);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(0.5, 'rgba(0,212,255,0.6)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.fillRect(scanX - 8, 0, 16, H);

      t++;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // Ultrasound B-mode
  (function usCanvas() {
    const c = document.getElementById('canvas-us');
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const W = c.width, H = c.height;
    let t = 0;

    const noise = Array.from({ length: W * H }, () => Math.random());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W / 2, 0, 10, W / 2, H / 2, H);
      bg.addColorStop(0, '#001020');
      bg.addColorStop(1, '#000510');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Draw fan-shaped US field
      const cx = W / 2, cy = -20;
      const angles = { start: -Math.PI * 0.35, end: Math.PI * 0.35 };
      const numLines = 50;

      for (let i = 0; i < numLines; i++) {
        const angle = angles.start + (i / numLines) * (angles.end - angles.start);
        const len = H * 1.1;
        const ex = cx + Math.sin(angle) * len;
        const ey = cy + Math.cos(angle) * len;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = 'rgba(0,212,255,0.04)';
        ctx.lineWidth = W / numLines * 0.8;
        ctx.stroke();

        // Tissue echoes along line
        for (let d = 0.1; d < 1; d += 0.015) {
          const px = cx + Math.sin(angle) * len * d;
          const py = cy + Math.cos(angle) * len * d;

          let echo = 0;
          // Organ boundaries
          if (Math.abs(d - 0.3) < 0.01) echo = 0.7 + 0.2 * Math.sin(i * 0.4 + t * 0.03);
          if (Math.abs(d - 0.55) < 0.008) echo = 0.5 + 0.15 * Math.sin(i * 0.5);
          if (Math.abs(d - 0.75) < 0.01) echo = 0.6;
          // Speckle
          echo += 0.08 * Math.random();

          if (echo > 0.1 && px > 0 && px < W && py > 0 && py < H) {
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, ${120 + echo * 135}, ${200 + echo * 55}, ${echo * 0.8})`;
            ctx.fill();
          }
        }
      }

      // Arc boundary of probe footprint
      ctx.beginPath();
      ctx.arc(cx, cy, 30, angles.start + Math.PI / 2, angles.end + Math.PI / 2);
      ctx.strokeStyle = 'rgba(0,212,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      t++;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ULM — Super-resolution
  (function ulmCanvas() {
    const c = document.getElementById('canvas-ulm');
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const W = c.width, H = c.height;
    let t = 0;

    // Vessel network
    const vessels = [
      { pts: [[0.2, 0.1], [0.25, 0.3], [0.3, 0.5], [0.25, 0.7], [0.2, 0.9]], r: 3, color: '#00d4ff' },
      { pts: [[0.5, 0.05], [0.48, 0.25], [0.52, 0.45], [0.5, 0.65], [0.48, 0.85], [0.5, 1.0]], r: 4, color: '#7b2fff' },
      { pts: [[0.75, 0.1], [0.7, 0.3], [0.72, 0.5], [0.75, 0.7], [0.72, 0.9]], r: 2.5, color: '#00e5b4' },
      { pts: [[0.3, 0.5], [0.5, 0.45], [0.7, 0.5]], r: 2, color: '#00d4ff' },
      { pts: [[0.2, 0.3], [0.35, 0.28], [0.48, 0.25]], r: 1.5, color: '#7b2fff' },
      { pts: [[0.52, 0.65], [0.65, 0.62], [0.75, 0.7]], r: 1.5, color: '#00e5b4' },
    ];

    // Microbubbles flowing through vessels
    const bubbles = [];
    vessels.forEach((v, vi) => {
      for (let i = 0; i < 8; i++) {
        bubbles.push({ vessel: vi, t: Math.random(), speed: 0.003 + Math.random() * 0.004 });
      }
    });

    // Accumulated track image
    const trackCanvas = document.createElement('canvas');
    trackCanvas.width = W; trackCanvas.height = H;
    const tCtx = trackCanvas.getContext('2d');

    function lerpVessel(pts, t) {
      const seg = t * (pts.length - 1);
      const i = Math.min(Math.floor(seg), pts.length - 2);
      const f = seg - i;
      return [
        (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f) * W,
        (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f) * H
      ];
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#050010');
      bg.addColorStop(1, '#0a001a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Fade tracks over time
      tCtx.fillStyle = 'rgba(0,0,0,0.008)';
      tCtx.fillRect(0, 0, W, H);

      bubbles.forEach(b => {
        b.t += b.speed;
        if (b.t > 1) b.t -= 1;

        const v = vessels[b.vessel];
        const [x, y] = lerpVessel(v.pts, b.t);

        // Draw track accumulation
        tCtx.beginPath();
        tCtx.arc(x, y, 1, 0, Math.PI * 2);
        tCtx.fillStyle = v.color + 'aa';
        tCtx.fill();

        // Live bubble
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, v.color + 'cc');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });

      ctx.drawImage(trackCanvas, 0, 0);

      t++;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // Photoacoustics
  (function paCanvas() {
    const c = document.getElementById('canvas-pa');
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const W = c.width, H = c.height;
    let t = 0;
    let pulses = [];

    function addPulse() {
      const x = W * 0.3 + Math.random() * W * 0.4;
      const y = H * 0.2 + Math.random() * H * 0.5;
      pulses.push({ x, y, r: 0, maxR: H * 0.6, alpha: 0.8, color: '#ff3fa4' });
    }
    addPulse();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#150a00');
      bg.addColorStop(1, '#1a0500');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Laser beam (illumination)
      const lx = W * 0.5;
      const lg = ctx.createLinearGradient(lx - 3, 0, lx + 3, 0);
      lg.addColorStop(0, 'transparent');
      lg.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
      lg.addColorStop(1, 'transparent');
      ctx.fillStyle = lg;
      ctx.fillRect(lx - 3, 0, 6, H * 0.6);

      // PA pulses
      pulses.forEach((p, idx) => {
        p.r += 1.5;
        p.alpha = 0.8 * (1 - p.r / p.maxR);
        if (p.r > p.maxR) {
          pulses.splice(idx, 1);
          addPulse();
          return;
        }

        // Outer ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 63, 164, ${p.alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 0.3);
        g.addColorStop(0, `rgba(255, 63, 164, ${p.alpha * 0.3})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Absorption source
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 150, 0, ${p.alpha})`;
        ctx.fill();
      });

      // Wavelength ruler
      for (let i = 0; i < W; i += 10) {
        const y2 = H - 20 + 3 * Math.sin((i / W) * Math.PI * 8 + t * 0.05);
        ctx.beginPath();
        ctx.arc(i, y2, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 63, 164, 0.2)`;
        ctx.fill();
      }

      t++;
      requestAnimationFrame(draw);
    }
    draw();
  })();
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initProjectCanvases();

  // Typewriter on hero
  const roleEl = document.getElementById('hero-role-text');
  if (roleEl) {
    typewriter(roleEl, [
      'Bioimaging Researcher @ OU',
      'OCT & Photoacoustic Imaging',
      'Ultrasound Localization Microscopy',
      'Organ Transplant Evaluation',
      'Seeking PhD Positions 2026'
    ], { typeSpeed: 50, deleteSpeed: 25, pauseEnd: 2200 });
  }
});
