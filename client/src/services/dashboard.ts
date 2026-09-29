import { getRaceDay, getAllBetStats, saveAllBetStats, saveRaceDay } from './storage';
import { generateBetStats, generateRaceWinners, SNAIL_NAMES } from '../utils/simulation';
import type { RaceDay, BetStats } from '../types/dashboard';

export function getOrCreateRaceDay(): RaceDay {
    const savedRaceDay = getRaceDay();
    if (savedRaceDay) return savedRaceDay;

    const newRaceDay: RaceDay = {
        date: new Date().toISOString(),
        winners: generateRaceWinners(SNAIL_NAMES),
    };
    saveRaceDay(newRaceDay);

    return newRaceDay;
}


export function getOrCreateBetStats(userId: string, winners: string[]): BetStats {
    const allBets = getAllBetStats();

    const savedStats = allBets[userId];
    if (savedStats) return savedStats;

    const newStats = generateBetStats(SNAIL_NAMES, winners);
    saveAllBetStats({ ...allBets, [userId]: newStats });

    return newStats;
}