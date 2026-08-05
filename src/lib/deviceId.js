// src/lib/deviceId.js
// Generates and persists a stable per-browser identifier used to bind a
// student account to a single device (see backend User.deviceId /
// auth.controller login). This is a best-effort browser fingerprint stored
// in localStorage — not a hardware ID — which matches what's achievable on
// the open web/PWA. Sent on every login request; the backend only enforces
// it for students, teachers are unaffected.

import { safeLocalStorage } from './safe-storage';

const DEVICE_ID_KEY = 'khatwa_device_id';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers without crypto.randomUUID
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getDeviceId() {
  let id = safeLocalStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateId();
    safeLocalStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}