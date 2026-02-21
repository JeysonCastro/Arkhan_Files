export type AttributeName = 'STR' | 'CON' | 'SIZ' | 'DEX' | 'APP' | 'INT' | 'POW' | 'EDU' | 'LUCK';

export interface Attribute {
    base: number;
    current: number;
}

export interface Skill {
    name: string;
    baseChance: number;
    pointsAdded: number;
    checked?: boolean; // For improvement checks
    isOccupationSkill?: boolean;
}

export interface Weapon {
    id: string;
    name: string;
    skillName: string;
    damage: string;
    range: string;
    attacks: number;
    ammo: string;
    malfunction: number;
}

export interface Investigator {
    id: string;
    name: string;
    occupation: string;
    age: number;
    sex: string;
    residence: string;
    birthplace: string;
    portrait?: string; // URL or base64

    attributes: Record<AttributeName, Attribute>;

    derivedStats: {
        hp: { max: number; current: number };
        sanity: { max: number; current: number; start: number };
        magicPoints: { max: number; current: number };
        moveRate: number;
        build: number;
        damageBonus: string;
    };

    skills: Skill[];

    // Backstory
    // Backstory
    personalDescription: string;
    traits: string;
    ideology: string;
    injuries: string;
    significantPeople: string;
    phobias: string; // Fobias & Manias
    meaningfulLocations: string;
    arcaneTomes: string; // Tomos Arcanos, Feitiços & Artefatos
    treasuredPossessions: string;
    encounters: string; // Encontros com Entidades Estranhas

    // Inventory & Cash
    gear: string[]; // Equipamento & Pertences (Texto livre ou lista de strings)
    // Dinheiro & Recursos
    spendingLevel: number;
    cash: number;
    assets: string; // Patrimônio

    // Weapons
    weapons: Weapon[];

    avatar?: any; // Avatar Paperdoll config
}
