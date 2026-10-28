import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { MainScannerPage } from './components/MainScannerPage';
import { RegisterProductView } from './components/RegisterProductView';
import { ManufacturerPortal } from './components/ManufacturerPortal';
import { ReportProductModal } from './components/ReportProductModal';
import { FloatingChatbot } from './components/FloatingChatbot';
import { AuthModal } from './components/AuthModal';
import {
  INITIAL_LEDGER,
  INITIAL_BLOCKS,
  initializeLedgerWithQrs
} from './services/blockchainLedger';
import { BlockchainProductRecord, BlockchainBlock } from './types';
import { Language, translations } from './services/translations';
import {
  AuthUser,
  UserRole,
  getCurrentUser,
  setCurrentUser as persistCurrentUser
} from './services/authStore';
import confetti from 'canvas-confetti';

export default function App() {
  // Session & Authentication State
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<UserRole>('consumer');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'register' | 'manufacturer'>('home');
  const [lang, setLang] = useState<Language>('en');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGlobalReportOpen, setIsGlobalReportOpen] = useState(false);
  const [justEnteredScanner, setJustEnteredScanner] = useState(false);
  const [activeScannedCode, setActiveScannedCode] = useState<string | undefined>(undefined);
  const [roleWarningNotice, setRoleWarningNotice] = useState<string | null>(null);

  // Blockchain Ledger State
  const [ledger, setLedger] = useState<Record<string, BlockchainProductRecord>>(INITIAL_LEDGER);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);

  // Toggle Language between English and Hindi
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  // Generate real QR code image data URLs on startup for pre-registered tokens
  useEffect(() => {
    initializeLedgerWithQrs().then((initializedLedger) => {
      setLedger(initializedLedger);
    });
  }, []);

  // Handle Authentication Success
  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUserState(user);
    persistCurrentUser(user);
    setIsAuthModalOpen(false);

    if (user.role === 'manufacturer') {
      setActiveTab('manufacturer');
    } else {
      setActiveTab('scanner');
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUserState(null);
    persistCurrentUser(null);
    setActiveTab('home');
    setRoleWarningNotice(null);
  };

  // Open Auth Modal for specific role
  const handleOpenAuth = (role: UserRole = 'consumer') => {
    setAuthModalDefaultRole(role);
    setIsAuthModalOpen(true);
  };

  // When a manufacturer mints a product
  const handleMintSuccess = (newRecord: BlockchainProductRecord, newBlock: BlockchainBlock) => {
    setLedger((prev) => ({
      ...prev,
      [newRecord.tokenId]: newRecord
    }));
    setBlocks((prev) => [...prev, newBlock]);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // When a manufacturer mints a batch of products in bulk
  const handleBatchMintSuccess = (newRecords: BlockchainProductRecord[], newBlock: BlockchainBlock) => {
    setLedger((prev) => {
      const updated = { ...prev };
      for (const rec of newRecords) {
        updated[rec.tokenId] = rec;
      }
      return updated;
    });
    setBlocks((prev) => [...prev, newBlock]);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 }
    });
  };

  // Tab switching with strict role protection
  const handleTabChange = (newTab: 'home' | 'scanner' | 'register' | 'manufacturer') => {
    setRoleWarningNotice(null);

    // If attempting to access Manufacturer Dashboard or Product Registration
    if (newTab === 'manufacturer' || newTab === 'register') {
      if (!currentUser) {
        setAuthModalDefaultRole('manufacturer');
        setIsAuthModalOpen(true);
        return;
      }
      if (currentUser.role !== 'manufacturer') {
        setRoleWarningNotice(
          'Registration & Manufacturer Controls are restricted to certified brand manufacturers. Unauthorised consumers cannot register products.'
        );
        setTimeout(() => setRoleWarningNotice(null), 4000);
        return;
      }
    }

    // If manufacturer tries to access scanner, remind that scanner is designed for shoppers
    if (newTab === 'scanner' && currentUser?.role === 'manufacturer') {
      setRoleWarningNotice(
        'Note: Product Scanning is consumer-focused. You are viewing the shopper verification interface.'
      );
      setTimeout(() => setRoleWarningNotice(null), 3500);
    }

    if (newTab === 'scanner' && activeTab !== 'scanner') {
      setJustEnteredScanner(true);
      setTimeout(() => setJustEnteredScanner(false), 2400);
    }

    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Landing Page entry point
  const handleEnterSite = (
    initialTab: 'scanner' | 'register' | 'manufacturer' = 'scanner',
    sampleCode?: string
  ) => {
    if (sampleCode) {
      setActiveScannedCode(sampleCode);
    }

    if (initialTab === 'register' || initialTab === 'manufacturer') {
      if (!currentUser || currentUser.role !== 'manufacturer') {
        handleOpenAuth('manufacturer');
        return;
      }
    }

    handleTabChange(initialTab);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] flex flex-col font-sans selection:bg-[#006948] selection:text-white">
      {/* Universal Top Navigation with Strict Role Separation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openChat={() => setIsChatOpen(true)}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenReportModal={() => setIsGlobalReportOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Role Warning / Security Notice Toast */}
      {roleWarningNotice && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] p-3.5 rounded-2xl bg-white border border-[#ba1a1a]/40 shadow-xl text-xs font-semibold text-[#93000a] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">shield_person</span>
            <span>{roleWarningNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRoleWarningNotice(null)}
            className="w-6 h-6 rounded-md hover:bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="landing-page"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04, filter: 'blur(3px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingPage
                lang={lang}
                onEnterSite={handleEnterSite}
              />
            </motion.div>
          )}

          {activeTab === 'scanner' && (
            <motion.div
              key={`scanner-${activeScannedCode || 'default'}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <MainScannerPage
                blockchainLedger={ledger}
                blockchainBlocks={blocks}
                onOpenReportModal={() => setIsGlobalReportOpen(true)}
                activeScannedCode={activeScannedCode}
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === 'manufacturer' && (
            <motion.div
              key="manufacturer-portal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <ManufacturerPortal
                currentLedger={ledger}
                blockchainBlocks={blocks}
                onNavigateToRegister={() => handleTabChange('register')}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <RegisterProductView
                currentLedger={ledger}
                currentBlocks={blocks}
                onMintSuccess={handleMintSuccess}
                onBatchMintSuccess={handleBatchMintSuccess}
                onTestScanNewlyMinted={() => handleTabChange('manufacturer')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Authentication Modal with Consumer vs Manufacturer Gate & Secure Password Recovery */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authModalDefaultRole}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Report Fake / Damaged Product Modal */}
      <ReportProductModal
        isOpen={isGlobalReportOpen}
        onClose={() => setIsGlobalReportOpen(false)}
        initialProduct={
          activeScannedCode && ledger[activeScannedCode]
            ? {
                name: ledger[activeScannedCode].name,
                brand: ledger[activeScannedCode].brand,
                barcode: ledger[activeScannedCode].tokenId
              }
            : undefined
        }
      />

      {/* Floating Gemini Chatbot */}
      <FloatingChatbot
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        currentProduct={activeScannedCode ? ledger[activeScannedCode] : null}
        justEnteredScanner={justEnteredScanner}
      />

      {/* Global Clean Minimalist Footer */}
      <footer className="w-full bg-white border-t border-[#bccac0]/25 py-8 text-center text-xs text-[#3d4a42]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
            <span>© 2026 {t.brandTitle}. Verified Product & Food Authenticity Registry.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#6d7a72]">
            <span>Brand Protection Cell</span>
            <span>•</span>
            <span>Distributor Location Tracking</span>
            <span>•</span>
            <span>MetaMask Smart Contracts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
