import QRCode from 'qrcode';
import { BlockchainProductRecord, BlockchainBlock } from '../types';

export const CONTRACT_ADDRESS = '0x44799f622867431da06355bf70d3c461';

// SHA-256 helper using subtle crypto
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial Blockchain Blocks
export const INITIAL_BLOCKS: BlockchainBlock[] = [
  {
    blockNumber: 14818,
    blockHash: '0x1c8b9a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    prevBlockHash: '0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    timestamp: '20 Oct 2026 09:12:30 UTC',
    txCount: 4,
    miner: '0xValidatorNodeTokyo#02',
    merkleRoot: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
  },
  {
    blockNumber: 14819,
    blockHash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    prevBlockHash: '0x1c8b9a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    timestamp: '20 Oct 2026 22:45:10 UTC',
    txCount: 2,
    miner: '0xValidatorNodeLondon#03',
    merkleRoot: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
  },
  {
    blockNumber: 14820,
    blockHash: '0x3f9e8a7b1c4d2e5f6a0b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    prevBlockHash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    timestamp: '21 Oct 2026 10:14:02 UTC',
    txCount: 3,
    miner: '0xValidatorNodeZurich#01',
    merkleRoot: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d'
  },
  {
    blockNumber: 14821,
    blockHash: '0x8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c',
    prevBlockHash: '0x3f9e8a7b1c4d2e5f6a0b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    timestamp: '21 Oct 2026 11:30:45 UTC',
    txCount: 4,
    miner: '0xValidatorNodeSanFrancisco#04',
    merkleRoot: '0x9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f'
  }
];

// Initial pre-registered products on blockchain (Global products in USD)
export const INITIAL_LEDGER: Record<string, BlockchainProductRecord> = {
  'NIKE-AIR-JORDAN-1042': {
    tokenId: 'NIKE-AIR-JORDAN-1042',
    name: 'Nike Air Jordan 1 Retro High OG (Chicago Edition)',
    brand: 'Nike Official',
    category: 'Footwear & Fashion',
    batchNumber: 'BATCH-NK-2026-CH',
    manufacturingDate: '15 Aug 2026',
    expiryDate: 'N/A (Durable Good)',
    priceUsd: 180,
    mrpInr: 14900,
    originLocation: 'Nike Manufacturing Hub, Portland, OR',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x7f2a89c1b4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    mintedAt: '21 Oct 2026 10:14:02 UTC'
  },
  '0194252033012': {
    tokenId: '0194252033012',
    name: 'Apple iPhone 16 Pro Max 256GB - Natural Titanium',
    brand: 'Apple Inc.',
    category: 'Smartphones & Mobile Devices',
    batchNumber: 'BATCH-APL-16P-2026',
    manufacturingDate: '01 Sep 2026',
    expiryDate: 'N/A (RoHS Certified)',
    priceUsd: 1199,
    mrpInr: 144900,
    originLocation: 'Apple Park & Foxconn Precision Facility, Cupertino, CA',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d',
    mintedAt: '21 Oct 2026 11:32:00 UTC'
  },
  'APPLE-20W-CHARGER': {
    tokenId: 'APPLE-20W-CHARGER',
    name: 'Apple 20W USB-C Power Adapter',
    brand: 'Apple Inc.',
    category: 'Consumer Electronics',
    batchNumber: 'APL-20W-2026-Q3',
    manufacturingDate: '10 Sep 2026',
    expiryDate: 'N/A (RoHS Certified)',
    priceUsd: 29,
    mrpInr: 2400,
    originLocation: 'Foxconn Certified Facility, Cupertino, CA',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a',
    mintedAt: '21 Oct 2026 11:31:12 UTC'
  },
  '5000112637939': {
    tokenId: '5000112637939',
    name: 'Coca-Cola Original Taste 330ml Can',
    brand: 'The Coca-Cola Company',
    category: 'Beverages & FMCG',
    batchNumber: 'BATCH-CC-330-LON',
    manufacturingDate: '12 Oct 2026',
    expiryDate: '12 Oct 2027',
    priceUsd: 2,
    mrpInr: 60,
    originLocation: 'Coca-Cola European Bottling Plant, London, United Kingdom',
    status: 'ACTIVE',
    blockNumber: 14819,
    txHash: '0x8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b',
    mintedAt: '20 Oct 2026 22:45:10 UTC'
  },
  '4902370542912': {
    tokenId: '4902370542912',
    name: 'Nintendo Switch - OLED Model (White Joy-Con)',
    brand: 'Nintendo',
    category: 'Gaming Consoles & Electronics',
    batchNumber: 'BATCH-NTD-OLED-JP',
    manufacturingDate: '14 Jul 2026',
    expiryDate: 'N/A (Consumer Hardware)',
    priceUsd: 349,
    mrpInr: 32990,
    originLocation: 'Nintendo Production Plant, Kyoto, Japan',
    status: 'ACTIVE',
    blockNumber: 14818,
    txHash: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d',
    mintedAt: '20 Oct 2026 09:12:30 UTC'
  },
  '8806091234567': {
    tokenId: '8806091234567',
    name: 'Samsung Galaxy S24 Ultra 5G 512GB - Titanium Black',
    brand: 'Samsung Electronics',
    category: 'Smartphones & Mobile Devices',
    batchNumber: 'BATCH-SMS-S24U-KR',
    manufacturingDate: '28 Aug 2026',
    expiryDate: 'N/A (RoHS Certified)',
    priceUsd: 1299,
    mrpInr: 139999,
    originLocation: 'Samsung Smart City Production Facility, Gumi, South Korea',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    mintedAt: '21 Oct 2026 10:15:30 UTC'
  },
  'SONY-WH1000XM5-BLK': {
    tokenId: 'SONY-WH1000XM5-BLK',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    brand: 'Sony Electronics',
    category: 'Consumer Electronics',
    batchNumber: 'BATCH-SN-2026-XM5',
    manufacturingDate: '02 Feb 2026',
    expiryDate: 'N/A (Consumer Tech)',
    priceUsd: 399,
    mrpInr: 33000,
    originLocation: 'Sony Acoustic Lab, Tokyo, Japan',
    status: 'ACTIVE',
    blockNumber: 14818,
    txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    mintedAt: '20 Oct 2026 09:14:00 UTC'
  },
  'ROLEX-SUBMARINER-126610': {
    tokenId: 'ROLEX-SUBMARINER-126610',
    name: 'Rolex Submariner Date 41mm Oystersteel',
    brand: 'Rolex Geneva',
    category: 'Luxury Goods',
    batchNumber: 'ROLEX-GEN-SUB-41',
    manufacturingDate: '18 Jan 2026',
    expiryDate: 'N/A (Perpetual Chronometer)',
    priceUsd: 10250,
    mrpInr: 850000,
    originLocation: 'Manufacture des Montres Rolex, Geneva, Switzerland',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x1c8b9a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c',
    mintedAt: '21 Oct 2026 10:16:15 UTC'
  },
  '7622210884848': {
    tokenId: '7622210884848',
    name: 'Oreo Original Chocolate Sandwich Cookies (120g Pack)',
    brand: 'Oreo / Mondelēz International',
    category: 'Packaged Food & Snacks',
    batchNumber: 'BATCH-OREO-2026-B8',
    manufacturingDate: '10 Aug 2026',
    expiryDate: '10 May 2027 (9 Months)',
    priceUsd: 2.25,
    mrpInr: 40,
    originLocation: 'Mondelēz Certified Bakery Hub, Sheffield, UK',
    status: 'ACTIVE',
    blockNumber: 14819,
    txHash: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e',
    mintedAt: '20 Oct 2026 22:50:00 UTC'
  },
  '8000500179860': {
    tokenId: '8000500179860',
    name: 'Nutella Hazelnut Spread with Cocoa (350g Jar)',
    brand: 'Ferrero / Nutella',
    category: 'Packaged Food & Spreads',
    batchNumber: 'BATCH-NUT-350-ALBA',
    manufacturingDate: '15 Jul 2026',
    expiryDate: '15 Jul 2027 (12 Months)',
    priceUsd: 4.50,
    mrpInr: 395,
    originLocation: 'Ferrero S.p.A. Production Facility, Alba, Italy',
    status: 'ACTIVE',
    blockNumber: 14819,
    txHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b',
    mintedAt: '20 Oct 2026 22:52:10 UTC'
  },
  '5000157024671': {
    tokenId: '5000157024671',
    name: 'Heinz Tomato Ketchup (500g Top-Down Squeeze Bottle)',
    brand: 'Kraft Heinz',
    category: 'Condiments & Sauces',
    batchNumber: 'BATCH-HNZ-500-WIG',
    manufacturingDate: '01 Sep 2026',
    expiryDate: '01 Mar 2028 (18 Months)',
    priceUsd: 3.20,
    mrpInr: 180,
    originLocation: 'Heinz Kitt Green Food Plant, Wigan, Greater Manchester, UK',
    status: 'ACTIVE',
    blockNumber: 14819,
    txHash: '0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a',
    mintedAt: '20 Oct 2026 22:55:00 UTC'
  },
  '8901058852898': {
    tokenId: '8901058852898',
    name: 'Maggi 2-Minute Masala Instant Noodles (70g Single Pack)',
    brand: 'Nestlé / Maggi',
    category: 'Packaged Food & Noodles',
    batchNumber: 'BATCH-MAG-2026-N1',
    manufacturingDate: '25 Aug 2026',
    expiryDate: '25 May 2027 (9 Months)',
    priceUsd: 0.35,
    mrpInr: 14,
    originLocation: 'Nestlé Food Processing Plant, Moga, Punjab, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f',
    mintedAt: '21 Oct 2026 10:20:00 UTC'
  },
  '8901262010058': {
    tokenId: '8901262010058',
    name: 'Amul Pasteurised Pure Dairy Salted Butter (100g Carton)',
    brand: 'Amul (GCMMF)',
    category: 'Dairy & Refrigerated Foods',
    batchNumber: 'BATCH-AML-BUT-ANAND',
    manufacturingDate: '01 Oct 2026',
    expiryDate: '01 Apr 2027 (6 Months)',
    priceUsd: 0.70,
    mrpInr: 58,
    originLocation: 'Amul Dairy Plant, Anand, Gujarat, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e',
    mintedAt: '21 Oct 2026 10:22:00 UTC'
  },
  '8901262010881': {
    tokenId: '8901262010881',
    name: 'Amul Dark Chocolate (55% Rich Cocoa, 150g Bar)',
    brand: 'Amul (GCMMF)',
    category: 'Chocolates & Confectionery',
    batchNumber: 'BATCH-AML-DRK-55',
    manufacturingDate: '05 Sep 2026',
    expiryDate: '05 Sep 2027 (12 Months)',
    priceUsd: 1.35,
    mrpInr: 110,
    originLocation: 'Amul Chocolate Plant, Mogar, Anand, Gujarat, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    mintedAt: '21 Oct 2026 10:23:00 UTC'
  },
  '8901262010898': {
    tokenId: '8901262010898',
    name: "Amul Nut 'N' Bar Roasted Almond Chocolate (150g Bar)",
    brand: 'Amul (GCMMF)',
    category: 'Chocolates & Confectionery',
    batchNumber: 'BATCH-AML-NUT-BAR',
    manufacturingDate: '10 Sep 2026',
    expiryDate: '10 Sep 2027 (12 Months)',
    priceUsd: 1.45,
    mrpInr: 120,
    originLocation: 'Amul Chocolate Plant, Mogar, Anand, Gujarat, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    mintedAt: '21 Oct 2026 10:23:30 UTC'
  },
  '8901262010904': {
    tokenId: '8901262010904',
    name: "Amul Fruit 'N' Nut Dark Chocolate Bar (150g)",
    brand: 'Amul (GCMMF)',
    category: 'Chocolates & Confectionery',
    batchNumber: 'BATCH-AML-FRT-NUT',
    manufacturingDate: '12 Sep 2026',
    expiryDate: '12 Sep 2027 (12 Months)',
    priceUsd: 1.45,
    mrpInr: 120,
    originLocation: 'Amul Chocolate Plant, Mogar, Anand, Gujarat, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    mintedAt: '21 Oct 2026 10:23:45 UTC'
  },
  '7622201441814': {
    tokenId: '7622201441814',
    name: 'Cadbury Dairy Milk Silk Oreo Chocolate Bar (130g)',
    brand: 'Cadbury / Mondelēz International',
    category: 'Chocolates & Confectionery',
    batchNumber: 'BATCH-MDZ-SLK-OREO',
    manufacturingDate: '01 Sep 2026',
    expiryDate: '01 Jun 2027 (9 Months)',
    priceUsd: 1.15,
    mrpInr: 95,
    originLocation: 'Mondelez India Foods, Induri, Pune, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    mintedAt: '21 Oct 2026 10:23:55 UTC'
  },
  '8901491101838': {
    tokenId: '8901491101838',
    name: 'Lay’s Classic Salted Crispy Potato Chips (50g Pack)',
    brand: 'PepsiCo / Lay’s',
    category: 'Packaged Food & Snacks',
    batchNumber: 'BATCH-LAYS-2026-CH',
    manufacturingDate: '12 Sep 2026',
    expiryDate: '12 Jan 2027 (4 Months)',
    priceUsd: 0.30,
    mrpInr: 20,
    originLocation: 'PepsiCo Snack Foods Plant, Channo, Punjab, India',
    status: 'ACTIVE',
    blockNumber: 14820,
    txHash: '0x4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    mintedAt: '21 Oct 2026 10:24:00 UTC'
  },
  '8901314010545': {
    tokenId: '8901314010545',
    name: 'Colgate Total Active Fresh Antibacterial Toothpaste (120g)',
    brand: 'Colgate-Palmolive',
    category: 'Personal Care & Oral Hygiene',
    batchNumber: 'BATCH-COL-TOT-120',
    manufacturingDate: '14 Jun 2026',
    expiryDate: '14 Jun 2028 (24 Months)',
    priceUsd: 1.80,
    mrpInr: 135,
    originLocation: 'Colgate-Palmolive Facility, Sanand, Gujarat, India',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c',
    mintedAt: '21 Oct 2026 11:35:00 UTC'
  },
  '4005808890583': {
    tokenId: '4005808890583',
    name: 'Nivea Soft Light Moisturizing Cream with Vitamin E (100ml)',
    brand: 'Beiersdorf / Nivea',
    category: 'Skincare & Personal Care',
    batchNumber: 'BATCH-NIV-SFT-HAM',
    manufacturingDate: '05 May 2026',
    expiryDate: '05 May 2029 (36 Months)',
    priceUsd: 4.20,
    mrpInr: 299,
    originLocation: 'Beiersdorf AG Production Plant, Hamburg, Germany',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b',
    mintedAt: '21 Oct 2026 11:37:00 UTC'
  },
  '8901396112106': {
    tokenId: '8901396112106',
    name: 'Dettol Original Antiseptic Disinfectant Liquid (250ml)',
    brand: 'Reckitt / Dettol',
    category: 'Healthcare & Antiseptic',
    batchNumber: 'BATCH-DET-250-HOS',
    manufacturingDate: '20 Jul 2026',
    expiryDate: '20 Jul 2029 (36 Months)',
    priceUsd: 2.10,
    mrpInr: 165,
    originLocation: 'Reckitt Benckiser Plant, Hosur, Tamil Nadu, India',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a',
    mintedAt: '21 Oct 2026 11:39:00 UTC'
  },
  '8901030018458': {
    tokenId: '8901030018458',
    name: 'Crocin Advance Fast Action Paracetamol 650mg (Strip of 15)',
    brand: 'Haleon / GSK',
    category: 'Medicines & Healthcare',
    batchNumber: 'BATCH-CRC-650-NAB',
    manufacturingDate: '15 Aug 2026',
    expiryDate: '15 Aug 2028 (24 Months)',
    priceUsd: 0.65,
    mrpInr: 32,
    originLocation: 'Haleon Pharma Manufacturing Facility, Nabha, Punjab, India',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f',
    mintedAt: '21 Oct 2026 11:41:00 UTC'
  },
  '0194252192566': {
    tokenId: '0194252192566',
    name: 'Apple 20W USB-C Fast Power Adapter (White)',
    brand: 'Apple Inc.',
    category: 'Consumer Electronics & Gadgets',
    batchNumber: 'BATCH-APL-20W-USB',
    manufacturingDate: '10 Aug 2026',
    expiryDate: 'N/A (RoHS Certified)',
    priceUsd: 19,
    mrpInr: 1900,
    originLocation: 'Foxconn Precision Hub, Shenzhen & Cupertino, CA',
    status: 'ACTIVE',
    blockNumber: 14821,
    txHash: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    contractAddress: CONTRACT_ADDRESS,
    batchHash: '0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e',
    mintedAt: '21 Oct 2026 11:43:00 UTC'
  }
};

// Generate QR data URLs on startup for pre-registered items
export async function initializeLedgerWithQrs(): Promise<Record<string, BlockchainProductRecord>> {
  const ledger = { ...INITIAL_LEDGER };
  for (const key of Object.keys(ledger)) {
    try {
      ledger[key].qrDataUrl = await QRCode.toDataURL(ledger[key].tokenId, {
        width: 320,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' }
      });
    } catch (err) {
      console.warn('Failed to generate initial QR for', key, err);
    }
  }
  return ledger;
}

// Mint new product onto Blockchain Ledger
export async function mintProductOnChain(
  params: {
    tokenId: string;
    name: string;
    brand: string;
    category: string;
    batchNumber: string;
    priceUsd?: number;
    mrpInr?: number;
    originLocation: string;
    manufacturingDate?: string;
    expiryDate?: string;
  },
  currentLedger: Record<string, BlockchainProductRecord>,
  currentBlocks: BlockchainBlock[]
): Promise<{
  newRecord: BlockchainProductRecord;
  newBlock: BlockchainBlock;
  updatedLedger: Record<string, BlockchainProductRecord>;
  updatedBlocks: BlockchainBlock[];
}> {
  const nextBlockNum = currentBlocks.length > 0 ? currentBlocks[currentBlocks.length - 1].blockNumber + 1 : 14822;
  const rawHashString = `${params.tokenId}-${params.batchNumber}-${Date.now()}`;
  const txHash = await sha256(rawHashString);
  const batchHash = await sha256(`${params.batchNumber}-${params.brand}`);
  const blockHash = await sha256(`block-${nextBlockNum}-${txHash}`);
  const prevBlockHash = currentBlocks[currentBlocks.length - 1]?.blockHash || '0x000000000000000000000000';

  // Generate real scannable QR Code image for the product
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(params.tokenId.trim(), {
      width: 360,
      margin: 2,
      color: { dark: '#020617', light: '#ffffff' }
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
  }

  const effectivePrice = Number(params.priceUsd) || (params.mrpInr ? Math.round(params.mrpInr / 83) : 150);

  const newRecord: BlockchainProductRecord = {
    tokenId: params.tokenId.trim(),
    name: params.name.trim(),
    brand: params.brand.trim(),
    category: params.category || 'Consumer Goods',
    batchNumber: params.batchNumber.trim() || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
    manufacturingDate: params.manufacturingDate || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    expiryDate: params.expiryDate || 'N/A (Durable)',
    priceUsd: effectivePrice,
    mrpInr: effectivePrice * 83,
    originLocation: params.originLocation.trim() || 'San Francisco Distribution Center, CA',
    status: 'ACTIVE',
    blockNumber: nextBlockNum,
    txHash,
    contractAddress: CONTRACT_ADDRESS,
    batchHash,
    mintedAt: new Date().toUTCString(),
    qrDataUrl
  };

  const newBlock: BlockchainBlock = {
    blockNumber: nextBlockNum,
    blockHash,
    prevBlockHash,
    timestamp: new Date().toUTCString(),
    txCount: 1,
    miner: '0xNodeValidatorPrimary#08',
    merkleRoot: await sha256(txHash + batchHash)
  };

  const updatedLedger = {
    ...currentLedger,
    [newRecord.tokenId]: newRecord
  };

  const updatedBlocks = [...currentBlocks, newBlock];

  return {
    newRecord,
    newBlock,
    updatedLedger,
    updatedBlocks
  };
}

export interface ProductMintInput {
  tokenId: string;
  name: string;
  brand: string;
  category?: string;
  batchNumber?: string;
  priceUsd?: number;
  mrpInr?: number;
  originLocation?: string;
  manufacturingDate?: string;
  expiryDate?: string;
}

// Mint a batch of multiple products onto Blockchain Ledger in a single atomic block
export async function mintBatchProductsOnChain(
  items: ProductMintInput[],
  currentLedger: Record<string, BlockchainProductRecord>,
  currentBlocks: BlockchainBlock[]
): Promise<{
  newRecords: BlockchainProductRecord[];
  newBlock: BlockchainBlock;
  updatedLedger: Record<string, BlockchainProductRecord>;
  updatedBlocks: BlockchainBlock[];
}> {
  if (!items || items.length === 0) {
    throw new Error('No items provided for bulk registration.');
  }

  const nextBlockNum = currentBlocks.length > 0 ? currentBlocks[currentBlocks.length - 1].blockNumber + 1 : 14822;
  const prevBlockHash = currentBlocks[currentBlocks.length - 1]?.blockHash || '0x000000000000000000000000';
  const nowUtc = new Date().toUTCString();

  const newRecords: BlockchainProductRecord[] = [];
  const txHashes: string[] = [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const cleanTokenId = item.tokenId.trim();
    const effectiveBatch = item.batchNumber?.trim() || `BATCH-BULK-${nextBlockNum}-${idx + 1}`;
    const rawHashString = `${cleanTokenId}-${effectiveBatch}-${Date.now()}-${idx}`;
    const txHash = await sha256(rawHashString);
    const batchHash = await sha256(`${effectiveBatch}-${item.brand}`);
    txHashes.push(txHash);

    // Generate real scannable QR Code image for each product
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(cleanTokenId, {
        width: 360,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' }
      });
    } catch (err) {
      console.error('Failed to generate QR for bulk item:', cleanTokenId, err);
    }

    const effectivePrice = Number(item.priceUsd) || (item.mrpInr ? Math.round(item.mrpInr / 83) : 120);

    const record: BlockchainProductRecord = {
      tokenId: cleanTokenId,
      name: item.name.trim(),
      brand: item.brand.trim(),
      category: item.category?.trim() || 'Commercial Asset',
      batchNumber: effectiveBatch,
      manufacturingDate: item.manufacturingDate || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: item.expiryDate || 'N/A (Durable)',
      priceUsd: effectivePrice,
      mrpInr: effectivePrice * 83,
      originLocation: item.originLocation?.trim() || 'Verified Regional Distribution Hub',
      status: 'ACTIVE',
      blockNumber: nextBlockNum,
      txHash,
      contractAddress: CONTRACT_ADDRESS,
      batchHash,
      mintedAt: nowUtc,
      qrDataUrl
    };

    newRecords.push(record);
  }

  // Calculate Merkle tree root of all transactions in this block
  const combinedTxString = txHashes.join('');
  const merkleRoot = await sha256(combinedTxString);
  const blockHash = await sha256(`block-${nextBlockNum}-${merkleRoot}-${items.length}`);

  const newBlock: BlockchainBlock = {
    blockNumber: nextBlockNum,
    blockHash,
    prevBlockHash,
    timestamp: nowUtc,
    txCount: items.length,
    miner: '0xNodeValidatorEnterprise#03',
    merkleRoot
  };

  const updatedLedger = { ...currentLedger };
  for (const rec of newRecords) {
    updatedLedger[rec.tokenId] = rec;
  }

  const updatedBlocks = [...currentBlocks, newBlock];

  return {
    newRecords,
    newBlock,
    updatedLedger,
    updatedBlocks
  };
}
