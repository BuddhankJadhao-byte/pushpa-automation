"use client"

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import glsl from 'glslify'

// Additional imports for custom materials
import { MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Noise } from '@react-three/postprocessing'

// CSS imports
import './globals.css'

// ============================================================
// TYPESCRIPT DEFINITIONS
// ============================================================

interface TelemetryData {
  voltage: string
  frequency: string
  rpm: string
  current: string
}

interface Product {
  id: string
  name: string
  category: string
  image: string
  price: string
  specs: string[]
  description: string
}

// ============================================================
// 3D SCENE COMPONENTS
// ============================================================

function Industrial3DScene() {
  const groupRef = React.useRef<THREE.Group>(null)
  const meshRef = React.useRef<THREE.Mesh>(null)
  const { camera, gl, viewport } = useThree()
  const mouse = React.useRef({ x: 0, y: 0 })

  // Adjust camera on window resize
  React.useEffect(() => {
    const handleResize = () => {
      camera.position.set(0, 2, 8)
      camera.lookAt(0, 0, 0)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [camera])

  // Handle mouse movement for interactive effects
  const onPointerMove = React.useCallback((event: MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1
    mouse.current.x = x * 0.5
    mouse.current.y = y * 0.5
  }, [])

  React.useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [onPointerMove])

  // Animation loop for 3D objects
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    // Rotate the main control panel
    if (meshRef.current) {
      meshRef.current.rotation.y = mouse.current.x * 0.5
      meshRef.current.rotation.x = mouse.current.y * 0.3
      meshRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05)
    }

    // Rotate the group for overall movement
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05
      groupRef.current.rotation.z = Math.sin(time * 0.2) * 0.05
    }
  })

  return (
    <group ref={groupRef} receiveShadow castShadow dispose={null}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} color="#0f1a29" />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>

      {/* Fill light for rim effect */}
      <pointLight position={[-10, -5, 5]} intensity={0.5} color="#00f0ff" />

      {/* Ground plane with roughness texture */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0d172a"
          roughness={0.8}
          metalness={0.1}
          map={useLoader(THREE.TextureLoader, '/textures/roughness.jpg')}
        />
      </mesh>

      {/* Control panel */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[3, 1.5, 0.3]} />
        <meshStandardMaterial
          color="#0a1322"
          metalness={0.9}
          roughness={0.2}
          emissive="#00f0ff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Corner panels */}
      {[-1, 1].map((x, i) =>
        [-1, 1].map((z, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[x * 1.2, 0.5, z * 1.2]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial
              color="#0d1f2d"
              metalness={0.7}
              roughness={0.3}
              emissive="#00f0ff"
              emissiveIntensity={0.05}
            />
          </mesh>
        ))
      )}

      {/* Decorative cables and connections */}
      <mesh>
        <tubeGeometry
          args={
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-1, 1, -1),
              new THREE.Vector3(0, 1.5, 0),
              new THREE.Vector3(1, 1, 1),
            ])
          }
        />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Equipment and machinery */}
      <group position={[4, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[1.2, 0.4, 8, 32]} />
          <meshStandardMaterial
            color="#0d172a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Display screen on equipment */}
        <mesh position={[0, 1, 0.5]}>
          <boxGeometry args={[0.8, 0.6, 0.1]} />
          <meshStandardMaterial
            color="#1a2a4a"
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* LED strips and indicators */}
      {[0, Math.PI].map((angle) => (
        <mesh
          key={angle}
          rotation={[0, angle, 0]}
          position={[2.5, 0.8, 0]}
        >
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================
// 2. MOVABLE FLOATING CARD COMPONENT
// ============================================================

function FloatingCard({
  index,
  title,
  description,
  color = 'cyan',
  index: number,
}: {
  index: number
  title: string
  description: string
  color?: string
}) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const cardRef = React.useRef<HTMLDivElement>(null)
  const x = React.useMotionValue(0)
  const y = React.useMotionValue(0)

  // Handle mouse move for parallax effect
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (event.clientX - centerX) * 0.1
      const deltaY = (event.clientY - centerY) * 0.1

      x.set(deltaX)
      y.set(deltaY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  // Get color variants
  const getColorClasses = (color: string) => {
    const colors = {
      cyan: {
        border: 'border-cyan-500',
        bg: 'bg-cyan-500/10',
        hover: 'hover:bg-cyan-500/20',
        text: 'text-cyan-500',
        ring: 'ring-cyan-500/50',
      },
      amber: {
        border: 'border-amber-500',
        bg: 'bg-amber-500/10',
        hover: 'hover:bg-amber-500/20',
        text: 'text-amber-500',
        ring: 'ring-amber-500/50',
      },
      green: {
        border: 'border-green-500',
        bg: 'bg-green-500/10',
        hover: 'hover:bg-green-500/20',
        text: 'text-green-500',
        ring: 'ring-green-500/50',
      },
    }
    return colors[color as keyof typeof colors] || colors.cyan
  }

  const colorClasses = getColorClasses(color)

  return (
    <motion.div
      ref={cardRef}
      className="absolute w-[300px] bg-pushpa-card rounded-2xl p-6 border border-pushca-cyan/20 shadow-xl backdrop-blur-md transform-gpu"
      style={
        {
          transform: `translate3d(${x.get()}px, ${y.get()}px, 0) rotateX(${y.get() / 20}deg) rotateY(${-x.get() / 20}deg)`,
          x: x.get(),
          y: y.get(),
          z: isHovered ? 50 : 0,
          transition: 'transform 0.3s ease-out, z 0.2s ease-out',
        } as any
      }
      whileHover={{
        scale: 1.05,
        y: -20,
        rotateX: y.get() / 30,
        rotateY: -x.get() / 30,
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glowing border on hover */}
      <div
        className={`absolute inset-0 rounded-2xl ${colorClasses.ring} opacity-0 ${isHovered ? 'opacity-100' : ''} transition-opacity duration-300`}
        style={{ boxShadow: `0 0 30px ${colorClasses.ring}90` }}
      />

      {/* Content container */}
      <div className="relative flex flex-col h-full z-10">
        {/* Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}>
            {title}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-pushca-foreground mb-3 line-clamp-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-pushca-muted/70 flex-1 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${colorClasses.text} to-transparent opacity-50"
          style={{ background: `linear-gradient(90deg, transparent, ${colorClasses.text.replace('text-', 'rgba(').replace('-500', ', 0.5)')} 50%, transparent)` }}
        />
      </div>

      {/* Hover overlay */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-transparent to-${colorClasses.bg} opacity-20 rounded-2xl z-0"
        />
      )}
    </motion.div>
  )
}

// ============================================================
// 3. TELEMETRY DISPLAY COMPONENT
// ============================================================

function TelemetryDisplay({ data }: { data: TelemetryData }) {
  const items = [
    { label: '3-Phase Voltage', value: data.voltage, unit: 'V', color: 'cyan' },
    { label: 'Grid Frequency', value: data.frequency, unit: 'Hz', color: 'cyan' },
    { label: 'Motor Speed', value: data.rpm, unit: 'RPM', color: 'cyan' },
    { label: 'Current Load', value: data.current, unit: 'A', color: 'cyan' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-gradient-to-br from-pushpa-dark to-pushpa-titanium-50 rounded-xl p-6 border border-pushca-cyan/20 backdrop-blur-sm"
    >
      <h3 className="text-pushca-cyan text-sm font-medium mb-6 uppercase tracking-wide">
        Live Telemetry Data
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            className="relative bg-pushpa-card rounded-lg p-4 border-l-4 border-pushca-cyan/50 hover:shadow-glow-cyan transition-all duration-300 group"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-pushca-muted/60 uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-xl font-mono font-bold text-pushca-foreground">
                  {item.value}
                  <span className="text-xs ml-1 text-pushca-muted/70">{item.unit}</span>
                </p>
              </div>

              {/* Animated dot indicator */}
              <motion.div
                className="w-3 h-3 rounded-full bg-pushca-cyan/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pushca-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================
// 4. MAIN HOME PAGE
// ============================================================

export default function HomePage() {
  const [telemetryData, setTelemetryData] = React.useState<TelemetryData>({
    voltage: '415.4',
    frequency: '50.02',
    rpm: '1,498',
    current: '8.84',
  })

  // Simulate live telemetry updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData({
        voltage: (415.4 + (Math.random() - 0.5) * 0.4).toFixed(1),
        frequency: (50.02 + (Math.random() - 0.5) * 0.04).toFixed(2),
        rpm: Math.round(1498 + (Math.random() - 0.5) * 6).toLocaleString(),
        current: (8.84 + (Math.random() - 0.5) * 0.12).toFixed(2),
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative main-section min-h-screen bg-pushpa-dark overflow-hidden"
    >
      {/* Background 3D canvas */}
      <div className="absolute inset-0 z-0">
        <Industrial3DScene />
      </div>

      {/* Overlays and content */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          {/* Hero section with floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pushca-cyan to-pushca-amber"
              >
                INDUSTRIAL AUTOMATION
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg md:text-xl text-pushca-muted/80 max-w-2xl mx-auto"
              >
                Pushpa Automation & Robotics Industries - Premier manufacturer of PLC HMI control panels, VFD drives, and custom automation systems in MIDC Bhosari, Pune
              </motion.p>
            </div>
          </motion.div>

          {/* Floating cards container */}
          <div className="relative mb-16 h-[600px] md:h-[500px] w-full">
            {/* Sensor Lab Card */}
            <FloatingCard
              index={0}
              title="Sensor Lab"
              description="Test inductive proximity detection thresholds and observe live dual-channel oscilloscope harmonics in real time. Interactive engineering sandbox for sensor calibration."
              color="cyan"
            />

            {/* Product Directory Card */}
            <FloatingCard
              index={1}
              title="Product Directory"
              description="Explore our catalog of PLC HMI panels, VFD drives, Star Delta starters, and specialty automation systems with full technical specifications."
              color="amber"
            />

            {/* Cost Calculator Card */}
            <FloatingCard
              index={2}
              title="Cost Calculator"
              description="Instant panel cost estimator. Select motor capacity, PLC brand, enclosure type, and sensor packages for accurate factory pricing."
              color="green"
            />

            {/* Facility Tour Card */}
            <FloatingCard
              index={3}
              title="Facility Tour"
              description="First-person 3D walkthrough of our MIDC Bhosari plant. Experience control panel interiors, DIN rail architecture, and SCADA server rooms."
              color="cyan"
            />

            {/* Reviews Card */}
            <FloatingCard
              index={4}
              title="Verified Reviews"
              description="106+ verified 5.0★ Google reviews from automation engineers and plant heads across Maharashtra. Read real client testimonials."
              color="amber"
            />

            {/* Contact Card */}
            <FloatingCard
              index={5}
              title="Contact Facility"
              description="Rajdhani Industrial Complex, F1, EL Block, MIDC Bhosari, Pune. Visit our plant or submit engineering inquiries online."
              color="green"
            />
          </div>

          {/* Telemetry Display */}
          <div className="relative z-10">
            <TelemetryDisplay data={telemetryData} />
          </div>
        </div>
      </div>
    </motion.section>
  )
}