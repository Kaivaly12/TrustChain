import React, { useState } from 'react';
import { BlockchainProductRecord, BlockchainBlock } from '../types';
import { CONTRACT_ADDRESS } from '../services/blockchainLedger';
import { ProvenanceChainTimeline } from './ProvenanceChainTimeline';

interface BlockchainExplorerProps {
  blocks: BlockchainBlock[];
  ledger: Record<string, BlockchainProductRecord>;
  onSelectTokenToScan: (tokenId: string) => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  blocks,
  ledger,
  onSelectTokenToScan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [inspectedTokenId, setInspectedTokenId] = useState<string | null>(null);

  const registeredItems = Object.values(ledger).filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.txHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#bccac0]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4]/30 text-xs font-semibold text-[#004d33] mb-2 border border-[#006948]/20">
            <span className="material-symbols-outlined text-[16px] text-[#006948]">verified</span>
            <span>Official Product Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1c1a] flex items-center gap-2">
            Verified Products Database
          </h1>
          <p className="text-sm text-[#3d4a42] mt-1">
            Browse genuine products cataloged in the verified registry. Tap <strong>Test Scan</strong> on any item to view its authenticity details.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white border border-[#bccac0]/40 px-3 py-1.5 rounded-xl text-[#3d4a42] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
          <span className="font-semibold text-[#006948]">Database Online</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-[#bccac0]/30 shadow-xs">
          <div className="text-[#6d7a72] text-[11px] uppercase tracking-wider font-semibold">Cataloged Products</div>
          <div className="text-2xl font-bold text-[#006948] mt-1">
            {Object.keys(ledger).length} Items
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#bccac0]/30 shadow-xs">
          <div className="text-[#6d7a72] text-[11px] uppercase tracking-wider font-semibold">Verification Speed</div>
          <div className="text-2xl font-bold text-[#1a1c1a] mt-1">
            Instant (&lt;0.5s)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#bccac0]/30 shadow-xs">
          <div className="text-[#6d7a72] text-[11px] uppercase tracking-wider font-semibold">Authenticity Standard</div>
          <div className="text-sm font-bold text-[#1a1c1a] mt-2">
            Brand Certified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#bccac0]/30 shadow-xs">
          <div className="text-[#6d7a72] text-[11px] uppercase tracking-wider font-semibold">Shopper Access</div>
          <div className="text-sm font-bold text-[#006948] mt-2">
            100% Free
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6d7a72]">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name, barcode number, brand, or category..."
          className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-[#bccac0]/40 text-xs text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#006948]"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#bccac0]/30 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#f4f3f1] border-b border-[#bccac0]/25 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#1a1c1a] uppercase tracking-wider">
            Verified Products Catalog
          </h2>
          <span className="text-xs text-[#3d4a42] font-semibold">
            {registeredItems.length} products listed
          </span>
        </div>

        <div className="divide-y divide-[#bccac0]/20">
          {registeredItems.map((item) => (
            <div key={item.tokenId}>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors">
                <div className="flex items-start gap-3.5">
                  {item.qrDataUrl ? (
                    <img
                      src={item.qrDataUrl}
                      alt={item.tokenId}
                      className="w-14 h-14 rounded-lg border border-[#bccac0]/30 p-1 bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#f4f3f1] border border-[#bccac0]/30 flex items-center justify-center text-[#006948] flex-shrink-0">
                      <span className="material-symbols-outlined text-[24px]">qr_code</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1a1c1a]">{item.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'RECALLED'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#85f8c4]/40 text-[#006948]'
                        }`}
                      >
                        {item.status === 'RECALLED' ? 'RECALLED' : 'VERIFIED GENUINE'}
                      </span>
                    </div>
                    <p className="text-xs text-[#3d4a42] mt-0.5">
                      {item.brand} • {item.category} • {item.priceUsd ? `$${item.priceUsd}` : ''}{item.mrpInr ? `₹${item.mrpInr}` : ''} • Origin: {item.originLocation}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6d7a72] mt-1">
                      <span>Barcode: <strong className="text-[#1a1c1a] font-mono">{item.tokenId}</strong></span>
                      <span>•</span>
                      <span>Batch: #{item.batchNumber || 'BATCH-2026'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  <button
                    type="button"
                    onClick={() => setInspectedTokenId(prev => prev === item.tokenId ? null : item.tokenId)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      inspectedTokenId === item.tokenId
                        ? 'bg-[#006948] text-white border-[#006948]'
                        : 'bg-white hover:bg-[#efeeeb] text-[#3d4a42] border-[#bccac0]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {inspectedTokenId === item.tokenId ? 'unfold_less' : 'account_tree'}
                    </span>
                    <span>{inspectedTokenId === item.tokenId ? 'Hide Provenance' : 'Provenance Chain'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTokenToScan(item.tokenId)}
                    className="px-3.5 py-2 rounded-lg bg-[#006948] text-white text-xs font-semibold hover:bg-[#00855d] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                    <span>Scan & Verify</span>
                  </button>
                </div>
              </div>

              {/* Expandable Provenance Chain Timeline */}
              {inspectedTokenId === item.tokenId && (
                <div className="p-4 sm:p-6 bg-[#f4f3f1]/50 border-t border-[#bccac0]/25">
                  <ProvenanceChainTimeline
                    record={item}
                    blocks={blocks}
                    rawPayload={item.tokenId}
                    isRegistered={true}
                    onNavigateToRegister={(code) => code && onSelectTokenToScan(code)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
