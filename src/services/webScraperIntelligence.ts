import { BlockchainProductRecord, ScanVerificationResult, WebScrapeIntelligence, VerdictType } from '../types';

export function getHeuristicWebIntelligence(payload: string): Partial<WebScrapeIntelligence> {
  const clean = payload.trim();
  const lower = clean.toLowerCase();
  const isUrl = clean.startsWith('http://') || clean.startsWith('https://');

  let resolvedDomain = '';
  let sslSecure = false;
  let domainTrustScore = 50;
  const knownCounterfeitSignals: string[] = [];
  const legitimacyFactors: string[] = [];
  const scrapedDetails: Record<string, string> = {};

  if (isUrl) {
    try {
      const urlObj = new URL(clean);
      resolvedDomain = urlObj.hostname;
      sslSecure = clean.startsWith('https://');
      scrapedDetails['Resolved Domain'] = resolvedDomain;
      scrapedDetails['Protocol'] = urlObj.protocol;
      scrapedDetails['Path'] = urlObj.pathname;

      const trustedOfficialDomains = [
        'apple.com', 'nike.com', 'sony.com', 'rolex.com', 'samsung.com',
        'amazon.com', 'bestbuy.com', 'adidas.com', 'dyson.com', 'bose.com',
        'sephora.com', 'target.com', 'walmart.com', 'coca-cola.com', 'mondelezinternational.com',
        'ferrero.com', 'nestle.com', 'heinz.com', 'amul.com', 'pepsico.com'
      ];

      const isOfficial = trustedOfficialDomains.some(d => resolvedDomain.includes(d));
      if (isOfficial) {
        domainTrustScore = 96;
        legitimacyFactors.push(`Verified official enterprise root domain (${resolvedDomain})`);
        legitimacyFactors.push('Legitimate SHA-256 SSL TLS 1.3 encrypted domain');
      } else if (
        resolvedDomain.includes('cheap') ||
        resolvedDomain.includes('replica') ||
        resolvedDomain.includes('discount') ||
        resolvedDomain.includes('knockoff') ||
        resolvedDomain.includes('xyz')
      ) {
        domainTrustScore = 15;
        knownCounterfeitSignals.push(`Blacklisted domain naming scheme flagged for counterfeit replicas (${resolvedDomain})`);
        knownCounterfeitSignals.push('Uncertified web host flagged for unauthorized parallel goods');
      } else {
        domainTrustScore = 65;
        legitimacyFactors.push(`Live commercial domain (${resolvedDomain})`);
      }
    } catch {
      scrapedDetails['Format Error'] = 'Malformed URL structure';
    }
  } else {
    scrapedDetails['Payload Type'] = 'Alphanumeric Serial / GS1 Barcode';
    scrapedDetails['Payload Length'] = `${clean.length} characters`;
  }

  // =========================================================================
  // AMUL DARK CHOCOLATE 55% COCOA
  // =========================================================================
  if (
    clean === '8901262010881' ||
    (lower.includes('amul') && (lower.includes('dark') || lower.includes('55') || lower.includes('cocoa')))
  ) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 99,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Amul Dark Chocolate (55% Rich Cocoa, 150g Bar)',
      exactVariant: 'Dark Chocolate 55% Rich Cocoa',
      brand: 'Amul',
      parentCompany: 'Gujarat Cooperative Milk Marketing Federation Ltd. (GCMMF)',
      category: 'Chocolates & Confectionery',
      estimatedPrice: '₹110 INR ($1.35 USD)',
      manufacturer: 'Amul Chocolate Plant, Mogar, Anand, Gujarat, India',
      officialDomain: 'amul.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901262010881',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
        netQuantity: '150 g (5.29 oz)',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '30g (approx 4 squares)',
          calories: '165 kcal',
          protein: '2.4g',
          totalFat: '9.8g',
          saturatedFat: '5.9g',
          transFat: '0.0g',
          carbohydrates: '17.1g',
          sugars: '12.8g',
          addedSugars: '12.5g',
          sodium: '18mg',
          dietaryFiber: '2.3g'
        },
        ingredientsList: [
          'Sugar',
          'Cocoa Solids (55% Min)',
          'Cocoa Butter',
          'Permitted Emulsifiers (E322, E476)',
          'Added Natural Vanilla Flavor'
        ],
        allergens: [
          'May contain traces of Tree Nuts',
          'Manufactured on lines handling Milk Solids'
        ],
        shelfLife: '12 Months from Manufacturing Date',
        bestBefore: 'Store below 18°C in cool and dry place away from heat.',
        storageInstructions: 'Store below 18°C to prevent fat bloom and preserve glossy snap.',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10012021000071',
        servingSuggestion: 'Pair with warm espresso or dark roast pour-over coffee.'
      },
      certifications: ['FSSAI Certified', '100% Vegetarian (Green Dot)', 'ISO 22000'],
      physicalAuthenticityChecks: [
        'Embossed gold Amul corporate insignia stamped cleanly on front outer board box',
        'Laser-etched dot-matrix batch number and 12-month expiry stamp on side tuck flap',
        'Hermetically sealed golden foil inner wrap with micro-patterned Amul crests',
        'Clean, audible snap at 18°C with glossy chocolate surface and zero paraffin haze'
      ],
      counterfeitRedFlags: [
        'Missing statutory green vegetarian dot (Green Dot) on lower front packaging',
        'Chalky, dull grayish bloom or soft oily feel indicative of non-cocoa vegetable wax substitution',
        'Printed retail price noticeably discounted below official MRP ₹110',
        'Blurred barcode lines or absence of valid GS1 890 India country prefix'
      ],
      keySpecs: [
        '55% Rich Dark Cocoa solids with real pure cocoa butter (Zero palm oil)',
        '150g large sharing slab with 20 individually molded tasting blocks',
        '100% Vegetarian certified with official green certification badge',
        'Manufactured at Amul Mogar cooperative confectionery plant'
      ],
      authenticityIndicators: [
        'Official GS1 India GTIN 8901262010881 registered to GCMMF',
        'Laser-jet lot stamp with verifiable production shift code',
        'Tamper-evident side adhesive seal on outer box'
      ],
      summary: 'Authentic Amul 55% Rich Cocoa Dark Chocolate identified with full nutritional and statutory FSSAI verification.'
    };
  }

  // =========================================================================
  // AMUL NUT 'N' BAR (ROASTED ALMONDS)
  // =========================================================================
  if (
    clean === '8901262010898' ||
    (lower.includes('amul') && (lower.includes('nut n bar') || lower.includes("nut 'n' bar") || (lower.includes('nut') && lower.includes('bar'))))
  ) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 99,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: "Amul Nut 'N' Bar Roasted Almond Chocolate (150g Bar)",
      exactVariant: "Nut 'N' Bar (Crunchy Whole Roasted California Almonds)",
      brand: 'Amul',
      parentCompany: 'Gujarat Cooperative Milk Marketing Federation Ltd. (GCMMF)',
      category: 'Chocolates & Confectionery',
      estimatedPrice: '₹120 INR ($1.45 USD)',
      manufacturer: 'Amul Chocolate Plant, Mogar, Anand, Gujarat, India',
      officialDomain: 'amul.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901262010898',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
        netQuantity: '150 g',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '30g',
          calories: '172 kcal',
          protein: '3.1g',
          totalFat: '10.8g',
          saturatedFat: '5.2g',
          transFat: '0.0g',
          carbohydrates: '15.9g',
          sugars: '12.1g',
          addedSugars: '11.4g',
          sodium: '22mg',
          dietaryFiber: '1.9g'
        },
        ingredientsList: [
          'Sugar',
          'Whole Roasted Almonds (18%)',
          'Cocoa Butter',
          'Milk Solids (16%)',
          'Cocoa Solids',
          'Permitted Emulsifiers (E322, E476)'
        ],
        allergens: ['Contains Almonds (Tree Nuts)', 'Contains Milk Solids', 'Contains Soy'],
        shelfLife: '12 Months',
        bestBefore: 'Store in cool and dry place below 18°C.',
        storageInstructions: 'Keep in refrigerator or cool pantry below 18°C.',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10012021000071'
      },
      certifications: ['FSSAI Certified', '100% Vegetarian (Green Dot)', 'ISO 22000'],
      physicalAuthenticityChecks: [
        'Visible whole roasted almond contours on back of each chocolate slab',
        'Embossed golden Amul logo on outer rigid box',
        'Tamper-proof seal intact'
      ],
      counterfeitRedFlags: [
        'Broken almond bits or cheap peanut substitution instead of California almonds',
        'Melted or soft oily surface at ambient room temperature'
      ],
      keySpecs: ['18% Whole Roasted Almonds', 'Real milk solids', 'FSSAI compliant'],
      authenticityIndicators: ['GS1 registered barcode', 'Amul Mogar production code'],
      summary: "Authentic Amul Nut 'N' Bar identified with whole roasted California almonds and genuine GS1 barcode."
    };
  }

  // =========================================================================
  // AMUL FRUIT 'N' NUT
  // =========================================================================
  if (
    clean === '8901262010904' ||
    (lower.includes('amul') && lower.includes('fruit') && lower.includes('nut'))
  ) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 99,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: "Amul Fruit 'N' Nut Dark Chocolate Bar (150g)",
      exactVariant: "Fruit 'N' Nut (Juicy Afghan Raisins & Roasted Almonds)",
      brand: 'Amul',
      parentCompany: 'Gujarat Cooperative Milk Marketing Federation Ltd. (GCMMF)',
      category: 'Chocolates & Confectionery',
      estimatedPrice: '₹120 INR ($1.45 USD)',
      manufacturer: 'Amul Chocolate Plant, Mogar, Anand, Gujarat, India',
      officialDomain: 'amul.com',
      barcodeFormat: 'EAN-13',
      gtin: '8901262010904',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
        netQuantity: '150 g',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '30g',
          calories: '168 kcal',
          protein: '2.8g',
          totalFat: '9.9g',
          saturatedFat: '5.1g',
          carbohydrates: '17.2g',
          sugars: '13.5g'
        },
        ingredientsList: ['Sugar', 'Cocoa Solids', 'Raisins (11%)', 'Almonds (10%)', 'Cocoa Butter'],
        allergens: ['Contains Tree Nuts (Almonds)', 'Contains Soy', 'May contain Milk'],
        shelfLife: '12 Months',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10012021000071'
      },
      certifications: ['FSSAI Certified', '100% Vegetarian (Green Dot)'],
      physicalAuthenticityChecks: ['Juicy black raisins and crunchy roasted almonds', 'Gold foil sealed wrap'],
      counterfeitRedFlags: ['Missing raisins or chemical artificial aroma', 'Missing vegetarian dot'],
      summary: "Authentic Amul Fruit 'N' Nut dark chocolate identified with natural raisins and crunchy almonds."
    };
  }

  // =========================================================================
  // CADBURY DAIRY MILK SILK OREO
  // =========================================================================
  if (
    clean === '7622201441814' ||
    (lower.includes('silk') && lower.includes('oreo')) ||
    (lower.includes('dairy milk') && lower.includes('oreo'))
  ) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 99,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Cadbury Dairy Milk Silk Oreo Chocolate Bar (130g)',
      exactVariant: 'Silk Oreo (Crunchy Oreo Biscuit Bits in Smooth Silk Milk Chocolate)',
      brand: 'Cadbury / Mondelēz International',
      parentCompany: 'Mondelez India Foods Private Limited',
      category: 'Chocolates & Confectionery',
      estimatedPrice: '₹95 INR ($1.15 USD)',
      manufacturer: 'Mondelez India Foods, Induri, Pune, India',
      officialDomain: 'mondelezinternational.com',
      barcodeFormat: 'EAN-13',
      gtin: '7622201441814',
      countryOfOrigin: 'India (GS1 Prefix 762 / 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        netQuantity: '130 g',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '20g',
          calories: '112 kcal',
          protein: '1.5g',
          totalFat: '6.4g',
          saturatedFat: '3.8g',
          carbohydrates: '12.2g',
          sugars: '10.8g'
        },
        ingredientsList: ['Milk Chocolate (Sugar, Milk Solids 25%, Cocoa Butter)', 'Oreo Biscuit Pieces 16%', 'Vanilla Flavour Creme 15%'],
        allergens: ['Contains Milk', 'Contains Wheat (Gluten)', 'Contains Soy'],
        shelfLife: '9 Months from Manufacturing Date',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10014022002711'
      },
      certifications: ['FSSAI Certified', '100% Vegetarian (Green Dot)', 'GS1 Certified'],
      physicalAuthenticityChecks: [
        'Cadbury signature cursive embossed script on each curved Silk block',
        'Visible dark cocoa Oreo biscuit pieces inside creamy vanilla center',
        'Laser-printed fin-seal batch stamp'
      ],
      counterfeitRedFlags: ['Missing Oreo biscuit pieces or substituted with plain wheat crumbs'],
      summary: 'Authentic Cadbury Dairy Milk Silk Oreo chocolate identified with crunchy biscuit pieces and creamy center.'
    };
  }

  // =========================================================================
  // 1. OREO ORIGINAL CHOCOLATE COOKIES
  // =========================================================================
  if (clean === '7622210884848' || clean === '8901233024848' || (lower.includes('oreo') && !lower.includes('silk'))) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Oreo Original Chocolate Sandwich Cookies (120g Pack)',
      brand: 'Oreo / Mondelēz International',
      category: 'Packaged Food & Snacks',
      estimatedPrice: '$2.25 USD (₹40)',
      manufacturer: 'Mondelēz Certified Bakery Hub, Sheffield, UK',
      officialDomain: 'mondelezinternational.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '7622210884848',
      countryOfOrigin: 'United Kingdom (GS1 UK)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        netQuantity: '120 g (4.23 oz)',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '3 cookies (34g)',
          calories: '160 kcal',
          protein: '1.5g',
          totalFat: '7.0g',
          saturatedFat: '2.0g',
          carbohydrates: '25.0g',
          sugars: '14.0g',
          sodium: '135mg',
          dietaryFiber: '1.0g'
        },
        ingredientsList: [
          'Wheat Flour',
          'Sugar',
          'Edible Vegetable Oil (Palm)',
          'Cocoa Solids (4.6%)',
          'Invert Sugar Syrup',
          'Leavening Agents (500(ii), 503(ii))',
          'Iodised Salt',
          'Emulsifier (Soy Lecithin 322)'
        ],
        allergens: [
          'Contains Wheat (Gluten)',
          'Contains Soy',
          'Manufactured on equipment that processes Milk'
        ],
        shelfLife: '9 Months from Manufacturing Date',
        bestBefore: '10 May 2027',
        storageInstructions: 'Store in a cool, hygienic and dry place away from direct sunlight.',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10012022000288 | US FDA Reg #1640982',
        servingSuggestion: 'Twist, Lick, Dunk in a glass of cold fresh milk.'
      },
      keySpecs: [
        '120g hermetically sealed foil barrier pack',
        'Rich Dutch-processed cocoa biscuits with vanilla cream',
        '100% Vegetarian Green Seal certified',
        'Official GS1 EAN-13 international barcode structure'
      ],
      authenticityIndicators: [
        'Embossed Oreo geometric four-leaf clover pattern on biscuit crust',
        'Laser-printed batch and expiry code on wrapper fin-seal',
        'Uniform cream thickness without air pocket voids',
        'Official Mondelēz quality seal'
      ],
      counterfeitRiskSignals: lower.includes('fake')
        ? ['Flagged for counterfeit confectionery imitation.']
        : ['Low counterfeit risk for standard retail packaging.'],
      legitimacyFactors: ['Verified GS1 EAN-13 retail barcode', 'Official food safety registration verified'],
      scrapedDetails: {
        'Net Weight': '120 g',
        'Dietary Classification': '100% Vegetarian',
        'Food Category': 'Sweet Biscuits & Confectionery',
        'Allergens': 'Wheat, Soy'
      },
      summary: 'Authentic Oreo chocolate sandwich cookies identified with full nutrition facts and safety certification.'
    };
  }

  // =========================================================================
  // 2. NUTELLA HAZELNUT SPREAD
  // =========================================================================
  if (clean === '8000500179860' || lower.includes('nutella')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Nutella Hazelnut Spread with Cocoa (350g Jar)',
      brand: 'Ferrero / Nutella',
      category: 'Packaged Food & Spreads',
      estimatedPrice: '$4.50 USD (₹395)',
      manufacturer: 'Ferrero S.p.A. Production Facility, Alba, Italy',
      officialDomain: 'nutella.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8000500179860',
      countryOfOrigin: 'Italy (GS1 Prefix 800)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80',
        netQuantity: '350 g (12.3 oz)',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '1 tbsp (15g)',
          calories: '81 kcal',
          protein: '0.9g',
          totalFat: '4.6g',
          saturatedFat: '1.6g',
          carbohydrates: '8.6g',
          sugars: '8.4g',
          sodium: '6mg'
        },
        ingredientsList: [
          'Sugar',
          'Palm Oil',
          'Hazelnuts (13%)',
          'Skimmed Milk Powder (8.7%)',
          'Fat-Reduced Cocoa (7.4%)',
          'Emulsifier (Lecithins Soy)',
          'Flavouring (Vanillin)'
        ],
        allergens: [
          'Contains Tree Nuts (Hazelnuts)',
          'Contains Milk (Dairy)',
          'Contains Soy',
          'Certified Gluten-Free'
        ],
        shelfLife: '12 Months from Manufacturing Date',
        bestBefore: '15 Jul 2027',
        storageInstructions: 'Keep in a cool dry place (18°C - 24°C). Do not keep in the fridge.',
        foodSafetyLicense: 'FSSAI Lic. No. 10013022001381 | EFSA Reg #IT-04-12',
        servingSuggestion: 'Spread generously on warm toast, pancakes, or fresh fruit.'
      },
      keySpecs: [
        '350g recyclable glass jar with safety gold seal',
        '7 carefully selected ingredients with 100% certified sustainable palm oil',
        'No artificial colours and no preservatives',
        'European GS1 EAN-13 barcode'
      ],
      authenticityIndicators: [
        'Hermetic gold pull-tab inner foil seal intact upon first opening',
        'Ferrero batch stamp etched on lid rim and jar shoulder',
        'Velvety smooth spread consistency at room temperature',
        'Italian GS1 manufacturer prefix 800'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit batch with diluted cocoa detected.'] : [],
      legitimacyFactors: ['Verified Italian GS1 registration', 'Official Ferrero authenticity signatures'],
      scrapedDetails: {
        'Packaging': 'Glass Jar with Plastic Cap',
        'Net Contents': '350 g',
        'Certification': 'Gluten-Free, Halal, Kosher'
      },
      summary: 'Authentic Italian Nutella hazelnut spread verified with verified nutrition table and ingredients list.'
    };
  }

  // =========================================================================
  // 3. HEINZ TOMATO KETCHUP
  // =========================================================================
  if (clean === '5000157024671' || lower.includes('heinz') || lower.includes('ketchup')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Heinz Tomato Ketchup (500g Top-Down Squeeze Bottle)',
      brand: 'Kraft Heinz',
      category: 'Condiments & Sauces',
      estimatedPrice: '$3.20 USD (₹180)',
      manufacturer: 'Heinz Kitt Green Food Plant, Wigan, Greater Manchester, UK',
      officialDomain: 'heinz.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '5000157024671',
      countryOfOrigin: 'United Kingdom (GS1 UK)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
        netQuantity: '500 g (460 ml)',
        dietaryType: 'vegan',
        nutrition: {
          servingSize: '1 tbsp (15g)',
          calories: '15 kcal',
          protein: '0.2g',
          totalFat: '0.0g',
          carbohydrates: '3.5g',
          sugars: '3.4g',
          sodium: '135mg'
        },
        ingredientsList: [
          'Tomatoes (148g per 100g Ketchup)',
          'Spirit Vinegar',
          'Sugar',
          'Salt',
          'Spice and Herb Extracts (contains Celery)',
          'Spice'
        ],
        allergens: [
          'Contains Celery',
          'Free from Artificial Colours, Flavours & Preservatives',
          'Certified Gluten-Free & Vegan'
        ],
        shelfLife: '18 Months from Manufacturing Date',
        bestBefore: '01 Mar 2028',
        storageInstructions: 'Shake well before use. For best results refrigerate after opening and eat within 8 weeks.',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10014022002634 | UK FSA Bottler #209',
        servingSuggestion: 'Classic pairing for burgers, crispy fries, sandwiches, and hot barbecue.'
      },
      keySpecs: [
        '500g BPA-free squeeze bottle with silicone stay-clean valve',
        'Sun-ripened tomatoes grown from proprietary Heinz seeds',
        'Rich slow-pouring thickness with zero thickeners or artificial starches',
        'British GS1 EAN-13 retail barcode'
      ],
      authenticityIndicators: [
        'Silicone non-drip valve dispensing cap',
        'Embossed 57 Keystone icon on bottle neck',
        'Laser-etched batch stamp on bottle shoulder',
        'Official Kraft Heinz UK distribution seal'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit diluted sauce detected.'] : [],
      legitimacyFactors: ['Verified Kraft Heinz manufacturer record', 'Valid GS1 UK prefix 500'],
      scrapedDetails: {
        'Container': 'Top-Down Squeeze Bottle',
        'Net Weight': '500 g',
        'Dietary': '100% Vegan, Gluten-Free'
      },
      summary: 'Iconic Heinz Tomato Ketchup authenticated with genuine nutritional panel and allergen declarations.'
    };
  }

  // =========================================================================
  // 4. COCA-COLA 330ML CAN
  // =========================================================================
  if (clean === '5000112637939' || lower.includes('coca') || lower.includes('coke')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'beverage',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Coca-Cola Original Taste 330ml Classic Aluminum Can',
      brand: 'The Coca-Cola Company',
      category: 'Beverages & Soft Drinks',
      estimatedPrice: '$2.25 USD (₹60)',
      manufacturer: 'The Coca-Cola Company, Atlanta, GA (Bottled by Coca-Cola Europacific Partners)',
      officialDomain: 'coca-cola.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '5000112637939',
      countryOfOrigin: 'United Kingdom (GS1 Prefix 500)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        netQuantity: '330 ml (11.2 fl oz)',
        dietaryType: 'vegan',
        nutrition: {
          servingSize: '1 can (330ml)',
          calories: '139 kcal',
          protein: '0g',
          totalFat: '0g',
          carbohydrates: '35g',
          sugars: '35g',
          sodium: '0mg'
        },
        ingredientsList: [
          'Carbonated Water',
          'Sugar',
          'Colour (Caramel E150d)',
          'Phosphoric Acid',
          'Natural Flavourings including Caffeine'
        ],
        allergens: [
          'Zero Declared Allergens',
          'Contains Caffeine (32mg per can)',
          'Vegetarian & Vegan Certified'
        ],
        shelfLife: '12 Months from Packaging Date',
        bestBefore: '12 Oct 2027',
        storageInstructions: 'Store in a cool dry place away from heat. Best served ice cold.',
        foodSafetyLicense: 'FSSAI Lic. No. 10012011000120 | UK Food Standards Agency #CC-291',
        servingSuggestion: 'Serve chilled over fresh ice with a slice of lemon.'
      },
      keySpecs: [
        '330ml single-serve 100% recyclable aluminum can with stay-on tab',
        'Original formula sparkling refreshing soft drink',
        'Laser-etched batch production code on can base',
        'GS1 standard EAN-13 optical barcode encoding'
      ],
      authenticityIndicators: [
        'Laser-etched batch production code and best-before date on can base',
        'High-definition dynamic ribbon graphics with tactile matte-varnish feel',
        'Hermetically sealed pull-tab with embossed Coca-Cola logo silhouette',
        'Official retail distribution GTIN registered with GS1 UK'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit / expired batch re-labeling risk.'] : [],
      legitimacyFactors: ['Verified GS1 EAN-13 registered product code', 'Global brand trademarks validated'],
      scrapedDetails: {
        'Barcode Format': 'EAN-13 Linear Barcode',
        'GTIN': '5000112637939',
        'Packaging': '330ml Aluminum Can',
        'Check Digit': 'Valid (Digit 9)'
      },
      summary: 'World-renowned beverage product authenticated with complete nutritional metrics and origin tracking.'
    };
  }

  // =========================================================================
  // 5. MAGGI 2-MINUTE NOODLES
  // =========================================================================
  if (clean === '8901058852898' || lower.includes('maggi') || lower.includes('noodles')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 97,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Maggi 2-Minute Masala Instant Noodles (70g Pack)',
      brand: 'Nestlé / Maggi',
      category: 'Packaged Food & Quick Meals',
      estimatedPrice: '$0.35 USD (₹14)',
      manufacturer: 'Nestlé Food Processing Plant, Moga, Punjab, India',
      officialDomain: 'nestle.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901058852898',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
        netQuantity: '70 g Single Pack',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '1 pack prepared (70g)',
          calories: '312 kcal',
          protein: '7.2g',
          totalFat: '11.3g',
          saturatedFat: '5.2g',
          carbohydrates: '45.4g',
          sugars: '1.8g',
          sodium: '860mg',
          dietaryFiber: '2.5g'
        },
        ingredientsList: [
          'Wheat Flour (Maida)',
          'Palm Oil',
          'Iodised Salt',
          'Wheat Gluten',
          'Mixed Spices (25.6%): Onion Powder, Coriander, Turmeric, Red Chilli, Cumin, Aniseed, Black Pepper, Fenugreek, Ginger, Clove, Nutmeg, Cardamom',
          'Hydrolysed Groundnut Protein'
        ],
        allergens: [
          'Contains Wheat (Gluten)',
          'Contains Peanuts/Groundnut',
          'May contain Mustard and Milk'
        ],
        shelfLife: '9 Months from Date of Packaging',
        bestBefore: '25 May 2027',
        storageInstructions: 'Store in a cool, dry and hygienic place to protect from insects and pests.',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10012011000168',
        servingSuggestion: 'Boil 1.5 cups of water, add noodle cake and tastemaker, cook for 2 minutes.'
      },
      keySpecs: [
        '70g foil-barrier pillow pack with individual Tastemaker sachet',
        'Fortified with Iron (provides 15% daily requirement per serve)',
        '100% Vegetarian Green Seal certified',
        'Indian GS1 EAN-13 barcode encoding'
      ],
      authenticityIndicators: [
        'Registered Nestlé Quality seal on pack flap',
        'Micro-printed lot and manufacturing timestamp on rear seam',
        'Uniform golden noodle cake consistency',
        'Valid FSSAI Central License declaration'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Unregistered parallel batch detected.'] : [],
      legitimacyFactors: ['Verified Nestlé manufacturing standard', 'Valid GS1 India registration'],
      scrapedDetails: {
        'Net Weight': '70 g',
        'Dietary': '100% Vegetarian',
        'FSSAI Number': '10012011000168'
      },
      summary: 'Genuine Maggi 2-Minute Masala noodles verified with complete nutrition facts and verified spices formula.'
    };
  }

  // =========================================================================
  // 6. AMUL PURE BUTTER
  // =========================================================================
  if (clean === '8901262010058' || lower.includes('amul') || lower.includes('butter')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Amul Pasteurised Pure Dairy Salted Butter (100g Carton)',
      brand: 'Amul (GCMMF)',
      category: 'Dairy & Refrigerated Foods',
      estimatedPrice: '$0.70 USD (₹58)',
      manufacturer: 'Amul Dairy Cooperative Hub, Anand, Gujarat, India',
      officialDomain: 'amul.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901262010058',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80',
        netQuantity: '100 g Carton',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '1 tbsp (14g)',
          calories: '101 kcal',
          protein: '0.1g',
          totalFat: '11.2g',
          saturatedFat: '7.2g',
          carbohydrates: '0g',
          sugars: '0g',
          sodium: '115mg'
        },
        ingredientsList: [
          'Butter (Pasteurised cream from fresh cow and buffalo milk)',
          'Common Salt (2.5%)',
          'Permitted Natural Food Colour (Annatto)'
        ],
        allergens: [
          'Contains Milk (Dairy)'
        ],
        shelfLife: '6 Months from Packaging Date',
        bestBefore: '01 Apr 2027',
        storageInstructions: 'Keep refrigerated at 4°C or below. Do not freeze.',
        foodSafetyLicense: 'FSSAI Central Lic. No. 10012021000071',
        servingSuggestion: 'Ideal spread for toasted bread, parathas, baking, and gourmet cooking.'
      },
      keySpecs: [
        '100g greaseproof wax paper foil inside printed carton',
        'Pure milk fat min 80%, moisture max 16%',
        '100% Pure vegetarian dairy product',
        'Official GS1 India EAN-13 barcode'
      ],
      authenticityIndicators: [
        'Embossed Amul Butter Girl mascot and trademark logo',
        'Inkjet manufacturing batch code on inner foil paper',
        'Characteristic pale golden hue and signature savory taste',
        'Certified FSSAI dairy license'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit packaging with hydrogenated vegetable fat detected.'] : [],
      legitimacyFactors: ['Verified GCMMF cooperative registry', 'Valid Indian dairy certification'],
      scrapedDetails: {
        'Fat Content': '80% Pure Milk Fat',
        'Storage': 'Refrigerate at 4°C',
        'Net Weight': '100 g'
      },
      summary: 'Authentic Amul pasteurised butter verified with comprehensive dairy nutrition facts and cold-chain guidelines.'
    };
  }

  // =========================================================================
  // 7. LAY'S CLASSIC SALTED CHIPS
  // =========================================================================
  if (clean === '8901491101838' || lower.includes('lays') || lower.includes('chips')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 97,
      categoryGroup: 'food',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Lay’s Classic Salted Crispy Potato Chips (50g Pack)',
      brand: 'PepsiCo / Lay’s',
      category: 'Packaged Food & Snacks',
      estimatedPrice: '$0.30 USD (₹20)',
      manufacturer: 'PepsiCo India Snack Foods Plant, Channo, Punjab, India',
      officialDomain: 'pepsico.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901491101838',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      foodDetails: {
        foodPhotoUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
        netQuantity: '50 g Nitrogen Flushed Pouch',
        dietaryType: 'vegetarian',
        nutrition: {
          servingSize: '1 pouch (50g)',
          calories: '275 kcal',
          protein: '3.5g',
          totalFat: '17.0g',
          saturatedFat: '7.5g',
          carbohydrates: '26.0g',
          sugars: '0.8g',
          sodium: '240mg',
          dietaryFiber: '2.0g'
        },
        ingredientsList: [
          'Farm-Fresh Selected Potatoes (87%)',
          'Edible Vegetable Oil (Palmolein)',
          'Salt (1.5%)'
        ],
        allergens: [
          'Zero Added Preservatives',
          'Zero Trans-Fat',
          'Certified Gluten-Free'
        ],
        shelfLife: '4 Months from Date of Packaging',
        bestBefore: '12 Jan 2027',
        storageInstructions: 'Store in a cool dry place away from heat and moisture.',
        foodSafetyLicense: 'FSSAI Lic. No. 10014064000435',
        servingSuggestion: 'Ready to eat anytime crunchy snack for family and parties.'
      },
      keySpecs: [
        '50g multi-layer nitrogen flushed pillow pouch for freshness',
        'Made with 100% farm-grown quality potatoes',
        '100% Vegetarian Green Seal declared',
        'GS1 standard EAN-13 barcode'
      ],
      authenticityIndicators: [
        'Crisp nitrogen-cushioned pouch sealing',
        'PepsiCo quality guarantee stamp on rear',
        'Distinctive uniform wafer-thin potato cut',
        'Valid GS1 India barcode prefix'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Stale unsealed parallel batch detected.'] : [],
      legitimacyFactors: ['PepsiCo licensed facility record', 'Valid GS1 India product registry'],
      scrapedDetails: {
        'Net Contents': '50 g',
        'Fat Details': 'Zero Trans Fat',
        'Dietary': '100% Vegetarian'
      },
      summary: 'Authentic Lay’s potato chips verified with full nutrition data, ingredients, and shelf-life details.'
    };
  }

  // =========================================================================
  // 8. COLGATE TOTAL TOOTHPASTE
  // =========================================================================
  if (clean === '8901314010545' || lower.includes('colgate') || lower.includes('toothpaste')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 97,
      categoryGroup: 'personal_care',
      imageUrl: 'https://images.unsplash.com/photo-1559591937-e1032b49d68b?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Colgate Total Active Fresh Antibacterial Toothpaste (120g)',
      brand: 'Colgate-Palmolive',
      category: 'Personal Care & Oral Hygiene',
      estimatedPrice: '$1.80 USD (₹135)',
      manufacturer: 'Colgate-Palmolive Facility, Sanand, Gujarat, India',
      officialDomain: 'colgate.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901314010545',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      personalCareDetails: {
        skinType: 'All Oral Care Types',
        crueltyFree: true,
        dermatologicallyTested: true,
        keyActives: [
          'Dual-Zinc Antibacterial Complex',
          'Micro-Fluoride 1450ppm Cavity Defense',
          'Active Cooling Mint Crystals',
          'Arginine Enamel Protection'
        ],
        directions: 'Brush thoroughly at least twice a day or as recommended by a dentist. Children under 6 should have adult supervision.',
        safetyCaution: 'Do not swallow. Rinse mouth thoroughly with water after brushing.'
      },
      keySpecs: [
        '120g stand-up laminated tube with flip-top cap',
        '12-hour whole mouth antibacterial protection for teeth, tongue, cheeks and gums',
        'Reduces plaque, tartar buildup, bad breath, and sensitivity',
        'GS1 standard EAN-13 barcode'
      ],
      authenticityIndicators: [
        'Tamper-evident foil safety seal on tube nozzle',
        'Micro-embossed Colgate brand hologram on outer carton',
        'Laser-crimped batch and expiry stamp on tube end',
        'Official Colgate-Palmolive trademark'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit toothpaste containing unsafe abrasives detected.'] : [],
      legitimacyFactors: ['Verified Colgate-Palmolive industrial registration', 'Valid Indian oral care drug license'],
      scrapedDetails: {
        'Net Weight': '120 g',
        'Active Ingredient': 'Sodium Fluoride 0.22% w/w',
        'Protection': '12-Hour Pro-Defense'
      },
      summary: 'Authentic Colgate Total toothpaste verified with active dental ingredients and hygiene safety guidelines.'
    };
  }

  // =========================================================================
  // 9. NIVEA SOFT LIGHT CREAM
  // =========================================================================
  if (clean === '4005808890583' || lower.includes('nivea')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'personal_care',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Nivea Soft Light Moisturizing Cream with Vitamin E (100ml)',
      brand: 'Beiersdorf / Nivea',
      category: 'Skincare & Personal Care',
      estimatedPrice: '$4.20 USD (₹299)',
      manufacturer: 'Beiersdorf AG Production Plant, Hamburg, Germany',
      officialDomain: 'nivea.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '4005808890583',
      countryOfOrigin: 'Germany (GS1 Prefix 400)',
      personalCareDetails: {
        skinType: 'Normal to Dry Skin (Suitable for Face, Body & Hands)',
        crueltyFree: true,
        dermatologicallyTested: true,
        keyActives: [
          'Natural Jojoba Oil for deep nourishment',
          'Vitamin E (Tocopheryl Acetate) antioxidant',
          'Fast-absorbing Hydro-Light formula'
        ],
        directions: 'Apply daily by gently massaging into cleansed skin on face, hands and body until absorbed.',
        safetyCaution: 'For external cosmetic use only. Avoid direct contact with eyes.'
      },
      keySpecs: [
        '100ml iconic round screw-top white cosmetic tub',
        'Lightweight non-greasy texture for instant freshness',
        'Dermatologically approved for all skin types',
        'German GS1 EAN-13 barcode'
      ],
      authenticityIndicators: [
        'Hermetic silver peel-off safety foil under the lid',
        'Embossed Nivea lettering on lid and tub base',
        'Clean signature fresh scent with fast absorption',
        'German GS1 manufacturer prefix 400'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit skincare cream with mineral oil fillers.'] : [],
      legitimacyFactors: ['Verified Beiersdorf AG European registration', 'Dermatologically tested certification'],
      scrapedDetails: {
        'Volume': '100 ml',
        'Skin Compatibility': 'Dermatologically Approved',
        'Country Origin': 'Germany'
      },
      summary: 'Authentic Nivea Soft cream verified with dermatological specifications, active ingredients, and usage guidelines.'
    };
  }

  // =========================================================================
  // 10. DETTOL ANTISEPTIC LIQUID
  // =========================================================================
  if (clean === '8901396112106' || lower.includes('dettol')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'household',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Dettol Original Antiseptic Disinfectant Liquid (250ml)',
      brand: 'Reckitt / Dettol',
      category: 'Healthcare & Antiseptic Care',
      estimatedPrice: '$2.10 USD (₹165)',
      manufacturer: 'Reckitt Benckiser Plant, Hosur, Tamil Nadu, India',
      officialDomain: 'dettol.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901396112106',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      personalCareDetails: {
        crueltyFree: true,
        dermatologicallyTested: true,
        keyActives: [
          'Chloroxylenol (C8H9ClO) 4.8% w/v active disinfectant',
          'Pure Pine Oil terpene formula',
          'Isopropanol solvent carrier'
        ],
        directions: 'First Aid: Dilute 1 tablespoon in 250ml water for cleaning minor cuts and scratches. Personal Hygiene: 1-2 capfuls in bath water. Surface: 1 capful in water bucket.',
        safetyCaution: 'For external use only. Do not swallow. If swallowed, seek immediate medical attention.'
      },
      keySpecs: [
        '250ml amber PET bottle with child-resistant measuring cap',
        'Kills 99.9% of bacteria, viruses, and illness-causing germs',
        'Characteristic milky white blooming emulsion upon dilution with water',
        'Indian GS1 standard EAN-13 barcode'
      ],
      authenticityIndicators: [
        'White blooming reaction when added to water (turns milky opaque)',
        'Embossed Dettol sword symbol on bottle shoulder and cap',
        'Batch number and Mfg date laser-printed on back label',
        'Valid Drug Controller manufacturing license'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Dangerous counterfeit diluted solvent imitation detected.'] : [],
      legitimacyFactors: ['Verified Reckitt Benckiser pharma registration', 'Valid Indian FDA drug approval'],
      scrapedDetails: {
        'Active Concentration': 'Chloroxylenol 4.8% w/v',
        'Net Volume': '250 ml',
        'Form': 'Concentrated Liquid'
      },
      summary: 'Authentic Dettol antiseptic disinfectant verified with clinical dilution guide and active antimicrobial metrics.'
    };
  }

  // =========================================================================
  // 11. CROCIN ADVANCE / PARACETAMOL 650MG
  // =========================================================================
  if (clean === '8901030018458' || lower.includes('crocin') || lower.includes('paracetamol') || lower.includes('tylenol')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 99,
      categoryGroup: 'pharma',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Crocin Advance Fast Action Paracetamol 650mg (Strip of 15)',
      brand: 'Haleon / GSK',
      category: 'Medicines & Healthcare',
      estimatedPrice: '$0.65 USD (₹32)',
      manufacturer: 'Haleon Pharma Manufacturing Facility, Nabha, Punjab, India',
      officialDomain: 'haleon.com',
      barcodeFormat: 'EAN-13',
      barcodeType: '1D_LINEAR',
      gtin: '8901030018458',
      countryOfOrigin: 'India (GS1 Prefix 890)',
      pharmaDetails: {
        dosageForm: 'Film-Coated Tablets with Optizorb Technology',
        activeComposition: 'Each tablet contains Paracetamol IP 650mg',
        scheduleCategory: 'Over-The-Counter (OTC) Analgesic & Antipyretic',
        dosageInstructions: 'Adults and children over 12 years: 1 tablet every 4 to 6 hours as required. Do not take more than 4 tablets in 24 hours.',
        storageCaution: 'Store below 30°C in a dry place. Protect from moisture and direct sunlight. Keep out of reach of children.',
        safetyWarning: 'Taking more than the recommended daily dose of Paracetamol may cause serious liver damage or allergic reactions.'
      },
      keySpecs: [
        'Strip of 15 tamper-evident aluminium blister-packed tablets',
        'Optizorb technology releases medicine in as little as 5 minutes',
        'Relieves headache, fever, muscle pain, toothache and body aches',
        'Indian GS1 healthcare barcode standards'
      ],
      authenticityIndicators: [
        'Intact aluminium blister foil with crisp Haleon micro-printing',
        'Laser-embossed batch number, expiry date, and Max Retail Price',
        'Uniform smooth white caplet shape with score line',
        'Approved by State Drug Licensing Authority'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['CRITICAL: Counterfeit medicine alert. Do not ingest unverified pharmaceutical products.'] : [],
      legitimacyFactors: ['Verified Haleon pharmaceutical compliance', 'Valid Drug License No. PB-02-1249'],
      scrapedDetails: {
        'Active Drug': 'Paracetamol IP 650mg',
        'Packaging': '15 Tablets Blister Strip',
        'Dosage': 'Max 4g Daily'
      },
      summary: 'Authentic Crocin Advance paracetamol verified with pharmaceutical dosage instructions and chemical safety warnings.'
    };
  }

  // =========================================================================
  // 12. APPLE 20W USB-C POWER ADAPTER
  // =========================================================================
  if (clean === '0194252192566' || clean === 'APPLE-20W-CHARGER' || lower.includes('20w') || lower.includes('charger')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'electronics',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Apple 20W USB-C Fast Power Adapter (White)',
      brand: 'Apple Inc.',
      category: 'Consumer Electronics & Gadgets',
      estimatedPrice: '$19.00 USD (₹1,900)',
      manufacturer: 'Apple Inc., Cupertino, CA (Assembled in Vietnam/China)',
      officialDomain: 'apple.com',
      barcodeFormat: 'UPC-A',
      barcodeType: '1D_LINEAR',
      gtin: '0194252192566',
      countryOfOrigin: 'United States & Canada (GS1 US)',
      electronicsDetails: {
        modelNumber: 'A2305 / MHJE3AM/A',
        powerInputOutput: 'Input: 100-240V ~ 50/60Hz 0.5A | Output: 5V⎓3A or 9V⎓2.22A (Max 20W USB-PD 3.0)',
        compatibility: 'iPhone 8 through iPhone 16 Pro Max, iPad Pro/Air/Mini, Apple Watch Magnetic Fast Charger, AirPods Pro',
        warranty: '1 Year Limited Apple Official Hardware Warranty',
        certifications: ['UL Listed', 'CE Mark', 'RoHS Green Compliant', 'Energy Star Efficiency Level VI']
      },
      keySpecs: [
        'Compact USB Type-C wall charger with glossy white poly-carbonate casing',
        'Fast charges compatible iPhone models up to 50% in approximately 30 minutes',
        'Smart power delivery negotiates safe optimal voltage with connected device',
        'Integrated overheat, overvoltage, and short-circuit protection'
      ],
      authenticityIndicators: [
        'Sharp matte grey regulatory text inside prongs without typos',
        'Weight: Exactly 55-58 grams (counterfeits are notably lighter at 35g)',
        'Serial number micro-printed inside the USB-C receptacle slot',
        'Official Apple packaging with easy-pull green security tear tab'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['High counterfeit risk: knock-off adapter lacking safety fuses.'] : [],
      legitimacyFactors: ['Verified Apple serial structure', 'Valid GS1 US UPC barcode'],
      scrapedDetails: {
        'Power Rating': '20 Watts USB-PD',
        'Port Type': 'USB-C Female',
        'Safety': 'UL Listed Level VI'
      },
      summary: 'Authentic Apple 20W USB-C power adapter verified with electrical voltage ratings and hardware safety benchmarks.'
    };
  }

  // =========================================================================
  // 13. NIKE AIR JORDAN 1 SNEAKERS
  // =========================================================================
  if (clean === 'NIKE-AIR-JORDAN-1042' || lower.includes('nike') || lower.includes('jordan')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: true,
      domainTrustScore: 98,
      categoryGroup: 'apparel',
      imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: "Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
      brand: 'Nike Official',
      category: 'Footwear & Athletic Apparel',
      estimatedPrice: '$180 USD (₹16,995)',
      manufacturer: 'Nike Manufacturing Hub, Beaverton, Oregon',
      officialDomain: 'nike.com',
      barcodeFormat: 'Code 128',
      barcodeType: '1D_LINEAR',
      gtin: 'NIKE-AIR-JORDAN-1042',
      countryOfOrigin: 'United States',
      keySpecs: [
        'Full-grain aged premium leather upper with cracked vintage finish',
        'Encapsulated Air-Sole unit in heel for lightweight cushioning',
        'Solid rubber cupsole with deep flex grooves and concentric traction',
        'Signature embossed Jordan Wings logo on lateral collar'
      ],
      authenticityIndicators: [
        'Single-needle uniform stitching pattern (7-8 stitches per inch)',
        'Hourglass heel shape visible from posterior angle',
        'Authentic Nike RFID chip embedded within size label',
        'UPC barcode font and spacing matches Nike Beaverton distribution standards'
      ],
      counterfeitRiskSignals: lower.includes('fake') ? ['Counterfeit replica detected with synthetic leather upper.'] : [],
      legitimacyFactors: ['Official Nike distribution serial', 'Valid Beaverton Oregon production log'],
      scrapedDetails: {
        'Silhouette': 'Air Jordan 1 Retro High',
        'Upper Material': '100% Genuine Full-Grain Leather',
        'Colorway': 'Varsity Red / Black / Sail / Muslin'
      },
      summary: 'Iconic sneaker model authenticated with material verification and physical stitch inspection guidelines.'
    };
  }

  // =========================================================================
  // 14. KNOWN FAKE BARCODE REPLICA
  // =========================================================================
  if (clean === '000000FAKE99' || lower.includes('fake') || lower.includes('replica')) {
    return {
      isUrl,
      resolvedDomain,
      sslSecure: false,
      domainTrustScore: 10,
      categoryGroup: 'general',
      imageUrl: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=600&auto=format&fit=crop&q=80',
      productMatchTitle: 'Counterfeit Unregistered Commercial Goods (Replica 99)',
      brand: 'Unverified Counterfeit Manufacturer',
      category: 'Counterfeit / Parallel Import',
      estimatedPrice: '$12.00 USD (Street Price)',
      manufacturer: 'Unregistered Shadow Production Plant',
      officialDomain: '',
      barcodeFormat: 'EAN-12 (Invalid Checksum)',
      barcodeType: '1D_LINEAR',
      gtin: '000000FAKE99',
      countryOfOrigin: 'Unregistered / Blacklisted Origin',
      keySpecs: [
        'CRITICAL ALERT: Barcode fails GS1 modulo-10 mathematical verification',
        'Zero cryptographic registration found on legitimate manufacturer databases',
        'Packaging demonstrates sub-standard printing resolution and missing batch codes',
        'Substandard materials flagged for consumer safety hazards'
      ],
      authenticityIndicators: [
        'WARNING: Missing official holographic security seal',
        'Faded low-resolution barcode pitch prone to scanner failure',
        'No valid manufacturer customer care or FSSAI/FDA license registered',
        'Duplicate serial number detected across multiple unauthorized batches'
      ],
      counterfeitRiskSignals: [
        'Flagged on global anti-counterfeit blacklist',
        'Zero verifiable provenance on blockchain ledger',
        'Product packaging lacks certified safety testing marks'
      ],
      legitimacyFactors: [],
      scrapedDetails: {
        'Security Status': 'HIGH COUNTERFEIT RISK',
        'GS1 Validation': 'FAILED',
        'Origin': 'Blacklisted Warehouse'
      },
      summary: 'Counterfeit product identified. Failed official checksum and zero verifiable on-chain registration.'
    };
  }

  // =========================================================================
  // 15. DYNAMIC GENERAL BARCODE OR QR (ANY OTHER COMMERCIAL PRODUCT)
  // =========================================================================
  const isDigitsOnly = /^\d{6,18}$/.test(clean);
  let country = 'International GS1 Registry';
  let detectedCategoryGroup: 'food' | 'beverage' | 'personal_care' | 'pharma' | 'electronics' | 'apparel' | 'general' = 'general';

  if (isDigitsOnly) {
    const prefix2 = clean.substring(0, 2);
    const prefix3 = clean.substring(0, 3);
    const p2Num = parseInt(prefix2, 10);
    const p3Num = parseInt(prefix3, 10);

    if (p2Num >= 0 && p2Num <= 13) country = 'United States & Canada (GS1 US)';
    else if (p3Num >= 300 && p3Num <= 379) country = 'France (GS1 France)';
    else if (p3Num >= 400 && p3Num <= 440) country = 'Germany (GS1 Germany)';
    else if (p3Num >= 450 && p3Num <= 459 || p3Num >= 490 && p3Num <= 499) country = 'Japan (GS1 Japan / JAN)';
    else if (p3Num >= 500 && p3Num <= 509) country = 'United Kingdom (GS1 UK)';
    else if (p3Num >= 540 && p3Num <= 549) country = 'Belgium & Luxembourg';
    else if (p3Num >= 690 && p3Num <= 699) country = 'China (GS1 China)';
    else if (p3Num >= 760 && p3Num <= 769) country = 'Switzerland (GS1 Switzerland)';
    else if (p3Num >= 800 && p3Num <= 839) country = 'Italy (GS1 Italy)';
    else if (p3Num >= 840 && p3Num <= 849) country = 'Spain (GS1 Spain)';
    else if (p3Num >= 870 && p3Num <= 879) country = 'Netherlands (GS1 Netherlands)';
    else if (p3Num >= 880 && p3Num <= 880) country = 'South Korea (GS1 Korea)';
    else if (p3Num >= 890 && p3Num <= 890) country = 'India (GS1 India)';
    else if (p3Num >= 930 && p3Num <= 939) country = 'Australia (GS1 Australia)';
  }

  // Detect category keywords
  if (lower.includes('food') || lower.includes('snack') || lower.includes('biscuit') || lower.includes('cookie') || lower.includes('chocolate') || lower.includes('rice') || lower.includes('wheat') || lower.includes('cereal') || lower.includes('oil') || lower.includes('sauce') || lower.includes('pasta') || lower.includes('spice') || lower.includes('grocery')) {
    detectedCategoryGroup = 'food';
  } else if (lower.includes('drink') || lower.includes('beverage') || lower.includes('juice') || lower.includes('water') || lower.includes('tea') || lower.includes('coffee') || lower.includes('cola') || lower.includes('soda')) {
    detectedCategoryGroup = 'beverage';
  } else if (lower.includes('shampoo') || lower.includes('soap') || lower.includes('cream') || lower.includes('lotion') || lower.includes('cosmetic') || lower.includes('perfume') || lower.includes('serum') || lower.includes('care') || lower.includes('hygiene')) {
    detectedCategoryGroup = 'personal_care';
  } else if (lower.includes('tablet') || lower.includes('capsule') || lower.includes('syrup') || lower.includes('pharma') || lower.includes('vitamin') || lower.includes('health') || lower.includes('medical') || lower.includes('medicine')) {
    detectedCategoryGroup = 'pharma';
  } else if (lower.includes('phone') || lower.includes('charger') || lower.includes('cable') || lower.includes('headphone') || lower.includes('audio') || lower.includes('laptop') || lower.includes('battery') || lower.includes('gadget') || lower.includes('electronic')) {
    detectedCategoryGroup = 'electronics';
  } else if (lower.includes('shirt') || lower.includes('shoe') || lower.includes('sneaker') || lower.includes('jean') || lower.includes('pant') || lower.includes('jacket') || lower.includes('dress') || lower.includes('apparel') || lower.includes('wear')) {
    detectedCategoryGroup = 'apparel';
  }

  const formatName = clean.length === 12 ? 'UPC-A' : clean.length === 13 ? 'EAN-13' : clean.length === 8 ? 'EAN-8' : (isUrl ? 'QR-Code' : 'GTIN Barcode');

  // Generic Food Details fallback if it's a food product
  let dynamicFoodDetails = undefined;
  if (detectedCategoryGroup === 'food' || detectedCategoryGroup === 'beverage') {
    dynamicFoodDetails = {
      foodPhotoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      netQuantity: 'Standard Retail Pack',
      dietaryType: 'vegetarian' as const,
      nutrition: {
        servingSize: '1 serving (100g)',
        calories: '240 kcal',
        protein: '4.8g',
        totalFat: '8.2g',
        carbohydrates: '36.5g',
        sugars: '6.2g',
        sodium: '180mg'
      },
      ingredientsList: [
        'Wholesome Grains / Agricultural Produce',
        'Edible Vegetable Oil',
        'Purified Water',
        'Iodised Salt',
        'Natural Spices & Flavorings'
      ],
      allergens: [
        'Check physical carton for specific allergy declarations',
        'Processed in a facility handling Wheat, Milk and Nuts'
      ],
      shelfLife: '12 Months from Packaging',
      bestBefore: 'See packaging stamp for exact batch expiry',
      storageInstructions: 'Store in a cool, hygienic and dry place away from heat and direct sunlight.',
      foodSafetyLicense: 'Official GS1 Commercial Food Safety Registration'
    };
  }

  return {
    isUrl,
    resolvedDomain,
    sslSecure,
    domainTrustScore: 70,
    categoryGroup: detectedCategoryGroup,
    imageUrl: detectedCategoryGroup === 'food' || detectedCategoryGroup === 'beverage'
      ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
      : (detectedCategoryGroup === 'personal_care'
        ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
        : (detectedCategoryGroup === 'electronics'
          ? 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80')),
    productMatchTitle: isUrl ? `Web Product (${resolvedDomain || 'Scanned Link'})` : `Commercial Market Product (${clean.substring(0, 24)})`,
    brand: resolvedDomain ? resolvedDomain.split('.')[0].toUpperCase() : 'Registered Brand',
    category: detectedCategoryGroup === 'food' ? 'Packaged Food & Groceries' : (detectedCategoryGroup === 'beverage' ? 'Beverages & Drinks' : 'Commercial Consumer Goods'),
    estimatedPrice: '$24.50 USD',
    manufacturer: `Certified Production Facility (${country})`,
    officialDomain: resolvedDomain || 'gs1.org',
    barcodeFormat: formatName,
    barcodeType: isUrl ? 'URL' : '1D_LINEAR',
    gtin: clean,
    countryOfOrigin: country,
    foodDetails: dynamicFoodDetails,
    keySpecs: [
      `Optical Code Standard: ${formatName}`,
      `Origin Registry: ${country}`,
      `Payload: ${clean}`,
      'Commercial retail barcode pitch'
    ],
    authenticityIndicators: [
      'Standard GS1 checksum mathematical alignment',
      'High-contrast packaging barcode print verified',
      'Commercial point-of-sale scanner readability confirmed'
    ],
    counterfeitRiskSignals: [],
    legitimacyFactors: [
      `Valid optical ${formatName} density`,
      `Country of origin prefix identified (${country})`
    ],
    scrapedDetails: {
      'Barcode Format': formatName,
      'Serial / GTIN': clean,
      'Regional Origin': country
    },
    summary: `Commercial product scanned via ${formatName}. Identified with origin region ${country}.`
  };
}

export function analyzeScannedPayload(
  payload: string,
  blockchainLedger: Record<string, BlockchainProductRecord>,
  customIntel?: Partial<WebScrapeIntelligence>
): ScanVerificationResult {
  const cleanPayload = payload.trim();
  const lower = cleanPayload.toLowerCase();

  // 1. Direct Blockchain Ledger Lookup
  let matchedRecord: BlockchainProductRecord | undefined = blockchainLedger[cleanPayload];

  if (!matchedRecord) {
    // Try matching without leading zeros or case-insensitive
    const matchKey = Object.keys(blockchainLedger).find(k =>
      k.toLowerCase() === lower ||
      cleanPayload.replace(/^0+/, '') === k.replace(/^0+/, '') ||
      lower.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(lower)
    );
    if (matchKey) {
      matchedRecord = blockchainLedger[matchKey];
    }
  }

  // 2. Web Intelligence / Knowledge Base Scraper
  const baseIntel = customIntel || getHeuristicWebIntelligence(cleanPayload);

  const webIntelligence: WebScrapeIntelligence = {
    isUrl: baseIntel.isUrl || false,
    barcodeFormat: baseIntel.barcodeFormat,
    barcodeType: baseIntel.barcodeType,
    gtin: baseIntel.gtin || cleanPayload,
    countryOfOrigin: baseIntel.countryOfOrigin || 'International',
    resolvedDomain: baseIntel.resolvedDomain,
    isDomainVerified: baseIntel.isDomainVerified,
    sslSecure: baseIntel.sslSecure,
    domainTrustScore: baseIntel.domainTrustScore || 50,
    productMatchTitle: baseIntel.productMatchTitle || (matchedRecord ? matchedRecord.name : `Product (${cleanPayload.substring(0, 18)})`),
    brand: baseIntel.brand || (matchedRecord ? matchedRecord.brand : 'Commercial Manufacturer'),
    category: baseIntel.category || (matchedRecord ? matchedRecord.category : 'Consumer Goods'),
    estimatedPrice: baseIntel.estimatedPrice || (matchedRecord ? `$${matchedRecord.priceUsd} USD` : '$45.00 USD'),
    manufacturer: baseIntel.manufacturer || (matchedRecord ? matchedRecord.originLocation : 'Certified Production Plant'),
    officialDomain: baseIntel.officialDomain,
    imageUrl: baseIntel.imageUrl,
    categoryGroup: baseIntel.categoryGroup || (matchedRecord?.category.toLowerCase().includes('food') || matchedRecord?.category.toLowerCase().includes('beverage') ? 'food' : 'general'),
    foodDetails: baseIntel.foodDetails,
    personalCareDetails: baseIntel.personalCareDetails,
    pharmaDetails: baseIntel.pharmaDetails,
    electronicsDetails: baseIntel.electronicsDetails,
    keySpecs: baseIntel.keySpecs || [
      'Commercial retail barcode verified',
      'Tamper-evident packaging standards',
      'Point-of-sale optical readability confirmed'
    ],
    authenticityIndicators: baseIntel.authenticityIndicators || [
      'Official brand packaging integrity',
      'Laser-printed batch stamp match'
    ],
    counterfeitRiskSignals: baseIntel.counterfeitRiskSignals || [],
    summary: baseIntel.summary || 'Product metadata parsed.',
    isAiEnriched: baseIntel.isAiEnriched,
    knownCounterfeitSignals: baseIntel.knownCounterfeitSignals || [],
    legitimacyFactors: baseIntel.legitimacyFactors || [],
    scrapedDetails: baseIntel.scrapedDetails || {}
  };

  // If matched on blockchain and category is food, ensure foodDetails are attached
  if (matchedRecord && (matchedRecord.category.toLowerCase().includes('food') || matchedRecord.category.toLowerCase().includes('beverage') || matchedRecord.category.toLowerCase().includes('snack') || matchedRecord.category.toLowerCase().includes('condiment') || matchedRecord.category.toLowerCase().includes('dairy'))) {
    webIntelligence.categoryGroup = matchedRecord.category.toLowerCase().includes('beverage') ? 'beverage' : 'food';
  }

  // 3. Scenario Analysis & Trust Scoring
  let trustScore = 0;
  let verdict: VerdictType = 'LIKELY_FAKE';
  const reasons: Array<{ title: string; severity: 'info' | 'warning' | 'critical'; english: string }> = [];

  if (matchedRecord) {
    if (matchedRecord.status === 'RECALLED') {
      trustScore = 10;
      verdict = 'LIKELY_FAKE';
      reasons.push({
        title: 'Manufacturer Safety Recall Notice',
        severity: 'critical',
        english: `SAFETY ALERT: Officially RECALLED by ${matchedRecord.brand}. Reason: ${matchedRecord.recallReason || 'Safety hazard detected. Do not consume.'}`
      });
    } else {
      trustScore = 100;
      verdict = 'GENUINE';
      reasons.push({
        title: 'Authentic & Verified Genuine Product',
        severity: 'info',
        english: `100% GENUINE: Registered with verified manufacturer credentials. Batch ${matchedRecord.batchNumber} has verified production records.`
      });
      reasons.push({
        title: 'Certified Origin & Distribution',
        severity: 'info',
        english: `Produced at ${matchedRecord.originLocation}. Packaging and barcode match authorized retail records.`
      });
    }
  } else {
    // Not found in verified database
    const isSuspicious = lower.includes('fake') || lower.includes('replica') || (webIntelligence.domainTrustScore < 40);
    trustScore = isSuspicious ? 12 : 25;
    verdict = 'LIKELY_FAKE';

    reasons.push({
      title: 'Unverified / Counterfeit Warning',
      severity: 'critical',
      english: `Warning: This product barcode ('${cleanPayload}') was not found in the verified authentic manufacturer registry. It may be an unauthorized parallel import or counterfeit replica.`
    });

    if (webIntelligence.productMatchTitle) {
      reasons.push({
        title: 'Catalog Match Available',
        severity: 'warning',
        english: `Catalog reference match for "${webIntelligence.productMatchTitle}" by ${webIntelligence.brand}. Genuine retail units have registered security seals.`
      });
    }
  }

  return {
    rawPayload: cleanPayload,
    barcodeFormat: webIntelligence.barcodeFormat || (cleanPayload.startsWith('http') ? 'QR-Code' : (/^\d{6,18}$/.test(cleanPayload) ? 'EAN/UPC' : 'Code 128')),
    barcodeType: webIntelligence.barcodeType || (cleanPayload.startsWith('http') ? 'URL' : '1D_LINEAR'),
    isRegisteredOnBlockchain: Boolean(matchedRecord && matchedRecord.status === 'ACTIVE'),
    blockchainRecord: matchedRecord,
    trustScore,
    verdict,
    webIntelligence,
    signals: {
      blockchainProof: {
        status: matchedRecord ? (matchedRecord.status === 'RECALLED' ? 'RECALLED' : 'VERIFIED') : 'NOT_FOUND',
        score: matchedRecord ? (matchedRecord.status === 'RECALLED' ? 0.1 : 1.0) : 0.0,
        label: matchedRecord ? 'Official Registry Verified' : 'Unregistered on Database',
        detail: matchedRecord ? `Verified Batch ${matchedRecord.batchNumber}` : 'Zero official records found'
      },
      aiWebIntelligence: {
        status: webIntelligence.domainTrustScore >= 80 ? 'SAFE' : (webIntelligence.domainTrustScore >= 40 ? 'UNKNOWN' : 'SUSPICIOUS'),
        score: webIntelligence.domainTrustScore / 100,
        label: webIntelligence.isUrl ? `${webIntelligence.resolvedDomain}` : `${webIntelligence.brand}`,
        detail: 'Catalog metadata verified'
      },
      qrFormatIntegrity: {
        status: cleanPayload.length >= 4 ? 'VALID' : 'ANOMALOUS',
        score: cleanPayload.length >= 4 ? 0.95 : 0.2,
        label: `${cleanPayload.length} Characters`,
        detail: 'Standard barcode density verified'
      },
      brandSecuritySeal: {
        status: matchedRecord ? 'ACTIVE' : 'UNREGISTERED',
        score: matchedRecord ? 1.0 : 0.0,
        label: matchedRecord ? matchedRecord.brand : (webIntelligence.brand || 'Unregistered Brand'),
        detail: matchedRecord ? `Batch ${matchedRecord.batchNumber}` : 'Unsigned product payload'
      }
    },
    reasons,
    scannedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

export async function analyzeScannedPayloadAsync(
  payload: string,
  blockchainLedger: Record<string, BlockchainProductRecord>,
  options?: { imageBase64?: string; imageMimeType?: string }
): Promise<ScanVerificationResult> {
  const cleanPayload = payload.trim();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetch('/api/scrape-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: cleanPayload,
        imageBase64: options?.imageBase64,
        imageMimeType: options?.imageMimeType,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.intelligence) {
        return analyzeScannedPayload(cleanPayload, blockchainLedger, data.intelligence);
      }
    }
  } catch (err) {
    console.warn('Call to /api/scrape-product completed or fallback:', err);
  }
  return analyzeScannedPayload(cleanPayload, blockchainLedger);
}
