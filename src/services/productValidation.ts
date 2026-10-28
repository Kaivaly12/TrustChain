/**
 * Utility to validate whether a scanned barcode or QR code payload represents
 * a physical commercial product (retail barcode, GS1 GTIN, product token, or product link)
 * vs an unrelated non-product QR code (Wi-Fi credential, vCard contact, email, plain text).
 */

export interface ProductPayloadValidation {
  isProduct: boolean;
  productType?: 'GS1_BARCODE' | 'PRODUCT_TOKEN' | 'PRODUCT_URL' | 'COMMERCIAL_SKU';
  cleanIdentifier: string;
  rejectionReason?: string;
}

export function validateProductPayload(rawPayload: string): ProductPayloadValidation {
  if (!rawPayload || typeof rawPayload !== 'string') {
    return {
      isProduct: false,
      cleanIdentifier: '',
      rejectionReason: 'Empty or invalid barcode data.'
    };
  }

  const clean = rawPayload.trim();
  const lower = clean.toLowerCase();

  // 1. Explicit Non-Product QR Patterns to reject immediately
  if (lower.startsWith('wifi:') || lower.startsWith('wpa:') || lower.startsWith('wep:')) {
    return {
      isProduct: false,
      cleanIdentifier: clean,
      rejectionReason: 'Detected a Wi-Fi network credential QR code. Trust Chain only scans physical products.'
    };
  }

  if (lower.startsWith('begin:vcard') || lower.startsWith('mecard:') || lower.startsWith('bizcard:')) {
    return {
      isProduct: false,
      cleanIdentifier: clean,
      rejectionReason: 'Detected a personal contact vCard QR code. Trust Chain only scans physical products.'
    };
  }

  if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('sms:') || lower.startsWith('smsto:')) {
    return {
      isProduct: false,
      cleanIdentifier: clean,
      rejectionReason: 'Detected a communication link (email/phone). Please scan a commercial product code.'
    };
  }

  if (lower.startsWith('begin:vevent')) {
    return {
      isProduct: false,
      cleanIdentifier: clean,
      rejectionReason: 'Detected a calendar invite QR code. Trust Chain only scans physical products.'
    };
  }

  // Reject long conversational or paragraph text that is not a product link
  if (clean.length > 200 && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    return {
      isProduct: false,
      cleanIdentifier: clean,
      rejectionReason: 'Scanned text appears to be arbitrary document text rather than a product barcode or serial.'
    };
  }

  // Reject tiny gibberish (1-3 plain letters with no digits or symbols, e.g. "hi", "ok", "a")
  if (/^[a-zA-Z]{1,3}$/.test(clean)) {
    return {
      isProduct: false,
      cleanIdentifier: clean,
      rejectionReason: 'Scanned value is too short to be a valid commercial product code.'
    };
  }

  // 2. Standard 1D Retail Barcodes (UPC-E, EAN-8, EAN-13, UPC-A, ITF, GTIN-14, GS1-128)
  const numericOnly = clean.replace(/[\s-]/g, '');
  const isAllDigits = /^\d{6,18}$/.test(numericOnly);
  if (isAllDigits) {
    return {
      isProduct: true,
      productType: 'GS1_BARCODE',
      cleanIdentifier: numericOnly
    };
  }

  // 3. Product Verification URLs (e.g. apple.com, nike.com, gs1.org, product links)
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      const host = url.hostname.toLowerCase();
      const pathname = url.pathname;

      const commercialDomains = [
        'apple.com', 'nike.com', 'sony.com', 'rolex.com', 'samsung.com',
        'nintendo.com', 'coca-cola.com', 'cocacola.com', 'amazon.com',
        'walmart.com', 'target.com', 'bestbuy.com', 'gs1.org', 'trustchain.network',
        'adidas.com', 'dyson.com', 'bose.com', 'sephora.com', 'gucci.com'
      ];

      const isKnownBrand = commercialDomains.some(d => host.includes(d));
      const hasProductPath = /product|item|verify|serial|token|goods|catalog|sku|gtin|dp|p\//i.test(pathname) ||
        /\/[a-zA-Z0-9_-]{5,}/.test(pathname);

      if (isKnownBrand || hasProductPath || clean.length < 150) {
        // Extract product token / slug from URL if possible
        const pathSegments = pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || clean;
        return {
          isProduct: true,
          productType: 'PRODUCT_URL',
          cleanIdentifier: lastSegment.length >= 4 ? lastSegment : clean
        };
      }
    } catch {
      // Malformed URL
    }
  }

  // 4. Commercial Product Tokens & Alphanumeric SKUs (e.g. NIKE-AIR-JORDAN-1042, APL-20W, BATCH-1042)
  if (/^[A-Za-z0-9_-]{4,64}$/.test(clean)) {
    return {
      isProduct: true,
      productType: 'COMMERCIAL_SKU',
      cleanIdentifier: clean
    };
  }

  // Fallback: accept if string has typical product serial structure
  if (clean.length >= 4 && clean.length <= 80) {
    return {
      isProduct: true,
      productType: 'PRODUCT_TOKEN',
      cleanIdentifier: clean
    };
  }

  return {
    isProduct: false,
    cleanIdentifier: clean,
    rejectionReason: 'Unrecognized format. Please scan a standard product barcode (UPC/EAN) or verified product QR code.'
  };
}
