import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // On vérifie la présence du jeton dans sessionStorage au chargement
                const token = sessionStorage.getItem('auth_token');
                if (token) {
                    // Vérification réelle de la validité du token avec le backend
                    const currentUser = await authService.user();
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Session invalide ou expirée", error);
                // Si l'appel API échoue (401), on nettoie tout
                // Nettoyage de sessionStorage si la session est invalide
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('user_info');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (name: string, email: string, password: string) => {
        const registeredUser = await authService.register(name, email, password);
        setUser(registeredUser);
    };

    const login = async (email: string, password: string) => {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        window.location.href = '/login';
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
