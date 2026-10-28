import * as ZXingModule from '@zxing/library';
import jsQR from 'jsqr';

// Safely resolve ZXing namespace whether bundled as CJS or ESM in Vite
const ZXing = ((ZXingModule as any).default?.BarcodeFormat
  ? (ZXingModule as any).default
  : ZXingModule) as any;

export const BarcodeFormat = ZXing.BarcodeFormat;
export const DecodeHintType = ZXing.DecodeHintType;
export const MultiFormatReader = ZXing.MultiFormatReader;
export const RGBLuminanceSource = ZXing.RGBLuminanceSource;
export const BinaryBitmap = ZXing.BinaryBitmap;
export const HybridBinarizer = ZXing.HybridBinarizer;
export const GlobalHistogramBinarizer = ZXing.GlobalHistogramBinarizer;
export const InvertedLuminanceSource = ZXing.InvertedLuminanceSource;
export const HTMLCanvasElementLuminanceSource =
  ZXing.HTMLCanvasElementLuminanceSource || (ZXingModule as any).HTMLCanvasElementLuminanceSource;
export const BrowserMultiFormatReader =
  (ZXingModule as any).BrowserMultiFormatReader || ZXing.BrowserMultiFormatReader;

export interface ScanDetectionResult {
  text: string;
  format: string;
  points?: Array<{ x: number; y: number }>;
}

/**
 * Creates persistent hints configuration optimized for commercial 1D retail
 * barcodes (EAN-13, UPC-A, Code 128, Code 39, ITF, Codabar) and 2D QR codes.
 */
export function createDecodeHints(): Map<any, any> {
  const hints = new Map<any, any>();
  const formats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.CODE_93
  ].filter(Boolean);

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return hints;
}

/**
 * Creates and configures a ZXing MultiFormatReader with permanent 1D barcode hints.
 */
export function createConfiguredZxingReader(): any {
  try {
    const reader = new MultiFormatReader();
    const hints = createDecodeHints();
    reader.setHints(hints);
    return reader;
  } catch (err) {
    console.warn('Failed to configure ZXing MultiFormatReader:', err);
    return null;
  }
}

/**
 * Creates a configured BrowserMultiFormatReader instance.
 */
export function createConfiguredBrowserReader(): any {
  try {
    if (BrowserMultiFormatReader) {
      const hints = createDecodeHints();
      return new BrowserMultiFormatReader(hints, 200);
    }
  } catch (err) {
    console.warn('Failed to configure BrowserMultiFormatReader:', err);
  }
  return null;
}

/**
 * Decodes 1D barcodes and 2D QR codes directly from an HTMLCanvasElement.
 * Leverages HTMLCanvasElementLuminanceSource which provides:
 * - Native rotation support (auto-rotates 90 degrees CCW/CW for vertical barcodes)
 * - Automatic color inversion for dark packaging
 * - Direct GPU/canvas buffer access
 */
export function decodeFromCanvas(
  canvas: HTMLCanvasElement,
  reader?: any
): ScanDetectionResult | null {
  if (!canvas || canvas.width < 10 || canvas.height < 10) return null;

  // Tier 1: jsQR dedicated QR decoder (ultra-fast)
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imgData.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
      if (qr && qr.data && qr.data.trim()) {
        const loc = qr.location;
        const pts = [
          loc.topLeftCorner,
          loc.topRightCorner,
          loc.bottomRightCorner,
          loc.bottomLeftCorner
        ];
        return { text: qr.data.trim(), format: 'QR_CODE', points: pts };
      }
    }
  } catch {
    // Continue to ZXing
  }

  // Tier 2: ZXing with HTMLCanvasElementLuminanceSource (supports auto-invert and 90 deg rotation!)
  if (HTMLCanvasElementLuminanceSource && BinaryBitmap && HybridBinarizer) {
    const zxReader = reader || createConfiguredZxingReader();
    if (zxReader) {
      try {
        const lumSource = new HTMLCanvasElementLuminanceSource(canvas, true);
        const bitmap = new BinaryBitmap(new HybridBinarizer(lumSource));
        // Use decodeWithState so hints are NOT wiped out
        const result = zxReader.decodeWithState(bitmap);
        if (result && result.getText()) {
          const formatEnum = result.getBarcodeFormat();
          const formatName = (BarcodeFormat && BarcodeFormat[formatEnum]) ? BarcodeFormat[formatEnum] : 'BARCODE';
          const pts = result.getResultPoints()?.map((pt: any) => ({ x: pt.getX(), y: pt.getY() }));
          return { text: result.getText().trim(), format: formatName, points: pts };
        }
      } catch {
        // Fall back to GlobalHistogram
      } finally {
        try {
          zxReader.reset();
        } catch {}
      }

      // Pass B: GlobalHistogramBinarizer on canvas
      if (GlobalHistogramBinarizer) {
        try {
          const lumSource = new HTMLCanvasElementLuminanceSource(canvas, false);
          const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(lumSource));
          const result = zxReader.decodeWithState(bitmap);
          if (result && result.getText()) {
            const formatEnum = result.getBarcodeFormat();
            const formatName = (BarcodeFormat && BarcodeFormat[formatEnum]) ? BarcodeFormat[formatEnum] : 'BARCODE';
            const pts = result.getResultPoints()?.map((pt: any) => ({ x: pt.getX(), y: pt.getY() }));
            return { text: result.getText().trim(), format: formatName, points: pts };
          }
        } catch {
          // No match
        } finally {
          try {
            zxReader.reset();
          } catch {}
        }
      }
    }
  }

  return null;
}

/**
 * Accurately decodes 1D barcodes and 2D QR codes from HTML5 ImageData.
 * Uses decodeWithState to ensure ZXing hints and 1D formats are never erased.
 */
export function decodeBarcodeOrQRFromImageData(
  imageData: ImageData,
  reader?: any
): ScanDetectionResult | null {
  const { width, height, data } = imageData;
  if (!width || !height || !data || data.length === 0) return null;

  // Tier 1: jsQR dedicated QR decoder (ultra-fast, <2ms for 2D QR codes)
  try {
    const qr = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
    if (qr && qr.data && qr.data.trim()) {
      const loc = qr.location;
      const pts = [
        loc.topLeftCorner,
        loc.topRightCorner,
        loc.bottomRightCorner,
        loc.bottomLeftCorner
      ];
      return { text: qr.data.trim(), format: 'QR_CODE', points: pts };
    }
  } catch {
    // Continue to ZXing
  }

  // Tier 2: ZXing Multi-Format Barcode Engine for 1D retail barcodes (EAN, UPC, Code 128)
  try {
    const zxReader = reader || createConfiguredZxingReader();
    if (!zxReader || !RGBLuminanceSource || !BinaryBitmap || !HybridBinarizer) {
      return null;
    }

    // Convert RGBA imageData into a 1-byte per pixel grayscale luminance array
    const totalPixels = width * height;
    const gray = new Uint8ClampedArray(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      const offset = i * 4;
      // Standard ITU-R BT.601 luminance: 0.299*R + 0.587*G + 0.114*B
      gray[i] = (data[offset] * 77 + data[offset + 1] * 150 + data[offset + 2] * 29) >> 8;
    }

    // Pass 1: Adaptive thresholding with HybridBinarizer
    try {
      const luminanceSource = new RGBLuminanceSource(gray, width, height);
      const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
      // CRITICAL: Use decodeWithState so hints are NOT wiped out to null
      const result = zxReader.decodeWithState(bitmap);
      if (result && result.getText()) {
        const formatEnum = result.getBarcodeFormat();
        const formatName = (BarcodeFormat && BarcodeFormat[formatEnum]) ? BarcodeFormat[formatEnum] : 'BARCODE';
        const pts = result.getResultPoints()?.map((pt: any) => ({ x: pt.getX(), y: pt.getY() }));
        return { text: result.getText().trim(), format: formatName, points: pts };
      }
    } catch {
      // Continue to Pass 2
    } finally {
      try {
        zxReader.reset();
      } catch {}
    }

    // Pass 2: Global histogram binarizer (handles low-contrast, reflections, or faded barcodes)
    if (GlobalHistogramBinarizer) {
      try {
        const luminanceSource = new RGBLuminanceSource(gray, width, height);
        const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(luminanceSource));
        const result = zxReader.decodeWithState(bitmap);
        if (result && result.getText()) {
          const formatEnum = result.getBarcodeFormat();
          const formatName = (BarcodeFormat && BarcodeFormat[formatEnum]) ? BarcodeFormat[formatEnum] : 'BARCODE';
          const pts = result.getResultPoints()?.map((pt: any) => ({ x: pt.getX(), y: pt.getY() }));
          return { text: result.getText().trim(), format: formatName, points: pts };
        }
      } catch {
        // Continue to Pass 3
      } finally {
        try {
          zxReader.reset();
        } catch {}
      }
    }

    // Pass 3: Inverted luminance (white bars on dark background packaging)
    if (InvertedLuminanceSource) {
      try {
        const luminanceSource = new RGBLuminanceSource(gray, width, height);
        const invertedSource = new InvertedLuminanceSource(luminanceSource);
        const bitmap = new BinaryBitmap(new HybridBinarizer(invertedSource));
        const result = zxReader.decodeWithState(bitmap);
        if (result && result.getText()) {
          const formatEnum = result.getBarcodeFormat();
          const formatName = (BarcodeFormat && BarcodeFormat[formatEnum]) ? BarcodeFormat[formatEnum] : 'BARCODE';
          const pts = result.getResultPoints()?.map((pt: any) => ({ x: pt.getX(), y: pt.getY() }));
          return { text: result.getText().trim(), format: formatName, points: pts };
        }
      } catch {
        // No match
      } finally {
        try {
          zxReader.reset();
        } catch {}
      }
    }

    return null;
  } catch (err) {
    console.warn('Barcode decoding pipeline error:', err);
    return null;
  }
}
