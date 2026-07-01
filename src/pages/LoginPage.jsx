import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { KeyRound, ArrowLeft, Eye, EyeOff, Compass, Map, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = code.trim().replace(/\s+/g, '');
    if (!trimmed) { 
      toast.error('يرجى إدخال كود الدخول'); 
      return; 
    }

    setLoading(true);
    try {
      const user = await login(trimmed);
      toast.success(`مرحباً بك ${user.name}`);
      const from = location.state?.from?.pathname;
      if (from && from !== '/') {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'teacher' ? '/teacher/home' : '/student/home', { replace: true });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'كود الدخول غير صحيح، يرجى المحاولة مرة أخرى');
    } finally {
      loading && setLoading(false); // تم تأمين الـ UI ليعمل بنفس السلوك تماماً
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').toUpperCase();
    setCode(value);
  };

  return (
    <>
      <Helmet>
        <title>تسجيل الدخول | خطوة بلس</title>
      </Helmet>

      {/* الحاوية الرئيسية بنظام الـ Split Screen في الشاشات الكبيرة */}
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-amber-950 font-sans antialiased selection:bg-amber-500/10 relative overflow-hidden">
        
        {/* ================= القسم الأول: الـ Hero Section (صورة المدرس والهوية التاريخية) ================= */}
        <div className="relative w-full lg:w-[55%] bg-gradient-to-br from-[#1E2538] via-[#121724] to-[#0A0D14] flex flex-col justify-between p-6 md:p-12 text-white overflow-hidden border-b lg:border-b-0 lg:border-l border-amber-500/10">
          
          {/* خلفية فنية مستوحاة من النقوش العتيقة والبوصلة */}
          <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* توهج ذهبي خافت في الخلفية يعبر عن الحضارة والأصالة */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-amber-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

          {/* الهيدر العلوي للـ Hero */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-md">
                <Compass className="h-6 w-6 text-amber-400 animate-[spin_10s_linear_infinite]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-wider block bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">خطوة بلس</span>
                <span className="text-[10px] text-slate-400 block tracking-widest uppercase">Social Studies Platform</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-amber-200/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
              <History className="h-3.5 w-3.5 text-amber-400" />
              <span>رحلة عبر التاريخ والجغرافيا</span>
            </div>
          </div>

          {/* المنتصف: العرض الاحترافي الفاخر لصورة المدرس الكبيرة */}
          <div className="relative z-10 my-auto py-12 flex flex-col items-center text-center lg:text-right lg:items-start max-w-2xl mx-auto lg:mx-0">
            <div className="relative mb-8 group">
              {/* الإطار الفرعوني/الملكي الحديث الملتف حول الصورة */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-600 to-amber-300 rounded-[2.5rem] opacity-30 blur-sm group-hover:opacity-50 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-bl from-amber-500 to-amber-700 rounded-[2.3rem] transform rotate-3 scale-[1.02] opacity-20 group-hover:rotate-0 transition-transform duration-500" />
              
              {/* الحاوية الرئيسية للصورة المدرس الفاخرة */}
              <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-[2.2rem] overflow-hidden border-2 border-amber-400/40 bg-slate-900 shadow-2xl">
                <img 
                  src="/teacher.jpg" 
                  alt="صورة المدرس" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
              </div>

              {/* الـ Badge الصغير المثبت على الصورة */}
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-amber-300/30 flex items-center gap-1.5">
                <Map className="h-3.5 w-3.5" />
                <span>المؤرخ للمادة</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              اكتشف التاريخ، <br className="hidden lg:inline" />
              واستكشف العالم <span className="text-amber-400 relative inline-block">بخطوات ثابتة<span className="absolute bottom-1 left-0 w-full h-[3px] bg-amber-400/30 rounded" /></span>
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-md font-light">
              مرحباً بك في منصتك التعليمية الخاصة بمادة الدراسات الاجتماعية. هنا نُحيي التاريخ ونصنع جيل العباقرة المستقبلي.
            </p>
          </div>

          {/* الجزء السفلي من الهيرو */}
          <div className="relative z-10 hidden lg:flex items-center gap-6 text-xs text-slate-400 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>خرائط تفاعلية</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>سرد تاريخي مشوق</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>اختبارات ذكية</span>
            </div>
          </div>
        </div>

        {/* ================= القسم الثاني: منطقة فورم تسجيل الدخول (Premium UI) ================= */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 md:p-12 lg:p-16 relative z-10 bg-[#FAF8F5]">
          
          {/* عنصر جمالي علوي للهواتف */}
          <div className="flex lg:hidden items-center justify-between w-full mb-12">
            <span className="text-lg font-bold text-slate-900">خطوة <span className="text-amber-600">بلس</span></span>
            <span className="text-xs text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-medium">بوابة الطالب</span>
          </div>

          <div className="my-auto w-full max-w-[440px] mx-auto">
            
            {/* عنوان وإشعار ترحيبي بالفورم */}
            <div className="text-right mb-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-500/10 px-3 py-1 rounded-lg mb-3">
                <KeyRound className="h-3.5 w-3.5" />
                <span>منطقة الدخول الأمن</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">تسجيل الدخول للمنصة</h1>
              <p className="text-xs text-slate-500 mt-2">يرجى إدخال الكود الخاص بك الممنوح لك من المدرس للوصول لمحاضراتك واختباراتك.</p>
            </div>

            {/* الكارد الرئيسي الفخم المحيط بالفورم */}
            <Card className="border-none bg-white shadow-[0_20px_50px_rgba(139,92,26,0.04)] rounded-[2rem] overflow-hidden p-6 sm:p-8 relative before:absolute before:top-0 before:inset-x-0 before:h-[4px] before:bg-gradient-to-r before:from-amber-400 before:to-amber-600">
              <CardContent className="p-0">
                
                <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2.5">
                    <Label 
                      htmlFor="code" 
                      className="text-xs font-bold text-slate-700 pr-1 block"
                    >
                      كود الطالب / المعلم الخاص بك
                    </Label>
                    
                    <div className="relative flex items-center group">
                      <Input
                        id="code"
                        type={showCode ? "text" : "password"}
                        placeholder="EX: ST-0000"
                        value={code}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="text-center text-xl font-bold tracking-[0.12em] h-14 bg-slate-50/70 border-2 border-slate-100 text-slate-900 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:bg-white focus-visible:border-amber-500 transition-all duration-300 rounded-xl placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300 pl-12 pr-4 shadow-sm group-hover:border-slate-200"
                        dir="ltr"
                        autoFocus
                        autoComplete="current-password"
                        autoCapitalize="characters"
                        inputMode="text"
                        aria-label="كود الدخول"
                      />
                      
                      {/* زر إظهار وإخفاء الكود بتصميم ناعم ومريح */}
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute left-3.5 p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-500/5 active:bg-amber-500/10 transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        aria-label={showCode ? "إخفاء الكود" : "إظهار الكود"}
                      >
                        {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* زر الإرسال البريميوم مع التأثير الحركي الناعم */}
                  <Button
                    type="submit"
                    className="w-full h-14 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] rounded-xl shadow-[0_4px_20px_rgba(217,119,6,0.15)] transition-all duration-200 flex items-center justify-center gap-2 group border border-amber-400/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2.5" role="status" aria-live="polite">
                        <span className="w-5 h-5 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                        <span className="font-semibold text-slate-950">جاري التحقق من الهوية الفخمة...</span>
                      </span>
                    ) : (
                      <>
                        <span>دخول آمن للمنصة</span>
                        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 rtl:rotate-180 text-slate-950" />
                      </>
                    )}
                  </Button>
                </form>

              </CardContent>
            </Card>

            {/* ملاحظة مساعدة سريعة تحت الكارد */}
            <p className="text-center text-[11px] text-slate-400 mt-4">
              تواجه مشكلة في الكود؟ يرجى التواصل مع الدعم الفني للمنصة مباشرة.
            </p>
          </div>

          {/* ================= الفوتر السفلي الثابت والمحمي بالحقوق ================= */}
          <footer className="w-full pt-8 lg:pt-0 mt-8 lg:mt-0 text-center border-t border-slate-200/50 lg:border-t-0">
            <div className="flex flex-col items-center justify-center gap-0.5">
              <p className="text-xs text-slate-400 font-normal">
                &copy; 2026 خطوة . جميع الحقوق محفوظة.
              </p>
              <p className="text-[10px] text-amber-800/60 font-medium mt-0.5 tracking-wide">
                تطوير: المهندس أنطونيوس سامح
              </p>
            </div>
          </footer>

        </div>

      </div>
    </>
  );
}