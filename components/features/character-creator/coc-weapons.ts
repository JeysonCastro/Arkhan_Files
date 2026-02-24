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
    imageUrl?: string;
};

export const StandardWeapons: Weapon[] = [
    // --- MELEE WEAPONS ---
    {
        id: "unarmed",
        name: "Desarmado (Soco/Chute)",
        skill: "Briga",
        damage: "1d3 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100,
        description: "Ataque corpo-a-corpo básico sem armas.",
        imageUrl: "/assets/weapons/wpn_brass_knuckles_1771891066203.png"
    },
    {
        id: "knife_small",
        name: "Faca Pequena / Canivete",
        skill: "Briga",
        damage: "1d4 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100,
        description: "Fácil de esconder, comum em becos de Arkham.",
        imageUrl: "/assets/weapons/wpn_knife_small_1771891082367.png"
    },
    {
        id: "machete",
        name: "Facão / Machete",
        skill: "Briga",
        damage: "1d8 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100,
        description: "Arma brutal usada para desbravar matas ou cultistas.",
        imageUrl: "/assets/weapons/wpn_machete_1771891098882.png"
    },
    {
        id: "baseball_bat",
        name: "Taco de Beisebol / Porrete",
        skill: "Briga",
        damage: "1d6 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100,
        description: "Objeto contundente de fácil acesso.",
        imageUrl: "/assets/weapons/wpn_baseball_bat_1771891128122.png"
    },
    {
        id: "sword",
        name: "Cavalry Saber / Espada",
        skill: "Briga",
        damage: "1d8 + 1 + BD",
        baseRange: "Toque",
        usesPerRound: 1,
        bulletsInGun: "-",
        malfunction: 100,
        description: "Antiga herança de família ou roubada de um museu.",
        imageUrl: "/assets/weapons/wpn_sword_1771891146214.png"
    },

    // --- FIREARMS (HANDGUNS) ---
    {
        id: "pistol_22",
        name: "Pistola Automática .22",
        skill: "Armas de Fogo (Pistola)",
        damage: "1d6",
        baseRange: "10m",
        usesPerRound: "1 (3)",
        bulletsInGun: 6,
        malfunction: 100,
        description: "Pistola leve de bolso.",
        imageUrl: "/assets/weapons/wpn_pistol_22_1771891163546.png"
    },
    {
        id: "revolver_38",
        name: "Revólver .38 (Curto)",
        skill: "Armas de Fogo (Pistola)",
        damage: "1d10",
        baseRange: "15m",
        usesPerRound: "1 (3)",
        bulletsInGun: 6,
        malfunction: 100,
        description: "Arma padrão de detetives e oficiais de polícia.",
        imageUrl: "/assets/weapons/wpn_revolver_38.png"
    },
    {
        id: "m1911",
        name: "Pistola Automática M1911 (.45)",
        skill: "Armas de Fogo (Pistola)",
        damage: "1d10 + 2",
        baseRange: "15m",
        usesPerRound: "1 (3)",
        bulletsInGun: 7,
        malfunction: 98,
        description: "Pistola militar de alto impacto, comum entre veteranos.",
        imageUrl: "/assets/weapons/wpn_m1911_1771891190599.png"
    },

    // --- FIREARMS (RIFLES & SHOTGUNS) ---
    {
        id: "shotgun_12g_db",
        name: "Escopeta Calibre 12 (Cano Duplo)",
        skill: "Armas de Fogo (Rifle/Escopeta)",
        damage: "4d6/2d6/1d6",
        baseRange: "10/20/50m",
        usesPerRound: "1 ou 2",
        bulletsInGun: 2,
        malfunction: 100,
        description: "Pode disparar ambos os canos de uma vez. Dano varia com a distância.",
        imageUrl: "/assets/weapons/wpn_shotgun_db_1771891205575.png"
    },
    {
        id: "shotgun_12g_pump",
        name: "Escopeta Calibre 12 (Pump)",
        skill: "Armas de Fogo (Rifle/Escopeta)",
        damage: "4d6/2d6/1d6",
        baseRange: "10/20/50m",
        usesPerRound: 1,
        bulletsInGun: 5,
        malfunction: 100,
        description: "Mortal a curta distância. Maior capacidade de munição.",
        imageUrl: "/assets/weapons/wpn_shotgun_pump_1771891225650.png"
    },
    {
        id: "rifle_3006",
        name: "Rifle de Caça .30-06 (Ferrolho)",
        skill: "Armas de Fogo (Rifle/Escopeta)",
        damage: "2d6 + 4",
        baseRange: "110m",
        usesPerRound: 1,
        bulletsInGun: 5,
        malfunction: 100,
        description: "Rifle de longo alcance e alto dano perfurante.",
        imageUrl: "/assets/weapons/wpn_rifle_3006_1771891253192.png"
    },
    {
        id: "elephant_gun",
        name: "Elephant Gun (Arma de Elefante)",
        skill: "Armas de Fogo (Rifle/Escopeta)",
        damage: "3d6 + 4",
        baseRange: "100m",
        usesPerRound: 1,
        bulletsInGun: 2,
        malfunction: 100,
        description: "Uma monstruosidade cara disparando cartuchos colossais.",
        imageUrl: "/assets/weapons/wpn_elephant_gun_1771891270709.png"
    },

    // --- HEAVY / SMG ---
    {
        id: "tommy_gun",
        name: "Submetralhadora Thompson (.45)",
        skill: "Armas de Fogo (Submetralhadora)",
        damage: "1d10 + 2",
        baseRange: "20m",
        usesPerRound: "Automático / 1",
        bulletsInGun: 50,
        malfunction: 96,
        description: "O icônico 'Chicago Typewriter', cospe balas a uma taxa assustadora.",
        imageUrl: "/assets/weapons/wpn_tommy_gun_1771891287739.png"
    }
];
