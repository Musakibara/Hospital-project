import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, Activity, UserPlus, PlusCircle, ClipboardList, Stethoscope, ChevronRight } from 'lucide-react';
import { doctorService, Doctor } from '@/services/doctorService';
import { patientService } from '@/services/patientService';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { consultationService, MedicalVisit } from '@/services/consultationService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon: Icon, color, link, description }: any) => (
    <Link to={link || '#'}>
        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</h3>
                        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
                    </div>
                    <div className={`p-3 rounded-xl ${color} shadow-lg shadow-opacity-20`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
);

const QuickActionButton = ({ icon: Icon, label, description, color, link }: any) => (
    <Link to={link}>
        <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${color} text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
            </CardContent>
        </Card>
    </Link>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        visits: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [recentVisits, setRecentVisits] = useState<MedicalVisit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch in parallel for better performance
                const [patientsRes, doctorsData, appointmentsRes, visitsRes] = await Promise.all([
                    patientService.getPatients(1),
                    doctorService.getDoctors(),
                    appointmentService.getAppointments({ page: 1 }),
                    consultationService.getVisits({ page: 1 })
                ]);

                setStats({
                    patients: patientsRes.meta.total,
                    doctors: doctorsData.length,
                    appointments: appointmentsRes.meta.total,
                    visits: visitsRes.meta.total
                });

                setRecentAppointments(appointmentsRes.data.slice(0, 5));
                setRecentVisits(visitsRes.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirme': return 'bg-teal-100 text-teal-800';
            case 'prevu': return 'bg-blue-100 text-blue-800';
            case 'annule': return 'bg-red-100 text-red-800';
            case 'effectue': return 'bg-gray-100 text-gray-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading medical data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Medical Dashboard</h1>
                    <p className="text-slate-500 mt-1">Daily overview and quick actions for your practice.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-xs text-slate-500">Hospital Management System</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-teal-600" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickActionButton
                        icon={Users}
                        label="New Patient"
                        description="Register a new patient record"
                        color="bg-blue-600"
                        link="/patients"
                    />
                    <QuickActionButton
                        icon={Calendar}
                        label="New Appointment"
                        description="Schedule a patient visit"
                        color="bg-teal-600"
                        link="/appointments"
                    />
                    <QuickActionButton
                        icon={Stethoscope}
                        label="New Consultation"
                        description="Record a medical visit"
                        color="bg-amber-600"
                        link="/consultations"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.patients}
                    icon={Users}
                    color="bg-blue-500"
                    link="/patients"
                    description="Registered patients"
                />
                <StatCard
                    title="Appointments"
                    value={stats.appointments}
                    icon={Calendar}
                    color="bg-teal-500"
                    link="/appointments"
                    description="Total scheduled"
                />
                <StatCard
                    title="Medical Visits"
                    value={stats.visits}
                    icon={ClipboardList}
                    color="bg-amber-500"
                    link="/consultations"
                    description="Historical visits"
                />
                <StatCard
                    title="Doctors"
                    value={stats.doctors}
                    icon={Activity}
                    color="bg-indigo-500"
                    link="/doctors"
                    description="Active medical staff"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Appointments */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Recent Appointments</CardTitle>
                            <CardDescription>Latest scheduled patient visits</CardDescription>
                        </div>
                        <Link to="/appointments">
                            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">No appointments found.</p>
                                </div>
                            ) : (
                                recentAppointments.map((apt) => (
                                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100 gap-2 sm:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden">
                                                {apt.patient?.nom_patient?.substring(0, 2) || 'PT'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{apt.patient?.nom_patient || 'Unknown Patient'}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Stethoscope className="w-3 h-3" />
                                                    {apt.motif}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm font-medium text-slate-900">{formatDate(apt.date_heure)}</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(apt.statut)}`}>
                                                {apt.statut}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Medical Visits */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Recent Consultations</CardTitle>
                            <CardDescription>Latest recorded medical visits</CardDescription>
                        </div>
                        <Link to="/consultations">
                            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentVisits.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">No visits recorded yet.</p>
                                </div>
                            ) : (
                                recentVisits.map((visit) => (
                                    <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-white border border-slate-100 transition-colors hover:bg-slate-50 gap-2 sm:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{visit.patient?.nom_patient || 'Patient'}</p>
                                                <p className="text-xs text-teal-600 font-medium">Dx: {visit.diagnostic}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm font-medium text-slate-900">{new Date(visit.date_visite).toLocaleDateString('fr-FR')}</p>
                                            <p className="text-xs text-slate-500">Dr. {visit.medecin?.nom_medecin}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
