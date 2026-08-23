import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

type Props = {
  index: number;
  title: string;
  description: string;
  color: string; // 'cyan' | 'amber' | 'green' | 'custom'
};

export default function FloatingCard({ index, title, description, color = 'cyan' }: Props) {
  const ref = useRef<HTMLDivElement>(null!)};
  const [isHovered, setIsHovered] = useState(false);

  // Simple hover handling for 3D-like lift
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <motion.div
      ref={ref}
      className="absolute w-[300px] bg-[#0a1322] rounded-2xl p-6 border border-cyan-500/20 shadow-xl backdrop-blur-md transform-gpu"
      style={{
        transform: `translate3d(${0}px, ${0}px, 0) rotateX(${0}deg) rotateY(${0}deg)`,
        willChange: 'transform',
      }}
      whileHover={{
        scale: 1.05,
        y: -15,
        rotateX: -5,
        rotateY: 10,
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      }}
      onHoverStart={handleMouseEnter}
      onHoverEnd={handleMouseLeave}
      className="relative flex flex-col h-full z-10"
    >
      {/* Header badge with title initial */}
      <div className="flex-shrink-0 pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-xs font-medium text-white">
          {title.charAt(0)}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-cyan-400 mb-2 flex-1">{title}</h3>

      {/* Description */}
      <p className="text-pushca-muted/60 text-sm flex-1 line-clamp-3">{description}</p>

      {/* CTA at bottom */}
      <div className="mt-auto pt-3">
        <a
          href="#"
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium hover:opacity-90 transition-all"
          title="Learn More"
        >
          Learn More →
        </a>
      </div>
    </motion.div>
  );
}