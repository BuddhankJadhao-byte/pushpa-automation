/**
 * Pushpa Automation & Robotics Industries
 * Red/White/Black Interactive Laser Canvas & Telemetry Oscilloscope Engine
 */

class SensorEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0, isDown: false, speed: 0, isHoveringClickable: false };
    // 3-Point Synchronized Tracers (Traced Three)
    this.tracers = [
      { x: -1000, y: -1000, radius: 4, color: '#ff003c', alpha: 1.0, lag: 0.55 },
      { x: -1000, y: -1000, radius: 3, color: '#38bdf8', alpha: 0.85, lag: 0.25 },
      { x: -1000, y: -1000, radius: 2, color: '#fbbf24', alpha: 0.70, lag: 0.12 }
    ];
    this.clickRipples = [];
    this.laserSparks = [];
    this.radarAngle = 0;
    this.oscCanvas = null;
    this.oscCtx = null;
    this.oscPhase = 0;
    this.shockwaves = [];
    this.isHudActive = true;
    this.sensorReadings = {
      proximityMm: 12.4,
      fluxLux: 742,
      vibrationG: 0.12,
      currentAmps: 4.8,
      deltaHz: 50.0
    };

    this.init();
  }

  init() {
    window.addEventListener('DOMContentLoaded', () => {
      this.setupBackgroundCanvas();
      this.setupOscilloscope();
      this.setupEventListeners();
      this.animate();
    });
  }

  setupBackgroundCanvas() {
    this.canvas = document.getElementById('sensor-canvas-bg');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this.createParticles();

    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 12000), 110);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        size: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.35 + 0.15,
        active: 0,
        type: Math.random() > 0.6 ? 'laser_node' : 'flux_node'
      });
    }
  }

  setupOscilloscope() {
    this.oscCanvas = document.getElementById('telemetry-oscilloscope');
    if (this.oscCanvas) {
      this.oscCtx = this.oscCanvas.getContext('2d');
      this.oscCanvas.width = this.oscCanvas.offsetWidth || 340;
      this.oscCanvas.height = this.oscCanvas.offsetHeight || 140;
    }
  }

  setupEventListeners() {
    window.addEventListener('mousemove', (e) => {
      const dx = e.clientX - this.mouse.lastX;
      const dy = e.clientY - this.mouse.lastY;
      this.mouse.speed = Math.sqrt(dx * dx + dy * dy);
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Update HUD telemetry
      this.updateHudTelemetry();
    });

    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.triggerShockwave(e.clientX, e.clientY);
      if (window.soundFX) window.soundFX.click();
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  triggerShockwave(x, y) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 6,
      maxRadius: 220,
      alpha: 0.9,
      speed: 9
    });
  }

  updateHudTelemetry() {
    const coordsEl = document.getElementById('hud-coords');
    const proxEl = document.getElementById('hud-proximity');
    const fluxEl = document.getElementById('hud-flux');
    const speedEl = document.getElementById('hud-speed');

    const prox = Math.max(1.2, (150 - Math.min(148, this.mouse.speed * 2.5))).toFixed(1);
    const flux = Math.floor(400 + (this.mouse.x / (window.innerWidth || 1)) * 500);
    const speedKmh = (this.mouse.speed * 0.15).toFixed(1);

    if (coordsEl) coordsEl.textContent = `X:${Math.round(this.mouse.x)} Y:${Math.round(this.mouse.y)}`;
    if (proxEl) proxEl.textContent = `${prox} mm`;
    if (fluxEl) fluxEl.textContent = `${flux} Lux`;
    if (speedEl) speedEl.textContent = `${speedKmh} m/s`;
  }

  drawBackgroundGrid() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Intense Red / Carbon Industrial Grid
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 64;

    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Laser cursor proximity beacon
    if (this.mouse.x > 0 && this.mouse.y > 0) {
      const grad = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 5,
        this.mouse.x, this.mouse.y, 240
      );
      grad.addColorStop(0, 'rgba(255, 0, 60, 0.18)');
      grad.addColorStop(0.5, 'rgba(255, 30, 83, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, 240, 0, Math.PI * 2);
      ctx.fill();

      // Sensor Target Reticle
      ctx.strokeStyle = 'rgba(255, 0, 60, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Reticle Crosshairs
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.mouse.x - 14, this.mouse.y);
      ctx.lineTo(this.mouse.x + 14, this.mouse.y);
      ctx.moveTo(this.mouse.x, this.mouse.y - 14);
      ctx.lineTo(this.mouse.x, this.mouse.y + 14);
      ctx.stroke();
    }

    // Shockwaves (Red Alert Pulses)
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha *= 0.93;

      ctx.strokeStyle = `rgba(255, 0, 60, ${sw.alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Second white inner ripple
      ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Particles & Laser links
    const maxDist = 135;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Distance to mouse
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const distMouse = Math.sqrt(dx * dx + dy * dy);

      if (distMouse < 190) {
        p.active = Math.min(1, p.active + 0.08);
        // Laser beam connection to cursor
        ctx.strokeStyle = `rgba(255, 0, 60, ${(1 - distMouse / 190) * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(this.mouse.x, this.mouse.y);
        ctx.stroke();
      } else {
        p.active = Math.max(0, p.active - 0.02);
      }

      // Draw particle
      ctx.fillStyle = p.type === 'laser_node' 
        ? `rgba(255, 0, 60, ${p.baseAlpha + p.active * 0.6})`
        : `rgba(255, 255, 255, ${p.baseAlpha + p.active * 0.5})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size + (p.active * 1.5), 0, Math.PI * 2);
      ctx.fill();

      // Inter-particle links
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dxx = p.x - p2.x;
        const dyy = p.y - p2.y;
        const dist = Math.sqrt(dxx * dxx + dyy * dyy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.14 * (1 + (p.active + p2.active) * 1.5);
          ctx.strokeStyle = `rgba(255, 0, 60, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  drawOscilloscope() {
    if (!this.oscCtx || !this.oscCanvas) {
      this.setupOscilloscope();
      if (!this.oscCtx) return;
    }

    const ctx = this.oscCtx;
    const w = this.oscCanvas.width;
    const h = this.oscCanvas.height;

    ctx.fillStyle = 'rgba(6, 6, 12, 0.45)';
    ctx.fillRect(0, 0, w, h);

    // Center grid line
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Wave 1: Primary Sensor Waveform (Vibration RTD Sensor in Intense Red)
    this.oscPhase += 0.06 + (this.mouse.speed * 0.003);
    const speedBoost = Math.min(26, this.mouse.speed * 0.8);

    ctx.strokeStyle = '#ff003c';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#ff003c';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const normX = x / w;
      const wave = Math.sin(normX * 16 + this.oscPhase) * (18 + speedBoost)
                 + Math.sin(normX * 32 - this.oscPhase * 1.5) * (6 + speedBoost * 0.3)
                 + (Math.random() - 0.5) * 2.5;
      const y = h / 2 + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Wave 2: Secondary Current Load (Crisp Pure White)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let x = 0; x < w; x += 2) {
      const normX = x / w;
      const wave = Math.cos(normX * 10 - this.oscPhase * 0.8) * 12;
      const y = h / 2 + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  animate() {
    this.drawBackgroundGrid();
    this.updateAndDraw3PointTracers(this.ctx);
    this.drawOscilloscope();
    this.mouse.speed *= 0.92;
    requestAnimationFrame(() => this.animate());
  }


  triggerClickShockwave(x, y) {
    // 3 Concentric Shockwave Rings (Traced Three Waves)
    for (let i = 0; i < 3; i++) {
      this.clickRipples.push({
        x: x,
        y: y,
        radius: 4,
        maxRadius: 60 + i * 35,
        speed: 3.5 + i * 1.5,
        opacity: 0.9 - i * 0.2,
        color: i === 0 ? '#ff003c' : (i === 1 ? '#38bdf8' : '#fbbf24')
      });
    }

    // 12 Radiant Laser Sparks
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.4;
      const spd = 2.5 + Math.random() * 4.5;
      this.laserSparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? '#ff003c' : '#38bdf8'
      });
    }
  }

  updateAndDraw3PointTracers(ctx) {
    if (this.mouse.x <= 0 || this.mouse.y <= 0) return;

    // Update 3 Tracer Positions with physics interpolation
    this.tracers[0].x += (this.mouse.x - this.tracers[0].x) * this.tracers[0].lag;
    this.tracers[0].y += (this.mouse.y - this.tracers[0].y) * this.tracers[0].lag;

    this.tracers[1].x += (this.tracers[0].x - this.tracers[1].x) * this.tracers[1].lag;
    this.tracers[1].y += (this.tracers[0].y - this.tracers[1].y) * this.tracers[1].lag;

    this.tracers[2].x += (this.tracers[1].x - this.tracers[2].x) * this.tracers[2].lag;
    this.tracers[2].y += (this.tracers[1].y - this.tracers[2].y) * this.tracers[2].lag;

    // 1. Draw Connecting Laser Vector Lines between the 3 tracer nodes
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.tracers[0].x, this.tracers[0].y);
    ctx.lineTo(this.tracers[1].x, this.tracers[1].y);
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.45)';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.tracers[1].x, this.tracers[1].y);
    ctx.lineTo(this.tracers[2].x, this.tracers[2].y);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.stroke();

    // 2. Draw Tracer 3 (Aura Trail)
    ctx.beginPath();
    ctx.arc(this.tracers[2].x, this.tracers[2].y, this.tracers[2].radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.tracers[2].x, this.tracers[2].y, this.tracers[2].radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // 3. Draw Tracer 2 (Secondary Orbital Sensor)
    ctx.beginPath();
    ctx.arc(this.tracers[1].x, this.tracers[1].y, this.tracers[1].radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.tracers[1].x, this.tracers[1].y, this.tracers[1].radius, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // 4. Draw Tracer 1 (Lead Core Reticle & Diamond Target)
    const t1 = this.tracers[0];
    const isHover = this.mouse.isHoveringClickable;
    const coreR = isHover ? 8 : 4.5;

    ctx.beginPath();
    ctx.arc(t1.x, t1.y, coreR + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(t1.x, t1.y, coreR, 0, Math.PI * 2);
    ctx.fillStyle = '#ff003c';
    ctx.shadowColor = '#ff003c';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crosshair Lines
    const reticleLen = isHover ? 14 : 9;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(t1.x - reticleLen, t1.y); ctx.lineTo(t1.x - 3, t1.y);
    ctx.moveTo(t1.x + 3, t1.y); ctx.lineTo(t1.x + reticleLen, t1.y);
    ctx.moveTo(t1.x, t1.y - reticleLen); ctx.lineTo(t1.x, t1.y - 3);
    ctx.moveTo(t1.x, t1.y + 3); ctx.lineTo(t1.x, t1.y + reticleLen);
    ctx.stroke();

    // 5. Draw & Update Click Shockwaves
    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const rip = this.clickRipples[i];
      rip.radius += rip.speed;
      rip.opacity -= 0.022;

      if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
        this.clickRipples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color;
      ctx.globalAlpha = Math.max(0, rip.opacity);
      ctx.lineWidth = 2;
      ctx.shadowColor = rip.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw & Update Laser Sparks
    for (let i = this.laserSparks.length - 1; i >= 0; i--) {
      const spk = this.laserSparks[i];
      spk.x += spk.vx;
      spk.y += spk.vy;
      spk.vy += 0.08; // subtle gravity
      spk.life -= spk.decay;

      if (spk.life <= 0) {
        this.laserSparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(spk.x, spk.y, 2 * spk.life, 0, Math.PI * 2);
      ctx.fillStyle = spk.color;
      ctx.globalAlpha = spk.life;
      ctx.shadowColor = spk.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

}


window.sensorEngine = new SensorEngine();
