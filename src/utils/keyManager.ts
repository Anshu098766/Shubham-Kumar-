import { KeyDuration, LicenseKey } from '../types';

export const ADMIN_MASTER_KEY = 'ANSH9324';
const STORAGE_KEYS_LIST = 'ansh_predictor_keys_v1';
const STORAGE_ACTIVE_SESSION = 'ansh_predictor_active_key_v1';

export const DURATION_CONFIG: Record<
  KeyDuration,
  { label: string; hours: number; prefix: string; description: string }
> = {
  '1D': { label: '1 DAY (24H)', hours: 24, prefix: '1D', description: 'Standard 24-Hour Access' },
  '3D': { label: '3 DAYS (72H)', hours: 72, prefix: '3D', description: 'Pro 3-Day Pass' },
  '7D': { label: '7 DAYS (1 WEEK)', hours: 168, prefix: '7D', description: 'ANSH Weekly Access' },
  '30D': { label: '30 DAYS (1 MONTH)', hours: 720, prefix: '30D', description: 'Monthly Premium ANSH' },
  LIFETIME: { label: 'LIFETIME ACCESS', hours: 876000, prefix: 'LIFE', description: 'Permanent ANSH Unlimited' },
};

function generateRandomKeyString(duration: KeyDuration): string {
  const prefix = DURATION_CONFIG[duration].prefix;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ANSH-${prefix}-${rand}`;
}

export function getStoredKeys(): LicenseKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS_LIST);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read stored keys:', e);
  }

  // Pre-seed with default keys for instant testing
  const seedKeys: LicenseKey[] = [
    {
      id: 'key-1d-seed',
      key: 'ANSH-1D-DEMO24',
      duration: '1D',
      durationLabel: '1 DAY (24H)',
      durationHours: 24,
      createdAt: Date.now(),
      status: 'UNUSED',
      note: 'Demo 1 Day Key',
    },
    {
      id: 'key-7d-seed',
      key: 'ANSH-7D-ANSHPASS',
      duration: '7D',
      durationLabel: '7 DAYS (1 WEEK)',
      durationHours: 168,
      createdAt: Date.now(),
      status: 'UNUSED',
      note: 'Weekly ANSH Pass',
    },
    {
      id: 'key-life-seed',
      key: 'ANSH-LIFE-ANSH99',
      duration: 'LIFETIME',
      durationLabel: 'LIFETIME ACCESS',
      durationHours: 876000,
      createdAt: Date.now(),
      status: 'UNUSED',
      note: 'Lifetime Master Key',
    },
  ];

  saveStoredKeys(seedKeys);
  return seedKeys;
}

export function saveStoredKeys(keys: LicenseKey[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS_LIST, JSON.stringify(keys));
  } catch (e) {
    console.error('Failed to save keys to localStorage:', e);
  }
}

export function generateNewKey(duration: KeyDuration, note?: string): LicenseKey {
  const keys = getStoredKeys();
  const config = DURATION_CONFIG[duration];
  const newKey: LicenseKey = {
    id: `key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    key: generateRandomKeyString(duration),
    duration,
    durationLabel: config.label,
    durationHours: config.hours,
    createdAt: Date.now(),
    status: 'UNUSED',
    note: note || `Created on ${new Date().toLocaleDateString()}`,
  };

  keys.unshift(newKey);
  saveStoredKeys(keys);
  return newKey;
}

export function generateBulkKeys(duration: KeyDuration, count: number, note?: string): LicenseKey[] {
  const newKeys: LicenseKey[] = [];
  for (let i = 0; i < count; i++) {
    newKeys.push(generateNewKey(duration, note ? `${note} #${i + 1}` : undefined));
  }
  return newKeys;
}

export function deleteKey(id: string): void {
  const keys = getStoredKeys().filter((k) => k.id !== id);
  saveStoredKeys(keys);
}

export function revokeKey(id: string): void {
  const keys = getStoredKeys().map((k) => {
    if (k.id === id) {
      return { ...k, status: 'REVOKED' as const };
    }
    return k;
  });
  saveStoredKeys(keys);
}

export function extendKey(id: string, additionalHours: number): void {
  const keys = getStoredKeys().map((k) => {
    if (k.id === id) {
      const currentExpiry = k.expiresAt || (k.activatedAt ? k.activatedAt + k.durationHours * 3600000 : Date.now());
      const newExpiry = currentExpiry + additionalHours * 3600000;
      return {
        ...k,
        expiresAt: newExpiry,
        durationHours: k.durationHours + additionalHours,
        status: (newExpiry > Date.now() ? 'ACTIVE' : 'EXPIRED') as 'ACTIVE' | 'EXPIRED',
      };
    }
    return k;
  });
  saveStoredKeys(keys);
}

export function validateAndActivateKey(rawInput: string): {
  success: boolean;
  message: string;
  key?: LicenseKey;
  isAdmin?: boolean;
} {
  const cleanKey = rawInput.trim();

  if (!cleanKey) {
    return { success: false, message: 'Please enter a valid License Key or Admin Key' };
  }

  // 1. Check if Admin Key
  if (cleanKey === ADMIN_MASTER_KEY) {
    const adminSessionKey: LicenseKey = {
      id: 'admin_session_key',
      key: ADMIN_MASTER_KEY,
      duration: 'LIFETIME',
      durationLabel: 'ADMIN MASTER ACCESS',
      durationHours: 876000,
      createdAt: Date.now(),
      activatedAt: Date.now(),
      expiresAt: Date.now() + 876000 * 3600000,
      status: 'ACTIVE',
      note: 'Master Administrator Key',
    };
    saveActiveSession(adminSessionKey);
    return {
      success: true,
      message: 'ADMINISTRATOR AUTHENTICATED SUCCESSFULLY! 👑',
      key: adminSessionKey,
      isAdmin: true,
    };
  }

  // 2. Search key in storage
  const keys = getStoredKeys();
  const foundIndex = keys.findIndex(
    (k) => k.key.toUpperCase() === cleanKey.toUpperCase()
  );

  if (foundIndex === -1) {
    return {
      success: false,
      message: 'INVALID LICENSE KEY! Please check key or contact Admin.',
    };
  }

  const keyObj = keys[foundIndex];

  if (keyObj.status === 'REVOKED') {
    return {
      success: false,
      message: 'THIS LICENSE KEY HAS BEEN REVOKED BY ADMIN!',
    };
  }

  const now = Date.now();

  // If already activated, check if expired
  if (keyObj.activatedAt && keyObj.expiresAt) {
    if (now > keyObj.expiresAt) {
      keyObj.status = 'EXPIRED';
      keys[foundIndex] = keyObj;
      saveStoredKeys(keys);
      return {
        success: false,
        message: 'LICENSE KEY HAS EXPIRED! Please renew with Admin.',
      };
    }

    saveActiveSession(keyObj);
    return {
      success: true,
      message: `LICENSE ACTIVATED (${keyObj.durationLabel})`,
      key: keyObj,
      isAdmin: false,
    };
  }

  // First time activation!
  const durationMs = keyObj.durationHours * 60 * 60 * 1000;
  keyObj.activatedAt = now;
  keyObj.expiresAt = now + durationMs;
  keyObj.status = 'ACTIVE';

  keys[foundIndex] = keyObj;
  saveStoredKeys(keys);
  saveActiveSession(keyObj);

  return {
    success: true,
    message: `LICENSE KEY ACTIVATED SUCCESSFULLY! Valid for ${keyObj.durationLabel}`,
    key: keyObj,
    isAdmin: false,
  };
}

export function saveActiveSession(key: LicenseKey): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify(key));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_ACTIVE_SESSION);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export function getActiveSession(): {
  isValid: boolean;
  key?: LicenseKey;
  isAdmin?: boolean;
  timeLeftFormatted?: string;
  isExpired?: boolean;
} {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_SESSION);
    if (!raw) return { isValid: false };

    const keyObj: LicenseKey = JSON.parse(raw);

    if (keyObj.key === ADMIN_MASTER_KEY) {
      return {
        isValid: true,
        isAdmin: true,
        key: keyObj,
        timeLeftFormatted: 'UNLIMITED (ADMIN)',
      };
    }

    // Refresh from stored keys list in case revoked by admin
    const allKeys = getStoredKeys();
    const fresh = allKeys.find((k) => k.id === keyObj.id);

    if (fresh) {
      if (fresh.status === 'REVOKED') {
        clearActiveSession();
        return { isValid: false, isExpired: true };
      }

      if (fresh.expiresAt && Date.now() > fresh.expiresAt) {
        fresh.status = 'EXPIRED';
        saveStoredKeys(allKeys);
        clearActiveSession();
        return { isValid: false, isExpired: true };
      }

      return {
        isValid: true,
        isAdmin: false,
        key: fresh,
        timeLeftFormatted: formatTimeRemaining(fresh.expiresAt),
      };
    }

    // Fallback on cached object
    if (keyObj.expiresAt && Date.now() > keyObj.expiresAt) {
      clearActiveSession();
      return { isValid: false, isExpired: true };
    }

    return {
      isValid: true,
      isAdmin: false,
      key: keyObj,
      timeLeftFormatted: formatTimeRemaining(keyObj.expiresAt),
    };
  } catch {
    return { isValid: false };
  }
}

export function formatTimeRemaining(expiresAt?: number): string {
  if (!expiresAt) return 'NOT ACTIVATED';
  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) return 'EXPIRED';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 365) return 'LIFETIME (PERMANENT)';
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}
