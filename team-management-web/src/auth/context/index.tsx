import { useNavigate } from '@tanstack/react-router';
// src/auth.ts
import { type FC, createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Helper function for API calls
    const api = async (endpoint: string, options?: RequestInit) => {
        const response = await fetch(`/api${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 401 && endpoint !== '/token/' && endpoint !== '/token/refresh/') {
                try {
                    const refreshResponse = await fetch('/api/token/refresh/', { method: 'POST' });
                    if (refreshResponse.ok) {
                        return api(endpoint, options);
                    } 
                    await logout();
                    throw new Error('Session expired. Please log in again.');
                } catch (refreshError) {
                    await logout();
                    throw refreshError;
                }
            }
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Something went wrong');
        }
        return response;
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api('/token/', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            const userData = await response.json();

            setUser({
                id: userData.user_id,
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
            });
            navigate({ to: '/' });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await api('/logout/', { method: 'POST' });
        setUser(null);
        navigate({ to: '/auth/login' });
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: We need to run this on mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const response = await api('/token/verify/', { method: 'POST' });
                if (response.ok) {
                    const userData = await response.json();
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        firstName: userData.first_name,
                        lastName: userData.last_name,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auto-refresh failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);


    const isAuthenticated = user !== null;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};