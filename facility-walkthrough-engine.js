/**
 * Pushpa Automation & Robotics Industries (MIDC Bhosari, Pune)
 * First-Person 3D Control Cabinet & Facility Interior Walkthrough Engine
 * Stack: Three.js + EffectComposer (UnrealBloomPass) + CatmullRomCurve3 Path Navigation
 */

class FacilityWalkthroughEngine {
  constructor(containerId = 'walkthrough-viewport', canvasId = 'walkthrough-canvas') {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById(canvasId);
    if (!this.container || !this.canvas) return;

    this.isInitialized = false;
    this.isActive = true;
    this.currentWaypoint = 0;
    this.targetT = 0;
    this.currentT = 0;
    this.transitionSpeed = 0.045; // Smooth interpolation speed

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.bloomPass = null;
    this.clock = new THREE.Clock();

    // Scene Groups & Interactive Elements
    this.worldGroup = new THREE.Group();
    this.cabinetDoor = null;
    this.cabinetInterior = new THREE.Group();
    this.plantFloor = new THREE.Group();
    this.hmiScreenTexture = null;
    this.hmiCanvas = null;
    this.hmiCtx = null;
    this.ledMeshList = [];
    this.pulsingWires = [];
    this.wholePathTube = null;

    // Spline Curve Camera Path (10 Waypoints)
    this.curvePath = null;
    this.lookCurvePath = null;

    // Head Look-Around / Mouse Parallax
    this.mouseLook = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Waypoint Metadata (Minimal In-Game Location HUD)
    this.waypoints = [
      {
        idx: 0,
        t: 0.00,
        tag: '› 01 // INDUSTRIAL ENCLOSURE // MIDC BHOSARI PLANT',
        desc: 'IP65 Gasketed Mild-Steel Control Cabinet Exterior on Factory Plant Wall',
        doorOpenAngle: 0.0
      },
      {
        idx: 1,
        t: 0.11,
        tag: '› 02 // ACCESS HATCH // DOOR INGRESS',
        desc: 'Passing Through Anti-Vibration Gasketed Door into DIN Rack Enclosure',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 2,
        t: 0.22,
        tag: '› 03 // TS35 DIN RAIL & WIRE TRUNKING',
        desc: 'Zinc-Plated Slotted DIN Rail with Slotted PVC Finger Cable Trunking',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 3,
        t: 0.33,
        tag: '› 04 // 24V DC POWER SUPPLY UNIT (PSU)',
        desc: 'Regulated Industrial SMPS with Dual Copper Chokes & DC-OK LED',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 4,
        t: 0.44,
        tag: '› 05 // CPU & IEC 61131-3 LOGIC PROCESSOR',
        desc: '32-Bit Microprocessor Core with Active RUN / SCAN / COMM Status LEDs',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 5,
        t: 0.55,
        tag: '› 06 // DIGITAL & ANALOG I/O TERMINALS',
        desc: 'Galvanically Isolated Optocoupler Slices & 16-Bit Signal Terminations',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 6,
        t: 0.66,
        tag: '› 07 // OVERHEAD CONDUIT & CABLE TRAY',
        desc: 'Shielded Trunk Cable Exiting Cabinet into Plant Overhead Cable Rack',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 7,
        t: 0.77,
        tag: '› 08 // 7" HMI OPERATOR COCKPIT',
        desc: 'Machine-Side Sunlight-Readable Touch Mimic Display on Pedestal Stand',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 8,
        t: 0.88,
        tag: '› 09 // SCADA SERVER RACK & SQL RTU',
        desc: 'Supervisory Historian Database Server & High-Reliability Telemetry RTU',
        doorOpenAngle: Math.PI * 0.62
      },
      {
        idx: 9,
        t: 1.00,
        tag: '› 10 // FULL AUTOMATION TOPOLOGY OVERVIEW',
        desc: 'Continuous End-to-End Plant Signal & Power Architecture Connectivity',
        doorOpenAngle: Math.PI * 0.62
      }
    ];

    // DOM UI Hooks
    this.hudTagEl = document.getElementById('tour-hud-location-tag');
    this.hudDescEl = document.getElementById('tour-hud-location-desc');
    this.hudStepEl = document.getElementById('tour-hud-step-counter');
    this.dotsContainer = document.getElementById('tour-dots-trail');
    this.prevBtn = document.getElementById('tour-prev-btn');
    this.nextBtn = document.getElementById('tour-next-btn');

    this.init();
  }

  init() {
    try {
      this.setupThreeScene();
      this.setupCameraSplinePaths();
      this.buildLighting();
      this.buildFactoryEnvironment();
      this.buildControlCabinet();
      this.buildHmiStation();
      this.buildScadaServerRack();
      this.buildContinuousSignalCable();
      this.setupPostProcessing();
      this.setupEventListeners();
      this.buildDotsIndicator();

      this.isInitialized = true;
      this.updateHUD(0);
      this.animate();
    } catch (err) {
      console.warn('Walkthrough Scene initialization notice:', err);
    }
  }

  setupThreeScene() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040811);
    this.scene.fog = new THREE.FogExp2(0x040811, 0.024);

    this.camera = new THREE.PerspectiveCamera(54, width / height, 0.05, 150);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.scene.add(this.worldGroup);
  }

  setupCameraSplinePaths() {
    // 10 Camera Positions along real interior route
    const camPoints = [
      new THREE.Vector3(-22, 1.2, 16),    // 0: Outside door facing cabinet
      new THREE.Vector3(-16, 1.5, 9.5),   // 1: Approaching hinged door
      new THREE.Vector3(-10, 1.6, 5.0),   // 2: Entering DIN rail corridor
      new THREE.Vector3(-8.0, 1.7, 3.2),  // 3: 24V PSU switchmode converter
      new THREE.Vector3(-3.5, 1.6, 2.8),  // 4: 32-bit PLC CPU microprocessor
      new THREE.Vector3(0.5, 1.6, 2.8),   // 5: Optical isolated I/O terminal slices
      new THREE.Vector3(6.5, 3.8, 6.0),   // 6: Overhead conduit raceway traversal
      new THREE.Vector3(12.5, 1.5, 6.0),  // 7: HMI color touchscreen station
      new THREE.Vector3(18.5, 1.8, 8.5),  // 8: Plant SCADA telemetry server rack
      new THREE.Vector3(8.0, 5.5, 18.0)   // 9: Plant floor panoramic overview
    ];

    // 10 Look-At Targets
    const lookPoints = [
      new THREE.Vector3(-10, 1.5, 0),     // 0: Look at cabinet door
      new THREE.Vector3(-9, 1.5, 0),      // 1: Look at hinge latch
      new THREE.Vector3(-5, 1.6, 0),      // 2: Look down DIN rail center
      new THREE.Vector3(-8.2, 1.6, 0),    // 3: Look directly at PSU
      new THREE.Vector3(-3.5, 1.6, 0),    // 4: Look directly at CPU processor
      new THREE.Vector3(0.8, 1.6, 0),     // 5: Look at I/O terminals
      new THREE.Vector3(10, 4.0, 6.0),    // 6: Look along overhead conduit
      new THREE.Vector3(12.5, 1.4, 5.5),  // 7: Look at HMI screen
      new THREE.Vector3(19.0, 1.8, 10.0), // 8: Look at SCADA server blade
      new THREE.Vector3(0, 1.0, 4.0)      // 9: Look across whole factory floor
    ];

    this.curvePath = new THREE.CatmullRomCurve3(camPoints, false, 'centripetal', 0.35);
    this.lookCurvePath = new THREE.CatmullRomCurve3(lookPoints, false, 'centripetal', 0.35);

    // Initial position
    const p0 = this.curvePath.getPointAt(0);
    const l0 = this.lookCurvePath.getPointAt(0);
    this.camera.position.copy(p0);
    this.camera.lookAt(l0);
  }

  buildLighting() {
    // 1. Ambient Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x1e3a5f, 0x07111e, 1.2);
    this.scene.add(hemiLight);

    // 2. Factory Ceiling Bay Lights (Electric Cyan & Cobalt SCADA wash)
    const bayLight1 = new THREE.PointLight(0x00f0ff, 1.5, 30, 1.8);
    bayLight1.position.set(-8, 7, 6);
    this.scene.add(bayLight1);

    const bayLight2 = new THREE.PointLight(0x38bdf8, 1.3, 34, 1.8);
    bayLight2.position.set(12, 8, 10);
    this.scene.add(bayLight2);

    // 3. Local Cabinet Interior Inspection Light
    const cabinetLight = new THREE.PointLight(0x00f0ff, 1.8, 12, 2);
    cabinetLight.position.set(-5, 2.5, 1.0);
    this.scene.add(cabinetLight);

    // 4. Directional Accent Rim Light
    const rimLight = new THREE.DirectionalLight(0xfbbf24, 0.85);
    rimLight.position.set(20, 15, -10);
    this.scene.add(rimLight);
  }

  // Material Builder Helper
  createMat(color, roughness = 0.5, metalness = 0.7, emissive = 0x000000, emissiveIntensity = 0) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: metalness,
      emissive: emissive,
      emissiveIntensity: emissiveIntensity
    });
  }

  buildFactoryEnvironment() {
    // 1. Plant Floor Grid Tiles
    const floorGeom = new THREE.PlaneGeometry(120, 100);
    const floorMat = this.createMat(0x0c160e, 0.65, 0.4);
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -2.8, 10);
    this.plantFloor.add(floor);

    // Grid Lines on Floor
    const gridHelper = new THREE.GridHelper(100, 50, 0x39ff14, 0x122e17);
    gridHelper.position.set(0, -2.78, 10);
    this.plantFloor.add(gridHelper);

    // 2. Factory Plant Wall Behind Cabinet
    const wallGeom = new THREE.BoxGeometry(60, 24, 1);
    const wallMat = this.createMat(0x071109, 0.85, 0.2);
    const wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.set(-5, 7.5, -3.5);
    this.plantFloor.add(wall);

    // 3. Background Machinery Silhouettes (Pumps, Tanks, Transformers)
    for (let i = 0; i < 4; i++) {
      const tankGeom = new THREE.CylinderGeometry(2.2, 2.2, 7.5, 16);
      const tankMat = this.createMat(0x09140b, 0.7, 0.5);
      const tank = new THREE.Mesh(tankGeom, tankMat);
      tank.position.set(-28 + i * 16, 0.95, -14);
      this.plantFloor.add(tank);
    }

    this.worldGroup.add(this.plantFloor);
  }

  buildControlCabinet() {
    // Outer Cabinet Enclosure Housing (CRCA Sheet Metal)
    const bodyGeom = new THREE.BoxGeometry(18, 9.5, 3.6);
    const bodyMat = this.createMat(0x0f1a11, 0.5, 0.7);
    const cabinetBody = new THREE.Mesh(bodyGeom, bodyMat);
    cabinetBody.position.set(-5.5, 1.8, -1.8);
    this.worldGroup.add(cabinetBody);

    // Cabinet Interior Cavity (Backplate)
    const backplateGeom = new THREE.BoxGeometry(17.2, 8.8, 0.2);
    const backplateMat = this.createMat(0x132416, 0.4, 0.8);
    const backplate = new THREE.Mesh(backplateGeom, backplateMat);
    backplate.position.set(-5.5, 1.8, -1.2);
    this.worldGroup.add(backplate);

    // -------------------------------------------------------------
    // ANIMATED CABINET ENCLOSURE DOOR WITH HINGE PIVOT
    // -------------------------------------------------------------
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-14.4, 1.8, 0.0); // Hinge location on left

    const doorGeom = new THREE.BoxGeometry(17.6, 9.2, 0.25);
    const doorMat = this.createMat(0x111c13, 0.45, 0.65);
    const doorMesh = new THREE.Mesh(doorGeom, doorMat);
    doorMesh.position.set(8.8, 0, 0); // Offset so pivot is on the edge
    doorPivot.add(doorMesh);

    // Door Warning Emblem / Handle
    const handleGeom = new THREE.BoxGeometry(0.3, 2.2, 0.4);
    const handleMat = this.createMat(0xffb000, 0.3, 0.9, 0xffb000, 0.25);
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.set(16.8, 0, 0.25);
    doorPivot.add(handle);

    this.cabinetDoor = doorPivot;
    this.worldGroup.add(doorPivot);

    // -------------------------------------------------------------
    // TS35 DIN RAILS (Top & Middle & Bottom)
    // -------------------------------------------------------------
    const dinRailGeom = new THREE.BoxGeometry(16.5, 0.35, 0.15);
    const dinRailMat = this.createMat(0x2a3e2e, 0.3, 0.95);

    const dinRailTop = new THREE.Mesh(dinRailGeom, dinRailMat);
    dinRailTop.position.set(-5.5, 3.2, -0.9);

    const dinRailMid = new THREE.Mesh(dinRailGeom, dinRailMat);
    dinRailMid.position.set(-5.5, 1.2, -0.9);

    const dinRailBot = new THREE.Mesh(dinRailGeom, dinRailMat);
    dinRailBot.position.set(-5.5, -0.8, -0.9);

    this.cabinetInterior.add(dinRailTop, dinRailMid, dinRailBot);

    // -------------------------------------------------------------
    // PVC FINGER WIRE TRUNKING (Grey Slotted Cable Ducts)
    // -------------------------------------------------------------
    const ductMat = this.createMat(0x1a261c, 0.7, 0.2);

    // Horizontal ducts
    const hDuctGeom = new THREE.BoxGeometry(16.5, 0.6, 0.5);
    const hDuct1 = new THREE.Mesh(hDuctGeom, ductMat);
    hDuct1.position.set(-5.5, 4.4, -0.85);
    const hDuct2 = new THREE.Mesh(hDuctGeom, ductMat);
    hDuct2.position.set(-5.5, -1.9, -0.85);
    this.cabinetInterior.add(hDuct1, hDuct2);

    // Vertical side ducts
    const vDuctGeom = new THREE.BoxGeometry(0.6, 7.8, 0.5);
    const vDuctLeft = new THREE.Mesh(vDuctGeom, ductMat);
    vDuctLeft.position.set(-13.4, 1.3, -0.85);
    const vDuctRight = new THREE.Mesh(vDuctGeom, ductMat);
    vDuctRight.position.set(2.4, 1.3, -0.85);
    this.cabinetInterior.add(vDuctLeft, vDuctRight);

    // -------------------------------------------------------------
    // 1. POWER SUPPLY UNIT (PSU) - x: -8.2
    // -------------------------------------------------------------
    const psuGroup = new THREE.Group();
    const psuBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 1.8), this.createMat(0x0e1b11, 0.4, 0.8));
    psuGroup.add(psuBox);

    // Heatsink fins
    for (let f = 0; f < 6; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 1.2), this.createMat(0x182c1b, 0.3, 0.9));
      fin.position.set(-0.9 + f * 0.36, 0.3, 0.9);
      psuGroup.add(fin);
    }

    // DC-OK Status LED
    const psuLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      this.createMat(0x39ff14, 0.1, 0.2, 0x39ff14, 2.2)
    );
    psuLed.position.set(0.7, 1.3, 0.95);
    psuGroup.add(psuLed);
    this.ledMeshList.push({ mesh: psuLed, freq: 2.5, baseColor: 0x39ff14 });

    psuGroup.position.set(-8.2, 1.6, -0.2);
    this.cabinetInterior.add(psuGroup);

    // -------------------------------------------------------------
    // 2. CPU & PLC PROCESSOR MODULE - x: -3.5
    // -------------------------------------------------------------
    const cpuGroup = new THREE.Group();
    const cpuBox = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 1.9), this.createMat(0x0a160d, 0.35, 0.85));
    cpuGroup.add(cpuBox);

    // 32-Bit SoC Microchip Die Plate
    const chipMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 0.15),
      this.createMat(0x050c07, 0.2, 0.9, 0x39ff14, 0.65)
    );
    chipMesh.position.set(0, 0.4, 0.98);
    cpuGroup.add(chipMesh);

    // 4 Staggered Status LEDs: PWR, RUN, COMM, SCAN
    const ledColors = [0x39ff14, 0x39ff14, 0x00f0ff, 0xffb000];
    ledColors.forEach((col, idx) => {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        this.createMat(col, 0.1, 0.2, col, 2.0)
      );
      led.position.set(-0.9 + idx * 0.6, 1.5, 0.98);
      cpuGroup.add(led);
      this.ledMeshList.push({ mesh: led, freq: 1.8 + idx * 0.9, baseColor: col });
    });

    cpuGroup.position.set(-3.5, 1.6, -0.2);
    this.cabinetInterior.add(cpuGroup);

    // -------------------------------------------------------------
    // 3. DIGITAL & ANALOG I/O TERMINAL SLICES - x: 1.8
    // -------------------------------------------------------------
    const ioGroup = new THREE.Group();
    for (let s = 0; s < 6; s++) {
      const sliceGeom = new THREE.BoxGeometry(0.48, 3.6, 1.7);
      const sliceMat = this.createMat(s < 4 ? 0x0e1c12 : 0x111c1d, 0.4, 0.75);
      const slice = new THREE.Mesh(sliceGeom, sliceMat);
      slice.position.set(-1.2 + s * 0.52, 0, 0);
      ioGroup.add(slice);

      // Terminal Screw contacts
      for (let sc = 0; sc < 4; sc++) {
        const screw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8),
          this.createMat(0xffb000, 0.2, 0.95)
        );
        screw.rotation.x = Math.PI / 2;
        screw.position.set(-1.2 + s * 0.52, 1.2 - sc * 0.7, 0.88);
        ioGroup.add(screw);
      }
    }

    ioGroup.position.set(0.6, 1.6, -0.2);
    this.cabinetInterior.add(ioGroup);

    this.worldGroup.add(this.cabinetInterior);
  }

  buildHmiStation() {
    const hmiGroup = new THREE.Group();

    // Pedestal Stand
    const standGeom = new THREE.CylinderGeometry(0.2, 0.25, 4.2, 12);
    const standMat = this.createMat(0x132216, 0.5, 0.8);
    const stand = new THREE.Mesh(standGeom, standMat);
    stand.position.set(0, -0.7, 0);
    hmiGroup.add(stand);

    // Base Plate
    const baseGeom = new THREE.CylinderGeometry(1.2, 1.3, 0.2, 16);
    const base = new THREE.Mesh(baseGeom, standMat);
    base.position.set(0, -2.7, 0);
    hmiGroup.add(base);

    // 7" Bezel Enclosure
    const bezelGeom = new THREE.BoxGeometry(3.6, 2.4, 0.4);
    const bezelMat = this.createMat(0x0e1b11, 0.4, 0.8, 0x39ff14, 0.15);
    const bezel = new THREE.Mesh(bezelGeom, bezelMat);
    bezel.position.set(0, 1.4, 0);
    bezel.rotation.x = -0.2; // Angled up toward eye-level
    hmiGroup.add(bezel);

    // Dynamic Live 2D HTML5 Canvas Texture for Screen
    this.hmiCanvas = document.createElement('canvas');
    this.hmiCanvas.width = 512;
    this.hmiCanvas.height = 320;
    this.hmiCtx = this.hmiCanvas.getContext('2d');

    this.hmiScreenTexture = new THREE.CanvasTexture(this.hmiCanvas);
    this.hmiScreenTexture.minFilter = THREE.LinearFilter;

    const screenGeom = new THREE.PlaneGeometry(3.2, 2.0);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.hmiScreenTexture,
      toneMapped: false
    });
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.set(0, 1.4, 0.22);
    screenMesh.rotation.x = -0.2;
    hmiGroup.add(screenMesh);

    hmiGroup.position.set(12.5, 0, 5.5);
    this.worldGroup.add(hmiGroup);
  }

  buildScadaServerRack() {
    const scadaGroup = new THREE.Group();

    // 19" Server Cabinet Outer Frame
    const rackGeom = new THREE.BoxGeometry(3.6, 8.4, 3.2);
    const rackMat = this.createMat(0x08130a, 0.5, 0.85);
    const rackFrame = new THREE.Mesh(rackGeom, rackMat);
    rackFrame.position.set(0, 1.4, 0);
    scadaGroup.add(rackFrame);

    // Server Blade Trays
    for (let b = 0; b < 5; b++) {
      const bladeGeom = new THREE.BoxGeometry(3.2, 1.0, 3.0);
      const bladeMat = this.createMat(0x0e1d12, 0.35, 0.8, 0x00f0ff, 0.12);
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(0, 4.2 - b * 1.4, 0.1);
      scadaGroup.add(blade);

      // Status Beacons on Blade
      for (let l = 0; l < 3; l++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          this.createMat(0x00f0ff, 0.1, 0.2, 0x00f0ff, 2.0)
        );
        led.position.set(-1.0 + l * 0.5, 4.2 - b * 1.4, 1.62);
        scadaGroup.add(led);
        this.ledMeshList.push({ mesh: led, freq: 2.2 + l * 0.7 + b * 0.4, baseColor: 0x00f0ff });
      }
    }

    scadaGroup.position.set(19.0, 0, 9.5);
    this.worldGroup.add(scadaGroup);
  }

  buildContinuousSignalCable() {
    // Continuous 3D Conduit & Data Cable connecting Cabinet -> Overhead -> HMI -> SCADA
    const cablePoints = [
      new THREE.Vector3(-3.5, 1.6, -0.2), // From CPU
      new THREE.Vector3(2.4, 1.6, -0.2),  // Through side duct
      new THREE.Vector3(3.0, 4.5, -0.2),  // Up cabinet chimney
      new THREE.Vector3(6.5, 5.8, 2.0),   // Overhead conduit bridge
      new THREE.Vector3(12.5, 4.5, 4.0),  // Down toward HMI pedestal
      new THREE.Vector3(12.5, 0.4, 5.5),  // Into HMI station
      new THREE.Vector3(14.0, 0.2, 6.5),  // Underfloor conduit to SCADA
      new THREE.Vector3(19.0, 0.6, 9.5)   // Into SCADA server rack
    ];

    const cableCurve = new THREE.CatmullRomCurve3(cablePoints, false, 'centripetal', 0.4);
    const tubeGeom = new THREE.TubeGeometry(cableCurve, 64, 0.1, 8, false);

    // Emissive Green Glowing Signal Cable
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x112815,
      emissive: 0x39ff14,
      emissiveIntensity: 1.8,
      roughness: 0.3,
      metalness: 0.9
    });

    this.wholePathTube = new THREE.Mesh(tubeGeom, tubeMat);
    this.worldGroup.add(this.wholePathTube);

    // Traveling Signal Pulse Spheres along continuous cable
    for (let p = 0; p < 3; p++) {
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      this.worldGroup.add(pulse);
      this.pulsingWires.push({ curve: cableCurve, mesh: pulse, offset: p * 0.33, speed: 0.18 });
    }
  }

  setupPostProcessing() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;

    if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
      const renderPass = new THREE.RenderPass(this.scene, this.camera);
      
      // Phosphor circuit glow bloom
      this.bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(width, height),
        1.15, // strength
        0.35, // radius
        0.75  // threshold
      );

      this.composer = new THREE.EffectComposer(this.renderer);
      this.composer.addPass(renderPass);
      this.composer.addPass(this.bloomPass);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize(), { passive: true });

    // 1. Mouse Move / Parallax Look-Around
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      this.mouseLook.targetX = x * 0.35; // Clamped head yaw (radians)
      this.mouseLook.targetY = y * 0.22; // Clamped head pitch (radians)
    }, { passive: true });

    // 2. Click & Drag / Touch Swipe Navigation
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });

    window.addEventListener('mouseup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const deltaX = e.clientX - this.dragStartX;
      if (Math.abs(deltaX) > 45) {
        if (deltaX < 0) this.advanceWaypoint();
        else this.retreatWaypoint();
      }
    });

    // Touch Support for Mobile
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStartX = e.touches[0].clientX;
        this.dragStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - this.dragStartX;
        if (Math.abs(deltaX) > 40) {
          if (deltaX < 0) this.advanceWaypoint();
          else this.retreatWaypoint();
        }
      }
    }, { passive: true });

    // 3. Keyboard Arrow Keys Navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.advanceWaypoint();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.retreatWaypoint();
      }
    });

    // 4. On-Screen Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.retreatWaypoint());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.advanceWaypoint());
    }
  }

  buildDotsIndicator() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    this.waypoints.forEach((wp, idx) => {
      const dot = document.createElement('button');
      dot.className = `tour-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Jump to Waypoint ${idx + 1}`);
      dot.innerHTML = `<span class="dot-inner"></span><span class="dot-num">0${idx + 1}</span>`;
      dot.addEventListener('click', () => this.goToWaypoint(idx));
      this.dotsContainer.appendChild(dot);
    });
  }

  advanceWaypoint() {
    const nextIdx = (this.currentWaypoint + 1) % this.waypoints.length;
    this.goToWaypoint(nextIdx);
  }

  retreatWaypoint() {
    const prevIdx = (this.currentWaypoint - 1 + this.waypoints.length) % this.waypoints.length;
    this.goToWaypoint(prevIdx);
  }

  goToWaypoint(idx) {
    if (idx < 0 || idx >= this.waypoints.length) return;
    this.currentWaypoint = idx;
    this.targetT = this.waypoints[idx].t;

    // Sound FX feedback
    if (window.soundFX && typeof window.soundFX.click === 'function') {
      window.soundFX.click();
    }

    this.updateHUD(idx);
  }

  updateHUD(idx) {
    const wp = this.waypoints[idx];
    if (this.hudTagEl) this.hudTagEl.textContent = wp.tag;
    if (this.hudDescEl) this.hudDescEl.textContent = wp.desc;
    if (this.hudStepEl) this.hudStepEl.textContent = `WAYPOINT 0${idx + 1} / 10`;

    // Update Dots UI
    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.tour-dot');
      dots.forEach((dot, dIdx) => {
        dot.classList.remove('active', 'passed');
        if (dIdx === idx) dot.classList.add('active');
        else if (dIdx < idx) dot.classList.add('passed');
      });
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  updateHmiScreen(elapsedTime) {
    if (!this.hmiCtx || !this.hmiCanvas) return;
    const ctx = this.hmiCtx;
    const w = this.hmiCanvas.width;
    const h = this.hmiCanvas.height;

    ctx.fillStyle = '#040c06';
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    // Top Header
    ctx.fillStyle = '#0d2813';
    ctx.fillRect(0, 0, w, 32);
    ctx.fillStyle = '#39ff14';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('PUSHPA AUTOMATION // PLANT 1 MIMIC', 14, 22);
    ctx.fillStyle = '#ffb000';
    ctx.fillText('50.0 Hz • RUNNING', w - 160, 22);

    // Motor RPM Oscillograph
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w - 40; x += 4) {
      const y = 160 + Math.sin(x * 0.04 + elapsedTime * 5) * 35 + Math.sin(x * 0.08 + elapsedTime * 8) * 12;
      if (x === 0) ctx.moveTo(20 + x, y);
      else ctx.lineTo(20 + x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.font = '13px monospace';
    ctx.fillText('LINE SPEED: 1,500 RPM', 20, 275);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('STATUS: SYNCHRONIZED', 280, 275);

    this.hmiScreenTexture.needsUpdate = true;
  }

  animate() {
    if (!this.isActive || !this.isInitialized) return;

    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Camera Movement along Spline Path (Eased Interpolation)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.currentT = this.targetT;
    } else {
      this.currentT += (this.targetT - this.currentT) * this.transitionSpeed;
    }

    const camPos = this.curvePath.getPointAt(this.currentT);
    const lookPos = this.lookCurvePath.getPointAt(this.currentT);

    // Apply Subtle Mouse/Head Look-Around
    this.mouseLook.x += (this.mouseLook.targetX - this.mouseLook.x) * 0.08;
    this.mouseLook.y += (this.mouseLook.targetY - this.mouseLook.y) * 0.08;

    this.camera.position.copy(camPos);

    const targetLookWithHead = new THREE.Vector3(
      lookPos.x + this.mouseLook.x * 3.5,
      lookPos.y - this.mouseLook.y * 2.5,
      lookPos.z
    );
    this.camera.lookAt(targetLookWithHead);

    // 2. Animated Cabinet Door Pivot
    if (this.cabinetDoor) {
      const activeWp = this.waypoints[this.currentWaypoint];
      const targetDoorAngle = activeWp.doorOpenAngle;
      this.cabinetDoor.rotation.y += (targetDoorAngle - this.cabinetDoor.rotation.y) * 0.05;
    }

    // 3. Staggered Blinking LEDs
    this.ledMeshList.forEach((item, idx) => {
      const pulse = 0.5 + Math.sin(elapsedTime * item.freq + idx) * 0.5;
      item.mesh.material.emissiveIntensity = 0.8 + pulse * 2.2;
    });

    // 4. Traveling Signal Cable Pulses
    this.pulsingWires.forEach((wire) => {
      const t = (elapsedTime * wire.speed + wire.offset) % 1.0;
      const pt = wire.curve.getPointAt(t);
      wire.mesh.position.copy(pt);
    });

    // 5. Update Dynamic HMI Mimic Screen
    this.updateHmiScreen(elapsedTime);

    // 6. Render
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Global Export
window.FacilityWalkthroughEngine = FacilityWalkthroughEngine;
