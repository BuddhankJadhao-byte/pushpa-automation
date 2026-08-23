import { motion, useAnimation } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Cylinder, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================
// 3D FACILITY WALKTHROUGH COMPONENT
// ============================================================

function ControlCabinet() {
  const ref = useRef<THREE.Group>(null!);
  const [rotation, setRotation] = useState(0);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={ref}>
      {/* Cabinet body */}
      <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[4, 3, 0.5]} />
        <meshStandardMaterial color="#0a1322" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Door */}
      <mesh position={[2.25, 1.5, 0.25]}>
        <boxGeometry args={[1, 3, 0.3]} />
        <meshStandardMaterial color="#081520" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* DIN Rail */}
      <mesh position={[0, 1.5, -0.26]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshStandardMaterial color="#1a2a4a" />
      </mesh>

      {/* 24V PSU */}
      <mesh position={[-1, 1.7, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color="#0d1f2d" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* PLC CPU */}
      <mesh position={[0.5, 1.6, 0]}>
        <boxGeometry args={[1, 0.8, 0.4]} />
        <meshStandardMaterial color="#0d1a2d" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* HMI Screen */}
      <mesh position={[1.8, 1.8, -0.15]}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a2a4a" emissive="#00f0ff" emissiveIntensity={0.1} />
      </mesh>

      {/* SCADA Server Rack */}
      <group position={[3, 1.4, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 2, 0.4]} />
          <meshStandardMaterial color="#081015" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.8, 0.25]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.3, 0.3]} />
          <meshStandardMaterial color="#040a0f" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function CameraPath() {
  const group = useRef<THREE.Group>(null!);
  const [step, setStep] = useState(0);

  // Walkthrough waypoints
  const waypoints = [
    { pos: [0, 2, 10] as [number, number, number], look: [0, 2, 0] },
    { pos: [8, 3, 5] as [number, number, number], look: [5, 2, -2] },
    { pos: [4, 2, -5] as [number, number, number], look: [0, 1.5, 0] },
    { pos: [-6, 2.5, 3] as [number, number, number], look: [-3, 2, 0] },
  ];

  useFrame((state) => {
    if (group.current) {
      const target = waypoints[step];
      const currentPos = group.current.position.clone();
      const targetPos = new THREE.Vector3(...target.pos);

      // Smooth movement towards waypoint
      const speed = 0.02;
      currentPos.lerp(targetPos, speed);
      group.current.position.copy(currentPos);

      // Auto-advance when close enough
      if (currentPos.distanceTo(targetPos) < 0.5) {
        setStep((prev) => (prev + 1) % waypoints.length);
      }
    }
  });

  return <primitive object={new THREE.Group()} ref={group} />;
}

// ============================================================
// FACILITY WALKTHROUGH SECTION
// ============================================================

export default function FacilityWalkthrough() {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Number of products will be populated here
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-pushpa-dark via-black/50 to-pushpa-dark overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 py-24">
        {/* Section Header - Floating */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium">
              First-Person 3D Tour
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Inside-the-Panel Tour
          </h2>
          <p className="text-lg text-pushca-muted/70 max-w-3xl mx-auto">
            Experience an interactive first-person spatial walkthrough inside our industrial control panels and facility.
          </p>
        </motion.div>

        {/* 3D Walkthrough Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl"
        >
          <Canvas
            camera={{ position: [0, 2, 10], fov: 60 }}
            className="w-full h-full"
          >
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#fbbf24" />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#0a0f15" />
            </mesh>

            {/* Control Cabinet */}
            <ControlCabinet />

            {/* Floating Action Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute top-6 left-6 bg-pushpa-card rounded-xl p-4 border border-cyan-500/20 shadow-xl max-w-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20a4 4 0 01-4-4V5a2 2 0 012-2h5l2 2h5a2 2 0 012 2v11a4 4 0 01-4 4H7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-cyan-400">Walkthrough Active</p>
                  <p className="text-xs text-pushca-muted">Use arrow keys or swipe to navigate</p>
                </div>
              </div>
            </motion.div>

            {/* Progress Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  className="w-3 h-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === 0 ? '#00f0ff' : 'rgba(0,240,255,0.3)',
                  }}
                  aria-label={`Waypoint ${i + 1}`}
                />
              ))}
            </div>
          </Canvas>
        </motion.div>

        {/* Navigation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center gap-4 mt-8"
        >
          <button className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium hover:opacity-90 transition-all">
            Pre-Built Panels
          </button>
          <button className="px-6 py-3 rounded-full border border-cyan-500 text-cyan-400 font-medium hover:bg-cyan-500/10 transition-all">
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  );
}