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

    heroBadge: 'Check before you buy',
    heroHeadline: 'Know more about what you’re buying',
    heroHeadlineSub: 'Scan a code. Check its registered details.',
    heroDescription:
      'Look up a product’s batch, origin, and available label details. Try a sample to see how the checks work.',
    btnEnterSite: 'Start Scanning',
    btnQuickDemo: 'How It Works',
    btnScanSample: 'Test Sample Product',

    showcaseTitle: 'What does a scan tell you?',
    showcaseSubtitle: 'These examples show a registered code and a code with no matching record.',
    cardRealTitle: 'Registered sample',
    cardRealTag: 'Record found',
    cardRealDesc: 'This sample code matches a record in the app. You can view its batch and recorded origin. A copied code can still match.',
    cardFakeTitle: 'Unregistered sample',
    cardFakeTag: 'No record found',
    cardFakeDesc: 'This code has no matching record. Check the packaging and ask the brand or seller for more information.',
    trustScore: 'Authenticity Score',
    verifiedOrigin: 'Verified Origin & Batch',
    unregisteredAlert: 'Code not registered',

    stepsSectionBadge: 'Simple Process',
    stepsSectionTitle: 'How It Works',
    stepsSectionSubtitle: 'Follow a product code from registration to lookup.',
    step1Title: '1. Brand Registration',
    step1Desc: 'Brand accounts add a product code, batch number, origin, and available label details.',
    step2Title: '2. Barcode on Packaging',
    step2Desc: 'A barcode or QR code identifies the product record to look up.',
    step3Title: '3. Quick Camera Scan',
    step3Desc: 'Use your camera, upload a barcode photo, or enter the code yourself.',
    step4Title: '4. Instant Check',
    step4Desc: 'Trust Chain looks for the complete code in the app registry.',
    step5Title: '5. Clear Product Details',
    step5Desc: 'Review the matching record, any recall notice, and available catalog details.',

    stat1Value: '$500B+',
    stat1Label: 'Fake Goods in Global Markets Each Year',
    stat2Value: '< 0.5s',
    stat2Label: 'Instant Verification Speed',
    stat3Value: '100%',
    stat3Label: 'Official Brand Matches',
    stat4Value: 'Free',
    stat4Label: 'For Everyday Consumers',

    ctaTitle: 'Have a product to check?',
    ctaSubtitle: 'Scan the barcode or enter its number to see what’s on record.',
    ctaButton: 'Check a product',

    scannerHeroTitle: 'Look up a product code',
    scannerHeroDesc: 'Scan standard retail barcodes (EAN-13, UPC) or QR codes. Trust Chain looks for a matching app record and shows available catalog details.',
    openCameraBtn: 'Open Camera Scanner',
    uploadPhotoBtn: 'Scan Barcode from Photo',
    inputPlaceholder: 'Enter barcode number (EAN / UPC)...',
    verifyBtn: 'Verify Code',
    quickDemoLabel: 'Try sample products:',
    demoGenuineBtn: 'Registered sample (Oreo)',
    demoFakeBtn: 'Unregistered sample',

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

    heroBadge: 'खरीदने से पहले जांचें',
    heroHeadline: 'खरीदने से पहले उत्पाद की जानकारी देखें',
    heroHeadlineSub: 'कोड स्कैन करें और दर्ज जानकारी देखें।',
    heroDescription:
      'उत्पाद का बैच, मूल स्थान और उपलब्ध लेबल जानकारी देखें। पहले किसी नमूने को स्कैन करके देखें।',
    btnEnterSite: 'स्कैनिंग शुरू करें',
    btnQuickDemo: 'यह कैसे काम करता है',
    btnScanSample: 'नमूना उत्पाद जांचें',

    showcaseTitle: 'स्कैन से क्या पता चलता है?',
    showcaseSubtitle: 'एक दर्ज कोड और बिना रिकॉर्ड वाले कोड के उदाहरण देखें।',
    cardRealTitle: 'दर्ज नमूना',
    cardRealTag: 'रिकॉर्ड मिला',
    cardRealDesc: 'इस नमूने का कोड ऐप में दर्ज है। बैच और मूल स्थान देखें। कॉपी किया गया कोड भी मेल खा सकता है।',
    cardFakeTitle: 'बिना रिकॉर्ड वाला नमूना',
    cardFakeTag: 'रिकॉर्ड नहीं मिला',
    cardFakeDesc: 'ऐप में इस कोड का रिकॉर्ड नहीं मिला। पैकेजिंग देखें और ब्रांड या विक्रेता से जानकारी मांगें।',
    trustScore: 'प्रामाणिकता स्कोर',
    verifiedOrigin: 'सत्यापित मूल व बैच',
    unregisteredAlert: 'अपंजीकृत बारकोड / चेतावनी',

    stepsSectionBadge: 'आसान प्रक्रिया',
    stepsSectionTitle: 'यह कैसे काम करता है?',
    stepsSectionSubtitle: 'देखें कि उत्पाद का कोड दर्ज कैसे होता है और उसका रिकॉर्ड कैसे मिलता है।',
    step1Title: '1. ब्रांड पंजीकरण',
    step1Desc: 'ब्रांड्स उत्पाद विवरण, बैच नंबर और पोषण संबंधी जानकारी दर्ज करते हैं।',
    step2Title: '2. पैकेजिंग पर बारकोड',
    step2Desc: 'पैकेजिंग पर दिया गया बारकोड या क्यूआर कोड उत्पाद का रिकॉर्ड खोजने में मदद करता है।',
    step3Title: '3. कैमरा स्कैन',
    step3Desc: 'बिना किसी ऐप को डाउनलोड किए सीधे अपने फोन कैमरे से बारकोड स्कैन करें।',
    step4Title: '4. त्वरित मिलान',
    step4Desc: 'ट्रस्ट चेन पूरे कोड को ऐप के रिकॉर्ड से मिलाता है।',
    step5Title: '5. स्पष्ट परिणाम',
    step5Desc: 'मिला हुआ रिकॉर्ड, रिकॉल सूचना और उपलब्ध उत्पाद जानकारी देखें।',

    stat1Value: '$500B+',
    stat1Label: 'प्रतिवर्ष नकली सामानों का वैश्विक अवैध व्यापार',
    stat2Value: '< 0.5s',
    stat2Label: 'त्वरित सत्यापन समय',
    stat3Value: '100%',
    stat3Label: 'आधिकारिक ब्रांड मिलान',
    stat4Value: 'निःशुल्क',
    stat4Label: 'उपभोक्ताओं के लिए पूरी तरह मुफ़्त',

    ctaTitle: 'कोई उत्पाद जांचना है?',
    ctaSubtitle: 'बारकोड स्कैन करें या उसका नंबर दर्ज करके रिकॉर्ड देखें।',
    ctaButton: 'अभी स्कैन शुरू करें',

    scannerHeroTitle: 'उत्पाद का कोड जांचें',
    scannerHeroDesc: 'कमर्शियल बारकोड (EAN, UPC) या क्यूआर कोड को स्कैन करें। ट्रस्ट चेन ऐप में दर्ज रिकॉर्ड और उपलब्ध जानकारी दिखाता है।',
    openCameraBtn: 'कैमरा स्कैनर खोलें',
    uploadPhotoBtn: 'फ़ोटो से बारकोड स्कैन करें',
    inputPlaceholder: 'बारकोड नंबर दर्ज करें...',
    verifyBtn: 'कोड जांचें',
    quickDemoLabel: 'नमूना उत्पाद परीक्षण:',
    demoGenuineBtn: 'दर्ज नमूना (Oreo)',
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
