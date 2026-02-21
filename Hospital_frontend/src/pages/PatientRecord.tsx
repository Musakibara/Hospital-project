import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/patientService';
import {
    User, Calendar, ClipboardList, ArrowLeft,
    Stethoscope, Clock, FileText, Activity,
    MapPin, Phone, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

/**
 * Page de Dossier Patient (Lecture seule pour Consultation Médicale)
 */
const PatientRecord = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showAllRdv, setShowAllRdv] = useState(false);

    const { data: patient, isLoading, error } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientService.getPatient(Number(id)),
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Erreur lors de la récupération du dossier patient.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/patients')}>Retour aux Patients</Button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header avec Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => navigate('/patients')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Dossier Médical</h1>
                        <p className="text-muted-foreground text-sm">Patient ID: {patient.numero_unique}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to={`/patients/${id}/consultation`}>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Nouvelle Consultation
                        </Button>
                    </Link>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-teal-100 bg-teal-50 text-teal-600">
                        Lecture Seule
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne Gauche : Infos Patient */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="h-2 bg-teal-600" />
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4 border-2 border-background shadow-md">
                                    <User className="h-10 w-10" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{patient.nom_patient}</h2>
                                <p className="text-muted-foreground">{getAge(patient.date_naissance)} ans • {patient.sexe}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-medium">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Date de naissance</p>
                                        <p className="text-foreground font-medium">{formatDate(patient.date_naissance)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-medium">
                                        <Briefcase className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Profession</p>
                                        <p className="text-foreground font-medium">{patient.profession || 'Non renseignée'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-medium">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Contact</p>
                                        <p className="text-foreground font-medium">{patient.contact_patient}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-medium">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Adresse</p>
                                        <p className="text-foreground font-medium line-clamp-1">{patient.adresse}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden bg-amber-50 dark:bg-amber-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-amber-900 dark:text-amber-200">
                                <Activity className="h-4 w-4" />
                                Antécédents Médicaux
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap leading-relaxed">
                                {patient.antecedents_medicaux || 'Aucun antécédent particulier déclaré.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Timeline & Historique */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline des Visites */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-teal-600" />
                                Historique des Consultations
                            </CardTitle>
                            <CardDescription>Parcours de soins du patient au sein de l'établissement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!patient.visites_medicales || patient.visites_medicales.length === 0 ? (
                                <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed border-border">
                                    <Stethoscope className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="text-muted-foreground">Aucune visite médicale enregistrée pour le moment.</p>
                                </div>
                            ) : (
                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-200 before:via-slate-200 before:to-transparent">
                                    {patient.visites_medicales.map((visit: any, index: number) => (
                                        <motion.div
                                            key={visit.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative flex items-start gap-6 pl-5"
                                        >
                                            <div className="absolute left-0 mt-1.5 w-10 h-10 rounded-full bg-white border-4 border-teal-500 shadow-sm z-10 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-teal-500" />
                                            </div>

                                            <div className="flex-1 bg-muted/40 rounded-xl p-5 border border-border hover:border-teal-200 dark:hover:border-teal-700 transition-colors shadow-sm">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-1">
                                                            Visite du {new Date(visit.date_visite).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <h3 className="text-lg font-bold text-foreground">{visit.diagnostic}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                                                        <User className="h-3 w-3" />
                                                        Dr. {visit.medecin?.nom_medecin || 'Inconnu'}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                                                <Activity className="h-3 w-3" /> Symptômes
                                                            </p>
                                                            <p className="text-foreground leading-relaxed bg-background/50 p-2 rounded-lg border border-border">{visit.symptomes || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                                                <FileText className="h-3 w-3" /> Traitement
                                                            </p>
                                                            <p className="text-foreground leading-relaxed font-medium bg-background/50 p-2 rounded-lg border border-border">{visit.traitement || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Examens réalisés</p>
                                                            <p className="text-foreground bg-background/50 p-2 rounded-lg border border-border">{visit.examen || 'Normal'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-background/50 p-2 rounded-lg border border-border">
                                                                <p className="text-muted-foreground text-[9px] uppercase font-bold">Poids</p>
                                                                <p className="font-bold text-foreground">{visit.poids} kg</p>
                                                            </div>
                                                            <div className="bg-background/50 p-2 rounded-lg border border-border">
                                                                <p className="text-muted-foreground text-[9px] uppercase font-bold">IMC</p>
                                                                <p className="font-bold text-foreground">{visit.imc}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rendez-vous passés/futurs */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                Historique des Rendez-vous
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {!patient.rendez_vous || patient.rendez_vous.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">Aucun rendez-vous enregistré.</p>
                                ) : (
                                    <>
                                        {(showAllRdv ? patient.rendez_vous : patient.rendez_vous.slice(0, 5)).map((rdv: any) => (
                                            <div key={rdv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground shadow-sm border border-border">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{formatDate(rdv.date_heure)}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight line-clamp-1">{rdv.motif}</p>
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                                                    {rdv.statut}
                                                </span>
                                            </div>
                                        ))}
                                        {patient.rendez_vous.length > 5 && (
                                            <button
                                                onClick={() => setShowAllRdv(prev => !prev)}
                                                className="w-full text-center text-xs text-teal-600 font-medium hover:underline mt-2"
                                            >
                                                {showAllRdv ? 'Voir moins' : `Voir tout (${patient.rendez_vous.length})`}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PatientRecord;
