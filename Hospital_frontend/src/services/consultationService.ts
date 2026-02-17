import api from './api';
import { Doctor } from './doctorService';
import { Patient } from './patientService';

export interface MedicalVisit {
    id?: number;
    patient_id: number;
    medecin_id: number;
    rendez_vous_id?: number | null;
    date_visite: string;
    examen: string;
    symptomes: string;
    diagnostic: string;
    maladie?: string;
    traitement: string;
    allergie?: string;
    maladie_chronique?: string;
    poids?: number;
    taille?: number;
    imc?: number;
    observations?: string;
    created_at?: string;
    updated_at?: string;
    patient?: Patient;
    medecin?: Doctor;
}

export interface MedicalVisitResponse {
    data: MedicalVisit[];
    links?: any;
    meta?: any;
}

export interface MedicalVisitFilters {
    patient_id?: number;
    medecin_id?: number;
    page?: number;
}

export const consultationService = {
    async getVisits(filters: MedicalVisitFilters = {}): Promise<MedicalVisitResponse> {
        const params = new URLSearchParams();
        if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
        if (filters.medecin_id) params.append('medecin_id', filters.medecin_id.toString());
        if (filters.page) params.append('page', filters.page.toString());

        const response = await api.get<MedicalVisitResponse>(`/visites-medicales?${params.toString()}`);
        return response.data;
    },

    async getVisit(id: number): Promise<MedicalVisit> {
        const response = await api.get<{ data: MedicalVisit }>(`/visites-medicales/${id}`);
        return response.data.data;
    },

    async createVisit(visit: MedicalVisit): Promise<MedicalVisit> {
        const response = await api.post<{ data: MedicalVisit }>('/visites-medicales', visit);
        return response.data.data;
    },

    async updateVisit(id: number, visit: Partial<MedicalVisit>): Promise<MedicalVisit> {
        const response = await api.put<{ data: MedicalVisit }>(`/visites-medicales/${id}`, visit);
        return response.data.data;
    },

    // Note: Delete is not typically allowed for medical records, but adding if needed
    // async deleteVisit(id: number): Promise<void> {
    //     await api.delete(`/visites-medicales/${id}`);
    // }
};
