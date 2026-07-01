import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
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
      loading && setLoading(false);
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

      {/* الخلفية بلون البردي الفاخر الهادئ المريح جداً للعين */}
      <div className="min-h-screen flex flex-col justify-between bg-[#FBF9F4] text-[#1E1B18] px-4 py-6 antialiased selection:bg-[#D4AF37]/20 relative overflow-hidden">
        
        {/* لمسات خلفية خافتة جداً وغير ملحوظة (Minimal Geometric Lines) */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#1E1B18" strokeWidth="1" />
            <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#1E1B18" strokeWidth="1" />
          </svg>
        </div>

        {/* الحاوية المركزية المرنة والمحسنة للموبايل بشكل ممتاز */}
        <div className="flex-1 flex flex-col justify-center items-center max-w-md w-full mx-auto relative z-10 my-auto">
          
          {/* كارت الهوية المدمج: يجمع صورة المدرس والترحيب بأسلوب راقٍ وبسيط */}
          <div className="w-full text-center mb-6 flex flex-col items-center">
            
            {/* إطار دائري فاخر ومدروس المقاسات تماماً ليتناسب مع الموبايل */}
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/40 scale-110 animate-[spin_40s_linear_infinite]" />
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-white shadow-md border border-[#E6E2D8]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1E2538]">
                  <img 
                    src="/teacher.jpg" 
                    alt="صورة المدرس" 
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
              </div>
            </div>

            {/* اسم المنصة ووصف المادة بخطوط كلاسيكية حديثة */}
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#1A1816]">
              منصة <span className="text-[#C5A029]">خطوة</span> التعليمية
            </h1>
            <p className="text-xs text-[#7A746B] mt-1 font-medium tracking-wide">
              بوابة التاريخ والجغرافيا والدراسات الاجتماعية
            </p>
          </div>

          {/* كارد فورم تسجيل الدخول الفاخر (تأثير بسيط وبدون بهرجة) */}
          <Card className="w-full border border-[#EAE6DC] bg-white/90 backdrop-blur-md shadow-[0_12px_30px_rgba(26,24,22,0.03)] rounded-2xl overflow-hidden p-6 md:p-8">
            <CardContent className="p-0">
              
              <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-0.5">
                    <Label 
                      htmlFor="code" 
                      className="text-xs font-bold text-[#4A443C]"
                    >
                      أدخل كود الدخول الخاص بك
                    </Label>
                    <span className="text-[10px] text-[#C5A029] font-semibold bg-[#C5A029]/5 px-2 py-0.5 rounded">آمن</span>
                  </div>
                  
                  <div className="relative flex items-center">
                    <Input
                      id="code"
                      type={showCode ? "text" : "password"}
                      placeholder="••••••••"
                      value={code}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="text-center text-lg font-bold tracking-[0.2em] h-12 bg-[#FDFDFB] border border-[#DDD9CE] text-[#1E1B18] focus-visible:ring-1 focus-visible:ring-[#C5A029] focus-visible:bg-white focus-visible:border-[#C5A029] transition-all duration-200 rounded-xl placeholder:tracking-normal placeholder:font-normal placeholder:text-[#C4BEB3] pl-12 pr-4"
                      dir="ltr"
                      autoFocus
                      autoComplete="current-password"
                      autoCapitalize="characters"
                      inputMode="text"
                      aria-label="كود الدخول"
                    />
                    
                    {/* زر إظهار الكود على شكل "عين حورس" فرعونية خطية ناعمة */}
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute left-3 p-2 text-[#8A8275] hover:text-[#C5A029] transition-colors rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A029]/30"
                      aria-label={showCode ? "إخفاء الكود" : "إظهار الكود"}
                    >
                      {showCode ? (
                        /* عين حورس الفرعونية المغلقة خطياً */
                        <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 19c-1.5 2.5-4 3.5-4 3.5M3 3l18 18" strokeLinecap="round" />
                        </svg>
                      ) : (
                        /* عين حورس الفرعونية المفتوحة خطياً (مع رسمة الكحل المميزة لزمن الفراعنة) */
                        <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
                          {/* جفن العين الرئيسي */}
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
                          {/* بؤبؤ العين */}
                          <circle cx="12" cy="12" r="3" />
                          {/* خط الكحل الفرعوني المميز الممتد لأسفل العين */}
                          <path d="M12 15c-1 2.5-3 3.5-3 3.5M16 14.5c.5 1.5 1.5 2 2.5 2" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* زر الدخول الاحترافي البسيط والفاخر */}
                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold bg-[#1A1816] text-[#FAF9F5] hover:bg-[#2A2622] active:scale-[0.99] rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2" role="status" aria-live="polite">
                      <span className="w-4 h-4 border-2 border-[#FAF9F5]/20 border-t-[#FAF9F5] rounded-full animate-spin" />
                      <span>جاري التحقق...</span>
                    </span>
                  ) : (
                    <>
                      <span>تسجيل الدخول للمحاضرات</span>
                      <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>

        </div>

        {/* فوتر بسيط وراقي جداً متناسق هندسياً على الشاشات الصغيرة */}
        <footer className="w-full text-center pt-6 border-t border-[#EAE6DC]/60 relative z-10">
          <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-0.5">
            <p className="text-[11px] text-[#A69E91] font-normal">
              &copy; 2026 خطوة . جميع الحقوق محفوظة.
            </p>
            <p className="text-[10px] text-[#8C8475] font-normal">
              تطوير: المهندس أنطونيوس سامح
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}