// src/lib/passkey.js
// Thin wrapper around @simplewebauthn/browser + the passkey API endpoints.
// Every function is safe to call even when the browser doesn't support
// WebAuthn — they resolve to a clear { ok:false, reason:'unsupported' }
// result instead of throwing, so callers never need special-case try/catch
// just to keep normal login working on unsupported devices/browsers.

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import { passkeyAPI } from '@/api/services';
import { getDeviceId } from '@/lib/deviceId';

export function isPasskeySupported() {
  try {
    return browserSupportsWebAuthn();
  } catch {
    return false;
  }
}

// Registers a passkey for the current device — call only when the user is
// already logged in normally and taps "🔐 تفعيل الدخول بالبصمة".
export async function enablePasskey() {
  if (!isPasskeySupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  const deviceId = getDeviceId();

  try {
    const { options } = await passkeyAPI.registerOptions(deviceId);
    const attestation  = await startRegistration(options);
    await passkeyAPI.registerVerify(attestation);
    return { ok: true };
  } catch (err) {
    // The user cancelling the fingerprint/Face ID prompt is not an error we
    // need to surface loudly — normal login remains fully available.
    if (err?.name === 'NotAllowedError') {
      return { ok: false, reason: 'cancelled' };
    }
    return { ok: false, reason: 'error', error: err };
  }
}

// Logs the user in with a passkey stored on this device/browser. On success
// returns the SAME shape as authAPI.login()'s resolved data.
export async function loginWithPasskey() {
  if (!isPasskeySupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    const { options } = await passkeyAPI.loginOptions();
    const assertion    = await startAuthentication(options);
    const data          = await passkeyAPI.loginVerify(assertion);
    return { ok: true, data };
  } catch (err) {
    if (err?.name === 'NotAllowedError') {
      return { ok: false, reason: 'cancelled' };
    }
    return { ok: false, reason: 'error', error: err };
  }
}

export async function isPasskeyEnabledOnThisDevice() {
  if (!isPasskeySupported()) return false;
  try {
    const { enabled } = await passkeyAPI.status(getDeviceId());
    return !!enabled;
  } catch {
    return false;
  }
}

export async function disablePasskeyOnThisDevice() {
  try {
    await passkeyAPI.remove(getDeviceId());
    return true;
  } catch {
    return false;
  }
}
