import api from './api';

export interface Notification {
    id: number;
    user_id: number;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
    };
}

export interface NotificationResponse {
    status: string;
    data: Notification[];
}

export const notificationService = {
    async getNotifications(): Promise<NotificationResponse> {
        const response = await api.get<NotificationResponse>('/notifications');
        return response.data;
    },

    async markAsRead(id: number): Promise<void> {
        await api.post(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.post('/notifications/read-all');
    }
};
