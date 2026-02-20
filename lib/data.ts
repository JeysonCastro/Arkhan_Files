export interface BaseSkill {
    name: string;
    baseChance: number;
}

export const BASE_SKILLS: BaseSkill[] = [
    { name: "Accounting", baseChance: 5 },
    { name: "Anthropology", baseChance: 1 },
    { name: "Appraise", baseChance: 5 },
    { name: "Archaeology", baseChance: 1 },
    { name: "Art/Craft", baseChance: 5 },
    { name: "Charm", baseChance: 15 },
    { name: "Climb", baseChance: 20 },
    { name: "Credit Rating", baseChance: 0 },
    { name: "Cthulhu Mythos", baseChance: 0 },
    { name: "Disguise", baseChance: 5 },
    { name: "Dodge", baseChance: 0 }, // Special: Half DEX
    { name: "Drive Auto", baseChance: 20 },
    { name: "Electrical Repair", baseChance: 10 },
    { name: "Fast Talk", baseChance: 5 },
    { name: "Fighting (Brawl)", baseChance: 25 },
    { name: "Firearms (Handgun)", baseChance: 20 },
    { name: "Firearms (Rifle/Shotgun)", baseChance: 25 },
    { name: "First Aid", baseChance: 30 },
    { name: "History", baseChance: 5 },
    { name: "Intimidate", baseChance: 15 },
    { name: "Jump", baseChance: 20 },
    { name: "Language (Own)", baseChance: 0 }, // Special: EDU
    { name: "Law", baseChance: 5 },
    { name: "Library Use", baseChance: 20 },
    { name: "Listen", baseChance: 20 },
    { name: "Locksmith", baseChance: 1 },
    { name: "Mechanical Repair", baseChance: 10 },
    { name: "Medicine", baseChance: 1 },
    { name: "Natural World", baseChance: 10 },
    { name: "Navigate", baseChance: 10 },
    { name: "Occult", baseChance: 5 },
    { name: "Persuade", baseChance: 10 },
    { name: "Pilot", baseChance: 1 },
    { name: "Psychoanalysis", baseChance: 1 },
    { name: "Psychology", baseChance: 10 },
    { name: "Ride", baseChance: 5 },
    { name: "Science", baseChance: 1 },
    { name: "Sleight of Hand", baseChance: 10 },
    { name: "Spot Hidden", baseChance: 25 },
    { name: "Stealth", baseChance: 20 },
    { name: "Survival", baseChance: 10 },
    { name: "Swim", baseChance: 20 },
    { name: "Throw", baseChance: 25 },
    { name: "Track", baseChance: 10 },
];

export interface Occupation {
    name: string;
    skillPointsFormula: (edu: number, str: number, dex: number, pow: number, app: number, int: number, siz: number, con: number) => number;
    creditRating: { min: number; max: number };
    skills: string[]; // List of skill names
}

export const OCCUPATIONS: Occupation[] = [
    {
        name: "Private Investigator",
        skillPointsFormula: (edu, str, dex) => edu * 2 + (str > dex ? str : dex) * 2,
        creditRating: { min: 9, max: 30 },
        skills: [
            "Art/Craft (Photography)",
            "Disguise",
            "Law",
            "Library Use",
            "Psychology",
            "Spot Hidden",
            "Charm", // Or Fast Talk, Intimidate, Persuade - simplified for MVP
            "Firearms (Handgun)" // Or Fighting (Brawl)
        ]
    },
    {
        name: "Antiquarian",
        skillPointsFormula: (edu) => edu * 4,
        creditRating: { min: 30, max: 70 },
        skills: [
            "Appraise",
            "Art/Craft",
            "History",
            "Library Use",
            "Language (Other)",
            "Spot Hidden",
            "Charm",
            "Navigate"
        ]
    },
    {
        name: "Professor",
        skillPointsFormula: (edu) => edu * 4,
        creditRating: { min: 20, max: 70 },
        skills: [
            "Library Use",
            "Language (Other)",
            "Psychology",
            "Art/Craft", // placeholder for "Own Field"
            "Science",   // placeholder for "Own Field"
            "History",   // placeholder for "Own Field"
            "Charm",
            "Persuade"
        ]
    },
    {
        name: "Doctor of Medicine",
        skillPointsFormula: (edu) => edu * 4,
        creditRating: { min: 30, max: 80 },
        skills: [
            "First Aid",
            "Medicine",
            "Psychology",
            "Science (Biology)",
            "Science (Pharmacy)",
            "Language (Latin)",
            "Charm", // or Persuade etc
            "Library Use"
        ]
    }
];
