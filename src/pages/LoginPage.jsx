import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export default function LoginPage() {
  const [code,     setCode]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showCode, setShowCode] = useState(false);

  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = code.trim().replace(/\s+/g, '');
    if (!trimmed) { toast.error('يرجى إدخال كود الدخول'); return; }
    setLoading(true);
    try {
      const user = await login(trimmed);
      toast.success(`مرحباً بك ${user.name}`);
      const from = location.state?.from?.pathname;
      if (from && from !== '/') navigate(from, { replace: true });
      else navigate(user.role === 'teacher' ? '/teacher/home' : '/student/home', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'كود الدخول غير صحيح، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCode(e.target.value.replace(/\s+/g, '').toUpperCase());
  };

  return (
    <>
      <Helmet><title>تسجيل الدخول | منصة خطوة التعليمية</title></Helmet>

      {/* ── Full-screen dark background ── */}
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1a2e 50%, #0a0f1e 100%)' }}
      >
        {/* Subtle animated shimmer lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: 'absolute', top: '20%', left: '-10%',
            width: '120%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
          }} />
          <div style={{
            position: 'absolute', top: '60%', left: '-10%',
            width: '120%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent)',
          }} />
          {/* Corner ornaments */}
          <svg className="absolute top-0 left-0 w-32 h-32 opacity-10" viewBox="0 0 100 100" fill="none">
            <path d="M0 0 L100 0 L0 100 Z" fill="rgba(212,175,55,0.3)" />
            <path d="M10 0 L0 10 M20 0 L0 20 M30 0 L0 30" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
          </svg>
          <svg className="absolute top-0 right-0 w-32 h-32 opacity-10" viewBox="0 0 100 100" fill="none">
            <path d="M100 0 L0 0 L100 100 Z" fill="rgba(212,175,55,0.3)" />
            <path d="M90 0 L100 10 M80 0 L100 20 M70 0 L100 30" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-32 h-32 opacity-10" viewBox="0 0 100 100" fill="none">
            <path d="M0 100 L100 100 L0 0 Z" fill="rgba(212,175,55,0.3)" />
          </svg>
          <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-10" viewBox="0 0 100 100" fill="none">
            <path d="M100 100 L0 100 L100 0 Z" fill="rgba(212,175,55,0.3)" />
          </svg>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">

          {/* ── Logo ── */}
          <div className="mb-6 flex flex-col items-center">
            <img
              src="/logo.png"
              alt="منصة خطوة"
              className="w-52 sm:w-64 drop-shadow-2xl"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* ── Divider with ankh ── */}
          <div className="flex items-center gap-3 mb-7 w-full max-w-sm">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5))' }} />
            <span style={{ color: '#D4AF37', fontSize: '1.3rem' }}>☥</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, transparent, rgba(212,175,55,0.5))' }} />
          </div>

          {/* ── Login Card ── */}
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.04) 100%)',
              border: '1px solid rgba(212,175,55,0.25)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.1)',
            }}
          >
            {/* Card header */}
            <div
              className="px-6 pt-6 pb-5 text-center"
              style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}
            >
              <h2
                className="text-xl font-bold tracking-wide mb-1"
                style={{ color: '#D4AF37', fontFamily: 'serif' }}
              >
                الخطوة الأولى: تسجيل الدخول
              </h2>
              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>
                أدخل كود الدخول الخاص بك
              </p>
            </div>

            {/* Card body */}
            <div className="px-6 py-7">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Input */}
                <div className="relative">
                  {/* Eye of Horus icon */}
                  <div
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{ color: 'rgba(212,175,55,0.7)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>

                  <input
                    type={showCode ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={code}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoFocus
                    autoComplete="current-password"
                    autoCapitalize="characters"
                    inputMode="text"
                    dir="ltr"
                    className="w-full h-13 py-3.5 pr-12 pl-12 rounded-xl text-center text-lg font-semibold tracking-[0.2em] outline-none transition-all duration-200 placeholder:tracking-normal placeholder:font-normal"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      color: '#f0d98a',
                      fontSize: '1.15rem',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.7)'; e.target.style.background = 'rgba(212,175,55,0.06)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.3)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  />

                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                    style={{ color: 'rgba(212,175,55,0.5)' }}
                    aria-label={showCode ? 'إخفاء' : 'إظهار'}
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 py-3.5 rounded-xl font-bold text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{
                    background: loading
                      ? 'rgba(212,175,55,0.4)'
                      : 'linear-gradient(135deg, #c9a227 0%, #e8c84a 50%, #c9a227 100%)',
                    color: '#0a0f1e',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(212,175,55,0.3)',
                    border: '1px solid rgba(212,175,55,0.4)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جارٍ تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>⟩</span>
                      <span>تسجيل الدخول</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Bottom divider ── */}
          <div className="flex items-center gap-3 mt-7 w-full max-w-sm">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
            <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '1rem' }}>☥</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, transparent, rgba(212,175,55,0.3))' }} />
          </div>
        </div>

        {/* ── Footer ── */}
        <footer
          className="relative z-10 py-5 text-center"
          style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(212,175,55,0.4)' }}>
            © 2026 خطوة بلس. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(212,175,55,0.3)' }}>
            تطوير: المهندس أنطونيوس سامح
          </p>
        </footer>
      </div>
    </>
  );
}