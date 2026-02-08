import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import About from './components/About'; 
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminResources from './pages/admin/AdminResources';
import ForgotPassword from './pages/auth/ForgotPassword';

// Layout and Standard Pages
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BrowseResources from './pages/BrowseResources';
import ResourceDetail from './pages/ResourceDetail';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import SellerLanding from './pages/seller/SellerLanding';
import NotFound from './pages/NotFound';
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

// --- UTILITY COMPONENTS ---

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// --- NEW: TEACHER GATEKEEPER ---
const TeacherGuard = ({ children }: { children: JSX.Element }) => {
   const role = localStorage.getItem('role')?.toUpperCase();
  const email = localStorage.getItem('email');

  if (!email) return <Navigate to="/login" replace />;

  // If user is logged in but hasn't finished onboarding (role is still STUDENT),
  // redirect them to the onboarding page.
  if (role !== 'TEACHER' && role !== 'ROLE_TEACHER') {
    return <Navigate to="/dashboard/teacher/onboarding" replace />;
  }

  return children;
};

function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    if (email && (location.pathname === '/login' || location.pathname === '/register')) {
      if (role === 'TEACHER' || role === 'ROLE_TEACHER') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (role === 'STUDENT' || role === 'student') {
        navigate('/dashboard/student', { replace: true });
      } else if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
}

function App() {
  const location = useLocation();

  const isDashboardRoute = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/teacher') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/forgot-password';
  
  const appRoutes = (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/browse" element={<BrowseResources />} />
      <Route path="/resource/:id" element={<ResourceDetail />} />
      <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
      <Route path="/seller" element={<SellerLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Dashboard */}
      <Route path="/dashboard/student" element={<StudentDashboard />} />

      {/* --- TEACHER FLOW (PUBLIC ONBOARDING) --- */}
      <Route path="/dashboard/teacher/onboarding" element={<TeacherOnboarding />} />

      {/* --- TEACHER FLOW (PROTECTED BY GUARD) --- */}
      <Route path="/dashboard/teacher" element={<TeacherGuard><TeacherDashboard /></TeacherGuard>} />
      <Route path="/dashboard/teacher/resources" element={<TeacherGuard><ResourceManagement /></TeacherGuard>} />
      <Route path="/dashboard/teacher/upload-first-resource" element={<TeacherGuard><UploadFirstResource /></TeacherGuard>} />
      <Route path="/teacher/earnings" element={<TeacherGuard><TeacherEarnings /></TeacherGuard>} />
      <Route path="/teacher/settings" element={<TeacherGuard><TeacherSettings /></TeacherGuard>} />
      
      <Route path="/teacher/reviews" element={<TeacherGuard><TeacherReviews /></TeacherGuard>} />

      {/* --- ADMIN FLOW --- */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/resources" element={<AdminResources />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <>
      <AuthGate />
      <ScrollToTop />
      {isDashboardRoute ? appRoutes : <Layout>{appRoutes}</Layout>}
    </>
  );
}

export default App;