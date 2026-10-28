import React, { useState } from 'react';
import { translations, Language } from '../services/translations';
import { AuthUser, UserRole } from '../services/authStore';

interface HeaderProps {
  activeTab: 'home' | 'scanner' | 'register' | 'manufacturer';
  setActiveTab: (tab: 'home' | 'scanner' | 'register' | 'manufacturer') => void;
  openChat: () => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenReportModal: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: (role?: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openChat,
  lang,
  onToggleLang,
  onOpenReportModal,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const t = translations[lang];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isConsumer = currentUser?.role === 'consumer';
  const isManufacturer = currentUser?.role === 'manufacturer';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#bccac0]/30 shadow-xs transition-all">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#006948] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold text-[#1a1c1a] tracking-tight group-hover:text-[#006948] transition-colors">
                  {t.brandTitle}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#006948] bg-[#85f8c4]/40 border border-[#006948]/20 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                  Product registry
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center Navigation - strictly separated by role */}
        <nav className="hidden md:flex items-center gap-1.5">
          {/* Public / Non-logged in nav */}
          {!currentUser && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`text-xs font-semibold rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'home'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#1a1c1a] hover:bg-[#efeeeb]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">home</span>
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAuth('consumer');
                }}
                className="text-xs font-semibold rounded-xl px-3.5 py-2 text-[#006948] hover:bg-[#006948]/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">qr_code_scanner</span>
                <span>Consumer Scan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAuth('manufacturer');
                }}
                className="text-xs font-semibold rounded-xl px-3.5 py-2 text-[#1a1c1a] hover:bg-[#efeeeb] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">corporate_fare</span>
                <span>Brand Portal</span>
              </button>
            </>
          )}

          {/* Logged in as Consumer: SCAN ONLY & REPORT ONLY */}
          {isConsumer && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`text-xs font-semibold rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'home'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#1a1c1a] hover:bg-[#efeeeb]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">home</span>
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('scanner')}
                className={`text-xs font-bold rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'scanner'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-[#006948] hover:bg-[#006948]/10'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">qr_code_scanner</span>
                <span>Scan & Verify Products</span>
              </button>

              <button
                type="button"
                onClick={onOpenReportModal}
                className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[17px]">report</span>
                <span>Report Fake & Pin Seller</span>
              </button>
            </>
          )}

          {/* Logged in as Manufacturer: DASHBOARD, INVENTORY, TRANSACTIONS, REGISTER (NO SCANNER) */}
          {isManufacturer && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('manufacturer')}
                className={`text-xs font-bold rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'manufacturer'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#1a1c1a] hover:bg-[#efeeeb]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">dashboard</span>
                <span>Manufacturer Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`text-xs font-semibold rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#1a1c1a] hover:bg-[#efeeeb]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">add_circle</span>
                <span>Register Products</span>
              </button>
            </>
          )}
        </nav>

        {/* Right controls: Language, Auth & Profile */}
        <div className="flex items-center gap-2">
          {/* English / Hindi Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            title="Switch Language / भाषा बदलें"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-[#bccac0]/50 hover:bg-[#efeeeb] text-[#1a1c1a] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#006948]">language</span>
            <span className="font-mono text-[11px]">{lang === 'en' ? 'EN|हिं' : 'हिं|EN'}</span>
          </button>

          {/* Assistant Chat trigger */}
          <button
            type="button"
            onClick={openChat}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-white text-[#1a1c1a] px-3 py-1.5 rounded-xl shadow-xs hover:bg-[#efeeeb] border border-[#bccac0]/40 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-[#006948]">chat_bubble</span>
            <span>Assistant</span>
          </button>

          {/* Authentication State */}
          {!currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAuth('consumer')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#006948]/40 hover:bg-[#006948]/10 text-[#006948] text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">person</span>
                <span className="hidden sm:inline">Consumer Sign In</span>
                <span className="sm:hidden">Shopper</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('manufacturer')}
                className="px-3 py-1.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">corporate_fare</span>
                <span className="hidden sm:inline">Brand Login</span>
                <span className="sm:hidden">Brand</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-[#faf9f6] border border-[#bccac0]/40 text-xs">
                {currentUser.avatar ? (
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#006948]/30 shadow-2xs"
                    />
                    {currentUser.authProvider === 'google' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center shadow-xs border border-[#bccac0]/40">
                        <svg className="w-2 h-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={`material-symbols-outlined text-[16px] ${isConsumer ? 'text-[#006948]' : 'text-amber-700'}`}>
                    {isConsumer ? 'person' : 'corporate_fare'}
                  </span>
                )}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#1a1c1a] text-[11px] leading-tight truncate max-w-[110px] sm:max-w-[150px]">
                      {isManufacturer ? (currentUser.companyName || currentUser.name) : currentUser.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-[#6d7a72] leading-tight">
                      {isManufacturer ? 'Verified Brand' : 'Shopper'}
                    </span>
                    {currentUser.authProvider === 'google' && (
                      <span className="text-[8px] bg-emerald-50 text-[#006948] px-1 rounded font-semibold">
                        Google
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign Out"
                  className="w-7 h-7 rounded-lg hover:bg-[#efeeeb] text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-white border border-[#bccac0]/40 flex items-center justify-center text-[#1a1c1a] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#bccac0]/30 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#1a1c1a] hover:bg-[#faf9f6] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Home</span>
            </button>

            {/* Consumer Mobile Links */}
            {(!currentUser || isConsumer) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) onOpenAuth('consumer');
                    else setActiveTab('scanner');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#006948] bg-[#006948]/5 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                  <span>Scan & Verify Products</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenReportModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#ba1a1a] bg-[#ffdad6]/30 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">report</span>
                  <span>Report Counterfeit / Track Seller</span>
                </button>
              </>
            )}

            {/* Manufacturer Mobile Links */}
            {isManufacturer && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manufacturer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#006948] bg-[#006948]/5 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Manufacturer Portal & Inventory</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#1a1c1a] hover:bg-[#faf9f6] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Register Products</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-[#bccac0]/25">
            {!currentUser ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth('consumer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white border border-[#006948]/30 text-[#006948] text-xs font-bold text-center"
                >
                  Consumer Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth('manufacturer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#006948] text-white text-xs font-bold text-center"
                >
                  Brand Login
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#6d7a72]">Signed in as {currentUser.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-[#ba1a1a] hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
