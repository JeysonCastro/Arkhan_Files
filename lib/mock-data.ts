import { Investigator } from "@/lib/types";

export const MOCK_INVESTIGATORS: Investigator[] = [
    {
        id: "1",
        name: "Arthur Blackwood",
        occupation: "Private Investigator",
        age: 35,
        sex: "Male",
        residence: "Arkham, MA",
        birthplace: "Boston, MA",
        portrait: "",
        attributes: {
            STR: { base: 60, current: 60 },
            CON: { base: 70, current: 70 },
            SIZ: { base: 65, current: 65 },
            DEX: { base: 70, current: 70 },
            APP: { base: 40, current: 40 },
            INT: { base: 80, current: 80 },
            POW: { base: 50, current: 50 },
            EDU: { base: 75, current: 75 },
            LUCK: { base: 55, current: 55 }
        },
        derivedStats: {
            hp: { max: 13, current: 13 },
            sanity: { max: 99, current: 50, start: 50 },
            magicPoints: { max: 10, current: 10 },
            moveRate: 8,
            build: 1,
            damageBonus: "+1d4"
        },
        skills: [
            { name: "Firearms (Handgun)", baseChance: 20, pointsAdded: 40, checked: false },
            { name: "Spot Hidden", baseChance: 25, pointsAdded: 35, checked: true },
            { name: "Psychology", baseChance: 10, pointsAdded: 40, checked: false },
            { name: "Track", baseChance: 10, pointsAdded: 20, checked: false },
        ],
        personalDescription: "A weary detective with a 5 o'clock shadow and a stained trench coat.",
        traits: "Cynical, observant, suspicious.",
        ideology: "The truth is out there, but it usually hurts.",
        injuries: "Old bullet wound in left shoulder.",
        significantPeople: "Sarah (missing sister).",
        phobias: "Claustrophobia.",
        meaningfulLocations: "The old Blackwood manor.",
        arcaneTomes: "",
        treasuredPossessions: "His father's revolver.",
        encounters: "Saw a shadow move against the wind once.",
        gear: ["Magnifying glass", "Notebook", "Flashlight", ".38 Revolver"],
        spendingLevel: 10,
        cash: 45,
        assets: "Small office on French Hill, old Ford Model T.",
        weapons: [
            {
                id: "w1",
                name: ".38 Snub-Nose",
                skillName: "Firearms (Handgun)",
                damage: "1d8",
                range: "15m",
                attacks: 1,
                ammo: "6",
                malfunction: 100
            }
        ]
    },
    {
        id: "2",
        name: "Dr. Eleanor Vance",
        occupation: "Professor",
        age: 42,
        sex: "Female",
        residence: "Miskatonic University Dorms",
        birthplace: "New York, NY",
        portrait: "",
        attributes: {
            STR: { base: 40, current: 40 },
            CON: { base: 50, current: 50 },
            SIZ: { base: 50, current: 50 },
            DEX: { base: 60, current: 60 },
            APP: { base: 60, current: 60 },
            INT: { base: 90, current: 90 },
            POW: { base: 75, current: 75 },
            EDU: { base: 95, current: 95 },
            LUCK: { base: 40, current: 40 }
        },
        derivedStats: {
            hp: { max: 10, current: 10 },
            sanity: { max: 99, current: 25, start: 75 },
            magicPoints: { max: 15, current: 15 },
            moveRate: 7,
            build: 0,
            damageBonus: "0"
        },
        skills: [
            { name: "Library Use", baseChance: 20, pointsAdded: 60, checked: true },
            { name: "Occult", baseChance: 5, pointsAdded: 55, checked: false },
            { name: "History", baseChance: 5, pointsAdded: 65, checked: true },
            { name: "Language (Latin)", baseChance: 0, pointsAdded: 50, checked: false },
        ],
        personalDescription: "Stern academic with spectacles and hair in a tight bun.",
        traits: "Skeptical, meticulous, arrogant.",
        ideology: "Knowledge is the only defense against chaos.",
        injuries: "",
        significantPeople: "Professor Armitage (Mentor).",
        phobias: "Pyrophobia (Fear of fire).",
        meaningfulLocations: "Miskatonic Library Rare Books Section.",
        arcaneTomes: "Fragments of the Ponape Scripture.",
        treasuredPossessions: "Gold fountain pen.",
        encounters: "Witnessed a ritual in the woods.",
        gear: ["Books", "Reading glasses", "Chalk", "Candles"],
        spendingLevel: 20,
        cash: 120,
        assets: "Tenure at Miskatonic, family inheritance.",
        weapons: []
    }
];
