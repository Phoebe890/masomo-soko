import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Import Components
import About from './components/About'; 
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminResources from './pages/admin/AdminResources';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Standard Pages
import Home from './pages/Home';
import BrowseResources from './pages/BrowseResources';
import ResourceDetail from './pages/ResourceDetail';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import SellerLanding from './pages/seller/SellerLanding';

// Dashboard Pages
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import TeacherOnboarding from './pages/dashboard/TeacherOnboarding'; 
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherEarnings from './pages/dashboard/TeacherEarnings';
import TeacherReviews from './pages/dashboard/TeacherReviews';

// Teacher Task Pages
import UploadFirstResource from './pages/dashboard/UploadFirstResource';
import ResourceManagement from './pages/dashboard/ResourceManagement';

// Teacher Settings
import TeacherSettings from './pages/dashboard/TeacherSettings';

// --- UTILITY COMPONENTS ---

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}


const TeacherGuard = ({ children }: { children: JSX.Element }) => {
  const email = localStorage.getItem('email');
  const role: string = (localStorage.getItem('role') || "").toUpperCase().replace("ROLE_", "");
  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
  if (!email) return <Navigate to="/login" replace />;

  if (role === 'TEACHER' && !onboardingComplete) {
    return <Navigate to="/dashboard/teacher/onboarding" replace />;
  }

  // Allow TEACHER or ADMIN
  if (role !== 'TEACHER' && role !== 'ADMIN') {
      return <Navigate to="/" replace />;
  }

  return children;
};

const RoleGuard = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const email = localStorage.getItem('email');
  const rawRole: string = localStorage.getItem('role')?.toUpperCase() || "";
  const role: string = rawRole.replace("ROLE_", "");
  
  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

  if (!email) return <Navigate to="/login" replace />;
  if (role === 'TEACHER' && !onboardingComplete) {
    return <Navigate to="/dashboard/teacher/onboarding" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};


function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = (localStorage.getItem('role') || "").toUpperCase().replace("ROLE_", "");
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

    if (email && (location.pathname === '/login' || location.pathname === '/register')) {
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'TEACHER' && !onboardingComplete) navigate('/dashboard/teacher/onboarding', { replace: true });
      else if (role === 'TEACHER') navigate('/dashboard/teacher', { replace: true });
      else navigate('/dashboard/student', { replace: true });
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
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/browse" element={<BrowseResources />} />
      <Route path="/resource/:id" element={<ResourceDetail />} />
      <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
      <Route path="/seller" element={<SellerLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* --- STUDENT DASHBOARD (PROTECTED) --- */}
      <Route 
        path="/dashboard/student" 
        element={
          <RoleGuard allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </RoleGuard>
        } 
      />

      {/* --- TEACHER FLOW (PUBLIC ONBOARDING) --- */}
      <Route path="/dashboard/teacher/onboarding" element={<TeacherOnboarding />} />

      {/* --- TEACHER FLOW (PROTECTED BY TEACHERGUARD) --- */}
      <Route path="/dashboard/teacher" element={<TeacherGuard><TeacherDashboard /></TeacherGuard>} />
      <Route path="/dashboard/teacher/resources" element={<TeacherGuard><ResourceManagement /></TeacherGuard>} />
      <Route path="/dashboard/teacher/upload-first-resource" element={<TeacherGuard><UploadFirstResource /></TeacherGuard>} />
      <Route path="/teacher/earnings" element={<TeacherGuard><TeacherEarnings /></TeacherGuard>} />
      <Route path="/teacher/settings" element={<TeacherGuard><TeacherSettings /></TeacherGuard>} />
      <Route path="/teacher/reviews" element={<TeacherGuard><TeacherReviews /></TeacherGuard>} />

      {/* --- ADMIN FLOW (PROTECTED BY ROLEGUARD) --- */}
      <Route 
        path="/admin/dashboard" 
        element={<RoleGuard allowedRoles={['ADMIN']}><AdminDashboard /></RoleGuard>} 
      />
      <Route 
        path="/admin/payouts" 
        element={<RoleGuard allowedRoles={['ADMIN']}><AdminPayouts /></RoleGuard>} 
      />
      <Route 
        path="/admin/users" 
        element={<RoleGuard allowedRoles={['ADMIN']}><AdminUsers /></RoleGuard>} 
      />
      <Route 
        path="/admin/resources" 
        element={<RoleGuard allowedRoles={['ADMIN']}><AdminResources /></RoleGuard>} 
      />

      {/* --- 404 NOT FOUND --- */}
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