import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TelemetryData {
  voltage: string;
  frequency: string;
  rpm: string;
  current: string;
}

type TelemetryMetric = {
  label: string;
  value: string;
  unit: string;
  color: string;
};

export default function TelemetryDisplay({ data }: { data: TelemetryData }) {
  const metrics: TelemetryMetric[] = [
    { label: '3-Phase Voltage', value: data.voltage, unit: 'V', color: 'cyan' },
    { label: 'Grid Frequency', value: data.frequency, unit: 'Hz', color: 'cyan' },
    { label: 'Motor Speed', value: data.rpm, unit: 'RPM', color: 'cyan' },
    { label: 'Current Load', value: data.current, unit: 'A', color: 'cyan' },
  ];

  // Simulate small updates for live feel (could also be passed as prop)
  const [localData, setLocalData] = useState<TelemetryData>(data);
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalData((prev) => ({
        voltage: (parseFloat(prev.voltage) + (Math.random() - 0.5) * 0.1).toFixed(1),
        frequency: (parseFloat(prev.frequency) + (Math.random() - 0.5) * 0.02).toFixed(2),
        rpm: (parseInt(prev.rpm.replace(/,/g, '')) + Math.round((Math.random() - 0.5) * 3)).toLocaleString(),
        current: (parseFloat(prev.current) + (Math.random() - 0.5) * 0.02).toFixed(2),
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-br from-black/70 to-gray-900/80 rounded-xl p-6 border border-cyan-500/20 backdrop-blur-sm"
    >
      <h3 className="text-cyan-400 text-sm font-medium mb-6 uppercase tracking-wide">
        Live Telemetry Data
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * (index + 1) }}
            className="relative bg-black/40 rounded-lg p-4 border-l-4 border-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 group"
            whileHover={{ y: -3, scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {metric.label}
                </p>
                <p className="text-xl font-mono font-bold text-cyan-400">
                  {localData[metric.label.toLowerCase().replace(/ /g, '') as keyof TelemetryData] || metric.value}
                  <span className="text-xs ml-1 text-gray-400">{metric.unit}</span>
                </p>
              </div>

              {/* Animated dot indicator */}
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-cyan-400/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}