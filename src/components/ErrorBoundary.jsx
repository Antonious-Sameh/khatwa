import React from 'react';

/**
 * ErrorBoundary — يمسك أي React runtime error ويعرض شاشة ودية بدل Crash
 *
 * بدونه: أي خطأ غير متوقع في أي component بيعمل white screen كامل
 * معاه: بيعرض رسالة واضحة مع زر "إعادة المحاولة"
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log for debugging — في production ممكن يتبعت لـ Sentry مثلاً
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        background: '#080d1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'sans-serif',
        direction: 'rtl',
        textAlign: 'center',
      }}>
        <div style={{ color: '#D4AF37', fontSize: '3rem', marginBottom: '16px' }}>⚠</div>
        <h2 style={{ color: '#D4AF37', fontSize: '1.3rem', marginBottom: '10px', fontWeight: 'bold' }}>
          حدث خطأ غير متوقع
        </h2>
        <p style={{ color: 'rgba(212,175,55,0.6)', fontSize: '0.9rem', marginBottom: '28px', maxWidth: '320px', lineHeight: 1.7 }}>
          يمكنك إعادة تحميل الصفحة أو المحاولة مرة أخرى.
          إذا استمرت المشكلة يرجى التواصل مع المدرس.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg,#b8861a,#e8c84a,#b8861a)',
              color: '#080d1a',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            إعادة تحميل الصفحة
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              background: 'transparent',
              color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }
}