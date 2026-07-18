import React, { useState, Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import MobileNav from '@/components/MobileNav.jsx';
import { Toaster } from '@/components/ui/sonner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt.jsx';
import { NotificationProvider } from '@/contexts/NotificationContext.jsx'; // الـ Import موجود وجاهز
import { Spinner } from '@/components/ui/spinner';

// Auth
import LoginPage from '@/pages/LoginPage.jsx';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────
// كل صفحة بتتحمّل عند زيارة الراوت بتاعها فقط، مش كلها مع أول تحميل للموقع.
// نفس الصفحات بالظبط ونفس الشكل — بس تقسيم الكود (Code Splitting) لتقليل
// حجم الحزمة الأولية (Bundle Size) وتسريع أول تحميل.

// Teacher Pages
const HomePage       = lazy(() => import('@/pages/HomePage.jsx'));
const GroupsPage     = lazy(() => import('@/pages/GroupsPage.jsx'));
const StudentsPage   = lazy(() => import('@/pages/StudentsPage.jsx'));
const AttendancePage = lazy(() => import('@/pages/AttendancePage.jsx'));
const PaymentsPage   = lazy(() => import('@/pages/PaymentsPage.jsx'));
const ExamsPage      = lazy(() => import('@/pages/teacher/ExamsPage.jsx'));
const GradesPage     = lazy(() => import('@/pages/teacher/GradesPage.jsx'));
const RankingsPage   = lazy(() => import('@/pages/teacher/RankingsPage.jsx'));
const PointsPage     = lazy(() => import('@/pages/teacher/PointsPage.jsx'));
const ReportsPage    = lazy(() => import('@/pages/teacher/ReportsPage.jsx'));
const HeroesPage     = lazy(() => import('@/pages/teacher/HeroesPage.jsx'));
const NotesPage      = lazy(() => import('@/pages/teacher/NotesPage.jsx'));
const OnlinePage     = lazy(() => import('@/pages/teacher/OnlinePage.jsx'));
const AccountPage    = lazy(() => import('@/pages/AccountPage.jsx'));

// Student Pages
const StudentHomePage       = lazy(() => import('@/pages/student/StudentHomePage.jsx'));
const StudentSchedulePage   = lazy(() => import('@/pages/student/StudentSchedulePage.jsx'));
const StudentPaymentsPage   = lazy(() => import('@/pages/student/StudentPaymentsPage.jsx'));
const StudentExamsPage      = lazy(() => import('@/pages/student/StudentExamsPage.jsx'));
const ExamInterfacePage     = lazy(() => import('@/pages/student/ExamInterfacePage.jsx'));
const StudentGradesPage     = lazy(() => import('@/pages/student/StudentGradesPage.jsx'));
const StudentRankingsPage   = lazy(() => import('@/pages/student/StudentRankingsPage.jsx'));
const StudentAttendancePage = lazy(() => import('@/pages/student/StudentAttendancePage.jsx'));
const StudentPointsPage     = lazy(() => import('@/pages/student/StudentPointsPage.jsx'));
const StudentHeroesPage     = lazy(() => import('@/pages/student/StudentHeroesPage.jsx'));
const StudentAccountPage    = lazy(() => import('@/pages/student/StudentAccountPage.jsx'));
const StudentNotesPage      = lazy(() => import('@/pages/student/StudentNotesPage.jsx'));
const StudentOnlinePage     = lazy(() => import('@/pages/student/StudentOnlinePage.jsx'));

// Fallback shown briefly while a page's chunk is being fetched.
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

function ProtectedLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" dir="rtl">
      <div className="flex h-screen overflow-hidden">
        <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'teacher' ? '/teacher/home' : '/student/home'} replace />;
}

function App() {
  return (
    <AuthProvider>
      {/* التعديل الجديد: التغليف بـ NotificationProvider */}
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* TEACHER ROUTES */}
            <Route path="/teacher/home" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><HomePage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><GroupsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><StudentsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><AttendancePage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><PaymentsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/exams" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><ExamsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/grades" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><GradesPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/rankings" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><RankingsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/points" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><PointsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/reports" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><ReportsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/heroes" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><HeroesPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/notes" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><NotesPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/online" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><OnlinePage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/teacher/account" element={<ProtectedRoute allowedRole="teacher"><ProtectedLayout><AccountPage /></ProtectedLayout></ProtectedRoute>} />

            {/* STUDENT ROUTES */}
            <Route path="/student/home" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentHomePage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/schedule" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentSchedulePage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/payments" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentPaymentsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/exams" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentExamsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/exam-interface" element={<ProtectedRoute allowedRole="student"><ExamInterfacePage /></ProtectedRoute>} />
            <Route path="/student/grades" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentGradesPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/rankings" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentRankingsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/points" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentPointsPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentAttendancePage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/heroes" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentHeroesPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/account" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentAccountPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/notes" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentNotesPage /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/student/online" element={<ProtectedRoute allowedRole="student"><ProtectedLayout><StudentOnlinePage /></ProtectedLayout></ProtectedRoute>} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          <Toaster position="top-center" dir="rtl" />
          <PWAInstallPrompt />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;