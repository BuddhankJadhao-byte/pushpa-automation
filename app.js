/**
 * Pushpa Automation & Robotics Industries
 * Apple Pro / Teenage Engineering Bento Interactive Controller Engine
 * Features: Floating Brand Intro Reveal, High-Resolution Product Photography, 100% Clickable Interactive Bento System, Silky Scroll Popups
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Audio Unlock on first interaction
  const unlockAudio = () => {
    if (window.soundFX) window.soundFX.init();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });

  // Initialize Modules
  initBrandIntroAnimation();
  initHeroHudMorphism();
  initBentoSpotlight();
  initSensorLab();
  initFacilityWalkthrough();
  initProductsDirectory();
  initQuoteCalculator();
  initAudioControls();
  initContactForm();
  initModalListeners();
  initAllClickableCards();
  initFooterInteractiveSection();
  initScrollPopups();
  initStatsTicker();
});

/* ==========================================================================
   1. CINEMATIC FLOATING BRAND INTRO OVERLAY REVEAL
   ========================================================================== */
function initBrandIntroAnimation() {
  const overlay = document.getElementById('brand-intro-overlay');
  const progressFill = document.getElementById('intro-progress-fill');
  const logoReplay = document.getElementById('header-brand-logo');

  if (!overlay) return;

  // Start progress bar animation
  setTimeout(() => {
    if (progressFill) progressFill.style.width = '100%';
  }, 100);

  function dismissIntro() {
    overlay.classList.add('hidden');
    if (window.soundFX) window.soundFX.click();
  }

  // Auto dismiss after 1.4s
  const autoTimer = setTimeout(() => {
    dismissIntro();
  }, 1400);

  // Instant dismiss on click or keypress
  overlay.addEventListener('click', () => {
    clearTimeout(autoTimer);
    dismissIntro();
  });

  window.addEventListener('keydown', () => {
    if (!overlay.classList.contains('hidden')) {
      clearTimeout(autoTimer);
      dismissIntro();
    }
  }, { once: true });

  // Replay brand intro on header logo click
  if (logoReplay) {
    logoReplay.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.remove('hidden');
      if (progressFill) {
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        void progressFill.offsetWidth;
        progressFill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        progressFill.style.width = '100%';
      }
      setTimeout(() => {
        dismissIntro();
      }, 1400);
      if (window.soundFX) window.soundFX.click();
    });
  }
}

/* ==========================================================================
   2. HERO COMMAND HUD (CIRCUIT-GLOW HUD MORPHISM & LIVE TELEMETRY)
   ========================================================================== */
function initHeroHudMorphism() {
  const heroSection = document.getElementById('hero');
  const circuitCanvas = document.getElementById('hero-circuit-canvas');
  const waveCanvas = document.getElementById('hero-wave-canvas');
  const tiltPanels = document.querySelectorAll('[data-tilt-panel]');

  const valVoltage = document.getElementById('live-telemetry-voltage');
  const valFreq = document.getElementById('live-telemetry-freq');
  const valRpm = document.getElementById('live-telemetry-rpm');
  const valAmps = document.getElementById('live-telemetry-amps');

  const modeButtons = document.querySelectorAll('.scada-mode-btn');

  let currentMode = 'normal';
  let targetFreq = 50.0;
  let targetVoltage = 415.4;
  let targetRpm = 1500;
  let targetAmps = 8.84;

  let mousePos = { x: 0.5, y: 0.5 };

  // 0. Typing Animation for Main Headline
  const typingTextEl = document.getElementById('typing-text');
  if (typingTextEl) {
    const plain = 'INDUSTRIAL PLC & SCADA CONTROL PANELS';
    typingTextEl.innerHTML = '';
    let idx = 0;
    const speed = 36;

    function typeChar() {
      idx++;
      if (idx <= plain.length) {
        if (idx <= 23) {
          typingTextEl.textContent = plain.substring(0, idx);
        } else {
          const part1 = plain.substring(0, 23);
          const part2 = plain.substring(23, idx);
          typingTextEl.innerHTML = `${part1}<span class="phosphor-text">${part2}</span>`;
        }
        setTimeout(typeChar, speed);
      } else {
        typingTextEl.innerHTML = 'INDUSTRIAL PLC &amp; SCADA <span class="phosphor-text">CONTROL PANELS</span>';
      }
    }

    setTimeout(typeChar, 180);
  }

  // 1. Mouse Parallax & 3D Perspective Tilt on Panels
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mousePos.x = (e.clientX - rect.left) / rect.width;
      mousePos.y = (e.clientY - rect.top) / rect.height;

      tiltPanels.forEach(panel => {
        const pRect = panel.getBoundingClientRect();
        const pCenterX = pRect.left + pRect.width / 2;
        const pCenterY = pRect.top + pRect.height / 2;
        const deltaX = (e.clientX - pCenterX) / (pRect.width / 2);
        const deltaY = (e.clientY - pCenterY) / (pRect.height / 2);

        // Clamped tilt angles (max 6 degrees)
        const tiltX = (-deltaY * 5).toFixed(2);
        const tiltY = (deltaX * 5).toFixed(2);

        // Proximity glow calculation
        const dist = Math.hypot(e.clientX - pCenterX, e.clientY - pCenterY);
        const glowVal = Math.max(0.18, Math.min(0.55, 1 - dist / 600)).toFixed(2);

        panel.style.setProperty('--tilt-x', `${tiltX}deg`);
        panel.style.setProperty('--tilt-y', `${tiltY}deg`);
        panel.style.setProperty('--glow-border', glowVal);
      });
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      tiltPanels.forEach(panel => {
        panel.style.setProperty('--tilt-x', '0deg');
        panel.style.setProperty('--tilt-y', '0deg');
        panel.style.setProperty('--glow-border', '0.18');
      });
    });
  }

  // 2. Background Parallax Circuit Grid Canvas
  if (circuitCanvas) {
    const ctx = circuitCanvas.getContext('2d');
    let cWidth = (circuitCanvas.width = heroSection ? heroSection.clientWidth : window.innerWidth);
    let cHeight = (circuitCanvas.height = heroSection ? heroSection.clientHeight : 600);

    window.addEventListener('resize', () => {
      if (!heroSection) return;
      cWidth = circuitCanvas.width = heroSection.clientWidth;
      cHeight = circuitCanvas.height = heroSection.clientHeight;
    }, { passive: true });

    // Procedural circuit nodes
    const nodes = [];
    for (let i = 0; i < 28; i++) {
      nodes.push({
        x: Math.random() * cWidth,
        y: Math.random() * cHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI * 2
      });
    }

    function renderCircuitBg() {
      if (!ctx) return;
      ctx.clearRect(0, 0, cWidth, cHeight);

      const offsetX = (mousePos.x - 0.5) * 30;
      const offsetY = (mousePos.y - 0.5) * 20;

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 48;
      for (let x = (offsetX % step); x < cWidth; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cHeight);
        ctx.stroke();
      }
      for (let y = (offsetY % step); y < cHeight; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cWidth, y);
        ctx.stroke();
      }

      // Draw nodes & interconnect traces
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.03;

        if (n.x < 0) n.x = cWidth;
        if (n.x > cWidth) n.x = 0;
        if (n.y < 0) n.y = cHeight;
        if (n.y > cHeight) n.y = 0;

        const posX = n.x + offsetX * 0.6;
        const posY = n.y + offsetY * 0.6;

        ctx.fillStyle = `rgba(0, 240, 255, ${0.28 + Math.sin(n.pulse) * 0.22})`;
        ctx.beginPath();
        ctx.arc(posX, posY, n.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const d = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - d / 120) * 0.14})`;
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(n2.x + offsetX * 0.6, n2.y + offsetY * 0.6);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderCircuitBg);
    }
    renderCircuitBg();
  }

  // 3. Genuine Dynamic Ticking Intervals for Telemetry Numbers
  setInterval(() => {
    if (document.hidden) return;

    // Micro jitter around nominal values
    const vJitter = (Math.random() - 0.5) * 0.6;
    const fJitter = (Math.random() - 0.5) * 0.04;
    const rJitter = Math.round((Math.random() - 0.5) * 6);
    const aJitter = (Math.random() - 0.5) * 0.12;

    const curV = (targetVoltage + vJitter).toFixed(1);
    const curF = (targetFreq + fJitter).toFixed(2);
    const curR = Math.round(targetRpm + rJitter);
    const curA = (targetAmps + aJitter).toFixed(2);

    if (valVoltage) valVoltage.textContent = `${curV} V`;
    if (valFreq) valFreq.textContent = `${curF} Hz`;
    if (valRpm) valRpm.textContent = `${curR.toLocaleString()} RPM`;
    if (valAmps) valAmps.textContent = `${curA} A`;
  }, 900);

  // 4. Live 60FPS Signal Oscillograph Canvas
  if (waveCanvas) {
    const wCtx = waveCanvas.getContext('2d');
    let phase = 0;

    function renderOscillograph() {
      if (!wCtx) return;
      const w = waveCanvas.width;
      const h = waveCanvas.height;

      wCtx.fillStyle = '#02060e';
      wCtx.fillRect(0, 0, w, h);

      // Grid lines
      wCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      wCtx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        wCtx.beginPath();
        wCtx.moveTo(x, 0);
        wCtx.lineTo(x, h);
        wCtx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        wCtx.beginPath();
        wCtx.moveTo(0, y);
        wCtx.lineTo(w, y);
        wCtx.stroke();
      }

      // Center baseline
      wCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      wCtx.beginPath();
      wCtx.moveTo(0, h / 2);
      wCtx.lineTo(w, h / 2);
      wCtx.stroke();

      const speedMultiplier = currentMode === 'boost' ? 1.4 : 1.0;
      phase += 0.06 * speedMultiplier;

      // CH1: Flux Wave (Electric Cyan)
      wCtx.strokeStyle = '#00f0ff';
      wCtx.lineWidth = 2;
      wCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const freqRatio = (targetFreq / 50.0);
        const y = h / 2 + Math.sin(x * 0.04 * freqRatio + phase) * 28 + Math.sin(x * 0.08 + phase * 1.5) * 6;
        if (x === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
      }
      wCtx.stroke();

      // CH2: Current Wave (Ice Blue)
      wCtx.strokeStyle = '#38bdf8';
      wCtx.lineWidth = 1.5;
      wCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const freqRatio = (targetFreq / 50.0);
        const y = h / 2 + Math.sin(x * 0.04 * freqRatio + phase + Math.PI / 3) * 20;
        if (x === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
      }
      wCtx.stroke();

      requestAnimationFrame(renderOscillograph);
    }
    renderOscillograph();
  }

  // 5. Mode Selector Buttons Interactivity
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode || 'normal';

      if (currentMode === 'boost') {
        targetFreq = 60.0;
        targetRpm = 1800;
        targetVoltage = 422.0;
        targetAmps = 10.45;
      } else if (currentMode === 'sync') {
        targetFreq = 50.0;
        targetRpm = 1500;
        targetVoltage = 415.0;
        targetAmps = 8.50;
      } else {
        targetFreq = 50.0;
        targetRpm = 1498;
        targetVoltage = 415.4;
        targetAmps = 8.84;
      }

      if (window.soundFX && typeof window.soundFX.click === 'function') {
        window.soundFX.click();
      }
    });
  });
}

/* ==========================================================================
   3. BENTO CARDS SPOTLIGHT GLOW
   ========================================================================== */
function initBentoSpotlight() {
  const cards = document.querySelectorAll('.bento-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   4. SENSOR LAB SANDBOX
   ========================================================================== */
function initSensorLab() {
  const proxSlider = document.getElementById('lab-prox-slider');
  const proxDist = document.getElementById('lab-prox-dist');
  const proxLed = document.getElementById('lab-prox-led');
  const proxRelay = document.getElementById('lab-prox-relay');
  const targetSlug = document.getElementById('lab-metal-target');

  if (proxSlider) {
    proxSlider.addEventListener('input', (e) => {
      const dist = parseFloat(e.target.value);
      if (proxDist) proxDist.textContent = `${dist.toFixed(1)} mm`;

      if (targetSlug) {
        const leftPos = Math.max(30, 200 - dist * 7);
        targetSlug.style.left = `${leftPos}px`;
      }

      if (dist <= 8.0) {
        if (proxLed) proxLed.style.background = '#10b981';
        if (proxRelay) {
          proxRelay.textContent = 'NO -> CLOSED (ACTIVE)';
          proxRelay.style.color = '#10b981';
        }
        if (window.soundFX) window.soundFX.sensorTrigger();
      } else {
        if (proxLed) proxLed.style.background = '#444';
        if (proxRelay) {
          proxRelay.textContent = 'NO - OPEN (IDLE)';
          proxRelay.style.color = '#cbd5e1';
        }
      }
    });
  }
}

/* ==========================================================================
   5. PRODUCTS DIRECTORY & REAL PRODUCT PHOTOGRAPHY
   ========================================================================== */
/* ==========================================================================
   5. PRODUCTS DIRECTORY & INTERACTIVE HARDWARE SPEC MATRIX
   ========================================================================== */
const PRODUCTS_DATA = [
  {
    id: 'plc-hmi-panel',
    name: 'PLC HMI Automated Control Panel',
    category: 'plc',
    oem: 'DELTA / SIEMENS',
    status: 'READY IN 48-72 HRS',
    voltage: '415V 3-PHASE',
    enclosure: 'IP65 CRCA',
    warranty: '1-YR WARRANTY',
    image: 'images/plc_hmi_panel.jpg',
    priceDisplay: '₹45,000.00',
    shortDesc: 'Delta / Siemens 32-bit SoC CPU paired with 7-inch Color Touchscreen HMI, optical isolation, and pre-programmed ladder automation logic.',
    specs: [
      'CPU Microcontroller: Delta AS Series 32-bit SoC or Siemens S7-1200 CPU',
      'HMI Operator Display: 7.0" TFT High-Res Color Touchscreen (IP65 front bezel)',
      'Digital I/O Channels: 16 Optocoupler-Isolated Inputs / 16 Relay Outputs',
      'Analog Instrumentation: 4 Channels 4-20mA / 0-10V DC for RTD/Pressure sensors',
      'Cabinet Enclosure: 14-Gauge CRCA Sheet Steel, RAL 7035 Powder Coated with PU Gasket',
      'Switchgear Protection: Siemens / L&T Thermal Magnetic Circuit Breakers + 24V PSU'
    ]
  },
  {
    id: 'vfd-heavy-panel',
    name: 'Heavy Duty VFD Motion Panel',
    category: 'vfd',
    oem: 'DELTA MS300 / SCHNEIDER',
    status: 'IN STOCK - MIDC',
    voltage: '415V 3-PHASE',
    enclosure: 'IP55 DUAL FAN',
    warranty: '1-YR WARRANTY',
    image: 'images/vfd_heavy_panel.jpg',
    priceDisplay: '₹45,000.00',
    shortDesc: 'Precision Variable Frequency Drive panel for high torque industrial motors with dynamic braking resistor and thermal safety interlocks.',
    specs: [
      'Motor Power Range: 15 HP to 30 HP AC Induction Motor Drives',
      'VFD Drive Core: Delta MS300 / C2000 Plus or Schneider Altivar 320',
      'Dynamic Braking: Aluminum Cased Braking Resistor with Overheat Protection',
      'Thermal Management: Dual Ball-Bearing High CFM Exhaust Fans with Louvered Filters',
      'Operator Controls: Door-Mounted Speed Potentiometer, FWD/REV Selector, E-STOP'
    ]
  },
  {
    id: 'vfd-standard-panel',
    name: 'Compact VFD Speed Panel',
    category: 'vfd',
    oem: 'DELTA / ABB',
    status: 'READY IN 24-48 HRS',
    voltage: '415V 3-PHASE',
    enclosure: 'IP54 COMPACT',
    warranty: '1-YR WARRANTY',
    image: 'images/vfd_heavy_panel.jpg',
    priceDisplay: '₹25,000.00',
    shortDesc: 'Compact motor speed regulation panel with instant digital frequency readout, line choke, and emergency trip contactor.',
    specs: [
      'Motor Power Range: 0.5 HP to 7.5 HP 3-Phase 415V AC Motors',
      'Digital Readout: 4-Digit High-Visibility LED Frequency / RPM Display',
      'Switchgear Integration: MCB + Magnetic Contactor + Overload Relay Assembly',
      'Enclosure: Wall-Mount Powder Coated CRCA Cabinet with Rubber Cable Glands'
    ]
  },
  {
    id: 'star-delta-50hp',
    name: '50 HP Heavy Star Delta Starter Panel',
    category: 'stardelta',
    oem: 'L&T SWITCHGEAR / SIEMENS',
    status: 'IN STOCK - MIDC',
    voltage: '415V 50HZ',
    enclosure: 'IP55 CRCA',
    warranty: '1-YR WARRANTY',
    image: 'images/star_delta_panel.jpg',
    priceDisplay: '₹4,00,000.00',
    shortDesc: 'Premium high-tension industrial motor starter panel engineered with heavy L&T/Siemens air-break contactors and electrolytic copper busbars.',
    specs: [
      'Motor Starting Capacity: 50 HP (37 kW) Continuous Heavy Duty Inrush Handling',
      'Switchgear: 3x L&T ML Series Air Break Contactors + Electronic Star-Delta Timer',
      'Busbar System: Electrolytic Grade High Conductivity Tinned Copper Busbars',
      'Multifunction Meter: Microprocessor Digital Meter (Voltage, Amps, PF, kW, kWh)',
      'Protection Suite: Single Phase Preventer, Phase Reversal, Under/Over Voltage'
    ]
  },
  {
    id: 'star-delta-standard',
    name: 'Standard Star Delta Motor Starter',
    category: 'stardelta',
    oem: 'L&T / SCHNEIDER',
    status: 'READY IN 24 HRS',
    voltage: '415V 50HZ',
    enclosure: 'IP54 STEEL',
    warranty: '1-YR WARRANTY',
    image: 'images/star_delta_panel.jpg',
    priceDisplay: '₹18,000.00',
    shortDesc: 'Automatic Star-Delta reduction panel designed for smooth starting torque, reduced grid surge, and reliable pump/compressor operation.',
    specs: [
      'Motor Rating: 7.5 HP to 15 HP 3-Phase Induction Motors',
      'Contactors: Heavy Duty 3-Pole Power Contactors with Silver Alloy Contacts',
      'Timer: Precision Solid-State Adjustable Transition Timer (0.5 to 30 sec)',
      'Enclosure: IP54 Wall Mounting Sheet Metal Enclosure with Hinged Door'
    ]
  },
  {
    id: 'flame-proof-panel',
    name: 'Flame Proof Industrial Panel (Ex-d)',
    category: 'specialty',
    oem: 'CIMFR / PESO CERTIFIED',
    status: 'CUSTOM FABRICATION',
    voltage: '415V / 230V',
    enclosure: 'IP66 CAST ALLOY',
    warranty: '1-YR WARRANTY',
    image: 'images/flameproof_panel.jpg',
    priceDisplay: '₹55,000.00',
    shortDesc: 'CIMFR/PESO certified explosion-proof control enclosure for hazardous chemical processing plants, refineries, and paint booth zones.',
    specs: [
      'Hazardous Classification: Zone 1, Zone 2, Gas Groups IIA, IIB & IIC',
      'Chassis Material: Heavy Cast Aluminium LM6 Alloy or SS316 Stainless Steel',
      'Hardware: Flameproof Pushbuttons, Neoprene O-Ring Weatherproof Seal (IP66)',
      'Certification: Compliant with IS/IEC 60079-0 and 60079-1 standards'
    ]
  },
  {
    id: 'delta-as-plc',
    name: 'Delta AS Series Compact PLC',
    category: 'sensors',
    oem: 'DELTA ELECTRONICS',
    status: 'IN STOCK - MIDC',
    voltage: '24V DC / 230V AC',
    enclosure: 'DIN RAIL MOUNT',
    warranty: '1-YR WARRANTY',
    image: 'images/delta_as_plc.jpg',
    priceDisplay: '₹16,500.00',
    shortDesc: 'High performance 32-bit SoC modular controller with built-in CANopen, Modbus RTU/TCP, and EtherNet/IP industrial protocol support.',
    specs: [
      'Processing Speed: 40k steps execution within 1.0 ms scan cycle',
      'Program Memory: 128k steps Ladder Logic / Structured Text',
      'Expansion Capacity: Up to 32 expansion modules (max 1,024 I/O points)',
      'Communication: Built-in Dual Ethernet Ports + RS-485 + Mini USB Programming'
    ]
  },
  {
    id: 'cnc-sensor-pack',
    name: 'CNC Machine Sensors Pack',
    category: 'sensors',
    oem: 'OMRON / AUTONICS COMPAT',
    status: 'IN STOCK - MIDC',
    voltage: '10-30V DC',
    enclosure: 'IP67 SEALED',
    warranty: '1-YR WARRANTY',
    image: 'images/industrial_sensors_pack.jpg',
    priceDisplay: '₹6,500.00',
    shortDesc: 'Complete sensor integration bundle including M18 shielded inductive proximity switches and optical laser diffuse limit sensors.',
    specs: [
      'Inductive Switches: 4x M18 PNP Normally Open (8.0mm sensing threshold, brass nickeled)',
      'Optical Sensors: 2x Diffuse Reflection Laser Sensors (300mm adjustable range)',
      'Environmental Protection: IP67 Oil, Coolant, and Vibration Resistant Housing',
      'Cabling: 2-meter Oil-Proof PVC Flexible Sheathed Core Leads'
    ]
  }
];

function initProductsDirectory() {
  const container = document.getElementById('products-grid-container');
  const filterPills = document.querySelectorAll('.filter-pill');

  if (!container) return;

  function render(category = 'all') {
    container.innerHTML = '';
    const filtered = category === 'all' ? PRODUCTS_DATA : PRODUCTS_DATA.filter(p => p.category === category);

    filtered.forEach((prod, idx) => {
      const card = document.createElement('div');
      card.className = 'product-hardware-card scroll-reveal';
      card.style.setProperty('--reveal-delay', `${(idx % 4) * 80}ms`);
      card.setAttribute('data-id', prod.id);

      card.innerHTML = `
        <div class="product-card-header">
          <span class="product-category-chip">${prod.category.toUpperCase()}</span>
          <span class="product-oem-chip">${prod.oem}</span>
        </div>

        <div class="product-photo-box">
          <img src="${prod.image}" alt="${prod.name}" class="product-photo-img" loading="lazy">
          <span class="product-status-pill">${prod.status}</span>
        </div>

        <h3 class="product-name">${prod.name}</h3>
        <p class="product-desc">${prod.shortDesc}</p>

        <!-- Debossed Micro Parameters Row -->
        <div class="product-params-row">
          <div class="product-param-cell">
            <span class="param-k">VOLTAGE</span>
            <span class="param-v">${prod.voltage}</span>
          </div>
          <div class="product-param-cell">
            <span class="param-k">HOUSING</span>
            <span class="param-v">${prod.enclosure}</span>
          </div>
          <div class="product-param-cell">
            <span class="param-k">WARRANTY</span>
            <span class="param-v">${prod.warranty}</span>
          </div>
        </div>

        <!-- Inline Expandable Technical Spec Drawer -->
        <div class="product-spec-drawer-wrapper" id="drawer-${prod.id}">
          <div class="product-spec-drawer-inner">
            <div class="product-spec-drawer">
              <div class="drawer-title">
                <span>◈</span> FACTORY TECHNICAL SPECIFICATIONS
              </div>
              <ul class="drawer-specs-list">
                ${prod.specs.map(s => `<li>${s}</li>`).join('')}
              </ul>
              <div class="drawer-cta-row">
                <a href="https://wa.me/917972741546?text=${encodeURIComponent(`Hello Pushpa Automation, I want a formal quote & datasheet for ${prod.name} (${prod.priceDisplay}).`)}" target="_blank" rel="noopener" class="btn-hud-primary" style="padding:10px 16px; font-size:0.75rem;">
                  Transmit RFQ via WhatsApp ➔
                </a>
                <a href="#calculator" class="btn-hud-secondary" style="padding:10px 14px; font-size:0.75rem;" onclick="document.getElementById('calc-panel-type') && (document.getElementById('calc-panel-type').value = '${prod.category === 'plc' ? 'plc_hmi' : prod.category === 'vfd' ? 'vfd' : prod.category === 'stardelta' ? 'stardelta' : 'plc_hmi'}');">
                  Customize in Calculator ➔
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bar with Price & Spec Toggle -->
        <div class="product-card-footer">
          <div class="product-price-block">
            <span class="price-sub">MIDC BHOSARI RATE</span>
            <span class="product-price-val">${prod.priceDisplay}</span>
          </div>
          <button class="btn-toggle-specs" data-drawer="drawer-${prod.id}">
            <span class="btn-toggle-text">Specs ▾</span>
          </button>
        </div>
      `;

      // Wire up toggle button
      const toggleBtn = card.querySelector('.btn-toggle-specs');
      const drawerWrapper = card.querySelector(`#drawer-${prod.id}`);
      const toggleText = card.querySelector('.btn-toggle-text');

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = drawerWrapper.classList.toggle('open');
        toggleText.textContent = isOpen ? 'Specs ▴' : 'Specs ▾';
        if (window.soundFX && typeof window.soundFX.click === 'function') {
          window.soundFX.click();
        }
      });

      container.appendChild(card);
    });

    if (window.refreshScrollReveals) {
      window.refreshScrollReveals(container);
    }
  }

  render('all');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      render(pill.dataset.filter);
      if (window.soundFX && typeof window.soundFX.click === 'function') {
        window.soundFX.click();
      }
    });
  });
}

function openSpecs(prodId) {
  const prod = PRODUCTS_DATA.find(p => p.id === prodId);
  if (!prod) return;

  const modal = document.getElementById('product-specs-modal');
  const content = document.getElementById('modal-specs-content');

  if (modal && content) {
    content.innerHTML = `
      <span class="section-pill" style="margin-bottom:12px;">${prod.category.toUpperCase()} SPECIFICATION</span>
      <img src="${prod.image}" alt="${prod.name}" class="modal-product-img">
      <h2 style="font-size:1.6rem; color:#ffffff; margin-bottom:8px;">${prod.name}</h2>
      <p style="color:var(--text-muted); margin-bottom:20px; font-size:0.95rem;">${prod.shortDesc}</p>

      <div style="background:#090a0e; padding:18px; border-radius:10px; border:1px solid var(--border-subtle); margin-bottom:24px;">
        <h4 style="font-family:var(--font-mono); font-size:0.8rem; color:var(--accent-red); margin-bottom:10px; text-transform:uppercase;">Engineering Specifications</h4>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:0.85rem; color:#ffffff;">
          ${prod.specs.map(s => `<li style="display:flex; gap:8px;"><span style="color:var(--accent-red);">▪</span> ${s}</li>`).join('')}
        </ul>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:18px;">
        <div>
          <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim);">MIDC BHOSARI RATE</span>
          <div style="font-family:var(--font-display); font-size:1.8rem; font-weight:800; color:#ffffff;">${prod.priceDisplay}</div>
        </div>
        <a href="https://wa.me/917972741546?text=${encodeURIComponent(`Hello Pushpa Automation, please share technical datasheet and formal quote for ${prod.name}.`)}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">
          Request Quote on WhatsApp ➔
        </a>
      </div>
    `;
    modal.classList.add('active');
    if (window.soundFX) window.soundFX.click();
  }
}

/* ==========================================================================
   6. MAKE EVERY TILE / CARD CLICKABLE & INTERACTIVE
   ========================================================================== */
function initAllClickableCards() {
  const modal = document.getElementById('product-specs-modal');
  const content = document.getElementById('modal-specs-content');

  function openCustomModal(html) {
    if (modal && content) {
      content.innerHTML = html;
      modal.classList.add('active');
      if (window.soundFX) window.soundFX.click();
    }
  }

  // 1. Hero Rating Pill Click
  const ratingPill = document.getElementById('hero-rating-trigger');
  if (ratingPill) {
    ratingPill.addEventListener('click', () => {
      openCustomModal(`
        <span class="section-pill">Google Verified Reputation</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">5.0 Star Rated Industrial Automation Leader</h2>
        <p style="color:var(--text-muted); margin-bottom:20px;">Based on 106+ verified reviews from automation heads, SPM manufacturers, and plant engineers across MIDC Bhosari and Pune.</p>
        <div style="background:#090a0e; padding:16px; border-radius:10px; border:1px solid var(--border-subtle); margin-bottom:20px;">
          <h4 style="color:var(--accent-red); font-family:var(--font-mono); font-size:0.8rem; margin-bottom:8px;">VERIFIED HIGHLIGHTS</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:6px; font-size:0.84rem; color:#ffffff;">
            <li>✓ 100% On-time commissioning and prompt breakdown service</li>
            <li>✓ Genuine Siemens, Delta, Schneider, and L&T switchgear</li>
            <li>✓ Comprehensive 1-year on-site factory warranty</li>
          </ul>
        </div>
        <a href="https://www.google.com/search?q=pushpa+automation+and+robotics+industries" target="_blank" rel="noopener" class="btn btn-primary btn-block">
          Open Google Maps & Read All 106 Reviews ↗
        </a>
      `);
    });
  }

  // 2. Clickable Metrics Boxes
  document.querySelectorAll('.clickable-metric').forEach(metric => {
    metric.addEventListener('click', () => {
      const type = metric.dataset.metric;
      let title = "1,500+ Control Panels Deployed";
      let text = "We have engineered and commissioned custom automation solutions for Tata Motors vendors, packaging plants, and steel mills.";
      if (type === 'rating') {
        title = "5.0 ★ Google Customer Rating";
        text = "Ranked among the highest rated industrial automation manufacturers in Pimpri-Chinchwad MIDC with 106+ reviews.";
      } else if (type === 'stock') {
        title = "100% MIDC Ready Stock Availability";
        text = "We maintain ready warehouse stock of Delta AS/DVP PLCs, MS300 VFD drives, touch HMIs, and inductive sensors for same-day dispatch.";
      }

      openCustomModal(`
        <span class="section-pill">MIDC Bhosari Facility Capabilities</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">${title}</h2>
        <p style="color:var(--text-muted); margin-bottom:20px;">${text}</p>
        <div style="display:flex; gap:10px;">
          <a href="tel:07972741546" class="btn btn-secondary btn-block">Call Hotline</a>
          <a href="https://wa.me/917972741546?text=Hello%20Pushpa%20Automation%2C%20I%20want%20to%20inquire%20about%20panel%20availability." target="_blank" rel="noopener" class="btn btn-primary btn-block">WhatsApp Us ➔</a>
        </div>
      `);
    });
  });

  // 3. Hero Sub-Bento Category Cards
  document.querySelectorAll('.clickable-category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      const targetSection = document.getElementById('products');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        const pill = document.querySelector(`.filter-pill[data-filter="${cat}"]`);
        if (pill) pill.click();
      }
    });
  });

  // 4. OLED Screen Diagnostics Click
  const oledTrigger = document.getElementById('te-oled-trigger');
  if (oledTrigger) {
    oledTrigger.addEventListener('click', () => {
      openCustomModal(`
        <span class="section-pill">Live SCADA Diagnostics</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">CP-9000 VFD & PLC Telemetry Engine</h2>
        <p style="color:var(--text-muted); margin-bottom:16px;">This controller integrates real-time frequency synthesis, load amperage feedback, and optical detection interrupts.</p>
        <div style="background:#090a0e; padding:16px; border-radius:10px; font-family:var(--font-mono); font-size:0.8rem; color:#cbd5e1; display:flex; flex-direction:column; gap:6px; margin-bottom:20px;">
          <div>STATUS: <span style="color:#10b981;">ALL NODES SYNCHRONIZED (OK)</span></div>
          <div>CYCLE TIME: <span style="color:#ffffff;">1.2 ms</span></div>
          <div>COMM BUS: <span style="color:#ffffff;">MODBUS RTU / ETHERNET IP</span></div>
        </div>
        <button class="btn btn-primary btn-block" onclick="document.getElementById('modal-close-btn').click();">Return to Sandbox</button>
      `);
    });
  }

  // 5. Sensor Sandbox Cards Click
  const proxCard = document.getElementById('sandbox-prox-card');
  if (proxCard) {
    proxCard.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'input') return;
      openCustomModal(`
        <span class="section-pill">Sensor Engineering Guide</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">M18 Inductive Proximity Sensor</h2>
        <p style="color:var(--text-muted); margin-bottom:16px;">High-frequency electromagnetic field oscillation detects iron, steel, and alloy targets without physical contact.</p>
        <div style="background:#090a0e; padding:16px; border-radius:10px; margin-bottom:20px; font-size:0.84rem; color:#ffffff;">
          <p>• Sensing Distance: 8.0 mm (Adjustable with amplifier)</p>
          <p>• Output: PNP / NPN Normally Open (NO) & Normally Closed (NC)</p>
          <p>• Ingress Protection: IP67 Oil & Vibration Proof</p>
        </div>
        <a href="https://wa.me/917972741546?text=Hello%20Pushpa%20Automation%2C%20I%20need%20a%20quote%20for%20M18%20Proximity%20Sensors." target="_blank" rel="noopener" class="btn btn-primary btn-block">Inquire Sensor Pack on WhatsApp ➔</a>
      `);
    });
  }

  const oscCard = document.getElementById('sandbox-osc-card');
  if (oscCard) {
    oscCard.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'canvas') return;
      openCustomModal(`
        <span class="section-pill">Waveform Analysis</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">Dual-Channel Oscillograph Monitor</h2>
        <p style="color:var(--text-muted); margin-bottom:16px;">Monitors vibration harmonic distortion and three-phase voltage balance across industrial motors in real time.</p>
        <a href="https://wa.me/917972741546?text=Hello%20Pushpa%20Automation%2C%20I%20want%20to%20learn%20more%20about%20SCADA%20monitoring." target="_blank" rel="noopener" class="btn btn-primary btn-block">Request SCADA Consultation ➔</a>
      `);
    });
  }

  // 6. Verified Review Cards Click
  document.querySelectorAll('.clickable-review').forEach(rev => {
    rev.addEventListener('click', () => {
      const author = rev.dataset.author;
      openCustomModal(`
        <span class="section-pill">Verified Google Review</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">Review by ${author}</h2>
        <div style="color:#fbbf24; font-size:1.1rem; margin-bottom:12px;">★★★★★ (5.0 / 5.0)</div>
        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:20px;">
          "Pushpa Automation delivered exceptional control panels for our facility with robust switchgear and seamless on-site support."
        </p>
        <a href="https://www.google.com/search?q=pushpa+automation+and+robotics+industries" target="_blank" rel="noopener" class="btn btn-primary btn-block">
          View on Google Maps ↗
        </a>
      `);
    });
  });

  // 7. Working Hours Click
  const hoursBtn = document.getElementById('facility-live-status');
  if (hoursBtn) {
    hoursBtn.addEventListener('click', () => {
      openCustomModal(`
        <span class="section-pill">Facility Schedule</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">MIDC Bhosari Plant Operating Hours</h2>
        <div style="background:#090a0e; padding:16px; border-radius:10px; margin-bottom:20px; font-size:0.85rem; color:#ffffff;">
          <p>• Monday – Saturday: <strong>9:00 AM – 6:00 PM</strong> (Active Production)</p>
          <p>• Sunday: Closed for Scheduled Maintenance</p>
          <p>• 24/7 Emergency Breakdown Assistance: <a href="tel:07972741546" style="color:var(--accent-red);">079727 41546</a></p>
        </div>
        <a href="tel:07972741546" class="btn btn-primary btn-block">Call Plant Office Now ➔</a>
      `);
    });
  }
}

/* ==========================================================================
   7. SMART QUOTATION ESTIMATOR (WITH SMOOTH NUMERIC TICKER)
   ========================================================================== */
function initQuoteCalculator() {
  const panelType = document.getElementById('calc-panel-type');
  const hpSlider = document.getElementById('calc-hp-slider');
  const hpVal = document.getElementById('calc-hp-val');
  const plcBrand = document.getElementById('calc-plc-brand');
  const enclosure = document.getElementById('calc-enclosure');
  const sensorPack = document.getElementById('calc-sensor-pack');
  const scadaCloud = document.getElementById('calc-scada-cloud');
  const totalCost = document.getElementById('calc-total-cost');
  const waBtn = document.getElementById('btn-calc-send-wa');

  let currentDisplayedPrice = 78500;
  let priceAnimFrame = null;

  function animatePriceTo(targetVal) {
    if (!totalCost) return;
    if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);

    const startVal = currentDisplayedPrice;
    const diff = targetVal - startVal;
    if (Math.abs(diff) < 1) {
      currentDisplayedPrice = targetVal;
      totalCost.textContent = '₹' + targetVal.toLocaleString('en-IN');
      return;
    }

    const duration = 280;
    const startTime = performance.now();
    totalCost.classList.add('is-ticking');

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic out
      const current = Math.round(startVal + diff * ease);

      totalCost.textContent = '₹' + current.toLocaleString('en-IN');

      if (progress < 1) {
        priceAnimFrame = requestAnimationFrame(update);
      } else {
        currentDisplayedPrice = targetVal;
        totalCost.textContent = '₹' + targetVal.toLocaleString('en-IN');
        setTimeout(() => totalCost.classList.remove('is-ticking'), 100);
      }
    }

    priceAnimFrame = requestAnimationFrame(update);
  }

  function calculate() {
    const hp = hpSlider ? parseInt(hpSlider.value) : 15;
    if (hpVal) hpVal.textContent = `${hp} HP`;

    let base = 25000;
    const type = panelType ? panelType.value : 'plc_hmi';

    if (type === 'plc_hmi') base = 38000 + (hp * 650);
    else if (type === 'vfd') base = 22000 + (hp * 1100);
    else if (type === 'stardelta') base = 15000 + (hp * 850);
    else if (type === 'flameproof') base = 48000 + (hp * 950);
    else if (type === 'stepper') base = 65000 + (hp * 500);

    const brand = plcBrand ? plcBrand.value : 'delta';
    if (brand === 'siemens') base += 14000;
    else if (brand === 'schneider') base += 11000;
    else if (brand === 'delta') base += 4000;

    const enc = enclosure ? enclosure.value : 'ip55';
    if (enc === 'ip65') base += 6000;
    else if (enc === 'ss304') base += 18000;

    if (sensorPack && sensorPack.checked) base += 8500;
    if (scadaCloud && scadaCloud.checked) base += 22000;

    animatePriceTo(base);

    if (waBtn) {
      const msg = `Hello Pushpa Automation, I configured a custom control panel quote:
- Type: ${panelType ? panelType.options[panelType.selectedIndex].text : 'PLC HMI'}
- Motor Rating: ${hp} HP
- PLC Brand: ${plcBrand ? plcBrand.options[plcBrand.selectedIndex].text : 'Delta'}
- Enclosure: ${enclosure ? enclosure.options[enclosure.selectedIndex].text : 'IP55'}
- Sensor Pack: ${sensorPack && sensorPack.checked ? 'Yes' : 'No'}
- SCADA Cloud: ${scadaCloud && scadaCloud.checked ? 'Yes' : 'No'}
- Estimated Cost: ₹${base.toLocaleString('en-IN')}
Please review and send technical datasheet.`;
      waBtn.href = `https://wa.me/917972741546?text=${encodeURIComponent(msg)}`;
    }
  }

  const calcAlert = document.getElementById('calc-wa-alert');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      if (window.soundFX && typeof window.soundFX.click === 'function') window.soundFX.click();
      if (calcAlert) {
        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        calcAlert.innerHTML = `
          <div class="auto-reply-card">
            <div class="auto-reply-header">
              <span class="auto-reply-badge">✓ QUOTATION DISPATCH RECEIPT</span>
              <span class="auto-reply-time">TIMESTAMP: ${timeStr}</span>
            </div>
            <div class="auto-reply-body">
              <p>Thank you for contacting <strong>Pushpa Automation &amp; Robotics Industries</strong>.</p>
              <p>We have received your custom panel configuration. One of our engineers will review it and respond within 30 minutes during working hours (Monday–Saturday, 9:00 AM – 6:00 PM).</p>
              <p>For urgent requirements, please call us directly: <a href="tel:07972741546" style="color:var(--accent-cyan, #00f0ff); font-weight:bold;">079727 41546</a>.</p>
              <p class="auto-reply-signoff">
                Regards,<br>
                <strong>Pushpa Automation &amp; Robotics Industries</strong><br>
                MIDC Bhosari, Pune
              </p>
            </div>
          </div>
        `;
        calcAlert.style.display = 'block';
      }
    });
  }

  [panelType, hpSlider, plcBrand, enclosure, sensorPack, scadaCloud].forEach(el => {
    if (el) {
      el.addEventListener('input', calculate);
      el.addEventListener('change', () => {
        if (window.soundFX && typeof window.soundFX.click === 'function') window.soundFX.click();
        calculate();
      });
    }
  });

  calculate();
}

/* ==========================================================================
   8. AUDIO & SOUND FX TOGGLE
   ========================================================================== */
function initAudioControls() {
  const btn = document.getElementById('btn-toggle-sound');
  const text = document.getElementById('sound-toggle-text');

  if (btn && window.soundFX) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMuted = window.soundFX.toggleMute();
      btn.classList.toggle('muted', isMuted);
      if (text) text.textContent = isMuted ? 'FX: OFF' : 'FX: ON';
      if (!isMuted) window.soundFX.click();
    });
  }
}

/* ==========================================================================
   9. CONTACT FORM SUBMISSION (DIRECT WHATSAPP RFQ TRANSMISSION)
   ========================================================================== */
/* ==========================================================================
   9. CONTACT FORM SUBMISSION (DIRECT WHATSAPP RFQ TRANSMISSION & AUTO-REPLY)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-form-alert');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.soundFX && typeof window.soundFX.click === 'function') window.soundFX.click();

      const name = (form.querySelector('[name="name"]')?.value || '').trim();
      const phone = (form.querySelector('[name="phone"]')?.value || '').trim();
      const catEl = form.querySelector('[name="category"]');
      const category = catEl ? catEl.options[catEl.selectedIndex].text : 'Industrial Control Panel';
      const requirement = (form.querySelector('[name="requirement"]')?.value || '').trim();

      const waMessage = 
`*NEW ENGINEERING INQUIRY // PUSHPA AUTOMATION*
----------------------------------------
*Client / Org:* ${name}
*Contact Phone:* ${phone}
*Panel Category:* ${category}
*Project Specifications:*
${requirement}
----------------------------------------
_Transmitted via Pushpa Automation Portal_`;

      const waUrl = `https://wa.me/917972741546?text=${encodeURIComponent(waMessage)}`;
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (alertBox) {
        alertBox.innerHTML = `
          <div class="auto-reply-card">
            <div class="auto-reply-header">
              <span class="auto-reply-badge">✓ AUTOMATED DISPATCH RECEIPT</span>
              <span class="auto-reply-time">TIMESTAMP: ${timeStr}</span>
            </div>
            <div class="auto-reply-body">
              <p>Thank you for contacting <strong>Pushpa Automation &amp; Robotics Industries</strong>.</p>
              <p>We have received your inquiry. One of our engineers will review it and respond within 30 minutes during working hours (Monday–Saturday, 9:00 AM – 6:00 PM).</p>
              <p>For urgent requirements, please call us directly: <a href="tel:07972741546" style="color:var(--accent-cyan, #00f0ff); font-weight:bold;">079727 41546</a>.</p>
              <div class="auto-reply-checklist">
                <strong>To help us respond faster, please share:</strong>
                <ul>
                  <li>Panel type required (PLC/HMI, VFD, Star Delta, or Flameproof)</li>
                  <li>Motor capacity (HP)</li>
                  <li>Preferred PLC brand (Siemens, Delta, or Schneider)</li>
                </ul>
              </div>
              <p class="auto-reply-signoff">
                Regards,<br>
                <strong>Pushpa Automation &amp; Robotics Industries</strong><br>
                MIDC Bhosari, Pune
              </p>
            </div>
            <div style="margin-top:12px; padding-top:10px; border-top:1px dashed rgba(0,240,255,0.2); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span style="font-size:0.72rem; color:#7dd3fc;">WhatsApp chat initiated in new window</span>
              <a href="${waUrl}" target="_blank" rel="noopener" class="btn-hud-primary" style="padding:6px 14px; font-size:0.72rem; text-decoration:none;">
                Open Chat on WhatsApp ➔
              </a>
            </div>
          </div>
        `;
        alertBox.style.display = 'block';
      }

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');

      form.reset();
    });
  }
}

/* ==========================================================================
   10. MODAL LISTENERS
   ========================================================================== */
function initModalListeners() {
  const modal = document.getElementById('product-specs-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}


/* ==========================================================================
   11. INTERACTIVE FOOTER & FACILITY MODAL HANDLERS
   ========================================================================== */
function initFooterInteractiveSection() {
  const modal = document.getElementById('product-specs-modal');
  const content = document.getElementById('modal-specs-content');

  function openCustomModal(html) {
    if (modal && content) {
      content.innerHTML = html;
      modal.classList.add('active');
      if (window.soundFX) window.soundFX.click();
    }
  }

  // 1. Facility Trigger (MIDC Bhosari Live Facility Status)
  const facilityTrigger = document.getElementById('footer-facility-trigger');
  const quickStatus = document.getElementById('footer-quick-status');

  const openFacilityModal = () => {
    openCustomModal(`
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <span class="section-pill" style="margin:0;">MIDC Bhosari Facility</span>
        <span class="plant-status-pill" style="padding:2px 8px; font-size:0.72rem;">
          <span class="live-beacon-dot" style="width:6px; height:6px;"></span> LIVE PRODUCTION ACTIVE
        </span>
      </div>
      <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0 12px;">Pushpa Automation & Robotics Engineering Center</h2>
      <p style="color:var(--text-muted); font-size:0.88rem; line-height:1.6; margin-bottom:16px;">
        Our flagship manufacturing plant in MIDC Industrial Area, Bhosari specializes in ISO-compliant control panel assembly, high-speed VFD calibration, and custom PLC software commissioning.
      </p>

      <div style="background:#090a0e; border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:12px; margin-bottom:20px; font-size:0.84rem; color:#e2e8f0; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
          <span style="color:var(--text-dim);">LOCATION:</span>
          <span style="font-weight:600; color:#ffffff;">Plot No. PAP-R, MIDC Bhosari, Pune 411026</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
          <span style="color:var(--text-dim);">OPERATIONAL SHIFTS:</span>
          <span style="color:#34d399; font-weight:600;">24/7 Breakdown & Emergency Desk</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
          <span style="color:var(--text-dim);">PLANT HOTLINE:</span>
          <span style="color:var(--accent-red); font-weight:700;">+91 79727 41546</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-dim);">GOOGLE RATING:</span>
          <span style="color:#fbbf24; font-weight:700;">5.0 ★ (106+ Verified Industrial Reviews)</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
        <a href="https://maps.google.com/?q=Pushpa+Automation+and+Robotics+Industries+MIDC+Bhosari+Pune" target="_blank" rel="noopener" class="btn btn-primary" style="display:flex; align-items:center; justify-content:center; gap:6px;">
          🗺️ Open Google Maps
        </a>
        <a href="https://wa.me/917972741546?text=Hello%20Pushpa%20Automation%2C%20I%20want%20to%20visit%20your%20MIDC%20Bhosari%20facility." target="_blank" rel="noopener" class="btn btn-secondary" style="display:flex; align-items:center; justify-content:center; gap:6px; color:#22c55e;">
          💬 WhatsApp Plant Desk
        </a>
      </div>
    `);
  };

  if (facilityTrigger) facilityTrigger.addEventListener('click', openFacilityModal);
  if (quickStatus) quickStatus.addEventListener('click', openFacilityModal);

  // 2. Google Review Click
  const reviewBadge = document.getElementById('footer-google-review');
  if (reviewBadge) {
    reviewBadge.addEventListener('click', () => {
      openCustomModal(`
        <span class="section-pill">Google Verified Credentials</span>
        <h2 style="font-size:1.6rem; color:#ffffff; margin:8px 0;">Pushpa Automation & Robotics Reviews</h2>
        <div style="color:#fbbf24; font-size:1.3rem; margin:8px 0 14px; display:flex; align-items:center; gap:6px;">
          ★★★★★ <span style="font-size:0.95rem; color:#ffffff; font-weight:700;">5.0 / 5.0 Rating</span>
          <span style="font-size:0.8rem; color:var(--text-dim);">(106+ Verified Plant Owners)</span>
        </div>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:18px; line-height:1.6;">
          Ranked among the top-rated control panel manufacturers in MIDC Bhosari, Pune. Known for switchgear longevity, prompt commissioning, and reliable technical service.
        </p>
        <a href="https://www.google.com/search?q=pushpa+automation+and+robotics+industries" target="_blank" rel="noopener" class="btn btn-primary btn-block">
          Read All Google Reviews ↗
        </a>
      `);
    });
  }

  // 3. Product Quick Links in Footer
  document.querySelectorAll('.footer-prod-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = btn.getAttribute('data-category');
      const targetPill = document.querySelector(`.filter-pill[data-category="${cat}"]`);
      if (targetPill) {
        targetPill.click();
      }
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 4. Hover Listener on Clickable elements for cursor lock-on
  if (window.sensorEngine) {
    const clickableEls = document.querySelectorAll('a, button, .bento-card, .clickable-metric, .clickable-footer-item, .filter-pill');
    clickableEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (window.sensorEngine && window.sensorEngine.mouse) {
          window.sensorEngine.mouse.isHoveringClickable = true;
        }
      });
      el.addEventListener('mouseleave', () => {
        if (window.sensorEngine && window.sensorEngine.mouse) {
          window.sensorEngine.mouse.isHoveringClickable = false;
        }
      });
    });
  }
}

/* ==========================================================================
   12. SILKY SCROLL POPUP & STAGGER REVEAL ENGINE
   ========================================================================== */
function initScrollPopups() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // 1. Tag Section Headers
  document.querySelectorAll('.section-header').forEach(header => {
    if (!header.classList.contains('scroll-reveal')) {
      header.classList.add('scroll-reveal');
    }
  });

  // 2. Tag Hero Section Bento Elements
  const heroMain = document.querySelector('.hero-main-card');
  if (heroMain && !heroMain.classList.contains('scroll-reveal')) {
    heroMain.classList.add('scroll-reveal');
    heroMain.style.setProperty('--reveal-delay', '0ms');
  }

  const heroController = document.querySelector('.hero-controller-card');
  if (heroController && !heroController.classList.contains('scroll-reveal')) {
    heroController.classList.add('scroll-reveal');
    heroController.style.setProperty('--reveal-delay', '120ms');
  }

  document.querySelectorAll('.hero-sub-bento .bento-sub-card').forEach((card, idx) => {
    if (!card.classList.contains('scroll-reveal')) {
      card.classList.add('scroll-reveal');
      card.style.setProperty('--reveal-delay', `${idx * 90}ms`);
    }
  });

  // 3. Tag Sensor Lab Elements (#lab)
  const proxCard = document.getElementById('sandbox-prox-card');
  if (proxCard && !proxCard.classList.contains('scroll-reveal')) {
    proxCard.classList.add('scroll-reveal');
    proxCard.style.setProperty('--reveal-delay', '0ms');
  }

  const oscCard = document.getElementById('sandbox-osc-card');
  if (oscCard && !oscCard.classList.contains('scroll-reveal')) {
    oscCard.classList.add('scroll-reveal');
    oscCard.style.setProperty('--reveal-delay', '120ms');
  }

  // 4. Tag Category Filter Pills & Product Cards
  const filterPillsContainer = document.querySelector('.category-filter-pills');
  if (filterPillsContainer && !filterPillsContainer.classList.contains('scroll-reveal')) {
    filterPillsContainer.classList.add('scroll-reveal');
  }

  // 5. Tag Calculator Bento & Price Card
  const calcBento = document.querySelector('.calculator-section .bento-card');
  if (calcBento && !calcBento.classList.contains('scroll-reveal')) {
    calcBento.classList.add('scroll-reveal');
  }

  // 6. Tag Verified Review Bento Cards
  document.querySelectorAll('.reviews-bento-grid .review-bento-card').forEach((card, idx) => {
    if (!card.classList.contains('scroll-reveal')) {
      card.classList.add('scroll-reveal');
      card.style.setProperty('--reveal-delay', `${idx * 100}ms`);
    }
  });

  // 7. Tag Facility & Contact Form Cards
  document.querySelectorAll('.contact-bento-grid > .bento-card').forEach((card, idx) => {
    if (!card.classList.contains('scroll-reveal')) {
      card.classList.add('scroll-reveal');
      card.style.setProperty('--reveal-delay', `${idx * 110}ms`);
    }
  });

  // 8. Tag Footer Columns
  document.querySelectorAll('.footer-grid > div').forEach((col, idx) => {
    if (!col.classList.contains('scroll-reveal')) {
      col.classList.add('scroll-reveal');
      col.style.setProperty('--reveal-delay', `${idx * 80}ms`);
    }
  });

  const footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom && !footerBottom.classList.contains('scroll-reveal')) {
    footerBottom.classList.add('scroll-reveal');
  }

  // High-performance Continuous Bidirectional IntersectionObserver (Scroll Up & Scroll Down)
  const revealObserver = new IntersectionObserver((entries) => {
    const vh = window.innerHeight || document.documentElement.clientHeight;

    entries.forEach(entry => {
      const el = entry.target;
      const rect = entry.boundingClientRect;

      if (entry.isIntersecting) {
        // Element is visible in viewport -> Trigger Pop-Up
        el.classList.remove('exit-top');
        el.classList.add('is-revealed');
      } else {
        // Element left viewport -> Reset position for next scroll pass
        if (rect.top > vh) {
          // Element is below viewport (ready to pop up on scroll down)
          el.classList.remove('is-revealed', 'exit-top');
        } else if (rect.bottom < 0) {
          // Element is above viewport (ready to pop in on scroll up)
          el.classList.remove('is-revealed');
          el.classList.add('exit-top');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '-10px 0px -30px 0px',
    threshold: [0, 0.08]
  });

  // Export refresh helper for all elements (static and dynamic)
  window.refreshScrollReveals = (scope = document) => {
    const targets = scope.querySelectorAll('.scroll-reveal, .scroll-reveal-scale');
    targets.forEach(el => {
      revealObserver.observe(el);
    });
  };

  // Initial pass to observe all elements
  window.refreshScrollReveals();

  // Reveal only Hero elements initially so all subsequent sections pop up dynamically on scroll
  setTimeout(() => {
    document.querySelectorAll('#hero .scroll-reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
  }, 120);
}

/* ==========================================================================
   12b. ANIMATED METRICS NUMBER TICKER (21st.dev / HUD INTELLIGENCE)
   ========================================================================== */
function initStatsTicker() {
  const trustStrip = document.querySelector('.hero-trust-bar-strip') || document.querySelector('.trust-metrics-cluster');
  if (!trustStrip) return;

  let hasAnimated = false;

  const animateValue = (el, start, end, duration, formatFn) => {
    const startTime = performance.now();
    el.classList.add('is-ticking');

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
      const current = start + (end - start) * ease;

      el.textContent = formatFn(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatFn(end);
        setTimeout(() => el.classList.remove('is-ticking'), 150);
      }
    };

    requestAnimationFrame(update);
  };

  const tickerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;

        const deployedEl = document.getElementById('trust-val-deployed') || document.querySelector('[data-metric="deployed"] .trust-metric-num');
        const ratingEl = document.getElementById('trust-val-rating') || document.querySelector('[data-metric="rating"] .trust-metric-num');
        const stockEl = document.getElementById('trust-val-stock') || document.querySelector('[data-metric="stock"] .trust-metric-num');

        if (deployedEl) {
          animateValue(deployedEl, 0, 1500, 1400, (v) => `${Math.round(v).toLocaleString('en-IN')}+`);
        }
        if (ratingEl) {
          animateValue(ratingEl, 0, 5.0, 1200, (v) => `${v.toFixed(1)} ★`);
        }
        if (stockEl) {
          animateValue(stockEl, 0, 100, 1000, (v) => `${Math.round(v)}%`);
        }

        tickerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  tickerObserver.observe(trustStrip);
}

/* ==========================================================================
   13. FIRST-PERSON 3D FACILITY & CABINET WALKTHROUGH CONTROLLER
   ========================================================================== */
function initFacilityWalkthrough() {
  const section = document.getElementById('walkthrough');
  const viewport = document.getElementById('walkthrough-viewport');
  const canvas = document.getElementById('walkthrough-canvas');

  if (!section || !viewport || !canvas) return;

  let walkthroughEngine = null;

  // Lazy Initialize 3D Engine upon viewport intersection
  const tourObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!walkthroughEngine && typeof window.FacilityWalkthroughEngine !== 'undefined') {
          walkthroughEngine = new window.FacilityWalkthroughEngine('walkthrough-viewport', 'walkthrough-canvas');
          window.facilityTour = walkthroughEngine;
        } else if (walkthroughEngine) {
          walkthroughEngine.isActive = true;
          walkthroughEngine.animate();
        }
      } else {
        if (walkthroughEngine) {
          walkthroughEngine.isActive = false; // Pause rendering when off-screen
        }
      }
    });
  }, { rootMargin: '250px 0px 250px 0px' });

  tourObserver.observe(section);
}
