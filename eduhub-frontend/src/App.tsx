import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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

// Teacher Onboarding and Specific Task Pages
import UploadFirstResource from './pages/dashboard/UploadFirstResource';
import PayoutSetup from './pages/dashboard/PayoutSetup';

// --- ADD IMPORTS FOR THE NEW COACHING COMPONENTS ---
import TeacherSettings from './pages/teacher/TeacherSettings';
import CoachingServiceManager from './pages/teacher/CoachingServiceManager';
import AvailabilityCalendar from './pages/teacher/AvailabilityCalendar';

// This utility component is fine as is.
function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    if (email && role && (location.pathname === '/login' || location.pathname === '/register')) {
      const userRole = role.toLowerCase();
      if (userRole === 'teacher') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (userRole === 'student') {
        navigate('/dashboard/student', { replace: true });
      }
    }
  }, [navigate, location]);
  return null;
}

// This component is fine as is.
function TeacherOnboardingRoute() {
  const navigate = useNavigate();
  return <TeacherOnboarding onComplete={() => navigate('/dashboard/teacher/payout-setup')} />;
}

function App() {
  return (
    <Router>
      <AuthGate />
      <Layout>
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

          {/* Teacher Routes */}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/onboarding" element={<TeacherOnboardingRoute />} />
          <Route path="/dashboard/teacher/upload-first-resource" element={<UploadFirstResource />} />
          <Route path="/dashboard/teacher/payout-setup" element={<PayoutSetup />} />

          {/* --- ADD THE NEW ROUTES FOR TEACHER COACHING MANAGEMENT --- */}
          <Route path="/teacher/settings" element={<TeacherSettings />} />
          <Route path="/teacher/coaching-services" element={<CoachingServiceManager />} />
          <Route path="/teacher/availability" element={<AvailabilityCalendar />} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;