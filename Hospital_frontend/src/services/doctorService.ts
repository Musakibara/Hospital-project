import api from './api';

export interface Doctor {
    id?: number;
    user_id: number;
    nom_medecin: string;
    specialite: string;
    contact_medecin: string;
    email_medecin: string;
    genre_medecin: 'Masculin' | 'Féminin' | 'Autre';
    actif?: boolean;
    can_edit_profile?: boolean;
    disponible?: boolean;
    created_at?: string;
    updated_at?: string;
    user?: any; // To hold related user data if needed
    rendezVous?: any[];
    visitesMedicales?: any[];
}



export interface DoctorResponse {
    data: Doctor[];
    links?: any;
    meta?: any;
}

export const doctorService = {
    async getDoctors(filters: any = {}): Promise<Doctor[]> {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.disponible !== undefined) params.append('disponible', filters.disponible.toString());

        const response = await api.get<DoctorResponse>(`/medecins?${params.toString()}`);
        return response.data.data;
    },


    async getDoctor(id: number): Promise<Doctor> {
        const response = await api.get<{ data: Doctor }>(`/medecins/${id}`);
        return response.data.data;
    },

    async createDoctor(doctor: Doctor): Promise<Doctor> {
        const response = await api.post<{ data: Doctor }>('/medecins', doctor);
        return response.data.data;
    },

    async updateDoctor(id: number, doctor: Partial<Doctor>): Promise<Doctor> {
        const response = await api.put<{ data: Doctor }>(`/medecins/${id}`, doctor);
        return response.data.data;
    },

    async deleteDoctor(id: number): Promise<void> {
        await api.delete(`/medecins/${id}`);
    }
};
