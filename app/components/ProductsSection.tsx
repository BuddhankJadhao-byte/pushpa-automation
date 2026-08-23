import { motion } from 'framer-motion';
import { Canvas, useRef, useState } from '@react-three/fiber';
import { Box, useTexture } from '@react-three/drei';
import { useState as useState3D } from 'react';

// ============================================================
// PRODUCT DATA
// ============================================================

const PRODUCTS_DATA = [
  {
    id: 'plc-hmi-panel',
    name: 'PLC HMI Automated Control Panel',
    category: 'PLC',
    oem: 'Delta / Siemens',
    status: 'READY IN 48-72 HRS',
    voltage: '415V 3-Phase',
    enclosure: 'IP65 CRCA',
    warranty: '1-Year Warranty',
    price: '₹45,000',
    image: '/products/plc_hmi.jpg',
    description: 'Delta / Siemens 32-bit SoC CPU paired with 7-inch Color Touchscreen HMI.',
    specs: [
      'CPU: Delta AS Series 32-bit SoC or Siemens S7-1200',
      'HMI: 7.0" TFT High-Res Color Touchscreen',
      'I/O: 16 Optocoupler-Isolated Inputs / 16 Relay Outputs',
      'Enclosure: IP65 CRCA Powder Coated',
    ],
  },
  {
    id: 'vfd-heavy-panel',
    name: 'Heavy Duty VFD Motion Panel',
    category: 'VFD',
    oem: 'Delta MS300 / Schneider',
    status: 'IN STOCK - MIDC',
    voltage: '415V 3-Phase',
    enclosure: 'IP55 Dual Fan',
    warranty: '1-Year Warranty',
    price: '₹45,000',
    image: '/products/vfd_heavy.jpg',
    description: 'Precision Variable Frequency Drive panel for high torque motors.',
    specs: [
      'Power: 15 HP to 30 HP AC Induction Motors',
      'VFD: Delta MS300 / C2000 Plus',
      'Braking: Dynamic Braking Resistor',
      'Cooling: Dual Ball-Bearing Fans',
    ],
  },
  {
    id: 'star-delta-50hp',
    name: '50 HP Heavy Star Delta Starter Panel',
    category: 'Star Delta',
    oem: 'L&T / Siemens',
    status: 'IN STOCK - MIDC',
    voltage: '415V 50Hz',
    enclosure: 'IP55 CRCA',
    warranty: '1-Year Warranty',
    price: '₹4,00,000',
    image: '/products/star_delta.jpg',
    description: 'Premium high-tension industrial motor starter panel with L&T/Siemens switchgear.',
    specs: [
      'Capacity: 50 HP (37 kW) Continuous Duty',
      'Contactors: L&T ML Series Air Break',
      'Busbar: Tinned Copper',
      'Meter: Digital Multimeter',
    ],
  },
  {
    id: 'flame-proof-panel',
    name: 'Flame Proof Industrial Panel (Ex-d)',
    category: 'Specialty',
    oem: 'CIMFR / PESO Certified',
    status: 'CUSTOM FABRICATION',
    voltage: '415V / 230V',
    enclosure: 'IP66 Cast Alloy',
    warranty: '1-Year Warranty',
    price: '₹55,000',
    image: '/products/flameproof.jpg',
    description: 'CIMFR/PESO certified explosion-proof control enclosure.',
    specs: [
      'Hazard: Zone 1, Zone 2, Gas Groups IIA, IIB, IIC',
      'Material: Cast Aluminium or SS316',
      'Sealing: IP66 with Neoprene Gaskets',
      'Certification: IS/IEC 60079-0 & 60079-1',
    ],
  },
  {
    id: 'delta-plc',
    name: 'Delta AS Series Compact PLC',
    category: 'Sensors',
    oem: 'Delta Electronics',
    status: 'IN STOCK - MIDC',
    voltage: '24V DC / 230V AC',
    enclosure: 'DIN Rail Mount',
    warranty: '1-Year Warranty',
    price: '₹16,500',
    image: '/products/delta_plc.jpg',
    description: 'High performance 32-bit SoC modular PLC controller.',
    specs: [
      'Speed: 40k steps in 1.0 ms',
      'Memory: 128k steps ladder logic',
      'Ports: Ethernet, RS-485, USB',
      'Expansion: Up to 1024 I/O points',
    ],
  },
];

// ============================================================
// 3D PRODUCT CARD COMPONENT
// ============================================================

function RotatingProduct({ modelUrl }: { modelUrl: string }) {
  const meshRef = useRef<any>(null!);
  const [hovered, setHovered] = useState3D(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += hovered ? 0.02 : 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    }
  });

  return (
    <mesh ref={meshRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={hovered ? '#00f0ff' : '#0a1322'}
        emissive={hovered ? '#00f0ff' : '#000'}
        emissiveIntensity={hovered ? 0.5 : 0.1}
        metalness={0.8}
        roughness={0.2}
      />

      {/* Glowing effect */}
      {hovered && (
        <directionalLight position={[5, 5, 5]} intensity={1} />
      )}
    </mesh>
  );
}

// ============================================================
// PRODUCT CARD COMPONENT
// ============================================================

interface ProductCardProps {
  product: typeof PRODUCTS_DATA[0];
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.03 }}
      className="relative bg-pushpa-card rounded-2xl overflow-hidden border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300"
      onClick={() => setIsOpen(true)}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
            {product.category}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
            {product.status}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">{product.name}</h3>
        <p className="text-sm text-pushca-muted mb-4">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-pushca-muted">Price</p>
            <p className="text-lg font-bold text-white">{product.price}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-pushca-muted">Voltage</p>
            <p className="text-sm font-medium text-cyan-400">{product.voltage}</p>
          </div>
        </div>

        <button className="w-full py-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium hover:opacity-90 transition-all">
          View Specifications
        </button>
      </div>

      {/* 3D Hover Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none border-2 border-cyan-500/50 rounded-2xl"
        animate={{
          scale: isOpen ? 1 : 1,
          boxShadow: isOpen
            ? '0 0 30px rgba(0, 240, 255, 0.5)'
            : '0 0 0px rgba(0, 240, 255, 0)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// ============================================================
// PRODUCTS SECTION
// ============================================================

export default function ProductsSection() {
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
              Industrial Directory
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Control Panels & Automation Systems
          </h2>
          <p className="text-lg text-pushca-muted/70 max-w-3xl mx-auto">
            Manufacturing in MIDC Bhosari with certified CRCA enclosures, Delta/Siemens switchgear, and 1-year comprehensive warranty.
          </p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {PRODUCTS_DATA.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { PRODUCTS_DATA };