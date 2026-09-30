import type { User, Session } from '../types/auth';
import type { BetStats, RaceDay } from '../types/dashboard';

const STORAGE_KEYS = {
    USERS: 'caracol.users',
    SESSION: 'caracol.session',
    RACE_DAY: 'caracol.race',
    BETS: 'caracol.bets'
} as const;


// Obtengo todos los usuarios del localStorage
export function getUsers(): User[]{
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    
    if (!users) return [];

    try {
        return JSON.parse(users) as User[];
    } catch (error) {
        return [];
    }
}

// Obtengo la sesión del localStorage
export function getSession(): Session | null{
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);

    if (!session) return null;

    try {
        return JSON.parse(session) as Session;
    } catch (error) {
        return null;
    }
}

// Almaceno todos los usuarios en el localStrorage
export function saveUsers(users: User[]): void{
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Almaceno la sesión en el localStorage
export function saveSession(session: Session): void{
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

// Elimino la sesión del localStorage
export function removeSession(): void{
    localStorage.removeItem(STORAGE_KEYS.SESSION);
}



// ALMACENAMIENTO DE STATS Y BETS


export function getRaceDay(): RaceDay | null{
    const raceDay = localStorage.getItem(STORAGE_KEYS.RACE_DAY);
    
    if (!raceDay) return null;

    try {
        return JSON.parse(raceDay) as RaceDay;
    } catch (error) {
        return null;
    }
}

export function saveRaceDay(raceDay: RaceDay): void{
    localStorage.setItem(STORAGE_KEYS.RACE_DAY, JSON.stringify(raceDay));
}

export function getAllBetStats(): Record<string, BetStats> {
    const bets = localStorage.getItem(STORAGE_KEYS.BETS);
    
    if (!bets) return {};

    try {
        return JSON.parse(bets) as Record<string, BetStats>;
    } catch (error) {
        return {};
    }
}

export function saveAllBetStats(bets: Record<string, BetStats>): void {
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));
} 