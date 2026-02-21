import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService, Doctor } from '@/services/doctorService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, Plus, Edit, Trash2, User, LayoutPanelLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import DoctorDetail from '@/components/DoctorDetail';

/**
 * Page de gestion des médecins optimisée.
 * Utilise TanStack Query pour une gestion d'état serveur robuste.
 */
const Doctors = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState<Partial<Doctor>>({});
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'true' | 'false'>('all');

    // Requête pour les médecins
    const { data: doctors = [], isLoading } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => doctorService.getDoctors()
    });

    // Mutations
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, actif, disponible }: { id: number, actif: boolean, disponible: boolean }) =>
            doctorService.updateDoctor(id, { actif, disponible }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            toast.success(`Le statut a été mis à jour.`);
        },
        onError: () => toast.error("Erreur lors du changement de statut actif")
    });

    const toggleAvailabilityMutation = useMutation({
        mutationFn: ({ id, disponible }: { id: number, disponible: boolean }) =>
            doctorService.updateDoctor(id, { disponible }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            toast.success(`La disponibilité a été mise à jour.`);
        },
        onError: () => toast.error("Erreur lors du changement de disponibilité")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => doctorService.deleteDoctor(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            toast.success("Médecin supprimé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Erreur lors de la suppression");
        }
    });

    const saveMutation = useMutation({
        mutationFn: (doctor: Partial<Doctor>) => {
            if (isEditing && doctor.id) {
                return doctorService.updateDoctor(doctor.id, doctor);
            }
            return doctorService.createDoctor(doctor as Doctor);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            setIsModalOpen(false);
            toast.success(isEditing ? "Modifications enregistrées" : "Médecin ajouté avec succès");
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
        }
    });

    // Handlers mémoïsés
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const filteredDoctors = useMemo(() => {
        return doctors.filter((doctor: Doctor) => {
            const matchesSearch = `${doctor.nom_medecin} ${doctor.specialite}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAvailability = availabilityFilter === 'all' ||
                (availabilityFilter === 'true' && doctor.disponible) ||
                (availabilityFilter === 'false' && !doctor.disponible);
            return matchesSearch && matchesAvailability;
        });
    }, [doctors, searchTerm, availabilityFilter]);

    const handleAddClick = useCallback(() => {
        setCurrentDoctor({
            nom_medecin: '',
            specialite: '',
            contact_medecin: '',
            email_medecin: '',
            genre_medecin: 'Masculin',
            actif: true,
            can_edit_profile: true,
            disponible: true
        });
        setIsEditing(false);
        setIsModalOpen(true);
    }, []);

    const handleEditClick = useCallback((doctor: Doctor) => {
        setCurrentDoctor(doctor);
        setIsEditing(true);
        setIsModalOpen(true);
    }, []);

    const handleViewDetails = useCallback(async (id: number) => {
        try {
            const fullDoctor = await doctorService.getDoctor(id);
            setSelectedDoctor(fullDoctor);
            setIsDetailOpen(true);
        } catch (error) {
            console.error("Failed to fetch doctor details", error);
        }
    }, []);

    const handleToggleActive = useCallback((doctor: Doctor) => {
        if (!doctor.id) return;
        const newActiveStatus = !doctor.actif;
        const newAvailabilityStatus = newActiveStatus ? (doctor.disponible ?? false) : false;
        toggleActiveMutation.mutate({ id: doctor.id, actif: newActiveStatus, disponible: newAvailabilityStatus });
    }, [toggleActiveMutation]);

    const handleToggleAvailability = useCallback((doctor: Doctor) => {
        if (!doctor.id) return;
        toggleAvailabilityMutation.mutate({ id: doctor.id, disponible: !doctor.disponible });
    }, [toggleAvailabilityMutation]);

    const handleDeleteClick = useCallback((id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
            deleteMutation.mutate(id);
        }
    }, [deleteMutation]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(currentDoctor);
    }, [saveMutation, currentDoctor]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Médecins</h1>
                    <p className="text-slate-500 mt-1">Gérez le personnel médical et les spécialistes de l'hôpital.</p>
                </div>
                <Button onClick={handleAddClick} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un Médecin
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher par nom ou spécialité..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-11 h-11 w-full bg-white/50 border-slate-200/60 rounded-xl focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200/60 w-full md:w-auto">
                    {[
                        { label: 'Tous', value: 'all', icon: LayoutPanelLeft },
                        { label: 'Disponibles', value: 'true', icon: CheckCircle2, color: 'text-teal-600' },
                        { label: 'Absents', value: 'false', icon: XCircle, color: 'text-rose-500' }
                    ].map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => setAvailabilityFilter(btn.value as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                availabilityFilter === btn.value
                                    ? "bg-background text-foreground shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <btn.icon className={cn("w-4 h-4", availabilityFilter === btn.value && btn.color)} />
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse h-64 bg-slate-100 border-none rounded-xl" />
                    ))}
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground">Aucun médecin trouvé</h3>
                    <p className="text-slate-500">Commencez par ajouter un nouveau médecin.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor: Doctor) => (
                        <Card key={doctor.id} className="hover:shadow-lg transition-all duration-300 group border-slate-200 hover:border-teal-200 rounded-xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 bg-slate-50/50">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                                    {doctor.nom_medecin.charAt(0)}
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-foreground">Dr. {doctor.nom_medecin}</CardTitle>
                                    <p className="text-sm text-teal-600 font-semibold">{doctor.specialite}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                                    {doctor.email_medecin || 'N/A'}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                                    {doctor.contact_medecin || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(doctor)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-all border",
                                            doctor.actif
                                                ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                                                : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                                        )}
                                        disabled={toggleActiveMutation.isPending}
                                    >
                                        <div className={cn("w-1.5 h-1.5 rounded-full", doctor.actif ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                                        {doctor.actif ? 'Actif' : 'Inactif'}
                                    </button>
                                    <button
                                        onClick={() => handleToggleAvailability(doctor)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-all border",
                                            doctor.disponible
                                                ? "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                                                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                                        )}
                                        disabled={toggleAvailabilityMutation.isPending}
                                    >
                                        {doctor.disponible ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                                Disponible
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3 text-slate-400" />
                                                Absent
                                            </>
                                        )}
                                    </button>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 gap-2">
                                <Button variant="outline" size="sm" className="flex-1 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200" onClick={() => doctor.id && handleViewDetails(doctor.id)}>
                                    <LayoutPanelLeft className="w-4 h-4 mr-2" />
                                    Détails
                                </Button>
                                <Button variant="outline" size="sm" className="hover:bg-slate-50 hover:text-slate-600 h-9 w-9 p-0" onClick={() => handleEditClick(doctor)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600 h-9 w-9 p-0" onClick={() => doctor.id && handleDeleteClick(doctor.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Modifier le Médecin' : 'Ajouter un Nouveau Médecin'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Nom</label>
                            <Input
                                required
                                value={currentDoctor.nom_medecin || ''}
                                onChange={(e) => setCurrentDoctor({ ...currentDoctor, nom_medecin: e.target.value })}
                                placeholder="Dr. ..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Spécialité</label>
                            <Input
                                required
                                value={currentDoctor.specialite || ''}
                                onChange={(e) => setCurrentDoctor({ ...currentDoctor, specialite: e.target.value })}
                                placeholder="ex: Cardiologie"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <Input
                                type="email"
                                required
                                value={currentDoctor.email_medecin || ''}
                                onChange={(e) => setCurrentDoctor({ ...currentDoctor, email_medecin: e.target.value })}
                                placeholder="docteur@exemple.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                            <Input
                                required
                                value={currentDoctor.contact_medecin || ''}
                                onChange={(e) => setCurrentDoctor({ ...currentDoctor, contact_medecin: e.target.value })}
                                placeholder="+221 ..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Genre</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                value={currentDoctor.genre_medecin || 'Masculin'}
                                onChange={(e) => setCurrentDoctor({ ...currentDoctor, genre_medecin: e.target.value as any })}
                            >
                                <option value="Masculin">Masculin</option>
                                <option value="Féminin">Féminin</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        {!isEditing && (
                            <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg">
                                <p className="text-xs text-teal-700 flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Un compte utilisateur sera automatiquement créé.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? "Traitement..." : (isEditing ? 'Enregistrer' : 'Créer le Médecin')}
                        </Button>
                    </div>
                </form>
            </Modal>

            <DoctorDetail
                doctor={selectedDoctor}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </div>
    );
};

export default Doctors;
