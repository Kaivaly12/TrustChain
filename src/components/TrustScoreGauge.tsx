import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';

interface TrustScoreGaugeProps {
  targetScore: number; // e.g. 100 for genuine, 0 for counterfeit
  isReal: boolean;
  isRecalled?: boolean;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  targetScore,
  isReal,
  isRecalled = false
}) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  // Dynamic Color Interpolation from Red -> Amber/Yellow -> Brand Emerald Green
  const textColor = useTransform(
    count,
    [0, 30, 65, 100],
    ['#ba1a1a', '#e11d48', '#d97706', '#006948']
  );

  const barColor = useTransform(
    count,
    [0, 30, 65, 100],
    ['#ba1a1a', '#f43f5e', '#eab308', '#006948']
  );

  const barGlow = useTransform(
    count,
    [0, 50, 100],
    [
      '0 0 8px rgba(186, 26, 26, 0.35)',
      '0 0 10px rgba(217, 119, 6, 0.35)',
      '0 0 12px rgba(0, 105, 72, 0.45)'
    ]
  );

  // Bar width percentage string
  const barWidth = useTransform(count, (latest) => `${Math.min(Math.max(latest, isReal ? 2 : 0), 100)}%`);

  // Sync count motion value with integer display
  useMotionValueEvent(count, 'change', (latest) => {
    setDisplayValue(Math.round(latest));
  });

  // Framer Motion Sequence: Trigger counting animation from 0 to targetScore upon result load
  useEffect(() => {
    count.set(0);
    setDisplayValue(0);

    const controls = animate(count, targetScore, {
      duration: 1.35,
      delay: 0.18,
      ease: [0.16, 1, 0.3, 1]
    });

    return () => controls.stop();
  }, [targetScore, count]);

  // Determine dynamic level label based on real-time display value
  const getIntegrityLabel = (val: number) => {
    if (isRecalled) return 'Safety Recall Notice';
    if (!isReal) return 'Unverified / High Risk';
    if (val >= 95) return '100% Genuine & Verified';
    if (val >= 75) return 'Verified Brand Match';
    return 'Checking Product Catalog...';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16 }}
      className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 flex flex-col justify-center min-w-[220px] sm:min-w-[240px] shadow-xs"
    >
      {/* Header and Animated Numeric Counter with Dynamic Color */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[11px] uppercase tracking-wider text-[#6d7a72] font-semibold">
          Authenticity Score
        </span>

        <motion.span
          style={{ color: textColor }}
          className="text-xl font-mono font-extrabold flex items-baseline tracking-tight"
        >
          <span>{displayValue}</span>
          <span className="text-xs ml-0.5">%</span>
        </motion.span>
      </div>

      {/* Progress Gauge Meter Bar with Dynamic Color Interpolation */}
      <div className="w-full h-2.5 rounded-full bg-[#e9e8e5] border border-[#bccac0]/40 overflow-hidden p-0.5 relative shadow-inner">
        <motion.div
          style={{
            width: barWidth,
            backgroundColor: barColor,
            boxShadow: barGlow
          }}
          className="h-full rounded-full transition-all"
        />
      </div>

      {/* Gauge Calibration labels */}
      <div className="flex items-center justify-between text-[10px] text-[#6d7a72] mt-1.5 pt-0.5 font-medium">
        <span className={displayValue <= 20 ? 'text-[#ba1a1a] font-bold' : ''}>
          Unverified
        </span>
        <span className={displayValue > 40 && displayValue < 70 ? 'text-amber-700 font-bold' : ''}>
          Likely
        </span>
        <motion.span
          style={{ color: displayValue >= 90 ? textColor : undefined }}
          className={displayValue >= 90 ? 'font-bold' : ''}
        >
          100% Genuine
        </motion.span>
      </div>

      {/* Trust Gauge Verdict Status Tag with Interpolated Color */}
      <div className="mt-2 pt-1.5 border-t border-[#bccac0]/25 flex items-center justify-between text-[11px]">
        <span className="text-[#6d7a72]">Status:</span>
        <motion.span
          style={{ color: textColor }}
          className="font-bold text-[11px] truncate max-w-[170px]"
        >
          {getIntegrityLabel(displayValue)}
        </motion.span>
      </div>
    </motion.div>
  );
};
