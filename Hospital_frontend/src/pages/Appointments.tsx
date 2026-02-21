import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { doctorService } from '@/services/doctorService';
import { patientService } from '@/services/patientService';
import { authService } from '@/services/authService';
import { toast } from 'react-hot-toast';
import { Search, Calendar as CalendarIcon, Clock, User, FileText, Plus, X, RefreshCw, Edit, CheckCircle2, XCircle, LayoutPanelLeft, History as HistoryIcon, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

/**
 * Page de gestion des rendez-vous optimisée.
 * Utilise TanStack Query pour le cache, la déduplication et la synchronisation.
 */
const Appointments = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [originalAppointment, setOriginalAppointment] = useState<Partial<Appointment>>({});

    // Filtres
    const user = authService.getCurrentUser();
    const isMedecin = user?.role === 'medecin';

    const [filterDate, setFilterDate] = useState('');
    const [filterDoctor, setFilterDoctor] = useState(isMedecin ? user?.medecin?.id?.toString() || '' : '');
    const [filterStatus, setFilterStatus] = useState('');

    // État du formulaire
    const [currentAppointment, setCurrentAppointment] = useState<Partial<Appointment>>({
        statut: 'prevu'
    });

    const statutLabels: Record<string, string> = {
        prevu: 'Programmé',
        confirme: 'Confirmé',
        en_cours: 'En cours',
        effectue: 'Terminé',
        annule: 'Annulé',
        reporte: 'Reporté'
    };

    // Requêtes de données
    const { data: doctors = [] } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => doctorService.getDoctors()
    });

    const { data: patientsResponse } = useQuery({
        queryKey: ['patients', 1, patientSearch],
        queryFn: () => patientService.getPatients(1, patientSearch),
        enabled: isModalOpen || !!patientSearch // Ne charger que si pertinent
    });
    const patients = useMemo(() => patientsResponse?.data || [], [patientsResponse]);

    const { data: appointmentsResponse, isLoading, refetch } = useQuery({
        queryKey: ['appointments', filterDate, filterDoctor, filterStatus],
        queryFn: () => {
            const filters: any = {};
            if (filterDate) filters.date = filterDate;
            if (filterDoctor) filters.medecin_id = parseInt(filterDoctor);
            if (filterStatus) filters.statut = filterStatus;
            return appointmentService.getAppointments(filters);
        }
    });
    const appointments = useMemo(() => appointmentsResponse?.data || [], [appointmentsResponse]);

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (vars: { isEditing: boolean, data: Partial<Appointment>, original: Partial<Appointment> }) => {
            if (vars.isEditing && vars.data.id) {
                const updateData: any = {};
                const fields: (keyof Appointment)[] = ['patient_id', 'medecin_id', 'date_heure', 'motif', 'statut', 'observation'];
                fields.forEach(field => {
                    if (vars.data[field] !== vars.original[field]) {
                        updateData[field] = vars.data[field];
                    }
                });
                if (Object.keys(updateData).length > 0) {
                    return appointmentService.updateAppointment(vars.data.id, updateData);
                }
                return null;
            } else {
                return appointmentService.createAppointment(vars.data as Appointment);
            }
        },
        onSuccess: (data) => {
            if (data !== null) {
                queryClient.invalidateQueries({ queryKey: ['appointments'] });
                toast.success(isEditing ? "Rendez-vous mis à jour" : "Rendez-vous enregistré et email envoyé");
            }
            setIsModalOpen(false);
            setCurrentAppointment({ statut: 'prevu' });
            setOriginalAppointment({});
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
            appointmentService.updateAppointment(id, { statut: status as any }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success("Statut mis à jour");
        }
    });

    // Handlers mémoïsés
    const handleBook = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({ isEditing, data: currentAppointment, original: originalAppointment });
    }, [isEditing, currentAppointment, originalAppointment, saveMutation]);

    const handleEditClick = useCallback((apt: Appointment) => {
        const formattedApt = {
            ...apt,
            patient_id: apt.patient?.id,
            medecin_id: apt.medecin?.id,
            date_heure: apt.date_heure ? apt.date_heure.replace(' ', 'T').slice(0, 16) : ''
        };
        setCurrentAppointment(formattedApt);
        setOriginalAppointment(formattedApt);
        setPatientSearch(apt.patient?.nom_patient || '');
        setIsEditing(true);
        setIsModalOpen(true);
    }, []);

    const handleStatusChange = useCallback((id: number, newStatus: string) => {
        statusMutation.mutate({ id, status: newStatus });
    }, [statusMutation]);

    const clearFilters = useCallback(() => {
        setFilterDate('');
        setFilterDoctor(isMedecin ? user?.medecin?.id?.toString() || '' : '');
        setFilterStatus('');
    }, [isMedecin, user?.medecin?.id]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'prevu': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50';
            case 'confirme': return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-900/50';
            case 'en_cours': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50';
            case 'effectue': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50';
            default: return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/50';
        }
    };

    const getIconStyle = (status: string) => {
        switch (status) {
            case 'prevu': return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
            case 'confirme': return 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400';
            case 'en_cours': return 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400';
            case 'effectue': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400';
            default: return 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Rendez-vous</h1>
                    <p className="text-slate-500 mt-1">Planifiez et suivez les visites médicales et les interventions.</p>
                </div>
                <Button
                    onClick={() => {
                        setIsEditing(false);
                        setCurrentAppointment({
                            statut: 'prevu',
                            medecin_id: isMedecin ? user?.medecin?.id : undefined
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Rendez-vous
                </Button>
            </div>

            {/* Barre de filtres - Opaque en mode clair */}
            <div className="bg-card p-4 rounded-2xl border border-border shadow-sm transition-all hover:shadow-md space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative group">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="pl-9 h-10 w-full sm:w-44 bg-background border-border rounded-xl focus:ring-teal-500/20"
                            />
                        </div>

                        {!isMedecin && (
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                <select
                                    className="pl-9 pr-8 h-10 w-full sm:w-48 appearance-none rounded-xl border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-foreground"
                                    value={filterDoctor}
                                    onChange={(e) => setFilterDoctor(e.target.value)}
                                >
                                    <option value="">Tous les médecins</option>
                                    {doctors.map((doc: any) => (
                                        <option key={doc.id} value={doc.id}>Dr. {doc.nom_medecin}</option>
                                    ))}
                                </select>
                                <LayoutPanelLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                        )}

                        {((!isMedecin && filterDoctor) || filterDate || filterStatus) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                                <X className="w-4 h-4 mr-2" /> Effacer
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto no-scrollbar">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => refetch()}
                            className="mr-2 text-slate-400 hover:text-teal-600"
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </Button>

                        <div className="flex bg-muted p-1 rounded-xl border border-border">
                            {[
                                { label: 'Tous', value: '', icon: LayoutPanelLeft },
                                { label: 'Programmé', value: 'prevu', icon: CalendarIcon, color: 'text-blue-500' },
                                { label: 'Confirmé', value: 'confirme', icon: CheckCircle2, color: 'text-teal-600' },
                                { label: 'En cours', value: 'en_cours', icon: RefreshCw, color: 'text-amber-500' },
                                { label: 'Terminé', value: 'effectue', icon: CheckCircle2, color: 'text-indigo-600' },
                                { label: 'Annulé', value: 'annule', icon: XCircle, color: 'text-rose-500' }
                            ].map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => setFilterStatus(s.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                                        filterStatus === s.value
                                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/40 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <s.icon className={cn("w-3.5 h-3.5", filterStatus === s.value && s.color)} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-card/50 rounded-xl animate-pulse border border-border" />
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed border-border">
                    <CalendarIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground">Aucun rendez-vous trouvé</h3>
                    <p className="text-slate-500">Planifiez un nouveau rendez-vous pour commencer.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {appointments.map((apt: Appointment) => (
                        <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={cn("mt-1 p-3 rounded-xl transition-colors", getIconStyle(apt.statut))}>
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-foreground">Dr. {apt.medecin?.nom_medecin || 'Inconnu'}</h4>
                                        <span className="text-slate-300 dark:text-slate-700">|</span>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{apt.medecin?.specialite}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-foreground">{apt.patient?.nom_patient || `Patient #${apt.patient_id}`}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {new Date(apt.date_heure).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            {apt.motif}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-2 sm:gap-3">
                                {apt.statut === 'prevu' && (
                                    <Button size="sm" variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50" onClick={() => apt.id && handleStatusChange(apt.id, 'confirme')}>
                                        Confirmer
                                    </Button>
                                )}
                                {apt.statut === 'confirme' && (
                                    <Button size="sm" variant="outline" className="text-slate-600 hover:bg-slate-50" onClick={() => apt.id && handleStatusChange(apt.id, 'effectue')}>
                                        Terminer
                                    </Button>
                                )}
                                {!['annule', 'effectue'].includes(apt.statut) && (
                                    <Button size="sm" variant="outline" className="bg-card hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => handleEditClick(apt)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}

                                {(apt.statut === 'prevu' || apt.statut === 'confirme') && (
                                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => apt.id && handleStatusChange(apt.id, 'annule')}>
                                        Annuler
                                    </Button>
                                )}

                                {apt.statut === 'confirme' && (
                                    <Button
                                        size="sm"
                                        className="bg-teal-600 hover:bg-teal-700 text-white"
                                        onClick={() => {
                                            window.location.href = `/patients/${apt.patient_id}/consultation?appointmentId=${apt.id}`;
                                        }}
                                    >
                                        <Stethoscope className="w-4 h-4 mr-2" />
                                        Consulter
                                    </Button>
                                )}

                                {apt.statut === 'effectue' && apt.visite_id && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-teal-600 border-teal-200 hover:bg-teal-50"
                                        onClick={() => {
                                            // Navigation vers l'historique des consultations filtré
                                            navigate(`/consultations?tab=history&search=${apt.patient?.nom_patient}`);
                                        }}
                                    >
                                        <HistoryIcon className="w-4 h-4 mr-2" />
                                        Consulter l'acte
                                    </Button>
                                )}

                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusStyle(apt.statut))}>
                                    {statutLabels[apt.statut] || apt.statut}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Modifier le rendez-vous" : "Nouveau Rendez-vous"}
            >
                <form onSubmit={handleBook} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Sélection du Patient</label>
                        <div className="relative group/search">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-teal-500 group-focus-within/search:scale-110 transition-transform" />
                            </div>
                            <Input
                                placeholder={isEditing ? "Patient (Non-modifiable)" : "Rechercher par nom..."}
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                disabled={isEditing}
                                className={cn(
                                    "pl-11 h-12 bg-background border-border rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all font-medium",
                                    isEditing && "opacity-60 cursor-not-allowed bg-muted"
                                )}
                            />
                        </div>
                        <div className="relative group/select">
                            <select
                                className={cn(
                                    "flex h-12 w-full appearance-none rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all cursor-pointer",
                                    isEditing && "opacity-60 cursor-not-allowed bg-muted"
                                )}
                                required
                                disabled={isEditing}
                                value={currentAppointment.patient_id || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCurrentAppointment({ ...currentAppointment, patient_id: val ? parseInt(val) : undefined });
                                }}
                            >
                                <option value="">Résultats ({patients.length} trouvés)</option>
                                {patients.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.nom_patient} — ID: {p.numero_unique}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {!isMedecin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Personnel Médical</label>
                            <select
                                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all text-foreground"
                                required
                                value={currentAppointment.medecin_id || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCurrentAppointment({ ...currentAppointment, medecin_id: val ? parseInt(val) : undefined });
                                }}
                            >
                                <option value="">Sélectionner un médecin...</option>
                                {doctors
                                    .filter((doc: any) => {
                                        const isAvailable = doc.disponible || doc.id === currentAppointment.medecin_id;
                                        if (isEditing) {
                                            const currentDoctor = doctors.find((d: any) => d.id === currentAppointment.medecin_id);
                                            return isAvailable && doc.specialite === (currentDoctor as any)?.specialite;
                                        }
                                        return isAvailable;
                                    })
                                    .map((doc: any) => (
                                        <option key={doc.id} value={doc.id}>Dr. {doc.nom_medecin} — {doc.specialite}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Date & Heure</label>
                            <Input
                                type="datetime-local"
                                required
                                min={new Date().toISOString().slice(0, 16)}
                                value={currentAppointment.date_heure ? currentAppointment.date_heure.replace(' ', 'T').slice(0, 16) : ''}
                                onChange={(e) => setCurrentAppointment({ ...currentAppointment, date_heure: e.target.value.replace('T', ' ') })}
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Statut</label>
                            <select
                                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all cursor-pointer text-foreground"
                                value={currentAppointment.statut || 'prevu'}
                                onChange={(e) => setCurrentAppointment({ ...currentAppointment, statut: e.target.value as any })}
                            >
                                <option value="prevu">Programmé</option>
                                <option value="confirme">Confirmé</option>
                                <option value="en_cours">En cours</option>
                                <option value="effectue">Terminé</option>
                                <option value="annule">Annulé</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Motif de la visite</label>
                        <Input
                            required
                            placeholder="ex: Consultation de suivi"
                            value={currentAppointment.motif || ''}
                            onChange={(e) => setCurrentAppointment({ ...currentAppointment, motif: e.target.value })}
                            className="bg-background"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl shadow-lg shadow-teal-500/20 transition-all font-bold"
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? "Traitement..." : (isEditing ? "Enregistrer" : "Confirmer le RDV")}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Appointments;
