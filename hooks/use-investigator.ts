import { useState, useEffect } from "react";
import { Investigator, AttributeName, Skill } from "@/lib/types";
import { calculateCombatStats, calculateMaxHP, calculateMagicPoints, calculateStartingSanity, calculateMovementRate } from "@/lib/coc-rules";
import { BASE_SKILLS_PTBR } from "@/lib/data-ptbr";

const INITIAL_INVESTIGATOR: Investigator = {
    id: "",
    name: "",
    occupation: "",
    age: 25,
    sex: "",
    residence: "",
    birthplace: "",
    attributes: {
        STR: { base: 50, current: 50 },
        CON: { base: 50, current: 50 },
        SIZ: { base: 50, current: 50 },
        DEX: { base: 50, current: 50 },
        APP: { base: 50, current: 50 },
        INT: { base: 50, current: 50 },
        POW: { base: 50, current: 50 },
        EDU: { base: 50, current: 50 },
        LUCK: { base: 50, current: 50 },
    },
    derivedStats: {
        hp: { max: 10, current: 10 },
        sanity: { max: 99, current: 50, start: 50 },
        magicPoints: { max: 10, current: 10 },
        moveRate: 8,
        build: 0,
        damageBonus: "0"
    },
    skills: [],
    personalDescription: "",
    traits: "",
    ideology: "",
    injuries: "",
    significantPeople: "",
    phobias: "",
    meaningfulLocations: "",
    arcaneTomes: "",
    treasuredPossessions: "",
    encounters: "",
    gear: [],
    spendingLevel: 0,
    cash: 0,
    assets: "",
    weapons: []
};

export function useInvestigator(initialData?: Investigator | null) {
    const [investigator, setInvestigator] = useState<Investigator>(
        initialData || INITIAL_INVESTIGATOR
    );

    // Update state if initialData changes (useful when loading from props)
    useEffect(() => {
        if (initialData) {
            setInvestigator(initialData);
        } else if (!investigator.id) {
            // If no initial data and no ID, maybe initialize defaults? 
            // Logic from page.tsx for 'new' could go here or be handled by caller.
        }
    }, [initialData]);

    // Derived Stats Calculation
    useEffect(() => {
        if (!investigator.attributes || !investigator.attributes.STR) return;

        const { STR, CON, SIZ, DEX, POW } = investigator.attributes;

        const hp = calculateMaxHP(CON.base, SIZ.base);
        const mp = calculateMagicPoints(POW.base);
        const san = calculateStartingSanity(POW.base);
        const combat = calculateCombatStats(STR.base, SIZ.base);
        const mov = calculateMovementRate(investigator.age, STR.base, DEX.base, SIZ.base);

        setInvestigator(prev => ({
            ...prev,
            derivedStats: {
                ...prev.derivedStats,
                hp: { ...prev.derivedStats.hp, max: hp },
                magicPoints: { ...prev.derivedStats.magicPoints, max: mp },
                // Only update start sanity if it seems uninitialized or we want to force recalc
                // For now, keeping consistent with page.tsx logic
                sanity: { ...prev.derivedStats.sanity, start: san },
                build: combat.build,
                damageBonus: combat.damageBonus,
                moveRate: mov
            }
        }));
    }, [
        investigator.attributes?.STR.base,
        investigator.attributes?.CON.base,
        investigator.attributes?.SIZ.base,
        investigator.attributes?.DEX.base,
        investigator.attributes?.POW.base,
        investigator.age
    ]);

    const handleAttributeChange = (attr: AttributeName, value: number) => {
        setInvestigator(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attr]: { ...prev.attributes[attr], base: value, current: value }
            }
        }));
    };

    const handleInfoChange = (field: keyof Investigator, value: any) => {
        setInvestigator(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillChange = (index: number, field: keyof Skill, value: number | boolean | string) => {
        setInvestigator(prev => {
            const newSkills = [...prev.skills];
            newSkills[index] = { ...newSkills[index], [field]: value };
            return { ...prev, skills: newSkills };
        });
    };

    return {
        investigator,
        setInvestigator,
        handleAttributeChange,
        handleInfoChange,
        handleSkillChange
    };
}
