import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../services/auth';
import { processRecharge, type CardDetails } from '../services/recharge';
import type { ChargeResponse } from '../types/snailpay';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    register: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    recharge: (card: CardDetails) => Promise<ChargeResponse>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const register = async (name: string, email: string, password: string) => {
        const newUser = await registerUser(name, email, password);
        setUser(newUser);
    };

    const login = async (email: string, password: string) => {
        const loggedUser = await loginUser(email, password);
        setUser(loggedUser);
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const recharge = async (card: CardDetails): Promise<ChargeResponse> => {
        if (!user) {
            throw new Error('Necesitas iniciar sesión para recargar saldo.');
        }

        const { response, updatedUser } = await processRecharge(user, card);

        if (updatedUser) {
            setUser(updatedUser);
        }

        return response;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, register, login, logout, recharge }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}