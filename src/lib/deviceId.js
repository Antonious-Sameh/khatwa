// src/lib/deviceId.js
// Generates and persists a stable per-browser identifier used to bind a
// student account to a single device (see backend User.deviceId /
// auth.controller login). This is a best-effort browser fingerprint stored
// in localStorage — not a hardware ID — which matches what's achievable on
// the open web/PWA. Sent on every login request; the backend only enforces
// it for students, teachers are unaffected.

import { safeLocalStorage, safeSessionStorage } from "./safe-storage";

const DEVICE_ID_KEY = "khatwa_device_id";

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers without crypto.randomUUID
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getDeviceId() {
  // 1) Normal path — localStorage already has one (survives across tabs/reloads).
  let id = safeLocalStorage.getItem(DEVICE_ID_KEY);
  if (id) return id;

  // 2) On some devices localStorage.setItem silently fails (private mode /
  //    storage quota / disabled storage) even though getItem works. If we
  //    already fell back to sessionStorage earlier in this same browser
  //    session, reuse that id instead of generating a new one on every reload.
  id = safeSessionStorage.getItem(DEVICE_ID_KEY);
  if (id) return id;

  // 3) No id anywhere yet — generate one and try to persist it in localStorage.
  id = generateId();
  const savedToLocalStorage = safeLocalStorage.setItem(DEVICE_ID_KEY, id);

  if (!savedToLocalStorage) {
    // localStorage write didn't actually succeed — keep the same id stable
    // for the rest of this session via sessionStorage instead of silently
    // minting a fresh id (and a "new device") on every page load.
    safeSessionStorage.setItem(DEVICE_ID_KEY, id);
  }

  return id;
}
