export type Language = 'en' | 'hi';

export interface Translations {
  // Navigation & Branding
  brandTitle: string;
  blockchainTag: string;
  tabHome: string;
  tabScanner: string;
  tabRegister: string;
  tabExplorer: string;
  langToggle: string;
  helpButton: string;
  decentralizedBadge: string;

  // Hero Hook Sentences
  heroBadge: string;
  heroHeadline: string;
  heroHeadlineSub: string;
  heroDescription: string;
  btnEnterSite: string;
  btnQuickDemo: string;
  btnScanSample: string;

  // Real vs Fake Interactive Showcase
  showcaseTitle: string;
  showcaseSubtitle: string;
  cardRealTitle: string;
  cardRealTag: string;
  cardRealDesc: string;
  cardFakeTitle: string;
  cardFakeTag: string;
  cardFakeDesc: string;
  trustScore: string;
  verifiedOrigin: string;
  unregisteredAlert: string;

  // How Trust Chain Works (Steps)
  stepsSectionBadge: string;
  stepsSectionTitle: string;
  stepsSectionSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;

  // Stats
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;

  // Bottom CTA
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;

  // Scanner UI
  scannerHeroTitle: string;
  scannerHeroDesc: string;
  openCameraBtn: string;
  uploadPhotoBtn: string;
  inputPlaceholder: string;
  verifyBtn: string;
  quickDemoLabel: string;
  demoGenuineBtn: string;
  demoFakeBtn: string;

  // Verified Resale (P2P Secondary Market)
  tabResale: string;
  resaleBadge: string;
  resaleDisclaimer: string;
  verdictDetailsVerified: string;
  verdictLooksConsistent: string;
  verdictNeedsCaution: string;
  verdictHighRisk: string;
  sellVerifiedTitle: string;
  sellVerifiedSubtitle: string;
  btnReportListing: string;
  btnTransferOwnership: string;
  btnCompareListing: string;
  btnShareCertificate: string;
  p2pBadge: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandTitle: 'Trust Chain',
    blockchainTag: 'VERIFIED',
    tabHome: 'Home',
    tabScanner: 'Scan',
    tabRegister: 'Register',
    tabExplorer: 'Products',
    tabResale: 'Sell Verified',
    resaleBadge: 'PEER-TO-PEER',
    p2pBadge: 'P2P Resale',
    langToggle: 'English / हिंदी',
    helpButton: 'How It Works',
    decentralizedBadge: 'Verified',

    heroBadge: 'Simple & Fast Product Verification',
    heroHeadline: 'Check if your product is Real or Fake',
    heroHeadlineSub: 'Verify in seconds with official brand records.',
    heroDescription:
      'Protect yourself from fake goods and expired batches. Scan any grocery, snack, beverage, or retail product to instantly check brand authenticity, ingredients, and safety.',
    btnEnterSite: 'Start Scanning',
    btnQuickDemo: 'How It Works',
    btnScanSample: 'Test Sample Product',

    showcaseTitle: 'Real vs Fake Products',
    showcaseSubtitle: 'How Trust Chain helps you tell authentic goods apart from fake copies.',
    cardRealTitle: 'REAL — 100% GENUINE',
    cardRealTag: 'Brand Verified',
    cardRealDesc: 'Officially verified by the brand with genuine factory details, verified batch number, and intact packaging seals.',
    cardFakeTitle: 'FAKE — UNREGISTERED',
    cardFakeTag: 'Warning: Fake Copy',
    cardFakeDesc: 'No record found in the official brand registry. Warning: High risk of replica product, cloned barcode, or expired batch.',
    trustScore: 'Authenticity Score',
    verifiedOrigin: 'Verified Origin & Batch',
    unregisteredAlert: 'Unverified / Fake Barcode',

    stepsSectionBadge: 'Simple Process',
    stepsSectionTitle: 'How It Works',
    stepsSectionSubtitle: 'From factory packaging to checkout: quick and reliable verification.',
    step1Title: '1. Brand Registration',
    step1Desc: 'Brands register products with verified barcodes, batch details, origin, and nutrition info.',
    step2Title: '2. Barcode on Packaging',
    step2Desc: 'Standard barcodes and QR tags on packaging connect directly to official product records.',
    step3Title: '3. Quick Camera Scan',
    step3Desc: 'Scan any product barcode with your phone camera or webcam in seconds—no app needed.',
    step4Title: '4. Instant Check',
    step4Desc: 'Trust Chain cross-checks the code against manufacturer records to confirm authenticity.',
    step5Title: '5. Clear Product Details',
    step5Desc: 'See verified authenticity, food nutrition, ingredients, and safety warnings right away.',

    stat1Value: '$500B+',
    stat1Label: 'Fake Goods in Global Markets Each Year',
    stat2Value: '< 0.5s',
    stat2Label: 'Instant Verification Speed',
    stat3Value: '100%',
    stat3Label: 'Official Brand Matches',
    stat4Value: 'Free',
    stat4Label: 'For Everyday Consumers',

    ctaTitle: 'Shop with Confidence. Check Any Product.',
    ctaSubtitle: 'Use your camera to verify authenticity, nutrition facts, and packaging seals in seconds.',
    ctaButton: 'Start Scanning Now',

    scannerHeroTitle: 'Scan Barcode or QR to Check Authenticity',
    scannerHeroDesc: 'Scan standard retail barcodes (EAN-13, UPC) or QR codes. Trust Chain instantly checks brand registry records, nutrition facts, and packaging details.',
    openCameraBtn: 'Open Camera Scanner',
    uploadPhotoBtn: 'Scan Barcode from Photo',
    inputPlaceholder: 'Enter barcode number (EAN / UPC)...',
    verifyBtn: 'Verify Code',
    quickDemoLabel: 'Try sample products:',
    demoGenuineBtn: 'Sample Genuine (Oreo)',
    demoFakeBtn: 'Sample Unverified (Fake)',

    // Verified Resale Strings
    resaleDisclaimer: 'Assisted check, not a guarantee of authenticity.',
    verdictDetailsVerified: 'Details verified',
    verdictLooksConsistent: 'Looks consistent',
    verdictNeedsCaution: 'Needs caution',
    verdictHighRisk: 'High risk',
    sellVerifiedTitle: 'Sell Verified — Trust Certificate',
    sellVerifiedSubtitle: 'Verify used items with photos and get a shareable link and code for buyers.',
    btnReportListing: 'Report Item',
    btnTransferOwnership: 'Transfer Ownership',
    btnCompareListing: 'Compare Description',
    btnShareCertificate: 'Copy Share Link'
  },
  hi: {
    brandTitle: 'ट्रस्ट चेन',
    blockchainTag: 'सत्यापित',
    tabHome: 'होम',
    tabScanner: 'स्कैन',
    tabRegister: 'पंजीकरण',
    tabExplorer: 'उत्पाद सूची',
    tabResale: 'सत्यापित बेचें',
    resaleBadge: 'पीयर-टू-पीयर',
    p2pBadge: 'सेकंड-हैंड रीसेल',
    langToggle: 'हिंदी / English',
    helpButton: 'यह कैसे काम करता है',
    decentralizedBadge: 'सत्यापित',

    heroBadge: 'आसान और त्वरित उत्पाद सत्यापन',
    heroHeadline: 'जांचें कि आपका उत्पाद असली है या नकली',
    heroHeadlineSub: 'आधिकारिक ब्रांड रिकॉर्ड के साथ सेकंड में जांचें।',
    heroDescription:
      'नकली सामान और समाप्त तिथि वाले उत्पादों से खुद को बचाएं। ब्रांड प्रामाणिकता, सामग्री और सुरक्षा की जांच के लिए किसी भी किराने का सामान या स्नैक स्कैन करें।',
    btnEnterSite: 'स्कैनिंग शुरू करें',
    btnQuickDemo: 'यह कैसे काम करता है',
    btnScanSample: 'नमूना उत्पाद जांचें',

    showcaseTitle: 'असली बनाम नकली उत्पाद',
    showcaseSubtitle: 'जानिए कैसे ट्रस्ट चेन आपको नकली उत्पादों से बचने में मदद करता है।',
    cardRealTitle: 'असली — 100% प्रमाणित',
    cardRealTag: 'ब्रांड द्वारा सत्यापित',
    cardRealDesc: 'निर्माता के रिकॉर्ड, मूल स्थान और बैच नंबर के साथ आधिकारिक रूप से दर्ज।',
    cardFakeTitle: 'नकली — अपंजीकृत',
    cardFakeTag: 'नकली की चेतावनी',
    cardFakeDesc: 'आधिकारिक ब्रांड डेटाबेस में कोई रिकॉर्ड नहीं मिला। चेतावनी: नकली उत्पाद या अवैध प्रतिलिपि।',
    trustScore: 'प्रामाणिकता स्कोर',
    verifiedOrigin: 'सत्यापित मूल व बैच',
    unregisteredAlert: 'अपंजीकृत बारकोड / चेतावनी',

    stepsSectionBadge: 'आसान प्रक्रिया',
    stepsSectionTitle: 'यह कैसे काम करता है?',
    stepsSectionSubtitle: 'फैक्ट्री निर्माण से लेकर ग्राहक खरीद तक: त्वरित और सुरक्षित जांच।',
    step1Title: '1. ब्रांड पंजीकरण',
    step1Desc: 'ब्रांड्स उत्पाद विवरण, बैच नंबर और पोषण संबंधी जानकारी दर्ज करते हैं।',
    step2Title: '2. पैकेजिंग पर बारकोड',
    step2Desc: 'पैकेजिंग पर दिए गए बारकोड सीधे आधिकारिक उत्पाद रिकॉर्ड से जुड़े होते हैं।',
    step3Title: '3. कैमरा स्कैन',
    step3Desc: 'बिना किसी ऐप को डाउनलोड किए सीधे अपने फोन कैमरे से बारकोड स्कैन करें।',
    step4Title: '4. त्वरित मिलान',
    step4Desc: 'ट्रस्ट चेन निर्माता रिकॉर्ड से मिलान कर तुरंत प्रामाणिकता की पुष्टि करता है।',
    step5Title: '5. स्पष्ट परिणाम',
    step5Desc: 'उपयोगकर्ता को पोषण संबंधी जानकारी, सामग्री और वास्तविक होने की पुष्टि मिलती है।',

    stat1Value: '$500B+',
    stat1Label: 'प्रतिवर्ष नकली सामानों का वैश्विक अवैध व्यापार',
    stat2Value: '< 0.5s',
    stat2Label: 'त्वरित सत्यापन समय',
    stat3Value: '100%',
    stat3Label: 'आधिकारिक ब्रांड मिलान',
    stat4Value: 'निःशुल्क',
    stat4Label: 'उपभोक्ताओं के लिए पूरी तरह मुफ़्त',

    ctaTitle: 'विश्वास के साथ खरीदें। किसी भी उत्पाद की तुरंत जांच करें।',
    ctaSubtitle: 'सेकंड में प्रामाणिकता और पोषण संबंधी जानकारी जांचने के लिए कैमरे का उपयोग करें।',
    ctaButton: 'अभी स्कैन शुरू करें',

    scannerHeroTitle: 'बारकोड स्कैन करें: उत्पाद असली है या नकली',
    scannerHeroDesc: 'कमर्शियल बारकोड (EAN, UPC) या क्यूआर कोड को स्कैन करें। ट्रस्ट चेन ब्रांड रिकॉर्ड और सुरक्षा की तुरंत पुष्टि करता है।',
    openCameraBtn: 'कैमरा स्कैनर खोलें',
    uploadPhotoBtn: 'फ़ोटो से बारकोड स्कैन करें',
    inputPlaceholder: 'बारकोड नंबर दर्ज करें...',
    verifyBtn: 'कोड जांचें',
    quickDemoLabel: 'नमूना उत्पाद परीक्षण:',
    demoGenuineBtn: 'असली नमूना (Oreo)',
    demoFakeBtn: 'अपंजीकृत नमूना',

    // Verified Resale Strings
    resaleDisclaimer: 'सहायक जांच, 100% गारंटी नहीं।',
    verdictDetailsVerified: 'विवरण सत्यापित',
    verdictLooksConsistent: 'संगत प्रतीत होता है',
    verdictNeedsCaution: 'सावधानी आवश्यक',
    verdictHighRisk: 'उच्च जोखिम',
    sellVerifiedTitle: 'सत्यापित बेचें — प्रमाण पत्र',
    sellVerifiedSubtitle: 'कैमरे से उपयोग किए गए सामान को सत्यापित करें और खरीदारों के लिए लिंक प्राप्त करें।',
    btnReportListing: 'रिपोर्ट करें',
    btnTransferOwnership: 'स्वामित्व हस्तांतरण',
    btnCompareListing: 'विवरण से मिलान करें',
    btnShareCertificate: 'शेयर लिंक कॉपी करें'
  }
};
