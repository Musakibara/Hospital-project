import { useEffect, useState } from 'react';
import { patientService, Patient } from '@/services/patientService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Plus, Edit, Trash2, MapPin, Calendar, FileText, User } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


const Patients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients(currentPage, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentPage]);

    const fetchPatients = async (page: number, search: string) => {
        setLoading(true);
        try {
            const response = await patientService.getPatients(page, search);
            setPatients(response.data);
            setTotalPages(response.meta.last_page);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleAddClick = () => {
        setCurrentPatient({
            numero_unique: `PAT-${Math.floor(Math.random() * 10000)}`, // Auto-generate for now
            nom_patient: '',
            date_naissance: '',
            sexe: 'Masculin',
            contact_patient: '',
            email_patient: '',
            adresse: '',
            antecedents_medicaux: '',
            profession: ''
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditClick = (patient: Patient) => {
        setCurrentPatient(patient);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (confirm('Are you sure you want to delete this patient?')) {
            try {
                await patientService.deletePatient(id);
                fetchPatients(currentPage, searchTerm);
            } catch (error) {
                console.error("Failed to delete patient", error);
                alert("Failed to delete patient. Please try again.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentPatient.id) {
                await patientService.updatePatient(currentPatient.id, currentPatient);
            } else {
                await patientService.createPatient(currentPatient as Patient);
            }
            setIsModalOpen(false);
            fetchPatients(currentPage, searchTerm);
        } catch (error: any) {
            console.error("Failed to save patient", error);
            alert(`Failed to save: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
                    <p className="text-slate-500 mt-1">Manage patient records and medical history.</p>
                </div>
                <Button onClick={handleAddClick} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Register Patient
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group/search max-w-md w-full"
            >
                <div className="relative flex items-center bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md focus-within:shadow-lg focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/30">
                    <div className="pl-4 pr-2">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within/search:text-teal-600 transition-colors" />
                    </div>
                    <Input
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="border-none shadow-none focus-visible:ring-0 h-12 px-0 text-slate-700 placeholder:text-slate-400 font-medium bg-transparent"
                    />
                    <div className="pr-4">
                        <div className="w-2 h-2 rounded-full bg-teal-500/20 group-focus-within/search:bg-teal-500 group-focus-within/search:animate-pulse" />
                    </div>
                </div>
            </motion.div>

            {loading && patients.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-64 bg-slate-100 border-none rounded-xl" />
                    ))}
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No patients found</h3>
                    <p className="text-slate-500">Try adjusting your search or add a new patient.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-lg transition-all duration-300 group border-slate-200 hover:border-teal-200 rounded-xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 bg-slate-50/50">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                                    {patient.nom_patient.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg font-bold text-slate-900 truncate">
                                        {patient.nom_patient}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-slate-500 font-mono truncate">{patient.numero_unique}</p>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                                            patient.sexe === 'Masculin' ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                                        )}>
                                            {patient.sexe}
                                        </span>
                                    </div>

                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 mr-3 text-teal-500" />
                                    <span className="font-medium">{new Date(patient.date_naissance).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone className="w-4 h-4 mr-3 text-blue-500" />
                                    <span className="font-medium">{patient.contact_patient}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600 truncate">
                                    <MapPin className="w-4 h-4 mr-3 text-amber-500 flex-shrink-0" />
                                    <span className="truncate">{patient.adresse}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 gap-2">
                                <Button variant="outline" size="sm" className="flex-1 hover:bg-slate-50 hover:text-teal-600 hover:border-teal-200" onClick={() => handleEditClick(patient)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => patient.id && handleDeleteClick(patient.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Edit Patient' : 'Register New Patient'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <Input
                            required
                            value={currentPatient.nom_patient || ''}
                            onChange={(e) => setCurrentPatient({ ...currentPatient, nom_patient: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                            <Input
                                type="date"
                                required
                                value={currentPatient.date_naissance || ''}
                                onChange={(e) => setCurrentPatient({ ...currentPatient, date_naissance: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Gender</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                value={currentPatient.sexe || 'Masculin'}
                                onChange={(e) => setCurrentPatient({ ...currentPatient, sexe: e.target.value })}
                            >
                                <option value="Masculin">Masculin</option>
                                <option value="Féminin">Féminin</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Phone</label>
                            <Input
                                required
                                value={currentPatient.contact_patient || ''}
                                onChange={(e) => setCurrentPatient({ ...currentPatient, contact_patient: e.target.value })}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <Input
                                type="email"
                                value={currentPatient.email_patient || ''}
                                onChange={(e) => setCurrentPatient({ ...currentPatient, email_patient: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Address</label>
                        <Input
                            required
                            value={currentPatient.adresse || ''}
                            onChange={(e) => setCurrentPatient({ ...currentPatient, adresse: e.target.value })}
                            placeholder="123 Main St, City"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Medical History (Antecedents)</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                            value={currentPatient.antecedents_medicaux || ''}
                            onChange={(e) => setCurrentPatient({ ...currentPatient, antecedents_medicaux: e.target.value })}
                            placeholder="Allergies, chronic conditions, etc."
                        />
                    </div>

                    {!isEditing && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Unique ID (Auto-generated)</label>
                            <Input
                                disabled
                                value={currentPatient.numero_unique || ''}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                            {isEditing ? 'Save Changes' : 'Register Patient'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Patients;
