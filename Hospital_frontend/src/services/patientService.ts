import api from './api';

export interface Patient {
    id?: number;
    numero_unique: string;
    nom_patient: string;
    date_naissance: string;
    sexe: string;
    contact_patient: string;
    email_patient?: string;
    adresse: string;
    antecedents_medicaux?: string;
    profession?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PatientResponse {
    data: Patient[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export const patientService = {
    async getPatients(page: number = 1, search: string = '', sortBy: string = 'nom_patient', direction: string = 'asc'): Promise<PatientResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());

        // Ajout du terme de recherche si présent
        if (search) {
            params.append('search', search);
        }

        // Paramètres de tri (A-Z ou Z-A par défaut sur le nom)
        params.append('sort_by', sortBy);
        params.append('direction', direction);

        const response = await api.get<PatientResponse>(`/patients?${params.toString()}`);
        return response.data;
    },

    async getPatient(id: number): Promise<Patient> {
        const response = await api.get<{ data: Patient }>(`/patients/${id}`);
        return response.data.data;
    },

    async createPatient(patient: Patient): Promise<Patient> {
        const response = await api.post<{ data: Patient }>('/patients', patient);
        return response.data.data;
    },

    async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient> {
        const response = await api.put<{ data: Patient }>(`/patients/${id}`, patient);
        return response.data.data;
    },

    async deletePatient(id: number): Promise<void> {
        await api.delete(`/patients/${id}`);
    }
};
