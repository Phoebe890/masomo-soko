import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminResources from './pages/admin/AdminResources';

// Layout and Standard Pages
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BrowseResources from './pages/BrowseResources';
import ResourceDetail from './pages/ResourceDetail';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import SellerLanding from './pages/seller/SellerLanding';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import TeacherOnboarding from './pages/dashboard/TeacherOnboarding'; 
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherEarnings from './pages/dashboard/TeacherEarnings';
import TeacherReviews from './pages/dashboard/TeacherReviews';

// Teacher Task Pages
import UploadFirstResource from './pages/dashboard/UploadFirstResource';
import ResourceManagement from './pages/dashboard/ResourceManagement';

// Teacher Settings & Coaching
import TeacherSettings from './pages/dashboard/TeacherSettings';
import CoachingServiceManager from './pages/teacher/CoachingServiceManager';
import AvailabilityCalendar from './pages/teacher/AvailabilityCalendar';

// --- UTILITY COMPONENTS ---

// 1. NEW: ScrollToTop Component
// This listens for route changes and scrolls the window to (0,0)
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    // Redirect logged-in users away from Login/Register pages
    if (email && (location.pathname === '/login' || location.pathname === '/register')) {
      if (role === 'TEACHER' || role === 'teacher') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (role === 'STUDENT' || role === 'student') {
        navigate('/dashboard/student', { replace: true });
      } else if (role === 'ADMIN' || role === 'admin' || role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
}

function App() {
  const location = useLocation();

  // Define which paths should NOT have the global Header/Footer (Layout)
  const isDashboardRoute = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/teacher') ||
    location.pathname.startsWith('/admin');

  
  const appRoutes = (
    <Routes>
      {/* Main Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<BrowseResources />} />
      <Route path="/resource/:id" element={<ResourceDetail />} />
      <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
      
      <Route path="/seller" element={<SellerLanding />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Dashboard */}
      <Route path="/dashboard/student" element={<StudentDashboard />} />

      {/* --- TEACHER FLOW --- */}
      <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
      <Route path="/dashboard/teacher/onboarding" element={<TeacherOnboarding />} />
      <Route path="/dashboard/teacher/resources" element={<ResourceManagement />} />
      <Route path="/dashboard/teacher/upload-first-resource" element={<UploadFirstResource />} />
      <Route path="/teacher/earnings" element={<TeacherEarnings />} />
      <Route path="/teacher/settings" element={<TeacherSettings />} />
      <Route path="/teacher/coaching-services" element={<CoachingServiceManager />} />
      <Route path="/teacher/availability" element={<AvailabilityCalendar />} />
      <Route path="/teacher/reviews" element={<TeacherReviews />} />

      {/* --- ADMIN FLOW --- */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/resources" element={<AdminResources />} />
    </Routes>
  );

  return (
    <>
      <AuthGate />
      
      {/* 2. ADDED: ScrollToTop here so it runs on every route change */}
      <ScrollToTop />
      
      {isDashboardRoute ? (
        appRoutes
      ) : (
        <Layout>
          {appRoutes}
        </Layout>
      )}
    </>
  );
}

export default App;