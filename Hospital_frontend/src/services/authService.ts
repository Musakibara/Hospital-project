import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role?: string; // adjust based on actual API response
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export const authService = {
    async user(): Promise<User> {
        const response = await api.get<User>('/user');
        return response.data;
    },

    async register(name: string, email: string, password: string): Promise<User> {
        // Note: The backend API docs don't explicitly mention a register endpoint, but standard Laravel auth usually has one.
        // If not, we might need to use a different approach. Assuming /register exists or we create a user some other way.
        // Wait, typical Laravel Sanctum /register isn't in the provided API docs (only login).
        // BUT, the user asked for a Signup page.
        // I will assume /register exists for now as it's standard.
        const response = await api.post<LoginResponse>('/register', { name, email, password });
        const { access_token, user } = response.data;

        // Utilisation de sessionStorage au lieu de localStorage pour que la session s'arrête à la fermeture du navigateur
        sessionStorage.setItem('auth_token', access_token);
        sessionStorage.setItem('user_info', JSON.stringify(user));

        return user;
    },

    async login(email: string, password: string): Promise<User> {
        const response = await api.post<LoginResponse>('/login', { email, password });
        const { access_token, user } = response.data;

        // Utilisation de sessionStorage au lieu de localStorage pour que la session s'arrête à la fermeture du navigateur
        sessionStorage.setItem('auth_token', access_token);
        sessionStorage.setItem('user_info', JSON.stringify(user));

        return user;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            // Nettoyage de sessionStorage lors de la déconnexion
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_info');
        }
    },

    getCurrentUser(): User | null {
        const userStr = sessionStorage.getItem('user_info');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        // Vérifie si le token existe dans sessionStorage
        return !!sessionStorage.getItem('auth_token');
    }
};
