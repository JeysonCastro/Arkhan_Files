export type Weapon = {
    id: string;
    name: string;
    skill: string;
    damage: string;
    baseRange: string;
    usesPerRound: string | number;
    bulletsInGun: number | string;
    malfunction: number;
    description?: string;
};

export const StandardWeapons: Weapon[] = [
    {
        id: "unarmed",
        name: "Desarmado (Soco/Chute)",
        skill: "Fighting (Brawl)",
        damage: "1d3 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100
    },
    {
        id: "knife",
        name: "Faca de Combate",
        skill: "Fighting (Brawl)",
        damage: "1d4 + 2 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100
    },
    {
        id: "revolver_38",
        name: "Revólver .38 (Curto)",
        skill: "Firearms (Handgun)",
        damage: "1d10",
        baseRange: "15m",
        usesPerRound: "1 (3)",
        bulletsInGun: 6,
        malfunction: 100
    },
    {
        id: "m1911",
        name: "Pistola Automática M1911 (.45)",
        skill: "Firearms (Handgun)",
        damage: "1d10 + 2",
        baseRange: "15m",
        usesPerRound: "1 (3)",
        bulletsInGun: 7,
        malfunction: 98
    },
    {
        id: "shotgun_12g",
        name: "Escopeta Calibre 12 (Cano Duplo)",
        skill: "Firearms (Rifle/Shotgun)",
        damage: "4d6/2d6/1d6",
        baseRange: "10/20/50m",
        usesPerRound: 1,
        bulletsInGun: 2,
        malfunction: 100
    },
    {
        id: "tommy_gun",
        name: "Submetralhadora Thompson (.45)",
        skill: "Firearms (SMG)",
        damage: "1d10 + 2",
        baseRange: "20m",
        usesPerRound: "Automático / 1",
        bulletsInGun: 50,
        malfunction: 96
    }
];
