import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, Activity, ClipboardList, Stethoscope, Clock } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { authService } from '@/services/authService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Composant de carte de statistique mémoïsé pour éviter les re-renders inutiles.
 */
const StatCard = React.memo(({ title, value, icon: Icon, color, link, description, isLoading }: any) => (
    <Link to={link || '#'}>
        <Card className="border-none shadow-md bg-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                        {isLoading ? (
                            <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-lg" />
                        ) : (
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{value}</h3>
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

const Dashboard = () => {
    const user = authService.getCurrentUser();

    // Requête centralisée pour le dashboard
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardService.getDashboardData(),
        refetchInterval: 30000 // Rafraîchissement toutes les 30s
    });

    const isMedecin = dashboardData?.role === 'medecin' || user?.role === 'medecin';

    // Formateurs
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
            case 'confirme': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
            case 'prevu': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'annule': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'effectue': return 'bg-slate-100 text-muted-foreground dark:bg-slate-800 dark:text-slate-300';
            case 'en_cours': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-muted-foreground dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        {isMedecin ? 'Espace Médecin' : 'Tableau de Bord Médical'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isMedecin
                            ? `Bienvenue, Dr. ${user?.name}. Voici vos activités du jour.`
                            : 'Aperçu quotidien et gestion globale de l\'hôpital.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500">Système de Gestion Hospitalière</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isMedecin ? (
                    <>
                        <StatCard
                            title="Mes Patients"
                            value={dashboardData?.stats.total_patients || 0}
                            icon={Users}
                            color="bg-blue-500"
                            link="/patients"
                            description="Total patients vus"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="RDV Aujourd'hui"
                            value={dashboardData?.stats.today_appointments || 0}
                            icon={Clock}
                            color="bg-teal-500"
                            link="/appointments"
                            description="À traiter aujourd'hui"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Mes Visites"
                            value={dashboardData?.stats.total_visites || 0}
                            icon={ClipboardList}
                            color="bg-amber-500"
                            link="/consultations"
                            description="Actes médicaux réalisés"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="RDV en Attente"
                            value={dashboardData?.stats.pending_appointments || 0}
                            icon={Calendar}
                            color="bg-indigo-500"
                            link="/appointments"
                            description="Total programmés"
                            isLoading={isLoading}
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total Patients"
                            value={dashboardData?.stats.total_patients || 0}
                            icon={Users}
                            color="bg-blue-500"
                            link="/patients"
                            description="Patients enregistrés"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Total Rendez-vous"
                            value={dashboardData?.stats.total_appointments || 0}
                            icon={Calendar}
                            color="bg-teal-500"
                            link="/appointments"
                            description="Toutes spécialités"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Total Visites"
                            value={dashboardData?.stats.total_visites || 0}
                            icon={ClipboardList}
                            color="bg-amber-500"
                            link="/consultations"
                            description="Historique global"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Médecins Actifs"
                            value={dashboardData?.stats.total_doctors || 0}
                            icon={Activity}
                            color="bg-indigo-500"
                            link="/doctors"
                            description="Personnel médical"
                            isLoading={isLoading}
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rendez-vous */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>{isMedecin ? 'Mes RDV du Jour' : 'Rendez-vous Récents'}</CardTitle>
                            <CardDescription>
                                {isMedecin ? 'Patients attendus aujourd\'hui' : 'Dernières visites planifiées'}
                            </CardDescription>
                        </div>
                        <Link to="/appointments">
                            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                Voir Tout
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
                                ))
                            ) : dashboardData?.recent_data.appointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">Aucun rendez-vous trouvé.</p>
                                </div>
                            ) : (
                                dashboardData?.recent_data.appointments.map((apt: any) => (
                                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 sm:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-teal-600 font-bold border border-teal-100 dark:border-teal-900/30">
                                                {apt.patient?.nom_patient?.substring(0, 2) || 'PT'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{apt.patient?.nom_patient || 'Patient'}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Stethoscope className="w-3 h-3" />
                                                    {apt.motif}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm font-medium text-foreground">{formatDate(apt.date_heure)}</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(apt.statut)}`}>
                                                {apt.statut}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Consultations / Visites */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>{isMedecin ? 'Mes Dernières Visites' : 'Consultations Récentes'}</CardTitle>
                            <CardDescription>Actes médicaux récemment enregistrés</CardDescription>
                        </div>
                        <Link to="/consultations">
                            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                Voir Tout
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
                                ))
                            ) : dashboardData?.recent_data.visites.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">Aucune visite enregistrée.</p>
                                </div>
                            ) : (
                                dashboardData?.recent_data.visites.map((visit: any) => (
                                    <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 sm:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold border border-amber-100 dark:border-amber-900/30">
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{visit.patient?.nom_patient || 'Patient'}</p>
                                                <p className="text-xs text-teal-600 font-medium line-clamp-1">{visit.diagnostic}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm font-medium text-foreground">{new Date(visit.date_visite).toLocaleDateString('fr-FR')}</p>
                                            {!isMedecin && <p className="text-xs text-slate-500">Dr. {visit.medecin?.nom_medecin}</p>}
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
