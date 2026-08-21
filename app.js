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
  initTe3DController();
  initBentoSpotlight();
  initSensorLab();
  initProductsDirectory();
  initQuoteCalculator();
  initAudioControls();
  initContactForm();
  initModalListeners();
  initAllClickableCards();
  initFooterInteractiveSection();
  initScrollPopups();
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
   2. TEENAGE ENGINEERING 3D CONTROLLER & VFD SIMULATION
   ========================================================================== */
function initTe3DController() {
  const card = document.querySelector('.hero-controller-card');
  const vfdSlider = document.getElementById('vfd-freq-slider');
  const vfdHzDisplay = document.getElementById('vfd-hz-val');
  const vfdRpmDisplay = document.getElementById('vfd-rpm-val');
  const vfdAmpDisplay = document.getElementById('vfd-amp-val');
  const teSliderFeedback = document.getElementById('te-slider-feedback');
  const presetBtns = document.querySelectorAll('.te-preset-btn');
  const eStopBtn = document.getElementById('btn-estop');
  const resetBtn = document.getElementById('btn-panel-reset');
  const jogBtn = document.getElementById('btn-panel-jog');
  const systemStatus = document.getElementById('panel-system-status');
  const conveyorBtn = document.getElementById('btn-conveyor-trigger');
  const partCountDisplay = document.getElementById('part-count-val');

  let currentFreq = 50.0;
  let isEStopActive = false;
  let partCount = 1428;

  // 3D Parallax Tilt Effect on Controller Card
  if (card) {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 992) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = (-y / (rect.height / 2)) * 10;
      const rotateY = (x / (rect.width / 2)) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  }

  function updateVfd(hz) {
    if (vfdHzDisplay) vfdHzDisplay.textContent = `${hz.toFixed(1)} Hz`;
    if (teSliderFeedback) teSliderFeedback.textContent = `${hz.toFixed(1)} Hz`;
    const rpm = Math.round(hz * 30);
    const amp = (hz * 0.16 + 1.2).toFixed(1);
    if (vfdRpmDisplay) vfdRpmDisplay.textContent = `${rpm}`;
    if (vfdAmpDisplay) vfdAmpDisplay.textContent = `${amp} A`;
  }

  if (vfdSlider) {
    vfdSlider.addEventListener('input', (e) => {
      if (isEStopActive) return;
      currentFreq = parseFloat(e.target.value);
      updateVfd(currentFreq);
      highlightPreset(currentFreq);
      if (window.soundFX) {
        window.soundFX.startMotor(currentFreq);
        window.soundFX.updateMotorSpeed(currentFreq);
      }
    });

    vfdSlider.addEventListener('change', () => {
      if (window.soundFX) window.soundFX.click();
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isEStopActive) return;
      const hz = parseFloat(btn.dataset.hz || 50);
      currentFreq = hz;
      if (vfdSlider) vfdSlider.value = hz;
      updateVfd(hz);
      highlightPreset(hz);
      if (window.soundFX) {
        window.soundFX.click();
        window.soundFX.startMotor(hz);
        window.soundFX.updateMotorSpeed(hz);
      }
    });
  });

  function highlightPreset(hz) {
    presetBtns.forEach(btn => {
      if (parseFloat(btn.dataset.hz) === Math.round(hz)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // E-STOP Trigger
  if (eStopBtn) {
    eStopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isEStopActive = true;
      eStopBtn.classList.add('pressed');
      if (systemStatus) {
        systemStatus.textContent = 'TRIPPED';
        systemStatus.style.color = '#ef4444';
        systemStatus.style.background = 'rgba(239, 68, 68, 0.15)';
      }
      if (vfdRpmDisplay) vfdRpmDisplay.textContent = '0';
      if (vfdAmpDisplay) vfdAmpDisplay.textContent = '0.0 A';
      if (window.soundFX) {
        window.soundFX.emergencyStop();
        window.soundFX.stopMotor();
      }
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isEStopActive = false;
      if (eStopBtn) eStopBtn.classList.remove('pressed');
      if (systemStatus) {
        systemStatus.textContent = 'ONLINE';
        systemStatus.style.color = '#10b981';
        systemStatus.style.background = 'rgba(16, 185, 129, 0.1)';
      }
      updateVfd(currentFreq);
      if (window.soundFX) window.soundFX.click();
    });
  }

  // Manual Jog
  if (jogBtn) {
    jogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isEStopActive) return;
      if (vfdRpmDisplay) {
        const orig = vfdRpmDisplay.textContent;
        vfdRpmDisplay.textContent = '600';
        setTimeout(() => vfdRpmDisplay.textContent = orig, 500);
      }
      if (window.soundFX) window.soundFX.click();
    });
  }

  // Conveyor Pass Part
  if (conveyorBtn) {
    conveyorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isEStopActive) return;
      partCount++;
      if (partCountDisplay) partCountDisplay.textContent = `${partCount.toLocaleString()} UNITS`;
      if (window.soundFX) window.soundFX.sensorTrigger();
    });
  }
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
const PRODUCTS_DATA = [
  {
    id: 'plc-hmi-panel',
    name: 'PLC HMI Automated Control Panel',
    category: 'plc',
    image: 'images/plc_hmi_panel.jpg',
    priceDisplay: '₹45,000.00',
    shortDesc: 'Delta / Siemens 32-bit SoC CPU paired with 7-inch Color Touchscreen HMI and pre-programmed ladder automation.',
    specs: [
      'CPU: Delta AS Series 32-bit SoC or Siemens S7-1200',
      'HMI: 7.0" TFT High Resolution Color Touchscreen (IP65 front)',
      'Digital I/O: 16 Inputs / 16 Relay/Transistor Outputs',
      'Analog Channels: 4 Channels 4-20mA / 0-10V DC',
      'Enclosure: CRCA Steel Sheet (RAL 7035 Powder Coated, IP55)'
    ]
  },
  {
    id: 'vfd-heavy-panel',
    name: 'Heavy Duty VFD Control Panel',
    category: 'vfd',
    image: 'images/vfd_heavy_panel.jpg',
    priceDisplay: '₹45,000.00',
    shortDesc: 'Precision Variable Frequency Drive panel for high torque industrial motors with dynamic braking unit.',
    specs: [
      'Motor Rating: 15 HP to 30 HP AC Induction Motors',
      'Drive: Delta MS300 / C2000 Plus or Schneider Altivar',
      'Protection: Phase Loss, Short Circuit, Thermal Overload',
      'Cooling: Dual Ball-Bearing Exhaust Fans with Louver Filters'
    ]
  },
  {
    id: 'vfd-standard-panel',
    name: 'Compact VFD Speed Panel',
    category: 'vfd',
    image: 'images/vfd_heavy_panel.jpg',
    priceDisplay: '₹25,000.00',
    shortDesc: 'Compact speed regulation panel with emergency interlock and digital frequency readout.',
    specs: [
      'Motor Rating: Up to 7.5 HP (3 Phase 415V AC)',
      'Display: 4-Digit Digital Frequency Monitor',
      'Enclosure: Compact Wall Mount IP54 Powder Coated Box'
    ]
  },
  {
    id: 'star-delta-50hp',
    name: '50 HP Heavy Star Delta Starter Panel',
    category: 'stardelta',
    image: 'images/star_delta_panel.jpg',
    priceDisplay: '₹4,00,000.00',
    shortDesc: 'Premium high-tension industrial motor starter panel engineered with Siemens/L&T switchgear and copper busbars.',
    specs: [
      'Capacity: 50 HP (37 kW) Continuous Heavy Duty Duty',
      'Switchgear: L&T / Siemens Air Break Contactors',
      'Busbar: Electrolytic Grade High Conductivity Copper',
      'Meters: Digital Multifunction Meter (V, A, PF, kW, kWh)'
    ]
  },
  {
    id: 'star-delta-standard',
    name: 'Standard Star Delta Starter',
    category: 'stardelta',
    image: 'images/star_delta_panel.jpg',
    priceDisplay: '₹18,000.00',
    shortDesc: 'Automatic Star-Delta starter panel designed for smooth current inrush reduction and motor protection.',
    specs: [
      'Capacity: 7.5 HP to 15 HP Motors',
      'Components: 3 Heavy Duty Contactors + Thermal Overload',
      'Control: Auto / Manual Star-Delta Transition Timer'
    ]
  },
  {
    id: 'flame-proof-panel',
    name: 'Flame Proof Industrial Panel (Ex-d)',
    category: 'specialty',
    image: 'images/flameproof_panel.jpg',
    priceDisplay: '₹55,000.00',
    shortDesc: 'CIMFR certified explosion-proof control panel for hazardous chemical, gas, and paint booth zones.',
    specs: [
      'Classification: Zone 1, Zone 2, Gas Groups IIA, IIB & IIC',
      'Material: Cast Aluminium LM6 Alloy / SS316',
      'Protection: IP66 Weatherproof & Dust-tight'
    ]
  },
  {
    id: 'delta-as-plc',
    name: 'Delta AS Series Compact PLC',
    category: 'sensors',
    image: 'images/delta_as_plc.jpg',
    priceDisplay: '₹16,500.00',
    shortDesc: 'High performance 32-bit SoC modular controller with CANopen, Modbus, and EtherNet/IP communication.',
    specs: [
      'Speed: 40k steps / 1ms execution',
      'Program Capacity: Up to 128k steps',
      'Expansion: Up to 32 modules / 1,024 I/O points'
    ]
  },
  {
    id: 'cnc-sensor-pack',
    name: 'CNC Machine Sensors Pack',
    category: 'sensors',
    image: 'images/industrial_sensors_pack.jpg',
    priceDisplay: '₹6,500.00',
    shortDesc: 'Complete sensor package including M18 inductive proximity switches and optical laser limit beams.',
    specs: [
      'Proximity: 4x M18 PNP Normally Open (8mm sensing)',
      'Optical: 2x Diffuse Laser Sensors (300mm range)',
      'Rating: IP67 Oil & Coolant Resistant'
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
      card.className = 'bento-card product-bento-card scroll-reveal';
      card.style.setProperty('--reveal-delay', `${(idx % 4) * 80}ms`);
      card.setAttribute('data-id', prod.id);
      card.setAttribute('title', `Click to open specifications for ${prod.name}`);
      card.innerHTML = `
        <div class="product-photo-box">
          <img src="${prod.image}" alt="${prod.name}" class="product-photo-img" loading="lazy">
        </div>
        <span class="product-category-tag">${prod.category.toUpperCase()}</span>
        <h3 class="product-name">${prod.name}</h3>
        <p class="product-desc">${prod.shortDesc}</p>
        <div class="product-card-footer">
          <div>
            <div style="font-size:0.68rem; font-family:var(--font-mono); color:var(--text-dim);">STARTING AT</div>
            <div class="product-price-display">${prod.priceDisplay}</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm btn-open-specs" data-id="${prod.id}">Specs ➔</button>
            <a href="https://wa.me/917972741546?text=${encodeURIComponent(`Hello Pushpa Automation, I want to order ${prod.name} (${prod.priceDisplay}).`)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" onclick="event.stopPropagation();">Order</a>
          </div>
        </div>
      `;

      // Entire card is clickable to open specs modal
      card.addEventListener('click', () => {
        openSpecs(prod.id);
      });

      container.appendChild(card);
    });

    initBentoSpotlight();
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
      if (window.soundFX) window.soundFX.click();
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
   7. SMART QUOTATION ESTIMATOR
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

    const formatted = '₹' + base.toLocaleString('en-IN');
    if (totalCost) totalCost.textContent = formatted;

    if (waBtn) {
      const msg = `Hello Pushpa Automation, I configured a custom control panel quote:
- Type: ${panelType ? panelType.options[panelType.selectedIndex].text : 'PLC HMI'}
- Motor Rating: ${hp} HP
- PLC Brand: ${plcBrand ? plcBrand.options[plcBrand.selectedIndex].text : 'Delta'}
- Enclosure: ${enclosure ? enclosure.options[enclosure.selectedIndex].text : 'IP55'}
- Sensor Pack: ${sensorPack && sensorPack.checked ? 'Yes' : 'No'}
- SCADA Cloud: ${scadaCloud && scadaCloud.checked ? 'Yes' : 'No'}
- Estimated Cost: ${formatted}
Please review and send technical datasheet.`;
      waBtn.href = `https://wa.me/917972741546?text=${encodeURIComponent(msg)}`;
    }
  }

  [panelType, hpSlider, plcBrand, enclosure, sensorPack, scadaCloud].forEach(el => {
    if (el) {
      el.addEventListener('input', calculate);
      el.addEventListener('change', () => {
        if (window.soundFX) window.soundFX.click();
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
   9. CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-form-alert');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.soundFX) window.soundFX.click();

      const name = form.querySelector('[name="name"]').value;
      const phone = form.querySelector('[name="phone"]').value;

      if (alertBox) {
        alertBox.innerHTML = `<strong>✓ Inquiry Transmitted!</strong> Thank you ${name}. Our automation engineers at MIDC Bhosari will contact ${phone} shortly.`;
        alertBox.style.display = 'block';
      }

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

  // High-performance IntersectionObserver with responsive threshold
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Unobserve once revealed for optimal scrolling smoothness and hover performance
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.05
  });

  // Export refresh helper for dynamic items
  window.refreshScrollReveals = (scope = document) => {
    const targets = scope.querySelectorAll('.scroll-reveal:not(.is-revealed), .scroll-reveal-scale:not(.is-revealed)');
    targets.forEach(el => {
      revealObserver.observe(el);
    });
  };

  // Initial pass to observe all elements
  window.refreshScrollReveals();

  // Reveal only Hero elements initially so all other sections pop up dynamically as user scrolls down
  setTimeout(() => {
    document.querySelectorAll('#hero .scroll-reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
  }, 120);
}


