import React, { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { doctorService, Doctor } from '@/services/doctorService';
import { patientService, Patient } from '@/services/patientService';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, User, FileText, Plus, X, RefreshCw, Edit, CheckCircle2, XCircle, LayoutPanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Modal } from '@/components/ui/modal';

const Appointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [originalAppointment, setOriginalAppointment] = useState<Partial<Appointment>>({});


    // Filters
    const [filterDate, setFilterDate] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Form state
    const [currentAppointment, setCurrentAppointment] = useState<Partial<Appointment>>({
        statut: 'prevu'
    });

    const statutLabels: Record<string, string> = {
        prevu: 'Scheduled',
        confirme: 'Confirmed',
        en_cours: 'In Progress',
        effectue: 'Completed',
        annule: 'Cancelled',
        reporte: 'Rescheduled'
    };

    useEffect(() => {
        fetchDoctors();
        fetchPatients();
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [filterDate, filterDoctor, filterStatus]);

    const fetchPatients = async () => {
        try {
            const response = await patientService.getPatients(1, patientSearch);
            setPatients(response.data);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isModalOpen) fetchPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);


    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getDoctors();
            setDoctors(data);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (filterDate) filters.date = filterDate;
            if (filterDoctor) filters.medecin_id = parseInt(filterDoctor);
            if (filterStatus) filters.statut = filterStatus;

            const response = await appointmentService.getAppointments(filters);
            setAppointments(response.data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentAppointment.id) {
                // Compute diff
                const updateData: any = {};
                const fields: (keyof Appointment)[] = ['patient_id', 'medecin_id', 'date_heure', 'motif', 'statut', 'observation'];

                fields.forEach(field => {
                    if (currentAppointment[field] !== originalAppointment[field]) {
                        updateData[field] = currentAppointment[field];
                    }
                });

                if (Object.keys(updateData).length > 0) {
                    await appointmentService.updateAppointment(currentAppointment.id, updateData);
                    toast.success("Rendez-vous mis à jour");
                }
            } else {
                await appointmentService.createAppointment(currentAppointment as Appointment);
                toast.success("Rendez-vous enregistré et email envoyé au patient");
            }
            setIsModalOpen(false);
            fetchAppointments();
            setCurrentAppointment({ statut: 'prevu' });
            setOriginalAppointment({});
            setIsEditing(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleEditClick = (apt: Appointment) => {
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
    };


    const handleStatusChange = async (id: number, newStatus: any) => {
        try {
            await appointmentService.updateAppointment(id, { statut: newStatus });
            fetchAppointments();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterDoctor('');
        setFilterStatus('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-slate-500 mt-1">Plan and track medical visits and procedures.</p>
                </div>
                <Button onClick={() => { setIsEditing(false); setCurrentAppointment({ statut: 'prevu' }); setIsModalOpen(true); }} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Filters */}
            {/* Premium Filter Toolbar */}
            <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Date Filter */}
                        <div className="relative group">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="pl-9 h-10 w-full sm:w-44 bg-white/70 border-slate-200 rounded-xl focus:ring-teal-500/20"
                            />
                        </div>

                        {/* Doctor Filter */}
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <select
                                className="pl-9 pr-8 h-10 w-full sm:w-48 appearance-none rounded-xl border border-slate-200 bg-white/70 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                value={filterDoctor}
                                onChange={(e) => setFilterDoctor(e.target.value)}
                            >
                                <option value="">All doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.nom_medecin}</option>
                                ))}
                            </select>
                            <LayoutPanelLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>

                        {(filterDate || filterDoctor || filterStatus) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                                <X className="w-4 h-4 mr-2" /> Clear
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto no-scrollbar">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchAppointments}
                            className="mr-2 text-slate-400 hover:text-teal-600"
                        >
                            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        </Button>

                        <div className="flex bg-slate-100/60 p-1 rounded-xl border border-slate-200/60">
                            {[
                                { label: 'All', value: '', icon: LayoutPanelLeft },
                                { label: 'Scheduled', value: 'prevu', icon: CalendarIcon, color: 'text-blue-500' },
                                { label: 'Confirmed', value: 'confirme', icon: CheckCircle2, color: 'text-teal-600' },
                                { label: 'In Progress', value: 'en_cours', icon: RefreshCw, color: 'text-amber-500' },
                                { label: 'Completed', value: 'effectue', icon: CheckCircle2, color: 'text-indigo-600' },
                                { label: 'Cancelled', value: 'annule', icon: XCircle, color: 'text-rose-500' }
                            ].map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => setFilterStatus(s.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                                        filterStatus === s.value
                                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
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


            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">Aucun rendez-vous trouvé</h3>
                    <p className="text-slate-500">Planifiez un nouveau rendez-vous pour commencer.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-3 rounded-xl ${apt.statut === 'prevu' ? 'bg-blue-100 text-blue-600' :
                                    apt.statut === 'confirme' ? 'bg-teal-100 text-teal-600' :
                                        apt.statut === 'en_cours' ? 'bg-amber-100 text-amber-600' :
                                            apt.statut === 'effectue' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-rose-100 text-rose-600'
                                    }`}>
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">Dr. {apt.medecin?.nom_medecin || 'Inconnu'}</h4>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-sm font-medium text-slate-600">{apt.medecin?.specialite}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-700">{apt.patient?.nom_patient || `Patient #${apt.patient_id}`}</span>
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
                                    <Button size="sm" variant="outline" className="hover:bg-slate-50" onClick={() => handleEditClick(apt)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}

                                {(apt.statut === 'prevu' || apt.statut === 'confirme') && (
                                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => apt.id && handleStatusChange(apt.id, 'annule')}>
                                        Annuler
                                    </Button>
                                )}

                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${apt.statut === 'prevu' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    apt.statut === 'confirme' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                        apt.statut === 'en_cours' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            apt.statut === 'effectue' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
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
                        <label className="text-sm font-medium text-slate-700">Patient Selection</label>
                        <div className="relative group/search">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-teal-500 group-focus-within/search:scale-110 transition-transform" />
                            </div>
                            <Input
                                placeholder={isEditing ? "Patient (Non-modifiable)" : "Start typing patient name to search..."}
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                disabled={isEditing}
                                className={cn(
                                    "pl-11 h-12 bg-slate-50 border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all font-medium",
                                    isEditing && "opacity-60 cursor-not-allowed bg-slate-100"
                                )}
                            />
                        </div>
                        <div className="relative group/select">
                            <select
                                className={cn(
                                    "flex h-12 w-full appearance-none rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all cursor-pointer",
                                    isEditing && "opacity-60 cursor-not-allowed bg-slate-100"
                                )}
                                required
                                disabled={isEditing}
                                value={currentAppointment.patient_id || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCurrentAppointment({ ...currentAppointment, patient_id: val ? parseInt(val) : undefined });
                                }}
                            >
                                <option value="">Results ({patients.length} patients found)</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.nom_patient} — ID: {p.numero_unique}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Medical Staff</label>
                        <select
                            className="flex h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all"
                            required
                            value={currentAppointment.medecin_id || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAppointment({ ...currentAppointment, medecin_id: val ? parseInt(val) : undefined });
                            }}
                        >
                            <option value="">Select a doctor...</option>
                            {doctors
                                .filter(doc => {
                                    const isAvailable = doc.disponible || doc.id === currentAppointment.medecin_id;
                                    if (isEditing) {
                                        const currentDoctor = doctors.find(d => d.id === currentAppointment.medecin_id);
                                        return isAvailable && doc.specialite === currentDoctor?.specialite;
                                    }
                                    return isAvailable;
                                })
                                .map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.nom_medecin} — {doc.specialite}</option>
                                ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Date & Time</label>
                            <Input
                                type="datetime-local"
                                required
                                min={new Date().toISOString().slice(0, 16)}
                                value={currentAppointment.date_heure ? currentAppointment.date_heure.replace(' ', 'T').slice(0, 16) : ''}
                                onChange={(e) => setCurrentAppointment({ ...currentAppointment, date_heure: e.target.value.replace('T', ' ') })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <select
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all cursor-pointer"
                                value={currentAppointment.statut || 'prevu'}
                                onChange={(e) => setCurrentAppointment({ ...currentAppointment, statut: e.target.value as any })}
                            >
                                <option value="prevu">Scheduled</option>
                                <option value="confirme">Confirmed</option>
                                <option value="en_cours">In Progress</option>
                                <option value="effectue">Completed</option>
                                <option value="annule">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Reason / Motif</label>
                        <Input
                            required
                            placeholder="Reason for appointment"
                            value={currentAppointment.motif || ''}
                            onChange={(e) => setCurrentAppointment({ ...currentAppointment, motif: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl shadow-lg shadow-teal-500/20 transition-all font-bold">
                            {isEditing ? "Save Changes" : "Confirm Appointment"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Appointments;
