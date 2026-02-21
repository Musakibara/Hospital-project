import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patientService';
import { consultationService, MedicalVisit } from '@/services/consultationService';
import { authService } from '@/services/authService';
import {
    Activity, ArrowLeft, Save, ClipboardList,
    Stethoscope, Thermometer, Weight, Ruler,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const MedicalConsultation = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = authService.getCurrentUser();
    const [hasChanges, setHasChanges] = useState(false);

    // États du formulaire
    const [formData, setFormData] = useState({
        poids: '',
        taille: '',
        imc: '',
        symptomes: '',
        diagnostic: '',
        maladie: '',
        traitement: '',
        examen: 'Examen clinique général',
        allergie: '',
        maladie_chronique: '',
        observations: ''
    });

    // Récupération des données du patient
    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientService.getPatient(Number(id)),
        enabled: !!id
    });

    // Calcul automatique de l'IMC
    useEffect(() => {
        const p = parseFloat(formData.poids);
        const t = parseFloat(formData.taille);
        if (p > 0 && t > 0) {
            const tMetres = t / 100;
            const imc = (p / (tMetres * tMetres)).toFixed(2);
            setFormData((prev: any) => ({ ...prev, imc }));
        } else {
            setFormData((prev: any) => ({ ...prev, imc: '' }));
        }
    }, [formData.poids, formData.taille]);

    // Mutation pour créer la visite
    const createMutation = useMutation({
        mutationFn: (newVisit: MedicalVisit) => consultationService.createVisit(newVisit),
        onSuccess: () => {
            toast.success('Consultation enregistrée avec succès');
            queryClient.invalidateQueries({ queryKey: ['patient', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate(`/patients/${id}`);
        },
        onError: (error: any) => {
            console.error('Erreur consultation:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        setHasChanges(true);
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (!confirm('Des données non sauvegardées seront perdues. Quitter quand même ?')) return;
        }
        navigate(-1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation simple
        if (!formData.symptomes || !formData.diagnostic || !formData.traitement) {
            toast.error('Veuillez remplir les champs obligatoires (Symptômes, Diagnostic, Traitement)');
            return;
        }

        const medecinId = user?.medecin?.id;
        if (!medecinId) {
            toast.error('Profil médecin non trouvé. Impossible d\'enregistrer.');
            return;
        }

        const visitData: MedicalVisit = {
            patient_id: Number(id),
            medecin_id: medecinId,
            rendez_vous_id: appointmentId ? Number(appointmentId) : null,
            date_visite: new Date().toISOString().split('T')[0],
            symptomes: formData.symptomes,
            diagnostic: formData.diagnostic,
            maladie: formData.maladie || 'N/A', // Valeur par défaut si vide pour éviter le crash SQL
            traitement: formData.traitement,
            examen: formData.examen,
            poids: formData.poids ? Number(formData.poids) : undefined,
            taille: formData.taille ? Number(formData.taille) : undefined,
            imc: formData.imc ? Number(formData.imc) : undefined,
            allergie: formData.allergie || undefined,
            maladie_chronique: formData.maladie_chronique || undefined,
            observations: formData.observations || undefined
        };

        createMutation.mutate(visitData);
    };

    if (isPatientLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={handleCancel}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Nouvelle Consultation</h1>
                        <p className="text-slate-500 text-sm">
                            Patient : <span className="font-semibold text-foreground">{patient?.nom_patient}</span> ({patient?.numero_unique})
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne Gauche : Constantes & Infos */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4 text-teal-600" />
                                Constantes Vitales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Poids (kg)</label>
                                    <div className="relative">
                                        <Weight className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            name="poids"
                                            value={formData.poids}
                                            onChange={handleInputChange}
                                            placeholder="70"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Taille (cm)</label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            name="taille"
                                            value={formData.taille}
                                            onChange={handleInputChange}
                                            placeholder="175"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted/50 border border-border mt-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Indice de Masse Corporelle (IMC)</p>
                                        <p className="text-2xl font-black text-foreground">{formData.imc || '--.-'}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.imc ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-muted text-muted-foreground'}`}>
                                        <Activity className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-amber-50 dark:bg-amber-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-amber-900 dark:text-amber-200">
                                <Info className="h-4 w-4" />
                                Historique &amp; Alertes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Allergies connues</label>
                                <textarea
                                    name="allergie"
                                    value={formData.allergie}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[60px] p-3 text-sm rounded-lg border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/20 focus:ring-amber-500 focus:border-amber-500 outline-none text-foreground"
                                    placeholder="Ex: Pénicilline, Arachides..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Maladies chroniques</label>
                                <textarea
                                    name="maladie_chronique"
                                    value={formData.maladie_chronique}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[60px] p-3 text-sm rounded-lg border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-amber-950/20 focus:ring-amber-500 focus:border-amber-500 outline-none text-foreground"
                                    placeholder="Ex: Diabète Type 2, Hypertension..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Notes Cliniques */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="h-2 bg-teal-600" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-teal-600" />
                                Notes de Consultation
                            </CardTitle>
                            <CardDescription>Remplissez les détails cliniques de la visite du jour</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                        <Thermometer className="h-4 w-4 text-slate-400" />
                                        Symptômes & Plaintes <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <textarea
                                    name="symptomes"
                                    value={formData.symptomes}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[80px] p-4 text-sm rounded-xl border-border bg-muted/30 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-foreground"
                                    placeholder="Décrivez les symptômes rapportés par le patient..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-slate-400" />
                                    Maladie / Pathologie (Optionnel)
                                </label>
                                <Input
                                    name="maladie"
                                    value={formData.maladie}
                                    onChange={handleInputChange}
                                    className="p-4 text-sm rounded-xl border-border bg-muted/30 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-foreground"
                                    placeholder="Ex: Paludisme, Rhume, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-slate-400" />
                                    Diagnostic <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="diagnostic"
                                    value={formData.diagnostic}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[80px] p-4 text-sm rounded-xl border-border bg-muted/30 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-foreground"
                                    placeholder="Conclusion médicale et diagnostic..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                    <Save className="h-4 w-4 text-slate-400" />
                                    Traitement & Ordonnance <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="traitement"
                                    value={formData.traitement}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[80px] p-4 text-sm rounded-xl border-border bg-muted/30 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-foreground"
                                    placeholder="Médicaments prescrits, posologie, conseils..."
                                    required
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase">Observations complémentaires</label>
                                <textarea
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[60px] p-3 text-sm rounded-lg border-border bg-muted/20 focus:ring-teal-300 focus:border-teal-300 outline-none text-foreground"
                                    placeholder="Notes internes, prochains examens à prévoir..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={createMutation.isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px]"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enregistrement...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Valider l'Acte
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MedicalConsultation;
