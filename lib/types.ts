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

export type EquipmentCategory = 'Arma' | 'Arma de Fogo' | 'Arma Branca' | 'Tomo Arcano' | 'Tomo do Mito' | 'Artefato' | 'Utilidade' | 'Ferramenta' | 'Equipamento Méd.' | 'Chave/Documento' | 'Chave' | 'Evidência' | 'Material Místico';

export interface EquipmentItem {
    id: string;
    name: string;
    description: string;
    type: EquipmentCategory;
    imageUrl?: string;
    quantity?: number;
    stats?: string; // Optional raw string for mechanically impactful stats (e.g., "+1d4 de dano mágico")
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
    gear: string[]; // Equipamento & Pertences textuais legados
    inventory?: EquipmentItem[]; // Nova mochila em cartas de itens

    // Dinheiro & Recursos
    spendingLevel: number;
    cash: number;
    assets: string; // Patrimônio

    // Weapons
    weapons: Weapon[];

    // VTT Status Effects
    isMajorWound?: boolean;
    madnessState?: 'normal' | 'bout_of_madness' | 'underlying_insanity';

    avatar?: any; // Avatar Paperdoll config
}

export interface PinboardItem {
    id: string;
    session_id: string;
    title: string;
    content: string | null;
    type: 'NOTE' | 'IMAGE' | 'DOCUMENT';
    image_url: string | null;
    position_x: number;
    position_y: number;
    z_index: number;
    color: string;
    rotation: number;
    connections?: any;
    created_at?: string;
    updated_at?: string;
}
