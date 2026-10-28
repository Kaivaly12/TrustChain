import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MultiFormatReader,
  BarcodeFormat
} from '@zxing/library';
import {
  createConfiguredZxingReader,
  decodeBarcodeOrQRFromImageData
} from '../services/barcodeScannerUtils';
import {
  getCompatibleConstraintsList,
  detectDeviceEnvironment
} from '../services/cameraConstraints';

export interface QrReaderResult {
  getText: () => string;
  getBarcodeFormat?: () => string;
}

export interface QrReaderProps {
  /**
   * react-qr-reader standard error callback
   */
  onError?: (error: Error) => void;
  /**
   * react-qr-reader v3 onResult callback
   */
  onResult?: (result: QrReaderResult | null, error?: Error | null) => void;
  /**
   * react-qr-reader v2 onScan callback
   */
  onScan?: (data: string | null) => void;
  /**
   * Video stream track constraints
   */
  constraints?: MediaTrackConstraints;
  /**
   * Facing mode: 'environment' (back/rear camera) or 'user' (front/webcam)
   */
  facingMode?: 'environment' | 'user';
  /**
   * Interval delay between frame scans in milliseconds (default: 100ms)
   */
  scanDelay?: number;
  /**
   * Custom container CSS class
   */
  className?: string;
  /**
   * Custom container style
   */
  containerStyle?: React.CSSProperties;
  /**
   * Custom video container style
   */
  videoContainerStyle?: React.CSSProperties;
  /**
   * Custom video style
   */
  videoStyle?: React.CSSProperties;
  /**
   * Custom overlay viewfinder component
   */
  ViewFinder?: React.ComponentType<any>;
}

/**
 * Standard react-qr-reader detailed error logging function.
 * Logs structured, high-visibility console messages with actionable debugging steps.
 */
export function logQrReaderError(error: unknown, context: string = 'MainScannerPage'): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const errName = err.name || 'CameraInitializationError';

  console.group(`[react-qr-reader] Camera Initialization Error in ${context}`);
  console.error(`Type: ${errName}`);
  console.error(`Message: ${err.message}`);

  switch (errName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      console.error(
        '[react-qr-reader] [PERMISSIONS POLICY / USER DENIAL]:\n' +
        'Camera permission was denied by the user, or denied by the browser permissions policy.\n' +
        'Remediation:\n' +
        '1. In Google Chrome/Edge/Brave: Click the camera/tune icon in the browser address bar -> change Camera to "Allow".\n' +
        '2. In Safari (iOS/macOS): Check Settings -> Safari -> Camera -> Set to Allow.\n' +
        '3. In Firefox: Click the lock icon next to URL -> clear the "Blocked" permission.\n' +
        '4. In iframes: Ensure iframe has allow="camera; microphone" attribute.'
      );
      break;

    case 'NotFoundError':
    case 'DevicesNotFoundError':
      console.error(
        '[react-qr-reader] [DEVICE NOT FOUND]:\n' +
        'No compatible camera or video input device was detected on this hardware.\n' +
        'Remediation:\n' +
        'Check that an internal webcam or external USB camera is plugged in and recognized by the operating system.'
      );
      break;

    case 'NotReadableError':
    case 'TrackStartError':
      console.error(
        '[react-qr-reader] [HARDWARE IN USE]:\n' +
        'The camera cannot be opened because another program, browser tab, or OS process has locked the video track.\n' +
        'Remediation:\n' +
        'Close other applications that might be using the camera (Zoom, Microsoft Teams, FaceTime, Google Meet) and retry.'
      );
      break;

    case 'OverconstrainedError':
      const constraint = (err as any).constraint || 'unknown';
      console.error(
        `[react-qr-reader] [OVERCONSTRAINED]:\n` +
        `The video stream constraint "${constraint}" could not be satisfied by the available hardware.\n` +
        'Remediation:\n' +
        'Constraints will automatically fall back to standard desktop/mobile compatible defaults.'
      );
      break;

    case 'SecurityError':
      console.error(
        '[react-qr-reader] [SECURITY CONSTRAINT]:\n' +
        'getUserMedia is only available in secure contexts (HTTPS or localhost). Insecure HTTP origins block camera access.'
      );
      break;

    case 'AbortError':
      console.error(
        '[react-qr-reader] [STREAM ABORTED]:\n' +
        'A hardware problem or user action aborted the camera capture process.'
      );
      break;

    default:
      console.error('[react-qr-reader] General Camera Exception:', err);
      break;
  }

  if (err.stack) {
    console.error('Stack:', err.stack);
  }
  console.groupEnd();
}

/**
 * React 19 Native QrReader Component conforming to react-qr-reader's API,
 * constraints configuration, and error callbacks.
 */
export const QrReader: React.FC<QrReaderProps> = ({
  onError,
  onResult,
  onScan,
  constraints,
  facingMode = 'environment',
  scanDelay = 100,
  className = '',
  containerStyle,
  videoContainerStyle,
  videoStyle,
  ViewFinder
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const zxingReaderRef = useRef<MultiFormatReader | null>(null);

  const [hasStarted, setHasStarted] = useState(false);

  // Initialize ZXing MultiFormat reader
  useEffect(() => {
    try {
      zxingReaderRef.current = createConfiguredZxingReader();
    } catch (e) {
      console.warn('Failed to configure ZXing reader:', e);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setHasStarted(false);
  }, []);

  // Frame processing loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const reader = zxingReaderRef.current;

    if (video && canvas && reader && video.readyState >= 2) {
      const now = Date.now();
      if (now - lastScanTimeRef.current >= scanDelay) {
        lastScanTimeRef.current = now;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const detected = decodeBarcodeOrQRFromImageData(imageData, reader);

          if (detected && detected.text) {
            const resultObj: QrReaderResult = {
              getText: () => detected.text,
              getBarcodeFormat: () => detected.format
            };

            if (onResult) {
              onResult(resultObj, null);
            }
            if (onScan) {
              onScan(detected.text);
            }
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [scanDelay, onResult, onScan]);

  // Start camera stream using compatible mobile/desktop constraints
  const startCamera = useCallback(async () => {
    stopStream();

    const env = detectDeviceEnvironment();
    if (!env.hasMediaDevices) {
      const err = new Error('navigator.mediaDevices.getUserMedia is not supported on this browser.');
      logQrReaderError(err, 'QrReader');
      if (onError) onError(err);
      if (onResult) onResult(null, err);
      return;
    }

    // Prepare prioritized constraints
    const fallbackList: MediaStreamConstraints[] = constraints
      ? [{ audio: false, video: constraints }, ...getCompatibleConstraintsList(facingMode)]
      : getCompatibleConstraintsList(facingMode);

    let stream: MediaStream | null = null;
    let finalError: Error | null = null;

    for (const c of fallbackList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        if (stream) break;
      } catch (err: any) {
        finalError = err;
      }
    }

    if (!stream) {
      const errorToReport = finalError || new Error('Failed to acquire camera media stream');
      logQrReaderError(errorToReport, 'QrReader.startCamera');
      if (onError) onError(errorToReport);
      if (onResult) onResult(null, errorToReport);
      return;
    }

    streamRef.current = stream;

    if (videoRef.current) {
      const v = videoRef.current;
      v.srcObject = stream;
      v.setAttribute('playsinline', 'true');
      v.setAttribute('webkit-playsinline', 'true');
      v.muted = true;

      try {
        await v.play();
      } catch {
        v.onloadedmetadata = async () => {
          try {
            await v.play();
          } catch (e: any) {
            logQrReaderError(e, 'QrReader.video.play');
            if (onError) onError(e);
          }
        };
      }

      setHasStarted(true);
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [constraints, facingMode, onError, onResult, processFrame, stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        ...containerStyle
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          ...videoContainerStyle
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: hasStarted ? 'block' : 'none',
            ...videoStyle
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {ViewFinder && <ViewFinder />}
      </div>
    </div>
  );
};

export default QrReader;
