import { Doctor } from '@/services/doctorService';
import { Modal } from '@/components/ui/modal';
import { Calendar, Clock, FileText, Phone, Mail } from 'lucide-react';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


interface DoctorDetailProps {
    doctor: Doctor | null;
    isOpen: boolean;
    onClose: () => void;
}

const DoctorDetail = ({ doctor, isOpen, onClose }: DoctorDetailProps) => {
    if (!doctor) return null;

    const appointments = doctor.rendezVous || [];
    const visits = doctor.visitesMedicales || [];


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Dr. ${doctor.nom_medecin} - Profile Details`}
            maxWidth="4xl"
        >
            <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Header Profile Info */}
                <div className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100/50">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-3xl md:text-5xl font-bold shadow-xl shadow-teal-200 shrink-0">
                        {doctor.nom_medecin.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">Dr. {doctor.nom_medecin}</h2>
                            <div className="flex gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                    doctor.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {doctor.actif ? 'Active' : 'Inactive'}
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                    doctor.disponible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                                )}>
                                    {doctor.disponible ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>

                        <p className="text-teal-600 font-bold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {doctor.specialite}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{doctor.contact_medecin}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{doctor.email_medecin}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase mt-1">Total Appointments</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-bold text-teal-600">{visits.length}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase mt-1">Medical Visits</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-bold text-blue-600">
                            {appointments.filter(a => a.statut === 'En attente').length}
                        </p>
                        <p className="text-xs text-slate-500 font-medium uppercase mt-1">Pending Appts</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                        <p className="text-3xl font-bold text-purple-600">
                            {appointments.filter(a => a.statut === 'Terminé').length}
                        </p>
                        <p className="text-xs text-slate-500 font-medium uppercase mt-1">Completed Appts</p>
                    </div>
                </div>

                {/* Tabs / Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Appointments Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                Upcoming Appointments
                            </h3>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                                {appointments.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {appointments.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400">No appointments scheduled</p>
                                </div>
                            ) : (
                                appointments.slice(0, 5).map((appt: any) => (
                                    <div key={appt.id} className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {appt.patient?.nom_patient?.charAt(0) || 'P'}
                                                </div>
                                                <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                                                    {appt.patient?.nom_patient || 'Unknown Patient'}
                                                </span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                appt.statut === 'effectue' ? "bg-green-100 text-green-700" :
                                                    appt.statut === 'annule' ? "bg-red-100 text-red-700" :
                                                        "bg-blue-100 text-blue-700"
                                            )}>
                                                {appt.statut}
                                            </span>

                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(appt.date_heure), 'MMM dd, yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(appt.date_heure), 'HH:mm')}
                                            </span>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Medical Visits Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-teal-500" />
                                Recent Consultations
                            </h3>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                                {visits.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {visits.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400">No medical visits recorded</p>
                                </div>
                            ) : (
                                visits.slice(0, 5).map((visit: any) => (
                                    <div key={visit.id} className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-800 text-sm">
                                                {visit.patient?.nom_patient || 'Private Patient'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                #{visit.id}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 mb-2 italic">
                                            "{visit.diagnostic || 'Routine checkup'}"
                                        </p>

                                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-50">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(visit.date_visite), 'MMM dd, yyyy')}
                                            </span>
                                            <span className="text-[9px] px-2 py-0.5 border border-slate-100 rounded-md hover:bg-slate-50">Details</span>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                <Button onClick={onClose} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8">
                    Close Details
                </Button>
            </div>
        </Modal>
    );
};

export default DoctorDetail;
