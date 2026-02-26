import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Routes publiques
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

// Mise en page et pages protégées
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Patients = lazy(() => import('./pages/Patients'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Consultations = lazy(() => import('./pages/Consultations'));
const PatientRecord = lazy(() => import('./pages/PatientRecord'));
const MedicalConsultation = lazy(() => import('./pages/MedicalConsultation'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Composant de chargement (Fallback pour Suspense)
// Optimisation UX : Utilisation d'un spinner simple en attendant le chargement du chunk JS
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="hospital-theme">
                <AuthProvider>
                    <Toaster position="top-right" />
                    <Suspense fallback={<PageLoader />}>
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
                                <Route path="patients/:id" element={<PatientRecord />} />
                                <Route path="patients/:id/consultation" element={
                                    <ProtectedRoute allowedRoles={['medecin']}>
                                        <MedicalConsultation />
                                    </ProtectedRoute>
                                } />
                                <Route path="notifications" element={<Notifications />} />
                                <Route path="appointments" element={<Appointments />} />
                                <Route path="consultations" element={<Consultations />} />
                                <Route path="profile" element={<Profile />} />
                            </Route>
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
