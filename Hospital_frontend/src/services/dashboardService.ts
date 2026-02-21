import api from './api';

export interface DashboardStats {
    total_patients: number;
    total_doctors?: number;
    total_appointments: number;
    total_visites: number;
    today_appointments?: number;
    pending_appointments?: number;
}

export interface DashboardData {
    role: 'admin' | 'medecin';
    stats: DashboardStats;
    recent_data: {
        appointments: any[];
        visites: any[];
    };
}

export const dashboardService = {
    async getDashboardData(): Promise<DashboardData> {
        const response = await api.get<DashboardData>('/dashboard');
        return response.data;
    }
};
