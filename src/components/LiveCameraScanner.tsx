import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  createConfiguredZxingReader,
  decodeBarcodeOrQRFromImageData,
  decodeFromCanvas,
  BarcodeFormat
} from '../services/barcodeScannerUtils';
import {
  getCompatibleConstraintsList,
  detectDeviceEnvironment
} from '../services/cameraConstraints';
import { logQrReaderError } from './ReactQrReader';
import { CameraPermissionDeniedUI } from './CameraPermissionDeniedUI';
import {
  Camera,
  CameraOff,
  Upload,
  ScanLine,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Layers,
  Barcode,
  QrCode,
  Sparkles,
  Search,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateProductPayload } from '../services/productValidation';

export type ScannerMode = 'all' | 'barcode' | 'qr';

export interface LiveCameraScannerProps {
  onScanResult: (payload: string, detectedFormat?: string) => void;
  onError?: (error: Error) => void;
  isScanning?: boolean;
  autoStart?: boolean;
}

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({
  onScanResult,
  onError,
  isScanning = true,
  autoStart = true
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [nonProductNotice, setNonProductNotice] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerMode>('all');
  const [manualInput, setManualInput] = useState('');
  const [hasScannedFlash, setHasScannedFlash] = useState(false);
  const [scanStatus, setScanStatus] = useState<'searching' | 'locked' | 'standby'>('standby');
  const [detectedFormatBadge, setDetectedFormatBadge] = useState<string | null>(null);
  const [detectedPoint, setDetectedPoint] = useState<{ x: number; y: number; label: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const onScanResultRef = useRef(onScanResult);
  useEffect(() => {
    onScanResultRef.current = onScanResult;
  }, [onScanResult]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isProcessingFrame = useRef<boolean>(false);
  const isScanLocked = useRef<boolean>(false);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScanTimestamp = useRef<number>(0);

  // Initialize ZXing MultiFormatReader configured for 1D barcodes and 2D QR codes
  const zxingReaderRef = useRef<any>(null);
  const barcodeDetectorRef = useRef<any>(null);

  useEffect(() => {
    try {
      zxingReaderRef.current = createConfiguredZxingReader();
    } catch (err) {
      console.warn('Failed to initialize ZXing reader:', err);
    }

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        barcodeDetectorRef.current = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'data_matrix']
        });
      } catch {
        try {
          barcodeDetectorRef.current = new (window as any).BarcodeDetector();
        } catch {}
      }
    }
  }, []);

  // Stop camera stream cleanup
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanStatus('standby');
    setTorchOn(false);
    setDetectedPoint(null);
    isProcessingFrame.current = false;

    // Clear overlay canvas
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
    }
  }, []);

  // Play optical capture audio beep via Web Audio API
  const playAudioBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 note
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.07); // E6 note
      osc.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.14); // G6 note (Chime)

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy or not supported
    }

    // Haptic vibration feedback on supported mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 80]);
      } catch {}
    }
  };

  // Draw targeting bounding polygon over the detected code
  const drawBoundingBox = (points: Array<{ x: number; y: number }>, label: string) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || points.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#85f8c4';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#006948';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(133, 248, 196, 0.22)';
    ctx.fill();

    // Draw corner highlight dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#006948';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw floating label chip
    const minX = Math.min(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const chipX = Math.max(10, minX);
    const chipY = Math.max(24, minY - 12);

    ctx.font = 'bold 12px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(chipX - 6, chipY - 16, textWidth + 16, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#85f8c4';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#85f8c4';
    ctx.fillText(label, chipX + 2, chipY);
  };

  const triggerSuccessFeedback = useCallback(
    (payload: string, formatName: string = 'CODE', points?: Array<{ x: number; y: number }>) => {
      if (isScanLocked.current) return;

      // Validate that this is a commercial physical product code (reject Wi-Fi, vCard, random text)
      const validation = validateProductPayload(payload);
      if (!validation.isProduct) {
        setNonProductNotice(validation.rejectionReason || 'Trust Chain only scans physical commercial products.');
        setTimeout(() => {
          setNonProductNotice(null);
        }, 4500);
        return;
      }

      setNonProductNotice(null);
      isScanLocked.current = true;

      setHasScannedFlash(true);
      setScanStatus('locked');
      setDetectedFormatBadge(formatName);
      playAudioBeep();

      if (points && points.length > 0) {
        const avgX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
        const avgY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
        setDetectedPoint({ x: avgX, y: avgY, label: `${formatName}: ${payload}` });
        drawBoundingBox(points, `${formatName}: ${payload.slice(0, 18)}`);
      } else {
        setDetectedPoint({ x: 150, y: 150, label: `${formatName}: ${payload}` });
      }

      setTimeout(() => {
        setHasScannedFlash(false);
      }, 350);

      // Brief delay so user sees green target lock and hears confirmation chime
      setTimeout(() => {
        if (onScanResultRef.current) {
          onScanResultRef.current(payload, formatName);
        }
      }, 250);
    },
    []
  );

  // Real-time canvas frame scanning loop with Multi-Format Barcode Engine + Native Detector + jsQR
  const requestScanFrame = useCallback(async () => {
    const video = videoRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (
      video &&
      hiddenCanvas &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !isProcessingFrame.current &&
      !isScanLocked.current
    ) {
      isProcessingFrame.current = true;
      try {
        const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });

        if (hiddenCtx) {
          if (hiddenCanvas.width !== video.videoWidth || hiddenCanvas.height !== video.videoHeight) {
            hiddenCanvas.width = video.videoWidth;
            hiddenCanvas.height = video.videoHeight;
          }

          if (overlayCanvas) {
            if (overlayCanvas.width !== video.videoWidth || overlayCanvas.height !== video.videoHeight) {
              overlayCanvas.width = video.videoWidth;
              overlayCanvas.height = video.videoHeight;
            }
          }

          hiddenCtx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

          const now = Date.now();
          if (now - lastScanTimestamp.current > 60) {
            lastScanTimestamp.current = now;

            const vWidth = hiddenCanvas.width;
            const vHeight = hiddenCanvas.height;

            if (vWidth >= 30 && vHeight >= 30) {
              // Tier 1: Hardware-Accelerated Native Browser BarcodeDetector (Chrome/Edge/Android)
              if (barcodeDetectorRef.current) {
                try {
                  let barcodes = await barcodeDetectorRef.current.detect(video).catch(() => []);
                  if (!barcodes || barcodes.length === 0) {
                    barcodes = await barcodeDetectorRef.current.detect(hiddenCanvas).catch(() => []);
                  }
                  if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    const bc = barcodes[0];
                    const formatUpper = (bc.format || 'BARCODE').toUpperCase().replace('_', '-');
                    let pts: Array<{ x: number; y: number }> | undefined;
                    if (bc.cornerPoints && bc.cornerPoints.length > 0) {
                      pts = bc.cornerPoints;
                    } else if (bc.boundingBox) {
                      const b = bc.boundingBox;
                      pts = [
                        { x: b.x, y: b.y },
                        { x: b.x + b.width, y: b.y },
                        { x: b.x + b.width, y: b.y + b.height },
                        { x: b.x, y: b.y + b.height }
                      ];
                    }
                    triggerSuccessFeedback(bc.rawValue, formatUpper, pts);
                    return;
                  }
                } catch {
                  // Fall back smoothly to software decoders
                }
              }

              const reader = zxingReaderRef.current || createConfiguredZxingReader();

              // Tier 2: Decode directly from full canvas using HTMLCanvasElementLuminanceSource
              const fullCanvasResult = decodeFromCanvas(hiddenCanvas, reader);
              if (fullCanvasResult && fullCanvasResult.text) {
                triggerSuccessFeedback(fullCanvasResult.text, fullCanvasResult.format, fullCanvasResult.points);
                return;
              }

              // Tier 3: Focused Viewfinder Center Crop (Horizontal and Vertical 90-degree)
              const cropW = Math.round(vWidth * 0.85);
              const cropH = Math.round(vHeight * 0.70);
              const cropX = Math.round((vWidth - cropW) / 2);
              const cropY = Math.round((vHeight - cropH) / 2);

              if (!cropCanvasRef.current) {
                cropCanvasRef.current = document.createElement('canvas');
              }
              const cropCanvas = cropCanvasRef.current;
              cropCanvas.width = cropW;
              cropCanvas.height = cropH;
              const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });

              if (cropCtx) {
                cropCtx.drawImage(hiddenCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                const cropResult = decodeFromCanvas(cropCanvas, reader);
                if (cropResult && cropResult.text) {
                  const offsetPts = cropResult.points?.map((p) => ({
                    x: p.x + cropX,
                    y: p.y + cropY
                  }));
                  triggerSuccessFeedback(cropResult.text, cropResult.format, offsetPts);
                  return;
                }

                // Pass 3B: Rotated 90 degrees (allows scanning barcodes held vertically or rotated packaging)
                if (!rotatedCanvasRef.current) {
                  rotatedCanvasRef.current = document.createElement('canvas');
                }
                const rotCanvas = rotatedCanvasRef.current;
                rotCanvas.width = cropH;
                rotCanvas.height = cropW;
                const rotCtx = rotCanvas.getContext('2d', { willReadFrequently: true });
                if (rotCtx) {
                  rotCtx.translate(cropH / 2, cropW / 2);
                  rotCtx.rotate(Math.PI / 2);
                  rotCtx.drawImage(cropCanvas, -cropW / 2, -cropH / 2);
                  const rotResult = decodeFromCanvas(rotCanvas, reader);
                  if (rotResult && rotResult.text) {
                    triggerSuccessFeedback(rotResult.text, rotResult.format);
                    return;
                  }
                }
              }

              // Tier 4: Fallback with low-level grayscale ImageData
              const centerImageData = hiddenCtx.getImageData(cropX, cropY, cropW, cropH);
              const centerResult = decodeBarcodeOrQRFromImageData(centerImageData, reader);
              if (centerResult && centerResult.text) {
                const offsetPts = centerResult.points?.map((p) => ({
                  x: p.x + cropX,
                  y: p.y + cropY
                }));
                triggerSuccessFeedback(centerResult.text, centerResult.format, offsetPts);
                return;
              }

              const fullImageData = hiddenCtx.getImageData(0, 0, vWidth, vHeight);
              const fullResult = decodeBarcodeOrQRFromImageData(fullImageData, reader);
              if (fullResult && fullResult.text) {
                triggerSuccessFeedback(fullResult.text, fullResult.format, fullResult.points);
                return;
              }

              // Clear overlay canvas when no barcode or QR is currently detected
              if (overlayCanvas) {
                const overlayCtx = overlayCanvas.getContext('2d');
                if (overlayCtx) {
                  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                }
              }
              setDetectedPoint(null);
            }
          }
        }
      } catch (loopErr) {
        console.warn('Frame processing loop warning:', loopErr);
      } finally {
        isProcessingFrame.current = false;
      }
    }

    if (!isScanLocked.current) {
      animationFrameId.current = requestAnimationFrame(requestScanFrame);
    }
  }, [triggerSuccessFeedback]);

  // Start live webcam / camera feed with resilient mobile/desktop fallbacks
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsPermissionDenied(false);
    setIsConnecting(true);
    isScanLocked.current = false;
    stopCamera();

    try {
      const env = detectDeviceEnvironment();
      if (!env.hasMediaDevices) {
        throw new Error(
          'Camera MediaDevices API is unavailable in this environment. You can upload an image or choose one of the sample barcodes below.'
        );
      }

      let stream: MediaStream | null = null;
      let lastErr: any = null;

      // Iteratively attempt device-compatible constraints (mobile rear vs desktop webcam)
      const constraintsList = getCompatibleConstraintsList(facingMode);
      for (const constraint of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch (constraintErr: any) {
          lastErr = constraintErr;
        }
      }

      if (!stream) {
        throw lastErr || new Error('Could not access device video camera.');
      }

      streamRef.current = stream;

      // Torch detection
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() as any) || {};
          if (capabilities.torch) {
            setHasTorch(true);
          }
        } catch {}
      }

      // Ensure video element receives the stream
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.defaultMuted = true;
        video.autoplay = true;

        try {
          await video.play();
        } catch {
          video.onloadedmetadata = async () => {
            try {
              await video.play();
            } catch (playErr) {
              logQrReaderError(playErr, 'LiveCameraScanner.video.play');
            }
          };
        }

        setCameraActive(true);
        setIsPermissionDenied(false);
        setScanStatus('searching');

        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = requestAnimationFrame(requestScanFrame);
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));

      // Call react-qr-reader style error callback and log detailed console messages
      logQrReaderError(errorObj, 'LiveCameraScanner.startCamera');
      if (onErrorRef.current) {
        try {
          onErrorRef.current(errorObj);
        } catch (callbackErr) {
          console.error('Error invoking onError callback:', callbackErr);
        }
      }

      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setIsPermissionDenied(isDenied);

      let errorMsg = 'Unable to access camera video feed.';
      if (isDenied) {
        errorMsg = 'Camera permission was denied. Please allow camera permissions in your browser address bar (lock/camera icon next to URL), or upload a photo below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No video camera detected on this device. You can test sample barcodes below or upload an image.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is currently in use by another app (Zoom, Teams, Meet). Please close other camera tabs and click Launch Camera.';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'The requested video stream resolution/facing constraints were not supported by your camera hardware.';
      } else if (err.name === 'SecurityError') {
        errorMsg = 'Camera access requires a secure HTTPS origin or localhost.';
      }
      setCameraError(errorMsg);
      setCameraActive(false);
      setScanStatus('standby');
    } finally {
      setIsConnecting(false);
    }
  }, [facingMode, requestScanFrame, stopCamera]);

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const newTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: newTorch }]
        });
        setTorchOn(newTorch);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  // Switch between Environment (back) and User (front) camera
  const toggleFacingMode = () => {
    setFacingMode((prev: 'environment' | 'user') => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Upload Barcode or QR Image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          // Decode 1D commercial retail barcodes and 2D QR codes using multi-pass engine
          const zxReader = zxingReaderRef.current || createConfiguredZxingReader();
          const detected = decodeBarcodeOrQRFromImageData(imageData, zxReader);
          if (detected && detected.text) {
            const validation = validateProductPayload(detected.text);
            if (!validation.isProduct) {
              setNonProductNotice(validation.rejectionReason || 'Uploaded code is not a valid commercial product barcode.');
              setTimeout(() => setNonProductNotice(null), 5000);
              return;
            }
            triggerSuccessFeedback(detected.text, detected.format);
            return;
          }

          alert('No barcode or QR code was detected in the uploaded photo. Please try a clearer picture or select one of the test barcodes below.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Manual code submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const clean = manualInput.trim();
    const validation = validateProductPayload(clean);
    if (!validation.isProduct) {
      setNonProductNotice(validation.rejectionReason || 'Entered code is not a valid commercial product code.');
      setTimeout(() => setNonProductNotice(null), 5000);
      return;
    }
    const isDigits = /^\d{8,14}$/.test(clean);
    const format = isDigits ? (clean.length === 12 ? 'UPC-A' : 'EAN-13') : 'CODE-128';
    triggerSuccessFeedback(clean, format);
    setManualInput('');
  };

  // Quick Sample Test Barcodes
  const sampleCodes = [
    { label: 'EAN-13: Coca-Cola 330ml', code: '5000112637939', format: 'EAN-13', brand: 'Coca-Cola' },
    { label: 'UPC-A: Apple iPhone 16 Pro', code: '0194252033012', format: 'UPC-A', brand: 'Apple' },
    { label: 'JAN: Nintendo Switch OLED', code: '4902370542912', format: 'JAN / EAN-13', brand: 'Nintendo' },
    { label: 'EAN-13: Samsung Galaxy S24', code: '8806091234567', format: 'EAN-13', brand: 'Samsung' },
    { label: 'Code 128: Nike Air Jordan', code: 'NIKE-AIR-JORDAN-1042', format: 'CODE-128', brand: 'Nike' },
    { label: 'Fake Barcode: Replica 99', code: '000000FAKE99', format: 'EAN-12', brand: 'Counterfeit' }
  ];

  // Auto-start camera when enabled
  useEffect(() => {
    if (autoStart && isScanning) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [autoStart, facingMode, isScanning, startCamera, stopCamera]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#bccac0]/40 shadow-sm space-y-4 relative overflow-hidden text-[#1a1c1a]">
      {/* Hidden processing canvas & video element are ALWAYS mounted in the DOM to preserve refs */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Shutter Snap Flash with capture feedback */}
      <AnimatePresence>
        {hasScannedFlash && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="p-4 rounded-xl bg-[#006948] text-white font-mono text-sm font-bold shadow-xl flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#85f8c4] animate-spin" />
              <span>Captured {detectedFormatBadge || 'Code'}!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar: Optical scanner branding & format filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#bccac0]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#85f8c4]/40 border border-[#006948]/20 flex items-center justify-center text-[#006948] shadow-xs">
            <ScanLine className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1a1c1a] tracking-tight flex items-center gap-1.5">
                <span>Smart Optical Scanner</span>
                {cameraActive && (
                  <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
                )}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#85f8c4]/40 text-[#006948] font-bold border border-[#006948]/25">
                Barcodes + QR
              </span>
            </div>
            <p className="text-[11px] text-[#6d7a72]">
              Scans 1D linear retail barcodes (EAN, UPC, Code 128) and 2D QR codes in real-time
            </p>
          </div>
        </div>

        {/* Scanner Mode Tabs & Controls */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center bg-[#f4f3f1] p-0.5 rounded-lg border border-[#bccac0]/40 text-xs">
            <button
              type="button"
              onClick={() => setScannerMode('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                scannerMode === 'all'
                  ? 'bg-white text-[#006948] font-bold shadow-2xs'
                  : 'text-[#6d7a72] hover:text-[#1a1c1a]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="text-[11px]">All</span>
            </button>
            <button
              type="button"
              onClick={() => setScannerMode('barcode')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                scannerMode === 'barcode'
                  ? 'bg-white text-[#006948] font-bold shadow-2xs'
                  : 'text-[#6d7a72] hover:text-[#1a1c1a]'
              }`}
            >
              <Barcode className="w-3 h-3" />
              <span className="text-[11px]">Barcode</span>
            </button>
            <button
              type="button"
              onClick={() => setScannerMode('qr')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                scannerMode === 'qr'
                  ? 'bg-white text-[#006948] font-bold shadow-2xs'
                  : 'text-[#6d7a72] hover:text-[#1a1c1a]'
              }`}
            >
              <QrCode className="w-3 h-3" />
              <span className="text-[11px]">QR</span>
            </button>
          </div>

          {/* Camera controls */}
          {cameraActive && (
            <>
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  title="Toggle Flashlight / Torch"
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    torchOn
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-[#f4f3f1] border-[#bccac0]/40 text-[#6d7a72] hover:text-[#1a1c1a]'
                  }`}
                >
                  {torchOn ? <Flashlight className="w-3.5 h-3.5" /> : <FlashlightOff className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={toggleFacingMode}
                title={`Switch Camera (${facingMode === 'environment' ? 'Back' : 'Front'})`}
                className="p-1.5 rounded-lg border border-[#bccac0]/40 bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#3d4a42] text-xs cursor-pointer flex items-center gap-1 transition-colors"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-[#006948]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Video Viewport Canvas with Optical HUD */}
      <div className="relative aspect-video sm:aspect-4/3 max-h-[350px] w-full rounded-xl bg-neutral-950 border border-[#bccac0]/40 overflow-hidden flex flex-col items-center justify-center shadow-inner">
        {/* Hidden video element streaming the getUserMedia camera feed - ALWAYS mounted in DOM */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive && !isPermissionDenied ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Overlay canvas for drawing targeting brackets & polygon */}
        <canvas
          ref={overlayCanvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-20 ${
            cameraActive && !isPermissionDenied ? 'block' : 'hidden'
          }`}
        />

        {/* Non-Product Warning Banner on HUD */}
        <AnimatePresence>
          {nonProductNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-3 left-3 right-3 z-40 bg-amber-950/95 border border-amber-400/60 text-amber-100 p-3 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-200">Non-Product Code Ignored</p>
                <p className="text-[11px] text-amber-200/90 leading-snug mt-0.5">{nonProductNotice}</p>
                <p className="text-[10px] text-amber-300/70 font-mono mt-1">
                  Scanner is calibrated strictly for physical commercial products (GS1/EAN/UPC/verified product QR).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNonProductNotice(null)}
                className="text-amber-300 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* If Camera Permission is Denied, render the user-friendly Permission Denied UI in place of viewfinder */}
        {isPermissionDenied ? (
          <div className="absolute inset-0 z-30 bg-white p-4 overflow-y-auto">
            <CameraPermissionDeniedUI
              onRetry={startCamera}
              onSwitchCamera={toggleFacingMode}
              onUploadClick={() => fileInputRef.current?.click()}
              onSelectSampleCode={(code, format) => triggerSuccessFeedback(code, format)}
              errorMessage={cameraError || undefined}
              isRetrying={isConnecting}
            />
          </div>
        ) : (
          <>
            {/* Animated Laser Sweep Line when Camera is Active */}
            {cameraActive && (
              <motion.div
                animate={{
                  y: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#85f8c4] to-transparent z-15 pointer-events-none shadow-[0_0_12px_#85f8c4]"
              />
            )}

            {/* Viewport Corner Framing Reticles */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-[#85f8c4] rounded-tl-lg z-20 pointer-events-none shadow-sm"></div>
            <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-[#85f8c4] rounded-tr-lg z-20 pointer-events-none shadow-sm"></div>
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-[#85f8c4] rounded-bl-lg z-20 pointer-events-none shadow-sm"></div>
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-[#85f8c4] rounded-br-lg z-20 pointer-events-none shadow-sm"></div>

            {/* Live HUD Viewfinder Overlay */}
            {cameraActive ? (
              <div
                className={`relative flex items-center justify-center z-10 pointer-events-none transition-all duration-300 ${
                  scannerMode === 'barcode'
                    ? 'w-72 h-36 sm:w-80 sm:h-40' // Wide aspect for 1D linear barcodes
                    : 'w-56 h-56 sm:w-64 sm:h-64' // Square for 2D or all
                }`}
              >
                {/* Viewfinder Target Boundary */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all ${
                    scanStatus === 'locked'
                      ? 'border-2 border-[#006948] bg-[#006948]/20 ring-4 ring-[#85f8c4]/50'
                      : 'border border-dashed border-[#85f8c4]/70 bg-black/15'
                  }`}
                />

                {/* Center Targeting Dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#85f8c4] ring-4 ring-white/20 animate-ping"></div>

                {/* Static Center HUD status chip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#85f8c4]" />
                  <span className="text-[11px] font-mono text-[#85f8c4] font-semibold">
                    {scannerMode === 'barcode'
                      ? 'Align 1D Barcode horizontally'
                      : scannerMode === 'qr'
                      ? 'Align QR Code in frame'
                      : 'Align Barcode or QR Code'}
                  </span>
                </div>
              </div>
            ) : (
              /* Inactive Camera State */
              <div className="text-center space-y-3 z-10 p-4 max-w-sm">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/15 shadow-sm">
                  <Camera className="w-6 h-6 text-[#85f8c4]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Optical Scanner Standby</div>
                  <p className="text-xs text-white/70 mt-0.5">
                    Launch your camera to scan commercial retail barcodes and QR codes instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isConnecting}
                  className="px-5 py-2.5 bg-[#006948] hover:bg-[#00855d] disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Camera className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                  <span>{isConnecting ? 'Opening Camera...' : 'Launch Camera'}</span>
                </button>
              </div>
            )}

            {/* Bottom floating pause control */}
            {cameraActive && (
              <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-black/75 hover:bg-black/90 text-white text-xs font-mono rounded-lg border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5 backdrop-blur-sm shadow-md"
                >
                  <CameraOff className="w-3.5 h-3.5 text-rose-300" />
                  <span>Pause</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera warning alert for non-permission issues (hardware busy / device not found) */}
      {cameraError && !isPermissionDenied && (
        <div className="p-3.5 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 text-[#3d4a42] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="font-semibold text-[#ba1a1a]">Camera Notice:</div>
            <div className="leading-relaxed">{cameraError}</div>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                disabled={isConnecting}
                className="px-3 py-1.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isConnecting ? 'Connecting...' : 'Retry Camera'}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-[#bccac0]/40 text-[#1a1c1a] text-[11px] font-semibold rounded-lg hover:bg-[#efeeeb] transition-colors cursor-pointer"
              >
                Upload Photo Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Barcodes */}
      <div className="pt-1 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1a1c1a] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#006948]" />
            <span>Test with Sample Barcodes:</span>
          </span>
          <span className="text-[11px] text-[#6d7a72]">Click to test scan instantly</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sampleCodes.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => triggerSuccessFeedback(item.code, item.format)}
              className="p-2 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#bccac0]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#006948] group-hover:underline">
                  {item.format}
                </span>
                <span className="text-[9px] text-[#6d7a72] font-mono">{item.brand}</span>
              </div>
              <div className="text-xs font-bold text-[#1a1c1a] truncate mt-0.5">
                {item.label}
              </div>
              <div className="text-[10px] font-mono text-[#6d7a72] truncate mt-0.5">
                {item.code}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alternative Input Methods: Upload Barcode Image or Manual Input */}
      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Upload Barcode Image */}
        <div className="p-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/40 flex items-center justify-between">
          <div>
            <div className="font-semibold text-[#1a1c1a]">Upload Barcode Photo</div>
            <div className="text-[11px] text-[#6d7a72]">From screenshot or packaging</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-white hover:bg-[#efeeeb] text-[#1a1c1a] text-xs font-semibold rounded-lg border border-[#bccac0]/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-[#006948]" />
            <span>Select File</span>
          </button>
        </div>

        {/* Enter Barcode / Serial Manually */}
        <form onSubmit={handleManualSubmit} className="p-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/40 flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type barcode or GTIN..."
            className="flex-1 bg-white text-[#1a1c1a] text-xs border border-[#bccac0]/40 rounded-lg px-2.5 py-1.5 focus:border-[#006948] focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="px-3 py-1.5 bg-[#006948] hover:bg-[#00855d] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Check
          </button>
        </form>
      </div>
    </div>
  );
};
