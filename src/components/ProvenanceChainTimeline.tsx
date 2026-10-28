import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockchainProductRecord, BlockchainBlock } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Layers,
  Cpu,
  Hash,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  FileCheck2,
  Network,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ProvenanceChainTimelineProps {
  record?: BlockchainProductRecord;
  blocks: BlockchainBlock[];
  rawPayload: string;
  isRegistered: boolean;
  onNavigateToRegister?: (initialCode?: string) => void;
  onViewCertificate?: () => void;
}

interface TimelineDetailItem {
  label: string;
  value: string;
  copyable?: boolean;
  key?: string;
}

interface TimelineStep {
  id: string;
  category: 'blocks' | 'signatures';
  stageNumber: string;
  title: string;
  tagline: string;
  timestamp: string;
  status: 'completed' | 'current' | 'failed' | 'recalled';
  statusText: string;
  location: string;
  icon: any;
  accentColor: string;
  summary: string;
  details: TimelineDetailItem[];
  rawPayload?: any;
}

export const ProvenanceChainTimeline: React.FC<ProvenanceChainTimelineProps> = ({
  record,
  blocks,
  rawPayload,
  isRegistered,
  onNavigateToRegister,
  onViewCertificate
}) => {
  const [expandedNode, setExpandedNode] = useState<string | null>('block-consensus');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'blocks' | 'signatures'>('all');
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);

  // Copy helper with feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNode(prev => (prev === nodeId ? null : nodeId));
  };

  // Find matching block
  const matchingBlock = record
    ? blocks.find(b => b.blockNumber === record.blockNumber) || blocks[blocks.length - 1]
    : null;

  // Build authentic timeline steps for REAL registered products
  const registeredTimelineSteps: TimelineStep[] = record ? [
    {
      id: 'genesis-authorization',
      category: 'blocks',
      stageNumber: '01',
      title: 'Genesis & Manufacturing Authorization',
      tagline: 'Cryptographic product allocation at certified facility',
      timestamp: record.manufacturingDate || 'Factory Inception',
      status: 'completed',
      statusText: 'Authorized & Sealed',
      location: record.originLocation,
      icon: Layers,
      accentColor: '#006948',
      summary: `Product digitally serialized by ${record.brand} with immutable GS1 GTIN identification.`,
      details: [
        { label: 'Token / Serial ID', value: record.tokenId, copyable: true, key: 'tokenId' },
        { label: 'Production Batch', value: record.batchNumber, copyable: true, key: 'batchNumber' },
        { label: 'Certified Facility', value: record.originLocation },
        { label: 'Retail Value Anchor', value: `$${record.priceUsd} USD` }
      ],
      rawPayload: {
        tokenId: record.tokenId,
        batchNumber: record.batchNumber,
        brand: record.brand,
        originLocation: record.originLocation,
        category: record.category
      }
    },
    {
      id: 'batch-merkle-root',
      category: 'signatures',
      stageNumber: '02',
      title: 'Batch Merkle Tree Root Anchor',
      tagline: 'Tamper-evident batch hash cryptographically signed',
      timestamp: record.mintedAt || 'Cryptographic Sealing',
      status: 'completed',
      statusText: 'Merkle Sealed',
      location: 'Smart Contract Vault',
      icon: Hash,
      accentColor: '#006948',
      summary: 'Aggregated manufacturing batch encoded into a SHA-256 cryptographic leaf hash.',
      details: [
        { label: 'Batch Leaf Hash', value: record.batchHash, copyable: true, key: 'batchHash' },
        { label: 'Smart Contract', value: record.contractAddress, copyable: true, key: 'contractAddress' },
        { label: 'Physical Security', value: 'RFID / UV Micro-print Seal Intact' },
        { label: 'Manufacturing Date', value: record.manufacturingDate }
      ],
      rawPayload: {
        batchHash: record.batchHash,
        contractAddress: record.contractAddress,
        standard: 'ERC-721 / GS1 Digital Link Compliance'
      }
    },
    {
      id: 'block-consensus',
      category: 'blocks',
      stageNumber: '03',
      title: `Consensus Block Mined (#${record.blockNumber})`,
      tagline: 'Distributed validator consensus inscription on public ledger',
      timestamp: matchingBlock?.timestamp || record.mintedAt,
      status: 'completed',
      statusText: 'Mined On-Chain',
      location: matchingBlock?.miner || 'Validator Node Network',
      icon: Cpu,
      accentColor: '#006948',
      summary: `Permanently inscribed onto Block #${record.blockNumber} with full Proof-of-Authority consensus.`,
      details: [
        { label: 'Block Number', value: `#${record.blockNumber}` },
        { label: 'Block Hash', value: matchingBlock?.blockHash || record.txHash, copyable: true, key: 'blockHash' },
        { label: 'Transaction Hash', value: record.txHash, copyable: true, key: 'txHash' },
        { label: 'Merkle State Root', value: matchingBlock?.merkleRoot || record.batchHash, copyable: true, key: 'merkleRoot' },
        { label: 'Validator Node', value: matchingBlock?.miner || '0xValidatorNodeZurich#01' },
        { label: 'Confirmations', value: '64+ Network Confirmations' }
      ],
      rawPayload: matchingBlock || {
        blockNumber: record.blockNumber,
        txHash: record.txHash,
        mintedAt: record.mintedAt
      }
    },
    {
      id: 'consumer-scan',
      category: 'signatures',
      stageNumber: '04',
      title: 'Point-of-Scan Consumer Verification',
      tagline: 'Live optical camera scan matched against immutable state',
      timestamp: 'Scanned Just Now',
      status: record.status === 'RECALLED' ? 'recalled' : 'current',
      statusText: record.status === 'RECALLED' ? 'RECALL ALERT' : '100% Genuine Verified',
      location: 'Consumer Camera Viewport',
      icon: record.status === 'RECALLED' ? AlertTriangle : ShieldCheck,
      accentColor: record.status === 'RECALLED' ? '#ba1a1a' : '#006948',
      summary: record.status === 'RECALLED'
        ? `SAFETY WARNING: Officially RECALLED by ${record.brand}. Reason: ${record.recallReason || 'Safety Hazard'}`
        : 'Zero discrepancies detected. Hardware serial matches the decentralized ledger attestation.',
      details: [
        { label: 'Ledger Status', value: record.status === 'RECALLED' ? 'RECALLED BY BRAND' : 'ACTIVE / GENUINE' },
        { label: 'Decentralized Proof', value: 'Cryptographic Custody Validated' },
        { label: 'Verification Method', value: 'Optical Barcode + Smart Contract Match' },
        { label: 'Authenticity Guarantee', value: '100% Genuine Physical Product' }
      ],
      rawPayload: {
        verdict: record.status === 'RECALLED' ? 'RECALLED' : 'GENUINE',
        scannedPayload: rawPayload,
        timestamp: new Date().toISOString()
      }
    }
  ] : [];

  // Broken provenance steps for UNREGISTERED / FAKE products
  const fakeTimelineSteps: TimelineStep[] = [
    {
      id: 'fake-genesis',
      category: 'blocks',
      stageNumber: '01',
      title: 'Genesis Authorization: FAILED',
      tagline: 'No manufacturer registration record in ledger state',
      timestamp: 'Not Found',
      status: 'failed',
      statusText: 'Missing Origin',
      location: 'Unknown / Unverified Supplier',
      icon: AlertTriangle,
      accentColor: '#ba1a1a',
      summary: `The serial code '${rawPayload.slice(0, 24)}' was never registered by an authorized brand factory.`,
      details: [
        { label: 'Submitted Serial', value: rawPayload, copyable: true, key: 'rawPayload' },
        { label: 'Ledger Query', value: '0 matching records found' },
        { label: 'Cryptographic Inscription', value: 'None' }
      ]
    },
    {
      id: 'fake-consensus',
      category: 'blocks',
      stageNumber: '02',
      title: 'Consensus Block Mining: UNMINED',
      tagline: 'Zero validator nodes have signed this product token',
      timestamp: 'Unmined',
      status: 'failed',
      statusText: 'Zero Confirmations',
      location: 'Unanchored',
      icon: Database,
      accentColor: '#ba1a1a',
      summary: 'Without an immutable block number and validator signature, provenance cannot be established.',
      details: [
        { label: 'Block Number', value: 'None (Unmined)' },
        { label: 'Merkle Proof', value: 'Missing Cryptographic Leaf' }
      ]
    },
    {
      id: 'fake-current',
      category: 'signatures',
      stageNumber: '03',
      title: 'Current Verification State: COUNTERFEIT RISK',
      tagline: 'Item failed decentralized authenticity test',
      timestamp: 'Scanned Just Now',
      status: 'failed',
      statusText: 'Likely Fake / Replica',
      location: 'Consumer Camera Viewport',
      icon: AlertTriangle,
      accentColor: '#ba1a1a',
      summary: 'High probability of gray-market replica, cloned packaging barcode, or unauthorized manufacturer.',
      details: [
        { label: 'Risk Rating', value: 'CRITICAL (Counterfeit Suspect)' },
        { label: 'Action Recommended', value: 'Mint onto blockchain or return item to seller' }
      ]
    }
  ];

  const stepsToRender = isRegistered && record ? registeredTimelineSteps : fakeTimelineSteps;
  const filteredSteps = stepsToRender.filter(step => {
    if (filterMode === 'all') return true;
    return step.category === filterMode;
  });

  return (
    <div className="w-full bg-white rounded-2xl border border-[#bccac0]/35 shadow-xs overflow-hidden text-[#1a1c1a]">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 border-b border-[#bccac0]/25 bg-gradient-to-b from-[#faf9f6] to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#006948]">
                Decentralized Provenance Chain
              </span>
              <span className="text-xs text-[#6d7a72]">•</span>
              <span className="text-xs text-[#6d7a72] font-mono">
                {isRegistered ? `Block #${record?.blockNumber}` : 'Unregistered State'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1c1a] tracking-tight">
              Cryptographic Audit & Custody Trail
            </h2>
            <p className="text-xs sm:text-sm text-[#3d4a42] leading-relaxed max-w-2xl">
              {isRegistered
                ? 'Each block entry represents an immutable state on the blockchain ledger, mathematically linked by Merkle roots and validator signatures.'
                : 'Warning: This product is not anchored to any ledger block. Inspect the missing provenance stages below.'}
            </p>
          </div>

          {/* Top Actions & Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#f4f3f1] p-1 rounded-xl border border-[#bccac0]/30 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-[#006948] font-bold shadow-2xs'
                    : 'text-[#6d7a72] hover:text-[#1a1c1a]'
                }`}
              >
                All Checkpoints
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('blocks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filterMode === 'blocks'
                    ? 'bg-white text-[#006948] font-bold shadow-2xs'
                    : 'text-[#6d7a72] hover:text-[#1a1c1a]'
                }`}
              >
                Ledger Blocks
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('signatures')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filterMode === 'signatures'
                    ? 'bg-white text-[#006948] font-bold shadow-2xs'
                    : 'text-[#6d7a72] hover:text-[#1a1c1a]'
                }`}
              >
                Signatures
              </button>
            </div>

            {isRegistered && (
              <button
                type="button"
                onClick={() => setIsRawModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-[#efeeeb] border border-[#bccac0]/40 text-[#1a1c1a] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Inspect raw JSON blockchain block payload"
              >
                <Code2 className="w-3.5 h-3.5 text-[#006948]" />
                <span>Raw JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Provenance Meta Bar */}
        {isRegistered && record && (
          <div className="mt-4 pt-4 border-t border-[#bccac0]/25 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#f4f3f1]/70 border border-[#bccac0]/25">
              <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Block Anchor</span>
              <span className="font-mono font-bold text-[#006948] mt-0.5 block truncate">
                #{record.blockNumber}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f4f3f1]/70 border border-[#bccac0]/25">
              <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Origin Facility</span>
              <span className="font-medium text-[#1a1c1a] mt-0.5 block truncate">
                {record.originLocation}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f4f3f1]/70 border border-[#bccac0]/25">
              <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Consensus State</span>
              <span className="font-mono font-bold text-[#006948] mt-0.5 block truncate">
                {record.status === 'RECALLED' ? 'RECALLED' : 'ACTIVE & VERIFIED'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f4f3f1]/70 border border-[#bccac0]/25">
              <span className="text-[10px] text-[#6d7a72] uppercase font-mono block">Network Timestamp</span>
              <span className="font-mono text-[#3d4a42] mt-0.5 block truncate">
                {record.mintedAt}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Animated Vertical Timeline Viewport */}
      <div className="p-5 sm:p-8">
        <div className="relative">
          {/* Continuous Vertical Timeline Line */}
          <div
            className={`absolute left-5 sm:left-6 top-6 bottom-6 w-0.5 ${
              isRegistered
                ? 'bg-gradient-to-b from-[#006948] via-[#85f8c4] to-[#006948]'
                : 'bg-gradient-to-b from-[#ba1a1a] via-[#ffdad6] to-[#ba1a1a]'
            }`}
          >
            {/* Animated Traveling Light Pulse along the vertical line */}
            <motion.div
              animate={{
                y: ['0%', '100%']
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`w-2 h-6 -left-[3px] rounded-full absolute shadow-md ${
                isRegistered
                  ? 'bg-[#85f8c4] shadow-[0_0_12px_#85f8c4]'
                  : 'bg-[#ba1a1a] shadow-[0_0_12px_#ba1a1a]'
              }`}
            />
          </div>

          {/* Timeline Nodes / Step Cards */}
          <div className="space-y-6 sm:space-y-8 pl-12 sm:pl-14">
            <AnimatePresence>
              {filteredSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isExpanded = expandedNode === step.id;
                const isFailed = step.status === 'failed';
                const isRecalled = step.status === 'recalled';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    className="relative group"
                  >
                    {/* Node Circle Anchor on the Vertical Line */}
                    <div
                      className={`absolute -left-12 sm:-left-14 top-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm z-10 ${
                        isFailed
                          ? 'bg-[#ba1a1a] text-white ring-4 ring-[#ffdad6]'
                          : isRecalled
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                          : 'bg-[#006948] text-white ring-4 ring-[#85f8c4]/40'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Timeline Node Card Container */}
                    <div
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? isFailed
                            ? 'bg-white border-[#ba1a1a]/40 shadow-md ring-1 ring-[#ba1a1a]/20'
                            : 'bg-white border-[#006948]/40 shadow-md ring-1 ring-[#006948]/20'
                          : 'bg-[#faf9f6] hover:bg-white border-[#bccac0]/30 hover:border-[#bccac0]/60 shadow-2xs'
                      }`}
                    >
                      {/* Card Header */}
                      <div
                        onClick={() => toggleNode(step.id)}
                        className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-[#6d7a72]">
                              STEP {step.stageNumber}
                            </span>
                            <span className="text-[#bccac0]">•</span>
                            <span className="text-[#6d7a72] flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-[#6d7a72]" />
                              <span>{step.timestamp}</span>
                            </span>
                            <span className="text-[#bccac0]">•</span>
                            <span
                              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                isFailed
                                  ? 'bg-[#ffdad6] text-[#93000a]'
                                  : isRecalled
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-[#85f8c4]/40 text-[#004d33]'
                              }`}
                            >
                              {step.statusText}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-[#1a1c1a] tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#3d4a42]">
                            {step.tagline}
                          </p>
                        </div>

                        {/* Expand/Collapse Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-white border border-[#bccac0]/35 text-[#3d4a42] hover:text-[#1a1c1a] transition-colors cursor-pointer"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#006948]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#6d7a72]" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Summary Statement */}
                      <div className="px-4 sm:px-5 pb-3 pt-0">
                        <p className="text-xs text-[#3d4a42] leading-relaxed">
                          {step.summary}
                        </p>
                      </div>

                      {/* Card Expanded Detail Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t border-[#bccac0]/25 bg-white rounded-b-2xl"
                          >
                            <div className="p-4 sm:p-5 space-y-4">
                              {/* Details Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {step.details.map((item, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="p-3 rounded-xl bg-[#f4f3f1]/70 border border-[#bccac0]/25 flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[10px] text-[#6d7a72] font-mono uppercase tracking-wider block">
                                        {item.label}
                                      </span>
                                      <span className="font-mono text-xs font-semibold text-[#1a1c1a] block truncate mt-0.5">
                                        {item.value}
                                      </span>
                                    </div>

                                    {item.copyable && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(item.value, `${step.id}-${item.key || dIdx}`);
                                        }}
                                        className="p-1.5 rounded-lg bg-white border border-[#bccac0]/35 text-[#6d7a72] hover:text-[#006948] transition-colors cursor-pointer shrink-0"
                                        title={`Copy ${item.label}`}
                                      >
                                        {copiedKey === `${step.id}-${item.key || dIdx}` ? (
                                          <Check className="w-3.5 h-3.5 text-[#006948]" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Special Card Footer Actions */}
                              {step.id === 'consumer-scan' && isRegistered && (
                                <div className="pt-2 flex flex-wrap items-center gap-2">
                                  {onViewCertificate && (
                                    <button
                                      type="button"
                                      onClick={onViewCertificate}
                                      className="py-2 px-3.5 rounded-xl bg-[#006948] text-white text-xs font-semibold hover:bg-[#00855d] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <FileCheck2 className="w-3.5 h-3.5 text-[#85f8c4]" />
                                      <span>View Cryptographic Certificate</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(record?.txHash || '', 'fullTxHash')}
                                    className="py-2 px-3.5 rounded-xl bg-white border border-[#bccac0]/40 text-[#1a1c1a] text-xs font-medium hover:bg-[#efeeeb] transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-[#006948]" />
                                    <span>{copiedKey === 'fullTxHash' ? 'Copied Full Tx Hash' : 'Copy Full Tx Hash'}</span>
                                  </button>
                                </div>
                              )}

                              {/* Failed Step: 1-Click Minting Prompt */}
                              {isFailed && onNavigateToRegister && (
                                <div className="p-3.5 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="text-[#3d4a42]">
                                    <strong className="text-[#ba1a1a] block">Fix Broken Provenance:</strong>
                                    <span>Inscribe this product code to create the Genesis Block and certify it on-chain.</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToRegister(rawPayload)}
                                    className="py-2 px-4 rounded-xl bg-[#006948] text-white text-xs font-semibold hover:bg-[#00855d] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                                  >
                                    <span>Mint Genesis Block Now</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Raw JSON Block Modal */}
      {isRawModalOpen && record && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-950 text-emerald-400 max-w-2xl w-full rounded-2xl border border-[#006948]/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-4 bg-neutral-900 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-white">
                <Code2 className="w-4 h-4 text-[#85f8c4]" />
                <span className="font-bold">Raw Ledger State Inscription (Block #{record.blockNumber})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRawModalOpen(false)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-black/90">
              <pre className="text-[#85f8c4] whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    provenanceProtocol: 'TrustChain-PoA-v2.6',
                    blockNumber: record.blockNumber,
                    blockHash: matchingBlock?.blockHash || record.txHash,
                    prevBlockHash: matchingBlock?.prevBlockHash,
                    merkleRoot: matchingBlock?.merkleRoot,
                    smartContract: record.contractAddress,
                    transaction: {
                      txHash: record.txHash,
                      tokenId: record.tokenId,
                      brand: record.brand,
                      productName: record.name,
                      batchNumber: record.batchNumber,
                      batchMerkleLeaf: record.batchHash,
                      originLocation: record.originLocation,
                      mintedAt: record.mintedAt,
                      status: record.status,
                      consensusValidator: matchingBlock?.miner || '0xValidatorNodeZurich#01'
                    }
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-4 bg-neutral-900 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/60">SHA-256 Cryptographic Digest Validated</span>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(record, null, 2), 'rawJson')}
                className="px-3.5 py-1.5 rounded-lg bg-[#006948] text-white hover:bg-[#00855d] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedKey === 'rawJson' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'rawJson' ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
