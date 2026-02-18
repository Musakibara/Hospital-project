import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Notifications from './pages/Notifications';
import Appointments from './pages/Appointments';

import Consultations from './pages/Consultations';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
        // Rediriger vers le dashboard si le rôle n'est pas autorisé
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route Component (Redirects to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

import { Toaster } from 'react-hot-toast';
import Signup from './pages/Signup';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/signup" element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    } />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="doctors" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Doctors />
                            </ProtectedRoute>
                        } />
                        <Route path="patients" element={<Patients />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="appointments" element={<Appointments />} />
                        <Route path="consultations" element={<Consultations />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
