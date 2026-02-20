import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, Activity, ClipboardList, Stethoscope } from 'lucide-react';
import { doctorService } from '@/services/doctorService';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { consultationService } from '@/services/consultationService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Composant de carte de statistique mémoïsé pour éviter les re-renders inutiles.
 */
const StatCard = React.memo(({ title, value, icon: Icon, color, link, description, isLoading }: any) => (
    <Link to={link || '#'}>
        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                        {isLoading ? (
                            <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-lg" />
                        ) : (
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</h3>
                        )}
                        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
                    </div>
                    <div className={cn("p-3 rounded-xl shadow-lg shadow-opacity-20 transition-transform group-hover:scale-110", color)}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
            {isLoading && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden"><div className="h-full bg-teal-500 animate-progress w-1/3" /></div>}
        </Card>
    </Link>
));

StatCard.displayName = 'StatCard';

/**
 * Tableau de bord médical optimisé.
 * Utilise TanStack Query pour paralléliser les appels et mettre en cache les résultats.
 */
const Dashboard = () => {
    // Requêtes en parallèle avec TanStack Query
    const patientsQuery = useQuery({ queryKey: ['patients', 1], queryFn: () => patientService.getPatients(1) });
    const doctorsQuery = useQuery({ queryKey: ['doctors'], queryFn: () => doctorService.getDoctors() });
    const appointmentsQuery = useQuery({ queryKey: ['appointments', { page: 1 }], queryFn: () => appointmentService.getAppointments({ page: 1 }) });
    const visitsQuery = useQuery({ queryKey: ['visits', { page: 1 }], queryFn: () => consultationService.getVisits({ page: 1 }) });

    const isLoading = patientsQuery.isLoading || doctorsQuery.isLoading || appointmentsQuery.isLoading || visitsQuery.isLoading;

    // Calcul des statistiques mémoïsé
    const stats = useMemo(() => ({
        patients: patientsQuery.data?.meta.total || 0,
        doctors: doctorsQuery.data?.length || 0,
        appointments: appointmentsQuery.data?.meta.total || 0,
        visits: visitsQuery.data?.meta.total || 0
    }), [patientsQuery.data, doctorsQuery.data, appointmentsQuery.data, visitsQuery.data]);

    const recentAppointments = useMemo(() => appointmentsQuery.data?.data.slice(0, 5) || [], [appointmentsQuery.data]);
    const recentVisits = useMemo(() => visitsQuery.data?.data.slice(0, 5) || [], [visitsQuery.data]);

    // Helpers de formatage (Statiques ici car simples)
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tableau de Bord Médical</h1>
                    <p className="text-slate-500 mt-1">Aperçu quotidien et actions rapides pour votre cabinet.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500">Système de Gestion Hospitalière</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards avec Skeletons intégrés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.patients}
                    icon={Users}
                    color="bg-blue-500"
                    link="/patients"
                    description="Patients enregistrés"
                    isLoading={patientsQuery.isLoading}
                />
                <StatCard
                    title="Rendez-vous"
                    value={stats.appointments}
                    icon={Calendar}
                    color="bg-teal-500"
                    link="/appointments"
                    description="Total programmés"
                    isLoading={appointmentsQuery.isLoading}
                />
                <StatCard
                    title="Visites Médicales"
                    value={stats.visits}
                    icon={ClipboardList}
                    color="bg-amber-500"
                    link="/consultations"
                    description="Historique des visites"
                    isLoading={visitsQuery.isLoading}
                />
                <StatCard
                    title="Médecins"
                    value={stats.doctors}
                    icon={Activity}
                    color="bg-indigo-500"
                    link="/doctors"
                    description="Personnel médical actif"
                    isLoading={doctorsQuery.isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rendez-vous Récents */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Rendez-vous Récents</CardTitle>
                            <CardDescription>Dernières visites planifiées</CardDescription>
                        </div>
                        <Link to="/appointments">
                            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                Voir Tout
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {appointmentsQuery.isLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
                                ))
                            ) : recentAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">Aucun rendez-vous trouvé.</p>
                                </div>
                            ) : (
                                recentAppointments.map((apt) => (
                                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100 gap-2 sm:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden">
                                                {apt.patient?.nom_patient?.substring(0, 2) || 'PT'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{apt.patient?.nom_patient || 'Patient Inconnu'}</p>
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

                {/* Consultations Récentes */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Consultations Récentes</CardTitle>
                            <CardDescription>Derniers dossiers médicaux enregistrés</CardDescription>
                        </div>
                        <Link to="/consultations">
                            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                Voir Tout
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {visitsQuery.isLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
                                ))
                            ) : recentVisits.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">Aucune visite enregistrée.</p>
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
