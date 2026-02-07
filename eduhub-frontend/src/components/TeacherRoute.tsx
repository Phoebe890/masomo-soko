import { Navigate, Outlet } from 'react-router-dom';

const TeacherRoute = () => {
    const role = localStorage.getItem('role');
    const isLoggedIn = !!localStorage.getItem('email');

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // If they are NOT a teacher, redirect them to the onboarding page
    if (role !== 'TEACHER') {
        return <Navigate to="/teacher-onboarding" replace />;
    }

    // If they ARE a teacher, show the dashboard (Outlet)
    return <Outlet />;
};

export default TeacherRoute;