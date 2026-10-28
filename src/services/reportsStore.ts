import {
  CounterfeitReport,
  ReportStatus,
  StrictEnforcementAction,
  StrictActionType
} from '../types';

const STORAGE_KEY = 'trustchain_consumer_reports_v1';

export const INITIAL_REPORTS: CounterfeitReport[] = [
  {
    id: 'REP-2026-89421',
    type: 'counterfeit',
    productName: 'Amul Dark Chocolate (55% Rich Cocoa, 150g)',
    brand: 'Amul / GCMMF',
    variant: 'Dark Chocolate 55% Cocoa (Nut-Less)',
    barcode: '8901262010881',
    batchNumber: 'FAKE-AM-7721',
    photoUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
    description: 'Purchased this chocolate bar at a local roadside kiosk. The packaging wrapper had blurred typography, no golden inner foil, and lacked the FSSAI green vegetarian dot. The chocolate had a chalky texture and smelled like paraffin.',
    userName: 'Rohan Sharma',
    userEmail: 'rohan.sharma92@gmail.com',
    userPhone: '+91 98201-44589',
    distributorLocation: {
      storeName: 'Lucky Mart & Cold Drink Corner',
      streetAddress: 'Shop #14, Opposite Metro Station Gate 3, Andheri West',
      landmark: 'Near Railway Platform 1 Crossing',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400058',
      latitude: 19.1197,
      longitude: 72.8464,
      priceCharged: '₹50 (MRP is ₹110)',
      purchaseDate: '2026-10-26',
      invoiceNumber: 'CASH-REC-092'
    },
    strictAction: {
      actionType: 'FIELD_INSPECTOR',
      actionTitle: 'Enforcement Squad Dispatched to Andheri West',
      actionDate: '2026-10-27T14:30:00Z',
      actionNotes: 'Brand Protection Squad #4 visited Lucky Mart with local Food Safety Officers. Found 48 counterfeit Amul and Cadbury chocolates with counterfeit barcodes. Seized stock and issued Form VII confiscation order.',
      assignedOfficer: 'Inspector V. K. Deshmukh (Zone 4 FDA)',
      legalNoticeNumber: 'AMUL-ENF-MUM-2026-089',
      targetDistributor: 'Lucky Mart & Cold Drink Corner (Andheri West)',
      fineAmount: '₹50,000 + Criminal FIR Filed'
    },
    status: 'INSPECTOR_DISPATCHED',
    manufacturerReply: 'Thank you for reporting this Rohan. Our Mumbai anti-counterfeiting squad investigated the retailer today and seized the fake inventory. Legal proceedings have been initiated against the wholesaler.',
    submittedAt: '2026-10-27T08:15:00Z',
    updatedAt: '2026-10-27T16:00:00Z'
  },
  {
    id: 'REP-2026-78104',
    type: 'damaged',
    productName: 'Cadbury Oreo Original Vanilla Creme (120g)',
    brand: 'Oreo / Mondelēz International',
    variant: 'Original Vanilla Creme 120g Pack',
    barcode: '7622210884848',
    batchNumber: 'LOT-MDZ-9938A',
    photoUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
    description: 'Outer carton was completely torn and moisture had seeped into the foil roll. Cookies inside were crushed and soggy upon opening. Batch code verified as authentic Mondelēz.',
    userName: 'Priya Mehta',
    userEmail: 'priya.m@outlook.com',
    distributorLocation: {
      storeName: 'Highway Supermart Kiosk 7',
      streetAddress: 'NH-48 Toll Plaza Corridor',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122001',
      priceCharged: '₹40',
      purchaseDate: '2026-10-25'
    },
    strictAction: {
      actionType: 'STOCK_SEIZED',
      actionTitle: 'Damaged Transit Lot Quarantined',
      actionDate: '2026-10-26T11:00:00Z',
      actionNotes: 'Transit distributor reported pallet breach during monsoon transit. Replaced batch across retailer network and issued voucher to consumer.',
      assignedOfficer: 'Quality Assurance Team (Mondelēz North)',
      targetDistributor: 'Highway Supermart Kiosk 7'
    },
    status: 'STOCK_SEIZED_RESOLVED',
    manufacturerReply: 'Hello Priya, we deeply apologize for the transit damage. Our logistics team quarantined the damaged transit consignment and credited your store with replacement units. A ₹200 apology voucher has been sent to your email.',
    submittedAt: '2026-10-25T14:22:00Z',
    updatedAt: '2026-10-26T12:00:00Z'
  },
  {
    id: 'REP-2026-90312',
    type: 'counterfeit',
    productName: 'Nutella Hazelnut Spread with Cocoa (350g)',
    brand: 'Nutella / Ferrero',
    variant: '350g Glass Jar',
    barcode: '8000500179860',
    batchNumber: 'FAKE-NT-8812',
    photoUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80',
    description: 'Golden foil seal was loose and printed with low-grade ink. Label had grammatical error in ingredients: "cocao" instead of "cocoa". Purchased at a discount wholesale stall.',
    userName: 'Kunal Verma',
    userEmail: 'kunal.v@gmail.com',
    distributorLocation: {
      storeName: 'Discount Wholesale Depot',
      streetAddress: 'Plot 44, Industrial Area Phase 2',
      landmark: 'Behind Bus Stand',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160002',
      latitude: 30.7046,
      longitude: 76.7179,
      priceCharged: '₹220 (MRP is ₹420)',
      purchaseDate: '2026-10-27'
    },
    strictAction: {
      actionType: 'LEGAL_NOTICE',
      actionTitle: 'Cease & Desist Order Issued to Unlicensed Wholesaler',
      actionDate: '2026-10-28T02:00:00Z',
      actionNotes: 'Legal counsel issued formal Cease & Desist notice demanding disclosure of unauthorized manufacturer/supplier within 48 hours.',
      assignedOfficer: 'Adv. S. Ramanathan (Ferrero Legal IP Cell)',
      legalNoticeNumber: 'FERR-IP-DEL-2026-441',
      targetDistributor: 'Discount Wholesale Depot (Chandigarh)',
      fineAmount: '₹5,00,000 Damages Claim'
    },
    status: 'LEGAL_ACTION_INITIATED',
    manufacturerReply: 'Ferrero Brand Protection has logged your report. The barcode and lot number provided are counterfeit replicas not manufactured in our Alba or Baramati factories. Legal counsel has served a Cease & Desist notice.',
    submittedAt: '2026-10-27T19:40:00Z',
    updatedAt: '2026-10-28T02:30:00Z'
  }
];

export function getStoredReports(): CounterfeitReport[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPORTS;
  } catch {
    return INITIAL_REPORTS;
  }
}

export function saveReports(reports: CounterfeitReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save reports to localStorage:', e);
  }
}

export function createNewReport(
  data: Omit<CounterfeitReport, 'id' | 'submittedAt' | 'updatedAt' | 'status'>
): CounterfeitReport {
  const current = getStoredReports();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const now = new Date().toISOString();

  const newReport: CounterfeitReport = {
    ...data,
    id: `REP-2026-${randomSuffix}`,
    status: 'SUBMITTED',
    submittedAt: now,
    updatedAt: now
  };

  const updated = [newReport, ...current];
  saveReports(updated);
  return newReport;
}

export function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  manufacturerReply?: string
): CounterfeitReport | null {
  const current = getStoredReports();
  let found: CounterfeitReport | null = null;

  const updated = current.map((r) => {
    if (r.id === reportId) {
      found = {
        ...r,
        status: newStatus,
        manufacturerReply: manufacturerReply !== undefined ? manufacturerReply : r.manufacturerReply,
        updatedAt: new Date().toISOString()
      };
      return found;
    }
    return r;
  });

  if (found) {
    saveReports(updated);
  }
  return found;
}

export function applyStrictActionToReport(
  reportId: string,
  action: StrictEnforcementAction
): CounterfeitReport | null {
  const current = getStoredReports();
  let found: CounterfeitReport | null = null;

  let newStatus: ReportStatus = 'UNDER_INVESTIGATION';
  if (action.actionType === 'LEGAL_NOTICE') newStatus = 'LEGAL_ACTION_INITIATED';
  else if (action.actionType === 'FIELD_INSPECTOR') newStatus = 'INSPECTOR_DISPATCHED';
  else if (action.actionType === 'STOCK_SEIZED') newStatus = 'STOCK_SEIZED_RESOLVED';
  else if (action.actionType === 'BLACKLISTED') newStatus = 'LEGAL_ACTION_INITIATED';
  else if (action.actionType === 'POLICE_ESCALATION') newStatus = 'LEGAL_ACTION_INITIATED';

  const updated = current.map((r) => {
    if (r.id === reportId) {
      found = {
        ...r,
        strictAction: action,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      return found;
    }
    return r;
  });

  if (found) {
    saveReports(updated);
  }
  return found;
}
