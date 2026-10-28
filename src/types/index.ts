export type VerdictType = 'GENUINE' | 'SUSPICIOUS' | 'LIKELY_FAKE';

export type SignalSeverity = 'info' | 'warning' | 'critical';

export interface BlockchainProductRecord {
  tokenId: string; // Serial / QR Payload Key
  name: string;
  brand: string;
  category: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate?: string;
  priceUsd: number;
  mrpInr?: number;
  originLocation: string;
  status: 'ACTIVE' | 'RECALLED';
  recallReason?: string;
  // Blockchain Cryptographic Proofs
  blockNumber: number;
  txHash: string;
  contractAddress: string;
  batchHash: string;
  mintedAt: string;
  qrDataUrl?: string; // Generated Scannable QR Code base64 data URL
}

export interface BlockchainBlock {
  blockNumber: number;
  blockHash: string;
  prevBlockHash: string;
  timestamp: string;
  txCount: number;
  miner: string;
  merkleRoot: string;
}

export interface ScrapedProductInfo {
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  estimatedPrice?: string;
  manufacturer?: string;
  originCountry?: string;
  officialWebsite?: string;
  authenticityVerdict?: 'GENUINE' | 'SUSPICIOUS' | 'LIKELY_FAKE';
  authenticitySummary?: string;
  attributes?: Record<string, string | number>;
  sourceUrls?: Array<{ title: string; url: string }>;
}

export interface WebScrapeIntelligence {
  isUrl: boolean;
  barcodeFormat?: string; // e.g. 'EAN-13', 'UPC-A', 'CODE-128', 'QR_CODE'
  barcodeType?: '1D_LINEAR' | '2D_MATRIX' | 'URL';
  gtin?: string;
  countryOfOrigin?: string;
  resolvedDomain?: string;
  isDomainVerified?: boolean;
  sslSecure?: boolean;
  domainTrustScore: number; // 0 to 100
  productMatchTitle?: string;
  exactVariant?: string; // e.g. "Dark Chocolate 55% Cocoa", "Nut 'N' Bar", "Double Stuf Vanilla Creme"
  brand?: string;
  parentCompany?: string; // e.g. "GCMMF (Amul)", "Mondelez International"
  category?: string;
  netWeight?: string; // e.g. "150g (5.29 oz)"
  packagingType?: string; // e.g. "Hermetic Golden Foil + Outer Board Box"
  estimatedPrice?: string;
  manufacturer?: string;
  officialDomain?: string;
  keySpecs?: string[];
  certifications?: string[];
  physicalAuthenticityChecks?: string[];
  counterfeitRedFlags?: string[];
  authenticityIndicators?: string[];
  counterfeitRiskSignals?: string[];
  legitimacyFactors?: string[];
  knownCounterfeitSignals?: string[];
  scrapedDetails?: Record<string, string>;
  isAiEnriched?: boolean;
  summary?: string;
  imageUrl?: string;
  categoryGroup?: 'food' | 'beverage' | 'personal_care' | 'pharma' | 'electronics' | 'apparel' | 'household' | 'general';
  foodDetails?: FoodProductDetails;
  personalCareDetails?: PersonalCareDetails;
  pharmaDetails?: PharmaSupplementDetails;
  electronicsDetails?: ElectronicsDetails;
}

export interface FoodNutritionInfo {
  servingSize?: string;
  calories?: string | number;
  protein?: string;
  totalFat?: string;
  saturatedFat?: string;
  transFat?: string;
  carbohydrates?: string;
  sugars?: string;
  addedSugars?: string;
  sodium?: string;
  dietaryFiber?: string;
  calcium?: string;
  iron?: string;
}

export interface FoodProductDetails {
  foodPhotoUrl?: string;
  netQuantity?: string;
  dietaryType?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'gluten-free';
  nutrition?: FoodNutritionInfo;
  ingredientsList?: string[];
  allergens?: string[];
  shelfLife?: string;
  bestBefore?: string;
  storageInstructions?: string;
  foodSafetyLicense?: string;
  servingSuggestion?: string;
}

export interface PersonalCareDetails {
  skinType?: string;
  crueltyFree?: boolean;
  dermatologicallyTested?: boolean;
  keyActives?: string[];
  directions?: string;
  safetyCaution?: string;
}

export interface PharmaSupplementDetails {
  dosageForm?: string;
  activeComposition?: string;
  scheduleCategory?: string;
  dosageInstructions?: string;
  storageCaution?: string;
  safetyWarning?: string;
}

export interface ElectronicsDetails {
  warranty?: string;
  powerInputOutput?: string;
  modelNumber?: string;
  compatibility?: string;
  certifications?: string[];
}

export interface ScanVerificationResult {
  rawPayload: string;
  barcodeFormat?: string;
  barcodeType?: '1D_LINEAR' | '2D_MATRIX' | 'URL';
  isRegisteredOnBlockchain: boolean;
  blockchainRecord?: BlockchainProductRecord;
  trustScore: number; // 0 to 100
  verdict: VerdictType;
  webIntelligence: WebScrapeIntelligence;
  signals: {
    blockchainProof: {
      status: 'VERIFIED' | 'NOT_FOUND' | 'RECALLED';
      score: number;
      label: string;
      detail: string;
    };
    aiWebIntelligence: {
      status: 'SAFE' | 'UNKNOWN' | 'SUSPICIOUS';
      score: number;
      label: string;
      detail: string;
    };
    qrFormatIntegrity: {
      status: 'VALID' | 'ANOMALOUS';
      score: number;
      label: string;
      detail: string;
    };
    brandSecuritySeal: {
      status: 'ACTIVE' | 'UNREGISTERED';
      score: number;
      label: string;
      detail: string;
    };
  };
  reasons: Array<{
    title: string;
    severity: 'info' | 'warning' | 'critical';
    english: string;
    hinglish?: string;
  }>;
  scannedAt: string;
}

// Backwards compatibility types for legacy modules
export type VerificationResult = ScanVerificationResult;

export interface SupplyChainCheckpoint {
  id: string;
  stage: string;
  location: string;
  timestamp: string;
  verifiedBy: string;
  signature: string;
  status: 'completed' | 'current' | 'pending';
}

export interface TrackedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrpInr: number;
  priceUsd?: number;
  originLocation: string;
  officialRetailer: string;
  status: 'ACTIVE' | 'RECALLED';
  recallReason?: string;
  checkpoints: SupplyChainCheckpoint[];
  securityFeatures: {
    tamperTapeCode: string;
    rfidUid: string;
    microprintKey: string;
  };
  packagingImages: {
    hero: string;
    qrLocation: string;
    barcodeLocation: string;
    hologramMacro: string;
  };
}

export type ReportType = 'counterfeit' | 'damaged' | 'query' | 'expired' | 'defect';

export type StrictActionType =
  | 'NONE'
  | 'LEGAL_NOTICE'
  | 'FIELD_INSPECTOR'
  | 'BLACKLISTED'
  | 'POLICE_ESCALATION'
  | 'STOCK_SEIZED';

export type ReportStatus =
  | 'SUBMITTED'
  | 'UNDER_INVESTIGATION'
  | 'INSPECTOR_DISPATCHED'
  | 'LEGAL_ACTION_INITIATED'
  | 'STOCK_SEIZED_RESOLVED'
  | 'QUERY_ANSWERED';

export interface DistributorLocationInfo {
  storeName: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode?: string;
  contactPhone?: string;
  distributorGstin?: string;
  latitude?: number;
  longitude?: number;
  priceCharged?: string;
  purchaseDate?: string;
  invoiceNumber?: string;
}

export interface StrictEnforcementAction {
  actionType: StrictActionType;
  actionTitle: string;
  actionDate: string;
  actionNotes: string;
  assignedOfficer?: string;
  legalNoticeNumber?: string;
  targetDistributor: string;
  fineAmount?: string;
}

export interface CounterfeitReport {
  id: string; // e.g., "REP-2026-9810"
  type: ReportType;
  productName: string;
  brand: string;
  variant?: string;
  barcode: string;
  batchNumber?: string;
  photoUrl?: string; // photo of damage or counterfeit product
  receiptPhotoUrl?: string;
  description: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  distributorLocation?: DistributorLocationInfo;
  strictAction?: StrictEnforcementAction;
  manufacturerReply?: string;
  status: ReportStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface InspectionPillar {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  findings: string[];
}

// ---------------------------------------------------------------------------
// VERIFIED RESALE ENGINE DATA STRUCTURES (P2P Secondary Market)
// ---------------------------------------------------------------------------
export type ResaleCategory = 'phone' | 'sneakers' | 'watch' | 'other';
export type ResaleCondition = 'brand_new' | 'like_new' | 'excellent' | 'good' | 'fair';
export type ResaleVerdict = 'DETAILS_VERIFIED' | 'LOOKS_CONSISTENT' | 'NEEDS_CAUTION' | 'HIGH_RISK';

export interface ResalePhoto {
  id: string;
  label: string;
  dataUrl: string;
  timestamp: string;
}

export interface ResaleSignal {
  id: string;
  name: string;
  weight: number; // e.g. 25, 15, 10
  score: number; // 0 to 100
  status: 'pass' | 'warning' | 'fail' | 'unknown';
  title: string;
  detailEn: string;
  detailHi: string;
}

export interface ResaleRedFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
}

export interface SellerProfile {
  id: string;
  displayName: string;
  verifiedSalesCount: number;
  rating: number; // e.g. 4.9
  memberSince: string;
  badge: string;
}

export interface ResaleHistoryEvent {
  id: string;
  type:
    | 'REGISTERED'
    | 'AI_INSPECTED'
    | 'PRICE_EVALUATED'
    | 'TRANSFER_CODE_GENERATED'
    | 'OWNERSHIP_TRANSFERRED'
    | 'REPORTED_FLAGGED';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  txHash: string;
  blockNumber: number;
}

export interface ResaleAiInspection {
  extractedText: string[];
  visibleDefects: string[];
  logoOrFontConsistency: string;
  photoConsistency: boolean;
  challengeCodeFound: boolean;
  stockPhotoSuspected: boolean;
  confidenceScore: number;
  summaryEn: string;
  summaryHi: string;
}

export interface ResaleItem {
  id: string; // e.g. "TT-RS-98214"
  category: ResaleCategory;
  brand: string;
  model: string;
  askingPriceInr: number;
  askingPriceUsd: number;
  condition: ResaleCondition;
  purchaseYear: number;
  identifierType: 'IMEI' | 'SERIAL' | 'STYLE_CODE';
  identifierValue: string;
  luhnValid: boolean;
  challengeCode: string;
  photos: ResalePhoto[];
  invoicePhotoUrl?: string;
  seller: SellerProfile;
  trustScore: number; // 0 to 100
  verdict: ResaleVerdict;
  signals: ResaleSignal[];
  redFlags: ResaleRedFlag[];
  aiInspection?: ResaleAiInspection;
  history: ResaleHistoryEvent[];
  activeTransferCode?: {
    code: string;
    expiresAt: string;
  };
  createdAt: string;
  updatedAt: string;
  qrCodeDataUrl?: string;
  isReportedFake: boolean;
  isDuplicate: boolean;
  blockNumber: number;
  txHash: string;
}
