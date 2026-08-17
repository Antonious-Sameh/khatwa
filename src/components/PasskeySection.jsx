// src/components/PasskeySection.jsx
// Optional "🔐 تفعيل الدخول بالبصمة" toggle, shared by the teacher and
// student account pages. Renders nothing on devices/browsers that don't
// support WebAuthn — normal login is completely unaffected either way.
//
// No biometric data ever passes through this component or the app itself —
// the device's own OS handles Fingerprint/Face ID/Windows Hello and only
// hands back a WebAuthn public-key credential.

import React, { useEffect, useState } from 'react';
import { Fingerprint, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  isPasskeySupported,
  isPasskeyEnabledOnThisDevice,
  enablePasskey,
  disablePasskeyOnThisDevice,
} from '@/lib/passkey';

export default function PasskeySection() {
  const [supported, setSupported] = useState(false);
  const [enabled,   setEnabled]   = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [busy,      setBusy]      = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = isPasskeySupported();
      setSupported(ok);
      if (ok) {
        const on = await isPasskeyEnabledOnThisDevice();
        if (alive) setEnabled(on);
      }
      if (alive) setChecking(false);
    })();
    return () => { alive = false; };
  }, []);

  // Unsupported device/browser → show nothing at all; normal login remains
  // the only (fully working) option, exactly as before this feature existed.
  if (!supported) return null;

  const handleEnable = async () => {
    setBusy(true);
    try {
      const result = await enablePasskey();
      if (result.ok) {
        setEnabled(true);
        toast.success('تم تفعيل الدخول بالبصمة على هذا الجهاز');
      } else if (result.reason !== 'cancelled') {
        toast.error(result.error?.response?.data?.message || 'تعذر تفعيل الدخول بالبصمة على هذا الجهاز');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      const ok = await disablePasskeyOnThisDevice();
      if (ok) {
        setEnabled(false);
        toast.success('تم إلغاء تفعيل الدخول بالبصمة على هذا الجهاز');
      } else {
        toast.error('تعذر إلغاء التفعيل، حاول مرة أخرى');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
          enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {enabled ? <ShieldCheck className="h-5 w-5" /> : <Fingerprint className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">الدخول بالبصمة</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {enabled
              ? 'مُفعّل على هذا الجهاز'
              : 'استخدم بصمتك أو Face ID لتسجيل الدخول بسرعة على هذا الجهاز'}
          </p>
        </div>
      </div>

      {checking ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
      ) : enabled ? (
        <Button type="button" size="sm" variant="outline" onClick={handleDisable} disabled={busy} className="shrink-0">
          {busy ? 'جارٍ الإلغاء...' : 'إلغاء التفعيل'}
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={handleEnable} disabled={busy} className="shrink-0">
          {busy ? 'جارٍ التفعيل...' : '🔐 تفعيل'}
        </Button>
      )}
    </div>
  );
}
