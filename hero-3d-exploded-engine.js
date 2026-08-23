/**
 * Pushpa Automation & Robotics Industries (MIDC Bhosari, Pune)
 * Real-Time 3D WebGL Exploded Control Panel & SCADA Engine
 * Powered by Three.js (r128) with Realistic Materials, Dynamic Lighting,
 * 360° Drag Orbit, Continuous Floating Physics & 3D Hardware Explosion
 */

(function () {
  'use strict';

  class Hero3DExplodedEngine {
    constructor() {
      this.container = document.getElementById('ghost-panel-stage') || document.getElementById('hero-exploded-panel');
      this.canvas = document.getElementById('hero-3d-canvas');
      if (!this.container) return;

      // Core Three.js Properties
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();

      // Master 3D Groups
      this.rootGroup = new THREE.Group();
      this.pivotGroup = new THREE.Group();

      // 6 Discrete 3D Hardware Layers
      this.layer1Enclosure = new THREE.Group(); // Layer 1: CRCA IP65 Box
      this.layer2DinRail = new THREE.Group();   // Layer 2: DIN Rails, Trunking & Terminals
      this.layer3PLC = new THREE.Group();       // Layer 3: 32-Bit PLC Controller & I/O Slices
      this.layer4VFD = new THREE.Group();       // Layer 4: VFD Inverter, SMPS & MCB Switchgear
      this.layer5HMI = new THREE.Group();       // Layer 5: 10.1" HMI Touchscreen Front Door
      this.layer6Sensors = new THREE.Group();   // Layer 6: M18 Proximity & Pt100 RTD Sensors

      // Dynamic Animated Elements
      this.ledList = [];
      this.particleSystem = null;
      this.hmiCanvas = null;
      this.hmiCtx = null;
      this.hmiTexture = null;
      this.laserLinesGroup = new THREE.Group();

      // Motion State
      this.explosionProgress = 0.0;
      this.targetExplosion = 0.0;
      this.isAutoRotating = true;
      this.autoRotateSpeed = 0.35;

      // Mouse Orbit & Drag Interaction
      this.isDragging = false;
      this.previousMousePosition = { x: 0, y: 0 };
      this.manualRotation = { x: 0.12, y: -0.28 };
      this.targetRotation = { x: 0.12, y: -0.28 };
      this.mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

      // Telemetry simulation
      this.telemetry = {
        rpm: 1498,
        freq: 50.0,
        voltage: 415.4,
        amps: 8.84,
        temp: 42.6,
        phase: 0
      };

      this.init();
    }

    init() {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hero-3d-canvas';
        this.canvas.className = 'hero-3d-viewport-canvas';
        this.container.appendChild(this.canvas);
      }

      this.setupScene();
      this.setupLighting();
      this.build3DHardware();
      this.buildHMIScreenTexture();
      this.buildParticleField();
      this.build3DLeaderTraces();
      this.setupControls();
      this.setupScrollSync();
      this.onResize();

      // Start render loop
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    setupScene() {
      const width = this.container.clientWidth || 600;
      const height = this.container.clientHeight || 420;

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x040914, 0.015);

      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      this.camera.position.set(0, 0.8, 25);
      this.camera.lookAt(0, 0, 0);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.pivotGroup.add(this.rootGroup);
      this.scene.add(this.pivotGroup);
    }

    setupLighting() {
      // 1. Ambient Lighting (Deep Cobalt/Cyan SCADA atmosphere)
      const ambientLight = new THREE.AmbientLight(0x0c1e3d, 1.8);
      this.scene.add(ambientLight);

      // 2. Main Key Light (Vibrant Electric Cyan Directional)
      const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
      keyLight.position.set(12, 16, 18);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      this.scene.add(keyLight);

      // 3. Fill Rim Light (Vivid Violet Accent)
      const rimLight = new THREE.DirectionalLight(0x7c3aed, 1.8);
      rimLight.position.set(-14, -10, -12);
      this.scene.add(rimLight);

      // 4. Amber Inspection Highlight Point Light
      const amberPoint = new THREE.PointLight(0xfbbf24, 1.4, 20);
      amberPoint.position.set(6, 6, 8);
      this.scene.add(amberPoint);

      // 5. Internal Enclosure Neon Blue Point Light
      const interiorNeon = new THREE.PointLight(0x00f0ff, 2.0, 14);
      interiorNeon.position.set(0, 0, 1.5);
      this.rootGroup.add(interiorNeon);
    }

    // Realistic Materials Factory
    createMat(params) {
      const {
        color = 0x111c2e,
        roughness = 0.35,
        metalness = 0.75,
        emissive = 0x000000,
        emissiveIntensity = 0.0,
        transparent = false,
        opacity = 1.0,
        wireframe = false
      } = params;

      return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        emissive,
        emissiveIntensity,
        transparent,
        opacity,
        wireframe
      });
    }

    build3DHardware() {
      // Shared Metallic Finishes
      const steelMat = this.createMat({ color: 0x182844, roughness: 0.3, metalness: 0.85 });
      const chromeMat = this.createMat({ color: 0x94a3b8, roughness: 0.15, metalness: 0.95 });
      const darkPolymer = this.createMat({ color: 0x060f1e, roughness: 0.5, metalness: 0.4 });
      const cyanGlowMat = this.createMat({ color: 0x00f0ff, roughness: 0.1, metalness: 0.2, emissive: 0x00f0ff, emissiveIntensity: 2.2 });
      const amberGlowMat = this.createMat({ color: 0xfbbf24, roughness: 0.1, metalness: 0.2, emissive: 0xfbbf24, emissiveIntensity: 2.0 });
      const violetGlowMat = this.createMat({ color: 0xa855f7, roughness: 0.1, metalness: 0.2, emissive: 0xa855f7, emissiveIntensity: 2.2 });
      const greenGlowMat = this.createMat({ color: 0x10b981, roughness: 0.1, metalness: 0.2, emissive: 0x10b981, emissiveIntensity: 2.5 });
      const copperMat = this.createMat({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });

      // =========================================================================
      // LAYER 1: CRCA SHEET STEEL ENCLOSURE BOX (IP65 Chassis)
      // =========================================================================
      const boxWidth = 14.0, boxHeight = 13.0, boxDepth = 3.6;

      // Outer Backplate and Chassis Frame
      const boxGeom = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
      const enclosureMat = this.createMat({
        color: 0x07152c,
        roughness: 0.35,
        metalness: 0.8,
        transparent: true,
        opacity: 0.92
      });
      const boxMesh = new THREE.Mesh(boxGeom, enclosureMat);
      boxMesh.position.z = -boxDepth / 2;
      this.layer1Enclosure.add(boxMesh);

      // Neon Wireframe Bevel Cage Outline
      const wireGeom = new THREE.BoxGeometry(boxWidth + 0.1, boxHeight + 0.1, boxDepth + 0.1);
      const wireMat = this.createMat({
        color: 0x00f0ff,
        wireframe: true,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.65,
        transparent: true,
        opacity: 0.4
      });
      const wireMesh = new THREE.Mesh(wireGeom, wireMat);
      wireMesh.position.z = -boxDepth / 2;
      this.layer1Enclosure.add(wireMesh);

      // 4 Heavy-Duty Wall Mounting Flanges & Bolts
      const flangeGeom = new THREE.BoxGeometry(1.6, 0.8, 0.3);
      const boltGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12);

      [
        { x: -boxWidth / 2 + 1.2, y: boxHeight / 2 + 0.35 },
        { x: boxWidth / 2 - 1.2, y: boxHeight / 2 + 0.35 },
        { x: -boxWidth / 2 + 1.2, y: -boxHeight / 2 - 0.35 },
        { x: boxWidth / 2 - 1.2, y: -boxHeight / 2 - 0.35 }
      ].forEach(pos => {
        const flange = new THREE.Mesh(flangeGeom, chromeMat);
        flange.position.set(pos.x, pos.y, -boxDepth / 2);
        const bolt = new THREE.Mesh(boltGeom, cyanGlowMat);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(pos.x, pos.y, -boxDepth / 2 + 0.2);
        this.layer1Enclosure.add(flange, bolt);
      });

      // Bottom Cable Glands Knockouts (PG29, PG21, PG16)
      [-4.0, -2.0, 0.0, 2.0, 4.0].forEach((gx, idx) => {
        const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.45 - idx * 0.03, 0.5, 0.7, 16), chromeMat);
        gland.position.set(gx, -boxHeight / 2 - 0.3, -boxDepth / 2);
        this.layer1Enclosure.add(gland);
      });

      // Left Door Hinges
      [3.8, -3.8].forEach(hy => {
        const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 12), chromeMat);
        hinge.position.set(-boxWidth / 2 - 0.2, hy, 0);
        this.layer1Enclosure.add(hinge);
      });

      // Internal Zinc Passivated Subplate Grid
      const subplateGeom = new THREE.PlaneGeometry(boxWidth - 1.2, boxHeight - 1.2);
      const subplateMat = this.createMat({ color: 0x091b36, roughness: 0.4, metalness: 0.9 });
      const subplate = new THREE.Mesh(subplateGeom, subplateMat);
      subplate.position.set(0, 0, -boxDepth + 0.1);
      this.layer1Enclosure.add(subplate);

      this.rootGroup.add(this.layer1Enclosure);

      // =========================================================================
      // LAYER 2: SLOTTED DIN RAILS, WIRE DUCTS & TERMINAL BLOCKS
      // =========================================================================
      const railGeom = new THREE.BoxGeometry(12.4, 0.4, 0.2);
      const railMat = this.createMat({ color: 0x38bdf8, roughness: 0.2, metalness: 0.95 });

      // Top & Bottom Galvanized DIN Rails
      const dinRailTop = new THREE.Mesh(railGeom, railMat);
      dinRailTop.position.set(0, 2.8, -1.8);
      const dinRailBottom = new THREE.Mesh(railGeom, railMat);
      dinRailBottom.position.set(0, -2.8, -1.8);
      this.layer2DinRail.add(dinRailTop, dinRailBottom);

      // PVC Slotted Wire Trunking / Cable Ducts
      const ductMat = this.createMat({ color: 0x08172c, roughness: 0.6, metalness: 0.3 });
      const hDuctGeom = new THREE.BoxGeometry(12.6, 0.6, 0.6);

      const ductTop = new THREE.Mesh(hDuctGeom, ductMat);
      ductTop.position.set(0, 4.8, -1.7);
      const ductMid = new THREE.Mesh(hDuctGeom, ductMat);
      ductMid.position.set(0, 0.0, -1.7);
      const ductBottom = new THREE.Mesh(hDuctGeom, ductMat);
      ductBottom.position.set(0, -4.8, -1.7);

      const vDuctGeom = new THREE.BoxGeometry(0.6, 10.2, 0.6);
      const ductLeft = new THREE.Mesh(vDuctGeom, ductMat);
      ductLeft.position.set(-6.1, 0, -1.7);
      const ductRight = new THREE.Mesh(vDuctGeom, ductMat);
      ductRight.position.set(6.1, 0, -1.7);

      this.layer2DinRail.add(ductTop, ductMid, ductBottom, ductLeft, ductRight);

      // 20 High-Density Spring-Cage Terminal Blocks (Mounted on bottom rail)
      const termGeom = new THREE.BoxGeometry(0.35, 1.4, 0.9);
      const termColors = [
        0xff2a4b, 0xfbbf24, 0x38bdf8, 0x00f0ff, 0x10b981, // L1, L2, L3, N, PE
        0xff2a4b, 0x00f0ff,                                 // +24V, 0V
        0x00f0ff, 0x00f0ff, 0x00f0ff, 0x00f0ff,             // X0-X3
        0xa855f7, 0xa855f7, 0xa855f7, 0xa855f7,             // Y0-Y3
        0x38bdf8, 0x38bdf8                                  // AI0, AI1
      ];

      termColors.forEach((col, idx) => {
        const tMat = this.createMat({ color: col, roughness: 0.35, metalness: 0.6 });
        const term = new THREE.Mesh(termGeom, tMat);
        term.position.set(-3.8 + idx * 0.42, -2.8, -1.35);

        // Terminal screw head
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), chromeMat);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(-3.8 + idx * 0.42, -2.3, -0.9);
        this.layer2DinRail.add(term, screw);
      });

      // Grounding Copper Busbar with Gold Studs
      const busGeom = new THREE.BoxGeometry(2.4, 0.35, 0.15);
      const busbar = new THREE.Mesh(busGeom, copperMat);
      busbar.position.set(4.6, -2.8, -1.35);
      this.layer2DinRail.add(busbar);

      this.rootGroup.add(this.layer2DinRail);

      // =========================================================================
      // LAYER 3: 32-BIT PLC CPU CONTROLLER & I/O SLICES (Top Rail)
      // =========================================================================
      // Main PLC CPU Module
      const plcGeom = new THREE.BoxGeometry(3.6, 3.4, 1.8);
      const plcMat = this.createMat({ color: 0x0a1c36, roughness: 0.3, metalness: 0.7 });
      const plcMesh = new THREE.Mesh(plcGeom, plcMat);
      plcMesh.position.set(-3.6, 2.5, -0.8);
      this.layer3PLC.add(plcMesh);

      // CPU Microprocessor Silicon Die Hologram Plate
      const chipGeom = new THREE.BoxGeometry(1.4, 1.4, 0.15);
      const chipMat = this.createMat({ color: 0x1a0933, roughness: 0.2, metalness: 0.9, emissive: 0xa855f7, emissiveIntensity: 1.2 });
      const chipMesh = new THREE.Mesh(chipGeom, chipMat);
      chipMesh.position.set(-3.6, 2.5, 0.15);
      this.layer3PLC.add(chipMesh);

      // Dual RJ45 Industrial Ethernet Ports
      const rjGeom = new THREE.BoxGeometry(0.8, 0.65, 0.6);
      const rj1 = new THREE.Mesh(rjGeom, darkPolymer);
      rj1.position.set(-4.5, 1.4, 0.1);
      const rj2 = new THREE.Mesh(rjGeom, darkPolymer);
      rj2.position.set(-3.4, 1.4, 0.1);
      this.layer3PLC.add(rj1, rj2);

      // PLC Diagnostic LEDs (PWR, RUN, ERR, BAT, COMM)
      const ledGeom = new THREE.SphereGeometry(0.12, 12, 12);
      [
        { x: -5.0, y: 3.8, col: 0x10b981, freq: 0 },
        { x: -5.0, y: 3.4, col: 0x10b981, freq: 3.5 },
        { x: -5.0, y: 3.0, col: 0xff2a4b, freq: 0 },
        { x: -5.0, y: 2.6, col: 0xfbbf24, freq: 0 },
        { x: -5.0, y: 2.2, col: 0x00f0ff, freq: 4.8 }
      ].forEach(cfg => {
        const lMat = this.createMat({ color: cfg.col, roughness: 0.1, metalness: 0.1, emissive: cfg.col, emissiveIntensity: 2.5 });
        const led = new THREE.Mesh(ledGeom, lMat);
        led.position.set(cfg.x, cfg.y, 0.15);
        this.layer3PLC.add(led);
        if (cfg.freq > 0) this.ledList.push({ mesh: led, freq: cfg.freq, baseColor: cfg.col });
      });

      // I/O Expansion Slices (8DI, 8DO, 4AI/2AO)
      const sliceWidth = 1.2, sliceHeight = 3.4, sliceDepth = 1.7;
      const sliceGeom = new THREE.BoxGeometry(sliceWidth, sliceHeight, sliceDepth);

      // DI Slice (Cyan accents)
      const diMat = this.createMat({ color: 0x071e36, roughness: 0.35, metalness: 0.65 });
      const diSlice = new THREE.Mesh(sliceGeom, diMat);
      diSlice.position.set(-1.0, 2.5, -0.85);

      // DO Slice (Violet accents)
      const doMat = this.createMat({ color: 0x1c0f38, roughness: 0.35, metalness: 0.65 });
      const doSlice = new THREE.Mesh(sliceGeom, doMat);
      doSlice.position.set(0.4, 2.5, -0.85);

      // AI/AO Slice (Emerald accents)
      const aiMat = this.createMat({ color: 0x082626, roughness: 0.35, metalness: 0.65 });
      const aiSlice = new THREE.Mesh(sliceGeom, aiMat);
      aiSlice.position.set(1.8, 2.5, -0.85);

      this.layer3PLC.add(diSlice, doSlice, aiSlice);

      // Mini indicator lights on I/O slices
      for (let i = 0; i < 6; i++) {
        const diLed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), cyanGlowMat);
        diLed.position.set(-1.0, 3.8 - i * 0.45, 0.05);
        const doLed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), violetGlowMat);
        doLed.position.set(0.4, 3.8 - i * 0.45, 0.05);
        this.layer3PLC.add(diLed, doLed);
        this.ledList.push({ mesh: diLed, freq: 1.5 + i * 0.8, baseColor: 0x00f0ff });
        this.ledList.push({ mesh: doLed, freq: 2.0 + i * 0.6, baseColor: 0xa855f7 });
      }

      this.rootGroup.add(this.layer3PLC);

      // =========================================================================
      // LAYER 4: VFD DRIVE, 24V SMPS & MCB SWITCHGEAR (Bottom Rail)
      // =========================================================================
      // 1. VFD Inverter Drive Module
      const vfdGeom = new THREE.BoxGeometry(3.6, 3.8, 2.2);
      const vfdMat = this.createMat({ color: 0x091c36, roughness: 0.3, metalness: 0.75 });
      const vfdMesh = new THREE.Mesh(vfdGeom, vfdMat);
      vfdMesh.position.set(-3.6, -2.5, -0.7);
      this.layer4VFD.add(vfdMesh);

      // Aluminum Heatsink Cooling Fins (Rear)
      for (let fin = 0; fin < 8; fin++) {
        const fGeom = new THREE.BoxGeometry(0.12, 3.6, 0.8);
        const finMesh = new THREE.Mesh(fGeom, chromeMat);
        finMesh.position.set(-5.1 + fin * 0.42, -2.5, -1.8);
        this.layer4VFD.add(finMesh);
      }

      // VFD 7-Segment Digital Display Screen
      const vfdScreenGeom = new THREE.BoxGeometry(2.2, 0.8, 0.1);
      const vfdScreen = new THREE.Mesh(vfdScreenGeom, darkPolymer);
      vfdScreen.position.set(-3.6, -1.4, 0.45);
      this.layer4VFD.add(vfdScreen);

      // Potentiometer Dial Knob
      const potGeom = new THREE.CylinderGeometry(0.4, 0.45, 0.3, 16);
      const potKnob = new THREE.Mesh(potGeom, cyanGlowMat);
      potKnob.rotation.x = Math.PI / 2;
      potKnob.position.set(-4.4, -2.5, 0.5);
      this.layer4VFD.add(potKnob);

      // 2. Industrial 24V DC 10A SMPS Power Supply
      const smpsGeom = new THREE.BoxGeometry(2.4, 3.8, 2.0);
      const smpsMat = this.createMat({ color: 0x0e2444, roughness: 0.3, metalness: 0.8 });
      const smpsMesh = new THREE.Mesh(smpsGeom, smpsMat);
      smpsMesh.position.set(-0.4, -2.5, -0.8);
      this.layer4VFD.add(smpsMesh);

      // SMPS DC OK Green LED
      const smpsLed = new THREE.Mesh(ledGeom, greenGlowMat);
      smpsLed.position.set(-0.4, -1.0, 0.25);
      this.layer4VFD.add(smpsLed);
      this.ledList.push({ mesh: smpsLed, freq: 0, baseColor: 0x10b981 });

      // 3. 3-Pole 415V MCB Main Isolator Switch
      const mcbGeom = new THREE.BoxGeometry(1.8, 3.8, 1.8);
      const mcbMat = this.createMat({ color: 0x0a1a30, roughness: 0.4, metalness: 0.5 });
      const mcbMesh = new THREE.Mesh(mcbGeom, mcbMat);
      mcbMesh.position.set(2.0, -2.5, -0.9);

      // 3 Red MCB Actuator Toggles
      [-0.5, 0.0, 0.5].forEach(tx => {
        const toggle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.5), this.createMat({ color: 0xff2a4b, roughness: 0.2, metalness: 0.6 }));
        toggle.position.set(2.0 + tx, -2.3, 0.2);
        this.layer4VFD.add(toggle);
      });
      this.layer4VFD.add(mcbMesh);

      // 4. Surge Protection Device (SPD)
      const spdGeom = new THREE.BoxGeometry(1.4, 3.8, 1.6);
      const spdMesh = new THREE.Mesh(spdGeom, this.createMat({ color: 0x180f33, roughness: 0.4, metalness: 0.5 }));
      spdMesh.position.set(3.8, -2.5, -1.0);
      this.layer4VFD.add(spdMesh);

      this.rootGroup.add(this.layer4VFD);

      // =========================================================================
      // LAYER 5: 10.1" HMI SCADA TOUCHSCREEN & FRONT FASCIA (Frontmost)
      // =========================================================================
      const doorGeom = new THREE.BoxGeometry(13.4, 12.4, 0.4);
      const doorMat = this.createMat({
        color: 0x081933,
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity: 0.88
      });
      const doorMesh = new THREE.Mesh(doorGeom, doorMat);
      doorMesh.position.set(0, 0, 1.8);
      this.layer5HMI.add(doorMesh);

      // Chamfered Bezel Rim
      const rimGeom = new THREE.BoxGeometry(13.6, 12.6, 0.1);
      const rimMesh = new THREE.Mesh(rimGeom, this.createMat({ color: 0x00f0ff, wireframe: true, emissive: 0x00f0ff, emissiveIntensity: 0.8 }));
      rimMesh.position.set(0, 0, 2.05);
      this.layer5HMI.add(rimMesh);

      // 10.1" Glass Touchscreen Display with Dynamic Texture
      const screenGeom = new THREE.PlaneGeometry(10.8, 6.8);
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.98
      });
      this.hmiScreenMesh = new THREE.Mesh(screenGeom, screenMat);
      this.hmiScreenMesh.position.set(0, 1.6, 2.06);
      this.layer5HMI.add(this.hmiScreenMesh);

      // 22mm Mushroom Emergency Stop (E-STOP) Button
      const estopBaseGeom = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 24);
      const estopBase = new THREE.Mesh(estopBaseGeom, amberGlowMat);
      estopBase.rotation.x = Math.PI / 2;
      estopBase.position.set(-3.8, -3.8, 2.05);

      const estopCapGeom = new THREE.CylinderGeometry(0.7, 0.55, 0.5, 24);
      const estopCap = new THREE.Mesh(estopCapGeom, this.createMat({ color: 0xff2a4b, roughness: 0.2, metalness: 0.3, emissive: 0xff2a4b, emissiveIntensity: 1.5 }));
      estopCap.rotation.x = Math.PI / 2;
      estopCap.position.set(-3.8, -3.8, 2.35);

      this.layer5HMI.add(estopBase, estopCap);

      // Rotary 3-Position Selector Switch (HAND - OFF - AUTO)
      const selBase = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.25, 20), steelMat);
      selBase.rotation.x = Math.PI / 2;
      selBase.position.set(0, -3.8, 2.05);

      const selPointer = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.4), cyanGlowMat);
      selPointer.rotation.z = Math.PI / 4; // Pointing to AUTO
      selPointer.position.set(0, -3.8, 2.3);

      this.layer5HMI.add(selBase, selPointer);

      // Pilot Status Indicator Lights (R-Y-B Phase + RUN Green)
      [-1.2, -0.4, 0.4, 1.2].forEach((px, idx) => {
        const pCols = [0xff2a4b, 0xfbbf24, 0x38bdf8, 0x10b981];
        const pilot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), this.createMat({ color: pCols[idx], roughness: 0.1, emissive: pCols[idx], emissiveIntensity: 2.2 }));
        pilot.position.set(3.0 + px, -3.8, 2.15);
        this.layer5HMI.add(pilot);
      });

      this.rootGroup.add(this.layer5HMI);

      // =========================================================================
      // LAYER 6: FLANKING FIELD SENSORS (M18 Proximity & RTD Pt100)
      // =========================================================================
      // 1. M18 Inductive Proximity Sensor Puck (Right Flank)
      const proxGroup = new THREE.Group();
      const barrelGeom = new THREE.CylinderGeometry(0.45, 0.45, 2.6, 18);
      const barrel = new THREE.Mesh(barrelGeom, chromeMat);
      barrel.rotation.z = Math.PI / 2;
      proxGroup.add(barrel);

      // Lock Nuts
      const nutGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.35, 6);
      const nut1 = new THREE.Mesh(nutGeom, chromeMat);
      nut1.rotation.z = Math.PI / 2;
      nut1.position.x = -0.4;
      const nut2 = new THREE.Mesh(nutGeom, chromeMat);
      nut2.rotation.z = Math.PI / 2;
      nut2.position.x = 0.4;
      proxGroup.add(nut1, nut2);

      // Sensing Face & Radiating Flux Rings
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.2, 16), amberGlowMat);
      face.rotation.z = Math.PI / 2;
      face.position.x = 1.35;
      proxGroup.add(face);

      // 3 Expanding Pulse Torus Rings
      for (let r = 0; r < 3; r++) {
        const ringGeom = new THREE.TorusGeometry(0.7 + r * 0.4, 0.04, 8, 24);
        const ring = new THREE.Mesh(ringGeom, cyanGlowMat);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = 1.8 + r * 0.5;
        proxGroup.add(ring);
      }

      proxGroup.position.set(9.2, 3.2, 2.2);
      this.layer6Sensors.add(proxGroup);

      // 2. Pt100 RTD Industrial Temperature Sensor Probe (Left Flank)
      const rtdGroup = new THREE.Group();
      const rtdHead = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.75, 1.2, 16), steelMat);
      rtdHead.position.y = 1.2;
      rtdGroup.add(rtdHead);

      const rtdProbe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 14), chromeMat);
      rtdProbe.position.y = -0.8;
      rtdGroup.add(rtdProbe);

      const heatTip = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), violetGlowMat);
      heatTip.position.y = -2.4;
      rtdGroup.add(heatTip);

      rtdGroup.position.set(-9.2, -2.4, 2.0);
      this.layer6Sensors.add(rtdGroup);

      this.rootGroup.add(this.layer6Sensors);
    }

    buildHMIScreenTexture() {
      this.hmiCanvas = document.createElement('canvas');
      this.hmiCanvas.width = 1024;
      this.hmiCanvas.height = 640;
      this.hmiCtx = this.hmiCanvas.getContext('2d');

      this.hmiTexture = new THREE.CanvasTexture(this.hmiCanvas);
      this.hmiTexture.minFilter = THREE.LinearFilter;
      this.hmiTexture.magFilter = THREE.LinearFilter;

      if (this.hmiScreenMesh) {
        this.hmiScreenMesh.material.map = this.hmiTexture;
        this.hmiScreenMesh.material.needsUpdate = true;
      }
    }

    renderHMIScreen(time) {
      if (!this.hmiCtx) return;
      const ctx = this.hmiCtx;
      const w = 1024, h = 640;

      // Background Cyber Screen Glass
      ctx.fillStyle = '#030814';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Top Status Header Bar
      ctx.fillStyle = '#051329';
      ctx.fillRect(16, 16, w - 32, 48);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.strokeRect(16, 16, w - 32, 48);

      // Beacon LED
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(42, 40, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;

      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PARI SCADA // MIDC BHOSARI PLANT', 60, 47);
      ctx.shadowBlur = 0;

      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'right';
      ctx.fillText('SCAN: 1.18ms • VFD CLOSED-LOOP ACTIVE', w - 36, 46);
      ctx.textAlign = 'left';

      // 1. Left Tachometer Gauge (RPM)
      const cx = 220, cy = 230, radius = 120;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 2.25);
      ctx.stroke();

      // Active Neon Tachometer Arc
      const rpmRatio = (this.telemetry.rpm / 1800);
      const endAngle = Math.PI * 0.75 + rpmRatio * Math.PI * 1.5;
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI * 0.75, endAngle);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Needle Pointer
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(endAngle) * (radius - 15), cy + Math.sin(endAngle) * (radius - 15));
      ctx.stroke();

      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(this.telemetry.rpm)}`, cx, cy + 10);
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('VFD MOTOR RPM', cx, cy + 36);

      // 2. Right Signal Oscillograph Waveform
      const gx = 440, gy = 90, gw = 540, gh = 260;
      ctx.fillStyle = '#020610';
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.strokeRect(gx, gy, gw, gh);

      // Channel 1 Flux Wave (Cyan)
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let x = 0; x < gw; x++) {
        const y = gy + gh / 2 + Math.sin(x * 0.035 + time * 4) * 65 + Math.sin(x * 0.07 + time * 6) * 15;
        if (x === 0) ctx.moveTo(gx + x, y);
        else ctx.lineTo(gx + x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Channel 2 Current Wave (Violet)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < gw; x++) {
        const y = gy + gh / 2 + Math.sin(x * 0.035 + time * 4 + Math.PI / 3) * 45;
        if (x === 0) ctx.moveTo(gx + x, y);
        else ctx.lineTo(gx + x, y);
      }
      ctx.stroke();

      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`${this.telemetry.freq.toFixed(2)} Hz`, gx + 15, gy + 32);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText('CH1: FLUX • CH2: CURRENT RMS', gx + gw - 15, gy + 32);
      ctx.textAlign = 'left';

      // 3. Bottom 3-Phase Telemetry Metrics Strip
      const cellW = (w - 64) / 4;
      const metrics = [
        { label: '3-PHASE VOLTS', val: `${this.telemetry.voltage.toFixed(1)} V`, col: '#fbbf24' },
        { label: 'CURRENT LOAD', val: `${this.telemetry.amps.toFixed(2)} A`, col: '#10b981' },
        { label: 'HEATSINK TEMP', val: `${this.telemetry.temp.toFixed(1)} °C`, col: '#00f0ff' },
        { label: 'POWER FACTOR', val: '0.98 COS φ', col: '#a855f7' }
      ];

      metrics.forEach((m, idx) => {
        const mx = 24 + idx * (cellW + 5);
        ctx.fillStyle = '#051224';
        ctx.fillRect(mx, 380, cellW, 110);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.strokeRect(mx, 380, cellW, 110);

        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(m.label, mx + 16, 408);

        ctx.font = 'bold 26px "JetBrains Mono", monospace';
        ctx.fillStyle = m.col;
        ctx.fillText(m.val, mx + 16, 452);
      });

      // 4. Softkeys Touch Navigation Ribbon
      const btnW = (w - 74) / 5;
      const softkeys = ['[F1 AUTO]', '[F2 MANUAL]', '[F3 ALARMS]', '[F4 TRENDS]', '[SYS SETUP]'];
      softkeys.forEach((btn, idx) => {
        const bx = 24 + idx * (btnW + 6);
        ctx.fillStyle = idx === 0 ? '#0c2e56' : '#061328';
        ctx.fillRect(bx, 520, btnW, 80);
        ctx.strokeStyle = idx === 0 ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)';
        ctx.strokeRect(bx, 520, btnW, 80);

        ctx.font = 'bold 18px "JetBrains Mono", monospace';
        ctx.fillStyle = idx === 0 ? '#00f0ff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(btn, bx + btnW / 2, 566);
      });

      this.hmiTexture.needsUpdate = true;
    }

    buildParticleField() {
      const pCount = 140;
      const pGeom = new THREE.BufferGeometry();
      const pPositions = new Float32Array(pCount * 3);
      const pSpeeds = [];

      for (let i = 0; i < pCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 36;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 25;

        pSpeeds.push({
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        });
      }

      pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.28,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });

      this.particleSystem = new THREE.Points(pGeom, pMat);
      this.particleSpeeds = pSpeeds;
      this.scene.add(this.particleSystem);
    }

    build3DLeaderTraces() {
      this.scene.add(this.laserLinesGroup);
    }

    setupControls() {
      // 1. Mouse Drag to Orbit in 360°
      const onPointerDown = (e) => {
        this.isDragging = true;
        this.isAutoRotating = false;
        this.previousMousePosition = { x: e.clientX || (e.touches && e.touches[0].clientX), y: e.clientY || (e.touches && e.touches[0].clientY) };
      };

      const onPointerMove = (e) => {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (this.isDragging && clientX && clientY) {
          const deltaX = clientX - this.previousMousePosition.x;
          const deltaY = clientY - this.previousMousePosition.y;

          this.targetRotation.y += deltaX * 0.008;
          this.targetRotation.x += deltaY * 0.008;

          // Clamp pitch rotation
          this.targetRotation.x = Math.max(-0.8, Math.min(0.8, this.targetRotation.x));

          this.previousMousePosition = { x: clientX, y: clientY };
        }

        // Mouse Parallax Sheen
        const rect = this.container.getBoundingClientRect();
        if (clientX && clientY && rect.width > 0) {
          this.mouseParallax.targetX = ((clientX - rect.left) / rect.width - 0.5) * 0.4;
          this.mouseParallax.targetY = ((clientY - rect.top) / rect.height - 0.5) * 0.4;
        }
      };

      const onPointerUp = () => {
        this.isDragging = false;
      };

      this.canvas.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove, { passive: true });
      window.addEventListener('mouseup', onPointerUp);

      this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      // 2. Interactive Explosion Button / Sliders
      const btnExplode = document.getElementById('btn-3d-explode-toggle');
      if (btnExplode) {
        btnExplode.addEventListener('click', () => {
          this.targetExplosion = this.targetExplosion > 0.5 ? 0.0 : 1.0;
          if (window.soundFX) window.soundFX.click();
        });
      }

      const btnAutoRot = document.getElementById('btn-3d-autorotate-toggle');
      if (btnAutoRot) {
        btnAutoRot.addEventListener('click', () => {
          this.isAutoRotating = !this.isAutoRotating;
          btnAutoRot.classList.toggle('active', this.isAutoRotating);
          if (window.soundFX) window.soundFX.click();
        });
      }
    }

    setupScrollSync() {
      // Synchronize scroll progression with 3D explosion
      const track = document.getElementById('hero-scroll-track') || document.getElementById('hero');
      if (!track) return;

      const updateScrollExplosion = () => {
        const rect = track.getBoundingClientRect();
        const totalScroll = track.offsetHeight - window.innerHeight;
        if (totalScroll > 0) {
          const scrolled = -rect.top;
          const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
          this.targetExplosion = progress;
        }
      };

      window.addEventListener('scroll', updateScrollExplosion, { passive: true });
      updateScrollExplosion();
    }

    update3DExplosion(p) {
      // Clamped smooth ease
      const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const val = ease(p);

      // Layer 1: CRCA Enclosure Box (Sinks Deep Back: z = 0 -> -11.5)
      this.layer1Enclosure.position.z = -val * 11.5;
      this.layer1Enclosure.position.y = -val * 1.5;
      this.layer1Enclosure.rotation.x = val * 0.08;

      // Layer 2: DIN Rails & Terminals (Shifts Back-Left: z = 0 -> -6.0, x = 0 -> -3.2)
      this.layer2DinRail.position.z = -val * 6.0;
      this.layer2DinRail.position.x = -val * 3.2;
      this.layer2DinRail.rotation.x = val * 0.05;

      // Layer 3: PLC Controller CPU & I/O (Translates Up-Right: z = 0 -> 2.5, y = 0 -> 4.5, x = 0 -> 3.5)
      this.layer3PLC.position.z = val * 2.5;
      this.layer3PLC.position.y = val * 4.5;
      this.layer3PLC.position.x = val * 3.5;
      this.layer3PLC.rotation.y = -val * 0.15;

      // Layer 4: VFD Drive Inverter & SMPS (Translates Down-Left: z = 0 -> 3.0, y = 0 -> -4.5, x = 0 -> -3.8)
      this.layer4VFD.position.z = val * 3.0;
      this.layer4VFD.position.y = -val * 4.5;
      this.layer4VFD.position.x = -val * 3.8;
      this.layer4VFD.rotation.y = val * 0.15;

      // Layer 5: 10.1" HMI SCADA Display (Translates Center-Forward: z = 0 -> 10.5)
      this.layer5HMI.position.z = val * 10.5;
      this.layer5HMI.scale.setScalar(1.0 + val * 0.08);

      // Layer 6: Flanking Sensors (Explodes Outward: x = 0 -> 4.5 / -4.5, z = 0 -> 7.0)
      this.layer6Sensors.position.z = val * 7.0;

      // Update HUD Scrubber in DOM
      const pct = Math.round(p * 100);
      const pBar = document.getElementById('ghost-progress-bar');
      const pVal = document.getElementById('ghost-progress-val');
      const pText = document.getElementById('ghost-status-text');

      if (pBar) pBar.style.width = `${pct}%`;
      if (pVal) pVal.textContent = `${pct}%`;
      if (pText) {
        if (pct < 10) pText.textContent = 'ASSEMBLED 3D STATE • SCROLL OR DRAG TO EXPLODE';
        else if (pct < 50) pText.textContent = 'STAGE 1: CHASSIS & DIN TERMINALS DETACHING';
        else if (pct < 85) pText.textContent = 'STAGE 2: PLC CPU, VFD & HMI ISOLATING IN 3D';
        else pText.textContent = 'STAGE 3: FULL 360° EXPLODED VIEW DEPLOYED';
      }

      // Update Callout Pills opacity & 3D tracking
      const callouts = document.querySelectorAll('.ghost-callout-pill');
      callouts.forEach(pill => {
        const trigger = parseFloat(pill.dataset.trigger || '0.5');
        const op = Math.max(0, Math.min(1, (p - (trigger - 0.15)) / 0.25));
        pill.style.opacity = op.toFixed(3);
        pill.style.transform = `translate3d(0, ${(1 - op) * 12}px, 0)`;
        pill.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
      });
    }

    onResize() {
      if (!this.renderer || !this.camera || !this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    animate() {
      requestAnimationFrame(this.animate);

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // 1. Continuous Floating & Breathing Physics
      const floatY = Math.sin(time * 1.4) * 0.35;
      const floatRotZ = Math.sin(time * 0.9) * 0.02;
      this.rootGroup.position.y = floatY;
      this.rootGroup.rotation.z = floatRotZ;

      // 2. Auto-Rotation & Drag Orbit Smoothing
      if (this.isAutoRotating) {
        this.targetRotation.y += delta * this.autoRotateSpeed;
      }

      this.mouseParallax.x += (this.mouseParallax.targetX - this.mouseParallax.x) * 0.08;
      this.mouseParallax.y += (this.mouseParallax.targetY - this.mouseParallax.y) * 0.08;

      this.manualRotation.x += (this.targetRotation.x - this.manualRotation.x) * 0.08;
      this.manualRotation.y += (this.targetRotation.y - this.manualRotation.y) * 0.08;

      this.pivotGroup.rotation.x = this.manualRotation.x + this.mouseParallax.y;
      this.pivotGroup.rotation.y = this.manualRotation.y + this.mouseParallax.x;

      // 3. Smooth 3D Explosion Interpolation
      this.explosionProgress += (this.targetExplosion - this.explosionProgress) * 0.1;
      this.update3DExplosion(this.explosionProgress);

      // 4. Update Blinking 3D LEDs
      this.ledList.forEach(item => {
        if (item.freq > 0) {
          const pulse = (Math.sin(time * item.freq * Math.PI) + 1) / 2;
          item.mesh.material.emissiveIntensity = 0.5 + pulse * 2.2;
        }
      });

      // 5. Update Floating Cyber Particles
      if (this.particleSystem) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < this.particleSpeeds.length; i++) {
          positions[i * 3] += this.particleSpeeds[i].x;
          positions[i * 3 + 1] += this.particleSpeeds[i].y;
          positions[i * 3 + 2] += this.particleSpeeds[i].z;

          if (Math.abs(positions[i * 3]) > 18) this.particleSpeeds[i].x *= -1;
          if (Math.abs(positions[i * 3 + 1]) > 15) this.particleSpeeds[i].y *= -1;
          if (Math.abs(positions[i * 3 + 2]) > 12) this.particleSpeeds[i].z *= -1;
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      // 6. Dynamic Telemetry Jitter & 60FPS HMI Canvas Screen Render
      this.telemetry.rpm = 1495 + Math.sin(time * 2.5) * 12 + (Math.random() - 0.5) * 4;
      this.telemetry.freq = 50.0 + Math.sin(time * 1.8) * 0.08;
      this.telemetry.voltage = 415.4 + (Math.random() - 0.5) * 0.4;
      this.telemetry.amps = 8.84 + Math.sin(time * 3.0) * 0.25;
      this.renderHMIScreen(time);

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Export to Global
  window.Hero3DExplodedEngine = Hero3DExplodedEngine;

  function init3DHero() {
    window.hero3dEngine = new Hero3DExplodedEngine();
    window.addEventListener('resize', () => {
      if (window.hero3dEngine) window.hero3dEngine.onResize();
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DHero);
  } else {
    init3DHero();
  }
})();
