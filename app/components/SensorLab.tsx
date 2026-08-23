import { motion, useAnimation } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Box, Cylinder, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================
// SENSOR LAB INTERACTIVE 3D COMPONENT
// ============================================================

function ProximitySensor() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [isTriggered, setIsTriggered] = useState(false);
  const [rotation, setRotation] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = rotation + time * 0.5;
      meshRef.current.position.y = Math.sin(time * 2) * 0.1;
    }
  });

  // Pulse animation when triggered
  useEffect(() => {
    if (isTriggered) {
      const interval = setInterval(() => {
        setRotation((r) => r + 0.1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTriggered]);

  return (
    <mesh ref={meshRef} receiveShadow castShadow>
      <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
      <meshStandardMaterial
        color={isTriggered ? '#10b981' : '#6b7280'}
        emissive={isTriggered ? '#10b981' : '#333'}
        emissiveIntensity={isTriggered ? 0.5 : 0.1}
      />

      {/* LED indicator */}
      <mesh position={[0, 0, 1.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={isTriggered ? '#10b981' : '#9ca3af'} />
      </mesh>

      {/* Sensing field */}
      <mesh visible={isTriggered}>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
}

function OscilloscopeWaveform() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);
  const [frequency, setFrequency] = useState(50);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current += state.clock.getDelta();

    if (lineRef.current) {
      const points: THREE.Vector3[] = [];
      const segments = 64;

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments - 0.5) * 4;
        const y = Math.sin(x * 10 + timeRef.current * frequency * 0.1) * 0.5;
        const z = Math.cos(x * 5 + timeRef.current * frequency * 0.05) * 0.3;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;

      // Update colors based on signal
      const colors = new Float32Array(points.length * 3);
      for (let i = 0; i < points.length; i++) {
        colors[i * 3] = 0 / 255;     // R
        colors[i * 3 + 1] = 240 / 255; // G
        colors[i * 3 + 2] = 255 / 255; // B (cyan)
      }
      lineRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <lineSegments ref={lineRef} >
        <bufferGeometry />
        <lineBasicMaterial vertexColors transparent opacity={0.8} />
      </lineSegments>
    </mesh>
  );
}

// ============================================================
// SENSOR LAB VIEW COMPONENT
// ============================================================

interface SensorLabProps {
  isVisible: boolean;
}

export default function SensorLab({ isVisible }: SensorLabProps) {
  const [proximity, setProximity] = useState(8.0);
  const [isTriggered, setIsTriggered] = useState(false);
  const [oscilloscopeFreq, setOscilloscopeFreq] = useState(50);
  const [waveformData, setWaveformData] = useState({
    voltage: 415.4,
    current: 8.84,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProximity((prev) => {
        const newDist = prev + (Math.random() - 0.5) * 2;
        const clamped = Math.max(1, Math.min(20, newDist));
        setIsTriggered(clamped <= 8.0);
        return clamped;
      });

      setWaveformData({
        voltage: (415 + Math.random() * 2).toFixed(1),
        current: (8 + Math.random() * 2).toFixed(2),
      });

      setOscilloscopeFreq(50 + Math.random() * 10);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <section className="relative py-24 bg-gradient-to-br from-pushpa-dark via-black/50 to-pushpa-dark">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium">
              Real-Time Interactive Sandbox
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Sensory Telemetry & Logic Simulation
          </h2>
          <p className="text-lg text-pushca-muted/70 max-w-3xl mx-auto">
            Test inductive proximity detection thresholds and observe live dual-channel oscillations in real time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 3D Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Canvas
              camera={{ position: [0, 2, 8], fov: 50 }}
              className="w-full h-[400px] rounded-2xl border border-cyan-500/20 overflow-hidden"
            >
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 10, 5]} intensity={1} />

              <group position={[0, -1, 0]}>
                {/* Base platform */}
                <mesh receiveShadow>
                  <boxGeometry args={[6, 0.2, 6]} />
                  <meshStandardMaterial color="#1a1a2a" />
                </mesh>

                {/* Sensor */}
                <proximitySensor isTriggered={isTriggered} />

                {/* Oscilloscope */}
                <oscilloscopeWaveform />

                {/* Signal cables */}
                <mesh position={[3, 0, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 3]} />
                  <meshStandardMaterial color="#00f0ff" />
                </mesh>
              </group>
            </Canvas>

            {/* Floating status indicators */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center"
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Controls and Data */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Proximity Sensor Card */}
            <div className="bg-pushpa-card rounded-2xl p-6 border border-cyan-500/20">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Inductive Proximity Sensor (M18)
              </h3>

              <div className="space-y-4">
                {/* Status indicator */}
                <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isTriggered ? '#10b981' : '#4b5563' }}
                  >
                    <span className="text-white font-bold">
                      {isTriggered ? '✓' : '○'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-pushca-muted">Status</p>
                    <p className="text-lg font-bold text-white">
                      {isTriggered ? 'TRIGGERED' : 'IDLE'}
                    </p>
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <p className="text-sm text-pushca-muted mb-2">Sensing Distance</p>
                  <div className="text-2xl font-bold text-cyan-400">
                    {proximity.toFixed(1)} <span className="text-sm text-pushca-muted">mm</span>
                  </div>
                  <p className="text-xs text-pushca-muted mt-1">Trip Threshold: ≤ 8.0 mm</p>
                </div>
              </div>
            </div>

            {/* Oscilloscope Data */}
            <div className="bg-pushpa-card rounded-2xl p-6 border border-cyan-500/20">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Dual-Channel Oscilloscope</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-xs text-pushca-muted mb-1">3-Phase Voltage</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {waveformData.voltage} V
                  </p>
                  <p className="text-xs text-pushca-muted">CH1: Flux Wave</p>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-xs text-pushca-muted mb-1">Current Load</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {waveformData.current} A
                  </p>
                  <p className="text-xs text-pushca-muted">CH2: Current</p>
                </div>
              </div>

              {/* Signal indicator */}
              <motion.div
                className="mt-4 flex items-center justify-between"
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs text-pushca-muted">Signal Active: {oscilloscopeFreq.toFixed(0)} Hz</span>
                </div>
              </motion.div>
            </div>

            {/* Technical Info */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/20">
              <h3 className="text-lg font-bold text-cyan-400 mb-3">Engineering Specifications</h3>
              <ul className="space-y-2 text-pushca-muted/80 text-sm">
                <li>• Inductive M18 sensor: 8mm sensing distance, PNP/NPN output</li>
                <li>• Dual-channel oscilloscope: 50 Hz sampling, 16-bit resolution</li>
                <li>• Signal types: Flux (CH1) and Current (CH2) measurements</li>
                <li>• Response time: < 1ms for proximity detection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export for use in page.tsx
export { ProximitySensor, OscilloscopeWaveform };