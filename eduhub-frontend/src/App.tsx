import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Layout and Standard Pages
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BrowseResources from './pages/BrowseResources';
import ResourceDetail from './pages/ResourceDetail';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import SellerLanding from './pages/seller/SellerLanding';
import TeacherReviews from './pages/dashboard/TeacherReviews';
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import TeacherOnboarding from './pages/dashboard/TeacherOnboarding'; 
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Teacher Task Pages
import UploadFirstResource from './pages/dashboard/UploadFirstResource';
import ResourceManagement from './pages/dashboard/ResourceManagement';

// Teacher Settings & Coaching
import TeacherSettings from './pages/dashboard/TeacherSettings';
import CoachingServiceManager from './pages/teacher/CoachingServiceManager';
import AvailabilityCalendar from './pages/teacher/AvailabilityCalendar';

// --- UTILITY COMPONENTS ---

function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    // Redirect logged-in users away from Login/Register pages
    if (email && (location.pathname === '/login' || location.pathname === '/register')) {
      if (role === 'teacher') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (role === 'student') {
        navigate('/dashboard/student', { replace: true });
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
    location.pathname.startsWith('/teacher');

  // We define the routes content once to avoid duplication
  const appRoutes = (
    <Routes>
      {/* Main Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<BrowseResources />} />
      <Route path="/resource/:id" element={<ResourceDetail />} />
      <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
      
      {/* Seller Landing is PUBLIC, so it stays inside Layout logic normally, 
          but if you want it to have no header, add it to isDashboardRoute logic above */}
      <Route path="/seller" element={<SellerLanding />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Dashboard */}
      <Route path="/dashboard/student" element={<StudentDashboard />} />

      {/* --- TEACHER FLOW --- */}
      
      {/* 1. The Main Dashboard */}
      <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
      
      {/* 2. The New Onboarding Wizard */}
      <Route path="/dashboard/teacher/onboarding" element={<TeacherOnboarding />} />
      
      {/* 3. Resource Management */}
      <Route path="/dashboard/teacher/resources" element={<ResourceManagement />} />
      <Route path="/dashboard/teacher/upload-first-resource" element={<UploadFirstResource />} />
      
      {/* 4. Coaching & Settings */}
      <Route path="/teacher/settings" element={<TeacherSettings />} />
      <Route path="/teacher/coaching-services" element={<CoachingServiceManager />} />
      <Route path="/teacher/availability" element={<AvailabilityCalendar />} />

      {/* 5. Teacher Reviews from Students */}
      <Route path="/teacher/reviews" element={<TeacherReviews />} />
    </Routes>
  );

  return (
    <>
      <AuthGate />
      
      {/* 
         LOGIC: 
         If we are on a dashboard page, render routes DIRECTLY (Sidebar will handle layout).
         If we are on a public page, wrap routes in <Layout> (Header + Footer).
      */}
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