import type { User, Session } from '../types/auth';

const STORAGE_USERS_KEY = {
    USERS: 'caracol.users',
    SESSION: 'caracol.session'
} as const; 

// Obtengo todos los usuarios del localStorage
export function getUsers(): User[]{
    const users = localStorage.getItem(STORAGE_USERS_KEY.USERS);
    
    if (!users) return [];

    try {
        return JSON.parse(users) as User[];
    } catch (error) {
        return [];
    }
}

// Obtengo la sesión del localStorage
export function getSession(): Session | null{
    const session = localStorage.getItem(STORAGE_USERS_KEY.SESSION);

    if (!session) return null;

    try {
        return JSON.parse(session) as Session;
    } catch (error) {
        return null;
    }
}

// Almaceno todos los usuarios en el localStrorage
export function saveUsers(users: User[]): void{
    localStorage.setItem(STORAGE_USERS_KEY.USERS, JSON.stringify(users));
}

// Almaceno la sesión en el localStorage
export function saveSession(session: Session): void{
    localStorage.setItem(STORAGE_USERS_KEY.SESSION, JSON.stringify(session));
}

// Elimino la sesión del localStorage
export function removeSession(): void{
    localStorage.removeItem(STORAGE_USERS_KEY.SESSION);
}