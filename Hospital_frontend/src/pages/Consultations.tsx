import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationService, MedicalVisit } from '@/services/consultationService';
import { appointmentService } from '@/services/appointmentService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stethoscope, CheckCircle, Clock, History, User, FileText, Search, Activity, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { doctorService, Doctor } from '@/services/doctorService';
import { Modal } from '@/components/ui/modal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

/**
 * Page des consultations médicales optimisée.
 */
const Consultations = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // Initialisation depuis les paramètres d'URL
    const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'new';
    const initialSearch = searchParams.get('search') || '';

    const [activeTab, setActiveTab] = useState<'new' | 'history'>(initialTab);
    const [historySearch, setHistorySearch] = useState(initialSearch);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Effet pour synchroniser si les paramètres d'URL changent (ex: navigation inter-pages)
    useEffect(() => {
        const tab = searchParams.get('tab');
        const search = searchParams.get('search');

        if (tab === 'history') setActiveTab('history');
        if (search) setHistorySearch(search);
    }, [searchParams]);

    // Filters state
    const [filters, setFilters] = useState({
        medecin_id: '',
        date_start: '',
        date_end: '',
    });

    const user = authService.getCurrentUser();
    const isMedecin = user?.role === 'medecin';

    const [formData, setFormData] = useState<Partial<MedicalVisit>>({
        examen: 'Examen clinique général',
        diagnostic: '',
        traitement: '',
        symptomes: '',
        maladie: '',
        observations: ''
    });

    // Calcule la date du jour au format YYYY-MM-DD
    const getTodayDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = getTodayDate();

    // Requête pour la file d'attente (RDV du jour non réalisés)
    // On rafraîchit toutes les 5 secondes pour une expérience "Temps Réel"
    const { data: pendingAppointments = [], isLoading: isLoadingQueue } = useQuery({
        queryKey: ['queue', todayStr],
        queryFn: async () => {
            const response = await appointmentService.getAppointments({
                date: todayStr,
                statut: 'prevu,confirme,en_cours,reporte',
                per_page: 100,
                order: 'asc' // Ordre chronologique pour la salle d'attente
            });

            // On filtre les RDV qui n'ont pas encore de visite médicale
            return response.data.filter(apt => !apt.has_visite);
        },
        refetchInterval: 5000, // Rafraîchissement auto toutes les 5s
        enabled: activeTab === 'new'
    });

    // Liste des médecins pour le filtre (admin uniquement)
    const { data: doctors = [] } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            return await doctorService.getDoctors();
        },
        enabled: user?.role === 'admin' && activeTab === 'history'
    });

    // Requête pour l'historique avec filtres
    const { data: historyVisits = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['consultation-history', filters, historySearch, activeTab],
        queryFn: async () => {
            const params: any = {
                search: historySearch,
                ...filters
            };

            // Si c'est un médecin, on filtre par son ID par défaut
            if (isMedecin && user?.medecin?.id) {
                params.medecin_id = user.medecin.id;
            }

            const response = await consultationService.getVisits(params);
            return response.data;
        },
        enabled: activeTab === 'history'
    });

    // Mutation pour enregistrer la consultation
    const saveMutation = useMutation({
        mutationFn: (visitData: any) => consultationService.createVisit(visitData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queue'] });
            queryClient.invalidateQueries({ queryKey: ['consultation-history'] });
            toast.success('Consultation enregistrée avec succès !');
            setSelectedAppointment(null);
            setFormData({
                examen: '', diagnostic: '', traitement: '', symptomes: '', maladie: '', observations: ''
            });
        },
        onError: (error: any) => {
            toast.error(`Échec: ${error.response?.data?.message || error.message}`);
        }
    });

    // Handlers mémoïsés
    const handleSelect = useCallback((apt: any) => {
        setSelectedAppointment(apt);
        setFormData({
            examen: '', diagnostic: '', traitement: '', symptomes: '', maladie: '', observations: ''
        });
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        const visitData: any = {
            patient_id: selectedAppointment.patient?.id,
            medecin_id: selectedAppointment.medecin?.id,
            rendez_vous_id: selectedAppointment.id,
            date_visite: new Date().toISOString().split('T')[0],
            ...formData
        };

        saveMutation.mutate(visitData);
    }, [selectedAppointment, formData, saveMutation]);

    const handleOpenDetails = (visit: MedicalVisit) => {
        setSelectedVisit(visit);
        setIsDetailModalOpen(true);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            medecin_id: '',
            date_start: '',
            date_end: '',
        });
        setHistorySearch('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 min-h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Consultations</h1>
                    <p className="text-slate-500 mt-1">Effectuez des visites et consultez l'historique médical.</p>
                </div>
                <div className="flex bg-muted p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'new' ? 'bg-card text-teal-700 dark:text-teal-400 shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                    >
                        Nouvelle Consultation
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'history' ? 'bg-card text-teal-700 dark:text-teal-400 shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                    >
                        Historique des Visites
                    </button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-14rem)]">
                    <div className="lg:col-span-1 space-y-4 overflow-auto pr-0 lg:pr-2 max-h-[40vh] lg:max-h-none">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-teal-500" />
                            Salle d'attente (Aujourd'hui)
                        </h2>
                        {isLoadingQueue ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse border border-border" />)}
                            </div>
                        ) : pendingAppointments.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 bg-card rounded-xl border border-dashed border-border">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Aucun rendez-vous en attente pour aujourd'hui.</p>
                            </div>
                        ) : (
                            pendingAppointments.map((apt: any) => (
                                <div
                                    key={apt.id}
                                    onClick={() => handleSelect(apt)}
                                    className={cn(
                                        "p-4 rounded-xl border cursor-pointer transition-all group",
                                        selectedAppointment?.id === apt.id
                                            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 shadow-sm ring-1 ring-teal-500'
                                            : 'bg-card border-border hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm'
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-foreground truncate mr-2">
                                            {apt.patient?.nom_patient || `Patient #${apt.patient_id}`}
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 whitespace-nowrap">
                                            {new Date(apt.date_heure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{apt.motif}</p>
                                    <div className="flex items-center text-xs text-slate-400 gap-1">
                                        <User className="w-3 h-3" />
                                        Dr. {apt.medecin?.nom_medecin}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-2 min-h-[50vh] lg:h-full">
                        {selectedAppointment ? (
                            <Card className="h-full flex flex-col border-teal-100 dark:border-teal-900/50 shadow-xl overflow-hidden bg-card">
                                <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 border-b border-teal-100 dark:border-teal-900/50 py-4">
                                    <CardTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-400 text-lg">
                                        <Stethoscope className="w-5 h-5" />
                                        Consultation Médicale
                                    </CardTitle>
                                    <CardDescription>
                                        Enregistrement pour <span className="font-semibold text-foreground">{selectedAppointment.patient?.nom_patient}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-6 transition-colors">
                                    <form id="consultation-form" onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-orange-400" /> Symptômes
                                                </label>
                                                <textarea
                                                    className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-foreground"
                                                    placeholder="Plaintes du patient..."
                                                    value={formData.symptomes || ''}
                                                    onChange={e => setFormData({ ...formData, symptomes: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-blue-400" /> Examen Clinique
                                                </label>
                                                <textarea
                                                    className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-foreground"
                                                    placeholder="Résultats de l'examen physique..."
                                                    value={formData.examen || ''}
                                                    onChange={e => setFormData({ ...formData, examen: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Diagnostic</label>
                                                <Input
                                                    className="bg-background focus:bg-card"
                                                    placeholder="Diagnostic confirmé..."
                                                    value={formData.diagnostic || ''}
                                                    onChange={e => setFormData({ ...formData, diagnostic: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Maladie / Pathologie</label>
                                                <Input
                                                    className="bg-background focus:bg-card"
                                                    placeholder="Nom de la pathologie..."
                                                    value={formData.maladie || ''}
                                                    onChange={e => setFormData({ ...formData, maladie: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Prescription / Traitement</label>
                                            <textarea
                                                className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-foreground"
                                                placeholder="Médicaments et posologie..."
                                                value={formData.traitement || ''}
                                                onChange={e => setFormData({ ...formData, traitement: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Observations (Optionnel)</label>
                                            <Input
                                                className="bg-background focus:bg-card"
                                                placeholder="Notes additionnelles..."
                                                value={formData.observations || ''}
                                                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                            />
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="bg-muted border-t border-border p-4 flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>Annuler</Button>
                                    <Button type="submit" form="consultation-form" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20" disabled={saveMutation.isPending}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {saveMutation.isPending ? "Traitement..." : "Terminer la Consultation"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-card/30 rounded-xl border border-dashed border-border text-slate-400">
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                                        <Stethoscope className="w-8 h-8 text-teal-200 dark:text-teal-800" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-1">Prêt pour la Consultation</h3>
                                    <p>Sélectionnez un patient dans la file d'attente pour commencer.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filtres Historique */}
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Patient, diagnostic..."
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {!isMedecin && user?.role === 'admin' && (
                                <select
                                    name="medecin_id"
                                    value={filters.medecin_id}
                                    onChange={handleFilterChange}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-foreground transition-colors"
                                >
                                    <option value="" className="bg-background">Tous les médecins</option>
                                    {doctors.map((doc: Doctor) => (
                                        <option key={doc.id} value={doc.id} className="bg-background">Dr. {doc.nom_medecin}</option>
                                    ))}
                                </select>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Du</span>
                                <Input
                                    type="date"
                                    name="date_start"
                                    value={filters.date_start}
                                    onChange={handleFilterChange}
                                    className="h-10"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Au</span>
                                <Input
                                    type="date"
                                    name="date_end"
                                    value={filters.date_end}
                                    onChange={handleFilterChange}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        {(historySearch || filters.medecin_id || filters.date_start || filters.date_end) && (
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
                                    Effacer les filtres
                                </Button>
                            </div>
                        )}
                    </div>

                    {isLoadingHistory ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-card rounded-xl animate-pulse border border-border" />)}
                        </div>
                    ) : historyVisits.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                            <History className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-foreground">Aucun historique trouvé</h3>
                            <p className="text-slate-500 text-sm">Essayez de modifier vos filtres de recherche.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {historyVisits.map((visit: MedicalVisit) => (
                                <Card
                                    key={visit.id}
                                    className="hover:shadow-lg transition-all group border-border bg-card overflow-hidden cursor-pointer"
                                    onClick={() => handleOpenDetails(visit)}
                                >
                                    <div className="h-1 bg-teal-500 w-0 group-hover:w-full transition-all duration-300" />
                                    <CardHeader className="bg-muted/50 pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-bold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                                    {visit.patient?.nom_patient || `Patient #${visit.patient_id}`}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(visit.date_visite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </CardDescription>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4 text-sm">
                                        <div className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100/50 dark:border-teal-900/30">
                                            <span className="font-bold text-teal-800 dark:text-teal-400 block text-[10px] uppercase tracking-wider mb-1">Diagnostic principal</span>
                                            <p className="text-foreground font-semibold line-clamp-1">{visit.diagnostic}</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border">
                                            <div className="text-center">
                                                <span className="text-[10px] text-slate-400 uppercase block">Poids</span>
                                                <span className="font-bold text-foreground">{visit.poids ? `${visit.poids}kg` : '--'}</span>
                                            </div>
                                            <div className="text-center border-x border-border">
                                                <span className="text-[10px] text-slate-400 uppercase block">Taille</span>
                                                <span className="font-bold text-foreground">{visit.taille ? `${visit.taille}cm` : '--'}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[10px] text-slate-400 uppercase block">IMC</span>
                                                <span className={cn("font-bold", visit.imc && visit.imc > 25 ? "text-orange-500" : "text-teal-600")}>
                                                    {visit.imc || '--'}
                                                </span>
                                            </div>
                                        </div>

                                        {!isMedecin && (
                                            <div className="flex items-center text-xs text-slate-500 gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                    {visit.medecin?.nom_medecin.substring(0, 1)}
                                                </div>
                                                <span>Dr. {visit.medecin?.nom_medecin}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="bg-muted/30 py-2 px-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400">Cliquez pour voir les détails</span>
                                        <Activity className="w-3 h-3 text-teal-400" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Détails */}
            {selectedVisit && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Détails de la Consultation"
                    maxWidth="2xl"
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Patient</p>
                                <p className="text-lg font-bold text-foreground">{selectedVisit.patient?.nom_patient}</p>
                                <p className="text-xs text-slate-500">Dossier : {selectedVisit.patient?.numero_unique}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Date de visite</p>
                                <p className="font-semibold text-foreground">
                                    {new Date(selectedVisit.date_visite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-slate-500">Par Dr. {selectedVisit.medecin?.nom_medecin}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg border border-border text-center">
                                <span className="text-[10px] text-slate-400 uppercase block mb-1">Tension / Const.</span>
                                <span className="font-bold text-foreground">{selectedVisit.examen ? 'Prises' : '--'}</span>
                            </div>
                            <div className="p-3 rounded-lg border border-border text-center">
                                <span className="text-[10px] text-slate-400 uppercase block mb-1">Poids</span>
                                <span className="font-bold text-foreground">{selectedVisit.poids} kg</span>
                            </div>
                            <div className="p-3 rounded-lg border border-border text-center">
                                <span className="text-[10px] text-slate-400 uppercase block mb-1">Taille</span>
                                <span className="font-bold text-foreground">{selectedVisit.taille} cm</span>
                            </div>
                            <div className="p-3 rounded-lg border border-border text-center bg-teal-500/10 dark:bg-teal-900/20">
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase block mb-1 font-bold">IMC</span>
                                <span className="font-black text-teal-700 dark:text-teal-300">{selectedVisit.imc}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Symptômes & Plaintes
                                </h4>
                                <div className="p-4 rounded-xl bg-muted text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedVisit.symptomes}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    Diagnostic & Pathologie
                                </h4>
                                <div className="p-4 rounded-xl bg-teal-500/10 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/50 text-sm text-foreground font-medium">
                                    {selectedVisit.diagnostic}
                                    {selectedVisit.maladie && (
                                        <div className="mt-2 pt-2 border-t border-teal-100 dark:border-teal-900/50 text-xs text-teal-700 dark:text-teal-400">
                                            Pathologie : <span className="font-bold">{selectedVisit.maladie}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Traitement & Ordonnance
                                </h4>
                                <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 text-sm text-foreground italic border-l-4 border-l-blue-400">
                                    {selectedVisit.traitement}
                                </div>
                            </div>

                            {selectedVisit.observations && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-2 uppercase tracking-widest text-[10px]">
                                        Observations
                                    </h4>
                                    <div className="p-3 text-xs text-slate-500 italic">
                                        {selectedVisit.observations}
                                    </div>
                                </div>
                            )}

                            {(selectedVisit.allergie || selectedVisit.maladie_chronique) && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedVisit.allergie && (
                                        <div>
                                            <span className="text-[10px] font-bold text-red-600 uppercase">Allergies</span>
                                            <p className="text-xs text-red-800">{selectedVisit.allergie}</p>
                                        </div>
                                    )}
                                    {selectedVisit.maladie_chronique && (
                                        <div>
                                            <span className="text-[10px] font-bold text-red-600 uppercase">Maladies Chroniques</span>
                                            <p className="text-xs text-red-800">{selectedVisit.maladie_chronique}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setIsDetailModalOpen(false)} variant="secondary">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Consultations;
