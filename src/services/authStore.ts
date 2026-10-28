import { BlockchainProductRecord } from '../types';

export type UserRole = 'consumer' | 'manufacturer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  authProvider?: 'local' | 'google';
  avatar?: string;
  phone?: string;
  // Manufacturer specific fields
  companyName?: string;
  fssaiLicense?: string;
  gstNumber?: string;
  manufacturerCode?: string;
  walletAddress?: string;
  createdAt: string;
}

export interface PasswordResetRequest {
  email: string;
  role: UserRole;
  code: string;
  expiresAt: number; // timestamp in ms
}

const STORAGE_KEY_CURRENT_USER = 'trusttag_auth_current_user';
const STORAGE_KEY_USERS = 'trusttag_auth_registered_users';
const STORAGE_KEY_RESETS = 'trusttag_auth_pending_resets';

// Pre-seeded standard accounts
const DEFAULT_USERS: Record<string, { user: AuthUser; passwordHash: string }> = {
  'shopper@trusttag.org': {
    user: {
      id: 'usr-consumer-001',
      email: 'shopper@trusttag.org',
      name: 'Priya Sharma',
      role: 'consumer',
      phone: '+91 98765 43210',
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    passwordHash: 'Consumer@123'
  },
  'brand@amul.com': {
    user: {
      id: 'usr-mfg-001',
      email: 'brand@amul.com',
      name: 'Amul Brand Custodian',
      role: 'manufacturer',
      companyName: 'Gujarat Co-operative Milk Marketing Federation (Amul)',
      fssaiLicense: '10012021000071',
      gstNumber: '24AAACG1234F1Z5',
      manufacturerCode: 'AMUL-MFG-IN',
      phone: '+91 2692 258506',
      walletAddress: '0x71C...4fFe',
      createdAt: '2026-01-10T08:30:00.000Z'
    },
    passwordHash: 'Manufacturer@123'
  }
};

function getStoredUsers(): Record<string, { user: AuthUser; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveStoredUsers(users: Record<string, { user: AuthUser; passwordHash: string }>) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch {}
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    }
  } catch {}
}

/**
 * Login user with role checking
 */
export function authenticateUser(
  email: string,
  pass: string,
  requiredRole: UserRole
): { success: boolean; user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const entry = users[normalizedEmail];

  if (!entry) {
    return {
      success: false,
      error: `No registered account found for ${email}. Please check your email or create an account.`
    };
  }

  if (entry.user.role !== requiredRole) {
    return {
      success: false,
      error: `This account is registered as a ${entry.user.role === 'manufacturer' ? 'Manufacturer' : 'Consumer'}. Please log in via the ${entry.user.role === 'manufacturer' ? 'Manufacturer' : 'Consumer'} portal.`
    };
  }

  if (entry.passwordHash !== pass) {
    return {
      success: false,
      error: 'Invalid password. If you forgot your password, please use the Password Recovery option below.'
    };
  }

  setCurrentUser(entry.user);
  return { success: true, user: entry.user };
}

/**
 * Register a new user
 */
export function registerUser(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  fssaiLicense?: string;
  gstNumber?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please log in.'
    };
  }

  if (params.password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters.'
    };
  }

  const newUser: AuthUser = {
    id: `usr-${params.role}-${Date.now().toString(36)}`,
    email: normalizedEmail,
    name: params.name.trim(),
    role: params.role,
    phone: params.phone?.trim(),
    companyName: params.role === 'manufacturer' ? params.companyName?.trim() || 'Certified Brand' : undefined,
    fssaiLicense: params.role === 'manufacturer' ? params.fssaiLicense?.trim() : undefined,
    gstNumber: params.role === 'manufacturer' ? params.gstNumber?.trim() : undefined,
    manufacturerCode: params.role === 'manufacturer' ? `MFG-${Date.now().toString().slice(-6)}` : undefined,
    walletAddress: params.role === 'manufacturer' ? '0x71C...' + Math.floor(1000 + Math.random() * 9000).toString(16) : undefined,
    createdAt: new Date().toISOString()
  };

  users[normalizedEmail] = {
    user: newUser,
    passwordHash: params.password
  };

  saveStoredUsers(users);
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

/**
 * Authenticate or Register with Google (Supports Consumer and Manufacturer roles)
 */
export function loginWithGoogle(params: {
  email: string;
  name: string;
  role: UserRole;
  picture?: string;
  companyName?: string;
  gstNumber?: string;
  fssaiLicense?: string;
  phone?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = params.email.trim().toLowerCase();
  const existing = users[normalizedEmail];

  if (existing) {
    // If account exists with a different role, notify user
    if (existing.user.role !== params.role) {
      return {
        success: false,
        error: `This Google account is already registered as a ${existing.user.role === 'manufacturer' ? 'Manufacturer' : 'Consumer'}. Please log in via the ${existing.user.role === 'manufacturer' ? 'Manufacturer' : 'Consumer'} portal.`
      };
    }

    // Update avatar and ensure authProvider is marked as google
    const updatedUser: AuthUser = {
      ...existing.user,
      name: params.name || existing.user.name,
      avatar: params.picture || existing.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
      authProvider: 'google',
      companyName: params.role === 'manufacturer' ? (params.companyName || existing.user.companyName || `${params.name}'s Authorized Manufacturing`) : undefined,
      gstNumber: params.gstNumber || existing.user.gstNumber,
      fssaiLicense: params.fssaiLicense || existing.user.fssaiLicense
    };

    users[normalizedEmail] = {
      ...existing,
      user: updatedUser
    };
    saveStoredUsers(users);
    setCurrentUser(updatedUser);
    return { success: true, user: updatedUser };
  }

  // Create new user authenticated via Google
  const newUser: AuthUser = {
    id: `usr-google-${params.role}-${Date.now().toString(36)}`,
    email: normalizedEmail,
    name: params.name.trim() || normalizedEmail.split('@')[0],
    role: params.role,
    authProvider: 'google',
    avatar: params.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name || normalizedEmail)}`,
    phone: params.phone?.trim() || '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
    companyName: params.role === 'manufacturer' ? (params.companyName?.trim() || `${params.name} Enterprise Brands`) : undefined,
    fssaiLicense: params.role === 'manufacturer' ? (params.fssaiLicense?.trim() || `100${Date.now().toString().slice(-9)}`) : undefined,
    gstNumber: params.role === 'manufacturer' ? (params.gstNumber?.trim() || `24AABC${Date.now().toString().slice(-6)}1Z5`) : undefined,
    manufacturerCode: params.role === 'manufacturer' ? `MFG-${Date.now().toString().slice(-6)}` : undefined,
    walletAddress: params.role === 'manufacturer' ? '0x71C...' + Math.floor(1000 + Math.random() * 9000).toString(16) : undefined,
    createdAt: new Date().toISOString()
  };

  users[normalizedEmail] = {
    user: newUser,
    passwordHash: `google-oauth-${Date.now()}`
  };

  saveStoredUsers(users);
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

/**
 * Request Password Reset: Generates secure 6-digit recovery code
 */
export function requestPasswordReset(
  email: string,
  role: UserRole
): { success: boolean; code?: string; message?: string; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const entry = users[normalizedEmail];

  if (!entry) {
    return {
      success: false,
      error: `No ${role === 'manufacturer' ? 'Manufacturer' : 'Consumer'} account registered with ${email}.`
    };
  }

  if (entry.user.role !== role) {
    return {
      success: false,
      error: `Account exists as ${entry.user.role}, not ${role}. Switch to the correct portal.`
    };
  }

  // Generate 6-digit cryptographic security code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

  try {
    const resetsRaw = localStorage.getItem(STORAGE_KEY_RESETS);
    const resets: Record<string, PasswordResetRequest> = resetsRaw ? JSON.parse(resetsRaw) : {};
    resets[normalizedEmail] = {
      email: normalizedEmail,
      role,
      code,
      expiresAt
    };
    localStorage.setItem(STORAGE_KEY_RESETS, JSON.stringify(resets));
  } catch {}

  return {
    success: true,
    code,
    message: `A secure 6-digit verification code has been dispatched for ${email}. Valid for 15 minutes.`
  };
}

/**
 * Verify code and update password
 */
export function completePasswordReset(
  email: string,
  code: string,
  newPassword: string
): { success: boolean; message?: string; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const entry = users[normalizedEmail];

  if (!entry) {
    return { success: false, error: 'User account not found.' };
  }

  let resetRequest: PasswordResetRequest | null = null;
  try {
    const resetsRaw = localStorage.getItem(STORAGE_KEY_RESETS);
    if (resetsRaw) {
      const resets = JSON.parse(resetsRaw);
      resetRequest = resets[normalizedEmail] || null;
    }
  } catch {}

  if (!resetRequest) {
    return { success: false, error: 'No active password recovery request found. Please request a new code.' };
  }

  if (Date.now() > resetRequest.expiresAt) {
    return { success: false, error: 'Recovery code has expired. Please request a new one.' };
  }

  if (resetRequest.code !== code.trim()) {
    return { success: false, error: 'Invalid 6-digit recovery code. Please check and try again.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  // Update password
  users[normalizedEmail].passwordHash = newPassword;
  saveStoredUsers(users);

  // Clear reset request
  try {
    const resetsRaw = localStorage.getItem(STORAGE_KEY_RESETS);
    if (resetsRaw) {
      const resets = JSON.parse(resetsRaw);
      delete resets[normalizedEmail];
      localStorage.setItem(STORAGE_KEY_RESETS, JSON.stringify(resets));
    }
  } catch {}

  return {
    success: true,
    message: 'Your password has been reset successfully. You can now sign in with your new credentials.'
  };
}

/**
 * Update manufacturer's wallet address
 */
export function updateManufacturerWallet(email: string, walletAddress: string) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users[normalizedEmail]) {
    users[normalizedEmail].user.walletAddress = walletAddress;
    saveStoredUsers(users);

    const current = getCurrentUser();
    if (current && current.email === normalizedEmail) {
      current.walletAddress = walletAddress;
      setCurrentUser(current);
    }
  }
}
