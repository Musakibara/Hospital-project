import api from './api';
import { Doctor } from './doctorService';
import { Patient } from './patientService';

export interface Appointment {
    id?: number;
    patient_id: number;
    medecin_id: number;
    medecin_remplacant_id?: number;
    date_heure: string;
    motif: string;
    statut: 'prevu' | 'confirme' | 'en_cours' | 'effectue' | 'annule' | 'reporte';
    observation?: string;
    created_at?: string;
    updated_at?: string;
    patient?: Patient;
    medecin?: Doctor;
    medecin_remplacant?: Doctor;
    visite_medicale?: any;
    visiteMedicale?: any;
    visite_id?: number | null;
    has_visite?: boolean;
}

export interface AppointmentResponse {
    data: Appointment[];
    links?: any;
    meta?: any;
}

export interface AppointmentFilters {
    date?: string;
    medecin_id?: number;
    patient_id?: number;
    statut?: string;
    page?: number;
    per_page?: number;
    order?: 'asc' | 'desc';
}

export const appointmentService = {
    async getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentResponse> {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.medecin_id) params.append('medecin_id', filters.medecin_id.toString());
        if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
        if (filters.statut) params.append('statut', filters.statut);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());
        if (filters.order) params.append('order', filters.order);

        const response = await api.get<AppointmentResponse>(`/rendez-vous?${params.toString()}`);
        return response.data;
    },

    async getAppointment(id: number): Promise<Appointment> {
        const response = await api.get<{ data: Appointment }>(`/rendez-vous/${id}`);
        return response.data.data;
    },

    async createAppointment(appointment: Appointment): Promise<Appointment> {
        const response = await api.post<{ data: Appointment }>('/rendez-vous', appointment);
        return response.data.data;
    },

    async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
        const response = await api.put<{ data: Appointment }>(`/rendez-vous/${id}`, appointment);
        return response.data.data;
    },

    async deleteAppointment(id: number): Promise<void> {
        await api.delete(`/rendez-vous/${id}`);
    }
};
