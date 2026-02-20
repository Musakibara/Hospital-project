import React, { useState, useEffect } from 'react';
import { consultationService, MedicalVisit } from '@/services/consultationService';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stethoscope, CheckCircle, Clock, History, User, FileText, Search, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Consultations = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const [loadingQueue, setLoadingQueue] = useState(false);

    // History state
    const [historyVisits, setHistoryVisits] = useState<MedicalVisit[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState('');

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [formData, setFormData] = useState<Partial<MedicalVisit>>({
        examen: '',
        diagnostic: '',
        traitement: '',
        symptomes: '',
        maladie: '',
        observations: ''
    });

    useEffect(() => {
        if (activeTab === 'new') {
            fetchQueue();
        } else {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchQueue = async () => {
        setLoadingQueue(true);
        try {
            // Fetch confirmed appointments for today
            const today = new Date().toISOString().split('T')[0];
            const response = await appointmentService.getAppointments({ statut: 'confirme', date: today });
            // Also fetch 'prevu' just in case they arrived but weren't marked confirmed
            const responsePrevu = await appointmentService.getAppointments({ statut: 'prevu', date: today });

            // Combine and unique by ID
            const combined = [...response.data, ...responsePrevu.data].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            setPendingAppointments(combined);
        } catch (error) {
            console.error("Failed to fetch queue", error);
        } finally {
            setLoadingQueue(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await consultationService.getVisits(); // Add search param if API supports it
            setHistoryVisits(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSelect = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setFormData({
            examen: '',
            diagnostic: '',
            traitement: '',
            symptomes: '',
            maladie: '',
            observations: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        try {
            const visitData: any = {
                patient_id: selectedAppointment.patient?.id,
                medecin_id: selectedAppointment.medecin?.id,
                rendez_vous_id: selectedAppointment.id,
                date_visite: new Date().toISOString().split('T')[0], // Today
                ...formData
            };

            await consultationService.createVisit(visitData);
            toast.success('Consultation saved successfully!');

            // Update the appointment status to 'effectue' locally or refetch
            setPendingAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
            setSelectedAppointment(null);

            // Optionally, we could call appointmentService.updateStatus here, but backend might do it automatically
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
        }
    };

    const filteredHistory = historyVisits.filter(visit =>
        visit.patient?.nom_patient.toLowerCase().includes(historySearch.toLowerCase()) ||
        visit.diagnostic.toLowerCase().includes(historySearch.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 min-h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Consultations</h1>
                    <p className="text-slate-500 mt-1">Conduct visits and review medical history.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'new' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        New Consultation
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Visit History
                    </button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-14rem)]">
                    {/* Left: Pending List */}
                    <div className="lg:col-span-1 space-y-4 overflow-auto pr-0 lg:pr-2 max-h-[40vh] lg:max-h-none">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-teal-500" />
                            Waiting Room (Today)
                        </h2>
                        {loadingQueue ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : pendingAppointments.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No pending appointments for today.</p>
                            </div>
                        ) : (
                            pendingAppointments.map(apt => (
                                <div
                                    key={apt.id}
                                    onClick={() => handleSelect(apt)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedAppointment?.id === apt.id
                                        ? 'bg-teal-50 border-teal-500 shadow-sm ring-1 ring-teal-500'
                                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {apt.patient?.nom_patient || `Patient #${apt.patient_id}`}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apt.statut === 'confirme' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
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

                    {/* Right: Consultation Form */}
                    <div className="lg:col-span-2 min-h-[50vh] lg:h-full">
                        {selectedAppointment ? (
                            <Card className="h-full flex flex-col border-teal-100 shadow-xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100 py-4">
                                    <CardTitle className="flex items-center gap-2 text-teal-800 text-lg">
                                        <Stethoscope className="w-5 h-5" />
                                        Medical Consultation
                                    </CardTitle>
                                    <CardDescription>
                                        Recording visit details for <span className="font-semibold text-slate-700">{selectedAppointment.patient?.nom_patient}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-6 bg-white">
                                    <form id="consultation-form" onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-orange-400" /> Symptoms
                                                </label>
                                                <textarea
                                                    className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="Patient reported symptoms..."
                                                    value={formData.symptomes || ''}
                                                    onChange={e => setFormData({ ...formData, symptomes: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-blue-400" /> Examination
                                                </label>
                                                <textarea
                                                    className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="Physical exam findings..."
                                                    value={formData.examen || ''}
                                                    onChange={e => setFormData({ ...formData, examen: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Diagnosis</label>
                                                <Input
                                                    className="bg-slate-50 focus:bg-white"
                                                    placeholder="Confirmed diagnosis..."
                                                    value={formData.diagnostic || ''}
                                                    onChange={e => setFormData({ ...formData, diagnostic: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Maladie / Pathologie</label>
                                                <Input
                                                    className="bg-slate-50 focus:bg-white"
                                                    placeholder="Nom de la maladie ou condition..."
                                                    value={formData.maladie || ''}
                                                    onChange={e => setFormData({ ...formData, maladie: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Treatment Plan / Prescription</label>
                                            <textarea
                                                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                placeholder="Medications, therapy, follow-up instructions..."
                                                value={formData.traitement || ''}
                                                onChange={e => setFormData({ ...formData, traitement: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Observations (Optional)</label>
                                            <Input
                                                className="bg-slate-50 focus:bg-white"
                                                placeholder="Additional notes..."
                                                value={formData.observations || ''}
                                                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                            />
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
                                    <Button type="submit" form="consultation-form" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Complete Consultation
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Stethoscope className="w-8 h-8 text-teal-200" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-600 mb-1">Ready for Consultation</h3>
                                    <p>Select a patient from the waiting room to start recording details.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-sm w-full">
                        <Search className="w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search history..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            className="border-none shadow-none focus-visible:ring-0 h-auto p-0 text-base"
                        />
                    </div>

                    {loadingHistory ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No visit history found</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredHistory.map(visit => (
                                <Card key={visit.id} className="hover:shadow-md transition-shadow group border-slate-200">
                                    <CardHeader className="bg-slate-50/50 pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900">
                                                    {visit.patient?.nom_patient || `Patient #${visit.patient_id}`}
                                                </CardTitle>
                                                <CardDescription>
                                                    {new Date(visit.date_visite).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3 text-sm">
                                        <div>
                                            <span className="font-semibold text-slate-700 block text-xs uppercase tracking-wide mb-1">Diagnosis</span>
                                            <p className="text-slate-600 font-medium">{visit.diagnostic}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-slate-700 block text-xs uppercase tracking-wide mb-1">Treatment</span>
                                            <p className="text-slate-500 line-clamp-2">{visit.traitement}</p>
                                        </div>
                                        <div className="pt-2 flex items-center text-xs text-slate-400 gap-2">
                                            <User className="w-3 h-3" />
                                            Dr. {visit.medecin?.nom_medecin}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Consultations;
