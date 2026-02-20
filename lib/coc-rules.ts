import { Investigator, AttributeName } from './types';

/**
 * Calculates Maximum Hit Points
 * HP = (CON + SIZ) / 10, rounded down
 */
export const calculateMaxHP = (con: number, siz: number): number => {
    return Math.floor((con + siz) / 10);
};

/**
 * Calculates Starting Sanity
 * SAN = POW
 */
export const calculateStartingSanity = (pow: number): number => {
    return pow;
};

/**
 * Calculates Magic Points
 * MP = POW / 5, rounded down
 */
export const calculateMagicPoints = (pow: number): number => {
    return Math.floor(pow / 5);
};

/**
 * Calculates Movement Rate based on age and attributes
 * @param age Investigator Age
 * @param str Strength
 * @param dex Dexterity
 * @param siz Size
 */
export const calculateMovementRate = (age: number, str: number, dex: number, siz: number): number => {
    let mov = 8; // Default

    if (dex < siz && str < siz) {
        mov = 7;
    } else if (str > siz && dex > siz) {
        mov = 9;
    }

    // Age modifiers
    if (age >= 40 && age < 50) return mov - 1;
    if (age >= 50 && age < 60) return mov - 2;
    if (age >= 60 && age < 70) return mov - 3;
    if (age >= 70 && age < 80) return mov - 4;
    if (age >= 80) return mov - 5;

    return mov;
};

/**
 * Calculates Build and Damage Bonus based on STR + SIZ
 * Returns an object with { build, damageBonus }
 */
export const calculateCombatStats = (str: number, siz: number): { build: number; damageBonus: string } => {
    const total = str + siz;

    if (total <= 64) return { build: -2, damageBonus: '-2' };
    if (total <= 84) return { build: -1, damageBonus: '-1' };
    if (total <= 124) return { build: 0, damageBonus: '0' }; // "None"
    if (total <= 164) return { build: 1, damageBonus: '+1D4' };
    if (total <= 204) return { build: 2, damageBonus: '+1D6' };
    if (total <= 284) return { build: 3, damageBonus: '+2D6' };
    if (total <= 364) return { build: 4, damageBonus: '+3D6' };
    if (total <= 444) return { build: 5, damageBonus: '+4D6' };

    // For totals greater than 444, add +1D6 DB and +1 Build for every 80 points (or fraction thereof)
    // But for MVP we will cap it or use a formula if needed. 
    // Official rule: "For each +80 points or fraction thereof, +1D6 DB and +1 Build"
    const extra = Math.ceil((total - 444) / 80);
    return { build: 5 + extra, damageBonus: `+${4 + extra}D6` };
};
