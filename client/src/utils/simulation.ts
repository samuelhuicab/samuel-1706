import type { BetStats, SnailResult } from "../types/dashboard";

export const SNAIL_NAMES = ['Turbo', 'Max', 'Donut', 'Snail', 'Botas', 'Snow'];
export const RACES_PER_DAY = 6;


export function generateRaceWinners(snailNames: string[]): string[] {
  const winners: string[] = [];

  for (let race = 0; race < RACES_PER_DAY; race++) {

    let indice = Math.floor(Math.random() * snailNames.length)  
    winners.push(snailNames[indice]);

  }

  return winners;
}

export function countWins(snailNames: string[], winners: string[]): SnailResult[] {
  return snailNames.map(name => ({
    name,
    wins: winners.filter(winner => winner === name).length,
  }));
}

export function generateBetStats(snailNames: string[], winners: string[]): BetStats {
  let won = 0;
  let lost = 0;

  for (const winner of winners) {
    let userBet = Math.floor(Math.random() * snailNames.length)   
    
    if (snailNames[userBet] === winner){
        won++
    } else{
        lost++
    }
  }

  return { won, lost };
}