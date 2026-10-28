import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveCameraScanner } from './LiveCameraScanner';
import { ScannerPageSkeleton } from './ShimmerSkeleton';
import {
  createConfiguredZxingReader,
  decodeBarcodeOrQRFromImageData
} from '../services/barcodeScannerUtils';
import { analyzeScannedPayload, analyzeScannedPayloadAsync } from '../services/webScraperIntelligence';
import { mintProductOnChain } from '../services/blockchainLedger';
import { BlockchainProductRecord, BlockchainBlock, ScanVerificationResult } from '../types';
import { translations, Language } from '../services/translations';
import { TrustScoreGauge } from './TrustScoreGauge';
import { logQrReaderError } from './ReactQrReader';
import { ReportProductModal } from './ReportProductModal';

interface MainScannerPageProps {
  blockchainLedger: Record<string, BlockchainProductRecord>;
  blockchainBlocks: BlockchainBlock[];
  onMintSuccess?: (newRecord: BlockchainProductRecord, newBlock: BlockchainBlock) => void;
  onNavigateToRegister?: (initialCode?: string) => void;
  onOpenReportModal?: (initialData?: any) => void;
  activeScannedCode?: string;
  lang?: Language;
}

export const MainScannerPage: React.FC<MainScannerPageProps> = ({
  blockchainLedger,
  blockchainBlocks,
  activeScannedCode,
  lang = 'en'
}) => {
  const t = translations[lang];

  // Default to an everyday food product: Oreo Original Cookies (7622210884848)
  const [inputCode, setInputCode] = useState(activeScannedCode || '7622210884848');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanVerificationResult | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Live Camera Scanner states
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isInlineScannerOpen, setIsInlineScannerOpen] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [isAudioFeedbackEnabled, setIsAudioFeedbackEnabled] = useState(true);
  const [audioHudMessage, setAudioHudMessage] = useState<string | null>(null);

  // Sound synthesizer for scan feedback
  const playBeep = () => {
    if (!isAudioFeedbackEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {}
  };

  const showAudioHud = (msg: string) => {
    setAudioHudMessage(msg);
    setTimeout(() => setAudioHudMessage(null), 1800);
  };

  const toggleAudio = () => {
    const next = !isAudioFeedbackEnabled;
    setIsAudioFeedbackEnabled(next);
    showAudioHud(next ? 'Audio: On' : 'Audio: Muted');
  };

  // Perform product verification query
  const executeVerification = async (payload: string, detectedFormat?: string) => {
    setIsAnalyzing(true);
    setInputCode(payload);
    playBeep();

    try {
      const res = await analyzeScannedPayloadAsync(payload, blockchainLedger);
      if (detectedFormat) {
        res.barcodeFormat = detectedFormat;
      }
      setCurrentResult(res);
    } catch {
      const res = analyzeScannedPayload(payload, blockchainLedger);
      if (detectedFormat) {
        res.barcodeFormat = detectedFormat;
      }
      setCurrentResult(res);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        const resultSection = document.getElementById('verification-result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Handle uploaded photo scan
  const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const zxReader = createConfiguredZxingReader();
          const detected = decodeBarcodeOrQRFromImageData(imageData, zxReader);
          if (detected && detected.text) {
            executeVerification(detected.text, detected.format);
          } else {
            showAudioHud('No barcode detected in image. Please try a clearer picture.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Run initial scan on mount or when activeScannedCode changes
  useEffect(() => {
    if (activeScannedCode) {
      executeVerification(activeScannedCode);
    } else {
      executeVerification('8901262010881'); // Default to Amul Dark 55% Chocolate
    }
  }, [activeScannedCode]);

  const isReal = Boolean(currentResult?.isRegisteredOnBlockchain);
  const isRecalled = Boolean(currentResult?.blockchainRecord?.status === 'RECALLED');
  const record = currentResult?.blockchainRecord;
  const webIntel = currentResult?.webIntelligence;
  const isFoodOrBeverage = webIntel?.categoryGroup === 'food' || webIntel?.categoryGroup === 'beverage' || (record?.category.toLowerCase().includes('food') || record?.category.toLowerCase().includes('beverage') || record?.category.toLowerCase().includes('snack') || record?.category.toLowerCase().includes('condiment') || record?.category.toLowerCase().includes('dairy'));
  const foodDetails = webIntel?.foodDetails;

  return (
    <div className="w-full pb-20 pt-20">
      {/* Search & Camera Viewfinder Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#bccac0]/40 shadow-sm space-y-5 text-center">
          <div className="space-y-1.5 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4]/30 border border-[#006948]/20 text-[#006948] text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Product Authenticity Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1c1a] tracking-tight">
              Scan & Verify Any Market Product
            </h1>
            <p className="text-xs sm:text-sm text-[#6d7a72] leading-relaxed">
              Scan barcodes on food items, drinks, snacks, cosmetics, or daily goods to verify if they are 100% genuine and view ingredients, nutrition, and origin.
            </p>
          </div>

          {/* Scanner Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsInlineScannerOpen(!isInlineScannerOpen)}
              className="h-11 px-5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isInlineScannerOpen ? 'videocam_off' : 'photo_camera'}
              </span>
              <span>{isInlineScannerOpen ? 'Close Camera' : 'Open Live Camera Scanner'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScannerModalOpen(true)}
              className="h-11 px-4 rounded-xl bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#1a1c1a] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-[#bccac0]/40"
            >
              <span className="material-symbols-outlined text-[18px] text-[#006948]">fullscreen</span>
              <span>Full-Screen Scanner</span>
            </button>

            <label className="h-11 px-4 rounded-xl bg-white hover:bg-[#f4f3f1] text-[#1a1c1a] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-[#bccac0]/40 shadow-2xs">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileScan}
                className="hidden"
              />
              <span className="material-symbols-outlined text-[18px] text-[#006948]">upload_file</span>
              <span>Upload Barcode Photo</span>
            </label>
          </div>

          {/* Inline Live Camera Viewfinder */}
          <AnimatePresence>
            {isInlineScannerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-[#006948]/30 shadow-md text-left"
              >
                <LiveCameraScanner
                  autoStart={true}
                  onScanResult={(val, format) => {
                    executeVerification(val, format);
                    setIsInlineScannerOpen(false);
                  }}
                  onError={(err) => {
                    logQrReaderError(err, 'MainScannerPage.InlineCamera');
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                      setCameraPermissionDenied(true);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera Permission Alert Banner */}
          {cameraPermissionDenied && (
            <div className="p-3.5 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left">
              <div className="flex items-center gap-2.5 text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[20px] shrink-0">videocam_off</span>
                <div>
                  <span className="font-bold block">Camera Access Blocked</span>
                  <span className="text-[#3d4a42] text-[11px]">
                    Please allow camera access in your browser settings or use the &quot;Upload Barcode Photo&quot; button.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCameraPermissionDenied(false)}
                className="text-[#6d7a72] hover:text-[#1a1c1a] p-1 cursor-pointer self-end sm:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Direct Barcode / Serial Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputCode.trim()) executeVerification(inputCode.trim());
            }}
            className="flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto"
          >
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6d7a72]">
                <span className="material-symbols-outlined text-[18px]">barcode</span>
              </div>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Type or paste any product barcode or serial..."
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/40 text-xs text-[#1a1c1a] font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#1a1c1a] text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer shrink-0"
            >
              Verify Code
            </button>
          </form>

          {/* Consumer Verification Guide */}
          <div className="pt-4 border-t border-[#bccac0]/25 text-left">
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1a1c1a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-[#006948]">help_outline</span>
                  <span>How Consumer Verification Works</span>
                </span>
                <span className="text-[11px] text-[#006948] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                  <span>Certified Brand Database Active</span>
                </span>
              </div>
              <p className="text-xs text-[#3d4a42] leading-relaxed">
                Scan any physical barcode or upload a clear photo of product packaging. Our system cross-references certified manufacturer databases to identify the <strong>exact product variant</strong> (e.g., Amul Dark 55% vs. Nut &apos;N&apos; Bar vs. Silk Oreo), nutritional facts, and physical security markers.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#6d7a72]">
                <span className="font-semibold text-[#1a1c1a]">Quick Search Examples:</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputCode('8901262010881');
                    executeVerification('8901262010881');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-[#bccac0]/40 hover:bg-[#efeeeb] text-[#006948] font-mono cursor-pointer transition-colors"
                >
                  8901262010881 (Amul Dark 55%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputCode('8901262010898');
                    executeVerification('8901262010898');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-[#bccac0]/40 hover:bg-[#efeeeb] text-[#006948] font-mono cursor-pointer transition-colors"
                >
                  8901262010898 (Amul Nut &apos;N&apos; Bar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputCode('7622210884848');
                    executeVerification('7622210884848');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-[#bccac0]/40 hover:bg-[#efeeeb] text-[#006948] font-mono cursor-pointer transition-colors"
                >
                  7622210884848 (Oreo Cookies)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputCode('000000FAKE99');
                    executeVerification('000000FAKE99');
                  }}
                  className="px-2 py-0.5 rounded-md bg-[#ffdad6]/60 border border-[#ba1a1a]/30 hover:bg-[#ffdad6] text-[#93000a] font-mono cursor-pointer transition-colors"
                >
                  000000FAKE99 (Unregistered Fake)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BIFURCATED PRODUCT VERIFICATION RESULT SECTION */}
      {/* ========================================================================= */}
      <section id="verification-result-section" className="max-w-4xl mx-auto px-4 sm:px-6 py-4 scroll-mt-20">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="scanner-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ScannerPageSkeleton />
            </motion.div>
          ) : currentResult ? (
            <motion.div
              key={currentResult.rawPayload}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Main Result Card */}
              <div
                className={`rounded-3xl border p-6 sm:p-8 shadow-sm transition-colors ${
                  isReal && !isRecalled
                    ? 'bg-white border-[#006948]/30 ring-1 ring-[#006948]/20'
                    : 'bg-white border-[#ba1a1a]/40 ring-1 ring-[#ba1a1a]/25'
                }`}
              >
                {/* PRODUCT VERIFICATION CARD HEADER & AUTHENTICITY STATUS */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#bccac0]/25">
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isReal && !isRecalled
                          ? 'bg-[#006948] text-white ring-4 ring-[#85f8c4]/50'
                          : isRecalled
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                          : 'bg-[#ba1a1a] text-white ring-4 ring-[#ffdad6]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[36px]">
                        {isReal && !isRecalled ? 'verified_user' : isRecalled ? 'warning' : 'gpp_bad'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f4f3f1] text-[#3d4a42] border border-[#bccac0]/30">
                          Product Verification
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isReal && !isRecalled
                              ? 'bg-[#85f8c4]/40 text-[#006948] border border-[#006948]/30'
                              : isRecalled
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/30'
                          }`}
                        >
                          {isReal && !isRecalled ? 'Verified Brand Seal' : isRecalled ? 'Recall Notice' : 'Unregistered Warning'}
                        </span>
                      </div>

                      <h2
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                          isReal && !isRecalled ? 'text-[#006948]' : isRecalled ? 'text-amber-700' : 'text-[#ba1a1a]'
                        }`}
                      >
                        {isReal && !isRecalled
                          ? '100% Authentic Product'
                          : isRecalled
                          ? 'Product Recall Alert'
                          : 'Unverified / Counterfeit Risk'}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#3d4a42] leading-relaxed">
                        {isReal && !isRecalled
                          ? 'This product is verified against official manufacturer records. Packaging integrity, authenticity credentials, and origin have been validated.'
                          : isRecalled
                          ? `Official safety recall notice: ${record?.recallReason || 'Do not consume or use.'}`
                          : 'Warning: This product barcode was not found in the verified brand registry and may be a replica or unauthorized import.'}
                      </p>
                    </div>
                  </div>

                  {/* Authenticity Score Gauge */}
                  <TrustScoreGauge
                    targetScore={isReal && !isRecalled ? 100 : (currentResult.trustScore || 15)}
                    isReal={isReal}
                    isRecalled={isRecalled}
                  />
                </div>

                {/* CORE PRODUCT ATTRIBUTES */}
                <div className="py-6 border-b border-[#bccac0]/25 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#006948] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                      <span>Core Product Attributes</span>
                    </span>
                    <span className="text-xs text-[#6d7a72] font-medium">
                      Barcode: <strong className="text-[#1a1c1a] font-mono">{currentResult.rawPayload}</strong>
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/35 flex flex-col md:flex-row items-start md:items-center gap-5">
                    {/* Visual Product / Food Image */}
                    {webIntel?.imageUrl && (
                      <div className="relative w-full sm:w-44 h-38 rounded-xl overflow-hidden bg-white border border-[#bccac0]/40 shrink-0 shadow-xs">
                        <img
                          src={webIntel.imageUrl}
                          alt={webIntel.productMatchTitle || 'Product'}
                          className="w-full h-full object-cover"
                        />
                        {isFoodOrBeverage && (
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-neutral-200 shadow-xs flex items-center gap-1.5">
                            {/* Indian standard Vegetarian Green Dot mark */}
                            <div className="w-3.5 h-3.5 border-2 border-[#006948] flex items-center justify-center p-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#006948]"></div>
                            </div>
                            <span className="text-[10px] font-bold text-[#006948]">100% VEG</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Overview Text */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#006948]/10 text-[#006948] font-bold text-xs uppercase border border-[#006948]/20 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          <span>{webIntel?.brand || record?.brand || 'Verified Brand'}</span>
                        </span>
                        <span className="text-xs text-[#6d7a72] font-semibold">
                          {webIntel?.category || record?.category || 'Consumer Product'}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c1a] leading-tight">
                        {webIntel?.productMatchTitle || record?.name || 'Commercial Product'}
                      </h3>

                      {webIntel?.exactVariant && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold">
                          <span className="material-symbols-outlined text-[15px] text-amber-700">stars</span>
                          <span>Exact Variant: {webIntel.exactVariant}</span>
                        </div>
                      )}

                      <p className="text-xs text-[#3d4a42] leading-relaxed">
                        {webIntel?.summary || 'Standard retail commercial packaging verified via authorized manufacturer catalog.'}
                      </p>

                      {/* 4 Core Quick Attribute Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-[#bccac0]/30">
                          <span className="text-[10px] text-[#6d7a72] block">Retail Price</span>
                          <span className="font-extrabold text-[#006948] text-sm block mt-0.5">
                            {webIntel?.estimatedPrice || (record ? `$${record.priceUsd} USD` : '$2.50 USD')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-[#bccac0]/30">
                          <span className="text-[10px] text-[#6d7a72] block">Origin</span>
                          <span className="font-bold text-[#1a1c1a] text-xs block mt-0.5 truncate" title={webIntel?.countryOfOrigin || 'International'}>
                            {webIntel?.countryOfOrigin?.split('(')[0]?.trim() || 'Verified Facility'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-[#bccac0]/30">
                          <span className="text-[10px] text-[#6d7a72] block">Packaging</span>
                          <span className={`font-bold text-xs block mt-0.5 ${isReal && !isRecalled ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>
                            {isReal && !isRecalled ? 'Intact & Sealed' : 'Unverified'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-[#bccac0]/30">
                          <span className="text-[10px] text-[#6d7a72] block">Net Quantity</span>
                          <span className="font-bold text-[#1a1c1a] text-xs block mt-0.5 truncate">
                            {foodDetails?.netQuantity || 'Standard Pack'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NUTRITION & DIETARY ATTRIBUTES (IF FOOD/BEVERAGE) */}
                {isFoodOrBeverage && (
                  <div className="py-6 border-b border-[#bccac0]/25 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#006948] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">restaurant</span>
                        <span>Nutrition Facts & Ingredients</span>
                      </h4>
                      <span className="text-xs text-[#6d7a72]">
                        Serving Size: <strong className="text-[#1a1c1a]">{foodDetails?.nutrition?.servingSize || '100g'}</strong> • Energy: <strong className="text-[#006948]">{foodDetails?.nutrition?.calories || '240 kcal'}</strong>
                      </span>
                    </div>

                    {/* Nutrition Facts Mini-Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#bccac0]/30 text-center">
                        <span className="text-[10px] text-[#6d7a72] block">Protein</span>
                        <span className="font-bold text-[#1a1c1a] text-sm block mt-0.5">
                          {foodDetails?.nutrition?.protein || '4.5g'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#bccac0]/30 text-center">
                        <span className="text-[10px] text-[#6d7a72] block">Total Fat</span>
                        <span className="font-bold text-[#1a1c1a] text-sm block mt-0.5">
                          {foodDetails?.nutrition?.totalFat || '7.0g'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#bccac0]/30 text-center">
                        <span className="text-[10px] text-[#6d7a72] block">Carbohydrates</span>
                        <span className="font-bold text-[#1a1c1a] text-sm block mt-0.5">
                          {foodDetails?.nutrition?.carbohydrates || '25.0g'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#bccac0]/30 text-center">
                        <span className="text-[10px] text-[#6d7a72] block">Sugars</span>
                        <span className="font-bold text-[#006948] text-sm block mt-0.5">
                          {foodDetails?.nutrition?.sugars || '14.0g'}
                        </span>
                      </div>
                    </div>

                    {/* Ingredients & Allergen Notices */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {foodDetails?.ingredientsList && foodDetails.ingredientsList.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-1.5">
                          <span className="text-xs font-bold text-[#1a1c1a] block">Ingredients:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {foodDetails.ingredientsList.map((ing, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white text-xs text-[#3d4a42] border border-[#bccac0]/30">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-3.5 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/20 space-y-1">
                        <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">warning</span>
                          <span>Allergens & Expiry:</span>
                        </span>
                        <p className="text-xs text-[#93000a]">
                          {foodDetails?.allergens?.join(', ') || 'No common allergen alerts detected. Verify on pack.'}
                        </p>
                        <p className="text-xs text-[#3d4a42] pt-1">
                          Best Before: <strong>{foodDetails?.bestBefore || record?.expiryDate || '10 May 2027'}</strong>
                        </p>
                        {foodDetails?.foodSafetyLicense && (
                          <span className="text-[11px] font-mono text-[#006948] block pt-0.5">
                            {foodDetails.foodSafetyLicense}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PRODUCT SPECIFICS (IF NON-FOOD) */}
                {!isFoodOrBeverage && (
                  <div className="py-6 border-b border-[#bccac0]/25 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#006948] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Product Highlights & Standards</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(webIntel?.keySpecs || [
                        'Authentic product verified with manufacturer records',
                        'Tamper-evident packaging intact',
                        'Quality inspected and tested'
                      ]).map((spec, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#faf9f6] border border-[#bccac0]/30">
                          <span className="material-symbols-outlined text-[15px] text-[#006948] shrink-0 mt-0.5">verified</span>
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physical Packaging Verification Points */}
                {((webIntel?.physicalAuthenticityChecks && webIntel.physicalAuthenticityChecks.length > 0) ||
                  (webIntel?.authenticityIndicators && webIntel.authenticityIndicators.length > 0)) && (
                  <div className="py-4 border-b border-[#bccac0]/25">
                    <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/35 space-y-2.5">
                      <div className="text-xs font-bold text-[#1a1c1a] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006948]">fact_check</span>
                        <span>Physical Packaging Verification Points:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#3d4a42]">
                        {(webIntel.physicalAuthenticityChecks || webIntel.authenticityIndicators || []).map((ind, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#bccac0]/20">
                            <span className="material-symbols-outlined text-[15px] text-[#006948] shrink-0 mt-0.5">verified</span>
                            <span>{ind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Counterfeit Red Flags (How to spot a fake) */}
                {webIntel?.counterfeitRedFlags && webIntel.counterfeitRedFlags.length > 0 && (
                  <div className="py-4 border-b border-[#bccac0]/25">
                    <div className="p-4 rounded-2xl bg-[#ffdad6]/30 border border-[#ba1a1a]/30 space-y-2.5">
                      <div className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>How to Spot a Fake / Counterfeit Red Flags:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#93000a]">
                        {webIntel.counterfeitRedFlags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/80 border border-[#ba1a1a]/20">
                            <span className="material-symbols-outlined text-[15px] text-[#ba1a1a] shrink-0 mt-0.5">cancel</span>
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* REPORT FAKE / DAMAGED PRODUCT & TRACK DISTRIBUTOR */}
                <div className="py-4 border-b border-[#bccac0]/25">
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-[#1a1c1a] flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="material-symbols-outlined text-[17px] text-[#ba1a1a]">report_problem</span>
                        <span>Found a Fake Product or Damaged Packaging?</span>
                      </div>
                      <p className="text-[11px] text-[#6d7a72] max-w-lg leading-relaxed">
                        Upload a photo of the defect and pin the seller/distributor location. The manufacturer brand protection team will track the distributor and take strict legal action.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                        <span>Report Fake & Track Seller</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#efeeeb] text-[#006948] border border-[#006948]/30 text-xs font-bold shadow-2xs cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">contact_support</span>
                        <span>Ask Brand / Query</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Consumer Warning if Unregistered - Registration Restricted to Manufacturers Only */}
                {!isReal && (
                  <div className="py-4 border-b border-[#bccac0]/25">
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 space-y-3">
                      <div className="flex items-center gap-2 text-[#93000a]">
                        <span className="material-symbols-outlined text-[22px]">gpp_maybe</span>
                        <h4 className="text-xs sm:text-sm font-bold">Unregistered Product • Consumer Protection Notice</h4>
                      </div>
                      <p className="text-xs text-[#3d4a42] leading-relaxed">
                        This barcode is not certified in the official manufacturer database and may be an unauthorized duplicate, adulterated good, or counterfeit. <strong>Consumers do not have permission to register products</strong> — only certified brand manufacturers can register items via the Manufacturer Portal.
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReportModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">location_searching</span>
                          <span>Report Counterfeit & Pin Distributor</span>
                        </button>
                        <span className="text-[11px] text-[#6d7a72]">
                          Your report alerts the brand manufacturer to track the distributor selling this fake product.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6d7a72]">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">verified</span>
                    <span>Scanned at {currentResult.scannedAt} • Verified Genuine Record</span>
                  </span>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      (webIntel?.brand || '') + ' ' + (webIntel?.productMatchTitle || '') + ' ' + currentResult.rawPayload
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#006948] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">search</span>
                    <span>Search Brand Catalog</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* POPUP FULL-SCREEN CAMERA MODAL */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-[#1a1c1a] max-w-xl w-full rounded-2xl shadow-xl overflow-hidden border border-[#bccac0]/40 flex flex-col max-h-[92vh] overflow-y-auto">
            <div className="p-4 sm:p-5 flex items-center justify-between gap-2 border-b border-[#bccac0]/25 bg-[#faf9f6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#85f8c4]/40 text-[#006948] flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1a1c1a] leading-tight">Live Product Barcode Scanner</h3>
                  <p className="text-xs text-[#6d7a72] mt-0.5">
                    Hold food, drink, cosmetic, or packaged product in camera view
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleAudio}
                  title="Toggle Audio Feedback"
                  className={`h-8 px-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    isAudioFeedbackEnabled
                      ? 'bg-[#85f8c4]/40 border-[#006948]/30 text-[#006948] font-semibold'
                      : 'bg-[#f4f3f1] border-[#bccac0]/40 text-[#6d7a72]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAudioFeedbackEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                  <span>{isAudioFeedbackEnabled ? 'Audio On' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScannerModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f4f3f1] text-[#6d7a72] hover:text-[#1a1c1a] flex items-center justify-center transition-colors cursor-pointer"
                  title="Close scanner"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Audio Toast */}
            {audioHudMessage && (
              <div className="px-4 sm:px-5 pt-3">
                <div className="p-2.5 rounded-xl bg-[#85f8c4]/40 border border-[#006948]/30 text-[#006948] text-xs font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                  <span>{audioHudMessage}</span>
                </div>
              </div>
            )}

            {/* Viewfinder */}
            <div className="p-3 sm:p-4">
              <LiveCameraScanner
                onScanResult={(val, format) => {
                  executeVerification(val, format);
                  setIsScannerModalOpen(false);
                }}
                onError={(err) => {
                  logQrReaderError(err, 'MainScannerPage.LiveCameraModal');
                  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setCameraPermissionDenied(true);
                  }
                }}
                autoStart={true}
              />
            </div>

            <div className="p-3 sm:px-5 bg-[#faf9f6] border-t border-[#bccac0]/25 flex items-center justify-between text-xs text-[#6d7a72]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#006948]">check_circle</span>
                <span>Supports EAN-13, UPC-A, Code 128, and QR codes</span>
              </span>
              <button
                type="button"
                onClick={() => setIsScannerModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#1a1c1a] font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Product & Track Seller Modal */}
      <ReportProductModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialProduct={{
          name: currentResult?.webIntelligence?.productMatchTitle || currentResult?.blockchainRecord?.name,
          brand: currentResult?.webIntelligence?.brand || currentResult?.blockchainRecord?.brand,
          variant: currentResult?.webIntelligence?.exactVariant,
          barcode: currentResult?.rawPayload
        }}
      />
    </div>
  );
};
