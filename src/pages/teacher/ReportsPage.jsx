import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, User, Activity, CreditCard, Award, Trophy, Star, BarChart2, Loader2, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input }  from '@/components/ui/input';
import { Badge }  from '@/components/ui/badge';
import { studentsAPI } from '@/api/services';
import { toast } from 'sonner';

function Stat({ label, value, color = '' }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// نفس مقاييس الألوان المستخدمة بالفعل في صفحة درجات الطالب (StudentGradesPage)
// حتى يبقى شكل مستوى الطالب متناسق في كل المنصة
function getLevelInfo(pct) {
  if (pct >= 85) return { label: 'ممتاز',   text: 'text-green-600',  bar: 'bg-green-500'  };
  if (pct >= 70) return { label: 'جيد جداً', text: 'text-blue-600',   bar: 'bg-blue-500'   };
  if (pct >= 50) return { label: 'متوسط',   text: 'text-yellow-600', bar: 'bg-yellow-500' };
  return             { label: 'ضعيف',    text: 'text-red-500',   bar: 'bg-red-400'    };
}

// يقارن متوسط أحدث الدرجات بمتوسط الأقدم لمعرفة هل الطالب في تحسن أو تراجع أو ثابت
// (القائمة مرتبة من الأحدث للأقدم بالفعل من الـ backend — createdAt: -1)
function getGradesTrend(list = []) {
  const graded = list.filter(g => (g.maxScoreResolved ?? g.exam?.maxScore ?? g.maxScore ?? 0) > 0);
  if (graded.length < 2) return null;

  const half   = Math.max(1, Math.floor(graded.length / 2));
  const recent = graded.slice(0, half);
  const older  = graded.slice(half);
  const avg    = (arr) => arr.reduce((s, g) => s + (g.percentage || 0), 0) / arr.length;

  const recentAvg = avg(recent);
  const olderAvg  = avg(older);
  const diff      = Math.round(recentAvg - olderAvg);

  if (diff >= 5)  return { direction: 'up',   label: 'في تحسن',  diff, icon: TrendingUp,   color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
  if (diff <= -5) return { direction: 'down', label: 'في تراجع', diff, icon: TrendingDown, color: 'text-red-600',   bg: 'bg-red-50 border-red-200'     };
  return               { direction: 'stable', label: 'مستقر',    diff, icon: Minus,        color: 'text-muted-foreground', bg: 'bg-muted/30 border-border' };
}

export default function ReportsPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const searchSeq   = useRef(0);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const runSearch = async (q, seq) => {
    setSearching(true);
    try {
      const d = await studentsAPI.getAll({ search: q.trim(), limit: 10 });
      if (seq === searchSeq.current) setResults(d.data || []);
    } catch {
      if (seq === searchSeq.current) setResults([]);
    } finally {
      if (seq === searchSeq.current) setSearching(false);
    }
  };

  const handleSearch = (q) => {
    setQuery(q);
    setReport(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); searchSeq.current += 1; return; }
    const seq = (searchSeq.current += 1);
    // تأخير بسيط (debounce) قبل إرسال الطلب — بدل ما نبعت request مع كل حرف
    debounceRef.current = setTimeout(() => runSearch(q, seq), 350);
  };

  const selectStudent = async (student) => {
    setQuery(student.name);
    setResults([]);
    setLoading(true);
    try {
      const d = await studentsAPI.getReport(student._id);
      setReport(d.report);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'فشل تحميل التقرير');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>التقارير | نظام المعلم</title></Helmet>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">تقرير الطالب الشامل</h2>
          <p className="text-muted-foreground text-sm">ابحث عن طالب لعرض تقريره المفصل</p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-card border rounded-xl px-4 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input placeholder="ابحث باسم الطالب أو الكود..." value={query}
              onChange={e => handleSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 h-12 text-base" />
            {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
          </div>
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border rounded-xl shadow-lg overflow-hidden">
              {results.map(s => (
                <button key={s._id} className="w-full text-right px-5 py-3 hover:bg-muted/60 flex justify-between gap-4"
                  onClick={() => selectStudent(s)}>
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.academicYearLabel}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{s.codePlain}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

        {!report && !loading && (
          <div className="text-center p-16 bg-card border rounded-2xl border-dashed">
            <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold">ابحث عن طالب</h3>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-5">
            {/* Student info */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">{report.student.name}</h3>
                  <p className="text-muted-foreground text-sm">{report.student.academicYearLabel} — {report.student.group?.name || 'بدون مجموعة'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{report.student.codePlain}</Badge>
                    {report.student.phone && <Badge variant="outline">{report.student.phone}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/*
              <Card><CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-black">#{report.rank?.rank || '—'}</p>
                <p className="text-xs text-muted-foreground">الترتيب</p>
              </CardContent></Card>

              <Card><CardContent className="p-4 text-center">
                <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-black">{report.grades?.totalScore || 0}</p>
                <p className="text-xs text-muted-foreground">إجمالي الدرجات</p>
              </CardContent></Card>
              */}
              <Card><CardContent className="p-4 text-center">
                <Star className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-black">{report.points?.balance || 0}</p>
                <p className="text-xs text-muted-foreground">النقاط</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className={`text-lg font-black ${report.payments?.totalRemaining === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.payments?.status || '—'}
                </p>
                <p className="text-xs text-muted-foreground">المدفوعات</p>
              </CardContent></Card>
            </div>

            {/* Attendance */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex gap-2"><Activity className="h-5 w-5 text-primary" />الحضور</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-8">
                  <Stat label="حضور"     value={report.attendance?.present || 0}    color="text-green-600" />
                  <Stat label="غياب"     value={report.attendance?.absent  || 0}    color="text-red-600" />
                  <Stat label="الإجمالي" value={report.attendance?.total   || 0} />
                  <Stat label="النسبة"   value={`${report.attendance?.percentage || 0}%`} color="text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Grades / Exams */}
            {report.grades?.list?.length > 0 && (() => {
              const overallPct = report.grades.percentage || 0;
              const level      = getLevelInfo(overallPct);
              const trend      = getGradesTrend(report.grades.list);
              const TrendIcon  = trend?.icon;

              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex gap-2"><Award className="h-5 w-5 text-primary" />الامتحانات والدرجات</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {/* Summary */}
                    <div className="flex gap-8 flex-wrap">
                      <Stat label="عدد الامتحانات" value={report.grades.examCount || 0} />
                      <Stat label="إجمالي الدرجات" value={`${report.grades.totalScore || 0} / ${report.grades.totalMax || 0}`} />
                      <Stat label="النسبة الكلية" value={`${overallPct}%`} color={level.text} />
                    </div>

                    {/* Level / progress indicator */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold flex items-center gap-1.5">
                          مستوى الطالب: <span className={level.text}>{level.label}</span>
                        </span>
                        <span className={`text-sm font-black ${level.text}`}>{overallPct}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${level.bar} transition-all`}
                          style={{ width: `${Math.min(100, Math.max(0, overallPct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Trend indicator: improving / declining / stable */}
                    {trend && (
                      <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${trend.bg}`}>
                        <TrendIcon className={`h-4 w-4 shrink-0 ${trend.color}`} />
                        <span className={`text-sm font-bold ${trend.color}`}>{trend.label}</span>
                        <span className="text-xs text-muted-foreground">
                          مقارنة بين أحدث الامتحانات وأقدمها
                          {trend.diff !== 0 && ` (${trend.diff > 0 ? '+' : ''}${trend.diff}%)`}
                        </span>
                      </div>
                    )}

                    {/* Exams list */}
                    <div className="space-y-2">
                      {report.grades.list.map(g => {
                        const title  = g.examTitleResolved ?? g.exam?.title ?? g.examTitle ?? 'امتحان';
                        const max    = g.maxScoreResolved   ?? g.exam?.maxScore ?? g.maxScore ?? 0;
                        const date   = g.examDateResolved   ?? g.exam?.examDate ?? g.createdAt;
                        const pct    = g.percentage ?? (max > 0 ? Math.round((g.score / max) * 100) : null);
                        const gLevel = pct !== null ? getLevelInfo(pct) : null;

                        return (
                          <div key={g._id} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3 gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{title}</p>
                              {date && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(date).toLocaleDateString('ar-EG')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-black text-lg text-primary">
                                {g.score} <span className="text-xs text-muted-foreground font-normal">/ {max || '—'}</span>
                              </span>
                              {pct !== null && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gLevel.text} bg-background border`}>
                                  {pct}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
}