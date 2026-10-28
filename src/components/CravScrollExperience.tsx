import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';

interface CravScrollExperienceProps {
  onEnterSite: (initialTab?: 'scanner' | 'register' | 'explorer', sampleCode?: string) => void;
  onOpenChat?: () => void;
}

export const CravScrollExperience: React.FC<CravScrollExperienceProps> = ({
  onEnterSite,
  onOpenChat
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<'burger' | 'oreo'>('burger');
  const [activeLayerHover, setActiveLayerHover] = useState<number | null>(null);
  const [stageText, setStageText] = useState('01 / ASSEMBLE');
  const [percentScrolled, setPercentScrolled] = useState(0);

  // Bind scroll progress across this 360vh pinned container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Smooth out scroll progress with a responsive spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001
  });

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    setPercentScrolled(Math.round(latest * 100));
    if (latest < 0.28) {
      setStageText('01 / ASSEMBLE');
    } else if (latest < 0.72) {
      setStageText('02 / EXPLODE');
    } else {
      setStageText('03 / VERIFIED');
    }
  });

  // Layer 1 (Top Bun / Outer Holographic Foil) transforms
  const topBunY = useTransform(smoothProgress, [0.08, 0.45, 0.85], [0, -210, -240]);
  const topBunRotate = useTransform(smoothProgress, [0.08, 0.5, 0.85], [0, -8, -5]);
  const topBunScale = useTransform(smoothProgress, [0.08, 0.5, 0.85], [1, 1.05, 1.02]);

  // Layer 2 (Optical Barcode & Laser Scan Layer) transforms
  const barcodeY = useTransform(smoothProgress, [0.12, 0.5, 0.85], [0, -100, -115]);
  const barcodeX = useTransform(smoothProgress, [0.12, 0.5, 0.85], [0, -80, -60]);
  const barcodeRotate = useTransform(smoothProgress, [0.12, 0.5, 0.85], [0, -6, -4]);

  // Layer 3 (Central Substance / The Real Goodies) transforms
  const centerScale = useTransform(smoothProgress, [0.15, 0.5, 0.85], [1, 1.12, 1.05]);

  // Layer 4 (Melted Cheddar / Verified Lab Nutrition Panel) transforms
  const cheeseY = useTransform(smoothProgress, [0.18, 0.55, 0.85], [0, 95, 110]);
  const cheeseX = useTransform(smoothProgress, [0.18, 0.55, 0.85], [0, 75, 55]);
  const cheeseRotate = useTransform(smoothProgress, [0.18, 0.55, 0.85], [0, 7, 5]);

  // Layer 5 (Bottom Bun / Immutable Blockchain Genesis Bed) transforms
  const bottomBunY = useTransform(smoothProgress, [0.22, 0.6, 0.85], [0, 205, 235]);
  const bottomBunRotate = useTransform(smoothProgress, [0.22, 0.6, 0.85], [0, 6, 4]);
  const bottomBunScale = useTransform(smoothProgress, [0.22, 0.6, 0.85], [1, 1.05, 1.02]);

  // Background kinetic typography transforms
  const bgTextX1 = useTransform(smoothProgress, [0, 1], ['5%', '-45%']);
  const bgTextX2 = useTransform(smoothProgress, [0, 1], ['-35%', '15%']);

  // Floating stickers parallax transforms
  const sticker1Y = useTransform(smoothProgress, [0.1, 0.7], [60, -90]);
  const sticker1Rotate = useTransform(smoothProgress, [0, 1], [-14, 25]);

  const sticker2Y = useTransform(smoothProgress, [0.1, 0.8], [-40, 120]);
  const sticker2Rotate = useTransform(smoothProgress, [0, 1], [18, -12]);

  const sticker3Y = useTransform(smoothProgress, [0.15, 0.85], [80, -60]);
  const sticker3Rotate = useTransform(smoothProgress, [0, 1], [-8, 16]);

  // Phase badges opacity & scale
  const phase1Opacity = useTransform(smoothProgress, [0, 0.22, 0.3], [1, 1, 0]);
  const phase2Opacity = useTransform(smoothProgress, [0.25, 0.38, 0.65, 0.72], [0, 1, 1, 0]);
  const phase3Opacity = useTransform(smoothProgress, [0.68, 0.8, 1], [0, 1, 1]);

  // Scan Trust Gauge counter
  const scanGaugeScore = useTransform(smoothProgress, [0.2, 0.65], [0, 100]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380vh] bg-[#0c100e] text-[#f7f5ed] selection:bg-[#ff5500] selection:text-white"
    >
      {/* 1. TOP MARQUEE BANNER (Continuous Crav-Style Ticker) */}
      <div className="sticky top-0 z-30 w-full overflow-hidden border-b border-[#243329] bg-[#111714]/90 backdrop-blur-md py-2.5">
        <div className="flex whitespace-nowrap animate-marquee font-mono text-[11px] sm:text-xs font-black tracking-widest text-[#85f8c4] uppercase">
          <span className="mx-4">★ CRAV THE TRUTH</span>
          <span className="mx-4 text-white">★ ZERO COUNTERFEITS</span>
          <span className="mx-4 text-[#ff5500]">★ 100% GENUINE FOOD & GOODS</span>
          <span className="mx-4 text-[#ffd600]">★ GS1 LASER SCAN IN 0.2 SECONDS</span>
          <span className="mx-4 text-white">★ DECENTRALIZED SHA-256 PROVENANCE</span>
          <span className="mx-4 text-[#85f8c4]">★ CRAV THE TRUTH</span>
          <span className="mx-4 text-white">★ ZERO COUNTERFEITS</span>
          <span className="mx-4 text-[#ff5500]">★ 100% GENUINE FOOD & GOODS</span>
          <span className="mx-4 text-[#ffd600]">★ GS1 LASER SCAN IN 0.2 SECONDS</span>
          <span className="mx-4 text-white">★ DECENTRALIZED SHA-256 PROVENANCE</span>
        </div>
      </div>

      {/* 2. PINNED MAIN VIEWPORT (The Scroll Stage) */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-8 py-4 sm:py-6">
        {/* Subtle Radial Glow & Ambient Field */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[320px] sm:w-[680px] h-[320px] sm:h-[680px] rounded-full bg-gradient-to-tr from-[#006948]/25 via-[#ff5500]/15 to-[#ffd600]/10 blur-[120px]" />
        </div>

        {/* Dynamic Massive Background Kinetic Typography (Crav Style) */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center items-center overflow-hidden opacity-10 select-none">
          <motion.div
            style={{ x: bgTextX1, WebkitTextStroke: '2px #f7f5ed' }}
            className="text-[13vw] font-black uppercase tracking-tighter whitespace-nowrap leading-none text-transparent"
          >
            DISSECT THE TRUTH • 100% REAL FOOD
          </motion.div>
          <motion.div
            style={{ x: bgTextX2, WebkitTextStroke: '2px #85f8c4' }}
            className="text-[13vw] font-black uppercase tracking-tighter whitespace-nowrap leading-none text-transparent"
          >
            ANATOMY OF AUTHENTICITY • ZERO FAKES
          </motion.div>
        </div>

        {/* HEADER BAR: Stage Indicator & Product Switcher */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 max-w-6xl w-full mx-auto">
          {/* Brand & Stage Milestone Tag */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-[#1b2520] border border-[#2d3e35] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#85f8c4] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#85f8c4]">
                Scroll Physics Engine v2.4
              </span>
            </div>

            {/* Stage Counter */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-[#72857a]">
              <span>STAGE</span>
              <span className="text-[#ffd600] font-black">{stageText}</span>
              <span className="text-[10px] bg-[#141b17] border border-[#2b3a32] px-2 py-0.5 rounded text-white">
                {percentScrolled}%
              </span>
            </div>
          </div>

          {/* Product Toggle Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-[#17201c] border border-[#2b3a32]">
            <button
              type="button"
              onClick={() => setSelectedProduct('burger')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProduct === 'burger'
                  ? 'bg-[#ff5500] text-white shadow-md'
                  : 'text-[#8c9e94] hover:text-white'
              }`}
            >
              <span>🍔</span>
              <span>The Artisan Burger Pack</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedProduct('oreo')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProduct === 'oreo'
                  ? 'bg-[#006948] text-[#85f8c4] shadow-md'
                  : 'text-[#8c9e94] hover:text-white'
              }`}
            >
              <span>🍪</span>
              <span>Cadbury Oreo Retail Pack</span>
            </button>
          </div>
        </div>

        {/* CENTER STAGE: THE EXPLODED BURGER / PRODUCT ANATOMY */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-5xl mx-auto my-auto">
          {/* FLOATING RETRO STICKER 1 (Top Left) */}
          <motion.div
            style={{ y: sticker1Y, rotate: sticker1Rotate }}
            whileHover={{ scale: 1.15, rotate: -5 }}
            className="absolute -top-4 left-2 sm:left-6 z-20 cursor-pointer select-none"
          >
            <div className="bg-[#ffd600] text-[#121614] px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm tracking-tight uppercase shadow-2xl border-2 border-[#121614] transform -rotate-6 flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <span>100% REAL DEAL</span>
            </div>
          </motion.div>

          {/* FLOATING RETRO STICKER 2 (Top Right Starburst) */}
          <motion.div
            style={{ y: sticker2Y, rotate: sticker2Rotate }}
            whileHover={{ scale: 1.18, rotate: 15 }}
            className="absolute top-2 right-2 sm:right-10 z-20 cursor-pointer select-none"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff5500] text-white flex flex-col items-center justify-center p-2 text-center font-black text-[9px] sm:text-[10px] leading-tight shadow-2xl border-2 border-white transform rotate-12">
              <span className="text-xs">★</span>
              <span>ZERO FAKES</span>
              <span className="font-mono text-[8px] text-yellow-200">PASS A+</span>
            </div>
          </motion.div>

          {/* FLOATING RETRO STICKER 3 (Bottom Left - Lab Stamp) */}
          <motion.div
            style={{ y: sticker3Y, rotate: sticker3Rotate }}
            whileHover={{ scale: 1.12, rotate: -2 }}
            className="absolute bottom-6 left-4 sm:left-12 z-20 cursor-pointer select-none hidden sm:block"
          >
            <div className="bg-[#17201c] border-2 border-[#85f8c4] text-[#85f8c4] px-4 py-2 rounded-2xl font-mono text-[11px] font-bold shadow-xl">
              <span>[ FSSAI CERTIFIED ]</span>
              <span className="block text-white text-[10px]">LIC #10014022003125</span>
            </div>
          </motion.div>

          {/* THE 5-LAYER EXPLODING PRODUCT CONTAINER */}
          <div className="relative w-full max-w-[420px] sm:max-w-[480px] h-[360px] sm:h-[440px] flex items-center justify-center">
            {/* LAYER 1: TOP BUN / HOLOGRAPHIC BRAND SHIELD */}
            <motion.div
              style={{
                y: topBunY,
                rotate: topBunRotate,
                scale: topBunScale,
                zIndex: 15
              }}
              onMouseEnter={() => setActiveLayerHover(1)}
              onMouseLeave={() => setActiveLayerHover(null)}
              className="absolute w-[280px] sm:w-[350px] transition-shadow cursor-pointer"
            >
              <div className="relative rounded-3xl p-4 bg-gradient-to-b from-[#e69138] via-[#c66914] to-[#8f4104] border-2 border-[#ffb366] shadow-[0_20px_45px_rgba(198,105,20,0.45)] text-white">
                {/* Sesame Seeds decoration */}
                <div className="absolute top-2 left-6 w-1.5 h-3 rounded-full bg-[#ffeed9] rotate-45 opacity-80" />
                <div className="absolute top-4 left-16 w-1.5 h-3 rounded-full bg-[#ffeed9] -rotate-12 opacity-80" />
                <div className="absolute top-3 right-12 w-1.5 h-3 rounded-full bg-[#ffeed9] rotate-30 opacity-80" />
                <div className="absolute top-6 right-24 w-1.5 h-3 rounded-full bg-[#ffeed9] -rotate-45 opacity-80" />

                {/* Tamper Hologram Stamp */}
                <div className="flex items-center justify-between pb-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffeed9]/20 border border-[#ffeed9]/40 text-[10px] font-black tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85f8c4] animate-ping" />
                    <span>Layer 01 • Tamper Void Seal</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-yellow-200">#GENESIS-BUN</span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                      {selectedProduct === 'burger'
                        ? 'Golden Toasted Brioche Bun'
                        : 'Double Embossed Oreo Wafer'}
                    </h4>
                    <p className="text-[11px] text-amber-100 font-medium">
                      Laser-embossed anti-counterfeit crest & freshness barrier
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-black/30 border border-white/20 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                  </div>
                </div>
              </div>

              {/* Callout Pointer line (Active when exploded) */}
              <motion.div
                style={{ opacity: useTransform(smoothProgress, [0.2, 0.4], [0, 1]) }}
                className="hidden md:flex items-center gap-2 absolute -left-48 top-1/2 -translate-y-1/2"
              >
                <div className="bg-[#1b2520] border border-[#2d3e35] p-2.5 rounded-xl text-left shadow-xl w-44">
                  <span className="text-[10px] font-mono font-bold text-[#85f8c4] block">SECURITY LAYER</span>
                  <span className="text-xs font-bold text-white block">Micro-Foil Seal</span>
                  <span className="text-[10px] text-[#8c9e94]">Failsafe rip detection</span>
                </div>
                <div className="w-10 h-[2px] bg-[#85f8c4]" />
              </motion.div>
            </motion.div>

            {/* LAYER 2: SPECIAL SAUCE & GS1 OPTICAL BARCODE LAYER */}
            <motion.div
              style={{
                y: barcodeY,
                x: barcodeX,
                rotate: barcodeRotate,
                zIndex: 14
              }}
              onMouseEnter={() => setActiveLayerHover(2)}
              onMouseLeave={() => setActiveLayerHover(null)}
              className="absolute w-[290px] sm:w-[360px] transition-shadow cursor-pointer"
            >
              <div className="relative rounded-2xl p-3.5 bg-[#17201c] border-2 border-[#85f8c4] shadow-[0_15px_35px_rgba(0,105,72,0.5)] text-white">
                {/* Active Laser Line animation */}
                <div className="absolute inset-x-2 top-0 h-[2px] bg-red-500 shadow-[0_0_8px_#ff0000] animate-pulse" />

                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#85f8c4]">
                    <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                    <span>Layer 02 • GS1 Optical Matrix</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#006948] text-white px-2 py-0.5 rounded-md font-bold">
                    0.18s SCAN
                  </span>
                </div>

                {/* Simulated EAN-13 Barcode Strips */}
                <div className="mt-2 p-2 rounded-xl bg-white text-black flex items-center justify-between">
                  <div className="flex items-center gap-0.5 h-9">
                    {[3, 1, 4, 1, 2, 5, 1, 3, 2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1].map((w, i) => (
                      <div
                        key={i}
                        className="bg-black h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold block text-gray-500">GTIN-13</span>
                    <span className="text-xs font-mono font-black text-black">
                      {selectedProduct === 'burger' ? '8901058852898' : '7622210884848'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Callout Pointer line */}
              <motion.div
                style={{ opacity: useTransform(smoothProgress, [0.25, 0.45], [0, 1]) }}
                className="hidden md:flex items-center gap-2 absolute -right-48 top-1/2 -translate-y-1/2"
              >
                <div className="w-10 h-[2px] bg-[#ff5500]" />
                <div className="bg-[#1b2520] border border-[#2d3e35] p-2.5 rounded-xl text-left shadow-xl w-44">
                  <span className="text-[10px] font-mono font-bold text-[#ff5500] block">OPTICAL TRACE</span>
                  <span className="text-xs font-bold text-white block">GS1 Barcode</span>
                  <span className="text-[10px] text-[#8c9e94]">Global retail recognized</span>
                </div>
              </motion.div>
            </motion.div>

            {/* LAYER 3: CENTER PATTY / 100% WHOLESOME REAL CORE */}
            <motion.div
              style={{
                scale: centerScale,
                zIndex: 13
              }}
              onMouseEnter={() => setActiveLayerHover(3)}
              onMouseLeave={() => setActiveLayerHover(null)}
              className="absolute w-[300px] sm:w-[370px] transition-shadow cursor-pointer"
            >
              <div className="relative rounded-3xl p-4 bg-gradient-to-r from-[#2c1810] via-[#4a2818] to-[#2c1810] border-2 border-[#804020] shadow-[0_20px_40px_rgba(0,0,0,0.8)] text-white">
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔥</span>
                    <span className="text-[11px] font-black tracking-wide text-amber-300 uppercase">
                      Layer 03 • The Pure Substance
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#ffd600] text-black font-black text-[10px]">
                    100% REAL
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {selectedProduct === 'burger'
                        ? 'Smashed Caramelized Core'
                        : 'Rich Cocoa & Vanilla Crème'}
                    </h3>
                    <p className="text-xs text-amber-200/90 font-medium">
                      Zero adulteration • No synthetic cheap substitutes
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-gray-400 block">Integrity</span>
                    <span className="text-xl font-black text-[#85f8c4]">100%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LAYER 4: MELTED CHEDDAR / VERIFIED NUTRITION & LAB SHEET */}
            <motion.div
              style={{
                y: cheeseY,
                x: cheeseX,
                rotate: cheeseRotate,
                zIndex: 12
              }}
              onMouseEnter={() => setActiveLayerHover(4)}
              onMouseLeave={() => setActiveLayerHover(null)}
              className="absolute w-[290px] sm:w-[360px] transition-shadow cursor-pointer"
            >
              <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309] border-2 border-[#fbbf24] shadow-[0_15px_35px_rgba(217,119,6,0.4)] text-black">
                <div className="flex items-center justify-between pb-1 text-[10px] font-black uppercase tracking-wider">
                  <span>Layer 04 • Verified Nutrition Specs</span>
                  <span className="bg-black text-[#ffd600] px-2 py-0.5 rounded font-mono">LAB TESTED</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1.5 text-center">
                  <div className="bg-black/15 rounded-lg p-1">
                    <span className="text-[9px] font-bold block text-black/70">CALORIES</span>
                    <span className="text-xs font-black">480 kcal</span>
                  </div>
                  <div className="bg-black/15 rounded-lg p-1">
                    <span className="text-[9px] font-bold block text-black/70">PROTEIN</span>
                    <span className="text-xs font-black">28g</span>
                  </div>
                  <div className="bg-black/15 rounded-lg p-1">
                    <span className="text-[9px] font-bold block text-black/70">ALLERGEN</span>
                    <span className="text-xs font-black">None Flagged</span>
                  </div>
                  <div className="bg-black/15 rounded-lg p-1">
                    <span className="text-[9px] font-bold block text-black/70">GRADE</span>
                    <span className="text-xs font-black">Grade A+</span>
                  </div>
                </div>
              </div>

              {/* Callout Pointer line */}
              <motion.div
                style={{ opacity: useTransform(smoothProgress, [0.35, 0.55], [0, 1]) }}
                className="hidden md:flex items-center gap-2 absolute -left-48 top-1/2 -translate-y-1/2"
              >
                <div className="bg-[#1b2520] border border-[#2d3e35] p-2.5 rounded-xl text-left shadow-xl w-44">
                  <span className="text-[10px] font-mono font-bold text-[#ffd600] block">NUTRITION</span>
                  <span className="text-xs font-bold text-white block">Lab Certified</span>
                  <span className="text-[10px] text-[#8c9e94]">FSSAI safety standards</span>
                </div>
                <div className="w-10 h-[2px] bg-[#ffd600]" />
              </motion.div>
            </motion.div>

            {/* LAYER 5: BOTTOM BUN / DECENTRALIZED MERKLE LEDGER BED */}
            <motion.div
              style={{
                y: bottomBunY,
                rotate: bottomBunRotate,
                scale: bottomBunScale,
                zIndex: 11
              }}
              onMouseEnter={() => setActiveLayerHover(5)}
              onMouseLeave={() => setActiveLayerHover(null)}
              className="absolute w-[280px] sm:w-[350px] transition-shadow cursor-pointer"
            >
              <div className="relative rounded-3xl p-4 bg-[#141b17] border-2 border-[#006948] shadow-[0_20px_45px_rgba(0,105,72,0.6)] text-white">
                <div className="flex items-center justify-between pb-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#85f8c4]">
                    <span className="material-symbols-outlined text-[14px]">hub</span>
                    <span>Layer 05 • Immutable Genesis Hash</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">BLOCK #14820</span>
                </div>

                <div className="pt-1.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block">SHA-256 PROOF</span>
                    <span className="text-xs font-mono font-bold text-[#85f8c4] truncate max-w-[200px] block">
                      0x7e8f9a0b1c2d3e4f...
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#006948] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                </div>
              </div>

              {/* Callout Pointer line */}
              <motion.div
                style={{ opacity: useTransform(smoothProgress, [0.4, 0.65], [0, 1]) }}
                className="hidden md:flex items-center gap-2 absolute -right-48 top-1/2 -translate-y-1/2"
              >
                <div className="w-10 h-[2px] bg-[#85f8c4]" />
                <div className="bg-[#1b2520] border border-[#2d3e35] p-2.5 rounded-xl text-left shadow-xl w-44">
                  <span className="text-[10px] font-mono font-bold text-[#85f8c4] block">BLOCKCHAIN</span>
                  <span className="text-xs font-bold text-white block">Merkle Proof</span>
                  <span className="text-[10px] text-[#8c9e94]">Zero fake overrides</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM ACTION & SCROLL GUIDE DOCK */}
        <div className="relative z-20 max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Stage Progress Message */}
          <div className="text-center sm:text-left">
            <motion.div style={{ opacity: phase1Opacity }} className="text-xs sm:text-sm font-bold text-[#8c9e94]">
              👇 <span className="text-white font-extrabold">Scroll slowly down</span> to dissect the layers and inspect the product anatomy.
            </motion.div>
            <motion.div style={{ opacity: phase2Opacity }} className="text-xs sm:text-sm font-bold text-[#ffd600] absolute">
              ⚡ <span className="text-white font-extrabold">Dissection in progress</span> — Optical Barcode, Nutrition & Cryptographic Hash isolated!
            </motion.div>
            <motion.div style={{ opacity: phase3Opacity }} className="text-xs sm:text-sm font-bold text-[#85f8c4] absolute">
              ✅ <span className="text-white font-extrabold">100% Genuine Verified</span> — Zero counterfeit tolerance. Ready to scan your own!
            </motion.div>
          </div>

          {/* Direct Launch CTA buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onEnterSite('scanner', selectedProduct === 'burger' ? '8901058852898' : '7622210884848')}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-[#ff5500] hover:bg-[#e04b00] active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#ff5500]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
              <span>Test Verify This Now</span>
            </button>

            <button
              type="button"
              onClick={() => onEnterSite('scanner')}
              className="px-5 py-3 rounded-2xl bg-[#1b2520] hover:bg-[#25332c] text-white font-bold text-xs sm:text-sm border border-[#2d3e35] transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">qr_code_scanner</span>
              <span>Open Camera</span>
            </button>
          </div>
        </div>

        {/* BOTTOM MARQUEE BANNER (Continuous Crav-Style Opposite Ticker) */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden border-t border-[#243329] bg-[#111714]/90 backdrop-blur-md py-1.5">
          <div className="flex whitespace-nowrap animate-marquee-reverse font-mono text-[10px] font-black tracking-widest text-[#72857a] uppercase">
            <span className="mx-4 text-white">★ CRUNCH THE DATA, NOT THE FAKES</span>
            <span className="mx-4 text-[#ffd600]">★ REAL INGREDIENTS ONLY</span>
            <span className="mx-4 text-[#85f8c4]">★ IMMUTABLE MERKLE ROOTS</span>
            <span className="mx-4 text-[#ff5500]">★ FROM FACTORY FLOOR TO YOUR PALATE</span>
            <span className="mx-4 text-white">★ CRUNCH THE DATA, NOT THE FAKES</span>
            <span className="mx-4 text-[#ffd600]">★ REAL INGREDIENTS ONLY</span>
            <span className="mx-4 text-[#85f8c4]">★ IMMUTABLE MERKLE ROOTS</span>
            <span className="mx-4 text-[#ff5500]">★ FROM FACTORY FLOOR TO YOUR PALATE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
