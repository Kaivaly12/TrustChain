import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CounterfeitReport,
  ReportStatus,
  StrictActionType,
  StrictEnforcementAction,
  BlockchainProductRecord,
  BlockchainBlock
} from '../types';
import {
  getStoredReports,
  updateReportStatus,
  applyStrictActionToReport
} from '../services/reportsStore';
import { AuthUser, updateManufacturerWallet } from '../services/authStore';

interface ManufacturerPortalProps {
  currentLedger: Record<string, BlockchainProductRecord>;
  blockchainBlocks?: BlockchainBlock[];
  onNavigateToRegister: () => void;
  currentUser?: AuthUser | null;
}

export const ManufacturerPortal: React.FC<ManufacturerPortalProps> = ({
  currentLedger,
  blockchainBlocks = [],
  onNavigateToRegister,
  currentUser
}) => {
  const [reports, setReports] = useState<CounterfeitReport[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'distribution' | 'blockchain' | 'reports' | 'distributors' | 'products'>('distribution');
  const [selectedReport, setSelectedReport] = useState<CounterfeitReport | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Strict Action Modal state
  const [actionModalReport, setActionModalReport] = useState<CounterfeitReport | null>(null);
  const [actionType, setActionType] = useState<StrictActionType>('FIELD_INSPECTOR');
  const [actionNotes, setActionNotes] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [legalNoticeNumber, setLegalNoticeNumber] = useState('');
  const [fineAmount, setFineAmount] = useState('');

  // Reply modal state
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // MetaMask Web3 Wallet State
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(Boolean(currentUser?.walletAddress));
  const [walletAddress, setWalletAddress] = useState<string>(currentUser?.walletAddress || '0x71C2B9aF274...4fFe');
  const [networkName, setNetworkName] = useState<'Ethereum Mainnet' | 'Polygon PoS' | 'Sepolia Testnet'>('Ethereum Mainnet');
  const [walletBalance, setWalletBalance] = useState<string>('2.485 ETH');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [smartContractVerified, setSmartContractVerified] = useState(true);
  const [txSignSuccess, setTxSignSuccess] = useState<string | null>(null);

  // Load reports from store
  const refreshReports = () => {
    const list = getStoredReports();
    setReports(list);
  };

  useEffect(() => {
    refreshReports();
  }, []);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'counterfeit' && r.type === 'counterfeit') ||
      (statusFilter === 'damaged' && r.type === 'damaged') ||
      (statusFilter === 'pending' && (r.status === 'SUBMITTED' || r.status === 'UNDER_INVESTIGATION'));

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      r.productName.toLowerCase().includes(query) ||
      r.brand.toLowerCase().includes(query) ||
      (r.distributorLocation?.storeName && r.distributorLocation.storeName.toLowerCase().includes(query)) ||
      (r.distributorLocation?.city && r.distributorLocation.city.toLowerCase().includes(query)) ||
      r.id.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  // Distributors with reported fake products
  const fakeDistributorReports = reports.filter(
    (r) => r.type === 'counterfeit' && r.distributorLocation
  );

  // MetaMask Wallet Connect Handler
  const handleConnectMetaMask = async () => {
    setIsConnectingWallet(true);
    setTxSignSuccess(null);

    try {
      // Check if real MetaMask is available in browser window
      const eth = (window as any).ethereum;
      if (eth) {
        try {
          const accounts = await eth.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            const addr = accounts[0];
            setWalletAddress(addr);
            setIsWalletConnected(true);
            if (currentUser) {
              updateManufacturerWallet(currentUser.email, addr);
            }
            setIsConnectingWallet(false);
            return;
          }
        } catch {}
      }

      // If browser extension is not installed or user approves simulated Web3 Brand Keypair
      setTimeout(() => {
        const simulatedAddress = '0x71C2B9aF274d89679f0490b6F9aD044fFe';
        setWalletAddress(simulatedAddress);
        setIsWalletConnected(true);
        if (currentUser) {
          updateManufacturerWallet(currentUser.email, simulatedAddress);
        }
        setIsConnectingWallet(false);
      }, 600);
    } catch {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setTxSignSuccess(null);
  };

  // Simulate smart contract cryptographic verification sign
  const handleVerifySmartContract = () => {
    setTxSignSuccess('Verifying smart contract bytecode with brand authority key...');
    setTimeout(() => {
      setTxSignSuccess('Smart Contract 0x9482F6bB821A85A489c72e297FE976df24003E99 verified successfully. State: ACTIVE (Consensus confirmed)');
    }, 800);
  };

  // Execute strict action
  const handleExecuteStrictAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModalReport) return;

    let actionTitle = 'Strict Enforcement Action Initiated';
    if (actionType === 'LEGAL_NOTICE') actionTitle = 'Formal Legal Cease & Desist Order Served';
    else if (actionType === 'FIELD_INSPECTOR') actionTitle = 'Field Enforcement Squad Dispatched';
    else if (actionType === 'BLACKLISTED') actionTitle = 'Distributor Blacklisted Across Supply Chain';
    else if (actionType === 'POLICE_ESCALATION') actionTitle = 'Criminal FIR Lodged with Law Enforcement';
    else if (actionType === 'STOCK_SEIZED') actionTitle = 'Stock Seizure & Confiscation Order Executed';

    const actionData: StrictEnforcementAction = {
      actionType,
      actionTitle,
      actionDate: new Date().toISOString(),
      actionNotes: actionNotes.trim() || 'Official brand protection enforcement logged.',
      assignedOfficer: assignedOfficer.trim() || 'Brand Protection Task Force',
      legalNoticeNumber: legalNoticeNumber.trim() || `NOTICE-${Date.now().toString().slice(-6)}`,
      targetDistributor: actionModalReport.distributorLocation?.storeName || 'Reported Retailer',
      fineAmount: fineAmount.trim() || undefined
    };

    applyStrictActionToReport(actionModalReport.id, actionData);
    refreshReports();
    setActionModalReport(null);
    setActionNotes('');
    setAssignedOfficer('');
    setLegalNoticeNumber('');
    setFineAmount('');

    if (selectedReport && selectedReport.id === actionModalReport.id) {
      setSelectedReport({
        ...selectedReport,
        strictAction: actionData,
        status: actionType === 'STOCK_SEIZED' ? 'STOCK_SEIZED_RESOLVED' : 'INSPECTOR_DISPATCHED'
      });
    }
  };

  // Submit manufacturer reply to consumer
  const handleSendReply = (reportId: string) => {
    if (!replyText.trim()) return;
    setIsReplying(true);

    updateReportStatus(reportId, 'QUERY_ANSWERED', replyText.trim());
    refreshReports();
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({
        ...selectedReport,
        manufacturerReply: replyText.trim(),
        status: 'QUERY_ANSWERED'
      });
    }
    setReplyText('');
    setIsReplying(false);
  };

  // Total product items
  const productList = Object.values(currentLedger);

  return (
    <div className="w-full pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner & Control Room Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#bccac0]/40 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006948]/10 text-[#006948] text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">corporate_fare</span>
              <span>Manufacturer Portal • {currentUser?.companyName || 'Amul & Certified Brands'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1c1a] tracking-tight">
              Manufacturer Dashboard & Supply Chain Protection
            </h1>
            <p className="text-xs sm:text-sm text-[#6d7a72] max-w-2xl leading-relaxed">
              Verify transactions through blockchain smart contracts with MetaMask, monitor real-time inventory distribution, track fraudulent distributors selling fake products, and dispatch enforcement squads.
            </p>
          </div>

          {/* Right Header CTAs: MetaMask Wallet Connect & Product Register */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* MetaMask Wallet Connect Pill */}
            {isWalletConnected ? (
              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#f4f3f1] border border-[#bccac0]/40 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse"></span>
                  <span className="font-mono font-bold text-[#1a1c1a]">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <span className="text-[10px] text-[#6d7a72] hidden sm:inline">({networkName})</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  title="Disconnect Wallet"
                  className="px-2 py-1 rounded-xl bg-white hover:bg-[#efeeeb] text-[#ba1a1a] text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectMetaMask}
                disabled={isConnectingWallet}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                <span>{isConnectingWallet ? 'Connecting...' : 'Connect MetaMask Wallet'}</span>
              </button>
            )}

            {/* Register Product CTA */}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Register Product / Bulk Mint</span>
            </button>
          </div>
        </div>

        {/* 4 Top Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 space-y-1">
            <div className="flex items-center justify-between text-[#6d7a72]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Registered Units</span>
              <span className="material-symbols-outlined text-[18px] text-[#006948]">inventory_2</span>
            </div>
            <div className="text-2xl font-black text-[#1a1c1a]">
              {productList.length * 12500 + 4200}
            </div>
            <div className="text-[11px] text-[#6d7a72]">Certified across 4 regional hubs</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 space-y-1">
            <div className="flex items-center justify-between text-[#006948]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Smart Contracts</span>
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
            <div className="text-2xl font-black text-[#006948]">
              {smartContractVerified ? 'Verified' : 'Pending'}
            </div>
            <div className="text-[11px] text-[#006948]">Active on-chain consensus</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#ffdad6]/25 border border-[#ba1a1a]/30 space-y-1">
            <div className="flex items-center justify-between text-[#ba1a1a]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Consumer Reports</span>
              <span className="material-symbols-outlined text-[18px]">report</span>
            </div>
            <div className="text-2xl font-black text-[#ba1a1a]">
              {reports.filter((r) => r.type === 'counterfeit').length}
            </div>
            <div className="text-[11px] text-[#ba1a1a]/80">Counterfeit alerts received</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#85f8c4]/30 border border-[#006948]/20 space-y-1">
            <div className="flex items-center justify-between text-[#006948]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Strict Actions</span>
              <span className="material-symbols-outlined text-[18px]">local_police</span>
            </div>
            <div className="text-2xl font-black text-[#006948]">
              {reports.filter((r) => r.strictAction).length}
            </div>
            <div className="text-[11px] text-[#006948]">Enforcements & squad raids</div>
          </div>
        </div>

        {/* Portal Sub-tabs (Clean Role-Specific Interface) */}
        <div className="flex items-center gap-1.5 border-b border-[#bccac0]/30 pt-2 overflow-x-auto">
          {[
            { id: 'distribution', label: 'Inventory Distribution', icon: 'hub' },
            { id: 'blockchain', label: 'MetaMask & Blockchain Ledger', icon: 'token' },
            { id: 'reports', label: 'Consumer Reports Inbox', icon: 'inbox', count: reports.length },
            { id: 'distributors', label: 'Distributor Tracking & Strict Action', icon: 'location_searching', count: fakeDistributorReports.length },
            { id: 'products', label: 'Registered Products Catalog', icon: 'inventory_2', count: productList.length }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 border-b-2 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'border-[#006948] text-[#006948] bg-[#006948]/5'
                  : 'border-transparent text-[#6d7a72] hover:text-[#1a1c1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeSubTab === tab.id ? 'bg-[#006948] text-white' : 'bg-[#efeeeb] text-[#3d4a42]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area based on Active Sub-Tab */}
      <div>
        {/* SUB-TAB 1: INVENTORY DISTRIBUTION */}
        {activeSubTab === 'distribution' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#1a1c1a] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#006948]">local_shipping</span>
                    <span>Current Inventory Distribution Network</span>
                  </h3>
                  <p className="text-xs text-[#6d7a72] mt-0.5">
                    Live batch distribution across regional hubs, warehouse depots, and authorized retail partners.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[#85f8c4]/40 text-[#006948] font-bold border border-[#006948]/30">
                    All Hubs Synchronized
                  </span>
                </div>
              </div>

              {/* Regional Warehouses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {[
                  {
                    name: 'North Region Hub (Delhi NCR)',
                    code: 'WH-DEL-01',
                    units: '48,200',
                    activeBatches: 18,
                    status: 'Normal Operations',
                    tamperSeal: '100% Intact',
                    alerts: 0,
                    color: '#006948'
                  },
                  {
                    name: 'West Central Hub (Mumbai & Anand)',
                    code: 'WH-MUM-04',
                    units: '84,500',
                    activeBatches: 32,
                    status: 'Primary Production Facility',
                    tamperSeal: '100% Intact',
                    alerts: 0,
                    color: '#006948'
                  },
                  {
                    name: 'South Region Depot (Bengaluru)',
                    code: 'WH-BLR-02',
                    units: '36,100',
                    activeBatches: 14,
                    status: 'Active Distribution',
                    tamperSeal: '99.8% Intact',
                    alerts: 1,
                    color: '#825100'
                  },
                  {
                    name: 'East Region Terminal (Kolkata)',
                    code: 'WH-CCU-03',
                    units: '22,400',
                    activeBatches: 9,
                    status: 'Normal Operations',
                    tamperSeal: '100% Intact',
                    alerts: 0,
                    color: '#006948'
                  }
                ].map((hub) => (
                  <div
                    key={hub.code}
                    className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 space-y-3 hover:border-[#006948]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#6d7a72] bg-white px-2 py-0.5 rounded-md border border-[#bccac0]/30">
                          {hub.code}
                        </span>
                        <h4 className="text-xs font-bold text-[#1a1c1a] mt-1.5 leading-snug">{hub.name}</h4>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse"></span>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6d7a72]">Inventory Volume:</span>
                        <strong className="text-[#1a1c1a] font-mono">{hub.units} units</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6d7a72]">Active Batches:</span>
                        <strong className="text-[#006948] font-mono">{hub.activeBatches} Batches</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6d7a72]">Packaging Integrity:</span>
                        <span className="text-[11px] font-bold text-[#006948]">{hub.tamperSeal}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#bccac0]/25 flex items-center justify-between text-[11px]">
                      <span className="text-[#6d7a72]">{hub.status}</span>
                      {hub.alerts > 0 ? (
                        <span className="text-[#ba1a1a] font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          {hub.alerts} Alert
                        </span>
                      ) : (
                        <span className="text-[#006948] font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Certified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Batches Table */}
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1a1c1a] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#006948]">pallet</span>
                    <span>Active Product Batches in Circulation</span>
                  </h3>
                  <p className="text-xs text-[#6d7a72]">Production lot tracking and destination logistics.</p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="px-3 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] cursor-pointer"
                >
                  + Mint New Batch
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#faf9f6] text-[#6d7a72] uppercase font-mono text-[10px] border-b border-[#bccac0]/30">
                    <tr>
                      <th className="py-2.5 px-3">Batch Number</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Production Facility</th>
                      <th className="py-2.5 px-3">Units Shipped</th>
                      <th className="py-2.5 px-3">Smart Contract</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bccac0]/20">
                    {productList.map((item, idx) => (
                      <tr key={item.tokenId} className="hover:bg-[#faf9f6]/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#1a1c1a]">
                          {item.batchNumber || `BATCH-2026-${(idx + 1).toString().padStart(3, '0')}`}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#1a1c1a]">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 text-[#6d7a72]">
                          {item.category}
                        </td>
                        <td className="py-3 px-3 text-[#3d4a42]">
                          {item.originLocation}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#006948]">
                          {(idx + 1) * 3200 + 4000} units
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#006948] bg-[#85f8c4]/30 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                            0x9482...3E99
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: METAMASK & BLOCKCHAIN LEDGER */}
        {activeSubTab === 'blockchain' && (
          <div className="space-y-6">
            {/* MetaMask Smart Contract Verification Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#bccac0]/25">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#1a1c1a]">
                      MetaMask Web3 Smart Contract Verification
                    </h3>
                    <p className="text-xs text-[#6d7a72]">
                      Authorize product batch minting and verify on-chain supply chain records with manufacturer signature.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isWalletConnected ? (
                    <button
                      type="button"
                      onClick={handleVerifySmartContract}
                      className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Verify Smart Contract Bytecode</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectMetaMask}
                      disabled={isConnectingWallet}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      <span>{isConnectingWallet ? 'Connecting...' : 'Connect MetaMask'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Toast */}
              {txSignSuccess && (
                <div className="p-3.5 rounded-2xl bg-[#85f8c4]/40 border border-[#006948]/30 text-[#006948] text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  <span>{txSignSuccess}</span>
                </div>
              )}

              {/* Web3 Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-1">
                  <span className="text-[10px] text-[#6d7a72] uppercase tracking-wider block font-semibold">
                    Manufacturer Wallet
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1a] block truncate" title={walletAddress}>
                    {isWalletConnected ? walletAddress : 'Not Connected'}
                  </span>
                  <span className="text-[10px] text-[#006948] font-semibold block">
                    {isWalletConnected ? '● Connected & Authorized' : '○ Standby'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-1">
                  <span className="text-[10px] text-[#6d7a72] uppercase tracking-wider block font-semibold">
                    Active Network
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
                    <select
                      value={networkName}
                      onChange={(e) => setNetworkName(e.target.value as any)}
                      className="font-bold text-[#1a1c1a] bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                      <option value="Polygon PoS">Polygon PoS</option>
                      <option value="Sepolia Testnet">Sepolia Testnet</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-[#6d7a72] block">Gas: ~18 Gwei</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-1">
                  <span className="text-[10px] text-[#6d7a72] uppercase tracking-wider block font-semibold">
                    Smart Contract Address
                  </span>
                  <span className="font-mono font-bold text-[#006948] block truncate" title="0x9482F6bB821A85A489c72e297FE976df24003E99">
                    0x9482F6bB821A...3E99
                  </span>
                  <span className="text-[10px] text-[#006948] font-semibold block">
                    Verified on Etherscan
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-1">
                  <span className="text-[10px] text-[#6d7a72] uppercase tracking-wider block font-semibold">
                    Wallet Balance
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1a] block text-sm">
                    {isWalletConnected ? walletBalance : '-- ETH'}
                  </span>
                  <span className="text-[10px] text-[#6d7a72] block">Reserved for batch gas</span>
                </div>
              </div>
            </div>

            {/* Complete Transaction History Table */}
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#1a1c1a] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#006948]">history</span>
                    <span>Complete Blockchain Transaction History</span>
                  </h3>
                  <p className="text-xs text-[#6d7a72]">
                    Immutable on-chain transactions generated when batches and items are minted or transferred.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#006948] font-bold bg-[#85f8c4]/30 px-3 py-1 rounded-full border border-[#006948]/20">
                  {blockchainBlocks.length || 8} Blocks Mined
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#faf9f6] text-[#6d7a72] uppercase font-mono text-[10px] border-b border-[#bccac0]/30">
                    <tr>
                      <th className="py-2.5 px-3">Block #</th>
                      <th className="py-2.5 px-3">Tx Hash</th>
                      <th className="py-2.5 px-3">Smart Contract Call</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Gas Used</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bccac0]/20 font-mono">
                    {blockchainBlocks.length > 0 ? (
                      blockchainBlocks.map((block) => (
                        <tr key={block.blockHash} className="hover:bg-[#faf9f6]/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-[#1a1c1a]">
                            #{block.blockNumber}
                          </td>
                          <td className="py-3 px-3 text-[#006948] font-semibold truncate max-w-xs" title={block.blockHash}>
                            {block.blockHash.slice(0, 16)}...{block.blockHash.slice(-8)}
                          </td>
                          <td className="py-3 px-3 font-sans text-[#1a1c1a] font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-[#f4f3f1] border border-[#bccac0]/30 text-xs">
                              mintProductBatch()
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#6d7a72] text-[11px]">
                            {block.timestamp}
                          </td>
                          <td className="py-3 px-3 text-[#3d4a42]">
                            42,180 gwei
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006948] bg-[#85f8c4]/40 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                              CONFIRMED
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      productList.map((prod, idx) => (
                        <tr key={prod.tokenId} className="hover:bg-[#faf9f6]/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-[#1a1c1a]">
                            #{1042 + idx}
                          </td>
                          <td className="py-3 px-3 text-[#006948] font-semibold truncate max-w-xs" title={prod.txHash}>
                            {prod.txHash ? `${prod.txHash.slice(0, 16)}...` : '0x7a8b...9c1d'}
                          </td>
                          <td className="py-3 px-3 font-sans text-[#1a1c1a] font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-[#f4f3f1] border border-[#bccac0]/30 text-xs">
                              certifyProductToken()
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#6d7a72] text-[11px]">
                            {prod.mintedAt || '2026-03-24 10:14:00 UTC'}
                          </td>
                          <td className="py-3 px-3 text-[#3d4a42]">
                            {38000 + idx * 120} gwei
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006948] bg-[#85f8c4]/40 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                              CONFIRMED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: CONSUMER REPORTS & QUERIES */}
        {activeSubTab === 'reports' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#bccac0]/40">
              <div className="flex items-center gap-1 text-xs">
                {[
                  { id: 'all', label: 'All Inquiries' },
                  { id: 'counterfeit', label: 'Fake Reports' },
                  { id: 'damaged', label: 'Damaged Goods' },
                  { id: 'pending', label: 'Pending Action' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      statusFilter === f.id
                        ? 'bg-[#006948] text-white shadow-2xs'
                        : 'bg-[#faf9f6] text-[#6d7a72] hover:text-[#1a1c1a]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6d7a72]">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product, retailer, or city..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[#bccac0]/50 text-xs bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006948] w-full sm:w-64"
                />
              </div>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-[#bccac0]/30 space-y-2">
                <span className="material-symbols-outlined text-[36px] text-[#6d7a72]">inbox</span>
                <h4 className="text-sm font-bold text-[#1a1c1a]">No reports match your filter</h4>
                <p className="text-xs text-[#6d7a72]">Consumer submissions and counterfeit alerts will show here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      rep.type === 'counterfeit'
                        ? 'bg-white border-[#ba1a1a]/30 shadow-xs'
                        : 'bg-white border-[#bccac0]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            rep.type === 'counterfeit'
                              ? 'bg-[#ba1a1a] text-white shadow-xs'
                              : 'bg-amber-600 text-white shadow-xs'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {rep.type === 'counterfeit' ? 'gpp_bad' : 'broken_image'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#6d7a72] bg-[#f4f3f1] px-2 py-0.5 rounded-md">
                              {rep.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                rep.type === 'counterfeit'
                                  ? 'bg-[#ffdad6] text-[#93000a]'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {rep.type === 'counterfeit' ? 'Counterfeit Alert' : 'Damaged / Defect Query'}
                            </span>
                            <span className="text-xs text-[#6d7a72]">
                              Reported on {new Date(rep.submittedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold text-[#1a1c1a]">
                            {rep.productName}
                          </h4>

                          <p className="text-xs text-[#3d4a42] line-clamp-2 leading-relaxed">
                            "{rep.description}"
                          </p>

                          {rep.distributorLocation && (
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#825100] pt-1">
                              <span className="material-symbols-outlined text-[15px]">storefront</span>
                              <span className="font-bold">{rep.distributorLocation.storeName}</span>
                              <span>•</span>
                              <span>{rep.distributorLocation.city}, {rep.distributorLocation.state}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {rep.strictAction ? (
                          <div className="px-3 py-1.5 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">gavel</span>
                            <span>{rep.strictAction.actionTitle}</span>
                          </div>
                        ) : rep.type === 'counterfeit' ? (
                          <button
                            type="button"
                            onClick={() => setActionModalReport(rep)}
                            className="px-3.5 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">gavel</span>
                            <span>Take Strict Action</span>
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setSelectedReport(rep)}
                          className="px-3.5 py-2 rounded-xl bg-[#faf9f6] hover:bg-[#efeeeb] text-[#1a1c1a] border border-[#bccac0]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Investigate Dossier</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 4: DISTRIBUTOR TRACKING & STRICT ENFORCEMENT */}
        {activeSubTab === 'distributors' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#ba1a1a] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px]">location_searching</span>
                    <span>Tracked Distributors Selling Counterfeits</span>
                  </h3>
                  <p className="text-xs text-[#6d7a72]">
                    Pinpointed retail shops, distributor addresses, and illegal sales points identified by consumer scans.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#ba1a1a] font-bold bg-[#ffdad6]/40 px-3 py-1 rounded-full border border-[#ba1a1a]/30">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                  <span>{fakeDistributorReports.length} Flagged Points</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {fakeDistributorReports.map((rep) => {
                  const loc = rep.distributorLocation!;
                  return (
                    <div
                      key={rep.id}
                      className="p-5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 space-y-3 hover:border-[#ba1a1a]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                            SELLER ALERT
                          </span>
                          <h4 className="text-sm font-bold text-[#1a1c1a] pt-1">{loc.storeName}</h4>
                          <p className="text-xs text-[#6d7a72]">{loc.streetAddress}</p>
                        </div>
                        <span className="material-symbols-outlined text-[22px] text-[#ba1a1a]">pin_drop</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#bccac0]/30 text-xs space-y-1">
                        <div><strong className="text-[#1a1c1a]">City / State:</strong> {loc.city}, {loc.state}</div>
                        <div><strong className="text-[#1a1c1a]">Counterfeit Item:</strong> <span className="text-[#ba1a1a] font-semibold">{rep.productName}</span></div>
                        {loc.contactPhone && (
                          <div><strong className="text-[#1a1c1a]">Phone:</strong> {loc.contactPhone}</div>
                        )}
                        {loc.distributorGstin && (
                          <div><strong className="text-[#1a1c1a]">GSTIN:</strong> {loc.distributorGstin}</div>
                        )}
                      </div>

                      {rep.strictAction ? (
                        <div className="p-2.5 rounded-xl bg-[#85f8c4]/30 border border-[#006948]/30 text-[#006948] text-xs font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>{rep.strictAction.actionTitle}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActionModalReport(rep)}
                          className="w-full py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">gavel</span>
                          <span>Initiate Strict Legal Action</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 5: REGISTERED PRODUCTS CATALOG */}
        {activeSubTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#bccac0]/40">
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1a]">Official Brand Catalog</h3>
                <p className="text-xs text-[#6d7a72]">Active product lines and verified barcode batches.</p>
              </div>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="px-3.5 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] cursor-pointer transition-all"
              >
                + Register New Item
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {productList.map((prod) => (
                <div
                  key={prod.tokenId}
                  className="p-4 rounded-2xl bg-white border border-[#bccac0]/40 shadow-xs space-y-2 hover:border-[#006948]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#006948] bg-[#85f8c4]/30 px-2 py-0.5 rounded-full">
                        {prod.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#1a1c1a] pt-1">{prod.name}</h4>
                      <p className="text-xs text-[#6d7a72]">{prod.brand}</p>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-[#006948]">verified</span>
                  </div>

                  <div className="text-[11px] font-mono text-[#3d4a42] bg-[#faf9f6] p-2 rounded-lg">
                    GTIN: {prod.tokenId} | Batch: {prod.batchNumber}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-[#1a1c1a]">${prod.priceUsd} USD</span>
                    <span className="text-xs font-mono text-[#006948] font-semibold">
                      Registered On-Chain
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STRICT ACTION MODAL */}
      <AnimatePresence>
        {actionModalReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#bccac0]/60 overflow-hidden text-[#1a1c1a]"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-[#ffdad6]/30 border-b border-[#ba1a1a]/30">
                <div className="flex items-center gap-2 text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[24px]">gavel</span>
                  <div>
                    <h2 className="text-base font-bold">Strict Enforcement Action</h2>
                    <p className="text-xs text-[#ba1a1a]/80">Case: {actionModalReport.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModalReport(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7a72] hover:bg-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleExecuteStrictAction} className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#bccac0]/40 text-xs space-y-1">
                  <div className="font-bold text-[#1a1c1a]">Target Retailer: {actionModalReport.distributorLocation?.storeName || 'Distributor'}</div>
                  <div className="text-[#6d7a72]">Location: {actionModalReport.distributorLocation?.streetAddress}, {actionModalReport.distributorLocation?.city}</div>
                  <div className="text-[#ba1a1a] font-semibold">Counterfeit Item: {actionModalReport.productName}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4a42] mb-1.5">
                    Select Enforcement Action *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'FIELD_INSPECTOR', label: 'Dispatch Field Inspector Squad', icon: 'local_police' },
                      { id: 'LEGAL_NOTICE', label: 'Issue Cease & Desist Legal Order', icon: 'gavel' },
                      { id: 'STOCK_SEIZED', label: 'Execute Stock Confiscation Order', icon: 'inventory' },
                      { id: 'BLACKLISTED', label: 'Blacklist Retailer from Supply Chain', icon: 'block' },
                      { id: 'POLICE_ESCALATION', label: 'File Criminal FIR with Police', icon: 'shield_with_house' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActionType(item.id as StrictActionType)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          actionType === item.id
                            ? 'bg-[#ba1a1a] text-white border-transparent font-bold'
                            : 'bg-[#faf9f6] border-[#bccac0]/40 text-[#3d4a42] hover:bg-white text-xs'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        <span className="text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                      Assigned Officer / Squad Head
                    </label>
                    <input
                      type="text"
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      placeholder="e.g. Officer K. Verma (Zone 2 FDA)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                      Legal Notice / Docket Number
                    </label>
                    <input
                      type="text"
                      value={legalNoticeNumber}
                      onChange={(e) => setLegalNoticeNumber(e.target.value)}
                      placeholder="e.g. AMUL-LEGAL-2026-99"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#3d4a42] mb-1">
                    Enforcement Instructions & Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Dispatched squad with local authorities to raid shop and seize 50 counterfeit chocolate bars. Notice served for immediate shop closure."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#bccac0]/60 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#bccac0]/30">
                  <button
                    type="button"
                    onClick={() => setActionModalReport(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6d7a72] hover:bg-[#efeeeb] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                  >
                    Execute Action & Update Docket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECT & REPLY DRAWER */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg h-full bg-white shadow-2xl border-l border-[#bccac0]/40 flex flex-col text-[#1a1c1a]"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#bccac0]/30 flex items-center justify-between bg-[#faf9f6]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#006948]">{selectedReport.id}</span>
                  <h3 className="text-base font-bold text-[#1a1c1a]">Case Investigation Dossier</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7a72] hover:bg-[#efeeeb] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                {/* Product & Variant */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a72]">Product</div>
                  <h4 className="text-lg font-bold text-[#1a1c1a]">{selectedReport.productName}</h4>
                  {selectedReport.variant && (
                    <div className="text-xs font-semibold text-[#006948]">Variant: {selectedReport.variant}</div>
                  )}
                  <div className="text-xs font-mono text-[#6d7a72]">Barcode: {selectedReport.barcode}</div>
                </div>

                {/* Photo evidence if provided */}
                {selectedReport.photoUrl && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a72]">
                      Uploaded Photo Evidence
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-[#bccac0]/50 shadow-xs max-h-64">
                      <img src={selectedReport.photoUrl} alt="Defect" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Consumer Description */}
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/40 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a72]">
                    Consumer Statement ({selectedReport.userName || 'Anonymous'})
                  </div>
                  <p className="text-xs text-[#1a1c1a] leading-relaxed">
                    "{selectedReport.description}"
                  </p>
                </div>

                {/* Distributor location details */}
                {selectedReport.distributorLocation && (
                  <div className="p-4 rounded-2xl bg-[#ffdad6]/20 border border-[#ba1a1a]/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a] uppercase">
                      <span className="material-symbols-outlined text-[16px]">storefront</span>
                      Reported Seller Details
                    </div>
                    <div className="text-xs space-y-1 text-[#3d4a42]">
                      <div><strong className="text-[#1a1c1a]">Store:</strong> {selectedReport.distributorLocation.storeName}</div>
                      <div><strong className="text-[#1a1c1a]">Address:</strong> {selectedReport.distributorLocation.streetAddress}</div>
                      <div><strong className="text-[#1a1c1a]">City/State:</strong> {selectedReport.distributorLocation.city}, {selectedReport.distributorLocation.state}</div>
                      {selectedReport.distributorLocation.priceCharged && (
                        <div><strong className="text-[#ba1a1a]">Price Charged:</strong> {selectedReport.distributorLocation.priceCharged}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Existing Reply */}
                {selectedReport.manufacturerReply && (
                  <div className="p-4 rounded-2xl bg-[#006948]/10 border border-[#006948]/30 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#006948]">
                      Official Brand Reply
                    </div>
                    <p className="text-xs text-[#3d4a42] leading-relaxed">
                      {selectedReport.manufacturerReply}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                <div className="space-y-2 pt-2 border-t border-[#bccac0]/30">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
                    Send Official Manufacturer Reply to Consumer
                  </label>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write official response: e.g. 'Thank you for reporting this issue. Our team has inspected the batch and quarantined the retailer.'"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#faf9f6] border border-[#bccac0]/50 focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                  <button
                    type="button"
                    disabled={isReplying || !replyText.trim()}
                    onClick={() => handleSendReply(selectedReport.id)}
                    className="w-full py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    Send Reply & Resolve Query
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
