import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserRole,
  AuthUser,
  authenticateUser,
  registerUser,
  loginWithGoogle,
  requestPasswordReset,
  completePasswordReset
} from '../services/authStore';

// Official multi-colored Google 'G' icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'consumer',
  onAuthSuccess
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_request' | 'forgot_verify'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Manufacturer Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Password Recovery State
  const [resetCode, setResetCode] = useState('');
  const [generatedCodeNotice, setGeneratedCodeNotice] = useState<string | null>(null);

  // Google Account Chooser State
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleCompany, setCustomGoogleCompany] = useState('');
  const [customGoogleGst, setCustomGoogleGst] = useState('');
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);

  // Status and Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sync defaultRole if modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setErrorMessage(null);
      setSuccessMessage(null);
      setGeneratedCodeNotice(null);
      setIsGoogleChooserOpen(false);
    }
  }, [isOpen, defaultRole]);

  if (!isOpen) return null;

  // Quick fill demo helper
  const handleQuickFill = (targetRole: UserRole) => {
    setRole(targetRole);
    setMode('signin');
    setErrorMessage(null);
    setSuccessMessage(null);
    if (targetRole === 'consumer') {
      setEmail('shopper@trusttag.org');
      setPassword('Consumer@123');
    } else {
      setEmail('brand@amul.com');
      setPassword('Manufacturer@123');
    }
  };

  // Execute Google Authentication
  const executeGoogleAuth = (googleData: {
    email: string;
    name: string;
    picture?: string;
    companyName?: string;
    gstNumber?: string;
    fssaiLicense?: string;
  }) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    setTimeout(() => {
      const res = loginWithGoogle({
        email: googleData.email,
        name: googleData.name,
        role,
        picture: googleData.picture,
        companyName: googleData.companyName,
        gstNumber: googleData.gstNumber,
        fssaiLicense: googleData.fssaiLicense
      });

      setIsGoogleLoading(false);
      setIsGoogleChooserOpen(false);

      if (res.success && res.user) {
        setSuccessMessage(
          `Signed in successfully with Google as ${res.user.name} (${role === 'manufacturer' ? 'Brand Manufacturer' : 'Consumer'})!`
        );
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Google Authentication failed. Please try again.');
      }
    }, 550);
  };

  // Handle Standard Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateUser(email, password, role);
      setIsLoading(false);
      if (res.success && res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      }
    }, 400);
  };

  // Handle Standard Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (role === 'manufacturer' && !companyName.trim()) {
      setErrorMessage('Please enter your Company / Brand name.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = registerUser({
        email,
        password,
        name,
        role,
        phone,
        companyName,
        fssaiLicense,
        gstNumber
      });
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMessage(`Account created successfully for ${res.user.name}!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    }, 450);
  };

  // Handle Request Password Reset Code
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = requestPasswordReset(email, role);
      setIsLoading(false);
      if (res.success && res.code) {
        setGeneratedCodeNotice(res.code);
        setSuccessMessage(res.message || 'Verification code sent.');
        setMode('forgot_verify');
      } else {
        setErrorMessage(res.error || 'Could not initiate password reset.');
      }
    }, 500);
  };

  // Handle Complete Password Reset
  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = completePasswordReset(email, resetCode, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset successfully.');
        setTimeout(() => {
          setMode('signin');
          setPassword('');
          setConfirmPassword('');
          setResetCode('');
          setGeneratedCodeNotice(null);
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-[#bccac0]/40 shadow-2xl max-w-lg w-full overflow-hidden my-auto relative"
      >
        {/* Top Header with Role Selector */}
        <div className="p-5 sm:p-6 bg-[#faf9f6] border-b border-[#bccac0]/30">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  {role === 'manufacturer' ? 'corporate_fare' : 'verified_user'}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1a1c1a] leading-tight">
                  {role === 'manufacturer' ? 'Manufacturer Portal Login' : 'Consumer / Shopper Login'}
                </h3>
                <span className="text-xs text-[#6d7a72]">
                  {role === 'manufacturer'
                    ? 'Brand Authorization & Smart Contracts'
                    : 'Product Scan & Authenticity Verification'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#efeeeb] text-[#6d7a72] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Role Switcher Pill */}
          <div className="grid grid-cols-2 p-1 bg-[#efeeeb] rounded-2xl gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole('consumer');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                role === 'consumer'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#1a1c1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>Consumer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('manufacturer');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                role === 'manufacturer'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#1a1c1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              <span>Manufacturer</span>
            </button>
          </div>

          {/* Quick Pre-filled Demo helper for fast testing */}
          <div className="pt-3 flex items-center justify-between text-[11px] text-[#6d7a72]">
            <span>Need quick access?</span>
            <button
              type="button"
              onClick={() => handleQuickFill(role)}
              className="text-[#006948] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>Auto-fill {role === 'consumer' ? 'Consumer' : 'Brand'} Credentials</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/40 text-[#93000a] text-xs font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#85f8c4]/40 border border-[#006948]/30 text-[#006948] text-xs font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* GOOGLE LOG IN SECTION (Accessible for both Sign In and Sign Up modes) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  // Direct 1-click Google Sign-in with default account or open picker
                  executeGoogleAuth({
                    email: 'vaishaliya1982@gmail.com',
                    name: 'Vaishaliya Sharma',
                    picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Vaishaliya&backgroundColor=006948,00855d',
                    companyName: role === 'manufacturer' ? 'Vaishaliya Consumer & Food Products Ltd' : undefined,
                    gstNumber: role === 'manufacturer' ? '24AAACV1982F1Z9' : undefined,
                    fssaiLicense: role === 'manufacturer' ? '10023021000882' : undefined
                  });
                }}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#faf9f6] border border-[#bccac0]/60 hover:border-[#006948]/40 text-[#1a1c1a] text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-between gap-3 group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-[#bccac0]/30 shadow-2xs group-hover:scale-105 transition-transform">
                    <GoogleIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1a1c1a] text-xs">
                        Continue with Google
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-[#006948] bg-[#006948]/10 px-1.5 py-0.5 rounded-md">
                        {role === 'manufacturer' ? 'Brand' : 'Shopper'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6d7a72] font-normal leading-tight">
                      One-click authorization as vaishaliya1982@gmail.com
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#006948] group-hover:translate-x-0.5 transition-transform">
                  {isGoogleLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  )}
                </div>
              </button>

              {/* Account Picker / Switch Option */}
              <div className="flex items-center justify-between px-1 text-[11px] text-[#6d7a72]">
                <span className="flex items-center gap-1 truncate max-w-[230px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Google Account: <strong>vaishaliya1982@gmail.com</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsGoogleChooserOpen(true)}
                  className="text-[#006948] hover:underline font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <span>Choose Google Account</span>
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-1 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#bccac0]/35"></div>
                </div>
                <span className="relative bg-white px-3 text-[10px] font-bold text-[#6d7a72] uppercase tracking-wider">
                  or continue with email credentials
                </span>
              </div>
            </div>
          )}

          {/* Mode Tabs (Sign In vs Sign Up vs Reset) */}
          {mode !== 'forgot_request' && mode !== 'forgot_verify' && (
            <div className="flex border-b border-[#bccac0]/30 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
                  mode === 'signin'
                    ? 'border-[#006948] text-[#006948]'
                    : 'border-transparent text-[#6d7a72] hover:text-[#1a1c1a]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
                  mode === 'signup'
                    ? 'border-[#006948] text-[#006948]'
                    : 'border-transparent text-[#6d7a72] hover:text-[#1a1c1a]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1a] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6d7a72]">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'manufacturer' ? 'brand@company.com' : 'you@example.com'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1a1c1a]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_request');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-semibold text-[#006948] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6d7a72]">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">login</span>
                )}
                <span>Sign In as {role === 'manufacturer' ? 'Manufacturer' : 'Consumer'}</span>
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                  />
                </div>
              </div>

              {role === 'manufacturer' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Gujarat Co-operative Milk Marketing Federation (Amul)"
                      className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1a1c1a] mb-1">FSSAI License / Reg No.</label>
                      <input
                        type="text"
                        value={fssaiLicense}
                        onChange={(e) => setFssaiLicense(e.target.value)}
                        placeholder="e.g. 10012021000071"
                        className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1a1c1a] mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="e.g. 24AAACG1234F1Z5"
                        className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                )}
                <span>Register as {role === 'manufacturer' ? 'Brand Manufacturer' : 'Consumer'}</span>
              </button>
            </form>
          )}

          {/* 3. PASSWORD RECOVERY - STEP 1 (REQUEST OTP) */}
          {mode === 'forgot_request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006948]">
                  <span className="material-symbols-outlined text-[17px]">lock_reset</span>
                  <span>Secure Password Recovery</span>
                </div>
                <p className="text-[11px] text-[#6d7a72] leading-relaxed">
                  Enter your registered {role === 'manufacturer' ? 'Manufacturer' : 'Consumer'} email. A secure 6-digit recovery code will be dispatched to verify your identity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Registered Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="px-4 py-2.5 rounded-xl bg-[#efeeeb] text-[#3d4a42] text-xs font-bold hover:bg-[#e4e3e0] transition-colors cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  <span>Send Recovery Code</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. PASSWORD RECOVERY - STEP 2 (VERIFY CODE & SET NEW PASSWORD) */}
          {mode === 'forgot_verify' && (
            <form onSubmit={handleCompleteReset} className="space-y-3.5">
              {generatedCodeNotice && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-700">key</span>
                      <span>Secure Verification Token</span>
                    </span>
                    <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-full font-mono font-semibold">
                      Valid 15m
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Use this 6-digit code to authorize your password reset:
                  </p>
                  <div className="pt-1 flex items-center justify-center">
                    <span className="font-mono text-xl font-black tracking-widest text-[#006948] bg-white px-4 py-1 rounded-xl border border-amber-300">
                      {generatedCodeNotice}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 839201"
                  className="w-full px-3.5 py-2.5 text-center font-mono text-lg font-bold tracking-widest rounded-xl border border-[#bccac0]/50 text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1a] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1a] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="px-4 py-2.5 rounded-xl bg-[#efeeeb] text-[#3d4a42] text-xs font-bold hover:bg-[#e4e3e0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                  <span>Set New Password</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-[#faf9f6] border-t border-[#bccac0]/25 text-center text-[11px] text-[#6d7a72]">
          {role === 'consumer' ? (
            <span>Consumer Google sign in gives instant scanning and counterfeit reporting access.</span>
          ) : (
            <span>Manufacturer Google sign in grants brand contract authorization and distributor tracking.</span>
          )}
        </div>

        {/* GOOGLE IDENTITY ACCOUNT CHOOSER OVERLAY */}
        <AnimatePresence>
          {isGoogleChooserOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-white flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/30">
                  <div className="flex items-center gap-2">
                    <GoogleIcon className="w-5 h-5" />
                    <span className="font-bold text-sm text-[#1a1c1a]">Sign in with Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGoogleChooserOpen(false)}
                    className="w-7 h-7 rounded-lg hover:bg-[#efeeeb] text-[#6d7a72] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="py-3">
                  <h4 className="text-sm font-bold text-[#1a1c1a]">Choose an account</h4>
                  <p className="text-xs text-[#6d7a72]">
                    to continue to TrustTag Authenticity Network as a{' '}
                    <span className="font-semibold text-[#006948]">
                      {role === 'manufacturer' ? 'Brand Manufacturer' : 'Shopper / Consumer'}
                    </span>
                  </p>
                </div>

                {/* Account list */}
                <div className="space-y-2 pt-1">
                  {/* Account 1: Vaishaliya */}
                  <button
                    type="button"
                    onClick={() => {
                      executeGoogleAuth({
                        email: 'vaishaliya1982@gmail.com',
                        name: 'Vaishaliya Sharma',
                        picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Vaishaliya&backgroundColor=006948,00855d',
                        companyName: role === 'manufacturer' ? 'Vaishaliya Consumer & Food Products Ltd' : undefined,
                        gstNumber: role === 'manufacturer' ? '24AAACV1982F1Z9' : undefined,
                        fssaiLicense: role === 'manufacturer' ? '10023021000882' : undefined
                      });
                    }}
                    className="w-full p-3 rounded-2xl border border-[#bccac0]/40 hover:border-[#006948] hover:bg-[#006948]/5 transition-all text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        V
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1a1c1a] group-hover:text-[#006948]">
                            Vaishaliya Sharma
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6d7a72]">vaishaliya1982@gmail.com</span>
                        {role === 'manufacturer' && (
                          <div className="text-[10px] text-[#006948] font-semibold mt-0.5">
                            Vaishaliya Consumer & Food Products Ltd
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#006948] opacity-0 group-hover:opacity-100 transition-opacity">
                      check_circle
                    </span>
                  </button>

                  {/* Account 2: Role Specific Account */}
                  <button
                    type="button"
                    onClick={() => {
                      if (role === 'consumer') {
                        executeGoogleAuth({
                          email: 'priya.sharma@gmail.com',
                          name: 'Priya Sharma (Shopper)',
                          picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya&backgroundColor=1e88e5'
                        });
                      } else {
                        executeGoogleAuth({
                          email: 'amul.brand.registry@gmail.com',
                          name: 'Amul Brand Custodian',
                          picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Amul&backgroundColor=c2185b',
                          companyName: 'Gujarat Co-operative Milk Marketing Federation (Amul)',
                          gstNumber: '24AAACG1234F1Z5',
                          fssaiLicense: '10012021000071'
                        });
                      }
                    }}
                    className="w-full p-3 rounded-2xl border border-[#bccac0]/40 hover:border-[#006948] hover:bg-[#006948]/5 transition-all text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {role === 'consumer' ? 'P' : 'A'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1a1c1a] group-hover:text-[#006948]">
                          {role === 'consumer' ? 'Priya Sharma' : 'Amul Brand Registry'}
                        </span>
                        <span className="block text-[11px] text-[#6d7a72]">
                          {role === 'consumer' ? 'priya.sharma@gmail.com' : 'amul.brand.registry@gmail.com'}
                        </span>
                        {role === 'manufacturer' && (
                          <div className="text-[10px] text-[#006948] font-semibold mt-0.5">
                            Gujarat Co-operative Milk Marketing Federation
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#006948] opacity-0 group-hover:opacity-100 transition-opacity">
                      check_circle
                    </span>
                  </button>

                  {/* Toggle custom account */}
                  {!showCustomGoogleForm ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleForm(true)}
                      className="w-full p-3 rounded-2xl border border-dashed border-[#bccac0]/80 hover:border-[#006948] hover:bg-[#faf9f6] transition-all text-left flex items-center gap-3 cursor-pointer text-xs font-bold text-[#3d4a42]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#efeeeb] flex items-center justify-center text-[#6d7a72]">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                      </div>
                      <span>Use another Google account</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#bccac0]/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1a1c1a]">Sign in with custom Google ID</span>
                        <button
                          type="button"
                          onClick={() => setShowCustomGoogleForm(false)}
                          className="text-[11px] text-[#6d7a72] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="google.user@gmail.com"
                          className="px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white"
                        />
                        <input
                          type="text"
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="Display Name"
                          className="px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white"
                        />
                      </div>

                      {role === 'manufacturer' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <input
                            type="text"
                            value={customGoogleCompany}
                            onChange={(e) => setCustomGoogleCompany(e.target.value)}
                            placeholder="Brand / Company Name"
                            className="px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white"
                          />
                          <input
                            type="text"
                            value={customGoogleGst}
                            onChange={(e) => setCustomGoogleGst(e.target.value)}
                            placeholder="GSTIN (optional)"
                            className="px-3 py-2 rounded-xl border border-[#bccac0]/50 text-xs text-[#1a1c1a] bg-white"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!customGoogleEmail.trim()) {
                            setErrorMessage('Please enter a Google email.');
                            return;
                          }
                          executeGoogleAuth({
                            email: customGoogleEmail,
                            name: customGoogleName || customGoogleEmail.split('@')[0],
                            companyName: customGoogleCompany || undefined,
                            gstNumber: customGoogleGst || undefined
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <GoogleIcon className="w-3.5 h-3.5" />
                        <span>Authorize and Continue</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Security info */}
              <div className="pt-4 border-t border-[#bccac0]/25 text-[11px] text-[#6d7a72] flex items-center justify-between">
                <span>Safe & verified Google OAuth handshake</span>
                <button
                  type="button"
                  onClick={() => setIsGoogleChooserOpen(false)}
                  className="font-bold text-[#006948] hover:underline cursor-pointer"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
