import React, { useState, useRef } from 'react';
import { BlockchainProductRecord, BlockchainBlock } from '../types';
import { mintProductOnChain, mintBatchProductsOnChain, ProductMintInput } from '../services/blockchainLedger';

interface BulkRowItem {
  id: string;
  tokenId: string;
  name: string;
  brand: string;
  category: string;
  batchNumber: string;
  priceUsd: number;
  originLocation: string;
}

const DEMO_BATCH_PRESET: BulkRowItem[] = [
  {
    id: 'demo-1',
    tokenId: 'SONY-WH1000-XM5',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    brand: 'Sony Corporation',
    category: 'Consumer Electronics',
    batchNumber: 'BATCH-SNY-2026-Q4',
    priceUsd: 399,
    originLocation: 'Sony Production Plant, Minato, Tokyo, Japan'
  },
  {
    id: 'demo-2',
    tokenId: 'DYSON-HD16-2026',
    name: 'Dyson Supersonic Nural Hair Dryer (Ceramic Patina)',
    brand: 'Dyson',
    category: 'Consumer Goods',
    batchNumber: 'BATCH-DYS-HD16-01',
    priceUsd: 499,
    originLocation: 'Dyson Advanced Engineering Hub, Malmesbury, UK'
  },
  {
    id: 'demo-3',
    tokenId: 'BOSE-QCU-9021',
    name: 'Bose QuietComfort Ultra Spatial Audio Earbuds',
    brand: 'Bose',
    category: 'Consumer Electronics',
    batchNumber: 'BATCH-BSE-QCU-26',
    priceUsd: 299,
    originLocation: 'Bose Precision Facility, Framingham, MA'
  },
  {
    id: 'demo-4',
    tokenId: 'ROLEX-SUB-126610LN',
    name: 'Rolex Submariner Date 41mm Oystersteel Watch',
    brand: 'Rolex Official',
    category: 'Luxury Goods',
    batchNumber: 'BATCH-RLX-3235-GEN',
    priceUsd: 10250,
    originLocation: 'Manufacture des Montres Rolex S.A., Geneva, Switzerland'
  },
  {
    id: 'demo-5',
    tokenId: 'NIKE-AJ4-BRED-2026',
    name: 'Nike Air Jordan 4 Retro Reimagined (Bred Edition)',
    brand: 'Nike Official',
    category: 'Footwear & Fashion',
    batchNumber: 'BATCH-NK-AJ4-2026',
    priceUsd: 215,
    originLocation: 'Nike Manufacturing Hub, Portland, OR'
  }
];

interface RegisterProductViewProps {
  currentLedger: Record<string, BlockchainProductRecord>;
  currentBlocks: BlockchainBlock[];
  onMintSuccess: (newRecord: BlockchainProductRecord, newBlock: BlockchainBlock) => void;
  onBatchMintSuccess?: (newRecords: BlockchainProductRecord[], newBlock: BlockchainBlock) => void;
  onTestScanNewlyMinted: (tokenId: string) => void;
}

export const RegisterProductView: React.FC<RegisterProductViewProps> = ({
  currentLedger,
  currentBlocks,
  onMintSuccess,
  onBatchMintSuccess,
  onTestScanNewlyMinted
}) => {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');

  // Single Registration Form State
  const [name, setName] = useState('Air Cushion Pro Sneakers (Midnight Edition)');
  const [brand, setBrand] = useState('Apex Athletic Co.');
  const [category, setCategory] = useState('Footwear & Fashion');
  const [batchNumber, setBatchNumber] = useState('BATCH-APX-2026-M9');
  const [tokenId, setTokenId] = useState('APEX-PRO-2026-M9');
  const [priceUsd, setPriceUsd] = useState(175);
  const [originLocation, setOriginLocation] = useState('Apex Certified Facility, San Francisco, CA');

  const [isMinting, setIsMinting] = useState(false);
  const [mintedRecord, setMintedRecord] = useState<BlockchainProductRecord | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  // Bulk Registration State
  const [bulkRows, setBulkRows] = useState<BulkRowItem[]>(DEMO_BATCH_PRESET);
  const [isPastingCsv, setIsPastingCsv] = useState(false);
  const [rawCsvText, setRawCsvText] = useState('');
  const [isMintingBulk, setIsMintingBulk] = useState(false);
  const [bulkMintProgress, setBulkMintProgress] = useState<{ current: number; total: number } | null>(null);
  const [batchMintResult, setBatchMintResult] = useState<{
    newRecords: BlockchainProductRecord[];
    newBlock: BlockchainBlock;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGenerateRandomToken = () => {
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'PROD';
    setTokenId(`${cleanBrand}-${randomHex}`);
  };

  const handleSingleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim() || !name.trim()) return;

    setIsMinting(true);
    try {
      const result = await mintProductOnChain(
        {
          tokenId: tokenId.trim(),
          name,
          brand,
          category,
          batchNumber,
          priceUsd,
          originLocation
        },
        currentLedger,
        currentBlocks
      );

      onMintSuccess(result.newRecord, result.newBlock);
      setMintedRecord(result.newRecord);
    } catch (err) {
      console.error('Minting failed:', err);
    } finally {
      setIsMinting(false);
    }
  };

  const handleDownloadQr = (recordToDownload?: BlockchainProductRecord) => {
    const target = recordToDownload || mintedRecord;
    if (!target?.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = target.qrDataUrl;
    a.download = `trustchain-qr-${target.tokenId}.png`;
    a.click();
  };

  const handleCopyTx = (txHash?: string) => {
    const target = txHash || mintedRecord?.txHash;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  // --- Bulk Registration Handlers ---

  const handleAddBulkRow = () => {
    const newId = `row-${Date.now()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setBulkRows((prev) => [
      ...prev,
      {
        id: newId,
        tokenId: `SKU-${randomSuffix}`,
        name: `Product Sample #${prev.length + 1}`,
        brand: 'Global Brand Corp.',
        category: 'Consumer Goods',
        batchNumber: `BATCH-2026-${randomSuffix}`,
        priceUsd: 120,
        originLocation: 'San Francisco Hub, CA'
      }
    ]);
  };

  const handleRemoveBulkRow = (id: string) => {
    setBulkRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateBulkRow = (id: string, field: keyof BulkRowItem, value: any) => {
    setBulkRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleClearBulkRows = () => {
    setBulkRows([]);
  };

  const handleLoadDemoBatch = () => {
    setBulkRows(DEMO_BATCH_PRESET);
  };

  const handleDownloadCsvTemplate = () => {
    const header = 'token_id,name,brand,category,batch_number,price_usd,origin_location\n';
    const sampleRows = [
      'APL-WATCH-U2,Apple Watch Ultra 2 49mm Titanium,Apple Inc.,Consumer Electronics,BATCH-APL-WU2,799,Cupertino Precision Facility CA',
      'DYSON-V15-2026,Dyson V15 Detect Cordless Vacuum,Dyson,Consumer Goods,BATCH-DYS-V15,749,Dyson Facility Malmesbury UK',
      'BOSE-QC45-BL,Bose QuietComfort 45 Headphones,Bose,Consumer Electronics,BATCH-BSE-QC45,329,Bose Plant Framingham MA'
    ].join('\n');
    const blob = new Blob([header + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trustchain-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    // Check if first line is header
    const firstLineLower = lines[0].toLowerCase();
    const startIndex = firstLineLower.includes('token') || firstLineLower.includes('sku') || firstLineLower.includes('name') ? 1 : 0;

    const parsed: BulkRowItem[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by comma or tab
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (cols.length >= 2) {
        const tokenId = cols[0]?.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
        const name = cols[1]?.trim() || 'Imported Product';
        const brand = cols[2]?.trim() || 'Verified Manufacturer';
        const category = cols[3]?.trim() || 'Consumer Goods';
        const batchNumber = cols[4]?.trim() || `BATCH-${Date.now().toString().slice(-4)}`;
        const priceUsd = Number(cols[5]) || 99;
        const originLocation = cols[6]?.trim() || 'Verified Regional Distribution Facility';

        parsed.push({
          id: `csv-${Date.now()}-${i}`,
          tokenId,
          name,
          brand,
          category,
          batchNumber,
          priceUsd,
          originLocation
        });
      }
    }

    if (parsed.length > 0) {
      setBulkRows(parsed);
      setIsPastingCsv(false);
      setRawCsvText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCsvText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteBulkMint = async () => {
    if (bulkRows.length === 0) return;

    setIsMintingBulk(true);
    setBulkMintProgress({ current: 0, total: bulkRows.length });

    try {
      const inputItems: ProductMintInput[] = bulkRows.map((r) => ({
        tokenId: r.tokenId.trim(),
        name: r.name.trim(),
        brand: r.brand.trim(),
        category: r.category.trim(),
        batchNumber: r.batchNumber.trim(),
        priceUsd: Number(r.priceUsd) || 120,
        originLocation: r.originLocation.trim()
      }));

      const result = await mintBatchProductsOnChain(inputItems, currentLedger, currentBlocks);

      if (onBatchMintSuccess) {
        onBatchMintSuccess(result.newRecords, result.newBlock);
      } else {
        // Fallback to onMintSuccess for last record
        if (result.newRecords.length > 0) {
          onMintSuccess(result.newRecords[0], result.newBlock);
        }
      }

      setBatchMintResult({
        newRecords: result.newRecords,
        newBlock: result.newBlock
      });
    } catch (err) {
      console.error('Bulk minting failed:', err);
      alert('Bulk minting encountered an error. Please verify the token IDs and try again.');
    } finally {
      setIsMintingBulk(false);
      setBulkMintProgress(null);
    }
  };

  // Check validation state of bulk rows
  const uniqueTokenIds = new Set<string>();
  let hasDuplicates = false;
  bulkRows.forEach((r) => {
    if (uniqueTokenIds.has(r.tokenId.toLowerCase())) {
      hasDuplicates = true;
    }
    uniqueTokenIds.add(r.tokenId.toLowerCase());
  });

  const validRowsCount = bulkRows.filter((r) => r.tokenId.trim() && r.name.trim() && r.brand.trim()).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Top Banner and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#bccac0]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4]/30 text-xs font-semibold text-[#004d33] mb-2 border border-[#006948]/20">
            <span className="material-symbols-outlined text-[16px] text-[#006948]">verified</span>
            <span>Brand & Manufacturer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1c1a] flex items-center gap-2">
            Register Authentic Products
          </h1>
          <p className="text-sm text-[#3d4a42] mt-1">
            Add verified products to the official catalog. When shoppers scan your barcode, it immediately confirms as <strong>100% Genuine</strong> with full specifications.
          </p>
        </div>

        {/* Mode Switcher: Single vs Bulk */}
        <div className="flex items-center p-1 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/40 self-start md:self-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'single'
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-[#6d7a72] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">qr_code</span>
            <span>Single Product</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('bulk')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'bulk'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-[#6d7a72] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dataset</span>
            <span>Register in Bulk</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-[#85f8c4] text-[#004d33]">
              Batch
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SINGLE PRODUCT REGISTRATION */}
      {/* ========================================================================= */}
      {activeMode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#bccac0]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/25">
              <span className="text-xs font-mono uppercase tracking-wider text-[#3d4a42] font-semibold">
                Single Asset Specifications
              </span>
              <span className="text-xs font-mono font-semibold text-[#006948] bg-[#85f8c4]/40 px-2 py-0.5 rounded">
                Smart Contract Direct Mint
              </span>
            </div>

            <form onSubmit={handleSingleMint} className="space-y-4 text-xs">
              {/* Token ID / QR Serial Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#1a1c1a]">
                    Unique Serial / Token ID / Barcode:
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomToken}
                    className="text-[11px] text-[#006948] hover:text-[#00855d] font-mono cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    Auto-Generate Serial
                  </button>
                </div>
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  required
                  placeholder="e.g. APEX-PRO-2026-M9 or 5000112637939"
                  className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 font-mono focus:bg-white focus:border-[#006948] focus:outline-none"
                />
                <p className="text-[11px] text-[#3d4a42] mt-1">
                  This exact serial string or GTIN barcode will be registered on the blockchain and encoded inside the generated scannable QR code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1a1c1a] mb-1">
                    Product Name:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Air Cushion Pro Sneakers"
                    className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 focus:bg-white focus:border-[#006948] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1a1c1a] mb-1">
                    Brand / Manufacturer:
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    placeholder="e.g. Apex Athletic Co."
                    className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 focus:bg-white focus:border-[#006948] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#1a1c1a] mb-1">
                    Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 focus:bg-white focus:border-[#006948] focus:outline-none"
                  >
                    <option value="Footwear & Fashion">Footwear & Fashion</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Luxury Goods">Luxury Goods</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Automotive & Hardware">Automotive & Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1a1c1a] mb-1">
                    Batch Number:
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                    placeholder="e.g. BATCH-APX-2026"
                    className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 font-mono focus:bg-white focus:border-[#006948] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1a1c1a] mb-1">
                    Price ($ USD):
                  </label>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 font-mono focus:bg-white focus:border-[#006948] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1a1c1a] mb-1">
                  Manufacturing Facility & Origin:
                </label>
                <input
                  type="text"
                  value={originLocation}
                  onChange={(e) => setOriginLocation(e.target.value)}
                  required
                  placeholder="e.g. Apex Certified Facility, San Francisco, CA"
                  className="w-full bg-[#f4f3f1] text-[#1a1c1a] border border-[#bccac0]/40 rounded-xl p-3 focus:bg-white focus:border-[#006948] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isMinting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006948] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#00855d] active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>
                  {isMinting ? 'Registering Product...' : 'Register Product & Generate QR Code'}
                </span>
              </button>
            </form>
          </div>

          {/* Right Output Card (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#bccac0]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/25">
              <span className="text-xs uppercase tracking-wider text-[#3d4a42] font-semibold">
                Verified Product Record
              </span>
              <span className="material-symbols-outlined text-[#006948] text-[20px]">verified_user</span>
            </div>

            {mintedRecord ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30 text-center flex flex-col items-center">
                  <span className="text-xs font-semibold text-[#006948] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                    Registered Scannable QR Code
                  </span>
                  {mintedRecord.qrDataUrl && (
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-[#bccac0]/40">
                      <img
                        src={mintedRecord.qrDataUrl}
                        alt={`QR for ${mintedRecord.tokenId}`}
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-[#3d4a42] mt-2 select-all font-bold">
                    Serial: {mintedRecord.tokenId}
                  </span>

                  <div className="mt-4 flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleDownloadQr()}
                      className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#bccac0]/40 text-[#1a1c1a] text-xs font-medium hover:bg-[#e9e8e5] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download QR
                    </button>
                    <button
                      type="button"
                      onClick={() => onTestScanNewlyMinted(mintedRecord.tokenId)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#006948] text-white text-xs font-semibold hover:bg-[#00855d] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                      Scan & Verify Now
                    </button>
                  </div>
                </div>

                {/* Block & Transaction Proofs */}
                <div className="p-3.5 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[#3d4a42]">
                    <span>Status:</span>
                    <span className="font-bold text-[#006948] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                      REGISTERED (REAL)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#3d4a42]">
                    <span>Block Mined:</span>
                    <span className="font-bold text-[#006948]">#{mintedRecord.blockNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#3d4a42]">
                    <span>Transaction Hash:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#1a1c1a] truncate max-w-[130px]">
                        {mintedRecord.txHash}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTx()}
                        className="text-[#006948] hover:text-[#00855d] cursor-pointer"
                        title="Copy Tx Hash"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedTx ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#3d4a42] space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#f4f3f1] border border-[#bccac0]/40 flex items-center justify-center mx-auto text-[#006948]">
                  <span className="material-symbols-outlined text-[32px]">qr_code_2</span>
                </div>
                <h3 className="font-semibold text-sm text-[#1a1c1a]">Ready to Register</h3>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">
                  Fill out the details on the left to mint this product to the blockchain and generate its unique verification QR code.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BULK PRODUCT REGISTRATION (ENTERPRISE MULTI-SKU BATCH) */}
      {/* ========================================================================= */}
      {activeMode === 'bulk' && (
        <div className="space-y-6">
          {/* Action Header Card with CSV Upload, Template Download, and Quick Demo Loader */}
          <div className="p-6 rounded-2xl bg-white border border-[#bccac0]/30 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#bccac0]/25">
              <div>
                <h2 className="text-lg font-bold text-[#1a1c1a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#006948]">inventory_2</span>
                  <span>Bulk Product Inscription Pipeline</span>
                </h2>
                <p className="text-xs text-[#6d7a72] mt-0.5">
                  Import hundreds of products via CSV/Excel or configure batch SKUs below for instant blockchain minting.
                </p>
              </div>

              {/* Action Buttons: Import, Template, Demo */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .tsv, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-[#006948] text-white text-xs font-semibold hover:bg-[#00855d] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Upload CSV File</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#bccac0]/40 text-[#1a1c1a] text-xs font-semibold hover:bg-[#f4f3f1] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">file_download</span>
                  <span>Download CSV Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemoBatch}
                  className="px-3.5 py-2 rounded-xl bg-[#85f8c4]/40 border border-[#006948]/30 text-[#004d33] text-xs font-semibold hover:bg-[#85f8c4]/70 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">magic_button</span>
                  <span>Load 5 Demo Products</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPastingCsv(!isPastingCsv)}
                  className="px-3.5 py-2 rounded-xl bg-[#f4f3f1] text-[#3d4a42] text-xs font-semibold hover:bg-[#e9e8e5] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">content_paste</span>
                  <span>{isPastingCsv ? 'Hide Paste Drawer' : 'Paste Raw CSV'}</span>
                </button>
              </div>
            </div>

            {/* Collapsible Direct Paste Drawer */}
            {isPastingCsv && (
              <div className="p-4 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1a1c1a]">Paste CSV or Tab-Separated Values:</span>
                  <span className="text-[11px] text-[#6d7a72] font-mono">Format: token_id, name, brand, category, batch, price, origin</span>
                </div>
                <textarea
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  placeholder="DYSON-HD16,Dyson Supersonic Nural,Dyson,Consumer Goods,BATCH-01,499,Malmesbury UK&#10;SONY-WH1000,Sony WH-1000XM5,Sony,Electronics,BATCH-02,399,Tokyo Japan"
                  rows={4}
                  className="w-full p-3 rounded-lg bg-white border border-[#bccac0]/40 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => parseCsvText(rawCsvText)}
                    disabled={!rawCsvText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[#006948] text-white text-xs font-semibold hover:bg-[#00855d] cursor-pointer disabled:opacity-50"
                  >
                    Parse & Populate Table
                  </button>
                </div>
              </div>
            )}

            {/* Summary Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30">
                <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Products in Batch</span>
                <span className="text-lg font-bold text-[#1a1c1a] mt-0.5 block">{bulkRows.length} Items</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30">
                <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Validation Status</span>
                <span className={`text-sm font-bold mt-1 block flex items-center gap-1 ${hasDuplicates ? 'text-[#ba1a1a]' : 'text-[#006948]'}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {hasDuplicates ? 'warning' : 'verified'}
                  </span>
                  {hasDuplicates ? 'Duplicate Serial Found' : `${validRowsCount} Validated`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30">
                <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Target Block</span>
                <span className="text-sm font-bold font-mono text-[#006948] mt-1 block">
                  #{currentBlocks.length > 0 ? currentBlocks[currentBlocks.length - 1].blockNumber + 1 : 14822}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30">
                <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Consensus Gas</span>
                <span className="text-sm font-bold font-mono text-[#006948] mt-1 block">
                  0.00 Gwei (Subsidized)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Editable Batch Table */}
          <div className="p-6 rounded-2xl bg-white border border-[#bccac0]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/25">
              <span className="text-xs uppercase tracking-wider text-[#3d4a42] font-semibold">
                Product Inventory Queue ({bulkRows.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddBulkRow}
                  className="px-3 py-1.5 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#006948] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Add Row</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearBulkRows}
                  disabled={bulkRows.length === 0}
                  className="px-3 py-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {bulkRows.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#f4f3f1] flex items-center justify-center mx-auto text-[#6d7a72]">
                  <span className="material-symbols-outlined text-[28px]">format_list_bulleted</span>
                </div>
                <p className="text-xs text-[#3d4a42]">No products in the batch queue.</p>
                <button
                  type="button"
                  onClick={handleLoadDemoBatch}
                  className="px-4 py-2 rounded-xl bg-[#006948] text-white text-xs font-semibold cursor-pointer shadow-xs hover:bg-[#00855d]"
                >
                  Load 5 Sample Demo Products
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#bccac0]/30 text-[#6d7a72] font-mono text-[11px] uppercase">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Barcode Number</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Batch Number</th>
                      <th className="py-2.5 px-3">MSRP ($)</th>
                      <th className="py-2.5 px-3">Origin Facility</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bccac0]/20">
                    {bulkRows.map((row, idx) => {
                      const isIdEmpty = !row.tokenId.trim();
                      const isNameEmpty = !row.name.trim();
                      const isDuplicate = bulkRows.filter((r) => r.tokenId.trim().toLowerCase() === row.tokenId.trim().toLowerCase()).length > 1;

                      return (
                        <tr key={row.id} className="hover:bg-[#faf9f6] transition-colors group">
                          <td className="py-2.5 px-3 font-mono text-[#6d7a72]">{idx + 1}</td>

                          {/* Token ID */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.tokenId}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'tokenId', e.target.value)}
                              placeholder="Required SKU / ID"
                              className={`w-36 px-2.5 py-1.5 rounded-lg border font-mono text-xs focus:outline-none ${
                                isIdEmpty || isDuplicate
                                  ? 'border-[#ba1a1a] bg-[#ffdad6]/20 text-[#ba1a1a]'
                                  : 'border-[#bccac0]/40 bg-white'
                              }`}
                            />
                          </td>

                          {/* Product Name */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'name', e.target.value)}
                              placeholder="Product title"
                              className={`w-48 px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none ${
                                isNameEmpty ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#bccac0]/40 bg-white'
                              }`}
                            />
                          </td>

                          {/* Brand */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.brand}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'brand', e.target.value)}
                              className="w-32 px-2.5 py-1.5 rounded-lg border border-[#bccac0]/40 bg-white text-xs focus:outline-none"
                            />
                          </td>

                          {/* Category */}
                          <td className="py-2 px-3">
                            <select
                              value={row.category}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'category', e.target.value)}
                              className="w-36 px-2 py-1.5 rounded-lg border border-[#bccac0]/40 bg-white text-xs focus:outline-none"
                            >
                              <option value="Footwear & Fashion">Footwear & Fashion</option>
                              <option value="Consumer Electronics">Consumer Electronics</option>
                              <option value="Consumer Goods">Consumer Goods</option>
                              <option value="Luxury Goods">Luxury Goods</option>
                              <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                            </select>
                          </td>

                          {/* Batch */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.batchNumber}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'batchNumber', e.target.value)}
                              className="w-28 px-2.5 py-1.5 rounded-lg border border-[#bccac0]/40 bg-white font-mono text-xs focus:outline-none"
                            />
                          </td>

                          {/* Price */}
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={row.priceUsd}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'priceUsd', Number(e.target.value))}
                              min={1}
                              className="w-20 px-2 py-1.5 rounded-lg border border-[#bccac0]/40 bg-white font-mono text-xs focus:outline-none"
                            />
                          </td>

                          {/* Origin */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.originLocation}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'originLocation', e.target.value)}
                              className="w-40 px-2.5 py-1.5 rounded-lg border border-[#bccac0]/40 bg-white text-xs focus:outline-none"
                            />
                          </td>

                          {/* Action */}
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveBulkRow(row.id)}
                              className="text-[#6d7a72] hover:text-[#ba1a1a] p-1 cursor-pointer transition-colors"
                              title="Delete row"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Mint Execution Bar */}
            {bulkRows.length > 0 && (
              <div className="pt-4 border-t border-[#bccac0]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#3d4a42]">
                  <span>Ready to register </span>
                  <strong className="text-[#006948]">{bulkRows.length} products</strong>
                  <span> to the official brand database.</span>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteBulkMint}
                  disabled={isMintingBulk || hasDuplicates || bulkRows.length === 0}
                  className="px-6 py-3.5 rounded-xl bg-[#006948] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00855d] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>
                    {isMintingBulk
                      ? `Registering (${bulkMintProgress?.current || 0}/${bulkMintProgress?.total || bulkRows.length})...`
                      : `Register All ${bulkRows.length} Products`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* BATCH MINTING RECEIPT & SCANNABLE QR VAULT */}
          {/* ========================================================================= */}
          {batchMintResult && (
            <div className="p-6 rounded-2xl bg-[#85f8c4]/20 border border-[#006948]/30 shadow-md space-y-6">
              {/* Receipt Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#006948]/25">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">verified</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#006948]">
                      Batch Successfully Inscribed to Blockchain!
                    </h3>
                    <p className="text-xs text-[#3d4a42]">
                      Mined into <strong>Block #{batchMintResult.newBlock.blockNumber}</strong> with {batchMintResult.newRecords.length} confirmed cryptographic transactions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#006948] text-white text-xs font-mono font-bold">
                    Merkle Verified: 100% Genuine
                  </span>
                </div>
              </div>

              {/* Cryptographic Block Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white border border-[#006948]/20">
                  <span className="text-[10px] text-[#6d7a72] block">BLOCK HASH</span>
                  <span className="text-[11px] text-[#1a1c1a] font-bold truncate block mt-0.5" title={batchMintResult.newBlock.blockHash}>
                    {batchMintResult.newBlock.blockHash}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#006948]/20">
                  <span className="text-[10px] text-[#6d7a72] block">MERKLE ROOT</span>
                  <span className="text-[11px] text-[#1a1c1a] font-bold truncate block mt-0.5" title={batchMintResult.newBlock.merkleRoot}>
                    {batchMintResult.newBlock.merkleRoot}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#006948]/20">
                  <span className="text-[10px] text-[#6d7a72] block">VALIDATOR NODE</span>
                  <span className="text-[11px] text-[#006948] font-bold truncate block mt-0.5">
                    {batchMintResult.newBlock.miner}
                  </span>
                </div>
              </div>

              {/* Grid of Newly Minted Products with Live QR codes */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase font-bold text-[#006948] tracking-wider">
                  Generated Scannable QR Codes ({batchMintResult.newRecords.length} Assets)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batchMintResult.newRecords.map((record) => (
                    <div
                      key={record.tokenId}
                      className="p-4 rounded-xl bg-white border border-[#006948]/25 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {record.qrDataUrl && (
                          <img
                            src={record.qrDataUrl}
                            alt={`QR for ${record.tokenId}`}
                            className="w-20 h-20 rounded-lg border border-[#bccac0]/30 shrink-0 p-1 bg-white"
                          />
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#006948] block">
                            {record.brand}
                          </span>
                          <h5 className="text-xs font-bold text-[#1a1c1a] leading-snug truncate" title={record.name}>
                            {record.name}
                          </h5>
                          <span className="text-[11px] font-mono text-[#6d7a72] block truncate mt-0.5">
                            ID: {record.tokenId}
                          </span>
                          <span className="text-[10px] font-mono text-[#006948] font-semibold block mt-0.5">
                            ${record.priceUsd} USD • Block #{record.blockNumber}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#bccac0]/20 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadQr(record)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] text-xs font-medium text-[#1a1c1a] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          Download QR
                        </button>
                        <button
                          type="button"
                          onClick={() => onTestScanNewlyMinted(record.tokenId)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#006948] hover:bg-[#00855d] text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                          Test Scan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
