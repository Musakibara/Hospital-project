import axios from 'axios';

// Create Axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Update validation: Ensure this matches backend URL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
    // Récupération du jeton depuis sessionStorage (session temporaire)
    const token = sessionStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login if unauthorized
            // Nettoyage des données de session en cas d'erreur d'autorisation (401)
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_info');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
