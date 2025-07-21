import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard, { TeacherOnboarding } from './pages/dashboard/TeacherDashboard';
import SellerLanding from './pages/seller/SellerLanding';
import UploadFirstResource from './pages/dashboard/UploadFirstResource';
import PayoutSetup from './pages/dashboard/PayoutSetup';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import BrowseResources from './pages/BrowseResources';
import ResourceDetail from './pages/ResourceDetail';
import PurchaseConfirmation from './pages/PurchaseConfirmation';

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/teacher/onboarding" element={<TeacherOnboardingRoute />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/upload-first-resource" element={<UploadFirstResource />} />
          <Route path="/dashboard/teacher/payout-setup" element={<PayoutSetup />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/browse" element={<BrowseResources />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
          <Route path="/seller" element={<SellerLanding />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;